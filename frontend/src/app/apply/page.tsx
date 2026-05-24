'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, User, BookOpen, DollarSign, FileText, Lightbulb, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import AuthGuard from '@/components/shared/AuthGuard';
import Link from 'next/link';

function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Academic', icon: BookOpen },
  { id: 3, label: 'Financial', icon: DollarSign },
  { id: 4, label: 'Loan', icon: FileText },
];

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry','Ladakh','Jammu and Kashmir'];

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-black/60 mb-2">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-black/30 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border bg-white text-black placeholder-black/25 focus:outline-none focus:ring-2 focus:ring-black/15 transition-all text-sm ${err ? 'border-red-300' : 'border-black/10'}`;

const selectClass = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border bg-white text-black focus:outline-none focus:ring-2 focus:ring-black/15 transition-all text-sm ${err ? 'border-red-300' : 'border-black/10'}`;

function Tip({ tips }: { tips: string[] }) {
  if (!tips.length) return null;
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-600" />
        <p className="text-sm font-medium text-amber-800">Improve your score</p>
      </div>
      {tips.map((t, i) => <p key={i} className="text-sm text-amber-700 flex gap-1.5"><span className="text-amber-400 shrink-0">•</span>{t}</p>)}
    </div>
  );
}

function Step1({ data, onChange, errors }: any) {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full Name *" error={errors.fullName}>
          <input value={data.fullName} onChange={e => onChange('fullName', e.target.value)} placeholder="Priya Sharma" className={inputClass(!!errors.fullName)} />
        </Field>
        <Field label="Date of Birth *" error={errors.dateOfBirth} hint="Must be 18+">
          <input type="date" value={data.dateOfBirth} onChange={e => onChange('dateOfBirth', e.target.value)}
            max={new Date(Date.now() - 18*365.25*24*3600*1000).toISOString().split('T')[0]}
            className={inputClass(!!errors.dateOfBirth)} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Gender *" error={errors.gender}>
          <select value={data.gender} onChange={e => onChange('gender', e.target.value)} className={selectClass(!!errors.gender)}>
            <option value="">Select gender</option>
            {['Male','Female','Other','Prefer not to say'].map(g => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Email *" error={errors.email}>
          <input type="email" value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="you@example.com" className={inputClass(!!errors.email)} />
        </Field>
      </div>
      <Field label="Phone *" error={errors.phone} hint="10-digit Indian number">
        <div className="flex">
          <div className="flex items-center px-3 bg-black/5 border border-r-0 border-black/10 rounded-l-xl text-black/40 text-sm">+91</div>
          <input value={data.phone} onChange={e => onChange('phone', e.target.value)} placeholder="9876543210" maxLength={10} className={`${inputClass(!!errors.phone)} rounded-l-none`} />
        </div>
      </Field>
      <Field label="Address *" error={errors.address}>
        <textarea value={data.address} onChange={e => onChange('address', e.target.value)} rows={2} placeholder="House/Flat No., Street, Area" className={`${inputClass(!!errors.address)} resize-none`} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="City *" error={errors.city}>
          <input value={data.city} onChange={e => onChange('city', e.target.value)} placeholder="Mumbai" className={inputClass(!!errors.city)} />
        </Field>
        <Field label="State *" error={errors.state}>
          <select value={data.state} onChange={e => onChange('state', e.target.value)} className={selectClass(!!errors.state)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );
}

function Step2({ data, onChange, errors }: any) {
  const tips: string[] = [];
  if (data.universityName && !['iit','iim','bits','nit','aiims'].some(k => data.universityName.toLowerCase().includes(k)))
    tips.push('Tier-1 universities (IIT, IIM, NIT, BITS) significantly boost your score.');
  if (data.cgpaPercentage && parseFloat(data.cgpaPercentage) < 70)
    tips.push('A score above 70% improves eligibility substantially.');
  if (data.courseName && !/(engineer|computer|science|technology|mba|management)/i.test(data.courseName))
    tips.push('STEM and MBA courses receive higher scoring due to better employment prospects.');
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Education Level *" error={errors.educationLevel}>
          <select value={data.educationLevel} onChange={e => onChange('educationLevel', e.target.value)} className={selectClass(!!errors.educationLevel)}>
            <option value="">Select level</option>
            {['Undergraduate','Postgraduate','Doctoral','Diploma','Certificate'].map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Admission Status *" error={errors.admissionStatus}>
          <select value={data.admissionStatus} onChange={e => onChange('admissionStatus', e.target.value)} className={selectClass(!!errors.admissionStatus)}>
            <option value="">Select status</option>
            {['Confirmed','Conditional','Applied','Pending'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="University / College *" error={errors.universityName} hint="e.g., IIT Bombay, University of Toronto">
        <input value={data.universityName} onChange={e => onChange('universityName', e.target.value)} placeholder="IIT Delhi" className={inputClass(!!errors.universityName)} />
      </Field>
      <Field label="Course / Program *" error={errors.courseName}>
        <input value={data.courseName} onChange={e => onChange('courseName', e.target.value)} placeholder="B.Tech Computer Science" className={inputClass(!!errors.courseName)} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Country of Study *" error={errors.countryOfStudy}>
          <input value={data.countryOfStudy} onChange={e => onChange('countryOfStudy', e.target.value)} placeholder="India / USA / UK" className={inputClass(!!errors.countryOfStudy)} />
        </Field>
        <Field label="Expected Graduation *" error={errors.expectedGradYear}>
          <select value={data.expectedGradYear} onChange={e => onChange('expectedGradYear', e.target.value)} className={selectClass(!!errors.expectedGradYear)}>
            <option value="">Select year</option>
            {Array.from({length:12},(_,i)=>2024+i).map(y=><option key={y}>{y}</option>)}
          </select>
        </Field>
      </div>
      <Field label="CGPA / Percentage *" error={errors.cgpaPercentage} hint="Enter percentage (0-100)">
        <input type="number" value={data.cgpaPercentage} onChange={e => onChange('cgpaPercentage', e.target.value)} placeholder="85" min="0" max="100" step="0.1" className={inputClass(!!errors.cgpaPercentage)} />
      </Field>
      <Tip tips={tips} />
    </div>
  );
}

function Step3({ data, onChange, errors }: any) {
  const tips: string[] = [];
  if (!data.coApplicantAvailable) tips.push('Adding a co-applicant improves your score by +10 points.');
  if (data.existingLoans >= 3) tips.push('Multiple existing loans reduce eligibility. Consider clearing some.');
  return (
    <div className="space-y-5">
      <Field label="Family Annual Income (₹) *" error={errors.familyAnnualIncome} hint="Combined household income">
        <input type="number" value={data.familyAnnualIncome} onChange={e => onChange('familyAnnualIncome', e.target.value)} placeholder="600000" min="0" className={inputClass(!!errors.familyAnnualIncome)} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Existing Loans *" error={errors.existingLoans}>
          <select value={data.existingLoans} onChange={e => onChange('existingLoans', e.target.value)} className={selectClass()}>
            <option value="">Select</option>
            {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n===0?'None':n}</option>)}
          </select>
        </Field>
        <Field label="Existing Loan Amount (₹)">
          <input type="number" value={data.existingLoanAmount} onChange={e => onChange('existingLoanAmount', e.target.value)} placeholder="0" min="0" disabled={data.existingLoans==0} className={inputClass()} />
        </Field>
      </div>
      <Field label="Co-applicant Available? *">
        <div className="flex gap-3">
          {[{label:'Yes',value:true},{label:'No',value:false}].map(opt=>(
            <button key={opt.label} type="button" onClick={() => onChange('coApplicantAvailable', opt.value)}
              className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${data.coApplicantAvailable===opt.value ? 'bg-black text-white border-black' : 'bg-white text-black/60 border-black/10 hover:border-black/30'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </Field>
      {data.coApplicantAvailable && (
        <Field label="Co-applicant Annual Income (₹)">
          <input type="number" value={data.coApplicantIncome} onChange={e => onChange('coApplicantIncome', e.target.value)} placeholder="400000" min="0" className={inputClass()} />
        </Field>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="PAN Number *" error={errors.panNumber} hint="Format: ABCDE1234F">
          <input value={data.panNumber} onChange={e => onChange('panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} className={inputClass(!!errors.panNumber)} />
        </Field>
        <Field label="Aadhaar Number *" error={errors.aadhaarNumber} hint="12-digit number">
          <input value={data.aadhaarNumber} onChange={e => onChange('aadhaarNumber', e.target.value.replace(/\D/g,''))} placeholder="123456789012" maxLength={12} className={inputClass(!!errors.aadhaarNumber)} />
        </Field>
      </div>
      <Tip tips={tips} />
    </div>
  );
}

function Step4({ data, onChange, errors, financial }: any) {
  const totalCost = (parseFloat(data.tuitionFees)||0) + (parseFloat(data.livingExpenses)||0);
  const netLoan = totalCost - (parseFloat(data.scholarshipAmount)||0);
  const income = parseFloat(financial?.familyAnnualIncome)||0;
  const loanToIncome = income > 0 ? (parseFloat(data.requiredAmount)||0) / income : 0;
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Tuition Fees (₹) *" error={errors.tuitionFees}>
          <input type="number" value={data.tuitionFees} onChange={e => onChange('tuitionFees', e.target.value)} placeholder="500000" min="0" className={inputClass(!!errors.tuitionFees)} />
        </Field>
        <Field label="Living Expenses (₹)">
          <input type="number" value={data.livingExpenses} onChange={e => onChange('livingExpenses', e.target.value)} placeholder="200000" min="0" className={inputClass()} />
        </Field>
      </div>
      <Field label="Scholarship Amount (₹)" hint="Enter 0 if no scholarship">
        <input type="number" value={data.scholarshipAmount} onChange={e => onChange('scholarshipAmount', e.target.value)} placeholder="0" min="0" className={inputClass()} />
      </Field>
      <Field label="Required Loan Amount (₹) *" error={errors.requiredAmount}
        hint={totalCost > 0 ? `Estimated need: ₹${netLoan.toLocaleString('en-IN')}` : ''}>
        <input type="number" value={data.requiredAmount} onChange={e => onChange('requiredAmount', e.target.value)} placeholder="700000" min="10000" className={inputClass(!!errors.requiredAmount)} />
      </Field>
      <Field label="Loan Purpose *" error={errors.loanPurpose}>
        <select value={data.loanPurpose} onChange={e => onChange('loanPurpose', e.target.value)} className={selectClass(!!errors.loanPurpose)}>
          <option value="">Select purpose</option>
          {['Tuition','Living Expenses','Equipment','All Expenses'].map(p=><option key={p}>{p}</option>)}
        </select>
      </Field>
      {totalCost > 0 && (
        <div className="bg-black/3 rounded-xl p-4 space-y-2 text-sm">
          <p className="font-medium text-black/60 text-xs uppercase tracking-wide">Loan Summary</p>
          <div className="flex justify-between text-black/60"><span>Total Cost</span><span className="font-medium text-black">₹{totalCost.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-black/60"><span>Less Scholarship</span><span className="font-medium text-emerald-600">−₹{(parseFloat(data.scholarshipAmount)||0).toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between pt-2 border-t border-black/10 font-medium text-black"><span>Net Loan Needed</span><span>₹{netLoan.toLocaleString('en-IN')}</span></div>
          {loanToIncome > 10 && <p className="text-amber-600 text-xs pt-1">⚠ Loan-to-income ratio is high ({loanToIncome.toFixed(1)}x)</p>}
        </div>
      )}
    </div>
  );
}

function ApplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appId = searchParams.get('id');
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string|null>(appId);
  const [p1, setP1] = useState({fullName:'',dateOfBirth:'',gender:'',email:user?.email||'',phone:'',address:'',city:'',state:''});
  const [p2, setP2] = useState({educationLevel:'',universityName:'',courseName:'',countryOfStudy:'',admissionStatus:'',expectedGradYear:'',cgpaPercentage:''});
  const [p3, setP3] = useState({familyAnnualIncome:'',existingLoans:'0',existingLoanAmount:'',coApplicantAvailable:false,coApplicantIncome:'',panNumber:'',aadhaarNumber:''});
  const [p4, setP4] = useState({requiredAmount:'',tuitionFees:'',livingExpenses:'',scholarshipAmount:'0',loanPurpose:''});
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    if (!applicationId) {
      applicationsApi.create().then(r => setApplicationId(r.data.id)).catch(()=>toast.error('Failed to create application'));
    } else {
      applicationsApi.getById(applicationId).then(r => {
        const a = r.data;
        if (a.personalDetails) setP1({...a.personalDetails, dateOfBirth: a.personalDetails.dateOfBirth?.split('T')[0]||''});
        if (a.academicDetails) setP2({...a.academicDetails, expectedGradYear:String(a.academicDetails.expectedGradYear), cgpaPercentage:String(a.academicDetails.cgpaPercentage)});
        if (a.financialDetails) setP3({...a.financialDetails, familyAnnualIncome:String(a.financialDetails.familyAnnualIncome), existingLoans:String(a.financialDetails.existingLoans), existingLoanAmount:String(a.financialDetails.existingLoanAmount||''), coApplicantIncome:String(a.financialDetails.coApplicantIncome||'')});
        if (a.loanDetails) setP4({...a.loanDetails, requiredAmount:String(a.loanDetails.requiredAmount), tuitionFees:String(a.loanDetails.tuitionFees), livingExpenses:String(a.loanDetails.livingExpenses), scholarshipAmount:String(a.loanDetails.scholarshipAmount)});
        if (a.loanDetails) setStep(4); else if (a.financialDetails) setStep(3); else if (a.academicDetails) setStep(2);
      }).catch(()=>{});
    }
  }, [applicationId]);

  const validate = () => {
    const e: Record<string,string> = {};
    if (step===1) {
      if (!p1.fullName?.trim()) e.fullName='Required';
      if (!p1.dateOfBirth) e.dateOfBirth='Required';
      if (!p1.gender) e.gender='Required';
      if (!p1.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p1.email)) e.email='Valid email required';
      if (!p1.phone||!/^[6-9]\d{9}$/.test(p1.phone)) e.phone='Valid 10-digit number';
      if (!p1.address?.trim()||p1.address.length<10) e.address='Min 10 characters';
      if (!p1.city?.trim()) e.city='Required';
      if (!p1.state) e.state='Required';
    }
    if (step===2) {
      if (!p2.educationLevel) e.educationLevel='Required';
      if (!p2.universityName?.trim()||p2.universityName.length<3) e.universityName='Enter valid university name';
      if (!p2.courseName?.trim()||p2.courseName.length<3) e.courseName='Enter course name';
      if (!p2.countryOfStudy?.trim()) e.countryOfStudy='Required';
      if (!p2.admissionStatus) e.admissionStatus='Required';
      if (!p2.expectedGradYear) e.expectedGradYear='Required';
      if (!p2.cgpaPercentage||parseFloat(p2.cgpaPercentage)<0||parseFloat(p2.cgpaPercentage)>100) e.cgpaPercentage='Enter 0-100';
    }
    if (step===3) {
      if (!p3.familyAnnualIncome||parseFloat(p3.familyAnnualIncome)<=0) e.familyAnnualIncome='Enter valid income';
      if (!p3.panNumber||!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(p3.panNumber)) e.panNumber='Invalid PAN format';
      if (!p3.aadhaarNumber||!/^\d{12}$/.test(p3.aadhaarNumber)) e.aadhaarNumber='Enter 12-digit Aadhaar';
    }
    if (step===4) {
      if (!p4.requiredAmount||parseFloat(p4.requiredAmount)<10000) e.requiredAmount='Minimum ₹10,000';
      if (!p4.tuitionFees||parseFloat(p4.tuitionFees)<=0) e.tuitionFees='Enter tuition fees';
      if (!p4.loanPurpose) e.loanPurpose='Required';
    }
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const save = async () => {
    if (!applicationId) return;
    setSaving(true);
    try {
      if (step===1) await applicationsApi.savePersonal(applicationId, p1);
      if (step===2) await applicationsApi.saveAcademic(applicationId, {...p2, expectedGradYear:parseInt(p2.expectedGradYear), cgpaPercentage:parseFloat(p2.cgpaPercentage)});
      if (step===3) await applicationsApi.saveFinancial(applicationId, {...p3, familyAnnualIncome:parseFloat(p3.familyAnnualIncome), existingLoans:parseInt(p3.existingLoans), existingLoanAmount:parseFloat(p3.existingLoanAmount)||0, coApplicantIncome:parseFloat(p3.coApplicantIncome)||0});
      if (step===4) await applicationsApi.saveLoan(applicationId, {...p4, requiredAmount:parseFloat(p4.requiredAmount), tuitionFees:parseFloat(p4.tuitionFees), livingExpenses:parseFloat(p4.livingExpenses)||0, scholarshipAmount:parseFloat(p4.scholarshipAmount)||0});
      toast.success('Saved', { duration: 1200 });
    } catch(err:any) { toast.error(err.response?.data?.message||'Save failed'); throw err; }
    finally { setSaving(false); }
  };

  const handleNext = async () => {
    if (!validate()) { toast.error('Please fix errors'); return; }
    try { await save(); setStep(s=>s+1); setErrors({}); } catch {}
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix errors'); return; }
    setSubmitting(true);
    try {
      await save();
      const res = await applicationsApi.submit(applicationId!);
      if (res.data.status==='DEAD_LEAD') {
        toast.error('Application flagged: '+(res.data.deadLeadReason||'Invalid data'), { duration: 6000 });
      } else {
        toast.success(`Submitted! AI Score: ${res.data.leadScore}/100`);
      }
      router.push('/dashboard');
    } catch(err:any) { toast.error(err.response?.data?.message||'Submission failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        {/* Header */}
        <div className="bg-white border-b border-black/8 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <LogoIcon className="w-5 h-5 text-black" />
              <span className="font-medium text-black text-base" style={{ fontFamily: 'Sora, sans-serif' }}>EduFund AI</span>
            </Link>
            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    step===s.id ? 'bg-black text-white' : step>s.id ? 'bg-emerald-100 text-emerald-700' : 'bg-black/5 text-black/30'
                  }`}>
                    {step>s.id ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < STEPS.length-1 && <div className={`w-4 h-px ${step>s.id ? 'bg-emerald-300' : 'bg-black/10'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="mb-8">
            <p className="text-black/40 text-sm mb-1">Step {step} of 4</p>
            <h1 className="text-black" style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.03em', fontFamily: 'Sora, sans-serif' }}>
              {STEPS[step-1].label} Information
            </h1>
          </div>

          {/* Auto-save notice */}
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 mb-6">
            <Check className="w-3.5 h-3.5" /> Progress saves automatically between steps
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-black/8 p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}>
                {step===1 && <Step1 data={p1} onChange={(k:string,v:any)=>setP1(p=>({...p,[k]:v}))} errors={errors} />}
                {step===2 && <Step2 data={p2} onChange={(k:string,v:any)=>setP2(p=>({...p,[k]:v}))} errors={errors} />}
                {step===3 && <Step3 data={p3} onChange={(k:string,v:any)=>setP3(p=>({...p,[k]:v}))} errors={errors} />}
                {step===4 && <Step4 data={p4} onChange={(k:string,v:any)=>setP4(p=>({...p,[k]:v}))} errors={errors} financial={p3} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={() => { setStep(s=>s-1); setErrors({}); }} disabled={step===1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-black/15 text-black/60 font-medium text-sm hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs text-black/30">{saving ? 'Saving...' : ''}</span>

            {step < 4 ? (
              <button onClick={handleNext} disabled={saving}
                className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save & Continue
                <span className="bg-white rounded-full p-1.5"><ChevronRight className="w-3.5 h-3.5 text-black" /></span>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting||saving}
                className="inline-flex items-center gap-3 bg-black text-white font-medium pl-6 pr-2 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Application
                <span className="bg-white rounded-full p-1.5"><Check className="w-3.5 h-3.5 text-black" /></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{backgroundColor:'#F5F5F5'}}><Loader2 className="w-6 h-6 animate-spin text-black/30" /></div>}>
      <ApplyContent />
    </Suspense>
  );
}
