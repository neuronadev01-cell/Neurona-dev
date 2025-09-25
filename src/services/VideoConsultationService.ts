import { z } from 'zod';

// Video session types
export type SessionType = 'therapy' | 'consultation' | 'assessment' | 'group' | 'emergency';
export type SessionStatus = 'scheduled' | 'active' | 'ended' | 'cancelled' | 'no_show';
export type ParticipantRole = 'host' | 'patient' | 'provider' | 'observer' | 'admin';

// Video configuration schema
const VideoConfigSchema = z.object({
  provider: z.enum(['twilio', 'agora', 'webrtc', 'zoom']),
  apiKey: z.string(),
  apiSecret: z.string(),
  appId: z.string().optional(),
  enableRecording: z.boolean().default(true),
  maxParticipants: z.number().default(2),
  maxDuration: z.number().default(60), // minutes
  enableScreenSharing: z.boolean().default(true),
  enableChat: z.boolean().default(true),
  recordingStorage: z.enum(['local', 's3', 'gcp', 'azure']).default('s3'),
  encryptionEnabled: z.boolean().default(true)
});

// Participant schema
const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['host', 'patient', 'provider', 'observer', 'admin']),
  isRecordingConsent: z.boolean().default(false),
  joinedAt: z.date().optional(),
  leftAt: z.date().optional(),
  connectionStatus: z.enum(['connected', 'disconnected', 'reconnecting', 'failed']).default('disconnected'),
  audioEnabled: z.boolean().default(true),
  videoEnabled: z.boolean().default(true),
  screenSharing: z.boolean().default(false)
});

// Session schema
const VideoSessionSchema = z.object({
  id: z.string(),
  appointmentId: z.string(),
  sessionType: z.enum(['therapy', 'consultation', 'assessment', 'group', 'emergency']),
  title: z.string(),
  description: z.string().optional(),
  scheduledStart: z.date(),
  scheduledEnd: z.date(),
  actualStart: z.date().optional(),
  actualEnd: z.date().optional(),
  status: z.enum(['scheduled', 'active', 'ended', 'cancelled', 'no_show']),
  participants: z.array(ParticipantSchema),
  hostId: z.string(),
  patientId: z.string(),
  providerId: z.string(),
  roomId: z.string(),
  accessToken: z.string().optional(),
  recordingEnabled: z.boolean().default(true),
  recordingUrl: z.string().optional(),
  recordingConsent: z.record(z.boolean()).default({}),
  sessionNotes: z.string().optional(),
  technicalIssues: z.array(z.string()).default([]),
  compliance: z.object({
    hipaaCompliant: z.boolean().default(true),
    encryptionEnabled: z.boolean().default(true),
    auditLogEnabled: z.boolean().default(true)
  }).default({}),
  metadata: z.record(z.any()).default({})
});

// Session quality metrics
const QualityMetricsSchema = z.object({
  sessionId: z.string(),
  overallQuality: z.enum(['excellent', 'good', 'fair', 'poor']),
  averageLatency: z.number(), // ms
  packetLoss: z.number(), // percentage
  jitter: z.number(), // ms
  bandwidth: z.object({
    upload: z.number(), // kbps
    download: z.number() // kbps
  }),
  audioQuality: z.object({
    bitrate: z.number(),
    sampleRate: z.number(),
    dropouts: z.number()
  }),
  videoQuality: z.object({
    resolution: z.string(),
    frameRate: z.number(),
    bitrate: z.number(),
    freezes: z.number()
  }),
  recordingQuality: z.object({
    resolution: z.string(),
    duration: z.number(), // seconds
    fileSize: z.number(), // bytes
    compressionRatio: z.number()
  }).optional()
});

export type VideoConfig = z.infer<typeof VideoConfigSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type VideoSession = z.infer<typeof VideoSessionSchema>;
export type QualityMetrics = z.infer<typeof QualityMetricsSchema>;

// Session recording metadata
interface RecordingMetadata {
  sessionId: string;
  fileName: string;
  duration: number;
  fileSize: number;
  resolution: string;
  format: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  storageUrl: string;
  transcriptUrl?: string;
  thumbnailUrl?: string;
  hipaaCompliant: boolean;
}

