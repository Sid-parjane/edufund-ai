import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

interface ScoreBreakdown {
  factor: string;
  points: number;
  explanation: string;
}

@Injectable()
export class ScoringService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async evaluateApplication(appId: string) {
    const app = await this.prisma.loanApplication.findUnique({
      where: { id: appId },
      include: {
        personalDetails: true,
        academicDetails: true,
        financialDetails: true,
        loanDetails: true,
      },
    });

    if (!app) throw new NotFoundException('Application not found');

    const breakdowns: ScoreBreakdown[] = [];
    let totalScore = 50;

    const academic = app.academicDetails;
    const financial = app.financialDetails;
    const loan = app.loanDetails;

    if (academic) {
      const cgpa = academic.cgpaPercentage;
      if (cgpa > 85) {
        breakdowns.push({ factor: 'CGPA', points: 20, explanation: 'Outstanding academic performance (>85%)' });
        totalScore += 20;
      } else if (cgpa >= 70) {
        breakdowns.push({ factor: 'CGPA', points: 10, explanation: 'Good academic performance (70-85%)' });
        totalScore += 10;
      } else if (cgpa < 60) {
        breakdowns.push({ factor: 'CGPA', points: -10, explanation: 'Below average academic performance (<60%)' });
        totalScore -= 10;
      } else {
        breakdowns.push({ factor: 'CGPA', points: 5, explanation: 'Average academic performance (60-70%)' });
        totalScore += 5;
      }

      if (academic.universityTier === 'TIER_1') {
        breakdowns.push({ factor: 'University', points: 20, explanation: 'Tier-1 institution significantly boosts eligibility' });
        totalScore += 20;
      } else if (academic.universityTier === 'TIER_2') {
        breakdowns.push({ factor: 'University', points: 10, explanation: 'Tier-2 institution moderately improves eligibility' });
        totalScore += 10;
      } else {
        breakdowns.push({ factor: 'University', points: 0, explanation: 'Standard university - no tier boost applied' });
      }

      const course = academic.courseName.toLowerCase();
      const isStem = this.isStemCourse(course);
      const isMba = course.includes('mba') || course.includes('management');
      if (isStem || isMba) {
        breakdowns.push({ factor: 'Course', points: 10, explanation: `${isMba ? 'MBA' : 'STEM'} course improves employment prospects` });
        totalScore += 10;
      } else if (course.includes('art') || course.includes('humanities')) {
        breakdowns.push({ factor: 'Course', points: 5, explanation: 'Arts/Humanities course - moderate scoring' });
        totalScore += 5;
      }

      if (academic.admissionStatus === 'Confirmed') {
        breakdowns.push({ factor: 'Admission', points: 5, explanation: 'Confirmed admission reduces risk' });
        totalScore += 5;
      } else if (academic.admissionStatus === 'Applied') {
        breakdowns.push({ factor: 'Admission', points: -5, explanation: 'Admission not yet confirmed - higher uncertainty' });
        totalScore -= 5;
      }
    }

    if (financial) {
      const income = financial.familyAnnualIncome;
      if (income >= 1200000) {
        breakdowns.push({ factor: 'Family Income', points: 20, explanation: 'Strong family income (>₹12L) improves repayment capacity' });
        totalScore += 20;
      } else if (income >= 600000) {
        breakdowns.push({ factor: 'Family Income', points: 10, explanation: 'Moderate family income (₹6L-₹12L)' });
        totalScore += 10;
      } else if (income < 300000) {
        breakdowns.push({ factor: 'Family Income', points: -10, explanation: 'Low family income (<₹3L) may affect repayment' });
        totalScore -= 10;
      }

      if (financial.coApplicantAvailable) {
        breakdowns.push({ factor: 'Co-applicant', points: 10, explanation: 'Co-applicant strengthens loan application' });
        totalScore += 10;
      } else {
        breakdowns.push({ factor: 'Co-applicant', points: 0, explanation: 'No co-applicant - consider adding one to improve chances' });
      }

      if (financial.existingLoans >= 3) {
        breakdowns.push({ factor: 'Existing Loans', points: -15, explanation: 'Multiple active loans significantly impact credit profile' });
        totalScore -= 15;
      } else if (financial.existingLoans >= 1) {
        breakdowns.push({ factor: 'Existing Loans', points: -5, explanation: 'Existing loan(s) slightly reduce eligibility' });
        totalScore -= 5;
      } else {
        breakdowns.push({ factor: 'Existing Loans', points: 5, explanation: 'Clean loan record - no existing debt' });
        totalScore += 5;
      }
    }

