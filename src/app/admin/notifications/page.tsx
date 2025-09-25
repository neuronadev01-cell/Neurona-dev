import React from 'react';
import { EmailDashboard } from '@/components/notifications/EmailDashboard';

export default function EmailNotificationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <EmailDashboard />
      </div>
    </div>
  );
}