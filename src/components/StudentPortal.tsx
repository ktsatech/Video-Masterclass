import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus } from '../types';
import { LogIn, LogOut, Play, BookOpen, Download, Cpu, Award, ExternalLink, RefreshCw, AlertCircle, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function StudentPortal() {
  const { applicants, lessons, currentStudent, loginStudent, logoutStudent, uploadTrainingFeeReceipt, stats } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password is phone number
  const [errorMsg, setErrorMsg] = useState('');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Settle tuition upload states (if evaluated but not yet enrolled, they can settle inside the portal too)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

          {/* Quick Sandbox Guide Box */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6 text-slate-500 text-[10px] leading-relaxed">
            💡 <strong>Sandbox Credentials to test:</strong>
            <br />
            - <strong>Fully Enrolled Student:</strong> Email: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600">kassy.ade@gmail.com</code> / Phone: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600">08166554433</code>
            <br />- <strong>Awaiting Tuition Student:</strong> Email: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600">chioma.n@gmail.com</code> / Phone: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600">07087654321</code>
          </div>
        </div>
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
                      <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50 relative">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Classroom Video Player Panel (Left 8 Columns) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                
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
                    Masterclass Sessions
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
          )}

        </div>
      )}

    </div>
  );
}
