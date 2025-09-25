'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DoctorRegistrationData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Professional Information
  specialty: string;
  licenseNumber: string;
  experienceYears: number;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications: {
    name: string;
    issuingBody: string;
    year: number;
    expiryYear?: number;
  }[];
  
  // Practice Information
  bio: string;
  languages: string[];
  consultationFee: number;
  
  // Availability
  availability: {
    monday: { available: boolean; slots: string[] };
    tuesday: { available: boolean; slots: string[] };
    wednesday: { available: boolean; slots: string[] };
    thursday: { available: boolean; slots: string[] };
    friday: { available: boolean; slots: string[] };
    saturday: { available: boolean; slots: string[] };
    sunday: { available: boolean; slots: string[] };
  };
  
  // Documents
  verificationDocs: {
    medicalLicense: File | null;
    educationCertificate: File | null;
    specialtyCertificate: File | null;
    cv: File | null;
  };
}

const specialties = [
  'General Psychiatry',
  'Clinical Psychology',
  'Child & Adolescent Psychiatry',
  'Addiction Medicine',
  'Geriatric Psychiatry',
  'Forensic Psychiatry',
  'Neuropsychiatry',
  'Psychotherapy',
  'Anxiety Disorders',
  'Depression & Mood Disorders',
  'PTSD & Trauma',
  'Eating Disorders',
  'ADHD',
  'Autism Spectrum Disorders',
  'Bipolar Disorder',
  'Personality Disorders',
  'Other'
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
  'Hindi', 'Arabic', 'Mandarin', 'Japanese', 'Korean', 'Russian', 'Other'
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00'
];

interface DoctorRegistrationFormProps {
  onSubmit: (data: DoctorRegistrationData) => Promise<void>;
  isLoading?: boolean;
}