class VideoConsultationService {
  private config: VideoConfig;
  private activeSessions: Map<string, VideoSession> = new Map();
  private sessionMetrics: Map<string, QualityMetrics> = new Map();

  constructor(config: VideoConfig) {
    this.config = VideoConfigSchema.parse(config);
  }

  /**
   * Create a new video session
   */
  async createSession(sessionData: {
    appointmentId: string;
    sessionType: SessionType;
    title: string;
    description?: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    hostId: string;
    patientId: string;
    providerId: string;
    participants?: Omit<Participant, 'id'>[];
  }): Promise<VideoSession> {
    try {
      const sessionId = this.generateSessionId();
      const roomId = this.generateRoomId();

      // Create participants list
      const participants: Participant[] = [
        {
          id: sessionData.hostId,
          name: 'Host',
          email: 'host@example.com',
          role: 'host' as ParticipantRole,
          isRecordingConsent: true,
          connectionStatus: 'disconnected',
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false
        },
        {
          id: sessionData.patientId,
          name: 'Patient',
          email: 'patient@example.com',
          role: 'patient' as ParticipantRole,
          isRecordingConsent: false,
          connectionStatus: 'disconnected',
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false
        },
        {
          id: sessionData.providerId,
          name: 'Provider',
          email: 'provider@example.com',
          role: 'provider' as ParticipantRole,
          isRecordingConsent: true,
          connectionStatus: 'disconnected',
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false
        }
      ];

      // Add additional participants if provided
      if (sessionData.participants) {
        const additionalParticipants = sessionData.participants.map(p => ({
          id: this.generateParticipantId(),
          ...p,
          connectionStatus: 'disconnected' as const,
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false
        }));
        participants.push(...additionalParticipants);
      }

      const session: VideoSession = {
        id: sessionId,
        appointmentId: sessionData.appointmentId,
        sessionType: sessionData.sessionType,
        title: sessionData.title,
        description: sessionData.description,
        scheduledStart: sessionData.scheduledStart,
        scheduledEnd: sessionData.scheduledEnd,
        status: 'scheduled',
        participants,
        hostId: sessionData.hostId,
        patientId: sessionData.patientId,
        providerId: sessionData.providerId,
        roomId,
        recordingEnabled: this.config.enableRecording,
        recordingConsent: {},
        technicalIssues: [],
        compliance: {
          hipaaCompliant: true,
          encryptionEnabled: this.config.encryptionEnabled,
          auditLogEnabled: true
        },
        metadata: {
          createdAt: new Date(),
          provider: this.config.provider,
          maxDuration: this.config.maxDuration
        }
      };

      // Generate access tokens
      session.accessToken = await this.generateAccessToken(session);

      // Store session
      this.activeSessions.set(sessionId, session);

      // Log session creation
      await this.logAuditEvent('session_created', {
        sessionId,
        appointmentId: sessionData.appointmentId,
        participants: participants.map(p => ({ id: p.id, role: p.role }))
      });

      return session;
    } catch (error) {
      console.error('Failed to create video session:', error);
      throw new Error('Failed to create video session');
    }
  }

  /**
   * Join a video session
   */
  async joinSession(sessionId: string, participantId: string): Promise<{
    success: boolean;
    roomId: string;
    token: string;
    sessionConfig: any;
  }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const participant = session.participants.find(p => p.id === participantId);
      if (!participant) {
        throw new Error('Participant not authorized for this session');
      }

      // Update participant status
      participant.joinedAt = new Date();
      participant.connectionStatus = 'connected';

      // Update session status if first participant
      if (session.status === 'scheduled') {
        session.status = 'active';
        session.actualStart = new Date();
      }

      // Generate participant token
      const token = await this.generateParticipantToken(sessionId, participantId);

      // Log join event
      await this.logAuditEvent('participant_joined', {
        sessionId,
        participantId,
        participantRole: participant.role,
        timestamp: new Date()
      });

