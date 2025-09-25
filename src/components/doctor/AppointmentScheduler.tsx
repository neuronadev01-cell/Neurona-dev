'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  appointmentTime: string;
  duration: number;
  appointmentType: 'initial' | 'followup' | 'emergency' | 'assessment';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  sessionNotes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

interface AppointmentSchedulerProps {
  className?: string;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Generate time slots for the day (9 AM to 6 PM, 30-minute slots)
  const generateTimeSlots = (appointments: Appointment[], date: string) => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const dateTime = `${date}T${timeString}:00.000Z`;
        
        const appointment = appointments.find(apt => 
          new Date(apt.appointmentTime).toISOString().includes(dateTime.substring(0, 16))
        );

        slots.push({
          time: timeString,
          available: !appointment,
          appointment: appointment
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Mock data - in real app, would fetch from API based on selected date
        const mockAppointments: Appointment[] = [
          {
            id: '1',
            patientName: 'Sarah Johnson',
            patientId: 'patient_1',
            appointmentTime: `${selectedDate}T10:00:00.000Z`,
            duration: 50,
            appointmentType: 'initial',
            status: 'confirmed',
            notes: 'First session - anxiety assessment'
          },
          {
            id: '2',
            patientName: 'Michael Chen',
            patientId: 'patient_2',
            appointmentTime: `${selectedDate}T11:30:00.000Z`,
            duration: 50,
            appointmentType: 'followup',
            status: 'scheduled',
            notes: 'CBT session #3'
          },
          {
            id: '3',
            patientName: 'Emma Davis',
            patientId: 'patient_3',
            appointmentTime: `${selectedDate}T14:00:00.000Z`,
            duration: 50,
            appointmentType: 'assessment',
            status: 'confirmed',
            notes: 'Deep screening assessment'
          },
          {
            id: '4',
            patientName: 'Alex Thompson',
            patientId: 'patient_4',
            appointmentTime: `${selectedDate}T15:30:00.000Z`,
            duration: 50,
            appointmentType: 'emergency',
            status: 'confirmed',
            notes: 'Crisis intervention session'
          }
        ];

        // Only show appointments for selected date
        const dateAppointments = mockAppointments.filter(apt => 
          apt.appointmentTime.startsWith(selectedDate)
        );

        setAppointments(dateAppointments);
        setTimeSlots(generateTimeSlots(dateAppointments, selectedDate));
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAppointmentTypeBadge = (type: string) => {
    const typeClasses = {
      initial: 'bg-primary-teal-100 text-primary-teal-800 border-primary-teal-200',
      followup: 'bg-blue-100 text-blue-800 border-blue-200',
      assessment: 'bg-accent-purple-100 text-accent-purple-800 border-accent-purple-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    }[type] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${typeClasses}`}>
        {type === 'followup' ? 'Follow-up' : type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      'no-show': 'bg-red-100 text-red-800 border-red-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
        {status === 'no-show' ? 'No Show' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // Handle appointment rescheduling
    console.log('Reschedule appointment:', appointmentId);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    // Handle appointment cancellation
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled' as const }
          : apt
      )
    );
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    // Handle marking appointment as complete
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'completed' as const }
          : apt
      )
    );
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Appointment Schedule</h2>
          <p className="text-neutral-600">Manage your appointments and availability</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAvailabilityModal(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            Set Availability
          </Button>
          <Button variant="primary" leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }>
            New Appointment
          </Button>
        </div>
      </div>

      {/* Date Navigation and View Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 1);
                setSelectedDate(newDate.toISOString().split('T')[0]);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-neutral-800">{formatDate(selectedDate)}</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 text-sm text-neutral-600 bg-transparent border-none outline-none cursor-pointer"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 1);
                setSelectedDate(newDate.toISOString().split('T')[0]);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 rounded-xl p-1">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  viewMode === mode
                    ? 'bg-white text-primary-teal shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-teal">{appointments.length}</p>
            <p className="text-sm text-neutral-600">Total Appointments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {appointments.filter(apt => apt.status === 'confirmed').length}
            </p>
            <p className="text-sm text-neutral-600">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {appointments.filter(apt => apt.status === 'scheduled').length}
            </p>
            <p className="text-sm text-neutral-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-600">
              {timeSlots.filter(slot => slot.available).length}
            </p>
            <p className="text-sm text-neutral-600">Available Slots</p>
          </div>
        </div>
      </Card>

      {/* Appointment List */}
      <div className="grid gap-4">
        {appointments.length === 0 ? (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No appointments scheduled</h3>
            <p className="text-neutral-500 mb-4">You have no appointments for {formatDate(selectedDate)}</p>
            <Button variant="primary">Schedule New Appointment</Button>
          </Card>
        ) : (
          appointments
            .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime())
            .map((appointment) => (
              <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Appointment Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-teal to-primary-teal-light rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {appointment.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-800 text-lg">{appointment.patientName}</h3>
                        {getAppointmentTypeBadge(appointment.appointmentType)}
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-neutral-600">
                        <div>
                          <p className="font-medium mb-1">Time</p>
                          <p className="text-primary-teal font-medium">
                            {formatTime(appointment.appointmentTime)}
                          </p>
                          <p className="text-xs text-neutral-500">{appointment.duration} minutes</p>
                        </div>
                        
                        <div>
                          <p className="font-medium mb-1">Type</p>
                          <p>{appointment.appointmentType === 'followup' ? 'Follow-up' : appointment.appointmentType.charAt(0).toUpperCase() + appointment.appointmentType.slice(1)}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium mb-1">Notes</p>
                          <p className="text-xs">{appointment.notes || 'No notes'}</p>
                        </div>
                      </div>
                      
                      {appointment.sessionNotes && (
                        <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                          <p className="text-sm font-medium text-neutral-700 mb-1">Session Notes</p>
                          <p className="text-sm text-neutral-600">{appointment.sessionNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                    {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                        >
                          Start Session
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleAppointment(appointment.id)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : appointment.status === 'completed' ? (
                      <Button variant="outline" size="sm">
                        View Notes
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>

      {/* Time Slot Grid for Available Slots */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {timeSlots
              .filter(slot => slot.available)
              .map((slot, index) => (
                <button
                  key={index}
                  className="p-3 border border-neutral-200 rounded-lg text-sm text-center hover:bg-primary-teal-50 hover:border-primary-teal transition-colors"
                  onClick={() => {
                    console.log('Book slot:', slot.time);
                  }}
                >
                  {slot.time}
                </button>
              ))}
          </div>
          {timeSlots.filter(slot => slot.available).length === 0 && (
            <p className="text-center text-neutral-500 py-8">No available time slots for this day</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};