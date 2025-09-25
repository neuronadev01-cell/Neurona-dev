import React from 'react';
import { CrisisProtocolManager } from '@/components/crisis/CrisisProtocolManager';

export default function CrisisProtocolsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CrisisProtocolManager />
      </div>
    </div>
  );
}