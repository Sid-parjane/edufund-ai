export type ApplicationStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'DEAD_LEAD';

export type LeadCategory = 
  | 'HIGH_QUALITY' 
  | 'MEDIUM_QUALITY' 
  | 'LOW_QUALITY' 
  | 'UNSCORED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface Application {
  id: string;
  userId: string;
  status: ApplicationStatus;
  leadScore?: number;
  leadCategory: LeadCategory;
  riskLevel?: RiskLevel;
  isEligible?: boolean;
  deadLeadReason?: string;
  loanAmount?: number;
  notes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  personalDetails?: PersonalDetails;
  academicDetails?: AcademicDetails;
  financialDetails?: FinancialDetails;
  loanDetails?: LoanDetails;
  scoringLogs?: ScoringLog[];
  deadLeadLogs?: DeadLeadLog[];
}

export interface PersonalDetails {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export interface AcademicDetails {
  educationLevel: string;
  universityName: string;
  courseName: string;
  countryOfStudy: string;
  admissionStatus: string;
  expectedGradYear: number;
  cgpaPercentage: number;
  universityTier?: string;
}

export interface FinancialDetails {
  familyAnnualIncome: number;
  existingLoans: number;
  existingLoanAmount?: number;
  coApplicantAvailable: boolean;
  coApplicantIncome?: number;
  panNumber: string;
  aadhaarNumber: string;
}

export interface LoanDetails {
  requiredAmount: number;
  tuitionFees: number;
  livingExpenses: number;
  scholarshipAmount: number;
  loanPurpose: string;
}

export interface ScoringLog {
  factor: string;
  points: number;
  explanation: string;
}

export interface DeadLeadLog {
  reason: string;
  details?: string;
}

export interface AdminAnalytics {
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
  leadDistribution: Array<{ name: string; value: number; color: string }>;
  statusDistribution: Array<{ name: string; value: number }>;
}
