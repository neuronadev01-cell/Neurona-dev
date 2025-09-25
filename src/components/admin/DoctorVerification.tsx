'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DoctorApplication {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  professionalInfo: {
    licenseNumber: string;
    specialty: string;
    yearsExperience: number;
    education: string;
    certifications: string[];
    bio: string;
    fees: number;
    languages: string[];
  };
  documents: {
    medicalLicense: {
      fileName: string;
      uploadedAt: string;
      verified: boolean;
    };
    diploma: {
      fileName: string;
      uploadedAt: string;
      verified: boolean;
    };
    certifications: {
      fileName: string;
      uploadedAt: string;
      verified: boolean;
    }[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  verificationScore: number;
}

interface DoctorVerificationProps {
  className?: string;
}

export const DoctorVerification: React.FC<DoctorVerificationProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<DoctorApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Mock data - in real app, would fetch from API
        const mockApplications: DoctorApplication[] = [
          {
            id: '1',
            personalInfo: {
              firstName: 'Michael',
              lastName: 'Chen',
              email: 'dr.michael.chen@email.com',
              phone: '(555) 123-4567',
              dateOfBirth: '1985-03-15'
            },
            professionalInfo: {
              licenseNumber: 'MD12345678',
              specialty: 'Clinical Psychology',
              yearsExperience: 8,
              education: 'PhD in Clinical Psychology, Stanford University',
              certifications: ['Licensed Clinical Psychologist', 'CBT Certification'],
              bio: 'Specializing in anxiety disorders and trauma therapy with 8 years of experience.',
              fees: 150,
              languages: ['English', 'Mandarin']
            },
            documents: {
              medicalLicense: {
                fileName: 'medical_license_chen.pdf',
                uploadedAt: '2024-01-10T10:00:00Z',
                verified: false
              },
              diploma: {
                fileName: 'phd_diploma_chen.pdf',
                uploadedAt: '2024-01-10T10:00:00Z',
                verified: false
              },
              certifications: [
                {
                  fileName: 'cbt_certification_chen.pdf',
                  uploadedAt: '2024-01-10T10:00:00Z',
                  verified: false
                }
              ]
            },
            status: 'pending',
            submittedAt: '2024-01-10T09:30:00Z',
            verificationScore: 85
          },
          {
            id: '2',
            personalInfo: {
              firstName: 'Emily',
              lastName: 'Rodriguez',
              email: 'dr.emily.rodriguez@email.com',
              phone: '(555) 234-5678',
              dateOfBirth: '1982-07-22'
            },
            professionalInfo: {
              licenseNumber: 'MD87654321',
              specialty: 'Psychiatry',
              yearsExperience: 12,
              education: 'MD Psychiatry, Harvard Medical School',
              certifications: ['Board Certified Psychiatrist', 'EMDR Therapy'],
              bio: 'Experienced psychiatrist specializing in mood disorders and PTSD treatment.',
              fees: 200,
              languages: ['English', 'Spanish']
            },
            documents: {
              medicalLicense: {
                fileName: 'medical_license_rodriguez.pdf',
                uploadedAt: '2024-01-09T14:30:00Z',
                verified: false
              },
              diploma: {
                fileName: 'md_diploma_rodriguez.pdf',
                uploadedAt: '2024-01-09T14:30:00Z',
                verified: false
              },
              certifications: [
                {
                  fileName: 'psychiatry_board_rodriguez.pdf',
                  uploadedAt: '2024-01-09T14:30:00Z',
                  verified: false
                },
                {
                  fileName: 'emdr_certification_rodriguez.pdf',
                  uploadedAt: '2024-01-09T14:30:00Z',
                  verified: false
                }
              ]
            },
            status: 'under_review',
            submittedAt: '2024-01-09T14:00:00Z',
            verificationScore: 92
          },
          {
            id: '3',
            personalInfo: {
              firstName: 'David',
              lastName: 'Kim',
              email: 'dr.david.kim@email.com',
              phone: '(555) 345-6789',
              dateOfBirth: '1978-11-08'
            },
            professionalInfo: {
              licenseNumber: 'MD11223344',
              specialty: 'Marriage & Family Therapy',
              yearsExperience: 15,
              education: 'LMFT, University of California Los Angeles',
              certifications: ['Licensed Marriage and Family Therapist', 'Gottman Method Couples Therapy'],
              bio: 'Licensed therapist with extensive experience in couples and family counseling.',
              fees: 175,
              languages: ['English', 'Korean']
            },
            documents: {
              medicalLicense: {
                fileName: 'lmft_license_kim.pdf',
                uploadedAt: '2024-01-08T11:15:00Z',
                verified: true
              },
              diploma: {
                fileName: 'lmft_degree_kim.pdf',
                uploadedAt: '2024-01-08T11:15:00Z',
                verified: true
              },
              certifications: [
                {
                  fileName: 'gottman_certification_kim.pdf',
                  uploadedAt: '2024-01-08T11:15:00Z',
                  verified: true
                }
              ]
            },
            status: 'approved',
            submittedAt: '2024-01-08T10:45:00Z',
            reviewedBy: 'Admin User',
            reviewedAt: '2024-01-08T16:20:00Z',
            reviewNotes: 'All credentials verified. Excellent references and experience.',
            verificationScore: 96
          }
        ];

        setApplications(mockApplications);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' ? true : app.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getVerificationScoreBadge = (score: number) => {
    const scoreColor = score >= 90 ? 'text-green-600' : 
                     score >= 75 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <span className={`font-bold ${scoreColor}`}>
        {score}%
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleReview = (application: DoctorApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (!selectedApplication || !reviewAction) return;

    // Update application status
    setApplications(prev => prev.map(app => 
      app.id === selectedApplication.id 
        ? {
            ...app,
            status: reviewAction === 'approve' ? 'approved' : 'rejected',
            reviewedBy: 'Admin User',
            reviewedAt: new Date().toISOString(),
            reviewNotes: reviewNotes
          }
        : app
    ));

    setShowReviewModal(false);
    setSelectedApplication(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  const handleDocumentView = (fileName: string) => {
    // In real app, would open document viewer or download
    console.log('Viewing document:', fileName);
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
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
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Doctor Verification</h2>
          <p className="text-neutral-600">Review and approve doctor registration applications</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-coral focus:border-transparent"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending Review</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>Showing {filteredApplications.length} applications</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{applications.filter(a => a.status === 'pending').length} pending</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <div className="grid gap-4">
        {filteredApplications.length === 0 ? (
          <Card className="p-8 text-center">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No applications found</h3>
            <p className="text-neutral-500">No doctor applications match the selected criteria</p>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              {/* Application Header */}
              <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-coral to-secondary-coral-light rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {application.personalInfo.firstName[0]}{application.personalInfo.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-neutral-800 text-lg">
                          Dr. {application.personalInfo.firstName} {application.personalInfo.lastName}
                        </h3>
                        {getStatusBadge(application.status)}
                        <span className="text-sm text-neutral-500">
                          Score: {getVerificationScoreBadge(application.verificationScore)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-1">{application.professionalInfo.specialty}</p>
                      <p className="text-xs text-neutral-500">
                        Submitted {formatDate(application.submittedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReview(application, 'reject')}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleReview(application, 'approve')}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Application Summary */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Professional Info</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-neutral-500">License:</span> {application.professionalInfo.licenseNumber}</p>
                      <p><span className="text-neutral-500">Experience:</span> {application.professionalInfo.yearsExperience} years</p>
                      <p><span className="text-neutral-500">Fee:</span> ${application.professionalInfo.fees}/session</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Education</h4>
                    <p className="text-sm text-neutral-600">{application.professionalInfo.education}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.professionalInfo.languages.map((lang, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-teal-100 text-primary-teal-800 text-xs rounded-md">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-700 mb-2">Documents</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          application.documents.medicalLicense.verified ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span>Medical License</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          application.documents.diploma.verified ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span>Diploma</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          application.documents.certifications.every(c => c.verified) ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span>{application.documents.certifications.length} Certifications</span>
                      </div>
                    </div>
                  </div>
                </div>

                {application.reviewNotes && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Review Notes</h5>
                    <p className="text-sm text-blue-800">{application.reviewNotes}</p>
                    {application.reviewedBy && application.reviewedAt && (
                      <p className="text-xs text-blue-600 mt-2">
                        Reviewed by {application.reviewedBy} on {formatDate(application.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <CardHeader className="border-b border-neutral-200">
              <CardTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
              </CardTitle>
              <p className="text-sm text-neutral-600 mt-1">
                Dr. {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Review Notes {reviewAction === 'reject' && '(Required)'}
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={`Add notes about your ${reviewAction} decision...`}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-coral focus:border-transparent"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedApplication(null);
                      setReviewAction(null);
                      setReviewNotes('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={reviewAction === 'approve' ? 'primary' : 'destructive'}
                    onClick={handleSubmitReview}
                    disabled={reviewAction === 'reject' && !reviewNotes.trim()}
                  >
                    {reviewAction === 'approve' ? 'Approve Application' : 'Reject Application'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedApplication && !showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Dr. {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}
                  </CardTitle>
                  <p className="text-sm text-neutral-600 mt-1">
                    Application Details • {selectedApplication.professionalInfo.specialty}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedApplication(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-4">Personal Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Full Name:</span>
                      <p className="text-neutral-600">
                        {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Email:</span>
                      <p className="text-neutral-600">{selectedApplication.personalInfo.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Phone:</span>
                      <p className="text-neutral-600">{selectedApplication.personalInfo.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Date of Birth:</span>
                      <p className="text-neutral-600">{formatDate(selectedApplication.personalInfo.dateOfBirth)}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="font-semibold text-neutral-800 mb-4">Professional Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">License Number:</span>
                      <p className="text-neutral-600">{selectedApplication.professionalInfo.licenseNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Specialty:</span>
                      <p className="text-neutral-600">{selectedApplication.professionalInfo.specialty}</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Years of Experience:</span>
                      <p className="text-neutral-600">{selectedApplication.professionalInfo.yearsExperience} years</p>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Session Fee:</span>
                      <p className="text-neutral-600">${selectedApplication.professionalInfo.fees}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-8">
                <h4 className="font-semibold text-neutral-800 mb-4">Professional Bio</h4>
                <p className="text-neutral-600 text-sm leading-relaxed">{selectedApplication.professionalInfo.bio}</p>
              </div>

              {/* Documents */}
              <div className="mt-8">
                <h4 className="font-semibold text-neutral-800 mb-4">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-neutral-800">Medical License</h5>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedApplication.documents.medicalLicense.verified ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">{selectedApplication.documents.medicalLicense.fileName}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      width="full"
                      onClick={() => handleDocumentView(selectedApplication.documents.medicalLicense.fileName)}
                    >
                      View Document
                    </Button>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-neutral-800">Diploma</h5>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedApplication.documents.diploma.verified ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">{selectedApplication.documents.diploma.fileName}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      width="full"
                      onClick={() => handleDocumentView(selectedApplication.documents.diploma.fileName)}
                    >
                      View Document
                    </Button>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-neutral-800">Certifications</h5>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedApplication.documents.certifications.every(c => c.verified) ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">
                      {selectedApplication.documents.certifications.length} files
                    </p>
                    <Button variant="outline" size="sm" width="full">
                      View All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-neutral-200">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowReviewModal(true);
                      setReviewAction('reject');
                    }}
                  >
                    Reject Application
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowReviewModal(true);
                      setReviewAction('approve');
                    }}
                  >
                    Approve Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};