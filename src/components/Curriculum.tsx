import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, ShieldCheck, Mail, ArrowRight, Download, Cpu, Sparkles, AlertCircle, ShoppingBag, Lock, HelpCircle } from 'lucide-react';

export default function Curriculum() {
  const { lessons, purchaseRecording, emailLogs } = useApp();
  const [activeWeek, setActiveWeek] = useState(0);
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [selectedArchiveLesson, setSelectedArchiveLesson] = useState('');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  // Past archived lessons available for immediate purchase at ₦1,000
  const archivedLessons = lessons.filter(l => !l.isLive);

  const toolsList = [
    { name: 'ChatGPT', desc: 'Automate scriptwriting, hooks, and story outline creation.', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { name: 'CapCut', desc: 'Professional mobile video editing, keys, cuts, audio.', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { name: 'Runway', desc: 'Generate cinematic B-rolls and visual elements from text.', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    { name: 'Kling AI', desc: 'Bring static photos to life with stunning 3D animations.', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { name: 'Midjourney', desc: 'Design high-end graphic assets, thumbnails, backdrop designs.', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
  ];

  const benefits = [
    { title: 'Online Certificate of Completion', desc: 'Verifiable credentials for client portfolios.' },
    { title: 'Premium AI Prompt Packs', desc: 'Hundreds of copy-paste scripting and design formulas.' },
    { title: 'Live Interactive Q&A', desc: 'Get direct live feedback on your edits on WhatsApp.' },
    { title: 'Recorded Lesson Archive', desc: 'Watch any session in-site on-demand, anytime.' }
  ];

  const handleArchivePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseError('');
    setPurchaseSuccess(false);

    if (!purchaseEmail.trim() || !purchaseEmail.includes('@')) {
      setPurchaseError('Please enter a valid email address.');
      return;
    }

    if (!selectedArchiveLesson) {
      setPurchaseError('Please select which previous recording you want to buy.');
      return;
    }

    const selectedLesson = archivedLessons.find(l => l.id === selectedArchiveLesson);
    if (!selectedLesson) {
      setPurchaseError('Recording not found.');
      return;
    }

    // Process simulation
    purchaseRecording(purchaseEmail.trim().toLowerCase(), selectedLesson.title);
    setPurchaseSuccess(true);
    setPurchaseEmail('');
    
    // Auto clear success after some seconds
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 10000);
  };

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Course Curriculum & Week Grid */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Complete AI Creator Curriculum
          </h2>
          <p className="mt-4 text-slate-600 font-medium text-lg leading-relaxed">
            Our intensive 4-week roadmap is engineered to build you into a master content designer from level zero. Click each module to explore:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Week Tabs Sidebar selector */}
          <div className="lg:col-span-4 flex flex-col gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            {lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => setActiveWeek(idx)}
                className={`w-full text-left p-4 rounded-xl font-bold transition-all flex items-center justify-between group ${
                  activeWeek === idx
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    activeWeek === idx ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Module {idx + 1}</span>
                    <span className="text-sm line-clamp-1">{lesson.title.replace(/Module \d+:\s*/i, '')}</span>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform ${
                  activeWeek === idx ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-100'
                }`} />
              </button>
            ))}
          </div>

          {/* Module Deep Details Card */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <span className="bg-blue-100 text-blue-700 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  WEEK {activeWeek + 1} ROADMAP
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                  {lessons[activeWeek].title}
                </h3>
              </div>
              <div className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg font-bold">
                Duration: {lessons[activeWeek].duration}
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-6 font-medium text-base sm:text-lg">
              {lessons[activeWeek].description}
            </p>

            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3">
              Skills & Resources Included:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {lessons[activeWeek].resources.map((res, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-700 text-sm font-semibold">
                  <Download className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{res.title}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 flex gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-blue-600" />
              <div>
                <strong className="font-bold block mb-0.5">Live Interactive Training</strong>
                Interactive evaluations and practical task-checks for this week's modules will be conducted inside the private WhatsApp student forum.
              </div>
            </div>
          </div>

        </div>

        {/* Mastered Tools Grid */}
        <div className="mt-24 border-t border-slate-200/60 pt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              Professional Tools You'll Master
            </h3>
            <p className="mt-2 text-slate-500 font-medium">
              We teach standard workflows using leading industry AI creators:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {toolsList.map((tool) => (
              <div key={tool.name} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
                <div className={`inline-block border font-black text-xs px-3 py-1.5 rounded-lg mb-3 ${tool.color}`}>
                  {tool.name}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What you will receive banner */}
        <div className="mt-12 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-blue-900/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_40%)]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-3 py-1 text-xs font-bold w-fit uppercase">
                <Cpu className="w-3.5 h-3.5" />
                Masterclass Deliverables
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Everything you need to jumpstart your career
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The Masterclass is backed by full lifetime assets so that you never fall behind, even if your personal daily schedule is busy.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div key={b.title} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-200">{b.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ₦1,000 ARCHIVE RECORDING PURCHASE FEATURE */}
        <div className="mt-16 bg-white border border-slate-150 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Information Side (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-3 py-1 rounded-full w-fit uppercase tracking-wider border border-amber-200">
                🚀 INSTANT ARCHIVE ACCESS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Can't wait? Get previous class links for only ₦1,000!
              </h3>
              <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                If you want to start learning immediately before our July 20th session begins, you can purchase the complete high-definition recordings of previous class lessons. 
              </p>
              
              <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <span>
                  <strong>Instructions:</strong> Pay <strong>₦1,000</strong> to Elijah Adeyinka's PalmPay Account: <strong>9163152202</strong>, enter your email below, select which module recording you want, and submit. The private YouTube replay link is dispatched to your inbox instantly!
                </span>
              </div>
            </div>

            {/* Simulated Buy Card Side (5 Columns) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 sm:p-6">
                
                {purchaseSuccess ? (
                  <div className="text-center py-6 animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg">Purchase Dispatched!</h4>
                    <p className="text-xs text-slate-600 mt-2 font-semibold">
                      Payment verified. We have sent the private archive link to your email. Check your simulated mailbox logs or register status.
                    </p>
                    <button
                      onClick={() => setPurchaseSuccess(false)}
                      className="mt-4 text-xs font-extrabold text-blue-600 hover:text-blue-500 underline"
                    >
                      Buy another recording
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleArchivePurchaseSubmit} className="flex flex-col gap-4">
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-amber-500 shrink-0" />
                      Select Archive Replay:
                    </h4>

                    {/* Lesson dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Archived Session</label>
                      <select
                        value={selectedArchiveLesson}
                        onChange={(e) => setSelectedArchiveLesson(e.target.value)}
                        className="bg-white border border-slate-200 text-xs rounded-xl p-3 font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">-- Choose past lesson (₦1,000) --</option>
                        {archivedLessons.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title.split(':')[0]} (₦1,000)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Deliver To (Your Email)</label>
                      <input
                        type="email"
                        value={purchaseEmail}
                        onChange={(e) => setPurchaseEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="bg-white border border-slate-200 text-xs rounded-xl p-3 font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {purchaseError && (
                      <p className="text-red-500 text-[10px] font-black">{purchaseError}</p>
                    )}

                    {/* Simulated purchase button */}
                    <button
                      type="submit"
                      id="buy-recording-submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <span>Simulate ₦1,000 Transfer & Buy</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
