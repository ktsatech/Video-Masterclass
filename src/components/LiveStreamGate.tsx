import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, Lock, Video, ShieldCheck, AlertCircle, Copy, Check, 
  Upload, ArrowRight, Sparkles, CheckCircle2, RefreshCw, HelpCircle, Phone
} from 'lucide-react';

export default function LiveStreamGate() {
  const { 
    liveStream, applicants, stats, currentStudent, loginStudent, logoutStudent, signupStreamTicket 
  } = useApp();

  // Navigation / Tab inside Gate
  // 'gate': default tap-to-watch screen
  // 'player': live streaming active room
  // 'payment': ticket purchase checkouts
  // 'pending': waiting for admin verification of receipt
  const [viewState, setViewState] = useState<'gate' | 'player' | 'payment' | 'pending'>('gate');
  
  // Form states for login/verification
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Form states for stream pass purchase
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketReceipt, setTicketReceipt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Copy clip state
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-redirect if student already logged in and matches conditions
  useEffect(() => {
    if (currentStudent) {
      if (currentStudent.status === 'enrolled') {
        // If enrolled student is viewing, let them pass
        // However, if stream is offline, they stay on player with "ready soon" message
        // This is exactly the user intent!
        setViewState('player');
      } else if (currentStudent.status === 'pending_training') {
        // Stream pass upload pending verification
        setViewState('pending');
      }
    }
  }, [currentStudent]);

  // Handle main "TAP TO WATCH VIDEO" trigger
  const handleTapToWatch = () => {
    setErrorMsg('');
    if (currentStudent) {
      if (currentStudent.status === 'enrolled') {
        setViewState('player');
      } else if (currentStudent.status === 'pending_training') {
        setViewState('pending');
      } else {
        setViewState('payment');
      }
    } else {
      // Prompt for email login/verification
      setIsVerifying(true);
    }
  };

  // Verify entered email to check if student meets conditions
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) return;

    // Find applicant
    const student = applicants.find(a => a.email.toLowerCase().trim() === trimmedEmail);

    if (student) {
      if (student.status === 'enrolled') {
        // Log them in
        const loggedIn = loginStudent(student.email, student.phone);
        if (loggedIn) {
          setSuccessMsg('✓ Access Verified! Welcome back, general.');
          setTimeout(() => {
            setViewState('player');
            setIsVerifying(false);
          }, 1200);
        } else {
          setErrorMsg('Authentication failed. Please verify credentials.');
        }
      } else if (student.status === 'pending_training') {
        // They have uploaded a receipt but are waiting
        loginStudent(student.email, student.phone);
        setViewState('pending');
        setIsVerifying(false);
      } else {
        // Found but not approved or paid yet, direct to payment
        setErrorMsg('Your registration is verified but training tuition has not been approved yet.');
        setTimeout(() => {
          setViewState('payment');
          setTicketEmail(student.email);
          setTicketName(student.name);
          setTicketPhone(student.phone);
          setIsVerifying(false);
        }, 1500);
      }
    } else {
      // Email not found in database, direct to payment to buy 1k stream ticket
      setErrorMsg('No active student profile found. Redirecting you to checkout to buy a live ticket...');
      setTimeout(() => {
        setViewState('payment');
        setTicketEmail(trimmedEmail);
        setIsVerifying(false);
      }, 1800);
    }
  };

  // Purchase live stream ticket
  const handlePurchaseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReceipt) {
      alert('Please upload your PalmPay transaction screenshot to verify your payment.');
      return;
    }

    const res = signupStreamTicket({
      name: ticketName.trim(),
      email: ticketEmail.trim().toLowerCase(),
      phone: ticketPhone.trim(),
      receiptUrl: ticketReceipt
    });

    if (res.success) {
      // Automatically log student in so we track them as pending
      setTimeout(() => {
        loginStudent(ticketEmail.trim(), ticketPhone.trim());
        setViewState('pending');
      }, 500);
    } else {
      alert(res.error || 'Registration failed.');
    }
  };

  // File Upload Helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0].name);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0].name);
    }
  };

  const simulateUpload = (fileName: string) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTicketReceipt(`https://storage.googleapis.com/king-elidex-receipts/${Date.now()}_${fileName}`);
    }, 1500);
  };

  const copySecureLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-[80vh] bg-slate-950 text-white py-12 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center items-center">
      
      {/* Visual background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-4xl relative z-10">

        {/* 1. VIEWSTATE: GATE (DEFAULT TAP-TO-WATCH SCREEN) */}
        {viewState === 'gate' && (
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
            
            {/* Pulsing secure live indicator */}
            <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-500/20 text-blue-300 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>SECURE BROADCAST PORTAL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white mt-2">
              King Elidex Studio <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Private Live Stream
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base font-semibold leading-relaxed max-w-lg">
              Unlock access to the restricted classroom live stream. Authenticated generals and paid pass-holders can stream direct training.
            </p>

            {/* Tap-To-Watch Giant Interactive Card */}
            <div 
              onClick={handleTapToWatch}
              className="mt-6 bg-slate-900 border border-slate-850 hover:border-blue-500/40 rounded-3xl p-8 sm:p-12 w-full max-w-md shadow-2xl hover:shadow-blue-950/20 cursor-pointer transition-all duration-500 transform hover:-translate-y-1.5 group relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-colors" />
              
              {/* Central play trigger button */}
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/40 relative group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-500">
                <span className="absolute inset-0 rounded-full bg-blue-600/40 animate-ping group-hover:bg-blue-500/40" />
                <Play className="w-8 h-8 text-white fill-current translate-x-0.5" />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Tap to Watch Video Stream</h3>
              <p className="text-slate-400 text-xs mt-2 font-semibold leading-normal max-w-xs mx-auto">
                Authenticate your student profile and initiate direct live video stream feed from King Elidex's studio.
              </p>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Encrypted Connection Gate</span>
              </div>
            </div>

            {/* Email verification inline dialog */}
            {isVerifying && (
              <div className="mt-6 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl animate-scaleIn text-left">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Verification Required</h4>
                  <button 
                    onClick={() => setIsVerifying(false)}
                    className="text-slate-400 hover:text-white text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleVerifyEmail} className="flex flex-col gap-3">
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Provide the email address you used during course registration to unlock direct studio stream access.
                  </p>
                  
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter registered email address..."
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-semibold text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      required
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                      {successMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    <span>Verify Access & Open Stream</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* General Help info link */}
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1 mt-4">
              <span>Have problems accessing the room?</span>
              <a href={stats.whatsappLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-bold">Contact Support</a>
            </div>

          </div>
        )}

        {/* 2. VIEWSTATE: PLAYER (IF ENROLLED, ACCESS APPROVED) */}
        {viewState === 'player' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn text-left">
            
            {/* Left 8 columns: Player & stream metadata */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Back to entry button */}
              <button 
                onClick={() => setViewState('gate')}
                className="self-start text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg"
              >
                ← Return to Gate
              </button>

              {/* Secure live stream embed wrapper */}
              <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-2xl border border-slate-800 group">
                {liveStream.status !== 'offline' ? (
                  <iframe
                    src={liveStream.embedUrl}
                    title={liveStream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  /* THE NOT ONGOING SCREEN: "Video stream will appear here when ready" */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 animate-pulse">
                      <Video className="w-7 h-7 text-slate-500" />
                    </div>
                    
                    <h3 className="font-black text-white text-lg tracking-tight">
                      Video Will Appear Here When Ready
                    </h3>
                    
                    <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed font-semibold">
                      The live broadcast stream is currently in setup mode or offline. As soon as King Elidex goes live from the studio, the player will start playing immediately. Keep this screen open!
                    </p>

                    <div className="mt-5 flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>Ready & Polled to Sync Live Feed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stream Title and Info */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-[10px] px-2.5 py-1 rounded-full uppercase ${
                        liveStream.status === 'live' ? 'bg-red-950 text-red-400 border border-red-500/20' : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                      }`}>
                        {liveStream.status === 'live' ? 'LIVE BROADCAST 🔴' : 'REPLAY ARCHIVE 🎬'}
                      </span>
                      <span className="bg-slate-800 text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-700">
                        Classroom Stream
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">{liveStream.title}</h2>
                  </div>
                  
                  <span className="text-slate-400 text-xs font-bold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Room Connection Active
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-sm font-semibold">
                  {liveStream.description}
                </p>

                {/* Secure Access Credentials details */}
                <div className="mt-6 p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Your Authorized Access Token</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-400 mt-1">
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[9px] uppercase text-slate-500 block">Student Identity</span>
                      <span className="text-slate-200 block mt-0.5 font-black">{currentStudent?.name || 'Authorized Guest'}</span>
                    </div>
                    <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[9px] uppercase text-slate-500 block">Pass Level</span>
                      <span className="text-slate-200 block mt-0.5 font-black">
                        {currentStudent?.isStreamTicketOnly ? '₦1,000 Live Stream Only Pass' : 'Full Masterclass General Admission'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right 4 columns: Interactive Sidebar, downloads */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Live room materials widget */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 shadow-sm">
                <h4 className="font-black text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Interactive Materials</span>
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  During live training broadcasts, King Elidex will push system prompts, asset links, and scripts directly to this sidebar.
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-blue-950/40 border border-blue-900/30 text-center">
                  <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-2.5 text-blue-400 border border-blue-500/15">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-blue-300 block">Class Swipe Files & Assets</span>
                  <p className="text-[10px] text-blue-400 leading-normal mt-1 font-semibold">
                    The prompt pack will become downloadable as soon as Elijah goes live in the broadcast!
                  </p>
                </div>

                <button
                  onClick={() => alert('Resources will be updated dynamically during the live broadcast.')}
                  className="w-full mt-3 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-800"
                >
                  Check Broadcast Files
                </button>
              </div>

              {/* Secure link copy widget */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 text-white">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 mb-2">Classroom Policy</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed font-semibold mb-4">
                  Sharing stream URLs or attempting to record lessons is strictly prohibited. Security monitors flag multiple IP accesses.
                </p>
                
                <button
                  onClick={copySecureLink}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-slate-300 font-extrabold py-2.5 rounded-xl text-xs transition-colors border border-slate-800 flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>URL Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-blue-500" />
                      <span>Copy Secure Classroom Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Support Assistance */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md">
                <h4 className="font-extrabold text-sm uppercase tracking-wider leading-none mb-2">Live Stream Support</h4>
                <p className="text-emerald-100 text-[11px] leading-relaxed font-semibold mb-4">
                  Experiencing lagging video or sound buffering? Reach out directly on WhatsApp to speak to Elijah.
                </p>

                <a
                  href={stats.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-white hover:bg-slate-100 text-emerald-950 font-black py-2.5 rounded-xl text-center text-xs shadow-md transition-colors flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                  <span>Message Elijah on WhatsApp</span>
                </a>
              </div>

            </div>

          </div>
        )}

        {/* 3. VIEWSTATE: PAYMENT (REDIRECTED IF CONDITIONS UNMET) */}
        {viewState === 'payment' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-10 shadow-2xl animate-scaleIn text-left">
            
            {/* Header info about the gate lock */}
            <div className="flex items-start gap-4 mb-6 pb-5 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Access Locked: Live Stream Ticket Required</h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5 leading-relaxed">
                  No active enrolled student profile was found for your email. You can instantly buy a Live Stream Pass below for only <strong>₦1,000 Naira</strong> to watch the entire training live!
                </p>
              </div>
            </div>

            {/* Step-by-Step Payment Instructions */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 mb-6">
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                TRANSFER PROCEDURES
              </span>
              <h4 className="text-sm font-black text-white uppercase tracking-wider mb-3">
                Send ₦1,000 To PalmPay Account
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">PalmPay Account</span>
                  <span className="text-white text-sm font-black mt-0.5 block">9163152202</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">Account Name</span>
                  <span className="text-white text-sm font-black mt-0.5 block">Elijah Adeyinka</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                  <span className="text-[9px] text-slate-500 block uppercase">Amount Due</span>
                  <span className="text-emerald-400 text-sm font-black mt-0.5 block">₦1,000 Naira</span>
                </div>
              </div>

              <p className="text-[10px] text-amber-400 mt-3 font-semibold leading-relaxed">
                ⚠️ <strong>Important:</strong> After sending the ₦1,000, screenshot your successful transaction slip and upload it below. It is instantly verified by the admins to activate your stream pass.
              </p>
            </div>

            {/* Purchase Ticket Form with Drag & Drop Uploader */}
            <form onSubmit={handlePurchaseTicket} className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    placeholder="e.g., Joshua Audu"
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-semibold text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-700"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    placeholder="e.g. 09163152202"
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-semibold text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-semibold text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-700"
                  required
                />
              </div>

              {/* Drag and Drop Screenshot Uploader */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Transaction Receipt Screenshot</label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : ticketReceipt 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="receipt-file-uploader"
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="text-xs text-slate-300 font-bold">Uploading transfer slip to server...</span>
                    </div>
                  ) : ticketReceipt ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs text-emerald-400 font-black">Screenshot Uploaded Successfully!</span>
                      <p className="text-[10px] text-slate-400 font-semibold max-w-xs leading-normal truncate">
                        {ticketReceipt}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5 py-4">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-200">Drag & drop receipt or click to select</span>
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal max-w-xs">
                        Supports JPEG, PNG, or mobile screenshots from your bank app.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions buttons */}
              <div className="flex items-center justify-between gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setViewState('gate')}
                  className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-white font-extrabold px-5 py-3 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-6 py-3.5 rounded-xl text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-1"
                >
                  <span>Activate Stream Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        )}

        {/* 4. VIEWSTATE: PENDING (APPROVED IN DB BUT WAITING ON RECEIPT) */}
        {viewState === 'pending' && (
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6 bg-slate-900 border border-slate-850 rounded-3xl p-8 sm:p-10 shadow-2xl animate-scaleIn">
            
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-bounce">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Receipt Verification Ongoing</h2>
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-semibold">
              Elijah Adeyinka and the administrative team are verifying your PalmPay ₦1,000 transfer receipt right now.
            </p>

            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 w-full text-left flex flex-col gap-2">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">REGISTRATION MATRIX</span>
              
              <div className="text-xs font-bold text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-900">
                  <span className="text-slate-500">Receipt Owner:</span>
                  <span>{currentStudent?.name || ticketName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-900">
                  <span className="text-slate-500">Registered Email:</span>
                  <span>{currentStudent?.email || ticketEmail}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Access Status:</span>
                  <span className="text-amber-400">Reviewing Transfer 📁</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold max-w-xs">
              💡 <strong>Instant Refresh:</strong> As soon as an admin approves your screenshot in the dashboard, this screen will automatically unlock to the Live Room player! Keep this tab open.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setViewState('gate')}
                className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Return Home
              </button>
              
              <button
                onClick={() => {
                  alert('State refreshed. Waiting for admin approval.');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-semibold mt-2">
              Experiencing delays?{' '}
              <a href={stats.whatsappLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Message Elijah on WhatsApp</a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
