import { ScoringService } from './scoring.service';
export declare class ScoringController {
    private scoringService;
    constructor(scoringService: ScoringService);
    evaluate(applicationId: string): Promise<{
        aiRiskSummary: string;
        personalDetails: {
            id: string;
            email: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            fullName: string;
            dateOfBirth: Date;
            gender: string;
            address: string;
            city: string;
            state: string;
            applicationId: string;
        };
        academicDetails: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            applicationId: string;
            educationLevel: string;
            universityName: string;
            courseName: string;
            countryOfStudy: string;
            admissionStatus: string;
            expectedGradYear: number;
            cgpaPercentage: number;
            universityTier: string | null;
        };
        financialDetails: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            applicationId: string;
            familyAnnualIncome: number;
            existingLoans: number;
            existingLoanAmount: number | null;
            coApplicantAvailable: boolean;
            coApplicantIncome: number | null;
            panNumber: string;
            aadhaarNumber: string;
        };
        loanDetails: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            applicationId: string;
            requiredAmount: number;
            tuitionFees: number;
            livingExpenses: number;
            scholarshipAmount: number;
            loanPurpose: string;
        };
        scoringLogs: {
            id: string;
            createdAt: Date;
            applicationId: string;
            factor: string;
            points: number;
            explanation: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        leadScore: number | null;
        leadCategory: import(".prisma/client").$Enums.LeadCategory;
        riskLevel: import(".prisma/client").$Enums.RiskLevel | null;
        isEligible: boolean | null;
        deadLeadReason: string | null;
        loanAmount: number | null;
        notes: string | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
    }>;
}
