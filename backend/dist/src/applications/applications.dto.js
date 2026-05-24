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
exports.UpdateApplicationStatusDto = exports.LoanDetailsDto = exports.FinancialDetailsDto = exports.AcademicDetailsDto = exports.PersonalDetailsDto = void 0;
const class_validator_1 = require("class-validator");
class PersonalDetailsDto {
}
exports.PersonalDetailsDto = PersonalDetailsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['Male', 'Female', 'Other', 'Prefer not to say']),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' }),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], PersonalDetailsDto.prototype, "state", void 0);
class AcademicDetailsDto {
}
exports.AcademicDetailsDto = AcademicDetailsDto;
__decorate([
    (0, class_validator_1.IsIn)(['Undergraduate', 'Postgraduate', 'Doctoral', 'Diploma', 'Certificate']),
    __metadata("design:type", String)
], AcademicDetailsDto.prototype, "educationLevel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AcademicDetailsDto.prototype, "universityName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], AcademicDetailsDto.prototype, "courseName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcademicDetailsDto.prototype, "countryOfStudy", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['Confirmed', 'Conditional', 'Applied', 'Pending']),
    __metadata("design:type", String)
], AcademicDetailsDto.prototype, "admissionStatus", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2024),
    (0, class_validator_1.Max)(2035),
    __metadata("design:type", Number)
], AcademicDetailsDto.prototype, "expectedGradYear", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], AcademicDetailsDto.prototype, "cgpaPercentage", void 0);
class FinancialDetailsDto {
}
exports.FinancialDetailsDto = FinancialDetailsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], FinancialDetailsDto.prototype, "familyAnnualIncome", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], FinancialDetailsDto.prototype, "existingLoans", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FinancialDetailsDto.prototype, "existingLoanAmount", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FinancialDetailsDto.prototype, "coApplicantAvailable", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], FinancialDetailsDto.prototype, "coApplicantIncome", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN format (e.g., ABCDE1234F)' }),
    __metadata("design:type", String)
], FinancialDetailsDto.prototype, "panNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{12}$/, { message: 'Aadhaar must be 12 digits' }),
    __metadata("design:type", String)
], FinancialDetailsDto.prototype, "aadhaarNumber", void 0);
class LoanDetailsDto {
}
exports.LoanDetailsDto = LoanDetailsDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(10000),
    __metadata("design:type", Number)
], LoanDetailsDto.prototype, "requiredAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], LoanDetailsDto.prototype, "tuitionFees", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanDetailsDto.prototype, "livingExpenses", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LoanDetailsDto.prototype, "scholarshipAmount", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['Tuition', 'Living Expenses', 'Equipment', 'All Expenses']),
    __metadata("design:type", String)
], LoanDetailsDto.prototype, "loanPurpose", void 0);
class UpdateApplicationStatusDto {
}
exports.UpdateApplicationStatusDto = UpdateApplicationStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "notes", void 0);
//# sourceMappingURL=applications.dto.js.map