    if (loan && financial) {
      const scholarshipPct = loan.tuitionFees > 0
        ? (loan.scholarshipAmount / loan.tuitionFees) * 100
        : 0;
      if (scholarshipPct >= 30) {
        breakdowns.push({ factor: 'Scholarship', points: 10, explanation: `${scholarshipPct.toFixed(0)}% scholarship significantly reduces loan burden` });
        totalScore += 10;
      } else if (scholarshipPct > 0) {
        breakdowns.push({ factor: 'Scholarship', points: 5, explanation: `${scholarshipPct.toFixed(0)}% scholarship reduces loan burden` });
        totalScore += 5;
      }

      const annualRepayment = loan.requiredAmount * 0.1;
      const incomeForRepayment = financial.familyAnnualIncome + (financial.coApplicantIncome || 0);
      const dti = incomeForRepayment > 0 ? (annualRepayment / incomeForRepayment) * 100 : 100;
      if (dti > 60) {
        breakdowns.push({ factor: 'Loan-to-Income', points: -10, explanation: 'High debt-to-income ratio raises repayment risk' });
        totalScore -= 10;
      } else if (dti <= 30) {
        breakdowns.push({ factor: 'Loan-to-Income', points: 5, explanation: 'Healthy debt-to-income ratio' });
        totalScore += 5;
      }
    }

    totalScore = Math.max(0, Math.min(100, totalScore));
    const category = totalScore >= 75 ? 'HIGH_QUALITY' : totalScore >= 45 ? 'MEDIUM_QUALITY' : 'LOW_QUALITY';
    const riskLevel = totalScore >= 75 ? 'LOW' : totalScore >= 60 ? 'MEDIUM' : totalScore >= 45 ? 'HIGH' : 'VERY_HIGH';
    const isEligible = totalScore >= 45;

    // Generate AI risk summary using Groq
    let aiRiskSummary = '';
    if (academic && financial && loan) {
      const weakFactors = breakdowns.filter(b => b.points < 0).map(b => b.factor);
      aiRiskSummary = await this.aiService.generateRiskSummary({
        applicantName: app.personalDetails?.fullName || 'Applicant',
        university: academic.universityName,
        universityTier: academic.universityTier || 'TIER_3',
        course: academic.courseName,
        cgpa: academic.cgpaPercentage,
        familyIncome: financial.familyAnnualIncome,
        existingLoans: financial.existingLoans,
        coApplicant: financial.coApplicantAvailable,
        loanAmount: loan.requiredAmount,
        scholarshipAmount: loan.scholarshipAmount,
        leadScore: totalScore,
        leadCategory: category,
        scoringFactors: breakdowns,
      });
    }

    // Save scoring logs
    await this.prisma.scoringLog.deleteMany({ where: { applicationId: appId } });
    await this.prisma.scoringLog.createMany({
      data: breakdowns.map((b) => ({ ...b, applicationId: appId })),
    });

    // Update application with AI notes
    const updated = await this.prisma.loanApplication.update({
      where: { id: appId },
      data: {
        leadScore: totalScore,
        leadCategory: category as any,
        riskLevel: riskLevel as any,
        isEligible,
        status: 'UNDER_REVIEW',
        loanAmount: app.loanDetails?.requiredAmount,
        notes: aiRiskSummary || undefined,
      },
      include: {
        personalDetails: true,
        academicDetails: true,
        financialDetails: true,
        loanDetails: true,
        scoringLogs: true,
      },
    });

    return { ...updated, aiRiskSummary };
  }

  private isStemCourse(course: string): boolean {
    const stemKeywords = [
      'engineering', 'computer', 'science', 'technology', 'mathematics',
      'physics', 'chemistry', 'biology', 'data', 'ai', 'machine learning',
      'software', 'electrical', 'mechanical', 'civil', 'chemical',
    ];
    return stemKeywords.some((k) => course.includes(k));
  }
}
