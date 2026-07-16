import React, { createContext, useContext, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { ApplicationStatus, Applicant, Lesson, Testimonial, SystemStats, AdminUser, AdminNotification } from '../types';
import { INITIAL_STATS, INITIAL_ADMIN_USERS, INITIAL_TESTIMONIALS, INITIAL_LESSONS, INITIAL_APPLICANTS, INITIAL_NOTIFICATIONS } from '../data';

interface AppContextType {
  stats: SystemStats;
  applicants: Applicant[];
  lessons: Lesson[];
  testimonials: Testimonial[];
  notifications: AdminNotification[];
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
  currentStudent: Applicant | null;
  emailLogs: { id: string; to: string; subject: string; body: string; timestamp: string }[];
  phaseInfo: {
    currentPhase: number;
    totalEnrolled: number;
    price: number;
    slotsLimit: number;
    slotsRemaining: number;
    switchCounter: number; // slots remaining in current phase before price/phase switches
  };
  emailConfig: {
    serviceId1: string;
    publicKey1: string;
    serviceId2: string;
    publicKey2: string;
    templateIdStudent: string;
    templateIdAdmin: string;
  };
  updateEmailConfig: (config: { serviceId1: string; publicKey1: string; serviceId2: string; publicKey2: string; templateIdStudent: string; templateIdAdmin: string }) => void;
  
  // Auth actions
  loginAdmin: (email: string) => boolean;
  logoutAdmin: () => void;
  loginStudent: (email: string, phone: string) => boolean;
  logoutStudent: () => void;
  signupStudent: (data: { name: string; email: string; phone: string; location: string; referral: string; regReceiptUrl: string }) => { success: boolean; applicant?: Applicant; error?: string };

  // Applicant workflow actions
  updateApplicantStatus: (id: string, status: ApplicationStatus, notes: string) => void;
  uploadTrainingFeeReceipt: (id: string, receiptUrl: string) => boolean;
  
  // Admin crud operations
  addLesson: (lesson: Omit<Lesson, 'id'>) => void;
  editLesson: (lesson: Lesson) => void;
  deleteLesson: (id: string) => void;
  addTestimonial: (test: Omit<Testimonial, 'id' | 'isVisible'>) => void;
  toggleTestimonialVisibility: (id: string) => void;
  addAdminUser: (email: string, name: string) => boolean;
  removeAdminUser: (email: string) => void;
  updateStats: (updated: Partial<SystemStats>) => void;
  clearAllNotifications: () => void;
  markNotificationAsRead: (id: string) => void;

  // Recording sale action
  purchaseRecording: (email: string, recordingTitle: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Load initial states from localStorage or use pre-seeded data
  const [stats, setStats] = useState<SystemStats>(() => {
    const saved = localStorage.getItem('ke_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [applicants, setApplicants] = useState<Applicant[]>(() => {
    const saved = localStorage.getItem('ke_applicants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Applicant[];
        const enrolledCount = parsed.filter(a => a.status === ApplicationStatus.ENROLLED).length;
        if (enrolledCount < 15) {
          // Merge to keep new user-registered applicants, but ensure the full initial list of 15 enrolled is present
          const initialIds = new Set(INITIAL_APPLICANTS.map(a => a.id));
          const uniqueExisting = parsed.filter(a => !initialIds.has(a.id));
          return [...uniqueExisting, ...INITIAL_APPLICANTS];
        }
        return parsed;
      } catch (e) {
        return INITIAL_APPLICANTS;
      }
    }
    return INITIAL_APPLICANTS;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('ke_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('ke_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('ke_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('ke_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('ke_current_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentStudent, setCurrentStudent] = useState<Applicant | null>(() => {
    const saved = localStorage.getItem('ke_current_student');
    return saved ? JSON.parse(saved) : null;
  });

  const [emailLogs, setEmailLogs] = useState<{ id: string; to: string; subject: string; body: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem('ke_email_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [emailConfig, setEmailConfig] = useState(() => {
    const saved = localStorage.getItem('ke_email_config');
    const defaultConfig = {
      serviceId1: 'service_h3cznza', // ktesatech.reception.co@gmail.com
      publicKey1: '',
      serviceId2: 'service_2rawvt8', // kingelidexaivideoeditor@gmail.com
      publicKey2: '',
      templateIdStudent: 'template_student',
      templateIdAdmin: 'template_admin'
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = { ...defaultConfig, ...parsed };
        
        // Backward compatibility migration for keys and service IDs
        if (parsed.publicKey && !parsed.publicKey1) {
          migrated.publicKey1 = parsed.publicKey;
        }
        if (parsed.publicKey && !parsed.publicKey2) {
          migrated.publicKey2 = parsed.publicKey;
        }
        if (parsed.serviceId && !parsed.serviceId1) {
          migrated.serviceId1 = parsed.serviceId;
        }
        return migrated;
      } catch (e) {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  // Save changes to localStorage on state updates
  useEffect(() => {
    localStorage.setItem('ke_email_config', JSON.stringify(emailConfig));
  }, [emailConfig]);

  const updateEmailConfig = (config: { serviceId1: string; publicKey1: string; serviceId2: string; publicKey2: string; templateIdStudent: string; templateIdAdmin: string }) => {
    setEmailConfig(config);
  };

  // Save changes to localStorage on state updates
  useEffect(() => {
    localStorage.setItem('ke_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('ke_applicants', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem('ke_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('ke_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('ke_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ke_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('ke_current_admin', currentAdmin ? JSON.stringify(currentAdmin) : '');
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem('ke_current_student', currentStudent ? JSON.stringify(currentStudent) : '');
  }, [currentStudent]);

  useEffect(() => {
    localStorage.setItem('ke_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // Dynamic Phase and Pricing Calculations
  const enrolledApplicants = applicants.filter(a => a.status === ApplicationStatus.ENROLLED);
  const totalEnrolled = enrolledApplicants.length;

  let currentPhase = 1;
  let price = stats.phase1Price; // N5,000 for training, N1,000 total registration (Phase 1 price is N5,000 training as per agreement)
  let slotsLimit = stats.phase1Slots; // Phase 1 has 50 slots
  let slotsRemaining = slotsLimit - totalEnrolled;
  let switchCounter = slotsRemaining;

  if (totalEnrolled >= stats.phase1Slots) {
    // We are in Phase 2 or higher
    const overflow = totalEnrolled - stats.phase1Slots;
    currentPhase = 2 + Math.floor(overflow / stats.phase2PlusSlotsPerPhase);
    price = stats.phase2PlusPrice; // N10,000
    slotsLimit = stats.phase2PlusSlotsPerPhase;
    
    // Remaining in current Phase of 450
    const relativeEnrolledInPhase = overflow % stats.phase2PlusSlotsPerPhase;
    slotsRemaining = stats.phase2PlusSlotsPerPhase - relativeEnrolledInPhase;
    switchCounter = slotsRemaining;
  }

  const phaseInfo = {
    currentPhase,
    totalEnrolled,
    price,
    slotsLimit,
    slotsRemaining,
    switchCounter
  };

  // Log a simulated email AND dispatch real EmailJS email if credentials are set
  const triggerEmail = (to: string, subject: string, body: string, recipientName = 'Student') => {
    const newLog = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      body,
      timestamp: new Date().toISOString()
    };
    setEmailLogs(prev => [newLog, ...prev]);

    // Send actual EmailJS student notification if configured
    // Prioritize Service 2 (kingelidexaivideoeditor@gmail.com) for students
    if (emailConfig.serviceId2 && emailConfig.templateIdStudent && emailConfig.publicKey2) {
      const templateParams = {
        to_email: to,
        to_name: recipientName,
        subject: subject,
        message: body,
        from_name: 'King Elidex Academy',
        reply_to: 'kingelidexaivideoeditor@gmail.com'
      };

      emailjs.send(
        emailConfig.serviceId2,
        emailConfig.templateIdStudent,
        templateParams,
        { publicKey: emailConfig.publicKey2 }
      ).then(
        (response) => {
          console.log('SUCCESS! Real student email sent via Service 2 (King Elidex).', response.status, response.text);
        },
        (error) => {
          console.error('FAILED to send real student email via Service 2...', error);
        }
      );
    } else if (emailConfig.serviceId1 && emailConfig.templateIdStudent && emailConfig.publicKey1) {
      // Fallback to Service 1 (ktesatech)
      const templateParams = {
        to_email: to,
        to_name: recipientName,
        subject: subject,
        message: body,
        from_name: 'King Elidex Academy',
        reply_to: 'ktesatech.reception.co@gmail.com'
      };

      emailjs.send(
        emailConfig.serviceId1,
        emailConfig.templateIdStudent,
        templateParams,
        { publicKey: emailConfig.publicKey1 }
      ).then(
        (response) => {
          console.log('SUCCESS! Real student email sent via Service 1 (Ktesatech).', response.status, response.text);
        },
        (error) => {
          console.error('FAILED to send real student email via Service 1...', error);
        }
      );
    }
  };

  // Trigger Admin email alert to all admin users on file + general mail
  const alertAdmins = (subject: string, body: string) => {
    // Send to default contacts + other registered admins in simulated logger
    triggerEmail('elijahadeyinka75@gmail.com', `[ADMIN ALERT] ${subject}`, body, 'Admin Elijah');
    triggerEmail('kingelidexaivideoeditor@gmail.com', `[ADMIN ALERT] ${subject}`, body, 'Admin King Elidex');
    triggerEmail('ktesatech.reception.co@gmail.com', `[ADMIN ALERT] ${subject}`, body, 'Admin Reception');
    
    // Send to other registered admins in simulated logger
    adminUsers.forEach(admin => {
      triggerEmail(admin.email, `[ADMIN ALERT] ${subject}`, body, `Admin ${admin.name}`);
    });

    // Send actual EmailJS alert to ktesatech.reception.co@gmail.com via Service 1 (service_h3cznza)
    if (emailConfig.serviceId1 && emailConfig.templateIdAdmin && emailConfig.publicKey1) {
      const templateParams = {
        to_email: 'ktesatech.reception.co@gmail.com',
        to_name: 'Admin Reception',
        subject: subject,
        message: body,
        from_name: 'King Elidex Portal',
        reply_to: 'no-reply@kingelidex.com'
      };

      emailjs.send(
        emailConfig.serviceId1,
        emailConfig.templateIdAdmin,
        templateParams,
        { publicKey: emailConfig.publicKey1 }
      ).then(
        (response) => {
          console.log('SUCCESS! Real admin alert email sent to ktesatech.reception.co@gmail.com via Service 1.', response.status, response.text);
        },
        (error) => {
          console.error('FAILED to send real admin alert to ktesatech.reception.co@gmail.com...', error);
        }
      );
    }

    // Send actual EmailJS alert to kingelidexaivideoeditor@gmail.com via Service 2 (service_2rawvt8)
    if (emailConfig.serviceId2 && emailConfig.templateIdAdmin && emailConfig.publicKey2) {
      const templateParams = {
        to_email: 'kingelidexaivideoeditor@gmail.com',
        to_name: 'Admin King Elidex',
        subject: subject,
        message: body,
        from_name: 'King Elidex Portal',
        reply_to: 'no-reply@kingelidex.com'
      };

      emailjs.send(
        emailConfig.serviceId2,
        emailConfig.templateIdAdmin,
        templateParams,
        { publicKey: emailConfig.publicKey2 }
      ).then(
        (response) => {
          console.log('SUCCESS! Real admin alert email sent to kingelidexaivideoeditor@gmail.com via Service 2.', response.status, response.text);
        },
        (error) => {
          console.error('FAILED to send real admin alert to kingelidexaivideoeditor@gmail.com...', error);
        }
      );
    }

    // Also send to elijahadeyinka75@gmail.com via whichever is configured
    const elijahServiceId = emailConfig.serviceId2 && emailConfig.publicKey2 ? emailConfig.serviceId2 : emailConfig.serviceId1;
    const elijahPublicKey = emailConfig.serviceId2 && emailConfig.publicKey2 ? emailConfig.publicKey2 : emailConfig.publicKey1;
    if (elijahServiceId && emailConfig.templateIdAdmin && elijahPublicKey) {
      const templateParams = {
        to_email: 'elijahadeyinka75@gmail.com',
        to_name: 'Admin Elijah',
        subject: subject,
        message: body,
        from_name: 'King Elidex Portal',
        reply_to: 'no-reply@kingelidex.com'
      };

      emailjs.send(
        elijahServiceId,
        emailConfig.templateIdAdmin,
        templateParams,
        { publicKey: elijahPublicKey }
      ).then(
        (response) => {
          console.log('SUCCESS! Real admin alert email sent to elijahadeyinka75@gmail.com.', response.status, response.text);
        },
        (error) => {
          console.error('FAILED to send real admin alert to elijahadeyinka75@gmail.com...', error);
        }
      );
    }
  };

  // LOGIN ACTIONS
  const loginAdmin = (email: string) => {
    const admin = adminUsers.find(a => a.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (admin) {
      setCurrentAdmin(admin);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
  };

  const loginStudent = (email: string, phone: string) => {
    const student = applicants.find(
      a => a.email.toLowerCase().trim() === email.toLowerCase().trim() && 
      a.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
    );
    if (student) {
      setCurrentStudent(student);
      return true;
    }
    return false;
  };

  const logoutStudent = () => {
    setCurrentStudent(null);
  };

  // SIGNUP / REGISTER STUDENT
  const signupStudent = (data: { name: string; email: string; phone: string; location: string; referral: string; regReceiptUrl: string }) => {
    // Check if email already registered
    const exists = applicants.find(a => a.email.toLowerCase().trim() === data.email.toLowerCase().trim());
    if (exists) {
      return { success: false, error: 'This email is already registered. Please check your status or log in to your portal.' };
    }

    const uniqueId = `KE-2026-${1000 + applicants.length + 1}`;
    const newApplicant: Applicant = {
      id: uniqueId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      referral: data.referral,
      status: ApplicationStatus.PENDING_REG,
      regReceiptUrl: data.regReceiptUrl,
      trainingReceiptUrl: null,
      adminNotes: 'Applicant registered. Awaiting ₦1,000 Registration Fee verification.',
      phaseNum: phaseInfo.currentPhase,
      amountPaid: 0, // N1,000 pending verification
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setApplicants(prev => [newApplicant, ...prev]);

    // Send emails
    // EMAIL 1 — On Form Submission (To Student)
    const studentBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        KING ELIDEX | AI VIDEO EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${data.name.split(' ')[0]},

Thank you for taking the first step towards becoming a professional AI Video Creator.

Your application for the AI Video Editing Masterclass 2026 has been received successfully.

─────────────────────────────────────────
  NEXT STEP: Complete Your Registration Payment
─────────────────────────────────────────

To secure your place in the review queue, pay the non-refundable Registration Form Fee of ₦1,000.

  BANK:    PalmPay
  NAME:    Elijah Adeyinka
  ACCT:    9163152202

Since you uploaded your receipt, our team is currently verifying the payment.

Only confirmed payments proceed to evaluation.

─────────────────────────────────────────
  IMPORTANT NOTICE
─────────────────────────────────────────
Registration fee payment does NOT guarantee admission. Admission is confirmed only after a successful evaluation and payment of the training fee.

Only ${phaseInfo.slotsRemaining} spots remain in Phase ${phaseInfo.currentPhase}.
Act fast — early bird pricing ends soon.

Questions? WhatsApp: ${stats.whatsappNumber}

Learn AI. Create Content. Build Value.
— King Elidex
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    triggerEmail(data.email, 'Your Application Has Been Received — AI Video Editing Masterclass 2026', studentBody);

    // EMAIL 6 — Admin Alert (To Elijah + Admins)
    const adminAlertBody = `
New registration received on the Masterclass portal.

  Applicant Name:    ${data.name}
  Email:             ${data.email}
  Phone:             ${data.phone}
  Location:          ${data.location}
  Referral Source:   ${data.referral}
  Time:              ${new Date().toLocaleString()}

→ View and action this registration on your dashboard.
  
— King Elidex Portal
    `;
    alertAdmins(`[NEW REGISTRATION] ${data.name} — Action Required`, adminAlertBody);

    // Create Admin notification
    const newNotification: AdminNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Applicant Received',
      message: `${data.name} applied from ${data.location}. Awaiting registration receipt review.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      link: 'applicants'
    };
    setNotifications(prev => [newNotification, ...prev]);

    return { success: true, applicant: newApplicant };
  };

  // STUDENT UPLOADS TRAINING FEE RECEIPT
  const uploadTrainingFeeReceipt = (id: string, receiptUrl: string) => {
    let success = false;
    setApplicants(prev => prev.map(a => {
      if (a.id === id) {
        success = true;
        const updated = {
          ...a,
          status: ApplicationStatus.PENDING_TRAINING,
          trainingReceiptUrl: receiptUrl,
          adminNotes: 'Uploaded ₦' + (a.phaseNum === 1 ? '5,000' : '10,000') + ' training receipt. Awaiting admin verification.',
          updatedAt: new Date().toISOString()
        };
        // If logged in student is the one updating
        if (currentStudent && currentStudent.id === id) {
          setCurrentStudent(updated);
        }
        
        // Notify admins
        const adminBody = `
Training payment receipt uploaded by ${a.name}.

  Email:             ${a.email}
  Phone:             ${a.phone}
  Phase Registered:  Phase ${a.phaseNum}
  Expected Fee:      ₦${a.phaseNum === 1 ? '5,000' : '10,000'}
  Time:              ${new Date().toLocaleString()}

Please log in to verify the receipt screenshot and confirm the student's enrollment.

— King Elidex Portal
        `;
        alertAdmins(`[PAYMENT UPLOAD] ${a.name} uploaded Training Receipt`, adminBody);

        // Add admin panel notification
        const newNotif: AdminNotification = {
          id: `notif-${Date.now()}`,
          title: 'Training Receipt Uploaded',
          message: `${a.name} uploaded training fee receipt. Please verify and confirm enrollment.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          link: 'applicants'
        };
        setNotifications(prevNotif => [newNotif, ...prevNotif]);

        return updated;
      }
      return a;
    }));
    return success;
  };

  // UPDATE APPLICANT STATUS & TRIGGER EMAILS (Admin actions)
  const updateApplicantStatus = (id: string, status: ApplicationStatus, notes: string) => {
    setApplicants(prev => prev.map(a => {
      if (a.id === id) {
        let amountPaid = a.amountPaid;
        let evaluatedAt = a.evaluatedAt;
        let enrolledAt = a.enrolledAt;

        // Automatically set payments or times based on transition
        if (status === ApplicationStatus.REG_CONFIRMED && a.status === ApplicationStatus.PENDING_REG) {
          amountPaid = 1000; // Registration fee confirmed
        } else if (status === ApplicationStatus.EVALUATED) {
          evaluatedAt = new Date().toISOString();
        } else if (status === ApplicationStatus.ENROLLED && a.status === ApplicationStatus.PENDING_TRAINING) {
          amountPaid = a.phaseNum === 1 ? 6000 : 11000; // Reg (1k) + Training fee
          enrolledAt = new Date().toISOString();
        }

        const updated = {
          ...a,
          status,
          amountPaid,
          evaluatedAt,
          enrolledAt,
          adminNotes: notes || a.adminNotes,
          updatedAt: new Date().toISOString()
        };

        // If current student is affected, update session too
        if (currentStudent && currentStudent.id === id) {
          setCurrentStudent(updated);
        }

        // TRIGGER OUTBOUND AUTOMATIC EMAILS FOR APPLICANT
        const recipientName = a.name.split(' ')[0];

        if (status === ApplicationStatus.REG_CONFIRMED) {
          // EMAIL 2 — Registration Fee Confirmed
          const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        KING ELIDEX | AI VIDEO EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${recipientName},

Your ₦1,000 registration payment has been verified and approved.

Your application is now active in our system.

─────────────────────────────────────────
  WHAT HAPPENS NEXT
─────────────────────────────────────────

Our team will personally review your application and reach out to you via WhatsApp for a brief evaluation session.

To initiate contact and receive further instructions, send a WhatsApp message to:

        ${stats.whatsappNumber}

Message us with:
"Hi, I am ${a.name} — Masterclass Applicant"

Or click this link to open WhatsApp directly: ${stats.whatsappLink}

─────────────────────────────────────────
  YOUR APPLICATION DETAILS
─────────────────────────────────────────
  Application ID:  ${a.id}
  Name:            ${a.name}
  Email:           ${a.email}
  Status:          Registration Confirmed ✓
  Date:            ${new Date().toLocaleDateString()}

We look forward to speaking with you.

Learn AI. Create Content. Build Value.
— King Elidex
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `;
          triggerEmail(a.email, 'Payment Verified — Here Is Your Next Step [Action Required]', emailBody);

          // Direct email alert to admins
          alertAdmins(
            `[REGISTRATION APPROVED] ${a.name} Registration Confirmed`,
            `The registration payment of ₦1,000 for ${a.name} (${a.email}) has been verified and approved.
            
  Applicant Name:    ${a.name}
  Email:             ${a.email}
  Phone:             ${a.phone}
  Status:            REGISTRATION CONFIRMED ✓
  Time:              ${new Date().toLocaleString()}

The applicant has been notified and instructed to message the team on WhatsApp for evaluation.

— King Elidex Portal`
          );
        } else if (status === ApplicationStatus.REJECTED) {
          // EMAIL 3 — Rejected at Registration Stage
          const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        KING ELIDEX | AI VIDEO EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${recipientName},

Thank you for your interest in the AI Video Editing Masterclass 2026.

Unfortunately, we were unable to verify your registration payment or approve your evaluation. This may be due to:

  → Receipt was unclear or incomplete
  → Payment was not made to the correct account
  → Amount paid did not match the required fee
  → Screen criteria or commitment evaluation did not meet requirements

─────────────────────────────────────────
  WHAT TO DO
─────────────────────────────────────────
If you believe this is an error or wish to re-apply, please contact us immediately on WhatsApp:

        ${stats.whatsappNumber}

We are happy to resolve any issues with you directly.

Learn AI. Create Content. Build Value.
— King Elidex
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `;
          triggerEmail(a.email, 'Update on Your Application — AI Video Editing Masterclass 2026', emailBody);

          // Direct email alert to admins
          alertAdmins(
            `[APPLICATION REJECTED] ${a.name} marked as Rejected`,
            `The application for ${a.name} (${a.email}) has been rejected.
            
  Applicant Name:    ${a.name}
  Email:             ${a.email}
  Phone:             ${a.phone}
  Status:            REJECTED ✗
  Notes:             ${notes || 'No reason provided'}
  Time:              ${new Date().toLocaleString()}

The applicant has been notified of the rejection via email.

— King Elidex Portal`
          );
        } else if (status === ApplicationStatus.EVALUATED) {
          // EMAIL 4 — Approved for Training (After WhatsApp evaluation)
          const fee = a.phaseNum === 1 ? '5,000' : '10,000';
          const regPrice = a.phaseNum === 1 ? '20,000' : '20,000';
          const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        KING ELIDEX | AI VIDEO EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${recipientName},

CONGRATULATIONS.

After careful review and your WhatsApp screening session, you have been selected to join the AI Video Editing Masterclass 2026!

─────────────────────────────────────────
  SECURE YOUR SPOT — FINAL STEP
─────────────────────────────────────────

To lock in your enrollment, complete your Training Fee payment of ₦${fee}.

  BANK:    PalmPay
  NAME:    Elijah Adeyinka
  ACCT:    9163152202

  NOTE: Early Bird Price — ₦${fee}
        (Regular Price: ₦${regPrice})
        Only for approved Phase ${a.phaseNum} applicants.

After payment:
→ Screenshot your receipt
→ Log in and upload it at: ${window.location.origin}/#/portal

─────────────────────────────────────────
  YOUR PROGRAM DETAILS
─────────────────────────────────────────
  Start Date:  20th July 2026
  Duration:    1 Month Intensive
  Platform:    WhatsApp Live + Portal Replays
  Certificate: Yes, upon completion

Spots are extremely limited. Please complete your payment within 48 hours to hold your seat.

Questions? WhatsApp: ${stats.whatsappNumber}

Learn AI. Create Content. Build Value.
— King Elidex
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `;
          triggerEmail(a.email, 'Congratulations — You Have Been Selected for Masterclass 2026', emailBody);

          // Direct email alert to admins
          alertAdmins(
            `[EVALUATION APPROVED] ${a.name} Selected for Masterclass`,
            `Applicant ${a.name} (${a.email}) has passed the WhatsApp evaluation screening and is approved to join the program.
            
  Applicant Name:    ${a.name}
  Email:             ${a.email}
  Phone:             ${a.phone}
  Status:            EVALUATED & APPROVED ✓
  Notes:             ${notes || 'Approved during WhatsApp screening'}
  Expected Tuition:  ₦${fee} (Phase ${a.phaseNum})
  Time:              ${new Date().toLocaleString()}

An official selection email has been sent to the student with instructions to pay their tuition fee.

— King Elidex Portal`
          );
        } else if (status === ApplicationStatus.ENROLLED) {
          // EMAIL 5 — Fully Enrolled
          const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        KING ELIDEX | AI VIDEO EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${recipientName},

WELCOME TO THE FAMILY.

Your training fee has been confirmed. You are now officially enrolled in the AI Video Editing Masterclass 2026!

─────────────────────────────────────────
  YOUR ENROLLMENT IS CONFIRMED
────────────────━━━━━━━━━
  Name:       ${a.name}
  Program:    AI Video Editing Masterclass 2026
  Start Date: 20th July 2026
  Duration:   1 Month Intensive Training
  Platform:   WhatsApp (Live + Recordings)
  Status:     FULLY ENROLLED ✓

─────────────────────────────────────────
  WHAT TO EXPECT
─────────────────────────────────────────
  ✓ Live interactive sessions on WhatsApp
  ✓ Recorded lessons for lifetime replay on our Student Portal
  ✓ Premium AI prompts and resources
  ✓ Certificate of completion
  ✓ Lifetime support from King Elidex

Your private class link and group details will be sent to you before training begins on July 20, 2026.

Your credentials to log in to our student portal:
  URL:       ${window.location.origin}/#/portal
  Email:     ${a.email}
  Password:  Use your registered phone number to sign in!

Stay ready. Your transformation starts soon.

Learn AI. Create Content. Build Value.
— King Elidex
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `;
          triggerEmail(a.email, 'You Are Officially Enrolled — Welcome to Masterclass 2026', emailBody);

          // Direct email alert to admins
          alertAdmins(
            `[ENROLLMENT APPROVED] ${a.name} Officially Enrolled!`,
            `Congratulations! ${a.name} (${a.email}) tuition payment has been verified and they are now fully enrolled in the AI Video Editing Masterclass 2026.
            
  Student Name:      ${a.name}
  Email:             ${a.email}
  Phone:             ${a.phone}
  Status:            FULLY ENROLLED ✓
  Phase:             Phase ${a.phaseNum}
  Total Confirmed:   ${enrolledApplicants.length + 1} students enrolled
  Time:              ${new Date().toLocaleString()}

Classroom access has been unlocked for the student. They can now log in using their email and phone number.

— King Elidex Portal`
          );
        }

        return updated;
      }
      return a;
    }));
  };

  // ADMIN OPERATIONS
  const addLesson = (newLesson: Omit<Lesson, 'id'>) => {
    const lesson: Lesson = {
      ...newLesson,
      id: `lesson-${Date.now()}`
    };
    setLessons(prev => {
      const updated = [...prev, lesson];
      return updated.sort((a, b) => a.order - b.order);
    });
  };

  const editLesson = (updatedLesson: Lesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l).sort((a, b) => a.order - b.order));
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const addTestimonial = (newTest: Omit<Testimonial, 'id' | 'isVisible'>) => {
    const testimonial: Testimonial = {
      ...newTest,
      id: `test-${Date.now()}`,
      isVisible: true
    };
    setTestimonials(prev => [testimonial, ...prev]);
  };

  const toggleTestimonialVisibility = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isVisible: !t.isVisible } : t));
  };

  const addAdminUser = (email: string, name: string) => {
    const exists = adminUsers.find(a => a.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (exists) return false;

    const newAdmin: AdminUser = {
      email: email.toLowerCase().trim(),
      name,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    setAdminUsers(prev => [...prev, newAdmin]);
    return true;
  };

  const removeAdminUser = (email: string) => {
    // Cannot delete the super admin
    if (email === 'ktesatech.reception.co@gmail.com') return;
    setAdminUsers(prev => prev.filter(a => a.email !== email));
  };

  const updateStats = (updated: Partial<SystemStats>) => {
    setStats(prev => ({ ...prev, ...updated }));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // SELL LINKS TO PREVIOUS CLASS RECORDINGS (₦1,000 Naira each)
  const purchaseRecording = (email: string, recordingTitle: string) => {
    // Generate sales log
    const receiptBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        KING ELIDEX | ARCHIVE REC SALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello Creator,

We have verified your ₦1,000 archive purchase payment.

Here is your private link to the previous class recording:

  Class Name:  ${recordingTitle}
  Price Paid:  ₦1,000 (Naira)
  Access Code: ELIDEX-ARCHIVE-99827

  PRIVATE ACCESS LINK:
  https://www.youtube.com/watch?v=dQw4w9WgXcQ

Please do not share this link with anyone else. Violating this terms will terminate your archive access.

If you have any issues accessing the recording, contact:
kingelidexaivideoeditor@gmail.com

Keep Creating Value!
— King Elidex Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    // Send email to student
    triggerEmail(email, `Recording Access Granted: ${recordingTitle}`, receiptBody);

    // Notify admins of recording sale
    const adminBody = `
Archive Recording purchased!

  Buyer Email:      ${email}
  Recording Name:   ${recordingTitle}
  Amount Received:  ₦1,000 (Naira)
  Time:             ${new Date().toLocaleString()}

Funds verified and link automatically delivered.

— King Elidex Portal
    `;
    alertAdmins(`[SALE ALERT] ₦1,000 recording sold to ${email}`, adminBody);

    // Create Notification
    const newNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      title: 'Archive Recording Sold',
      message: `₦1,000 sale to ${email} for recording: "${recordingTitle}"`,
      timestamp: new Date().toISOString(),
      isRead: false,
      link: 'sales'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      stats,
      applicants,
      lessons,
      testimonials,
      notifications,
      adminUsers,
      currentAdmin,
      currentStudent,
      emailLogs,
      phaseInfo,
      emailConfig,
      updateEmailConfig,
      
      loginAdmin,
      logoutAdmin,
      loginStudent,
      logoutStudent,
      signupStudent,
      updateApplicantStatus,
      uploadTrainingFeeReceipt,
      
      addLesson,
      editLesson,
      deleteLesson,
      addTestimonial,
      toggleTestimonialVisibility,
      addAdminUser,
      removeAdminUser,
      updateStats,
      clearAllNotifications,
      markNotificationAsRead,
      purchaseRecording
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
