import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus } from '../types';
import { LogIn, LogOut, Play, BookOpen, Download, Cpu, Award, ExternalLink, RefreshCw, AlertCircle, Sparkles, FileText, CheckCircle2, Ticket, Video, ArrowLeft, Upload, Camera } from 'lucide-react';

export default function StudentPortal() {
  const { applicants, lessons, currentStudent, loginStudent, logoutStudent, uploadTrainingFeeReceipt, stats, liveStream, signupStreamTicket } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password is phone number
  const [errorMsg, setErrorMsg] = useState('');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'live'>('modules');

  // Settle tuition upload states (if evaluated but not yet enrolled, they can settle inside the portal too)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Live Stream ticket purchase states
  const [showStreamPurchaseForm, setShowStreamPurchaseForm] = useState(false);
  const [streamName, setStreamName] = useState('');
  const [streamEmail, setStreamEmail] = useState('');
  const [streamPhone, setStreamPhone] = useState('');
  const [streamReceiptUrl, setStreamReceiptUrl] = useState<string | null>(null);
  const [streamFileName, setStreamFileName] = useState('');
  const [streamIsSubmitting, setStreamIsSubmitting] = useState(false);
  const [streamSuccess, setStreamSuccess] = useState(false);
  const [streamError, setStreamError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setUploadSuccess(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your registered email and phone number.');
      return;
    }

    const success = loginStudent(email.trim(), password.trim());
    if (!success) {
      setErrorMsg('Invalid login credentials. Double check your email and phone number.');
    }
  };

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
    setUploadedFileName('Palmpay_Portal_Receipt.png');
    setReceiptUrl('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60');
  };

  const handleSettleTuition = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentStudent || !receiptUrl) {
      setErrorMsg('Please upload a screenshot of your PalmPay tuition transaction receipt.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = uploadTrainingFeeReceipt(currentStudent.id, receiptUrl);
      setIsSubmitting(false);
      if (success) {
        setUploadSuccess(true);
      } else {
        setErrorMsg('Submission failed.');
      }
    }, 1200);
  };

  const handleStreamFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStreamFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStreamReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDummyStreamReceipt = () => {
    setStreamFileName('PalmPay_StreamPass_Receipt.png');
    setStreamReceiptUrl('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60');
  };

  const handleStreamPurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamError('');

    if (!streamName.trim() || !streamEmail.trim() || !streamPhone.trim() || !streamReceiptUrl) {
      setStreamError('Please fill out all fields and upload your transaction receipt screenshot.');
      return;
    }

    setStreamIsSubmitting(true);

    setTimeout(() => {
      const res = signupStreamTicket({
        name: streamName.trim(),
        email: streamEmail.trim(),
        phone: streamPhone.trim(),
        receiptUrl: streamReceiptUrl
      });
      setStreamIsSubmitting(false);
      if (res.success) {
        setStreamSuccess(true);
      } else {
        setStreamError(res.error || 'Registration failed.');
      }
    }, 1200);
  };

  // Sync default tab if stream-only ticket holder
  React.useEffect(() => {
    if (currentStudent) {
      if (currentStudent.isStreamTicketOnly) {
        setActiveTab('live');
      } else {
        setActiveTab('modules');
      }
    }
  }, [currentStudent]);

  // Extract active video
  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  // Set default active lesson on login
  React.useEffect(() => {
    if (currentStudent && currentStudent.status === ApplicationStatus.ENROLLED && lessons.length > 0) {
      setActiveLessonId(lessons[0].id);
    }
  }, [currentStudent, lessons]);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* NOT LOGGED IN VIEW */}
      {!currentStudent ? (
        showStreamPurchaseForm ? (
          <div className="max-w-md mx-auto bg-white border border-slate-150 rounded-3xl p-8 shadow-lg my-12 animate-fadeIn">
            {streamSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Stream Ticket Submitted!</h3>
                <p className="text-slate-600 text-xs mt-2 font-semibold leading-relaxed">
                  Thank you! Your <strong>₦1,000 Live Stream Pass</strong> payment receipt has been submitted for verification.
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 my-5 text-left text-[11px] leading-relaxed text-slate-500 font-semibold">
                  💡 <strong>What happens next:</strong>
                  <ol className="list-decimal pl-4 mt-2 flex flex-col gap-1">
                    <li>Our admins will verify your PalmPay transaction receipt.</li>
                    <li>Once approved, you will receive an automatic email notification.</li>
                    <li>You can then log in on this portal using your email and phone number to access the <strong>🔴 Live Streaming Room</strong>!</li>
                  </ol>
                </div>
                <button
                  onClick={() => {
                    setShowStreamPurchaseForm(false);
                    setStreamSuccess(false);
                    setStreamName('');
                    setStreamEmail('');
                    setStreamPhone('');
                    setStreamReceiptUrl(null);
                    setStreamFileName('');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs"
                >
                  Return to Student Login
                </button>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setShowStreamPurchaseForm(false);
                    setStreamError('');
                  }}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-[11px] font-bold mb-4 uppercase transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 text-red-500 rounded-full mb-3 border border-red-100">
                    <Video className="w-5 h-5 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Buy Live Stream Pass</h3>
                  <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
                    Gain exclusive access to the live editing stream and its full replay inside this portal for only <strong>₦1,000 Naira</strong>!
                  </p>
                </div>

                {/* PalmPay info box */}
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 text-xs mb-5 border border-slate-850 font-semibold">
                  <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wide mb-1">Make Payment To:</div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>Bank Name: <span className="text-blue-300 font-bold block">PALMPAY</span></div>
                    <div>Account Name: <span className="text-white font-bold block">ELIJAH ADEYINKA</span></div>
                    <div className="col-span-2">Account Number: <span className="text-blue-400 font-black text-sm tracking-wider block font-mono">916 315 2202</span></div>
                    <div className="col-span-2 text-slate-400 text-[9px] mt-1 border-t border-slate-800 pt-1.5">Amount: ₦1,000 (Live Stream Pass)</div>
                  </div>
                </div>

                <form onSubmit={handleStreamPurchaseSubmit} className="flex flex-col gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Your Full Name</label>
                    <input
                      type="text"
                      value={streamName}
                      onChange={(e) => setStreamName(e.target.value)}
                      placeholder="e.g. Samuel Okafor"
                      className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Your Email Address</label>
                    <input
                      type="email"
                      value={streamEmail}
                      onChange={(e) => setStreamEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Your Phone Number</label>
                    <input
                      type="tel"
                      value={streamPhone}
                      onChange={(e) => setStreamPhone(e.target.value)}
                      placeholder="08123456789"
                      className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  {/* Screenshot Uploader Box */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Upload PalmPay Receipt Screenshot</label>
                    <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50 relative hover:bg-slate-100/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStreamFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {streamReceiptUrl ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="line-clamp-1">{streamFileName}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-500 font-semibold">Select Payment Receipt Screenshot</span>
                        </div>
                      )}
                    </div>
                    
                    {!streamReceiptUrl && (
                      <button
                        type="button"
                        onClick={generateDummyStreamReceipt}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold self-start mt-1 flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Use Mock Transaction Receipt</span>
                      </button>
                    )}
                  </div>

                  {streamError && (
                    <p className="text-red-500 text-xs font-black">{streamError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={streamIsSubmitting}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-red-150 transition-colors disabled:opacity-50 mt-2"
                  >
                    <span>{streamIsSubmitting ? 'Submitting Receipt...' : 'Submit Receipt & Buy Pass'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white border border-slate-150 rounded-3xl p-8 shadow-lg my-12 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-full mb-3 border border-blue-100">
                <LogIn className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Classroom Sign In</h3>
              <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">
                Log in with your registered credentials. Enter your registered **Email** and use your registered **Phone Number** as the password.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Registered Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Phone/Password */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Password (Registered Phone Number)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="08123456789"
                  className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-red-500 text-xs font-black">{errorMsg}</p>
              )}

              <button
                type="submit"
                id="student-login-submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-150 transition-colors"
              >
                <span>Verify & Enter Classroom</span>
              </button>
            </form>

            <div className="border-t border-slate-100 pt-5 mt-5 flex flex-col gap-3">
              <div className="text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Only want to watch the live stream?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowStreamPurchaseForm(true)}
                className="w-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5 text-blue-400" />
                <span>Get ₦1,000 Live Stream Pass</span>
              </button>
            </div>

            {/* Quick Sandbox Guide Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6 text-slate-500 text-[10px] leading-relaxed">
              💡 <strong>Sandbox Credentials to test:</strong>
              <br />
              - <strong>Fully Enrolled Student:</strong> Email: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-mono">kassy.ade@gmail.com</code> / Phone: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-mono">08166554433</code>
              <br />- <strong>Awaiting Tuition Student:</strong> Email: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-mono">chioma.n@gmail.com</code> / Phone: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-mono">07087654321</code>
            </div>
          </div>
        )
      ) : (
        /* LOGGED IN VIEW */
        <div className="animate-fadeIn">
          
          {/* Header Portal Profile Info Panel */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md mb-8 border border-blue-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.1),transparent_40%)]" />
            
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-[10px] font-black tracking-widest text-blue-400 font-mono">STUDENT PORTAL TERMINAL</span>
              <h2 className="text-2xl font-black text-white tracking-tight">Welcome, {currentStudent.name}!</h2>
              <p className="text-slate-400 text-xs font-medium">Cohort Status: 
                <span className={`ml-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  currentStudent.status === ApplicationStatus.ENROLLED ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {currentStudent.status === ApplicationStatus.ENROLLED ? 'Verified Student ✓' : 'Awaiting Settle Payment'}
                </span>
              </p>
            </div>

            <button
              onClick={logoutStudent}
              id="student-logout-button"
              className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-800 transition-colors shrink-0 relative z-10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* ACCESS GATE: If status is NOT Enrolled */}
          {currentStudent.status !== ApplicationStatus.ENROLLED ? (
            <div className="max-w-2xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 sm:p-10 shadow-lg text-center my-8">
              
              <div className="w-14 h-14 bg-amber-50 text-amber-500 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertCircle className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Classroom Access Pending</h3>
              
              <div className="bg-amber-50 border border-amber-150 rounded-2xl p-4 text-xs text-amber-800 font-semibold leading-relaxed my-5 max-w-md mx-auto text-left">
                Your registration has been verified, but your <strong>₦5,000 (Phase 1) or ₦10,000 (Phase 2) Masterclass tuition fee</strong> must be approved before classroom materials unlock.
                <br />
                <br />
                <strong>Current Status:</strong> {currentStudent.status === ApplicationStatus.PENDING_TRAINING ? 'Awaiting Receipt Verification' : 'Awaiting Tuition Payment'}
              </div>

              {/* Upload Form (If evaluated but not yet paid) */}
              {currentStudent.status === ApplicationStatus.EVALUATED && (
                <div className="border-t border-slate-150 pt-6 mt-6 text-left">
                  <h4 className="font-extrabold text-slate-900 text-base mb-2">Settle Tuition Fee Directly Below:</h4>
                  
                  {/* PalmPay info box */}
                  <div className="bg-slate-950 text-white rounded-2xl p-4 text-xs mb-4 grid grid-cols-2 gap-3 border border-slate-800 font-semibold">
                    <div>Bank Name: <span className="text-blue-300 font-bold block">PALMPAY</span></div>
                    <div>Account Name: <span className="text-white font-bold block">ELIJAH ADEYINKA</span></div>
                    <div className="col-span-2">Account Number: <span className="text-blue-400 font-black text-base tracking-wider block">916 315 2202</span></div>
                    <div className="col-span-2 text-slate-400 text-[10px]">Expected Amount: ₦{(currentStudent.phaseNum === 1 ? 5000 : 10000).toLocaleString()} (Phase {currentStudent.phaseNum})</div>
                  </div>

                  {uploadSuccess ? (
                    <div className="text-center py-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h5 className="font-extrabold text-emerald-900 text-sm">Receipt Uploaded!</h5>
                      <p className="text-[10px] text-emerald-700 mt-0.5">Payment received. Admins will confirm your classroom access shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSettleTuition} className="flex flex-col gap-3">
                      <div className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {receiptUrl ? (
                          <span className="text-xs font-black text-slate-800 line-clamp-1">{uploadedFileName}</span>
                        ) : (
                          <span className="text-xs text-slate-500 font-bold">Upload PalmPay Receipt Screenshot</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={generateDummyReceipt}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] px-3 py-2 rounded-lg border border-slate-200"
                        >
                          Use Mock Image
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          id="portal-tuition-submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                        >
                          {isSubmitting ? 'Uploading...' : 'Submit Tuition Screenshot'}
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}

              {/* Informative advice if awaiting reg verification */}
              {currentStudent.status === ApplicationStatus.PENDING_REG && (
                <p className="text-xs text-slate-400 mt-2 font-semibold">
                  *Our team is currently verifying your ₦1,000 registration fee. Once verified, we will message you to schedule your evaluation chat.
                </p>
              )}

            </div>
          ) : (
            /* ACTIVE STUDENT CLASSROOM DASHBOARD */
            <div className="flex flex-col gap-6">
              
              {/* Tab Bar - Only show if student is NOT a stream-ticket-only holder */}
              {!currentStudent.isStreamTicketOnly && (
                <div className="flex border-b border-slate-200 gap-2 mb-2">
                  <button
                    onClick={() => setActiveTab('modules')}
                    className={`py-3 px-5 font-black text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'modules'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Classroom Modules</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('live')}
                    className={`py-3 px-5 font-black text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'live'
                        ? 'border-red-500 text-red-500'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span>Live Streaming Room</span>
                  </button>
                </div>
              )}

              {activeTab === 'modules' && !currentStudent.isStreamTicketOnly ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Classroom Video Player Panel (Left 8 Columns) */}
                  <div className="lg:col-span-8 flex flex-col gap-5 animate-fadeIn">
                    
                    {/* Embed YouTube Player Wrapper */}
                    <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-lg group border border-slate-900">
                      <iframe
                        src={activeLesson.youtubeUrl}
                        title={activeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>

                    {/* Video Info Card */}
                    <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <span className="bg-blue-100 text-blue-700 font-black text-[10px] px-2.5 py-1 rounded-full uppercase">
                            {activeLesson.isLive ? 'LIVE TRAINING STREAM' : 'PAST LESSON ARCHIVE'}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">{activeLesson.title}</h3>
                        </div>
                        <span className="text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
                          Duration: {activeLesson.duration}
                        </span>
                      </div>

                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-semibold">
                        {activeLesson.description}
                      </p>

                      {/* Active Lesson Resources */}
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mt-6 mb-3">
                        Assigned Downloadables & Guides
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeLesson.resources.map((res, index) => (
                          <a
                            key={index}
                            href="#"
                            onClick={(e) => { e.preventDefault(); alert('Downloading asset: ' + res.title); }}
                            className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl p-3.5 hover:bg-blue-50/50 hover:border-blue-150 transition-colors group"
                          >
                            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                              <Download className="w-4 h-4 text-blue-500 shrink-0" />
                              <span>{res.title}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </a>
                        ))}
                      </div>

                    </div>

                  </div>

                  {/* Course Outline & Resource widgets (Right 4 Columns) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Classroom Schedule selection */}
                    <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
                      <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Masterclass Sessions</span>
                      </h4>

                      <div className="flex flex-col gap-2">
                        {lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group ${
                              activeLesson.id === lesson.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                               : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                activeLesson.id === lesson.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[9px] font-bold uppercase opacity-80 leading-none">
                                  {lesson.isLive ? 'Upcoming Live' : 'Recorded Replay'}
                                </span>
                                <span className="text-xs font-black line-clamp-1 mt-1">{lesson.title.split(':')[1] || lesson.title}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Online Verifiable Certificate Center */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden border border-blue-800">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                      
                      <div className="flex items-center gap-2.5 mb-4">
                        <Award className="w-6 h-6 shrink-0 text-blue-300" />
                        <h4 className="font-black text-base tracking-tight leading-none">Graduation Certificate</h4>
                      </div>
                      
                      <p className="text-blue-100 text-xs font-medium leading-relaxed mb-5">
                        Complete all weekly assignments and present your final editing video before July 30th to unlock your printable, high-resolution credential.
                      </p>

                      <button
                        onClick={() => alert('Certificate will unlock automatically after successful evaluation of your portfolio on July 30, 2026!')}
                        className="w-full bg-white hover:bg-slate-100 text-blue-900 font-extrabold py-3 rounded-xl text-center text-xs shadow-md transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Download Certificate</span>
                      </button>
                    </div>

                    {/* Extra prompt files widget */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white">
                      <div className="flex items-center gap-2.5 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                        <h4 className="font-black text-sm uppercase tracking-wider">Prompt Swipe Pack</h4>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mb-4 font-semibold">
                        Get instant access to King Elidex's custom system prompt parameters for high-converting scripts and Cinematic imagery.
                      </p>
                      
                      <button
                        onClick={() => alert('Downloading: King_Elidex_CopyPaste_Prompts_2026.zip')}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-800"
                      >
                        Download Prompts (ZIP)
                      </button>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
                  {/* Live Stream Panel */}
                  <div className="lg:col-span-8 flex flex-col gap-5">
                    
                    {/* Stream Player */}
                    <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-lg group border border-slate-900">
                      {liveStream.status !== 'offline' ? (
                        <iframe
                          src={liveStream.embedUrl}
                          title={liveStream.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-400">
                          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                            <span className="relative flex h-4 w-4">
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-slate-700"></span>
                            </span>
                          </div>
                          <h4 className="font-black text-white text-lg tracking-tight">Stream Currently Offline</h4>
                          <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed font-semibold">
                            King Elidex is not actively broadcasting right now. When the stream starts, it will play automatically here. Keep this tab open!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stream Info */}
                    <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-[10px] px-2.5 py-1 rounded-full uppercase ${
                              liveStream.status === 'live' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {liveStream.status === 'live' ? 'LIVE NOW 🔴' : 'REPLAY BROADCAST 🎬'}
                            </span>
                            <span className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded">
                              Protected Stream Link
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">{liveStream.title}</h3>
                        </div>
                        <span className="text-slate-500 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Secure Live Room
                        </span>
                      </div>

                      <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-semibold">
                        {liveStream.description}
                      </p>
                      
                      {/* Anti-sharing notification */}
                      <div className="mt-6 p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start gap-2.5 text-slate-500 text-[11px] leading-relaxed font-semibold">
                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Classroom Stream Policy:</strong> The video above is streamed securely inside the Masterclass room. Sharing links, attempting to extract streams, or screen recording the live session is strictly prohibited and will result in permanent account termination.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Stream Sidebar */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
                      <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-4">
                        Live Session Materials
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        During the live stream, King Elidex will share custom prompts and assets. They will appear here dynamically.
                      </p>
                      <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
                        <Sparkles className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                        <span className="text-[11px] font-black text-blue-900 block">Class Prompts & Presets</span>
                        <p className="text-[10px] text-blue-700 leading-normal mt-1 font-semibold">Ready to download once King Elidex shares them live!</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white">
                      <h4 className="font-black text-sm uppercase tracking-wider mb-2">Support & Feedback</h4>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold mb-4">
                        Experiencing issues with the video or audio quality of the live stream? Reach out to the admin support team immediately.
                      </p>
                      <a
                        href={stats.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Message Support on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
