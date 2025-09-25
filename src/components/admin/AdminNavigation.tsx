'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  badge?: number;
}

interface AdminNavigationProps {
  className?: string;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ className }) => {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'System overview and metrics'
    },
    {
      id: 'doctor-verification',
      title: 'Doctor Verification',
      href: '/admin/doctor-verification',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Review and approve doctors',
      badge: 5
    },
    {
      id: 'users',
      title: 'User Management',
      href: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      description: 'Manage patients and providers'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Platform metrics and insights'
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'System activity and security logs'
    },
    {
      id: 'crisis-alerts',
      title: 'Crisis Alerts',
      href: '/admin/crisis-alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      description: 'Monitor and manage crisis situations',
      badge: 2
    },
    {
      id: 'system-config',
      title: 'System Config',
      href: '/admin/system-config',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Platform settings and configuration'
    },
    {
      id: 'reports',
      title: 'Reports',
      href: '/admin/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Generate compliance and usage reports'
    }
  ];

  return (
    <nav className={cn(
      'flex flex-col w-64 bg-white border-r border-neutral-200 h-screen',
      className
    )}>
      {/* Logo Section */}
      <div className="flex items-center px-6 py-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-coral to-accent-lime flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-neutral-800">Neurona</h2>
            <p className="text-sm text-secondary-coral font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                    isActive
                      ? 'bg-secondary-coral text-white shadow-md'
                      : 'text-neutral-600 hover:bg-secondary-coral-50 hover:text-secondary-coral-dark'
                  )}
                >
                  <span className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-white' : 'text-neutral-400 group-hover:text-secondary-coral'
                  )}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-base',
                      isActive ? 'text-white' : 'text-neutral-700 group-hover:text-secondary-coral-dark'
                    )}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className={cn(
                        'text-sm mt-0.5',
                        isActive ? 'text-secondary-coral-100' : 'text-neutral-500 group-hover:text-secondary-coral'
                      )}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.badge && (
                    <span className={cn(
                      'inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full min-w-[20px] h-5',
                      isActive 
                        ? 'bg-white text-secondary-coral' 
                        : 'bg-secondary-coral text-white'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Admin Profile Section */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-light flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              AD
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-neutral-800 truncate">Admin User</p>
            <p className="text-sm text-neutral-500 truncate">System Administrator</p>
          </div>
          <button className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};