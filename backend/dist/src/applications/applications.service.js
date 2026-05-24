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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const scoring_service_1 = require("../scoring/scoring.service");
const dead_lead_detector_1 = require("../scoring/dead-lead.detector");
let ApplicationsService = class ApplicationsService {
    constructor(prisma, scoringService) {
        this.prisma = prisma;
        this.scoringService = scoringService;
    }
    async createApplication(userId) {
        const existingDraft = await this.prisma.loanApplication.findFirst({
            where: { userId, status: 'DRAFT' },
        });
        if (existingDraft)
            return existingDraft;
        return this.prisma.loanApplication.create({
            data: { userId },
        });
    }
    async getApplications(userId) {
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
    async getApplication(id, userId) {
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
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.userId !== userId)
            throw new common_1.ForbiddenException();
        return app;
    }
    async savePersonalDetails(appId, userId, dto) {
        const app = await this.validateOwnership(appId, userId);
        if (!['DRAFT'].includes(app.status))
            throw new common_1.BadRequestException('Cannot edit submitted application');
        const dob = new Date(dto.dateOfBirth);
        const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365));
        if (age < 18)
            throw new common_1.BadRequestException('Applicant must be at least 18 years old');
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
    async saveAcademicDetails(appId, userId, dto) {
        const app = await this.validateOwnership(appId, userId);
        if (!['DRAFT'].includes(app.status))
            throw new common_1.BadRequestException('Cannot edit submitted application');
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
    async saveFinancialDetails(appId, userId, dto) {
        const app = await this.validateOwnership(appId, userId);
        if (!['DRAFT'].includes(app.status))
            throw new common_1.BadRequestException('Cannot edit submitted application');
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
    async saveLoanDetails(appId, userId, dto) {
        const app = await this.validateOwnership(appId, userId);
        if (!['DRAFT'].includes(app.status))
            throw new common_1.BadRequestException('Cannot edit submitted application');
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
    async submitApplication(appId, userId) {
        const app = await this.getApplication(appId, userId);
        if (app.status !== 'DRAFT')
            throw new common_1.BadRequestException('Application already submitted');
        if (!app.personalDetails)
            throw new common_1.BadRequestException('Personal details incomplete');
        if (!app.academicDetails)
            throw new common_1.BadRequestException('Academic details incomplete');
        if (!app.financialDetails)
            throw new common_1.BadRequestException('Financial details incomplete');
        if (!app.loanDetails)
            throw new common_1.BadRequestException('Loan details incomplete');
        const deadLeadResult = await dead_lead_detector_1.DeadLeadDetector.detect(app);
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
        await this.prisma.loanApplication.update({
            where: { id: appId },
            data: { status: 'SUBMITTED', submittedAt: new Date() },
        });
        const scored = await this.scoringService.evaluateApplication(appId);
        return scored;
    }
    async updateStatus(appId, dto) {
        const app = await this.prisma.loanApplication.findUnique({ where: { id: appId } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        return this.prisma.loanApplication.update({
            where: { id: appId },
            data: {
                status: dto.status,
                notes: dto.notes,
                reviewedAt: new Date(),
            },
        });
    }
    async validateOwnership(appId, userId) {
        const app = await this.prisma.loanApplication.findUnique({ where: { id: appId } });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.userId !== userId)
            throw new common_1.ForbiddenException();
        return app;
    }
    determineUniversityTier(universityName) {
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
        if (tier1Keywords.some((k) => lowerName.includes(k)))
            return 'TIER_1';
        if (tier2Keywords.some((k) => lowerName.includes(k)))
            return 'TIER_2';
        return 'TIER_3';
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        scoring_service_1.ScoringService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map