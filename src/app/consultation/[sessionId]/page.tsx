import React from 'react';
import { VideoConsultation } from '@/components/video/VideoConsultation';

interface VideoConsultationPageProps {
  params: {
    sessionId: string;
  };
  searchParams: {
    participantId?: string;
    role?: 'host' | 'patient' | 'provider' | 'observer' | 'admin';
  };
}

export default function VideoConsultationPage({ params, searchParams }: VideoConsultationPageProps) {
  const { sessionId } = params;
  const participantId = searchParams.participantId || 'participant-default';
  const participantRole = searchParams.role || 'patient';

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-full mx-auto p-6">
        <VideoConsultation
          sessionId={sessionId}
          participantId={participantId}
          participantRole={participantRole}
          onSessionEnd={(summary) => {
            console.log('Session ended:', summary);
            // In a real app, would redirect or show summary
          }}
        />
      </div>
    </div>
  );
}