import { ApplicationStatus, Applicant, Lesson, Testimonial, SystemStats, AdminUser, AdminNotification } from './types';

export const INITIAL_STATS: SystemStats = {
  phase1Slots: 50,
  phase2PlusSlotsPerPhase: 450,
  phase1Price: 1000,
  phase2PlusPrice: 10000,
  startDate: '2026-07-20T10:00:00',
  whatsappNumber: '+234 916 315 2202',
  whatsappLink: 'https://wa.me/2349163152202',
  adminNotificationEmails: [
    'ktesatech.reception.co@gmail.com',
    'kingelidexaivideoeditor@gmail.com',
    'elijahadeyinka75@gmail.com'
  ]
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    email: 'ktesatech.reception.co@gmail.com',
    name: 'Ktesatech Reception (Super Admin)',
    role: 'super_admin',
    createdAt: '2026-07-13T10:00:00Z'
  },
  {
    email: 'kingelidexaivideoeditor@gmail.com',
    name: 'King Elidex AI Video Editor (Admin)',
    role: 'admin',
    createdAt: '2026-07-13T10:05:00Z'
  },
  {
    email: 'elijahadeyinka75@gmail.com',
    name: 'Elijah Adeyinka (Admin)',
    role: 'admin',
    createdAt: '2026-07-13T10:06:00Z'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Precious Adebayo',
    comment: 'The CapCut and Midjourney workflow taught by King Elidex completely changed my content game. Within 2 weeks of implementing his AI storytelling hooks, my Instagram reels views went from under 500 to over 45k!',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    courseName: 'AI Video Masterclass Graduate',
    isVisible: true
  },
  {
    id: 't-2',
    name: 'Chinedu Okafor',
    comment: 'I landed my first international client on Upwork charging $400 for UGC video ads using the Client Hunting Secrets module! The ₦5,000 early bird fee is literally the best investment I have made this year.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    courseName: 'Content Creator & Freelancer',
    isVisible: true
  },
  {
    id: 't-3',
    name: 'Aisha Yusuf',
    comment: 'I missed three live Zoom classes due to my offline business, but the student portal had all recordings, prompts, and resources uploaded instantly. Having lifetime access to the curriculum inside this platform is a lifesaver!',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    courseName: 'UGC Content Agency Owner',
    isVisible: true
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'l-1',
    title: 'Module 1: Introduction to AI Video Editing & Mobile Workflows',
    description: 'Learn the core principles of AI editing, interface navigation in CapCut/InShot, and optimal timeline settings for mobile platforms.',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Demo video (Rick Astley placeholder for classroom illustration)
    isLive: false,
    scheduledAt: '2026-07-10T14:00:00Z',
    duration: '1 hr 15 mins',
    order: 1,
    resources: [
      { title: 'Mobile Editing Cheat Sheet (PDF)', url: '#' },
      { title: 'Video Aspect Ratio Guidelines', url: '#' }
    ]
  },
  {
    id: 'l-2',
    title: 'Module 2: AI Storytelling & Script-to-Video Mastery',
    description: 'Master writing high-retention video scripts using ChatGPT prompts, structuring powerful 3-second hooks, and using AI voices that convert.',
    youtubeUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    isLive: false,
    scheduledAt: '2026-07-12T14:00:00Z',
    duration: '1 hr 45 mins',
    order: 2,
    resources: [
      { title: 'High-Converting Script Template', url: '#' },
      { title: 'Top 50 Viral Hook Prompts', url: '#' }
    ]
  },
  {
    id: 'l-3',
    title: 'Module 3: Advanced UGC Ad Creation & AI Image Prompts',
    description: 'Deep dive into creating authentic User Generated Content ads. Master Midjourney v6 prompting for stunning visual assets and backgrounds.',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isLive: true,
    scheduledAt: '2026-07-21T18:00:00Z',
    duration: '2 hours',
    order: 3,
    resources: [
      { title: 'Midjourney v6 Magic Prompts Pack', url: '#' },
      { title: 'UGC Video Ad Script Swipe File', url: '#' }
    ]
  },
  {
    id: 'l-4',
    title: 'Module 4: Kling AI, Runway Gen-2 & Client Acquisition Secrets',
    description: 'Bring static photos to life with stunning 3D video animations. Learn our system for pitching clients, pricing your services, and closing retainers.',
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isLive: true,
    scheduledAt: '2026-07-25T18:00:00Z',
    duration: '2 hr 30 mins',
    order: 4,
    resources: [
      { title: 'Runway & Kling AI Animation Workflows', url: '#' },
      { title: 'Client Pitch Email Templates', url: '#' },
      { title: 'Freelance Contract Template', url: '#' }
    ]
  }
];

