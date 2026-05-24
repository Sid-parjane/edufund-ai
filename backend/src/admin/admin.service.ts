import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getApplications(filters: {
    status?: string;
    leadCategory?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, leadCategory, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (leadCategory) where.leadCategory = leadCategory;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          personalDetails: true,
          academicDetails: true,
          loanDetails: true,
          scoringLogs: true,
          deadLeadLogs: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    return { applications, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAnalytics() {
    const [
      totalApplications,
      highQuality,
      mediumQuality,
      lowQuality,
      deadLeads,
      approved,
      rejected,
      underReview,
      submitted,
      draft,
      totalLoanValue,
    ] = await Promise.all([
      this.prisma.loanApplication.count(),
      this.prisma.loanApplication.count({ where: { leadCategory: 'HIGH_QUALITY' } }),
      this.prisma.loanApplication.count({ where: { leadCategory: 'MEDIUM_QUALITY' } }),
      this.prisma.loanApplication.count({ where: { leadCategory: 'LOW_QUALITY' } }),
      this.prisma.loanApplication.count({ where: { status: 'DEAD_LEAD' } }),
      this.prisma.loanApplication.count({ where: { status: 'APPROVED' } }),
      this.prisma.loanApplication.count({ where: { status: 'REJECTED' } }),
      this.prisma.loanApplication.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.loanApplication.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.loanApplication.count({ where: { status: 'DRAFT' } }),
      this.prisma.loanApplication.aggregate({
        _sum: { loanAmount: true },
        where: { status: { in: ['APPROVED', 'UNDER_REVIEW'] } },
      }),
    ]);

    const approvalRate = totalApplications > 0
      ? Math.round((approved / totalApplications) * 100)
      : 0;

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await this.prisma.loanApplication.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: true,
    });

    // Average score
    const avgScore = await this.prisma.loanApplication.aggregate({
      _avg: { leadScore: true },
      where: { leadScore: { not: null } },
    });

    return {
      overview: {
        totalApplications,
        highQuality,
        mediumQuality,
        lowQuality,
        deadLeads,
        approved,
        rejected,
        underReview,
        submitted,
        draft,
        approvalRate,
        totalLoanValue: totalLoanValue._sum.loanAmount || 0,
        averageScore: Math.round(avgScore._avg.leadScore || 0),
      },
      leadDistribution: [
        { name: 'High Quality', value: highQuality, color: '#22c55e' },
        { name: 'Medium Quality', value: mediumQuality, color: '#f59e0b' },
        { name: 'Low Quality', value: lowQuality, color: '#ef4444' },
        { name: 'Dead Leads', value: deadLeads, color: '#6b7280' },
      ],
      statusDistribution: [
        { name: 'Draft', value: draft },
        { name: 'Submitted', value: submitted },
        { name: 'Under Review', value: underReview },
        { name: 'Approved', value: approved },
        { name: 'Rejected', value: rejected },
        { name: 'Dead Lead', value: deadLeads },
      ],
    };
  }

  async getUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