export const DoctorRegistrationForm: React.FC<DoctorRegistrationFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DoctorRegistrationData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialty: '',
    licenseNumber: '',
    experienceYears: 0,
    education: [],
    certifications: [],
    bio: '',
    languages: [],
    consultationFee: 0,
    availability: {
      monday: { available: false, slots: [] },
      tuesday: { available: false, slots: [] },
      wednesday: { available: false, slots: [] },
      thursday: { available: false, slots: [] },
      friday: { available: false, slots: [] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] },
    },
    verificationDocs: {
      medicalLicense: null,
      educationCertificate: null,
      specialtyCertificate: null,
      cv: null,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2: // Professional Information
        if (!formData.specialty) newErrors.specialty = 'Specialty is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.experienceYears || formData.experienceYears < 0) {
          newErrors.experienceYears = 'Valid experience years required';
        }
        if (formData.education.length === 0) {
          newErrors.education = 'At least one education entry is required';
        }
        break;

      case 3: // Practice Information
        if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
        if (formData.bio.length < 100) newErrors.bio = 'Bio must be at least 100 characters';
        if (formData.languages.length === 0) newErrors.languages = 'At least one language is required';
        if (!formData.consultationFee || formData.consultationFee <= 0) {
          newErrors.consultationFee = 'Valid consultation fee is required';
        }
        break;

      case 4: // Availability
        const hasAvailability = Object.values(formData.availability).some(day => day.available);
        if (!hasAvailability) {
          newErrors.availability = 'Please select at least one available day';
        }
        break;

      case 5: // Documents
        if (!formData.verificationDocs.medicalLicense) {
          newErrors.medicalLicense = 'Medical license is required';
        }
        if (!formData.verificationDocs.educationCertificate) {
          newErrors.educationCertificate = 'Education certificate is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(5)) {
      await onSubmit(formData);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (field: keyof DoctorRegistrationData['verificationDocs'], file: File | null) => {
    setFormData(prev => ({
      ...prev,
      verificationDocs: {
        ...prev.verificationDocs,
        [field]: file
      }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuingBody: '', year: new Date().getFullYear() }]
    }));
  };

  const updateCertification = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const updateAvailability = (day: keyof DoctorRegistrationData['availability'], available: boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: { ...prev.availability[day], available, slots: available ? prev.availability[day].slots : [] }
      }
    }));
  };

  const toggleTimeSlot = (day: keyof DoctorRegistrationData['availability'], slot: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          slots: prev.availability[day].slots.includes(slot)
            ? prev.availability[day].slots.filter(s => s !== slot)
            : [...prev.availability[day].slots, slot]
        }
      }
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dr. John Smith"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => updateFormData('specialty', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.specialty ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical License Number *</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="License number"
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experienceYears || ''}
                  onChange={(e) => updateFormData('experienceYears', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.experienceYears ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Years of practice"
                />
                {errors.experienceYears && <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>}
              </div>

              {/* Education Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Education *</label>
                  <Button type="button" variant="outline" onClick={addEducation} className="text-sm">
                    Add Education
                  </Button>
                </div>
                
                {formData.education.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Degree (e.g., MD, PhD)"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          placeholder="Year"
                          value={edu.year || ''}
                          onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
              </div>

              {/* Certifications Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Certifications (Optional)</label>
                  <Button type="button" variant="outline" onClick={addCertification} className="text-sm">
                    Add Certification
                  </Button>
                </div>
                
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Certification name"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Issuing body"
                        value={cert.issuingBody}
                        onChange={(e) => updateCertification(index, 'issuingBody', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear()}
                        placeholder="Year obtained"
                        value={cert.year || ''}
                        onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={new Date().getFullYear()}
                          placeholder="Expiry (optional)"
                          value={cert.expiryYear || ''}
                          onChange={(e) => updateCertification(index, 'expiryYear', parseInt(e.target.value) || undefined)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Practice Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio * (minimum 100 characters)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell patients about your approach, experience, and what makes you unique as a mental health professional..."
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formData.bio.length}/100 minimum characters</span>
                  {errors.bio && <p className="text-red-500">{errors.bio}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken * (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {languages.map(language => (
                    <label key={language} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => toggleLanguage(language)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{language}</span>
                    </label>
                  ))}
                </div>
                {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.consultationFee || ''}
                  onChange={(e) => updateFormData('consultationFee', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.consultationFee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="150.00"
                />
                {errors.consultationFee && <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>}
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Availability Schedule</h3>
            <p className="text-gray-600 mb-4">
              Select your available days and time slots. You can modify this later in your dashboard.
            </p>
            
            <div className="space-y-4">
              {Object.entries(formData.availability).map(([day, dayData]) => (
                <div key={day} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      checked={dayData.available}
                      onChange={(e) => updateAvailability(day as keyof DoctorRegistrationData['availability'], e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="font-medium text-gray-700 capitalize">{day}</label>
                  </div>
                  
                  {dayData.available && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 ml-7">
                      {timeSlots.map(slot => (
                        <label key={slot} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={dayData.slots.includes(slot)}
                            onChange={() => toggleTimeSlot(day as keyof DoctorRegistrationData['availability'], slot)}
                            className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-600">{slot}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
            </div>
          </Card>
        );

      case 5:
        return (
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Documents</h3>
            <p className="text-gray-600 mb-4">
              Please upload the required documents for verification. All documents will be securely stored and reviewed by our team.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical License *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('medicalLicense', e.target.files?.[0] || null)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.medicalLicense ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formData.verificationDocs.medicalLicense && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {formData.verificationDocs.medicalLicense.name}
                  </p>
                )}
                {errors.medicalLicense && <p className="text-red-500 text-sm mt-1">{errors.medicalLicense}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education Certificate *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('educationCertificate', e.target.files?.[0] || null)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.educationCertificate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formData.verificationDocs.educationCertificate && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {formData.verificationDocs.educationCertificate.name}
                  </p>
                )}
                {errors.educationCertificate && <p className="text-red-500 text-sm mt-1">{errors.educationCertificate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty Certificate (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('specialtyCertificate', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {formData.verificationDocs.specialtyCertificate && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {formData.verificationDocs.specialtyCertificate.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CV/Resume (Optional)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload('cv', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {formData.verificationDocs.cv && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {formData.verificationDocs.cv.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your application will be reviewed within 2-3 business days</li>
                  <li>• We may contact you for additional information</li>
                  <li>• Once approved, you'll receive an email with your login credentials</li>
                  <li>• You can then access your doctor dashboard and start accepting patients</li>
                </ul>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Personal Information',
    'Professional Information', 
    'Practice Information',
    'Availability',
    'Documents'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-600 mb-2">
          Join Neurona as a Provider
        </h2>
        <p className="text-gray-600">
          Help us provide quality mental health care to those who need it most.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of 5: {stepTitles[currentStep - 1]}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((currentStep / 5) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-2">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index + 1 <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="text-xs text-gray-500 mt-1 text-center max-w-16">{title.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="px-6"
            >
              Previous
            </Button>
          )}
        </div>
        
        <div>
          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="px-6"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="primary"
              className="px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};