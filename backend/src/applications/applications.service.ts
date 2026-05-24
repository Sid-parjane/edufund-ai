import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import {
  PersonalDetailsDto,
  AcademicDetailsDto,
  FinancialDetailsDto,
  LoanDetailsDto,
  UpdateApplicationStatusDto,
} from './applications.dto';
import { DeadLeadDetector } from '../scoring/dead-lead.detector';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  async createApplication(userId: string) {
    // Check if user has an existing draft
    const existingDraft = await this.prisma.loanApplication.findFirst({
      where: { userId, status: 'DRAFT' },
    });

    if (existingDraft) return existingDraft;

    return this.prisma.loanApplication.create({
      data: { userId },
    });
  }

  async getApplications(userId: string) {
    return this.prisma.loanApplication.findMany({
      where: { userId },
      include: {
        personalDetails: true,
        academicDetails: true,
        financialDetails: true,
        loanDetails: true,
        scoringLogs: true,
        deadLeadLogs: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getApplication(id: string, userId: string) {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        personalDetails: true,
        academicDetails: true,
        financialDetails: true,
        loanDetails: true,
        scoringLogs: true,
        deadLeadLogs: true,
      },
    });

    if (!app) throw new NotFoundException('Application not found');
    if (app.userId !== userId) throw new ForbiddenException();

    return app;
  }

  async savePersonalDetails(appId: string, userId: string, dto: PersonalDetailsDto) {
    const app = await this.validateOwnership(appId, userId);
    if (!['DRAFT'].includes(app.status)) throw new BadRequestException('Cannot edit submitted application');

    // Check age
    const dob = new Date(dto.dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365));
    if (age < 18) throw new BadRequestException('Applicant must be at least 18 years old');

    const data = {
      fullName: dto.fullName,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      city: dto.city,
      state: dto.state,
    };

    const existing = await this.prisma.personalDetails.findUnique({ where: { applicationId: appId } });

    if (existing) {
      return this.prisma.personalDetails.update({ where: { applicationId: appId }, data });
    }
    return this.prisma.personalDetails.create({ data: { ...data, applicationId: appId } });
  }

  async saveAcademicDetails(appId: string, userId: string, dto: AcademicDetailsDto) {
    const app = await this.validateOwnership(appId, userId);
    if (!['DRAFT'].includes(app.status)) throw new BadRequestException('Cannot edit submitted application');

    // Determine university tier
    const tier = this.determineUniversityTier(dto.universityName);

    const data = {
      educationLevel: dto.educationLevel,
      universityName: dto.universityName,
      courseName: dto.courseName,
      countryOfStudy: dto.countryOfStudy,
      admissionStatus: dto.admissionStatus,
      expectedGradYear: dto.expectedGradYear,
      cgpaPercentage: dto.cgpaPercentage,
      universityTier: tier,
    };

    const existing = await this.prisma.academicDetails.findUnique({ where: { applicationId: appId } });
    if (existing) {
      return this.prisma.academicDetails.update({ where: { applicationId: appId }, data });
    }
    return this.prisma.academicDetails.create({ data: { ...data, applicationId: appId } });
  }

  async saveFinancialDetails(appId: string, userId: string, dto: FinancialDetailsDto) {
    const app = await this.validateOwnership(appId, userId);
    if (!['DRAFT'].includes(app.status)) throw new BadRequestException('Cannot edit submitted application');

    const data = {
      familyAnnualIncome: dto.familyAnnualIncome,
      existingLoans: dto.existingLoans,
      existingLoanAmount: dto.existingLoanAmount || 0,
      coApplicantAvailable: dto.coApplicantAvailable,
      coApplicantIncome: dto.coApplicantIncome || 0,
      panNumber: dto.panNumber.toUpperCase(),
      aadhaarNumber: dto.aadhaarNumber,
    };

    const existing = await this.prisma.financialDetails.findUnique({ where: { applicationId: appId } });
    if (existing) {
      return this.prisma.financialDetails.update({ where: { applicationId: appId }, data });
    }
    return this.prisma.financialDetails.create({ data: { ...data, applicationId: appId } });
  }

  async saveLoanDetails(appId: string, userId: string, dto: LoanDetailsDto) {
    const app = await this.validateOwnership(appId, userId);
    if (!['DRAFT'].includes(app.status)) throw new BadRequestException('Cannot edit submitted application');

    const data = {
      requiredAmount: dto.requiredAmount,
      tuitionFees: dto.tuitionFees,
      livingExpenses: dto.livingExpenses,
      scholarshipAmount: dto.scholarshipAmount,
      loanPurpose: dto.loanPurpose,
    };

    const existing = await this.prisma.loanDetails.findUnique({ where: { applicationId: appId } });
    if (existing) {
      return this.prisma.loanDetails.update({ where: { applicationId: appId }, data });
    }
    return this.prisma.loanDetails.create({ data: { ...data, applicationId: appId } });
  }

  async submitApplication(appId: string, userId: string) {
    const app = await this.getApplication(appId, userId);

    if (app.status !== 'DRAFT') throw new BadRequestException('Application already submitted');

    // Validate all sections complete
    if (!app.personalDetails) throw new BadRequestException('Personal details incomplete');
    if (!app.academicDetails) throw new BadRequestException('Academic details incomplete');
    if (!app.financialDetails) throw new BadRequestException('Financial details incomplete');
    if (!app.loanDetails) throw new BadRequestException('Loan details incomplete');

    // Run dead lead detection
    const deadLeadResult = await DeadLeadDetector.detect(app);

    if (deadLeadResult.isDead) {
      return this.prisma.loanApplication.update({
        where: { id: appId },
        data: {
          status: 'DEAD_LEAD',
          deadLeadReason: deadLeadResult.reasons.join('; '),
          submittedAt: new Date(),
          deadLeadLogs: {
            create: deadLeadResult.reasons.map((reason) => ({
              reason,
              details: deadLeadResult.details,
            })),
          },
        },
        include: { deadLeadLogs: true },
      });
    }

    // Update to submitted
    await this.prisma.loanApplication.update({
      where: { id: appId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });

    // Run scoring
    const scored = await this.scoringService.evaluateApplication(appId);
    return scored;
  }

  async updateStatus(appId: string, dto: UpdateApplicationStatusDto) {
    const app = await this.prisma.loanApplication.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException('Application not found');

    return this.prisma.loanApplication.update({
      where: { id: appId },
      data: {
        status: dto.status as any,
        notes: dto.notes,
        reviewedAt: new Date(),
      },
    });
  }

  private async validateOwnership(appId: string, userId: string) {
    const app = await this.prisma.loanApplication.findUnique({ where: { id: appId } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.userId !== userId) throw new ForbiddenException();
    return app;
  }

  private determineUniversityTier(universityName: string): string {
    const tier1Keywords = [
      'iit', 'iim', 'aiims', 'nit', 'bits', 'mit', 'stanford', 'harvard',
      'oxford', 'cambridge', 'nus', 'ntu', 'iisc', 'delhi university',
      'bombay', 'calcutta', 'madras', 'columbia', 'yale', 'princeton',
      'ucla', 'berkeley', 'imperial', 'lse', 'toronto', 'melbourne',
    ];
    const tier2Keywords = [
      'vit', 'srm', 'manipal', 'symbiosis', 'christ', 'amity', 'lovely',
      'thapar', 'bu', 'mu', 'pu', 'anna', 'pune', 'osmania',
    ];

    const lowerName = universityName.toLowerCase();
    if (tier1Keywords.some((k) => lowerName.includes(k))) return 'TIER_1';
    if (tier2Keywords.some((k) => lowerName.includes(k))) return 'TIER_2';
    return 'TIER_3';
  }
}
