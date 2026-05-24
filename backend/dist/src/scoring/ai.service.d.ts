export declare class AiService {
    private readonly logger;
    private groq;
    private getClient;
    generateRiskSummary(applicationData: {
        applicantName: string;
        university: string;
        universityTier: string;
        course: string;
        cgpa: number;
        familyIncome: number;
        existingLoans: number;
        coApplicant: boolean;
        loanAmount: number;
        scholarshipAmount: number;
        leadScore: number;
        leadCategory: string;
        scoringFactors: Array<{
            factor: string;
            points: number;
            explanation: string;
        }>;
    }): Promise<string>;
    generateEligibilityTip(score: number, weakFactors: string[]): Promise<string>;
}
