"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const adminHash = await bcrypt.hash('Admin@1234', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@edufund.ai' },
        update: {},
        create: {
            name: 'EduFund Admin',
            email: 'admin@edufund.ai',
            phone: '9000000000',
            passwordHash: adminHash,
            role: 'ADMIN',
            isVerified: true,
        },
    });
    console.log('✅ Admin user created:', admin.email);
    const studentHash = await bcrypt.hash('Student@1234', 12);
    const student = await prisma.user.upsert({
        where: { email: 'priya@example.com' },
        update: {},
        create: {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '9876543210',
            passwordHash: studentHash,
            role: 'STUDENT',
            isVerified: true,
        },
    });
    console.log('✅ Sample student created:', student.email);
    const existingApp = await prisma.loanApplication.findFirst({
        where: { userId: student.id, status: { not: 'DRAFT' } },
    });
    if (!existingApp) {
        const app = await prisma.loanApplication.create({
            data: {
                userId: student.id,
                status: 'UNDER_REVIEW',
                leadScore: 82,
                leadCategory: 'HIGH_QUALITY',
                riskLevel: 'LOW',
                isEligible: true,
                loanAmount: 1500000,
                submittedAt: new Date(),
                personalDetails: {
                    create: {
                        fullName: 'Priya Sharma',
                        dateOfBirth: new Date('2000-05-15'),
                        gender: 'Female',
                        email: 'priya@example.com',
                        phone: '9876543210',
                        address: '12, Green Park Colony, Sector 5',
                        city: 'New Delhi',
                        state: 'Delhi',
                    },
                },
                academicDetails: {
                    create: {
                        educationLevel: 'Postgraduate',
                        universityName: 'IIT Delhi',
                        courseName: 'M.Tech Computer Science',
                        countryOfStudy: 'India',
                        admissionStatus: 'Confirmed',
                        expectedGradYear: 2026,
                        cgpaPercentage: 88,
                        universityTier: 'TIER_1',
                    },
                },
                financialDetails: {
                    create: {
                        familyAnnualIncome: 900000,
                        existingLoans: 0,
                        coApplicantAvailable: true,
                        coApplicantIncome: 600000,
                        panNumber: 'BCCPS1234D',
                        aadhaarNumber: '234567890123',
                    },
                },
                loanDetails: {
                    create: {
                        requiredAmount: 1500000,
                        tuitionFees: 1200000,
                        livingExpenses: 400000,
                        scholarshipAmount: 200000,
                        loanPurpose: 'All Expenses',
                    },
                },
                scoringLogs: {
                    create: [
                        { factor: 'CGPA', points: 20, explanation: 'Outstanding academic performance (>85%)' },
                        { factor: 'University', points: 20, explanation: 'Tier-1 institution significantly boosts eligibility' },
                        { factor: 'Course', points: 10, explanation: 'STEM course improves employment prospects' },
                        { factor: 'Family Income', points: 10, explanation: 'Moderate family income (₹6L-₹12L)' },
                        { factor: 'Co-applicant', points: 10, explanation: 'Co-applicant strengthens loan application' },
                        { factor: 'Existing Loans', points: 5, explanation: 'Clean loan record - no existing debt' },
                        { factor: 'Scholarship', points: 5, explanation: '17% scholarship reduces loan burden' },
                        { factor: 'Admission', points: 5, explanation: 'Confirmed admission reduces risk' },
                    ],
                },
            },
        });
        console.log('✅ Sample application created:', app.id);
    }
    console.log('🎉 Seeding complete!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@edufund.ai / Admin@1234');
    console.log('   Student: priya@example.com / Student@1234');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=seed.js.map