// Pre-seed some applicants so that the dashboard doesn't start empty, demonstrating various statuses!
export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'KE-2026-1024',
    name: 'Samuel Chukwu',
    email: 'sam.chukwu@gmail.com',
    phone: '08123456789',
    location: 'Lagos, Nigeria',
    referral: 'Instagram Video',
    status: ApplicationStatus.PENDING_REG,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60', // Mock receipt screenshot
    trainingReceiptUrl: null,
    adminNotes: 'Awaiting registration fee confirmation. Applied on July 13th.',
    phaseNum: 1,
    amountPaid: 0,
    createdAt: '2026-07-13T10:30:00Z',
    updatedAt: '2026-07-13T10:30:00Z'
  },
  {
    id: 'KE-2026-1025',
    name: 'Oluwatobiloba Alao',
    email: 'tobi.alao@yahoo.com',
    phone: '09012345678',
    location: 'Ibadan, Nigeria',
    referral: 'WhatsApp Status',
    status: ApplicationStatus.REG_CONFIRMED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: null,
    adminNotes: 'Verified ₦1,000 reg fee. Student has been messaged on WhatsApp. Evaluation currently in progress to gauge commitment.',
    phaseNum: 1,
    amountPaid: 1000,
    createdAt: '2026-07-12T14:20:00Z',
    updatedAt: '2026-07-13T09:00:00Z'
  },
  {
    id: 'KE-2026-1026',
    name: 'Chioma Nwachukwu',
    email: 'chioma.n@gmail.com',
    phone: '07087654321',
    location: 'Enugu, Nigeria',
    referral: 'Facebook Group',
    status: ApplicationStatus.EVALUATED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: null,
    adminNotes: 'Highly committed applicant! Excellent basic skills. Approved for training after WhatsApp call. Awaiting her ₦5,000 training fee payment.',
    phaseNum: 1,
    amountPaid: 1000,
    createdAt: '2026-07-11T11:05:00Z',
    updatedAt: '2026-07-12T16:45:00Z',
    evaluatedAt: '2026-07-12T16:45:00Z'
  },
  {
    id: 'KE-2026-1027',
    name: 'Ebenezer Williams',
    email: 'ebenezer.w@gmail.com',
    phone: '08133557799',
    location: 'Port Harcourt, Nigeria',
    referral: 'Twitter (X)',
    status: ApplicationStatus.PENDING_TRAINING,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60', // Mock training payment receipt
    adminNotes: 'Completed evaluation successfully and uploaded training fee screenshot. Admin needs to review and confirm enrollment.',
    phaseNum: 1,
    amountPaid: 1000,
    createdAt: '2026-07-10T16:15:00Z',
    updatedAt: '2026-07-13T12:10:00Z',
    evaluatedAt: '2026-07-11T15:00:00Z'
  },
  {
    id: 'KE-2026-1028',
    name: 'Kassandra Adeyinka',
    email: 'kassy.ade@gmail.com',
    phone: '08166554433',
    location: 'Abuja, Nigeria',
    referral: 'Friend Recommendation',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Fully paid and verified. Confirmed enrollment in early bird Phase 1 list. High potential creator.',
    phaseNum: 1,
    amountPaid: 6000, // ₦1,000 + ₦5,000
    createdAt: '2026-07-09T08:00:00Z',
    updatedAt: '2026-07-10T11:00:00Z',
    evaluatedAt: '2026-07-09T18:00:00Z',
    enrolledAt: '2026-07-10T11:00:00Z'
  },
  {
    id: 'KE-2026-1029',
    name: 'Amara Okafor',
    email: 'amara.okafor@gmail.com',
    phone: '08031234567',
    location: 'Lagos, Nigeria',
    referral: 'Instagram Video',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Early bird Phase 1 student.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-08T09:00:00Z',
    updatedAt: '2026-07-08T14:00:00Z',
    evaluatedAt: '2026-07-08T11:00:00Z',
    enrolledAt: '2026-07-08T14:00:00Z'
  },
  {
    id: 'KE-2026-1030',
    name: 'Babajide Balogun',
    email: 'babajide.b@yahoo.com',
    phone: '08022345678',
    location: 'Abuja, Nigeria',
    referral: 'TikTok Ad',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. High potential UGC creator.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-08T10:15:00Z',
    updatedAt: '2026-07-08T16:30:00Z',
    evaluatedAt: '2026-07-08T12:00:00Z',
    enrolledAt: '2026-07-08T16:30:00Z'
  },
  {
    id: 'KE-2026-1031',
    name: 'Blessing Effiong',
    email: 'blessing.effiong@gmail.com',
    phone: '08153456789',
    location: 'Calabar, Nigeria',
    referral: 'WhatsApp Status',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Excited about mobile storytelling.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-08T11:00:00Z',
    updatedAt: '2026-07-09T09:00:00Z',
    evaluatedAt: '2026-07-08T15:00:00Z',
    enrolledAt: '2026-07-09T09:00:00Z'
  },
  {
    id: 'KE-2026-1032',
    name: 'Daniel Alabi',
    email: 'daniel.alabi@hotmail.com',
    phone: '09044567890',
    location: 'Ibadan, Nigeria',
    referral: 'Friend Recommendation',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Already doing basic mobile editing.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-08T12:00:00Z',
    updatedAt: '2026-07-09T10:00:00Z',
    evaluatedAt: '2026-07-08T16:00:00Z',
    enrolledAt: '2026-07-09T10:00:00Z'
  },
  {
    id: 'KE-2026-1033',
    name: 'Emeka Nwosu',
    email: 'emeka.nwosu@gmail.com',
    phone: '07035678901',
    location: 'Owerri, Nigeria',
    referral: 'Twitter (X)',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Tech-savvy and committed student.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-07T14:30:00Z',
    updatedAt: '2026-07-08T10:00:00Z',
    evaluatedAt: '2026-07-07T18:00:00Z',
    enrolledAt: '2026-07-08T10:00:00Z'
  },
  {
    id: 'KE-2026-1034',
    name: 'Favour Johnson',
    email: 'favour.j@gmail.com',
    phone: '08166789012',
    location: 'Port Harcourt, Nigeria',
    referral: 'Facebook Group',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Highly recommended in the community.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-07T15:00:00Z',
    updatedAt: '2026-07-08T11:00:00Z',
    evaluatedAt: '2026-07-07T19:00:00Z',
    enrolledAt: '2026-07-08T11:00:00Z'
  },
  {
    id: 'KE-2026-1035',
    name: 'Grace Adebayo',
    email: 'grace.adebayo@gmail.com',
    phone: '08077890123',
    location: 'Lagos, Nigeria',
    referral: 'YouTube',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Creative background, keen on CapCut keyframes.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-07T16:00:00Z',
    updatedAt: '2026-07-08T12:00:00Z',
    evaluatedAt: '2026-07-07T20:00:00Z',
    enrolledAt: '2026-07-08T12:00:00Z'
  },
  {
    id: 'KE-2026-1036',
    name: 'Ibrahim Bello',
    email: 'ibrahim.bello@yahoo.com',
    phone: '09088901234',
    location: 'Kano, Nigeria',
    referral: 'Instagram Video',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Ready for the live sessions.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-06T10:00:00Z',
    updatedAt: '2026-07-07T09:00:00Z',
    evaluatedAt: '2026-07-06T14:00:00Z',
    enrolledAt: '2026-07-07T09:00:00Z'
  },
  {
    id: 'KE-2026-1037',
    name: 'Joy Isaiah',
    email: 'joy.isaiah@gmail.com',
    phone: '07199012345',
    location: 'Kaduna, Nigeria',
    referral: 'WhatsApp Status',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. High potential brand content creator.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-06T11:00:00Z',
    updatedAt: '2026-07-07T10:00:00Z',
    evaluatedAt: '2026-07-06T15:00:00Z',
    enrolledAt: '2026-07-07T10:00:00Z'
  },
  {
    id: 'KE-2026-1038',
    name: 'Michael Okon',
    email: 'michael.okon@gmail.com',
    phone: '08100123456',
    location: 'Uyo, Nigeria',
    referral: 'Twitter (X)',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Wants to scale his freelance UGC agency.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-05T14:00:00Z',
    evaluatedAt: '2026-07-05T11:00:00Z',
    enrolledAt: '2026-07-05T14:00:00Z'
  },
  {
    id: 'KE-2026-1039',
    name: 'Nkechi Egwu',
    email: 'nkechi.egwu@gmail.com',
    phone: '08011234567',
    location: 'Enugu, Nigeria',
    referral: 'TikTok Ad',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Very committed and creative student.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-05T10:15:00Z',
    updatedAt: '2026-07-05T16:30:00Z',
    evaluatedAt: '2026-07-05T12:00:00Z',
    enrolledAt: '2026-07-05T16:30:00Z'
  },
  {
    id: 'KE-2026-1040',
    name: 'Opeyemi Ajayi',
    email: 'opeyemi.ajayi@gmail.com',
    phone: '08122345678',
    location: 'Lagos, Nigeria',
    referral: 'Friend Recommendation',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Ready to start content generation.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-04T11:00:00Z',
    updatedAt: '2026-07-04T15:00:00Z',
    evaluatedAt: '2026-07-04T13:00:00Z',
    enrolledAt: '2026-07-04T15:00:00Z'
  },
  {
    id: 'KE-2026-1041',
    name: 'Prince Harrison',
    email: 'prince.h@gmail.com',
    phone: '09033456789',
    location: 'Warri, Nigeria',
    referral: 'Facebook Group',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Eager to master Kling AI animation.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-03T14:30:00Z',
    updatedAt: '2026-07-04T10:00:00Z',
    evaluatedAt: '2026-07-03T18:00:00Z',
    enrolledAt: '2026-07-04T10:00:00Z'
  },
  {
    id: 'KE-2026-1042',
    name: 'Sandra Udoh',
    email: 'sandra.udoh@gmail.com',
    phone: '07044567890',
    location: 'Port Harcourt, Nigeria',
    referral: 'Instagram Video',
    status: ApplicationStatus.ENROLLED,
    regReceiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    trainingReceiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60',
    adminNotes: 'Verified enrollment. Active video creator looking to learn professional prompts.',
    phaseNum: 1,
    amountPaid: 6000,
    createdAt: '2026-07-03T15:00:00Z',
    updatedAt: '2026-07-04T11:00:00Z',
    evaluatedAt: '2026-07-03T19:00:00Z',
    enrolledAt: '2026-07-04T11:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'n-1',
    title: 'New Applicant Received',
    message: 'Samuel Chukwu applied from Lagos, Nigeria. Awaiting registration fee verification.',
    timestamp: '2026-07-13T10:30:00Z',
    isRead: false,
    link: 'applicants'
  },
  {
    id: 'n-2',
    title: 'Training Receipt Uploaded',
    message: 'Ebenezer Williams uploaded a ₦5,000 screenshot receipt. Please verify and confirm enrollment.',
    timestamp: '2026-07-13T12:10:00Z',
    isRead: false,
    link: 'applicants'
  }
];
