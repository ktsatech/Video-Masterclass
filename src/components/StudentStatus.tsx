import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus } from '../types';
import { Search, UserCheck, Phone, Mail, MapPin, Landmark, Upload, RefreshCw, Send, Lock, ArrowRight, CheckCircle } from 'lucide-react';

interface StudentStatusProps {
  initialSearchEmail?: string;
  onNavigateToPortal: () => void;
}

export default function StudentStatus({ initialSearchEmail = '', onNavigateToPortal }: StudentStatusProps) {
  const { applicants, uploadTrainingFeeReceipt, stats } = useApp();
  const [searchEmail, setSearchEmail] = useState(initialSearchEmail);
  const [searched, setSearched] = useState(!!initialSearchEmail);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(() => {
    if (initialSearchEmail) {
      return applicants.find(a => a.email.toLowerCase().trim() === initialSearchEmail.toLowerCase().trim()) || null;
    }
    return null;
  });

  const [trainingReceipt, setTrainingReceipt] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitSuccess(false);
    
    if (!searchEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const found = applicants.find(a => a.email.toLowerCase().trim() === searchEmail.toLowerCase().trim());
    setSelectedApplicant(found || null);
    setSearched(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrainingReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDummyReceipt = () => {
    setUploadedFileName('Palmpay_Training_Receipt.png');
    setTrainingReceipt('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60');
  };

  const handleTrainingReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!trainingReceipt) {
      setErrorMsg('Please upload a screenshot of your PalmPay tuition transaction receipt.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = uploadTrainingFeeReceipt(selectedApplicant.id, trainingReceipt);
      setIsSubmitting(false);
      if (success) {
        setSubmitSuccess(true);
        // Reload applicant state
        const updated = applicants.find(a => a.id === selectedApplicant.id);
        setSelectedApplicant(updated || null);
      } else {
        setErrorMsg('Submission failed. Student record not found.');
      }
    }, 1200);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING_REG:
        return { text: 'Pending Verification', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case ApplicationStatus.REG_CONFIRMED:
        return { text: 'Registration Confirmed (Pending Evaluation)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case ApplicationStatus.EVALUATED:
        return { text: 'Selected & Approved (Pending Tuition)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case ApplicationStatus.PENDING_TRAINING:
        return { text: 'Tuition Paid (Awaiting Verification)', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case ApplicationStatus.ENROLLED:
        return { text: 'Fully Enrolled (Active Student)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case ApplicationStatus.REJECTED:
        return { text: 'Application Unsuccessful', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
  };

  const currentBadge = selectedApplicant ? getStatusBadge(selectedApplicant.status) : null;
  const expectedTuition = selectedApplicant?.phaseNum === 1 ? 5000 : 10000;

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6">
      
      {/* Header Description */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Status Portal</h2>
        <p className="mt-2 text-slate-500 font-semibold text-sm max-w-md mx-auto">
          Enter your registered email address below to track your evaluation progress, view remarks, and settle tuition fees.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-md mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Enter your registered email (e.g. sam.chukwu@gmail.com)"
              className="w-full border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            id="status-search-submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm shadow-md shadow-blue-100"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Search Application</span>
          </button>
        </form>
        {errorMsg && !selectedApplicant && (
          <p className="text-red-500 text-xs font-black mt-3">{errorMsg}</p>
        )}
      </div>

      {/* SEARCH RESULTS VIEW */}
      {searched && (
        <div className="animate-fadeIn">
          {selectedApplicant ? (
            <div className="flex flex-col gap-6">
              
              {/* Applicant Card Summary */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black font-mono text-blue-600 tracking-widest uppercase">
                    APPLICATION ID: {selectedApplicant.id}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedApplicant.name}</h3>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-500" /> {selectedApplicant.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-500" /> {selectedApplicant.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {selectedApplicant.location}</span>
                  </div>
                </div>

                <div className={`border font-black text-xs px-3.5 py-1.5 rounded-lg border-opacity-60 text-center ${currentBadge?.color}`}>
                  {currentBadge?.text}
                </div>
              </div>

              {/* Progress Flow timeline bar */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-6">Queue Milestones</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                  {[
                    { label: 'Applied', desc: 'Reg fee paid', active: true },
                    { label: 'Validated', desc: 'Contact queue', active: selectedApplicant.status !== ApplicationStatus.PENDING_REG && selectedApplicant.status !== ApplicationStatus.REJECTED },
                    { label: 'Evaluated', desc: 'Screen approval', active: selectedApplicant.status === ApplicationStatus.EVALUATED || selectedApplicant.status === ApplicationStatus.PENDING_TRAINING || selectedApplicant.status === ApplicationStatus.ENROLLED },
                    { label: 'Tuition Paid', desc: 'Receipt uploaded', active: selectedApplicant.status === ApplicationStatus.PENDING_TRAINING || selectedApplicant.status === ApplicationStatus.ENROLLED },
                    { label: 'Enrolled', desc: 'Access classroom', active: selectedApplicant.status === ApplicationStatus.ENROLLED }
                  ].map((step, idx) => (
                    <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border shrink-0 ${
                        step.active 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold leading-tight ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin notes message Board */}
              <div className="bg-blue-50 border border-blue-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h4 className="font-black text-blue-900 text-sm uppercase tracking-wide mb-3">Administrator Comments</h4>
                <div className="bg-white border border-blue-100 rounded-2xl p-4 text-slate-700 text-sm font-semibold leading-relaxed shadow-inner">
                  {selectedApplicant.adminNotes}
                </div>
                
                {/* Specific actions if REG_CONFIRMED */}
                {selectedApplicant.status === ApplicationStatus.REG_CONFIRMED && (
                  <div className="mt-5 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-blue-100 pt-5">
                    <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                      Please proceed to message us on WhatsApp with your Application ID to schedule your quick evaluation chat:
                    </p>
                    <a
                      href={stats.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md w-full sm:w-auto text-center justify-center shrink-0"
                    >
                      <span>Start WhatsApp Evaluation</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* ACTION: UPLOAD TUITION SCREENSHOT (If status is EVALUATED) */}
              {selectedApplicant.status === ApplicationStatus.EVALUATED && (
                <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 shadow-md">
                  <div className="mb-6 border-b border-slate-100 pb-5">
                    <span className="bg-purple-100 text-purple-800 font-black text-[10px] px-3 py-1 rounded-full uppercase border border-purple-200">
                      TUITION ACTION REQUIRED
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
                      Settle Tuition Fee (Phase {selectedApplicant.phaseNum})
                    </h4>
                    <p className="text-slate-500 text-sm mt-1 font-semibold leading-relaxed">
                      Congratulations on passing your evaluation! To lock in your Masterclass enrollment, transfer the tuition fee to Elijah's PalmPay account and upload your receipt below.
                    </p>
                  </div>

                  {/* Bank Details Container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950 text-white rounded-2xl p-5 mb-6 border border-slate-800">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Beneficiary Bank</span>
                      <span className="text-sm font-extrabold text-blue-300">PALMPAY</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Account Name</span>
                      <span className="text-sm font-extrabold text-white">ELIJAH ADEYINKA</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">PalmPay Account Number</span>
                      <span className="text-xl font-black text-blue-400 tracking-wider">916 315 2202</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Tuition Settle Price</span>
                      <span className="text-xl font-black text-white">₦{expectedTuition.toLocaleString()} Naira</span>
                    </div>
                  </div>

                  {/* Upload Form */}
                  {submitSuccess ? (
                    <div className="text-center py-6 animate-fadeIn">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h5 className="font-extrabold text-slate-900 text-base">Receipt Uploaded Successfully!</h5>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-semibold">
                        We have logged your receipt submission. Admins will confirm your enrollment within 12 hours. Check back here or in your student portal.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleTrainingReceiptSubmit} className="flex flex-col gap-4">
                      
                      {/* Drag & drop screenshot */}
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center relative min-h-[160px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {trainingReceipt ? (
                          <div className="flex items-center gap-3 text-left relative z-20">
                            <img src={trainingReceipt} alt="Receipt preview" className="w-14 h-14 rounded-lg object-cover shadow border border-slate-200 shrink-0" />
                            <div>
                              <span className="block text-sm font-black text-slate-800 line-clamp-1">{uploadedFileName}</span>
                              <span className="block text-[10px] text-blue-600 font-bold mt-0.5">Change receipt screenshot</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 relative z-20">
                            <Upload className="w-8 h-8 text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">Select transaction receipt image</span>
                            <span className="text-[9px] text-slate-400 font-semibold">PNG or JPG transfer logs</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={generateDummyReceipt}
                        className="mx-auto bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                        <span>Use Simulated Screenshot (Fast Testing)</span>
                      </button>

                      {errorMsg && (
                        <p className="text-red-500 text-xs font-black">{errorMsg}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        id="tuition-receipt-submit-btn"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-55"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Submitting Tuition Receipt...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Tuition Screenshot (₦{expectedTuition.toLocaleString()})</span>
                          </>
                        )}
                      </button>

                    </form>
                  )}
                </div>
              )}

              {/* ACTION: ACCESS STUDENT PORTAL (If status is ENROLLED) */}
              {selectedApplicant.status === ApplicationStatus.ENROLLED && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-md">
                  <h4 className="text-xl font-black">You are Fully Enrolled! ✓</h4>
                  <p className="text-emerald-100 text-sm mt-1 font-semibold leading-relaxed">
                    Welcome to the King Elidex AI Video Editing Masterclass 2026. Your enrollment is fully confirmed. You have absolute access to our in-site Classroom Portal, recordings, and template guides!
                  </p>
                  
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={onNavigateToPortal}
                      id="status-go-to-classroom-btn"
                      className="w-full sm:w-auto bg-white hover:bg-slate-100 text-emerald-800 font-black px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-sm"
                    >
                      <Lock className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Enter Student Classroom Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href={stats.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto text-white text-xs font-bold hover:underline py-3.5 text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Join WhatsApp Student Hub</span>
                    </a>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* NOT FOUND VIEW */
            <div className="bg-white border border-slate-150 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Application Profile Not Found</h3>
              <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed font-semibold">
                We couldn't locate any student queue profiles matching <strong>"{searchEmail}"</strong>. Make sure you entered the correct email address.
              </p>
              
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchEmail('');
                    setSearched(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Clear search
                </button>
                <button
                  onClick={() => window.location.hash = '#/'}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
                >
                  Register Now (₦1,000)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
