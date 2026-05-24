export declare class PersonalDetailsDto {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
}
export declare class AcademicDetailsDto {
    educationLevel: string;
    universityName: string;
    courseName: string;
    countryOfStudy: string;
    admissionStatus: string;
    expectedGradYear: number;
    cgpaPercentage: number;
}
export declare class FinancialDetailsDto {
    familyAnnualIncome: number;
    existingLoans: number;
    existingLoanAmount?: number;
    coApplicantAvailable: boolean;
    coApplicantIncome?: number;
    panNumber: string;
    aadhaarNumber: string;
}
export declare class LoanDetailsDto {
    requiredAmount: number;
    tuitionFees: number;
    livingExpenses: number;
    scholarshipAmount: number;
    loanPurpose: string;
}
export declare class UpdateApplicationStatusDto {
    status: string;
    notes?: string;
}
