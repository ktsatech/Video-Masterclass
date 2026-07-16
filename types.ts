export enum ApplicationStatus {
  PENDING_REG = 'pending_reg',         // Applied, awaiting review of N1,000 registration fee receipt
  REG_CONFIRMED = 'reg_confirmed',     // Registration fee verified, WhatsApp evaluation contact sent
  EVALUATED = 'evaluated',             // Screened & approved on WhatsApp, awaiting N5,000 training fee
  PENDING_TRAINING = 'pending_training', // Training fee receipt uploaded, awaiting admin verification
  ENROLLED = 'enrolled',               // Fully enrolled in the masterclass with full classroom access
  REJECTED = 'rejected'                // Rejected at some stage
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  referral: string;
  status: ApplicationStatus;
  regReceiptUrl: string | null;        // Base64 simulated receipt for registration fee
  trainingReceiptUrl: string | null;   // Base64 simulated receipt for training fee
  adminNotes: string;
  phaseNum: number;
  amountPaid: number;                  // Total paid in Naira so far
  createdAt: string;
  updatedAt: string;
  evaluatedAt?: string;
  enrolledAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;                  // YouTube embed link (can be live stream or replay video)
  isLive: boolean;                     // true for upcoming/live, false for archived recording
  scheduledAt: string;                 // ISO string or display date
  duration: string;                    // e.g. "1 hour 30 mins"
  resources: { title: string; url: string }[];
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  avatarUrl: string;
  courseName: string;
  isVisible: boolean;
}

export interface SystemStats {
  phase1Slots: number;
  phase2PlusSlotsPerPhase: number;
  phase1Price: number;                 // N1,000
  phase2PlusPrice: number;             // N10,000
  startDate: string;                   // '2026-07-20T10:00:00'
  whatsappNumber: string;              // '+2349163152202'
  whatsappLink: string;                // 'https://wa.me/2349163152202'
  adminNotificationEmails: string[];
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link: string;
}
