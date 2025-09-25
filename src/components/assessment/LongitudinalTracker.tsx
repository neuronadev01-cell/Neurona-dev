'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AssessmentDataPoint {
  id: string;
  date: Date;
  overallScore: number;
  categories: {
    depression: number;
    anxiety: number;
    suicide_risk: number;
    substance_abuse: number;
    trauma: number;
  };
  assessmentType: 'intake' | 'followup' | 'crisis' | 'routine';
  notes?: string;
  treatmentChanges?: string[];
}

interface TrendAnalysis {
  direction: 'improving' | 'stable' | 'declining' | 'critical';
  percentage: number;
  significantChanges: string[];
  recommendations: string[];
}

interface LongitudinalTrackerProps {
  className?: string;
  patientId: string;
}

export const LongitudinalTracker: React.FC<LongitudinalTrackerProps> = ({
  className,
  patientId
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'depression' | 'anxiety' | 'suicide_risk' | 'substance_abuse' | 'trauma'>('overall');

  // Mock longitudinal data
  const [assessmentHistory] = useState<AssessmentDataPoint[]>([
    {
      id: '1',
      date: new Date('2024-01-15'),
      overallScore: 72,
      categories: { depression: 75, anxiety: 68, suicide_risk: 80, substance_abuse: 45, trauma: 50 },
      assessmentType: 'intake',
      notes: 'Initial intake assessment showing elevated depression and suicide risk scores',
      treatmentChanges: ['Started therapy sessions', 'Prescribed antidepressant medication']
    },
    {
      id: '2',
      date: new Date('2024-02-01'),
      overallScore: 65,
      categories: { depression: 68, anxiety: 62, suicide_risk: 70, substance_abuse: 40, trauma: 48 },
      assessmentType: 'followup',
      notes: 'Slight improvement in all categories after 2 weeks of treatment',
      treatmentChanges: ['Increased therapy frequency to twice weekly']
    },
    {
      id: '3',
      date: new Date('2024-02-15'),
      overallScore: 58,
      categories: { depression: 60, anxiety: 55, suicide_risk: 65, substance_abuse: 35, trauma: 45 },
      assessmentType: 'routine',
      notes: 'Continued improvement, patient responding well to treatment'
    },
    {
      id: '4',
      date: new Date('2024-03-01'),
      overallScore: 52,
      categories: { depression: 55, anxiety: 48, suicide_risk: 60, substance_abuse: 30, trauma: 42 },
      assessmentType: 'routine',
      notes: 'Steady progress, patient reports improved mood and sleep',
      treatmentChanges: ['Adjusted medication dosage']
    },
    {
      id: '5',
      date: new Date('2024-03-15'),
      overallScore: 45,
      categories: { depression: 48, anxiety: 42, suicide_risk: 50, substance_abuse: 25, trauma: 40 },
      assessmentType: 'followup',
      notes: 'Significant improvement across all areas'
    },
    {
      id: '6',
      date: new Date('2024-04-01'),
      overallScore: 38,
      categories: { depression: 40, anxiety: 35, suicide_risk: 45, substance_abuse: 20, trauma: 35 },
      assessmentType: 'routine',
      notes: 'Patient showing excellent progress, maintaining stability'
    }
  ]);

  const getTrendAnalysis = (): TrendAnalysis => {
    if (assessmentHistory.length < 2) {
      return {
        direction: 'stable',
        percentage: 0,
        significantChanges: [],
        recommendations: []
      };
    }

    const latest = assessmentHistory[assessmentHistory.length - 1];
    const previous = assessmentHistory[assessmentHistory.length - 2];
    const first = assessmentHistory[0];

    const recentChange = ((previous.overallScore - latest.overallScore) / previous.overallScore) * 100;
    const overallChange = ((first.overallScore - latest.overallScore) / first.overallScore) * 100;

    let direction: TrendAnalysis['direction'] = 'stable';
    if (latest.overallScore > 70) direction = 'critical';
    else if (recentChange < -10) direction = 'declining';
    else if (recentChange > 15) direction = 'improving';

    const significantChanges: string[] = [];
    const recommendations: string[] = [];

    // Analyze category changes
    Object.entries(latest.categories).forEach(([category, currentScore]) => {
      const previousScore = previous.categories[category as keyof typeof previous.categories];
      const change = ((previousScore - currentScore) / previousScore) * 100;
      
      if (Math.abs(change) > 20) {
        const changeType = change > 0 ? 'improvement' : 'decline';
        significantChanges.push(`${change > 0 ? 'Significant' : 'Notable'} ${changeType} in ${category.replace('_', ' ')}`);
      }

      if (currentScore > 60) {
        recommendations.push(`Consider intensifying treatment for ${category.replace('_', ' ')}`);
      }
    });

    if (direction === 'improving') {
      recommendations.push('Continue current treatment plan');
      recommendations.push('Consider reducing assessment frequency');
    } else if (direction === 'declining') {
      recommendations.push('Review and adjust treatment plan');
      recommendations.push('Increase monitoring frequency');
    }

    return {
      direction,
      percentage: Math.abs(recentChange),
      significantChanges,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  };

  const getFilteredData = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeRange) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return assessmentHistory.filter(point => point.date >= cutoffDate);
  };

  const getScoreForCategory = (dataPoint: AssessmentDataPoint, category: string) => {
    if (category === 'overall') return dataPoint.overallScore;
    return dataPoint.categories[category as keyof typeof dataPoint.categories] || 0;
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'improving': return 'text-green-600 bg-green-100 border-green-200';
      case 'stable': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'declining': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredData = getFilteredData();
  const trendAnalysis = getTrendAnalysis();
  const latestAssessment = assessmentHistory[assessmentHistory.length - 1];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-800">Longitudinal Assessment Tracking</h2>
          <p className="text-neutral-600">Monitor patient progress and trends over time</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-teal"
          >
            <option value="overall">Overall Score</option>
            <option value="depression">Depression</option>
            <option value="anxiety">Anxiety</option>
            <option value="suicide_risk">Suicide Risk</option>
            <option value="substance_abuse">Substance Abuse</option>
            <option value="trauma">Trauma</option>
          </select>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600 mb-2">Current Score</p>
            <p className="text-3xl font-bold text-neutral-800">{getScoreForCategory(latestAssessment, selectedCategory)}</p>
            <p className="text-xs text-neutral-500">out of 100</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600 mb-2">Trend</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTrendColor(trendAnalysis.direction)}`}>
              {trendAnalysis.direction.charAt(0).toUpperCase() + trendAnalysis.direction.slice(1)}
            </div>
            <p className="text-xs text-neutral-500 mt-1">{trendAnalysis.percentage.toFixed(1)}% change</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600 mb-2">Assessments</p>
            <p className="text-3xl font-bold text-primary-teal">{filteredData.length}</p>
            <p className="text-xs text-neutral-500">in selected period</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600 mb-2">Last Assessment</p>
            <p className="text-sm font-medium text-neutral-800">
              {latestAssessment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-neutral-500 capitalize">{latestAssessment.assessmentType}</p>
          </div>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Progress Chart - {selectedCategory.replace('_', ' ').charAt(0).toUpperCase() + selectedCategory.replace('_', ' ').slice(1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple timeline visualization */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
              <div className="space-y-6">
                {filteredData.map((dataPoint, index) => {
                  const score = getScoreForCategory(dataPoint, selectedCategory);
                  const isLatest = index === filteredData.length - 1;
                  
                  return (
                    <div key={dataPoint.id} className="relative flex items-center gap-6">
                      <div className={`relative z-10 w-8 h-8 rounded-full border-4 border-white ${getRiskColor(score)} flex items-center justify-center`}>
                        <span className="text-xs font-medium text-white">{score}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-neutral-800">
                            {dataPoint.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500 capitalize">{dataPoint.assessmentType}</span>
                            {isLatest && (
                              <span className="px-2 py-0.5 bg-primary-teal text-white text-xs rounded-full">Latest</span>
                            )}
                          </div>
                        </div>
                        
                        {dataPoint.notes && (
                          <p className="text-sm text-neutral-600 mb-2">{dataPoint.notes}</p>
                        )}
                        
                        {dataPoint.treatmentChanges && dataPoint.treatmentChanges.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {dataPoint.treatmentChanges.map((change, changeIndex) => (
                              <span 
                                key={changeIndex}
                                className="px-2 py-0.5 bg-secondary-coral-100 text-secondary-coral-800 text-xs rounded"
                              >
                                {change}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-neutral-800 mb-3">Significant Changes</h4>
              {trendAnalysis.significantChanges.length > 0 ? (
                <ul className="space-y-2">
                  {trendAnalysis.significantChanges.map((change, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary-teal rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-neutral-700">{change}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No significant changes detected in the selected period.</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-neutral-800 mb-3">Recommendations</h4>
              {trendAnalysis.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {trendAnalysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary-coral rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-neutral-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No specific recommendations at this time.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle>Current Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(latestAssessment.categories).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke={score >= 70 ? '#ef4444' : score >= 50 ? '#f97316' : score >= 30 ? '#eab308' : '#22c55e'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(score / 100) * 175.93} 175.93`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-neutral-800">{score}</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 capitalize">{category.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};