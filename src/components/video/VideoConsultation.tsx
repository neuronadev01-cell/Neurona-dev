'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { VideoSession, Participant } from '@/services/VideoConsultationService';

interface VideoConsultationProps {
  className?: string;
  sessionId: string;
  participantId: string;
  participantRole: 'host' | 'patient' | 'provider' | 'observer' | 'admin';
  onSessionEnd?: (sessionSummary: any) => void;
}

interface VideoControls {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  recording: boolean;
  fullscreen: boolean;
}

export const VideoConsultation: React.FC<VideoConsultationProps> = ({
  className,
  sessionId,
  participantId,
  participantRole,
  onSessionEnd
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<VideoSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [controls, setControls] = useState<VideoControls>({
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
    recording: false,
    fullscreen: false
  });
  const [sessionTimer, setSessionTimer] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [showRecordingConsent, setShowRecordingConsent] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    participantId: string;
    participantName: string;
    message: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock session data
  useEffect(() => {
    if (sessionId) {
      // Mock session initialization
      const mockSession: VideoSession = {
        id: sessionId,
        appointmentId: 'appointment-123',
        sessionType: 'therapy',
        title: 'Therapy Session with Dr. Smith',
        scheduledStart: new Date(Date.now() - 300000), // 5 minutes ago
        scheduledEnd: new Date(Date.now() + 3300000), // 55 minutes from now
        actualStart: new Date(Date.now() - 300000),
        status: 'active',
        participants: [
          {
            id: 'provider-1',
            name: 'Dr. Sarah Smith',
            email: 'dr.smith@neurona.health',
            role: 'provider',
            isRecordingConsent: true,
            joinedAt: new Date(Date.now() - 300000),
            connectionStatus: 'connected',
            audioEnabled: true,
            videoEnabled: true,
            screenSharing: false
          },
          {
            id: 'patient-1',
            name: 'John Doe',
            email: 'john.doe@email.com',
            role: 'patient',
            isRecordingConsent: false,
            joinedAt: new Date(Date.now() - 240000),
            connectionStatus: 'connected',
            audioEnabled: true,
            videoEnabled: true,
            screenSharing: false
          }
        ],
        hostId: 'provider-1',
        patientId: 'patient-1',
        providerId: 'provider-1',
        roomId: 'room-123',
        recordingEnabled: true,
        recordingConsent: {},
        technicalIssues: [],
        compliance: {
          hipaaCompliant: true,
          encryptionEnabled: true,
          auditLogEnabled: true
        },
        metadata: {}
      };

      setSessionData(mockSession);
      setParticipants(mockSession.participants);

      // Check if recording consent is needed
      if (mockSession.recordingEnabled && !mockSession.recordingConsent[participantId]) {
        setShowRecordingConsent(true);
      }
    }
  }, [sessionId, participantId]);

  // Session timer
  useEffect(() => {
    if (isConnected && sessionData?.actualStart) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionData.actualStart!.getTime()) / 1000);
        setSessionTimer(elapsed);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected, sessionData]);

  // Simulate connection quality changes
  useEffect(() => {
    const qualityCheck = setInterval(() => {
      const qualities: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(qualityCheck);
  }, []);

  const handleJoinSession = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful connection
      setIsConnected(true);
      setIsConnecting(false);

      // Request media permissions (mock)
      if (controls.audioEnabled || controls.videoEnabled) {
        // In real implementation, would request getUserMedia
        console.log('Requesting media permissions...');
      }
    } catch (error) {
      setConnectionError('Failed to connect to video session');
      setIsConnecting(false);
    }
  };

  const handleLeaveSession = () => {
    setIsConnected(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const sessionSummary = {
      duration: sessionTimer,
      participants: participants.length,
      qualityIssues: connectionQuality === 'poor' || connectionQuality === 'fair'
    };

    onSessionEnd?.(sessionSummary);
  };

  const handleRecordingConsent = (consent: boolean) => {
    setRecordingConsent(consent);
    setShowRecordingConsent(false);
    
    if (consent) {
      setControls(prev => ({ ...prev, recording: true }));
    }
  };

  const handleControlToggle = (control: keyof VideoControls) => {
    setControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));

    // Mock API call to update media state
    console.log(`Toggling ${control}:`, !controls[control]);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        participantId,
        participantName: participants.find(p => p.id === participantId)?.name || 'Unknown',
        message: newMessage.trim(),
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isConnected) {
    return (
      <div className={cn('max-w-4xl mx-auto', className)}>
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-primary-teal rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              {sessionData?.title || 'Video Consultation'}
            </h3>
            <p className="text-neutral-600 mb-6">
              {sessionData ? `Scheduled for ${sessionData.scheduledStart.toLocaleTimeString()}` : 'Preparing session...'}
            </p>

            {connectionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{connectionError}</p>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleJoinSession}
              disabled={isConnecting}
              className="px-8"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Join Session'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-7xl mx-auto space-y-4', className)}>
      {/* Recording Consent Modal */}
      {showRecordingConsent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Recording Consent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-neutral-600">
                  This session may be recorded for quality assurance and therapeutic purposes. 
                  Do you consent to being recorded?
                </p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="primary"
                    onClick={() => handleRecordingConsent(true)}
                    className="flex-1"
                  >
                    I Consent
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRecordingConsent(false)}
                    className="flex-1"
                  >
                    Decline
                  </Button>
                </div>

                <div className="text-xs text-neutral-500">
                  <p>By consenting, you acknowledge that:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Recordings are encrypted and stored securely</li>
                    <li>Access is limited to authorized personnel</li>
                    <li>You can withdraw consent at any time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="font-semibold text-neutral-800">{sessionData?.title}</h2>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>Duration: {formatTimer(sessionTimer)}</span>
                <span className={`${getQualityColor(connectionQuality)}`}>
                  Connection: {connectionQuality}
                </span>
                {controls.recording && (
                  <span className="flex items-center gap-1 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    Recording
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className={showChat ? 'bg-primary-teal-100 text-primary-teal' : ''}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveSession}
            >
              Leave Session
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Video Area */}
        <div className={cn('space-y-4', showChat ? 'lg:col-span-3' : 'lg:col-span-4')}>
          {/* Remote Video */}
          <Card className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* Remote participant info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
              {participants.find(p => p.role === 'provider')?.name || 'Provider'}
              {!participants.find(p => p.role === 'provider')?.audioEnabled && (
                <svg className="inline-block w-4 h-4 ml-2 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.5-9.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4.5zm8.5 6.5c0 3-2.54 5.1-5.5 5.1S8 14 8 11H6.5c0 3.61 2.72 6.23 6 6.72V21h3v-3.28c3.28-.49 6-3.11 6-6.72H19z"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>

            {/* Screen sharing indicator */}
            {controls.screenSharing && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Screen Sharing
              </div>
            )}
          </Card>

          {/* Local Video (Picture-in-Picture) */}
          <div className="relative">
            <Card className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg z-10">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                You
              </div>
            </Card>
          </div>

          {/* Video Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={controls.audioEnabled ? "primary" : "outline"}
                size="sm"
                onClick={() => handleControlToggle('audioEnabled')}
                className={cn(
                  "w-12 h-12 rounded-full",
                  !controls.audioEnabled && "bg-red-500 hover:bg-red-600 text-white border-red-500"
                )}
              >
                {controls.audioEnabled ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.5-9.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4.5zm8.5 6.5c0 3-2.54 5.1-5.5 5.1S8 14 8 11H6.5c0 3.61 2.72 6.23 6 6.72V21h3v-3.28c3.28-.49 6-3.11 6-6.72H19z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.5-9.5c0-.28.22-.5.5-.5s.5.22.5.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4.5z"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </Button>

              <Button
                variant={controls.videoEnabled ? "primary" : "outline"}
                size="sm"
                onClick={() => handleControlToggle('videoEnabled')}
                className={cn(
                  "w-12 h-12 rounded-full",
                  !controls.videoEnabled && "bg-red-500 hover:bg-red-600 text-white border-red-500"
                )}
              >
                {controls.videoEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L16 14" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 10h.01M4 14h.01M4 18h.01M8 6h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </Button>

              <Button
                variant={controls.screenSharing ? "primary" : "outline"}
                size="sm"
                onClick={() => handleControlToggle('screenSharing')}
                className="w-12 h-12 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Button>

              {participantRole === 'provider' && (
                <Button
                  variant={controls.recording ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleControlToggle('recording')}
                  className="w-12 h-12 rounded-full"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleControlToggle('fullscreen')}
                className="w-12 h-12 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </Button>
            </div>
          </Card>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <Card className="lg:col-span-1 flex flex-col h-96">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Session Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 px-4 py-2 overflow-y-auto space-y-2 bg-neutral-50">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="font-medium text-neutral-700">{msg.participantName}</div>
                    <div className="text-neutral-600">{msg.message}</div>
                    <div className="text-xs text-neutral-400">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-neutral-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Session Notes (for providers) */}
      {participantRole === 'provider' && (
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Session Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Enter session notes here..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal resize-none"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};