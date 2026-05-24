"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("./ai.service");
let ScoringService = class ScoringService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    async evaluateApplication(appId) {
        const app = await this.prisma.loanApplication.findUnique({
            where: { id: appId },
            include: {
                personalDetails: true,
                academicDetails: true,
                financialDetails: true,
                loanDetails: true,
            },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        const breakdowns = [];
        let totalScore = 50;
        const academic = app.academicDetails;
        const financial = app.financialDetails;
        const loan = app.loanDetails;
        if (academic) {
            const cgpa = academic.cgpaPercentage;
            if (cgpa > 85) {
                breakdowns.push({ factor: 'CGPA', points: 20, explanation: 'Outstanding academic performance (>85%)' });
                totalScore += 20;
            }
            else if (cgpa >= 70) {
                breakdowns.push({ factor: 'CGPA', points: 10, explanation: 'Good academic performance (70-85%)' });
                totalScore += 10;
            }
            else if (cgpa < 60) {
                breakdowns.push({ factor: 'CGPA', points: -10, explanation: 'Below average academic performance (<60%)' });
                totalScore -= 10;
            }
            else {
                breakdowns.push({ factor: 'CGPA', points: 5, explanation: 'Average academic performance (60-70%)' });
                totalScore += 5;
            }
            if (academic.universityTier === 'TIER_1') {
                breakdowns.push({ factor: 'University', points: 20, explanation: 'Tier-1 institution significantly boosts eligibility' });
                totalScore += 20;
            }
            else if (academic.universityTier === 'TIER_2') {
                breakdowns.push({ factor: 'University', points: 10, explanation: 'Tier-2 institution moderately improves eligibility' });
                totalScore += 10;
            }
            else {
                breakdowns.push({ factor: 'University', points: 0, explanation: 'Standard university - no tier boost applied' });
            }
            const course = academic.courseName.toLowerCase();
            const isStem = this.isStemCourse(course);
            const isMba = course.includes('mba') || course.includes('management');
            if (isStem || isMba) {
                breakdowns.push({ factor: 'Course', points: 10, explanation: `${isMba ? 'MBA' : 'STEM'} course improves employment prospects` });
                totalScore += 10;
            }
            else if (course.includes('art') || course.includes('humanities')) {
                breakdowns.push({ factor: 'Course', points: 5, explanation: 'Arts/Humanities course - moderate scoring' });
                totalScore += 5;
            }
            if (academic.admissionStatus === 'Confirmed') {
                breakdowns.push({ factor: 'Admission', points: 5, explanation: 'Confirmed admission reduces risk' });
                totalScore += 5;
            }
            else if (academic.admissionStatus === 'Applied') {
                breakdowns.push({ factor: 'Admission', points: -5, explanation: 'Admission not yet confirmed - higher uncertainty' });
                totalScore -= 5;
            }
        }
        if (financial) {
            const income = financial.familyAnnualIncome;
            if (income >= 1200000) {
                breakdowns.push({ factor: 'Family Income', points: 20, explanation: 'Strong family income (>₹12L) improves repayment capacity' });
                totalScore += 20;
            }
            else if (income >= 600000) {
                breakdowns.push({ factor: 'Family Income', points: 10, explanation: 'Moderate family income (₹6L-₹12L)' });
                totalScore += 10;
            }
            else if (income < 300000) {
                breakdowns.push({ factor: 'Family Income', points: -10, explanation: 'Low family income (<₹3L) may affect repayment' });
                totalScore -= 10;
            }
            if (financial.coApplicantAvailable) {
                breakdowns.push({ factor: 'Co-applicant', points: 10, explanation: 'Co-applicant strengthens loan application' });
                totalScore += 10;
            }
            else {
                breakdowns.push({ factor: 'Co-applicant', points: 0, explanation: 'No co-applicant - consider adding one to improve chances' });
            }
            if (financial.existingLoans >= 3) {
                breakdowns.push({ factor: 'Existing Loans', points: -15, explanation: 'Multiple active loans significantly impact credit profile' });
                totalScore -= 15;
            }
            else if (financial.existingLoans >= 1) {
                breakdowns.push({ factor: 'Existing Loans', points: -5, explanation: 'Existing loan(s) slightly reduce eligibility' });
                totalScore -= 5;
            }
            else {
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
            }
            else if (scholarshipPct > 0) {
                breakdowns.push({ factor: 'Scholarship', points: 5, explanation: `${scholarshipPct.toFixed(0)}% scholarship reduces loan burden` });
                totalScore += 5;
            }
            const annualRepayment = loan.requiredAmount * 0.1;
            const incomeForRepayment = financial.familyAnnualIncome + (financial.coApplicantIncome || 0);
            const dti = incomeForRepayment > 0 ? (annualRepayment / incomeForRepayment) * 100 : 100;
            if (dti > 60) {
                breakdowns.push({ factor: 'Loan-to-Income', points: -10, explanation: 'High debt-to-income ratio raises repayment risk' });
                totalScore -= 10;
            }
            else if (dti <= 30) {
                breakdowns.push({ factor: 'Loan-to-Income', points: 5, explanation: 'Healthy debt-to-income ratio' });
                totalScore += 5;
            }
        }
        totalScore = Math.max(0, Math.min(100, totalScore));
        const category = totalScore >= 75 ? 'HIGH_QUALITY' : totalScore >= 45 ? 'MEDIUM_QUALITY' : 'LOW_QUALITY';
        const riskLevel = totalScore >= 75 ? 'LOW' : totalScore >= 60 ? 'MEDIUM' : totalScore >= 45 ? 'HIGH' : 'VERY_HIGH';
        const isEligible = totalScore >= 45;
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
        await this.prisma.scoringLog.deleteMany({ where: { applicationId: appId } });
        await this.prisma.scoringLog.createMany({
            data: breakdowns.map((b) => ({ ...b, applicationId: appId })),
        });
        const updated = await this.prisma.loanApplication.update({
            where: { id: appId },
            data: {
                leadScore: totalScore,
                leadCategory: category,
                riskLevel: riskLevel,
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
    isStemCourse(course) {
        const stemKeywords = [
            'engineering', 'computer', 'science', 'technology', 'mathematics',
            'physics', 'chemistry', 'biology', 'data', 'ai', 'machine learning',
            'software', 'electrical', 'mechanical', 'civil', 'chemical',
        ];
        return stemKeywords.some((k) => course.includes(k));
    }
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ScoringService);
//# sourceMappingURL=scoring.service.js.map