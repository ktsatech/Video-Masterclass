import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, Mail, MapPin, ArrowRight, ArrowLeft, Landmark, Upload, CheckCircle, RefreshCw, Send } from 'lucide-react';

interface RegistrationFormProps {
  onSuccess: (email: string, phone: string) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const { signupStudent, stats } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    referral: ''
  });

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successApplicantId, setSuccessApplicantId] = useState('');

  // Referral options
  const referrals = [
    'TikTok Video',
    'Instagram Reels',
    'Facebook Post / Group',
    'WhatsApp Status Update',
    'Friend / Colleague Recommendation',
    'Google / Other'
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.location.trim() || !formData.referral) {
        setErrorMessage('Please fill in all personal profile fields.');
        return;
      }
      if (!formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  // Simulate file upload or allow dummy receipt generation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDummyReceipt = () => {
    setUploadedFileName('Palmpay_Receipt_Verified.png');
    // Set a mock receipt base64/URL
    setReceiptUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60');
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!receiptUrl) {
      setErrorMessage('Please upload a screenshot of your PalmPay transaction receipt.');
      return;
    }

    setIsSubmitting(true);

    // Short artificial delay for realism
    setTimeout(() => {
      const result = signupStudent({
        ...formData,
        regReceiptUrl: receiptUrl
      });

      setIsSubmitting(false);

      if (result.success && result.applicant) {
        setSuccessApplicantId(result.applicant.id);
        setStep(4);
      } else {
        setErrorMessage(result.error || 'Registration failed. Please try again.');
      }
    }, 1200);
  };

  return (
    <div id="registration-portal" className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 sm:p-10 shadow-lg my-12">
      
      {/* Dynamic Progress indicator (top banner) */}
      {step < 4 && (
        <div className="mb-8 border-b border-slate-100 pb-5">
          <div className="flex justify-between text-xs text-slate-400 font-bold mb-3">
            <span className={step >= 1 ? 'text-blue-600' : ''}>1. PROFILE INFO</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>2. BANK TRANSFER</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>3. UPLOAD RECEIPT</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Applicant Profile Fields */}
      {step === 1 && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Application Profile</h3>
            <p className="text-slate-500 text-sm mt-1 font-semibold">Please fill in your contact coordinates. Double check your email and phone numbers — they are your login credentials!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-500" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                placeholder="Elijah Adeyinka"
                className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleTextChange}
                placeholder="yourname@gmail.com"
                className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Phone className="w-3 h-3 text-blue-500" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleTextChange}
                placeholder="0916 315 2202"
                className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-500" /> Your Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleTextChange}
                placeholder="Lagos, Nigeria"
                className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Referral Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">How did you hear about King Elidex?</label>
            <select
              name="referral"
              value={formData.referral}
              onChange={handleTextChange}
              className="bg-white border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">-- Select Channel --</option>
              {referrals.map(ref => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-xs font-black">{errorMessage}</p>
          )}

          {/* CTA Next */}
          <button
            onClick={handleNextStep}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 mt-2 hover:-translate-y-0.5 transition-all"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: PalmPay Bank Details */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-blue-600" /> Secure PalmPay Transfer
            </h3>
            <p className="text-slate-500 text-sm mt-1 font-semibold">
              To secure your queue assignment, transfer the required <strong>₦1,000 Registration Form Fee</strong> to the verified course portal administrator account below.
            </p>
          </div>

          {/* Verification Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 font-semibold leading-relaxed">
            Note: The registration form fee is ₦1,000. Upon successful verification, you will initiate a direct screen session with King Elidex on WhatsApp. The final Masterclass Tuition fee is paid only after evaluation approval.
          </div>

          {/* Bank details card matching requested flyer design */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-blue-900">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
            
            <span className="bg-blue-500 text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full uppercase">
              RECEPTION PORTAL BENEFICIARY
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 border-t border-slate-800 pt-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bank Name</span>
                <span className="text-base font-extrabold text-blue-300">PALMPAY</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Account Name</span>
                <span className="text-base font-extrabold text-white">ELIJAH ADEYINKA</span>
              </div>
              <div className="flex flex-col gap-1 col-span-1 sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Account Number</span>
                <span className="text-3xl font-black text-blue-400 tracking-wider">916 315 2202</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-[10px] text-slate-400 mt-6 leading-relaxed">
              ⚠️ <strong>IMPORTANT:</strong> Write your full name as the transfer remarks. Screenshot or download your complete Palmpay payment confirmation receipt — you'll need to upload it on the next page.
            </div>
          </div>

          {/* Step Actions buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 hover:-translate-y-0.5 transition-all"
            >
              <span>I Have Transferred ₦1,000</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Receipt Screenshot Upload */}
      {step === 3 && (
        <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-6 animate-fadeIn">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" /> Upload PalmPay Receipt
            </h3>
            <p className="text-slate-500 text-sm mt-1 font-semibold">
              Please upload the transaction confirmation screenshot to verify your payment.
            </p>
          </div>

          {/* Interactive Uploader box */}
          <div className="border-2 border-slate-200 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center relative group min-h-[220px]">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {receiptUrl ? (
              <div className="flex flex-col items-center gap-3 relative z-20">
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md border border-slate-200">
                  <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-800 line-clamp-1">{uploadedFileName}</span>
                  <span className="text-[10px] text-blue-600 font-bold mt-0.5">Click or drag new file to change</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 relative z-20">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Select receipt image file</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium">Supports PNG, JPG, or PDF screenshots</span>
                </div>
              </div>
            )}
          </div>

          {/* Bypass generator button to test easily in the iframe */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={generateDummyReceipt}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Use Simulated Screenshot (Fast Testing)</span>
            </button>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-xs font-black">{errorMessage}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="submit"
              id="registration-submit-button"
              disabled={isSubmitting}
              className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Profile...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Application Successfully Saved */}
      {step === 4 && (
        <div className="flex flex-col items-center text-center gap-6 py-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-full uppercase border border-emerald-200">
              Application Queued ✓
            </span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-3">Application Submitted!</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-md font-semibold">
              Thank you! Your registration has been received and is currently under verification.
            </p>
          </div>

          {/* Application Badge card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 w-full flex flex-col gap-2 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase">Application ID</span>
              <span className="font-mono font-black text-slate-800">{successApplicantId}</span>
            </div>
            <div className="h-px bg-slate-200/60 my-1" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase">Assigned Slot</span>
              <span className="font-extrabold text-blue-600">Phase {stats.phase1Slots ? '1' : '2'} Queue</span>
            </div>
            <div className="h-px bg-slate-200/60 my-1" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase">Registration Status</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-black uppercase text-[10px]">
                Pending Verification
              </span>
            </div>
          </div>

          {/* Instruction to proceed to WhatsApp */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left text-sm text-blue-900 flex flex-col gap-3">
            <strong className="font-black text-base flex items-center gap-1.5">
              🚀 WHAT YOU MUST DO NEXT:
            </strong>
            <p className="leading-relaxed font-semibold">
              To proceed to the personal evaluation, you <strong>MUST</strong> send a message to our official WhatsApp account:
            </p>
            <div className="bg-white border border-blue-200 rounded-xl p-3.5 text-center font-mono font-black text-base tracking-wider text-blue-800 flex items-center justify-center gap-2">
              {stats.whatsappNumber}
            </div>
            <p className="leading-relaxed text-xs">
              Open WhatsApp, type: <strong>"Hi, I am {formData.name} — Masterclass Applicant"</strong>, and send. We will initiate your review session immediately.
            </p>
            
            {/* WhatsApp Link button */}
            <a
              href={stats.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-center flex items-center justify-center gap-2 shadow-md"
            >
              <span>Message on WhatsApp</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </a>
          </div>

          {/* Navigate back to check status */}
          <button
            onClick={() => {
              onSuccess(formData.email, formData.phone);
            }}
            className="text-sm font-extrabold text-blue-600 hover:text-blue-500 hover:underline flex items-center gap-1 mt-2"
          >
            <span>View registration status portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
