import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getApplications(filters: {
        status?: string;
        leadCategory?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        applications: ({
            user: {
                id: string;
                email: string;
                phone: string;
                name: string;
            };
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
            deadLeadLogs: {
                id: string;
                createdAt: Date;
                applicationId: string;
                reason: string;
                details: string | null;
            }[];
        } & {
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
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAnalytics(): Promise<{
        overview: {
            totalApplications: number;
            highQuality: number;
            mediumQuality: number;
            lowQuality: number;
            deadLeads: number;
            approved: number;
            rejected: number;
            underReview: number;
            submitted: number;
            draft: number;
            approvalRate: number;
            totalLoanValue: number;
            averageScore: number;
        };
        leadDistribution: {
            name: string;
            value: number;
            color: string;
        }[];
        statusDistribution: {
            name: string;
            value: number;
        }[];
    }>;
    getUsers(search?: string): Promise<{
        id: string;
        email: string;
        phone: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        _count: {
            applications: number;
        };
    }[]>;
}
