import {
  IsString, IsEmail, IsDateString, IsNumber, IsBoolean,
  IsOptional, Min, Max, IsIn, MinLength, MaxLength,
  Matches, IsInt, IsPositive,
} from 'class-validator';

export class PersonalDetailsDto {
  @IsString() @MinLength(2) @MaxLength(100)
  fullName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsIn(['Male', 'Female', 'Other', 'Prefer not to say'])
  gender: string;

  @IsEmail()
  email: string;

  @IsString() @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  phone: string;

  @IsString() @MinLength(10)
  address: string;

  @IsString() @MinLength(2)
  city: string;

  @IsString() @MinLength(2)
  state: string;
}

export class AcademicDetailsDto {
  @IsIn(['Undergraduate', 'Postgraduate', 'Doctoral', 'Diploma', 'Certificate'])
  educationLevel: string;

  @IsString() @MinLength(3) @MaxLength(200)
  universityName: string;

  @IsString() @MinLength(3) @MaxLength(200)
  courseName: string;

  @IsString()
  countryOfStudy: string;

  @IsIn(['Confirmed', 'Conditional', 'Applied', 'Pending'])
  admissionStatus: string;

  @IsInt() @Min(2024) @Max(2035)
  expectedGradYear: number;

  @IsNumber() @Min(0) @Max(100)
  cgpaPercentage: number;
}

export class FinancialDetailsDto {
  @IsNumber() @IsPositive()
  familyAnnualIncome: number;

  @IsInt() @Min(0) @Max(10)
  existingLoans: number;

  @IsOptional() @IsNumber() @Min(0)
  existingLoanAmount?: number;

  @IsBoolean()
  coApplicantAvailable: boolean;

  @IsOptional() @IsNumber() @Min(0)
  coApplicantIncome?: number;

  @IsString() @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format (e.g., ABCDE1234F)' })
  panNumber: string;

  @IsString() @Matches(/^\d{12}$/, { message: 'Aadhaar must be 12 digits' })
  aadhaarNumber: string;
}

export class LoanDetailsDto {
  @IsNumber() @IsPositive() @Min(10000)
  requiredAmount: number;

  @IsNumber() @IsPositive()
  tuitionFees: number;

  @IsNumber() @Min(0)
  livingExpenses: number;

  @IsNumber() @Min(0)
  scholarshipAmount: number;

  @IsIn(['Tuition', 'Living Expenses', 'Equipment', 'All Expenses'])
  loanPurpose: string;
}

export class UpdateApplicationStatusDto {
  @IsIn(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status: string;

  @IsOptional() @IsString()
  notes?: string;
}
