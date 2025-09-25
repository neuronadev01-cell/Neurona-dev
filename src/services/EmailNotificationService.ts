import { z } from 'zod';

// Email template types
export type EmailTemplate = 
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'appointment_cancellation'
  | 'assessment_notification'
  | 'crisis_alert'
  | 'therapy_plan_update'
  | 'doctor_verification'
  | 'system_alert'
  | 'welcome_patient'
  | 'welcome_provider';

// Email configuration schema
const EmailConfigSchema = z.object({
  provider: z.enum(['sendgrid', 'ses', 'nodemailer']),
  apiKey: z.string(),
  fromEmail: z.string().email(),
  fromName: z.string(),
  replyTo: z.string().email().optional(),
  templates: z.record(z.string())
});

// Email recipient schema
const EmailRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  type: z.enum(['patient', 'provider', 'admin', 'emergency_contact'])
});

// Email data schema
const EmailDataSchema = z.object({
  template: z.string(),
  to: z.array(EmailRecipientSchema),
  cc: z.array(EmailRecipientSchema).optional(),
  bcc: z.array(EmailRecipientSchema).optional(),
  subject: z.string(),
  variables: z.record(z.any()),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  scheduled: z.date().optional(),
  trackingEnabled: z.boolean().default(true)
});

export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type EmailRecipient = z.infer<typeof EmailRecipientSchema>;
export type EmailData = z.infer<typeof EmailDataSchema>;

