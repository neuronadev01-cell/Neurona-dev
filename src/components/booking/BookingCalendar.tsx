'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TimeSlot {
  time: string;
  available: boolean;
  doctorId: string;
}

interface BookingCalendarProps {
  doctorId: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  fees: number;
  availability: any;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  doctorId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onConfirm,
  isLoading = false
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`/api/doctors/${doctorId}`);
        const data = await response.json();
        
        if (data.success) {
          setDoctor(data.doctor);
        }
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !doctor) return;

      setLoadingSlots(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/bookings/availability?doctorId=${doctorId}&date=${dateStr}`);
        const data = await response.json();
        
        if (data.success) {
          setAvailableSlots(data.slots);
        }
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, doctorId, doctor]);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      // Check if doctor is available on this day
      const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const isAvailable = doctor?.availability?.[dayName]?.available && !isPast;

      days.push({
        date,
        day,
        isPast,
        isToday,
        isSelected,
        isWeekend,
        isAvailable
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const formatFee = (fee: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(fee);
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <Card variant="outlined" className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Doctor Information */}
      <Card variant="outlined" className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Book Appointment with {doctor.name}
            </h2>
            <p className="text-gray-600 mb-2">{doctor.specialty}</p>
            <p className="text-sm text-gray-500">
              Please select your preferred date and time below
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary-600">
              {formatFee(doctor.fees)}
            </div>
            <div className="text-sm text-gray-500">per session</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card variant="outlined" className="p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h4 className="text-lg font-medium text-gray-800 min-w-40 text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  return <div key={index} className="p-2"></div>;
                }

                const { date, day, isPast, isToday, isSelected, isAvailable } = dayData;

                return (
                  <button
                    key={day}
                    onClick={() => isAvailable ? onDateSelect(date) : null}
                    disabled={!isAvailable}
                    className={`
                      p-2 text-sm rounded-lg border transition-colors
                      ${isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : isToday
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : isAvailable
                        ? 'hover:bg-gray-50 border-gray-200 text-gray-900'
                        : 'text-gray-400 border-gray-100 cursor-not-allowed'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-100 border border-gray-100 rounded"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Slots */}
        <Card variant="outlined" className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Time</h3>
          
          {!selectedDate ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Please select a date first</p>
            </div>
          ) : loadingSlots ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => slot.available ? onTimeSelect(slot.time) : null}
                  disabled={!slot.available}
                  className={`
                    w-full p-3 text-left rounded-lg border transition-colors
                    ${selectedTime === slot.time
                      ? 'bg-primary-600 text-white border-primary-600'
                      : slot.available
                      ? 'hover:bg-gray-50 border-gray-200 text-gray-900'
                      : 'text-gray-400 border-gray-100 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                    {slot.available ? (
                      <span className="text-xs text-green-600">Available</span>
                    ) : (
                      <span className="text-xs text-gray-400">Booked</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No available slots for this date</p>
              <p className="text-xs text-gray-400 mt-1">Please select a different date</p>
            </div>
          )}
        </Card>
      </div>

      {/* Booking Summary & Confirmation */}
      {selectedDate && selectedTime && (
        <Card variant="outlined" className="p-6 bg-green-50 border-green-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Confirm Your Appointment
              </h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Doctor:</strong> {doctor.name}</p>
                <p><strong>Specialty:</strong> {doctor.specialty}</p>
                <p><strong>Date:</strong> {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Time:</strong> {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-800">
                {formatFee(doctor.fees)}
              </div>
              <div className="text-sm text-green-600">Total</div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                onDateSelect(null as any);
                onTimeSelect(null as any);
              }}
            >
              Change Selection
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};