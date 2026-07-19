import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ApplicationStatus, Applicant, Lesson } from '../types';
import { 
  Users, Landmark, ClipboardList, Shield, LogOut, Search, Filter, 
  Download, Eye, Edit3, Trash2, Plus, Settings, Mail, Bell, Check, 
  CheckCircle, XCircle, AlertTriangle, Play, Calendar, ToggleLeft, ToggleRight, Trash,
  Camera, Mic, MicOff, Copy, Info, Video, Monitor
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    applicants, lessons, stats, notifications, adminUsers, currentAdmin, emailLogs, phaseInfo,
    loginAdmin, logoutAdmin, updateApplicantStatus, addLesson, editLesson, deleteLesson,
    addAdminUser, removeAdminUser, updateStats, clearAllNotifications, markNotificationAsRead,
    liveStream, updateLiveStream
  } = useApp();

  // SECURE PRIVACY SANITIZATION AND EMAIL MASKING (Disabled for authorized administrators)
  const sanitizeText = (text: string) => {
    return text;
  };

  const isStudentEmail = (emailVal: string) => {
    return false;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated password
  const [authError, setAuthError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'applicants' | 'lessons' | 'outbox' | 'settings' | 'stream'>('overview');

  // Live Stream Setup States
  const [streamTitle, setStreamTitle] = useState(liveStream.title);
  const [streamDesc, setStreamDesc] = useState(liveStream.description);
  const [streamEmbed, setStreamEmbed] = useState(liveStream.embedUrl);
  const [streamStatus, setStreamStatus] = useState(liveStream.status);
  const [streamSaveSuccess, setStreamSaveSuccess] = useState(false);

  useEffect(() => {
    setStreamTitle(liveStream.title);
    setStreamDesc(liveStream.description);
    setStreamEmbed(liveStream.embedUrl);
    setStreamStatus(liveStream.status);
  }, [liveStream]);

  // INTERACTIVE BROADCASTER STUDIO STATES
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [micEnabled, setMicEnabled] = useState(false);
  const [showScreenOverlay, setShowScreenOverlay] = useState(true);
  const [copiedStreamKey, setCopiedStreamKey] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up media streams on tab switch or unmount
  useEffect(() => {
    if (activeTab !== 'stream') {
      stopBroadcasting();
    }
  }, [activeTab]);

  const stopBroadcasting = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsBroadcasting(false);
    setAudioLevel(0);
  };

  const startBroadcasting = async () => {
    stopBroadcasting();
    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: cameraFacingMode },
        audio: micEnabled
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      setIsBroadcasting(true);

      // If mic is enabled, set up Audio Analyser
      if (micEnabled) {
        setupAudioAnalyser(stream);
      }
    } catch (err) {
      console.warn('Could not access real camera, running high-fidelity broadcast simulation.', err);
      setIsBroadcasting(true);
      if (micEnabled) {
        simulateMicInput();
      }
    }
  };

  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    if (isBroadcasting) {
      setTimeout(() => {
        constraintsReload(nextMode, micEnabled);
      }, 100);
    }
  };

  const constraintsReload = async (mode: 'user' | 'environment', mic: boolean) => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(t => t.stop());
      }
      
      const constraints = {
        video: { facingMode: mode },
        audio: mic
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (mediaStreamRef.current) {
        const videoTrack = newStream.getVideoTracks()[0];
        mediaStreamRef.current.addTrack(videoTrack);
        
        if (mic) {
          mediaStreamRef.current.getAudioTracks().forEach(t => t.stop());
          const audioTrack = newStream.getAudioTracks()[0];
          mediaStreamRef.current.addTrack(audioTrack);
        }
      } else {
        mediaStreamRef.current = newStream;
      }

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStreamRef.current;
      }
    } catch (err) {
      console.warn('Dynamic track replacement not supported, restarting stream.');
      startBroadcasting();
    }
  };

  const toggleMic = () => {
    const nextMic = !micEnabled;
    setMicEnabled(nextMic);
    if (isBroadcasting) {
      constraintsReload(cameraFacingMode, nextMic);
      if (nextMic) {
        if (mediaStreamRef.current) {
          setupAudioAnalyser(mediaStreamRef.current);
        } else {
          simulateMicInput();
        }
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setAudioLevel(0);
      }
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        simulateMicInput();
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const level = Math.min(100, Math.round((average / 150) * 100));
        setAudioLevel(level);

        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('AudioAnalyser blocked, reverting to simulation.', err);
      simulateMicInput();
    }
  };

  const simulateMicInput = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const sim = () => {
      setAudioLevel(Math.floor(Math.random() * 45) + 5);
      animationFrameRef.current = requestAnimationFrame(sim);
    };
    sim();
  };

  // Search & Filter state
  const [applicantSearch, setApplicantSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Applicant Modal State
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [adminNotesText, setAdminNotesText] = useState('');

  // Lesson management form state
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: 'https://www.youtube.com/embed/',
    isLive: false,
    duration: '1 hr 30 mins',
    order: 5,
    scheduledAt: new Date().toISOString()
  });

  // Settings Management States
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  // EmailJS configuration states
  const { emailConfig, updateEmailConfig } = useApp();
  const [serviceId1, setServiceId1] = useState(emailConfig.serviceId1);
  const [publicKey1, setPublicKey1] = useState(emailConfig.publicKey1);
  const [serviceId2, setServiceId2] = useState(emailConfig.serviceId2);
  const [publicKey2, setPublicKey2] = useState(emailConfig.publicKey2);
  const [templateIdStudent, setTemplateIdStudent] = useState(emailConfig.templateIdStudent);
  const [templateIdAdmin, setTemplateIdAdmin] = useState(emailConfig.templateIdAdmin);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  useEffect(() => {
    setServiceId1(emailConfig.serviceId1);
    setPublicKey1(emailConfig.publicKey1);
    setServiceId2(emailConfig.serviceId2);
    setPublicKey2(emailConfig.publicKey2);
    setTemplateIdStudent(emailConfig.templateIdStudent);
    setTemplateIdAdmin(emailConfig.templateIdAdmin);
  }, [emailConfig]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both your admin email and password.');
      return;
    }

    const success = loginAdmin(email.trim());
    if (!success) {
      setAuthError('Access Denied: Entry restricted to only admins. It is accessible only by the emails that links are provided, and others shall not have access no matter how many times they try to log in.');
    }
  };

  // CSV Exporter Simulation
  const handleCSVExport = () => {
    const headers = 'ID,Name,Email,Phone,Location,Status,Amount Paid (Naira),Referral\n';
    const rows = applicants.map(a => 
      `"${a.id}","${a.name}","${a.email}","${a.phone}","${a.location}","${a.status}",${a.amountPaid},"${a.referral}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `King_Elidex_Applicants_List_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setSaveSuccessMessage('');

    try {
      updateEmailConfig({
        serviceId1: serviceId1.trim(),
        publicKey1: publicKey1.trim(),
        serviceId2: serviceId2.trim(),
        publicKey2: publicKey2.trim(),
        templateIdStudent: templateIdStudent.trim(),
        templateIdAdmin: templateIdAdmin.trim()
      });
      setSaveSuccessMessage('Integration configurations saved successfully! Live Email Delivery is now configured.');
      setTimeout(() => setSaveSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleSaveLiveStream = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamSaveSuccess(false);

    updateLiveStream({
      title: streamTitle.trim(),
      description: streamDesc.trim(),
      embedUrl: streamEmbed.trim(),
      status: streamStatus as 'live' | 'replay' | 'offline',
      ticketPrice: 1000
    });

    setStreamSaveSuccess(true);
    setTimeout(() => setStreamSaveSuccess(false), 3000);
  };

  const handleAddNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    addLesson({
      ...lessonFormData,
      resources: [
        { title: 'Lesson Cheat Sheet (PDF)', url: '#' },
        { title: 'Class Project Instructions', url: '#' }
      ]
    });
    setIsAddingLesson(false);
    // Reset form
    setLessonFormData({
      title: '',
      description: '',
      youtubeUrl: 'https://www.youtube.com/embed/',
      isLive: false,
      duration: '1 hr 30 mins',
      order: lessons.length + 1,
      scheduledAt: new Date().toISOString()
    });
  };

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) return;

    const success = addAdminUser(newAdminEmail.trim(), newAdminName.trim());
    if (success) {
      setNewAdminEmail('');
      setNewAdminName('');
      alert('Administrator added successfully!');
    } else {
      alert('This administrator email is already registered.');
    }
  };

  // Filter Applicants
  const filteredApplicants = applicants.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.phone.includes(applicantSearch) ||
      a.id.toLowerCase().includes(applicantSearch.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || a.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  // Calculate stats values
  const totalApplicants = applicants.length;
  const pendingRegCount = applicants.filter(a => a.status === ApplicationStatus.PENDING_REG).length;
  const pendingTrainingCount = applicants.filter(a => a.status === ApplicationStatus.PENDING_TRAINING).length;
  const enrolledCount = applicants.filter(a => a.status === ApplicationStatus.ENROLLED).length;
  const totalRevenue = applicants.reduce((sum, a) => sum + a.amountPaid, 0);

  const getStatusDisplay = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING_REG:
        return { text: 'Reg Fee Pending', color: 'bg-amber-100 text-amber-800' };
      case ApplicationStatus.REG_CONFIRMED:
        return { text: 'Reg Paid (Eval Active)', color: 'bg-blue-100 text-blue-800' };
      case ApplicationStatus.EVALUATED:
        return { text: 'Screen Approved', color: 'bg-purple-100 text-purple-800' };
      case ApplicationStatus.PENDING_TRAINING:
        return { text: 'Tuition Receipt Uploaded', color: 'bg-indigo-100 text-indigo-800' };
      case ApplicationStatus.ENROLLED:
        return { text: 'Fully Enrolled ✓', color: 'bg-emerald-100 text-emerald-800' };
      case ApplicationStatus.REJECTED:
        return { text: 'Rejected', color: 'bg-rose-100 text-rose-800' };
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* LOGIN VIEW */}
      {!currentAdmin ? (
        <div className="max-w-md mx-auto bg-white border border-slate-150 rounded-3xl p-8 shadow-lg my-12 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-3 shadow">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted to Only Admins</h3>
            <p className="text-slate-500 text-xs mt-2 font-medium leading-relaxed">
              This terminal is restricted to authorized administrators. Entry is strictly restricted to only admins and it is accessible only by the pre-approved emails that links are provided. Others shall not have access no matter how many times they try to log in.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kingelidex.com"
                className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {authError && (
              <p className="text-red-500 text-xs font-black">{authError}</p>
            )}

            <button
              type="submit"
              id="admin-login-submit"
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>Authenticate Security</span>
            </button>
          </form>

          {/* Secure Admin instructions */}
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 mt-6 text-red-800 text-[10px] leading-relaxed font-semibold">
            🚫 <strong>Security Protocol Active:</strong>
            <br />
            Access is strictly restricted to administrative partners. Unauthorized logins are blocked and logged. Please enter your approved administrative email.
          </div>
        </div>
      ) : (
        /* LOGGED IN TERMINAL */
        <div className="animate-fadeIn">
          
          {/* Dashboard Header Status panel */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8 border border-blue-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.1),transparent_40%)]" />
            
            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-emerald-400 font-mono">SECURE ADMIN INTERACTION SYSTEM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Dashboard: {currentAdmin.name.split(' (')[0]}
              </h2>
              <p className="text-slate-400 text-xs font-semibold">
                Email: {currentAdmin.email} | Role: <span className="text-blue-400 font-extrabold uppercase">{currentAdmin.role}</span>
              </p>
            </div>

            <button
              onClick={logoutAdmin}
              id="admin-logout-button"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-800 transition-colors shrink-0 relative z-10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Admin Navigation Tab Strip */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
            {[
              { id: 'overview', name: 'Overview', icon: ClipboardList },
              { id: 'applicants', name: 'Applicants Database', icon: Users },
              { id: 'lessons', name: 'Classroom Schedule', icon: Play },
              { id: 'stream', name: '🔴 Live Room Control', icon: Shield },
              { id: 'outbox', name: 'Simulated Email logs', icon: Mail },
              { id: 'settings', name: 'System Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200/80 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              
              {/* Stats Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Registered */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">TOTAL REGISTERED</span>
                    <span className="block text-2xl font-black text-slate-900 mt-0.5">{totalApplicants}</span>
                  </div>
                </div>

                {/* Pending Verification */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">PENDING ₦1,000 VERIFY</span>
                    <span className="block text-2xl font-black text-slate-900 mt-0.5">{pendingRegCount}</span>
                  </div>
                </div>

                {/* Fully Enrolled */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">FULLY ENROLLED CREATORS</span>
                    <span className="block text-2xl font-black text-slate-900 mt-0.5">{enrolledCount}</span>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">REVENUE VERIFIED</span>
                    <span className="block text-2xl font-black text-slate-900 mt-0.5">₦{totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Dynamic Phase and Pricing Tracker */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Enrollment Phase Status</h3>
                    <p className="text-slate-500 text-xs font-semibold mt-0.5">We track and scale registration lists automatically inside our infinite phase limits.</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 text-xs font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
                    Phase {phaseInfo.currentPhase} Active
                  </span>
                </div>

                {/* Multi phase bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold">
                      <span>Phase {phaseInfo.currentPhase} Seats Progress ({phaseInfo.totalEnrolled}/{phaseInfo.currentPhase === 1 ? stats.phase1Slots : stats.phase1Slots + phaseInfo.currentPhase * stats.phase2PlusSlotsPerPhase})</span>
                      <span>{phaseInfo.slotsRemaining} Slots Left</span>
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-150">
                      <div 
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${((phaseInfo.slotsLimit - phaseInfo.slotsRemaining) / phaseInfo.slotsLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-slate-600 text-xs font-semibold">
                    <span className="font-extrabold text-slate-900 block mb-1">Switch Formula Rules:</span>
                    Phase 1 price is <strong className="text-blue-600">₦5,000</strong> (first 50 enrolled). From Phase 2 onwards, each phase supports <strong>450 slots</strong> and the price increases to <strong className="text-blue-600">₦10,000</strong> automatically.
                  </div>
                </div>
              </div>

              {/* Interactive Notifications block */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                    <Bell className="w-4.5 h-4.5 text-blue-500" /> Administrative Alerts ({notifications.filter(n => !n.isRead).length} Unread)
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-600 hover:text-red-500 font-bold flex items-center gap-1"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6 font-semibold">No active notification alerts. System stable.</p>
                ) : (
                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3.5 rounded-xl border text-xs flex justify-between items-center gap-4 transition-colors cursor-pointer ${
                          notif.isRead 
                            ? 'bg-slate-50 border-slate-100 text-slate-500' 
                            : 'bg-blue-50/50 border-blue-100 text-slate-800 font-semibold'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900">{sanitizeText(notif.title)}</span>
                          <span>{sanitizeText(notif.message)}</span>
                          <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: APPLICANTS DATABASE */}
          {activeTab === 'applicants' && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              
              {/* Table search & filter actions */}
              <div className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                    placeholder="Search applicant name, email, phone, or application ID..."
                    className="w-full border border-slate-200 rounded-xl py-2 pl-10 pr-4 font-semibold text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Status filter dropdown */}
                  <div className="flex-1 md:flex-none relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 font-semibold text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value={ApplicationStatus.PENDING_REG}>Pending ₦1,000 Reg</option>
                      <option value={ApplicationStatus.REG_CONFIRMED}>Reg Verified (WhatsApp Queue)</option>
                      <option value={ApplicationStatus.EVALUATED}>Screen Approved (Tuition Pending)</option>
                      <option value={ApplicationStatus.PENDING_TRAINING}>Pending ₦5,000 Tuition</option>
                      <option value={ApplicationStatus.ENROLLED}>Fully Enrolled Creators</option>
                      <option value={ApplicationStatus.REJECTED}>Rejected Applications</option>
                    </select>
                  </div>

                  {/* CSV Export Button */}
                  <button
                    onClick={handleCSVExport}
                    id="export-csv-button"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Table List */}
              <div className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 font-black uppercase">
                        <th className="p-4">Applicant ID</th>
                        <th className="p-4">Student Profile</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">Cohort Phase</th>
                        <th className="p-4">Status Display</th>
                        <th className="p-4">Amount Paid</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplicants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                            No student applications found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredApplicants.map((applicant) => {
                          const badge = getStatusDisplay(applicant.status);
                          return (
                            <tr key={applicant.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono font-black text-slate-800">{applicant.id}</td>
                              <td className="p-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                                    <span>{applicant.name}</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">{applicant.location}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-0.5 font-medium text-slate-600">
                                  <span>{applicant.email}</span>
                                  <span>{applicant.phone}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center font-bold text-slate-700">
                                Phase {applicant.phaseNum}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${badge.color}`}>
                                  {badge.text}
                                </span>
                              </td>
                              <td className="p-4 font-black text-slate-800 text-sm">
                                ₦{applicant.amountPaid.toLocaleString()}
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedApplicant(applicant);
                                    setAdminNotesText(applicant.adminNotes);
                                  }}
                                  id={`view-applicant-${applicant.id}`}
                                  className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-all"
                                  title="View Receipts & Settle Status"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: VIDEO LESSONS SESSIONS */}
          {activeTab === 'lessons' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Add lesson trigger bar */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Masterclass Lessons Schedule</h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">Configure live streams, paste YouTube URLs, and coordinate assets downloadable for students.</p>
                </div>
                
                <button
                  onClick={() => setIsAddingLesson(!isAddingLesson)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add New Session</span>
                </button>
              </div>

              {/* Add Lesson Form Panel */}
              {isAddingLesson && (
                <form onSubmit={handleAddNewLesson} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 animate-fadeIn">
                  <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Configure New Session:</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Session Name</label>
                      <input
                        type="text"
                        value={lessonFormData.title}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Module 5: CapCut Keyframe Magic"
                        className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* YouTube URL */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">YouTube Embed Link</label>
                      <input
                        type="text"
                        value={lessonFormData.youtubeUrl}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/embed/XXXXX"
                        className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Class Duration</label>
                      <input
                        type="text"
                        value={lessonFormData.duration}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="2 hours"
                        className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Order */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Display Order</label>
                      <input
                        type="number"
                        value={lessonFormData.order}
                        onChange={(e) => setLessonFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                        className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Session Description</label>
                    <input
                      type="text"
                      value={lessonFormData.description}
                      onChange={(e) => setLessonFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deep dive explanation..."
                      className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Live Stream or Replay Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLessonFormData(prev => ({ ...prev, isLive: !prev.isLive }))}
                      className="flex items-center gap-1 text-xs text-slate-700 font-bold"
                    >
                      {lessonFormData.isLive ? <ToggleRight className="w-8 h-8 text-blue-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                      <span>Mark as Upcoming Live Session</span>
                    </button>
                  </div>

                  <div className="flex gap-2.5 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddingLesson(false)}
                      className="text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      id="save-lesson-submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold"
                    >
                      Save Lesson
                    </button>
                  </div>
                </form>
              )}

              {/* Lesson Items Grid list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                          lesson.isLive 
                            ? 'bg-amber-100 border-amber-200 text-amber-800' 
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {lesson.isLive ? 'Upcoming Live' : 'Recorded Archive'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 mt-2 text-sm">{lesson.title}</h4>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this session?')) {
                            deleteLesson(lesson.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">{lesson.description}</p>
                    
                    <div className="bg-slate-50 rounded-xl p-3 text-[10px] text-slate-500 flex flex-col gap-1 font-semibold border border-slate-100">
                      <div>Link: <code className="text-blue-600 font-bold bg-white px-1 border border-slate-150 rounded">{lesson.youtubeUrl}</code></div>
                      <div>Duration: {lesson.duration} | Display Order: {lesson.order}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SIMULATED EMAIL COMMUNICATIONS OUTBOX */}
          {activeTab === 'outbox' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Communication Logs</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Verify exactly what automatic transaction emails are being dispatched to students, Elijah, and administrative inboxes at each stage of the registration queue.
                </p>
              </div>

              {emailLogs.length === 0 ? (
                <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-slate-400 font-semibold">
                  No emails have been generated yet. Create new student applications or transition statuses to populate outbox logs.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3 text-xs text-slate-500">
                        <div>
                          <strong>To:</strong>{' '}
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-blue-600">{log.to}</code>
                        </div>
                        <span className="font-bold text-[10px] uppercase">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm font-black text-slate-800">
                        Subject: {sanitizeText(log.subject)}
                      </div>

                      <pre className="bg-slate-950 text-slate-200 rounded-xl p-4 text-[10px] font-mono whitespace-pre-wrap leading-normal overflow-x-auto shadow-inner border border-slate-900">
                        {sanitizeText(log.body.trim())}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              
              {/* General Registration Stats Controls */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-blue-500 shrink-0" /> Portal Campaign Configurations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Phase 1 slots */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Phase 1 Early Bird Limit</label>
                    <input
                      type="number"
                      value={stats.phase1Slots}
                      onChange={(e) => updateStats({ phase1Slots: parseInt(e.target.value) || 50 })}
                      className="border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Phase 1 price */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Phase 1 Price (Naira)</label>
                    <input
                      type="number"
                      value={stats.phase1Price}
                      onChange={(e) => updateStats({ phase1Price: parseInt(e.target.value) || 5000 })}
                      className="border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Phase 2 price */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Phase 2+ Standard Price (Naira)</label>
                    <input
                      type="number"
                      value={stats.phase2PlusPrice}
                      onChange={(e) => updateStats({ phase2PlusPrice: parseInt(e.target.value) || 10000 })}
                      className="border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Email Account Management (Super admin only) */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Manage Administrative Roles</h3>
                <p className="text-slate-500 text-xs mb-4 font-semibold">Super Admin is authorized to add or revoke permissions for other admins to verify receipts and manage cohorts.</p>

                {currentAdmin.role === 'super_admin' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Add Admin form */}
                    <form onSubmit={handleAddAdminSubmit} className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-150 flex flex-col gap-3">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Register New Admin:</h4>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Admin Full Name</label>
                        <input
                          type="text"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="Elijah Adeyinka"
                          className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Admin Email Address</label>
                        <input
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="elijahadeyinka75@gmail.com"
                          className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-slate-950 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-lg text-xs mt-1 transition-colors"
                      >
                        Register Admin
                      </button>
                    </form>

                    {/* Admin List */}
                    <div className="lg:col-span-7">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide mb-3">Active Administrative Users:</h4>
                      <div className="flex flex-col gap-2">
                        {adminUsers.map((user) => (
                          <div key={user.email} className="bg-white border border-slate-150 rounded-xl p-3 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-900 block">{user.name}</span>
                              <code className="text-blue-600 text-[10px]">{user.email}</code>
                            </div>
                            
                            {user.email !== 'ktesatech.reception.co@gmail.com' ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Revoke admin authorization for: ${user.name}?`)) {
                                    removeAdminUser(user.email);
                                  }
                                }}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                                Super
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 flex gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                    <span>Access Restricted. Only the Super Administrator account (ktesatech.reception.co@gmail.com) can register or delete other admin privileges.</span>
                  </div>
                )}
              </div>

              {/* EmailJS Live Email Delivery Integration */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 flex items-center gap-1.5">
                  <Mail className="w-5 h-5 text-blue-500 shrink-0" /> Live Email Delivery (EmailJS Integration)
                </h3>
                <p className="text-slate-500 text-xs mb-6 font-semibold leading-relaxed">
                  Connect your EmailJS dashboards to send automated emails directly from the portal. Since you have multiple services, the portal will route admin alerts and registration copies to both endpoints in real time. If keys are left blank, the portal operates in simulated logs mode.
                </p>

                <form onSubmit={handleSaveEmailConfig} className="flex flex-col gap-8">
                  {/* Service 1: ktesatech */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Account 1: ktesatech.reception.co@gmail.com
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">EmailJS Service ID</label>
                        <input
                          type="text"
                          value={serviceId1}
                          onChange={(e) => setServiceId1(e.target.value)}
                          placeholder="e.g. service_h3cznza"
                          className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">EmailJS Public Key</label>
                        <input
                          type="text"
                          value={publicKey1}
                          onChange={(e) => setPublicKey1(e.target.value)}
                          placeholder="e.g. user_or_key_xxxxx"
                          className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service 2: kingelidex */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" /> Account 2: kingelidexaivideoeditor@gmail.com
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">EmailJS Service ID</label>
                        <input
                          type="text"
                          value={serviceId2}
                          onChange={(e) => setServiceId2(e.target.value)}
                          placeholder="e.g. service_2rawvt8"
                          className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">EmailJS Public Key</label>
                        <input
                          type="text"
                          value={publicKey2}
                          onChange={(e) => setPublicKey2(e.target.value)}
                          placeholder="e.g. user_or_key_yyyyy"
                          className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Identifiers */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> EmailJS Template Identifiers (Shared)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Student Email Template ID</label>
                        <input
                          type="text"
                          value={templateIdStudent}
                          onChange={(e) => setTemplateIdStudent(e.target.value)}
                          placeholder="e.g. template_student"
                          className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Admin Alert Template ID</label>
                        <input
                          type="text"
                          value={templateIdAdmin}
                          onChange={(e) => setTemplateIdAdmin(e.target.value)}
                          placeholder="e.g. template_admin"
                          className="border border-slate-200 rounded-xl p-3 font-semibold text-sm text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {saveSuccessMessage && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-xs font-bold">
                      ✓ {saveSuccessMessage}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow animate-pulse-subtle"
                    >
                      {isSavingConfig ? 'Saving Configurations...' : 'Save Dual EmailJS Settings'}
                    </button>
                  </div>
                </form>

                {/* Templates Blueprint and design details */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">
                    📝 Step-by-Step Template Setup Instructions
                  </h4>
                  <p className="text-slate-500 text-xs mb-4 leading-relaxed font-medium">
                    To receive actual emails to your admin accounts and students, you need to create templates inside your free <a href="https://www.emailjs.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-extrabold">EmailJS Dashboard</a>. Setup your templates with the exact parameter names below:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Template 1: Student Emails */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 text-xs">
                      <h5 className="font-black text-slate-800 text-xs mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> 
                        Template 1: Student Status Notifications
                      </h5>
                      <p className="text-slate-400 text-[10px] uppercase font-bold mb-3">USED FOR REGISTRATIONS, SELECTIVITY & SELECTIONS</p>
                      
                      <div className="flex flex-col gap-2 font-mono text-[11px] text-slate-600">
                        <div>
                          <strong>Recipient Email Field:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-bold">{"{{to_email}}"}</code>
                        </div>
                        <div>
                          <strong>Subject Line:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-bold">{"{{subject}}"}</code>
                        </div>
                        <div className="mt-2">
                          <strong className="block text-slate-700">Template Body Variables:</strong>
                          <ul className="list-disc list-inside mt-1 flex flex-col gap-1 text-[10px]">
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{to_name}}"}</code> - Recipient First Name</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{subject}}"}</code> - Subject Line</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{message}}"}</code> - Full email message body</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{from_name}}"}</code> - "King Elidex Academy"</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{reply_to}}"}</code> - Primary email</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Template 2: Admin Alerts */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 text-xs">
                      <h5 className="font-black text-slate-800 text-xs mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> 
                        Template 2: Admin Alerts & Audit Logs
                      </h5>
                      <p className="text-slate-400 text-[10px] uppercase font-bold mb-3">USED FOR NEW APPLICANTS & UPLOADED RECEIPTS</p>
                      
                      <div className="flex flex-col gap-2 font-mono text-[11px] text-slate-600">
                        <div>
                          <strong>Recipient Email Field:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-bold">{"{{to_email}}"}</code>
                        </div>
                        <div>
                          <strong>Subject Line:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-bold">{"{{subject}}"}</code>
                        </div>
                        <div className="mt-2">
                          <strong className="block text-slate-700">Template Body Variables:</strong>
                          <ul className="list-disc list-inside mt-1 flex flex-col gap-1 text-[10px]">
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{to_name}}"}</code> - "Admin"</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{subject}}"}</code> - Alert description</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{message}}"}</code> - Full details of the registration/receipt</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{from_name}}"}</code> - "King Elidex Portal"</li>
                            <li><code className="bg-slate-150 px-1 rounded text-slate-700 font-bold">{"{{reply_to}}"}</code> - "no-reply"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: SECURE LIVE STREAM CONTROL */}
          {activeTab === 'stream' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* INTERACTIVE BROADCASTER STUDIO ENGINE */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
                
                {/* Header info */}
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6 pb-5 border-b border-slate-800">
                  <div>
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 font-mono font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      STUDIO BROADCASTER LIVE OVERLAY
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
                      <span className="relative flex h-3.5 w-3.5">
                        {isBroadcasting && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isBroadcasting ? 'bg-red-500' : 'bg-slate-600'}`}></span>
                      </span>
                      <span>King Elidex Studio Broadcaster</span>
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">
                      Broadcast your local webcam or phone camera directly to the student portal. Test microphone level and apply HUD metadata overlays in real-time.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                      Device Status: {isBroadcasting ? 'Broadcasting ON 🎥' : 'Inactive 💤'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left: Live Viewport stage */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    
                    {/* Camera display frame */}
                    <div className="bg-black rounded-3xl aspect-video overflow-hidden border border-slate-800 relative shadow-inner group">
                      
                      {isBroadcasting ? (
                        <video
                          ref={videoPreviewRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                          <div className="w-16 h-16 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center mb-3">
                            <Video className="w-6 h-6 text-slate-400" />
                          </div>
                          <span className="text-sm font-black text-white block">Camera Broadcaster Offline</span>
                          <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal font-semibold">
                            Initiate your camera feed to begin streaming directly to your enrolled students' players.
                          </p>
                        </div>
                      )}

                      {/* HUD METADATA ON-SCREEN INFO OVERLAY */}
                      {showScreenOverlay && isBroadcasting && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/85 p-5 flex flex-col justify-between pointer-events-none animate-fadeIn select-none font-sans">
                          
                          {/* Top row overlays */}
                          <div className="flex justify-between items-start w-full">
                            <div className="flex items-center gap-2">
                              <span className="bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                LIVE BROADCAST
                              </span>
                              <span className="bg-black/60 border border-white/10 text-white font-semibold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                                {cameraFacingMode === 'user' ? 'FRONT CAMERA' : 'BACK CAMERA'}
                              </span>
                            </div>

                            <span className="bg-black/60 border border-white/10 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                              FPS: 60 | 1080P Ultra
                            </span>
                          </div>

                          {/* Bottom Row Overlays */}
                          <div className="flex justify-between items-end w-full">
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-widest">Active Stream Topic</span>
                              <h4 className="text-white text-xs font-black truncate">{streamTitle || 'Untitled Masterclass broadcast'}</h4>
                              <p className="text-slate-400 text-[10px] leading-tight truncate mt-0.5 font-semibold">
                                {streamDesc || 'Ready to teach generals video secrets.'}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center gap-2 bg-black/75 border border-white/10 p-2 rounded-xl">
                              <div className="text-right">
                                <span className="text-[7px] text-slate-400 block font-bold uppercase">Ticket Enrolled</span>
                                <span className="text-[11px] text-white font-black block leading-none">
                                  {applicants.filter(a => a.status === ApplicationStatus.ENROLLED).length} Views
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>

                    {/* Microphone sound decibel level indicator */}
                    {micEnabled && isBroadcasting && (
                      <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl flex items-center gap-3 animate-fadeIn">
                        <div className="shrink-0 flex items-center gap-1.5">
                          <Mic className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">MIC INTENSITY</span>
                        </div>
                        
                        {/* Interactive sound meter segments */}
                        <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 flex gap-0.5">
                          {Array.from({ length: 24 }).map((_, idx) => {
                            const threshold = (idx / 24) * 100;
                            const isActive = audioLevel >= threshold;
                            let color = 'bg-emerald-500';
                            if (threshold > 80) color = 'bg-red-500';
                            else if (threshold > 60) color = 'bg-amber-500';

                            return (
                              <div
                                key={idx}
                                className={`flex-1 rounded-sm transition-all duration-75 ${
                                  isActive ? color : 'bg-slate-800'
                                }`}
                              />
                            );
                          })}
                        </div>

                        <span className="shrink-0 text-mono text-[10px] text-emerald-400 font-extrabold w-8 text-right">
                          {audioLevel}%
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Right: Broadcaster controls dashboard */}
                  <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
                    
                    {/* Studio Control Panel Buttons */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Broadcaster Control Desk</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Toggle Broadcast */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isBroadcasting) stopBroadcasting();
                            else startBroadcasting();
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                            isBroadcasting
                              ? 'border-red-500/50 bg-red-950/20 text-red-100 ring-1 ring-red-500/40 shadow-lg shadow-red-950/40'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-xs font-black">{isBroadcasting ? 'Stop Broadcaster' : 'Start Broadcaster'}</span>
                          </div>
                          <span className="text-[9px] opacity-70 font-semibold leading-tight">
                            {isBroadcasting ? 'Disconnect webcam and mic' : 'Activate webcam and streaming'}
                          </span>
                        </button>

                        {/* Switch Front/Back Camera */}
                        <button
                          type="button"
                          disabled={!isBroadcasting}
                          onClick={toggleCameraFacingMode}
                          className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                            !isBroadcasting 
                              ? 'opacity-45 border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-black">Switch Camera Source</span>
                          </div>
                          <span className="text-[9px] opacity-70 font-semibold leading-tight">
                            {cameraFacingMode === 'user' ? 'Front Camera Active' : 'Back Camera Active'}
                          </span>
                        </button>

                        {/* Microphone Switch */}
                        <button
                          type="button"
                          onClick={toggleMic}
                          className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                            micEnabled
                              ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/20'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
                            <span className="text-xs font-black">{micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}</span>
                          </div>
                          <span className="text-[9px] opacity-70 font-semibold leading-tight">
                            {micEnabled ? 'Sound is actively capturing' : 'Microphone audio is turned off'}
                          </span>
                        </button>

                        {/* Info On Screen HUD Toggle */}
                        <button
                          type="button"
                          onClick={() => setShowScreenOverlay(!showScreenOverlay)}
                          className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                            showScreenOverlay
                              ? 'border-blue-500/50 bg-blue-950/20 text-blue-100 ring-1 ring-blue-500/40 shadow-lg'
                              : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-black">{showScreenOverlay ? 'Hide Info On Screen' : 'Show Info On Screen'}</span>
                          </div>
                          <span className="text-[9px] opacity-70 font-semibold leading-tight">
                            {showScreenOverlay ? 'HUD metadata overlay visible' : 'HUD metadata overlay hidden'}
                          </span>
                        </button>

                      </div>
                    </div>

                    {/* COPY SECURE ENCODER LINK SECTION */}
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                      <div>
                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Private Stream Encoder Target</h4>
                        <p className="text-[9px] text-slate-500 font-semibold leading-normal mt-0.5">
                          Copy this target URL if you are using external broadcast software (OBS, Streamlabs, or a custom device encoder).
                        </p>
                      </div>

                      <div className="flex gap-2 items-center bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                        <span className="text-[10px] font-mono text-slate-400 select-all truncate flex-1">
                          rtmp://live.kingelidex.com/masterclass/ke-broadcast-2026-secure-key-928
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('rtmp://live.kingelidex.com/masterclass/ke-broadcast-2026-secure-key-928');
                            setCopiedStreamKey(true);
                            setTimeout(() => setCopiedStreamKey(false), 2000);
                          }}
                          className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2 rounded-lg transition-colors border border-slate-800"
                        >
                          {copiedStreamKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* DUAL CONFIGURATION AND TICKET PASS DATABASE SECTION */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form Settings */}
                  <form onSubmit={handleSaveLiveStream} className="lg:col-span-7 flex flex-col gap-5">
                    
                    <h3 className="text-lg font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100 flex items-center gap-1.5">
                      <Monitor className="w-5 h-5 text-slate-600" />
                      <span>Stream Settings Configuration</span>
                    </h3>

                    {/* Stream Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Stream Broadcast Title</label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="e.g., King Elidex Private Live Masterclass Session"
                        className="border border-slate-200 rounded-xl p-3 font-semibold text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Stream Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Stream Broadcast Description</label>
                      <textarea
                        value={streamDesc}
                        onChange={(e) => setStreamDesc(e.target.value)}
                        placeholder="Give details about what you're teaching in this session..."
                        rows={3}
                        className="border border-slate-200 rounded-xl p-3 font-semibold text-xs text-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                        required
                      />
                    </div>

                    {/* Embed URL */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Streaming Video Embed Link (YouTube, Vimeo, custom)</label>
                      <input
                        type="url"
                        value={streamEmbed}
                        onChange={(e) => setStreamEmbed(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/embed/live_stream_id"
                        className="border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                        required
                      />
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        💡 <strong>Android Broadcast Guide:</strong> Copy the <strong>Embed iframe src link</strong> and paste it above (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-bold font-mono">https://www.youtube.com/embed/5H-KLe5gErc</code>).
                      </p>
                    </div>

                    {/* Stream Status Toggle Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Active Broadcast Mode</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'offline', name: 'Offline 💤', desc: 'Hide stream player' },
                          { id: 'live', name: 'Go Live Now 🔴', desc: 'Broadcasting live' },
                          { id: 'replay', name: 'Play Replay 🎬', desc: 'Play recorded replay' }
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setStreamStatus(mode.id as any)}
                            className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                              streamStatus === mode.id
                                ? 'border-red-500 bg-red-50/50 text-red-950 shadow-sm ring-1 ring-red-400'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="text-xs font-black">{mode.name}</span>
                            <span className="text-[9px] opacity-75 font-semibold">{mode.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {streamSaveSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-black animate-fadeIn">
                        ✓ Broadcast settings synced! Students now see the updated live streams.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="mt-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow animate-fadeIn"
                    >
                      <span>Update & Deploy Live Stream Status</span>
                    </button>

                  </form>

                  {/* Right Column: Ticket Sales Statistics & Ticket Buyers list */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Live stream overview stats */}
                    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-3 font-mono">
                        Live Pass Sales Matrix
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Live Pass Price</span>
                          <span className="text-lg font-black text-white mt-1 block">₦1,000</span>
                        </div>
                        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Verified Buyers</span>
                          <span className="text-lg font-black text-white mt-1 block">
                            {applicants.filter(a => a.isStreamTicketOnly && a.status === ApplicationStatus.ENROLLED).length} students
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 rounded-xl bg-slate-800 border border-slate-750 text-[11px] text-slate-300 leading-normal font-semibold">
                        📊 <strong>Revenue Generated:</strong> ₦{(applicants.filter(a => a.isStreamTicketOnly && a.status === ApplicationStatus.ENROLLED).length * 1000).toLocaleString()} Naira.
                      </div>
                    </div>

                    {/* Ticket Holders Submissions Database */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-3">
                        Pending Live Stream Passes ({applicants.filter(a => a.isStreamTicketOnly && a.status === ApplicationStatus.PENDING_TRAINING).length})
                      </h4>
                      
                      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                        {applicants.filter(a => a.isStreamTicketOnly).length === 0 ? (
                          <p className="text-slate-400 text-[11px] text-center py-6 font-semibold">No live stream ticket submissions yet.</p>
                        ) : (
                          applicants.filter(a => a.isStreamTicketOnly).map((buyer) => (
                            <div
                              key={buyer.id}
                              onClick={() => {
                                setSelectedApplicant(buyer);
                                setAdminNotesText(buyer.notes || '');
                              }}
                              className="bg-white border border-slate-150 rounded-xl p-3 hover:border-blue-400 transition-colors cursor-pointer flex justify-between items-center gap-3"
                            >
                              <div className="min-w-0">
                                <span className="block text-xs font-black text-slate-800 line-clamp-1">{buyer.name}</span>
                                <span className="block text-[9px] text-slate-400 font-semibold truncate">{buyer.email}</span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                buyer.status === ApplicationStatus.ENROLLED
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {buyer.status === ApplicationStatus.ENROLLED ? 'Verified ✓' : 'Review 📁'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPLICANT DETAIL REVIEW SCREEN DIALOG MODAL */}
          {selectedApplicant && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-6 border border-slate-150 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black font-mono px-2.5 py-0.5 rounded uppercase">
                      ID: {selectedApplicant.id}
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 mt-1.5">{selectedApplicant.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 font-semibold">
                      <span>📧 {selectedApplicant.email}</span>
                      <span>📞 {selectedApplicant.phone}</span>
                      <span>📍 {selectedApplicant.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <XCircle className="w-7 h-7" />
                  </button>
                </div>

                {/* Settle comments / Administrative notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Administrative Notes / Internal Logs</label>
                  <textarea
                    value={adminNotesText}
                    onChange={(e) => setAdminNotesText(e.target.value)}
                    rows={2}
                    className="border border-slate-200 rounded-xl p-3 font-semibold text-xs text-slate-700 focus:outline-none focus:border-blue-500 resize-none bg-slate-50"
                  />
                </div>

                {/* TRANSACTION RECEIPTS DISPLAY PANEL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Registration Fee ₦1,000 Receipt */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Registration Receipt (₦1,000)</span>
                    {selectedApplicant.regReceiptUrl ? (
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white relative group">
                        <img src={selectedApplicant.regReceiptUrl} alt="Registration Receipt screenshot" className="w-full h-full object-cover" />
                        <a 
                          href={selectedApplicant.regReceiptUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-opacity"
                        >
                          Expand Screenshot
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No receipt uploaded
                      </div>
                    )}
                  </div>

                  {/* Tuition Fee ₦5k/₦10k Receipt */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Tuition Fee Receipt</span>
                    {selectedApplicant.trainingReceiptUrl ? (
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white relative group">
                        <img src={selectedApplicant.trainingReceiptUrl} alt="Tuition Receipt screenshot" className="w-full h-full object-cover" />
                        <a 
                          href={selectedApplicant.trainingReceiptUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black transition-opacity"
                        >
                          Expand Screenshot
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No tuition receipt uploaded
                      </div>
                    )}
                  </div>
                </div>

                {/* MODAL WORKFLOW STRIP BUTTON GATEWAY */}
                <div className="border-t border-slate-100 pt-5 flex flex-wrap gap-2.5">
                  
                  {/* Action 1: Verify Registration Fee (N1,000) */}
                  {selectedApplicant.status === ApplicationStatus.PENDING_REG && (
                    <button
                      onClick={() => {
                        updateApplicantStatus(
                          selectedApplicant.id, 
                          ApplicationStatus.REG_CONFIRMED, 
                          adminNotesText || 'Verified registration fee. Scheduled student WhatsApp evaluation.'
                        );
                        setSelectedApplicant(null);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4.5 py-3 rounded-xl flex items-center gap-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm N1,000 Reg Fee</span>
                    </button>
                  )}

                  {/* Action 2: Approve Screening / Evaluation */}
                  {selectedApplicant.status === ApplicationStatus.REG_CONFIRMED && (
                    <button
                      onClick={() => {
                        updateApplicantStatus(
                          selectedApplicant.id, 
                          ApplicationStatus.EVALUATED, 
                          adminNotesText || 'Approved screening evaluation chat on WhatsApp! Selected to enroll. Awaiting Tuition payment.'
                        );
                        setSelectedApplicant(null);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-black px-4.5 py-3 rounded-xl flex items-center gap-1 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve WhatsApp Screen</span>
                    </button>
                  )}

                  {/* Action 3: Confirm Tuition Fee Enrollment */}
                  {selectedApplicant.status === ApplicationStatus.PENDING_TRAINING && (
                    <button
                      onClick={() => {
                        updateApplicantStatus(
                          selectedApplicant.id, 
                          ApplicationStatus.ENROLLED, 
                          adminNotesText || 'Confirmed tuition payment! Welcome to the Masterclass family.'
                        );
                        setSelectedApplicant(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4.5 py-3 rounded-xl flex items-center gap-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Tuition Fee</span>
                    </button>
                  )}

                  {/* Action: Reject applicant */}
                  {selectedApplicant.status !== ApplicationStatus.REJECTED && (
                    <button
                      onClick={() => {
                        updateApplicantStatus(
                          selectedApplicant.id, 
                          ApplicationStatus.REJECTED, 
                          adminNotesText || 'Application screened and rejected.'
                        );
                        setSelectedApplicant(null);
                      }}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-extrabold px-4.5 py-3 rounded-xl flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Reject Application</span>
                    </button>
                  )}

                  {/* Simple save comments button */}
                  <button
                    onClick={() => {
                      updateApplicantStatus(selectedApplicant.id, selectedApplicant.status, adminNotesText);
                      setSelectedApplicant(null);
                      alert('Admin comments updated!');
                    }}
                    className="ml-auto text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-extrabold px-4 py-3 rounded-xl"
                  >
                    Save Notes Only
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
