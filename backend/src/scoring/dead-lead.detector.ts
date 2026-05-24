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

export interface DeadLeadResult {
  isDead: boolean;
  reasons: string[];
  details: string;
}

export class DeadLeadDetector {
  static detect(app: any): DeadLeadResult {
    const reasons: string[] = [];
    const personal = app.personalDetails;
    const academic = app.academicDetails;
    const financial = app.financialDetails;
    const loan = app.loanDetails;

    if (personal) {
      // Check disposable email
      const emailDomain = personal.email?.split('@')[1]?.toLowerCase();
      if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
        reasons.push('Disposable email address detected');
      }

      // Check fake email patterns
      const emailLocal = personal.email?.split('@')[0]?.toLowerCase();
      if (emailLocal && KEYBOARD_PATTERNS.some((p) => emailLocal.includes(p))) {
        reasons.push('Suspicious email pattern detected');
      }

      // Check fake phone
      if (FAKE_PHONE_PATTERNS.includes(personal.phone)) {
        reasons.push('Invalid phone number pattern');
      }

      // Check keyboard mash in name
      if (KEYBOARD_PATTERNS.some((p) => personal.fullName?.toLowerCase().includes(p))) {
        reasons.push('Suspicious name pattern detected');
      }
    }

    if (academic) {
      // Check fake university
      const lowerUniv = academic.universityName?.toLowerCase();
      if (lowerUniv && FAKE_UNIVERSITY_PATTERNS.some((p) => lowerUniv.includes(p))) {
        reasons.push('Invalid or suspicious university name');
      }

      // Check keyboard mash in university
      if (KEYBOARD_PATTERNS.some((p) => lowerUniv?.includes(p))) {
        reasons.push('Suspicious university name pattern');
      }

      // Unrealistic CGPA
      if (academic.cgpaPercentage > 100 || academic.cgpaPercentage < 0) {
        reasons.push('Invalid CGPA/percentage value');
      }
    }

    if (financial) {
      // Invalid PAN check (beyond format - check common fake PANs)
      const pan = financial.panNumber?.toUpperCase();
      if (pan === 'AAAAA0000A' || pan === 'ABCDE1234F') {
        reasons.push('Invalid PAN number (test value detected)');
      }

      // Sanity check income
      if (financial.familyAnnualIncome > 100000000) {
        reasons.push('Unrealistic income declared');
      }
    }

    if (loan && financial) {
      // Unrealistic loan-to-income ratio
      const income = financial.familyAnnualIncome;
      const loanAmt = loan.requiredAmount;
      if (income > 0 && loanAmt / income > 50) {
        reasons.push('Extremely high loan-to-income ratio');
      }

      // Loan amount much higher than tuition + living
      const totalCost = (loan.tuitionFees || 0) + (loan.livingExpenses || 0);
      if (totalCost > 0 && loan.requiredAmount > totalCost * 2) {
        reasons.push('Loan amount significantly exceeds stated expenses');
      }
    }

    // Missing critical sections
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
