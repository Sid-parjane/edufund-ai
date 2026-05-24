"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadLeadDetector = void 0;
const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'yopmail.com', 'trashmail.com', 'maildrop.cc', 'dispostable.com',
    'temp-mail.org', 'fakeinbox.com', 'sharklasers.com',
];
const FAKE_PHONE_PATTERNS = [
    '1234567890', '9999999999', '8888888888', '7777777777',
    '0000000000', '1111111111', '9876543210',
];
const FAKE_UNIVERSITY_PATTERNS = [
    'test', 'fake', 'abc university', 'xyz university', 'asdf',
    'qwerty', 'random university', 'my university',
];
const KEYBOARD_PATTERNS = [
    'qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'aaaaaa', 'bbbbbb',
    '123456', 'abcdef',
];
class DeadLeadDetector {
    static detect(app) {
        const reasons = [];
        const personal = app.personalDetails;
        const academic = app.academicDetails;
        const financial = app.financialDetails;
        const loan = app.loanDetails;
        if (personal) {
            const emailDomain = personal.email?.split('@')[1]?.toLowerCase();
            if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
                reasons.push('Disposable email address detected');
            }
            const emailLocal = personal.email?.split('@')[0]?.toLowerCase();
            if (emailLocal && KEYBOARD_PATTERNS.some((p) => emailLocal.includes(p))) {
                reasons.push('Suspicious email pattern detected');
            }
            if (FAKE_PHONE_PATTERNS.includes(personal.phone)) {
                reasons.push('Invalid phone number pattern');
            }
            if (KEYBOARD_PATTERNS.some((p) => personal.fullName?.toLowerCase().includes(p))) {
                reasons.push('Suspicious name pattern detected');
            }
        }
        if (academic) {
            const lowerUniv = academic.universityName?.toLowerCase();
            if (lowerUniv && FAKE_UNIVERSITY_PATTERNS.some((p) => lowerUniv.includes(p))) {
                reasons.push('Invalid or suspicious university name');
            }
            if (KEYBOARD_PATTERNS.some((p) => lowerUniv?.includes(p))) {
                reasons.push('Suspicious university name pattern');
            }
            if (academic.cgpaPercentage > 100 || academic.cgpaPercentage < 0) {
                reasons.push('Invalid CGPA/percentage value');
            }
        }
        if (financial) {
            const pan = financial.panNumber?.toUpperCase();
            if (pan === 'AAAAA0000A' || pan === 'ABCDE1234F') {
                reasons.push('Invalid PAN number (test value detected)');
            }
            if (financial.familyAnnualIncome > 100000000) {
                reasons.push('Unrealistic income declared');
            }
        }
        if (loan && financial) {
            const income = financial.familyAnnualIncome;
            const loanAmt = loan.requiredAmount;
            if (income > 0 && loanAmt / income > 50) {
                reasons.push('Extremely high loan-to-income ratio');
            }
            const totalCost = (loan.tuitionFees || 0) + (loan.livingExpenses || 0);
            if (totalCost > 0 && loan.requiredAmount > totalCost * 2) {
                reasons.push('Loan amount significantly exceeds stated expenses');
            }
        }
        if (!personal || !academic || !financial || !loan) {
            reasons.push('Incomplete application - missing required sections');
        }
        return {
            isDead: reasons.length > 0,
            reasons,
            details: reasons.join('; '),
        };
    }
}
exports.DeadLeadDetector = DeadLeadDetector;
//# sourceMappingURL=dead-lead.detector.js.map