// Email templates with HTML content
const EMAIL_TEMPLATES: Record<EmailTemplate, { subject: string; html: string; text: string }> = {
  appointment_confirmation: {
    subject: 'Appointment Confirmed - {{appointmentDate}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fffe; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2DD4BF; margin: 0; font-size: 28px;">Neurona</h1>
          <p style="color: #64748B; margin: 5px 0 0 0;">Mental Health Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Appointment Confirmed</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hi {{patientName}},
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your appointment has been confirmed with the following details:
          </p>
          
          <div style="background: #F1F5F9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Provider:</td>
                <td style="padding: 8px 0; color: #475569;">{{providerName}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Date & Time:</td>
                <td style="padding: 8px 0; color: #475569;">{{appointmentDate}} at {{appointmentTime}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Type:</td>
                <td style="padding: 8px 0; color: #475569;">{{appointmentType}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Duration:</td>
                <td style="padding: 8px 0; color: #475569;">{{duration}} minutes</td>
              </tr>
            </table>
          </div>
          
          {{#if isVideoCall}}
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #92400E;">
              <strong>Video Session:</strong> You'll receive a meeting link 15 minutes before your appointment.
            </p>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{cancelUrl}}" style="display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Cancel Appointment
            </a>
            <a href="{{rescheduleUrl}}" style="display: inline-block; background: #6B7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-left: 10px;">
              Reschedule
            </a>
          </div>
          
          <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748B; font-size: 14px; margin: 0;">
              Need help? Contact us at <a href="mailto:support@neurona.health" style="color: #2DD4BF;">support@neurona.health</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Appointment Confirmed - Neurona
      
      Hi {{patientName}},
      
      Your appointment has been confirmed:
      
      Provider: {{providerName}}
      Date & Time: {{appointmentDate}} at {{appointmentTime}}
      Type: {{appointmentType}}
      Duration: {{duration}} minutes
      
      {{#if isVideoCall}}
      This is a video session. You'll receive a meeting link 15 minutes before your appointment.
      {{/if}}
      
      Cancel: {{cancelUrl}}
      Reschedule: {{rescheduleUrl}}
      
      Need help? Contact support@neurona.health
    `
  },

  appointment_reminder: {
    subject: 'Reminder: Appointment Tomorrow at {{appointmentTime}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fffe; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2DD4BF; margin: 0; font-size: 28px;">Neurona</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Appointment Reminder</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hi {{patientName}},
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            This is a friendly reminder that you have an appointment scheduled for tomorrow:
          </p>
          
          <div style="background: #F0F9FF; border-left: 4px solid #2DD4BF; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1E293B;">
              {{appointmentDate}} at {{appointmentTime}}
            </p>
            <p style="margin: 5px 0 0 0; color: #475569;">
              with {{providerName}}
            </p>
          </div>
          
          {{#if isVideoCall}}
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #92400E;">
              <strong>Video Session:</strong> <a href="{{meetingUrl}}" style="color: #92400E;">Join Meeting</a>
            </p>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{confirmUrl}}" style="display: inline-block; background: #2DD4BF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Attendance
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Appointment Reminder - Neurona
      
      Hi {{patientName}},
      
      Reminder: You have an appointment tomorrow at {{appointmentTime}} with {{providerName}}.
      
      {{#if isVideoCall}}
      Video Session: {{meetingUrl}}
      {{/if}}
      
      Confirm: {{confirmUrl}}
    `
  },

  crisis_alert: {
    subject: '🚨 URGENT: Crisis Alert - {{patientName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FEF2F2; border-radius: 8px; border: 2px solid #EF4444;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #EF4444; margin: 0; font-size: 24px;">🚨 CRISIS ALERT</h1>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px; border-left: 6px solid #EF4444;">
          <h2 style="color: #7F1D1D; margin: 0 0 15px 0;">Immediate Attention Required</h2>
          
          <div style="background: #FEF2F2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #7F1D1D;">Patient:</td>
                <td style="padding: 5px 0; color: #991B1B;">{{patientName}}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #7F1D1D;">Alert Type:</td>
                <td style="padding: 5px 0; color: #991B1B;">{{alertType}}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #7F1D1D;">Severity:</td>
                <td style="padding: 5px 0; color: #991B1B;">{{severity}}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold; color: #7F1D1D;">Time:</td>
                <td style="padding: 5px 0; color: #991B1B;">{{alertTime}}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #92400E;">Assessment Details:</h3>
            <p style="margin: 0; color: #92400E;">{{assessmentDetails}}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="{{dashboardUrl}}" style="display: inline-block; background: #EF4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              VIEW IN DASHBOARD
            </a>
          </div>
          
          <div style="border-top: 1px solid #FCA5A5; padding-top: 15px; margin-top: 20px;">
            <p style="color: #7F1D1D; font-size: 14px; margin: 0; text-align: center;">
              <strong>Emergency Contact:</strong> 911 | <strong>Crisis Line:</strong> {{crisisHotline}}
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      🚨 CRISIS ALERT - IMMEDIATE ATTENTION REQUIRED
      
      Patient: {{patientName}}
      Alert Type: {{alertType}}
      Severity: {{severity}}
      Time: {{alertTime}}
      
      Assessment Details: {{assessmentDetails}}
      
      Dashboard: {{dashboardUrl}}
      
      Emergency: 911 | Crisis Line: {{crisisHotline}}
    `
  },

  assessment_notification: {
    subject: 'Assessment Complete - {{patientName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fffe; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2DD4BF; margin: 0; font-size: 28px;">Neurona</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Assessment Completed</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            {{patientName}} has completed a {{assessmentType}} assessment.
          </p>
          
          <div style="background: #F1F5F9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Overall Risk Score:</td>
                <td style="padding: 8px 0; color: {{riskScoreColor}}; font-weight: bold;">{{overallScore}}/100</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Trend:</td>
                <td style="padding: 8px 0; color: #475569;">{{trend}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #334155;">Completed:</td>
                <td style="padding: 8px 0; color: #475569;">{{completionDate}}</td>
              </tr>
            </table>
          </div>
          
          {{#if requiresAttention}}
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #92400E;">
              <strong>Attention Required:</strong> {{attentionReason}}
            </p>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{reviewUrl}}" style="display: inline-block; background: #2DD4BF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Assessment
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Assessment Completed - Neurona
      
      {{patientName}} completed a {{assessmentType}} assessment.
      
      Overall Risk Score: {{overallScore}}/100
      Trend: {{trend}}
      Completed: {{completionDate}}
      
      {{#if requiresAttention}}
      Attention Required: {{attentionReason}}
      {{/if}}
      
      Review: {{reviewUrl}}
    `
  },

  welcome_patient: {
    subject: 'Welcome to Neurona - Your Mental Health Journey Starts Here',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fffe; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2DD4BF; margin: 0; font-size: 32px;">Welcome to Neurona</h1>
          <p style="color: #64748B; margin: 10px 0 0 0; font-size: 18px;">Your Mental Health Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Hi {{patientName}}!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We're excited to support you on your mental health journey. Your account is now active and ready to use.
          </p>
          
          <div style="background: #F0F9FF; border-left: 4px solid #2DD4BF; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1E293B;">Next Steps:</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Complete your initial assessment</li>
              <li style="margin-bottom: 8px;">Schedule your first appointment</li>
              <li style="margin-bottom: 8px;">Explore therapy resources</li>
              <li>Set up your preferences</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="display: inline-block; background: #2DD4BF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Get Started
            </a>
          </div>
          
          <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748B; font-size: 14px; margin: 0; text-align: center;">
              Questions? We're here to help at <a href="mailto:support@neurona.health" style="color: #2DD4BF;">support@neurona.health</a>
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      Welcome to Neurona!
      
      Hi {{patientName}},
      
      We're excited to support you on your mental health journey. Your account is now active.
      
      Next Steps:
      - Complete your initial assessment
      - Schedule your first appointment
      - Explore therapy resources
      - Set up your preferences
      
      Get Started: {{dashboardUrl}}
      
      Questions? Contact support@neurona.health
    `
  },

  welcome_provider: {
    subject: 'Welcome to Neurona Provider Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FB923C; margin: 0; font-size: 32px;">Neurona Provider</h1>
          <p style="color: #64748B; margin: 10px 0 0 0; font-size: 18px;">Mental Health Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Welcome, Dr. {{providerName}}!</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your provider account has been approved and activated. You can now start accepting patients and managing your practice.
          </p>
          
          <div style="background: #FFF7ED; border-left: 4px solid #FB923C; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1E293B;">Provider Features:</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Patient management dashboard</li>
              <li style="margin-bottom: 8px;">Assessment review and analysis</li>
              <li style="margin-bottom: 8px;">Appointment scheduling</li>
              <li style="margin-bottom: 8px;">Therapy plan creation</li>
              <li>Crisis alert monitoring</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{providerDashboardUrl}}" style="display: inline-block; background: #FB923C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Access Provider Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Welcome to Neurona Provider Platform!
      
      Dr. {{providerName}},
      
      Your provider account has been approved and activated.
      
      Provider Features:
      - Patient management dashboard
      - Assessment review and analysis
      - Appointment scheduling
      - Therapy plan creation
      - Crisis alert monitoring
      
      Dashboard: {{providerDashboardUrl}}
    `
  },

  therapy_plan_update: {
    subject: 'Therapy Plan Updated - {{patientName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fffe; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2DD4BF; margin: 0; font-size: 28px;">Neurona</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Your Therapy Plan Has Been Updated</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Hi {{patientName}},
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            {{providerName}} has updated your therapy plan based on your recent progress.
          </p>
          
          <div style="background: #F1F5F9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #334155;">What's New:</h3>
            <p style="color: #475569; margin: 0;">{{updateSummary}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{therapyPlanUrl}}" style="display: inline-block; background: #2DD4BF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Updated Plan
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Therapy Plan Updated - Neurona
      
      Hi {{patientName}},
      
      {{providerName}} has updated your therapy plan.
      
      What's New: {{updateSummary}}
      
      View Plan: {{therapyPlanUrl}}
    `
  },

  doctor_verification: {
    subject: 'Doctor Application Status Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FB923C; margin: 0; font-size: 28px;">Neurona</h1>
          <p style="color: #64748B; margin: 5px 0 0 0;">Provider Platform</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #1E293B; margin: 0 0 20px 0;">Application Status Update</h2>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Dear Dr. {{doctorName}},
          </p>
          
          <div style="background: {{statusColor}}; border-left: 4px solid {{statusBorderColor}}; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0; color: {{statusTextColor}}; font-weight: bold; font-size: 18px;">
              Status: {{status}}
            </p>
          </div>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            {{statusMessage}}
          </p>
          
          {{#if nextSteps}}
          <div style="background: #F1F5F9; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #334155;">Next Steps:</h3>
            <p style="color: #475569; margin: 0;">{{nextSteps}}</p>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{applicationUrl}}" style="display: inline-block; background: #FB923C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Application
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      Doctor Application Status Update
      
      Dear Dr. {{doctorName}},
      
      Status: {{status}}
      
      {{statusMessage}}
      
      {{#if nextSteps}}
      Next Steps: {{nextSteps}}
      {{/if}}
      
      View Application: {{applicationUrl}}
    `
  },

  system_alert: {
    subject: 'System Alert: {{alertType}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FEF3C7; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #F59E0B; margin: 0; font-size: 24px;">⚠️ System Alert</h1>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px; border-left: 6px solid #F59E0B;">
          <h2 style="color: #92400E; margin: 0 0 15px 0;">{{alertType}}</h2>
          
          <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400E;">{{alertMessage}}</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="{{actionUrl}}" style="display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              {{actionLabel}}
            </a>
          </div>
        </div>
      </div>
    `,
    text: `
      ⚠️ System Alert: {{alertType}}
      
      {{alertMessage}}
      
      Action: {{actionUrl}}
    `
  }
};

class EmailNotificationService {
  private config: EmailConfig;
  private emailQueue: EmailData[] = [];
  private isProcessing = false;

  constructor(config: EmailConfig) {
    this.config = EmailConfigSchema.parse(config);
  }

  /**
   * Send a single email
   */
  async sendEmail(emailData: Omit<EmailData, 'template'> & { template: EmailTemplate }): Promise<boolean> {
    try {
      const validatedData = EmailDataSchema.parse({
        ...emailData,
        template: emailData.template as string
      });

      // Get template
      const template = EMAIL_TEMPLATES[emailData.template];
      if (!template) {
        throw new Error(`Template '${emailData.template}' not found`);
      }

      // Compile template with variables
      const compiledSubject = this.compileTemplate(template.subject, validatedData.variables);
      const compiledHtml = this.compileTemplate(template.html, validatedData.variables);
      const compiledText = this.compileTemplate(template.text, validatedData.variables);

      // Prepare email payload
      const emailPayload = {
        to: validatedData.to,
        cc: validatedData.cc,
        bcc: validatedData.bcc,
        subject: compiledSubject,
        html: compiledHtml,
        text: compiledText,
        attachments: validatedData.attachments,
        priority: validatedData.priority,
        scheduled: validatedData.scheduled,
        trackingEnabled: validatedData.trackingEnabled
      };

      // Send via configured provider
      return await this.sendViaProvider(emailPayload);
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Queue multiple emails for batch processing
   */
  queueEmail(emailData: Omit<EmailData, 'template'> & { template: EmailTemplate }): void {
    this.emailQueue.push({
      ...emailData,
      template: emailData.template as string
    });
  }

  /**
   * Process queued emails
   */
  async processQueue(): Promise<{ sent: number; failed: number }> {
    if (this.isProcessing) {
      return { sent: 0, failed: 0 };
    }

    this.isProcessing = true;
    let sent = 0;
    let failed = 0;

    while (this.emailQueue.length > 0) {
      const emailData = this.emailQueue.shift()!;
      const success = await this.sendEmail({
        ...emailData,
        template: emailData.template as EmailTemplate
      });

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
    return { sent, failed };
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(data: {
    patientEmail: string;
    patientName: string;
    providerName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    duration: number;
    isVideoCall?: boolean;
    cancelUrl: string;
    rescheduleUrl: string;
  }): Promise<boolean> {
    return this.sendEmail({
      template: 'appointment_confirmation',
      to: [{ email: data.patientEmail, name: data.patientName, type: 'patient' }],
      subject: `Appointment Confirmed - ${data.appointmentDate}`,
      variables: data,
      priority: 'normal'
    });
  }

  /**
   * Send crisis alert email
   */
  async sendCrisisAlert(data: {
    providerEmail: string;
    providerName: string;
    patientName: string;
    alertType: string;
    severity: string;
    alertTime: string;
    assessmentDetails: string;
    dashboardUrl: string;
    crisisHotline: string;
  }): Promise<boolean> {
    return this.sendEmail({
      template: 'crisis_alert',
      to: [{ email: data.providerEmail, name: data.providerName, type: 'provider' }],
      subject: `🚨 URGENT: Crisis Alert - ${data.patientName}`,
      variables: data,
      priority: 'urgent'
    });
  }

  /**
   * Send assessment notification
   */
  async sendAssessmentNotification(data: {
    providerEmail: string;
    providerName: string;
    patientName: string;
    assessmentType: string;
    overallScore: number;
    trend: string;
    completionDate: string;
    requiresAttention?: boolean;
    attentionReason?: string;
    reviewUrl: string;
  }): Promise<boolean> {
    return this.sendEmail({
      template: 'assessment_notification',
      to: [{ email: data.providerEmail, name: data.providerName, type: 'provider' }],
      subject: `Assessment Complete - ${data.patientName}`,
      variables: {
        ...data,
        riskScoreColor: data.overallScore >= 70 ? '#EF4444' : data.overallScore >= 50 ? '#F59E0B' : '#22C55E'
      },
      priority: data.requiresAttention ? 'high' : 'normal'
    });
  }

  /**
   * Send welcome email to new patient
   */
  async sendPatientWelcome(data: {
    patientEmail: string;
    patientName: string;
    dashboardUrl: string;
  }): Promise<boolean> {
    return this.sendEmail({
      template: 'welcome_patient',
      to: [{ email: data.patientEmail, name: data.patientName, type: 'patient' }],
      subject: 'Welcome to Neurona - Your Mental Health Journey Starts Here',
      variables: data,
      priority: 'normal'
    });
  }

  /**
   * Compile template with variables (simple Handlebars-style)
   */
  private compileTemplate(template: string, variables: Record<string, any>): string {
    let compiled = template;

    // Replace simple variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      compiled = compiled.replace(regex, String(value || ''));
    });

    // Handle conditionals {{#if condition}}...{{/if}}
    compiled = compiled.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      return variables[condition] ? content : '';
    });

    return compiled;
  }

  /**
   * Send email via configured provider
   */
  private async sendViaProvider(emailPayload: any): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendViaSendGrid(emailPayload);
        case 'ses':
          return await this.sendViaSES(emailPayload);
        case 'nodemailer':
          return await this.sendViaNodemailer(emailPayload);
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`Failed to send via ${this.config.provider}:`, error);
      return false;
    }
  }

  private async sendViaSendGrid(emailPayload: any): Promise<boolean> {
    // SendGrid implementation would go here
    console.log('Sending via SendGrid:', emailPayload.subject);
    return true; // Mock success
  }

  private async sendViaSES(emailPayload: any): Promise<boolean> {
    // AWS SES implementation would go here
    console.log('Sending via SES:', emailPayload.subject);
    return true; // Mock success
  }

  private async sendViaNodemailer(emailPayload: any): Promise<boolean> {
    // Nodemailer implementation would go here
    console.log('Sending via Nodemailer:', emailPayload.subject);
    return true; // Mock success
  }
}

// Factory function to create email service instance
export function createEmailService(config: EmailConfig): EmailNotificationService {
  return new EmailNotificationService(config);
}

// Default configuration for development
export const defaultEmailConfig: EmailConfig = {
  provider: 'nodemailer',
  apiKey: process.env.EMAIL_API_KEY || 'dev-key',
  fromEmail: process.env.FROM_EMAIL || 'noreply@neurona.health',
  fromName: 'Neurona Mental Health Platform',
  replyTo: process.env.REPLY_TO_EMAIL || 'support@neurona.health',
  templates: {}
};

export default EmailNotificationService;