"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const groq_sdk_1 = require("groq-sdk");
let AiService = AiService_1 = class AiService {
    constructor() {
        this.logger = new common_1.Logger(AiService_1.name);
        this.groq = null;
    }
    getClient() {
        if (!this.groq) {
            this.groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY || '' });
        }
        return this.groq;
    }
    async generateRiskSummary(applicationData) {
        try {
            const prompt = `You are a senior credit analyst at an education loan company. Based on the following applicant profile, write a concise 3-4 sentence AI risk assessment summary. Be professional, specific, and mention both strengths and concerns. End with a clear recommendation.

Applicant Profile:
- Name: ${applicationData.applicantName}
- University: ${applicationData.university} (${applicationData.universityTier?.replace('_', ' ')})
- Course: ${applicationData.course}
- Academic Score: ${applicationData.cgpa}%
- Family Annual Income: Rs.${applicationData.familyIncome}
- Existing Loans: ${applicationData.existingLoans}
- Co-applicant Available: ${applicationData.coApplicant ? 'Yes' : 'No'}
- Loan Requested: Rs.${applicationData.loanAmount}
- Scholarship: Rs.${applicationData.scholarshipAmount}
- AI Lead Score: ${applicationData.leadScore}/100
- Lead Category: ${applicationData.leadCategory.replace('_', ' ')}

Scoring Breakdown:
${applicationData.scoringFactors.map(f => `- ${f.explanation} (${f.points > 0 ? '+' : ''}${f.points} pts)`).join('\n')}

Write the risk summary now (3-4 sentences, no bullet points, professional tone):`;
            const completion = await this.getClient().chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.1-8b-instant',
                max_tokens: 250,
                temperature: 0.4,
            });
            return completion.choices[0]?.message?.content?.trim() || 'AI summary unavailable.';
        }
        catch (error) {
            this.logger.error('Groq API error:', error);
            return 'AI risk summary could not be generated at this time.';
        }
    }
    async generateEligibilityTip(score, weakFactors) {
        try {
            const prompt = `You are a helpful education loan advisor. An applicant has a lead score of ${score}/100. Their weak areas are: ${weakFactors.join(', ')}. Write ONE actionable tip (1-2 sentences max) to help them improve their loan approval chances. Be specific and encouraging. No bullet points.`;
            const completion = await this.getClient().chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.1-8b-instant',
                max_tokens: 80,
                temperature: 0.5,
            });
            return completion.choices[0]?.message?.content?.trim() || '';
        }
        catch (error) {
            this.logger.error('Groq API error:', error);
            return '';
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map