      return {
        success: true,
        roomId: session.roomId,
        token,
        sessionConfig: {
          enableRecording: session.recordingEnabled,
          enableScreenSharing: this.config.enableScreenSharing,
          enableChat: this.config.enableChat,
          maxDuration: this.config.maxDuration,
          encryptionEnabled: this.config.encryptionEnabled
        }
      };
    } catch (error) {
      console.error('Failed to join session:', error);
      return { success: false, roomId: '', token: '', sessionConfig: {} };
    }
  }

  /**
   * Leave a video session
   */
  async leaveSession(sessionId: string, participantId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      const participant = session.participants.find(p => p.id === participantId);
      if (!participant) return false;

      // Update participant status
      participant.leftAt = new Date();
      participant.connectionStatus = 'disconnected';

      // Check if session should end (no connected participants)
      const connectedParticipants = session.participants.filter(p => p.connectionStatus === 'connected');
      if (connectedParticipants.length === 0) {
        await this.endSession(sessionId);
      }

      // Log leave event
      await this.logAuditEvent('participant_left', {
        sessionId,
        participantId,
        participantRole: participant.role,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to leave session:', error);
      return false;
    }
  }

  /**
   * End a video session
   */
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      // Update session status
      session.status = 'ended';
      session.actualEnd = new Date();

      // Disconnect all participants
      session.participants.forEach(participant => {
        if (participant.connectionStatus === 'connected') {
          participant.leftAt = new Date();
          participant.connectionStatus = 'disconnected';
        }
      });

      // Stop recording if active
      if (session.recordingEnabled) {
        await this.stopRecording(sessionId);
      }

      // Generate session summary
      const summary = await this.generateSessionSummary(session);

      // Log session end
      await this.logAuditEvent('session_ended', {
        sessionId,
        duration: session.actualEnd.getTime() - (session.actualStart?.getTime() || session.scheduledStart.getTime()),
        participantCount: session.participants.length,
        summary
      });

      // Move to historical sessions (in real implementation, would save to database)
      this.activeSessions.delete(sessionId);

      return true;
    } catch (error) {
      console.error('Failed to end session:', error);
      return false;
    }
  }

  /**
   * Start recording a session
   */
  async startRecording(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      // Check recording consent
      const requiredConsent = session.participants.filter(p => p.role !== 'observer');
      const hasConsent = requiredConsent.every(p => session.recordingConsent[p.id] === true);

      if (!hasConsent) {
        throw new Error('Recording consent not obtained from all required participants');
      }

      // Start recording based on provider
      const recordingId = await this.startProviderRecording(session);
      
      session.metadata.recordingId = recordingId;
      session.metadata.recordingStarted = new Date();

      // Log recording start
      await this.logAuditEvent('recording_started', {
        sessionId,
        recordingId,
        participants: session.participants.map(p => ({ id: p.id, role: p.role, consent: session.recordingConsent[p.id] }))
      });

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording a session
   */
  async stopRecording(sessionId: string): Promise<RecordingMetadata | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.metadata.recordingId) return null;

      // Stop recording
      const recordingData = await this.stopProviderRecording(session.metadata.recordingId);
      
      // Generate recording metadata
      const metadata: RecordingMetadata = {
        sessionId,
        fileName: `session_${sessionId}_${Date.now()}.mp4`,
        duration: recordingData.duration,
        fileSize: recordingData.fileSize,
        resolution: recordingData.resolution,
        format: 'mp4',
        startTime: session.metadata.recordingStarted,
        endTime: new Date(),
        participants: session.participants.map(p => p.id),
        storageUrl: recordingData.url,
        hipaaCompliant: session.compliance.hipaaCompliant
      };

      session.recordingUrl = recordingData.url;
      session.metadata.recordingStopped = new Date();

      // Log recording stop
      await this.logAuditEvent('recording_stopped', {
        sessionId,
        recordingId: session.metadata.recordingId,
        metadata
      });

      return metadata;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  /**
   * Get session status and participants
   */
  getSession(sessionId: string): VideoSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Update participant audio/video status
   */
  async updateParticipantMedia(
    sessionId: string, 
    participantId: string, 
    options: { audioEnabled?: boolean; videoEnabled?: boolean; screenSharing?: boolean }
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return false;

      const participant = session.participants.find(p => p.id === participantId);
      if (!participant) return false;

      // Update media settings
      if (options.audioEnabled !== undefined) {
        participant.audioEnabled = options.audioEnabled;
      }
      if (options.videoEnabled !== undefined) {
        participant.videoEnabled = options.videoEnabled;
      }
      if (options.screenSharing !== undefined) {
        participant.screenSharing = options.screenSharing;
      }

      // Log media change
      await this.logAuditEvent('participant_media_changed', {
        sessionId,
        participantId,
        changes: options,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to update participant media:', error);
      return false;
    }
  }

  /**
   * Record quality metrics
   */
  recordQualityMetrics(sessionId: string, metrics: Omit<QualityMetrics, 'sessionId'>): void {
    const fullMetrics: QualityMetrics = {
      sessionId,
      ...metrics
    };
    
    this.sessionMetrics.set(sessionId, fullMetrics);
  }

  /**
   * Get session quality metrics
   */
  getQualityMetrics(sessionId: string): QualityMetrics | null {
    return this.sessionMetrics.get(sessionId) || null;
  }

  /**
   * Private helper methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateParticipantId(): string {
    return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateAccessToken(session: VideoSession): Promise<string> {
    // Mock token generation - in real implementation, would use provider's SDK
    return `token_${session.id}_${Date.now()}`;
  }

  private async generateParticipantToken(sessionId: string, participantId: string): Promise<string> {
    // Mock token generation - in real implementation, would use provider's SDK
    return `participant_token_${sessionId}_${participantId}_${Date.now()}`;
  }

  private async startProviderRecording(session: VideoSession): Promise<string> {
    // Mock recording start - in real implementation, would use provider's API
    console.log(`Starting recording for session ${session.id} with ${this.config.provider}`);
    return `recording_${session.id}_${Date.now()}`;
  }

  private async stopProviderRecording(recordingId: string): Promise<{
    duration: number;
    fileSize: number;
    resolution: string;
    url: string;
  }> {
    // Mock recording data - in real implementation, would fetch from provider
    console.log(`Stopping recording ${recordingId}`);
    return {
      duration: 1800, // 30 minutes
      fileSize: 150 * 1024 * 1024, // 150MB
      resolution: '1280x720',
      url: `https://storage.neurona.health/recordings/${recordingId}.mp4`
    };
  }

  private async generateSessionSummary(session: VideoSession): Promise<any> {
    const duration = (session.actualEnd?.getTime() || Date.now()) - (session.actualStart?.getTime() || session.scheduledStart.getTime());
    const participantCount = session.participants.length;
    const connectedCount = session.participants.filter(p => p.joinedAt).length;

    return {
      duration: Math.round(duration / 1000 / 60), // minutes
      participantCount,
      connectedCount,
      recordingEnabled: session.recordingEnabled,
      technicalIssues: session.technicalIssues.length,
      qualityMetrics: this.sessionMetrics.get(session.id)
    };
  }

  private async logAuditEvent(eventType: string, data: any): Promise<void> {
    // Mock audit logging - in real implementation, would save to secure audit log
    const auditEntry = {
      timestamp: new Date(),
      eventType,
      data,
      service: 'video_consultation',
      hipaaCompliant: true
    };
    
    console.log('Audit Log:', auditEntry);
  }
}

// Factory function to create video service instance
export function createVideoConsultationService(config: VideoConfig): VideoConsultationService {
  return new VideoConsultationService(config);
}

// Default configuration for development
export const defaultVideoConfig: VideoConfig = {
  provider: 'webrtc',
  apiKey: process.env.VIDEO_API_KEY || 'dev-key',
  apiSecret: process.env.VIDEO_API_SECRET || 'dev-secret',
  appId: process.env.VIDEO_APP_ID,
  enableRecording: true,
  maxParticipants: 2,
  maxDuration: 60,
  enableScreenSharing: true,
  enableChat: true,
  recordingStorage: 's3',
  encryptionEnabled: true
};

export default VideoConsultationService;