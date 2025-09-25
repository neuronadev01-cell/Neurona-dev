/**
 * Assessment Scoring Logic for Neurona AI Intake System
 * Implements scoring algorithms from neurona_onboarding.txt
 */

import {
  ShortQuestionnaireData,
  DeepScreeningData,
  AssessmentScores,
  HistoryTakingData
} from './assessmentData';

/**
 * Calculate Short Questionnaire Score (0-30)
 * Scoring System from neurona_onboarding.txt:
 * - 0-7: Normal/Mild → Lifestyle nudges, monitor
 * - 8-15: Moderate → Suggest therapist
 * - 16-20: Moderate-Severe → Therapist + psychiatrist recommended
 * - 21-30: Severe → Psychiatrist strongly recommended
 */
export const calculateShortQuestionnaireScore = (data: ShortQuestionnaireData): AssessmentScores['shortQuestionnaire'] => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  let severity: 'normal' | 'moderate' | 'moderate-severe' | 'severe';
  let needsDeepScreening = false;
  const autoFlags: string[] = [];

  // Determine severity based on total score
  if (total >= 0 && total <= 7) {
    severity = 'normal';
    needsDeepScreening = false;
  } else if (total >= 8 && total <= 15) {
    severity = 'moderate';
    needsDeepScreening = true;
  } else if (total >= 16 && total <= 20) {
    severity = 'moderate-severe';
    needsDeepScreening = true;
  } else {
    severity = 'severe';
    needsDeepScreening = true;
  }

  // Special auto-trigger rules from neurona_onboarding.txt
  // Q10 (suicidal thoughts) >= 1 → auto-flag for doctor review
  if (data.q10_suicidal_thoughts >= 1) {
    autoFlags.push('suicidality_risk');
    needsDeepScreening = true; // Mandatory deep screening
  }

  // Q5 (severe sleep problem = 3) → Deep screening suggested
  if (data.q5_sleep === 3) {
    autoFlags.push('severe_sleep_disturbance');
    needsDeepScreening = true;
  }

  // Q9 (compulsive digital use = 3) → Deep screening suggested
  if (data.q9_digital_escape === 3) {
    autoFlags.push('compulsive_digital_use');
    needsDeepScreening = true;
  }

  return {
    total,
    severity,
    needsDeepScreening,
    autoFlags
  };
};

/**
 * Calculate Deep Screening Score (0-51)
 * Scoring System:
 * - 0-10: Normal/Mild (monitor, lifestyle nudges)
 * - 11-20: Moderate (recommend therapist)
 * - 21-35: Moderate-Severe (therapist + psychiatrist referral)
 * - 36-51: Severe/Crisis (psychiatrist + crisis intervention)
 */
export const calculateDeepScreeningScore = (data: DeepScreeningData): AssessmentScores['deepScreening'] => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  let severity: 'normal' | 'moderate' | 'moderate-severe' | 'severe';
  const riskFlags: string[] = [];

  // Determine severity based on total score
  if (total >= 0 && total <= 10) {
    severity = 'normal';
  } else if (total >= 11 && total <= 20) {
    severity = 'moderate';
  } else if (total >= 21 && total <= 35) {
    severity = 'moderate-severe';
  } else {
    severity = 'severe';
  }

  // Calculate domain scores
  const domainScores = {
    depression: data.depression_q1_sadness + data.depression_q2_anhedonia + 
                data.depression_q3_sleep_energy + data.depression_q4_suicidal_thoughts,
    anxiety: data.anxiety_q5_nervousness + data.anxiety_q6_excessive_worry + 
             data.anxiety_q7_restlessness,
    suicidality: data.suicide_q8_passive_thoughts + data.suicide_q9_active_thoughts,
    mania: data.mania_q10_elevated_mood + data.mania_q11_decreased_sleep,
    psychosis: data.psychosis_q12_hallucinations + data.psychosis_q13_paranoia,
    substance: data.substance_q14_alcohol_tobacco + data.substance_q15_drugs,
    functioning: data.functioning_q16_impairment + data.sleep_q17_hours
  };

  // Special risk flags from neurona_onboarding.txt
  
  // Any suicidal thought (Q4, Q8, Q9 > 1) = auto-flag for urgent doctor attention
  if (data.depression_q4_suicidal_thoughts >= 1 || 
      data.suicide_q8_passive_thoughts >= 1 || 
      data.suicide_q9_active_thoughts >= 1) {
    riskFlags.push('suicidality_risk');
  }

  // Critical suicidal risk (active thoughts)
  if (data.suicide_q9_active_thoughts >= 2) {
    riskFlags.push('critical_suicidality_risk');
  }

  // Psychosis symptoms (Q12 or Q13 >= 2) = psychiatrist referral regardless of total score
  if (data.psychosis_q12_hallucinations >= 2 || data.psychosis_q13_paranoia >= 2) {
    riskFlags.push('psychosis_symptoms');
  }

  // Substance use concerns
  if (domainScores.substance >= 4) {
    riskFlags.push('substance_use_concern');
  }

  // Severe functional impairment
  if (data.functioning_q16_impairment === 3) {
    riskFlags.push('severe_functional_impairment');
  }

  // Severe sleep disturbance
  if (data.sleep_q17_hours === 3) {
    riskFlags.push('severe_sleep_disturbance');
  }

  return {
    total,
    severity,
    domainScores,
    riskFlags
  };
};

/**
 * Generate AI Recommendations based on scores
 */
export const generateRecommendations = (
  shortScore: AssessmentScores['shortQuestionnaire'],
  deepScore?: AssessmentScores['deepScreening']
): {
  triage: 'monitor' | 'therapist' | 'therapist_psychiatrist' | 'psychiatrist_crisis';
  recommendations: string[];
  urgentFlags: string[];
} => {
  const recommendations: string[] = [];
  const urgentFlags: string[] = [];
  let triage: 'monitor' | 'therapist' | 'therapist_psychiatrist' | 'psychiatrist_crisis' = 'monitor';

  // Use deep screening if available, otherwise fall back to short questionnaire
  const primaryScore = deepScore || shortScore;
  const totalScore = deepScore ? deepScore.total : shortScore.total;

  // Triage logic based on neurona_onboarding.txt
  if (deepScore) {
    // Deep screening triage (0-51 scale)
    if (totalScore >= 0 && totalScore <= 10) {
      triage = 'monitor';
      recommendations.push('Lifestyle modifications and self-monitoring');
      recommendations.push('Sleep hygiene and stress management techniques');
    } else if (totalScore >= 11 && totalScore <= 20) {
      triage = 'therapist';
      recommendations.push('Consultation with a licensed therapist');
      recommendations.push('Cognitive-behavioral therapy or similar approaches');
    } else if (totalScore >= 21 && totalScore <= 35) {
      triage = 'therapist_psychiatrist';
      recommendations.push('Combined therapy and psychiatric evaluation');
      recommendations.push('Consider medication evaluation');
    } else {
      triage = 'psychiatrist_crisis';
      recommendations.push('Immediate psychiatric evaluation');
      recommendations.push('Crisis intervention protocols');
    }
  } else {
    // Short questionnaire triage (0-30 scale)
    if (totalScore >= 0 && totalScore <= 7) {
      triage = 'monitor';
      recommendations.push('Lifestyle nudges and monitoring');
    } else if (totalScore >= 8 && totalScore <= 15) {
      triage = 'therapist';
      recommendations.push('Therapist consultation recommended');
    } else if (totalScore >= 16 && totalScore <= 20) {
      triage = 'therapist_psychiatrist';
      recommendations.push('Both therapist and psychiatrist recommended');
    } else {
      triage = 'psychiatrist_crisis';
      recommendations.push('Psychiatrist strongly recommended');
    }
  }

  // Handle risk flags
  const allFlags = [...shortScore.autoFlags, ...(deepScore?.riskFlags || [])];
  
  if (allFlags.includes('suicidality_risk') || allFlags.includes('critical_suicidality_risk')) {
    urgentFlags.push('Suicidality risk detected');
    triage = 'psychiatrist_crisis';
    recommendations.unshift('Immediate safety assessment required');
  }

  if (allFlags.includes('psychosis_symptoms')) {
    urgentFlags.push('Possible psychosis symptoms');
    triage = 'psychiatrist_crisis';
    recommendations.unshift('Psychiatric evaluation for psychosis symptoms');
  }

  if (allFlags.includes('severe_functional_impairment')) {
    urgentFlags.push('Severe functional impairment');
  }

  return {
    triage,
    recommendations,
    urgentFlags
  };
};

/**
 * Generate Doctor-Facing Report
 */
export const generateDoctorReport = (
  history: HistoryTakingData,
  shortScore: AssessmentScores['shortQuestionnaire'],
  deepScore?: AssessmentScores['deepScreening']
): {
  patientInfo: any;
  scores: any;
  symptoms: string[];
  aiInterpretation: string;
  differentials: string[];
  keyQuestions: string[];
  recommendations: any;
} => {
  const { triage, recommendations, urgentFlags } = generateRecommendations(shortScore, deepScore);
  
  // Identify symptom domains
  const symptoms: string[] = [];
  
  if (deepScore) {
    if (deepScore.domainScores.depression >= 4) symptoms.push('low mood');
    if (deepScore.domainScores.anxiety >= 4) symptoms.push('anxiety');
    if (deepScore.domainScores.suicidality >= 1) symptoms.push('suicidal ideation');
    if (deepScore.domainScores.mania >= 3) symptoms.push('manic symptoms');
    if (deepScore.domainScores.psychosis >= 2) symptoms.push('psychotic symptoms');
    if (deepScore.domainScores.substance >= 3) symptoms.push('substance use');
    if (deepScore.domainScores.functioning >= 3) symptoms.push('functional impairment');
  } else {
    // Infer from short questionnaire
    if (shortScore.total >= 8) symptoms.push('mood disturbance');
    if (shortScore.autoFlags.includes('severe_sleep_disturbance')) symptoms.push('severe sleep disturbance');
    if (shortScore.autoFlags.includes('compulsive_digital_use')) symptoms.push('compulsive digital use');
  }

  // Generate AI interpretation
  let aiInterpretation = '';
  if (deepScore) {
    if (deepScore.total <= 10) {
      aiInterpretation = 'Pattern suggests mild distress, likely situational';
    } else if (deepScore.total <= 20) {
      aiInterpretation = 'Pattern suggests moderate depression/anxiety';
    } else if (deepScore.total <= 35) {
      aiInterpretation = 'Pattern suggests moderate-severe mental health symptoms requiring professional intervention';
    } else {
      aiInterpretation = 'Pattern suggests severe mental health symptoms requiring immediate attention';
    }
  } else {
    aiInterpretation = `Short screening suggests ${shortScore.severity} level symptoms`;
  }

  // Suggest differential diagnoses
  const differentials: string[] = [];
  if (symptoms.includes('low mood')) differentials.push('Major Depressive Disorder');
  if (symptoms.includes('anxiety')) differentials.push('Generalized Anxiety Disorder');
  if (symptoms.includes('manic symptoms')) differentials.push('Bipolar Disorder');
  if (symptoms.includes('psychotic symptoms')) differentials.push('Psychotic Disorder');
  if (symptoms.includes('substance use')) differentials.push('Substance Use Disorder');
  differentials.push('Adjustment Disorder');

  // Key questions for doctor
  const keyQuestions: string[] = [
    'Duration and onset of current symptoms',
    'Previous treatment history and response',
    'Current medication effects and side effects',
    'Family psychiatric history details',
    'Specific triggers or stressors',
    'Current support system and resources'
  ];

  if (urgentFlags.length > 0) {
    keyQuestions.unshift('Safety assessment and suicide risk evaluation');
  }

  return {
    patientInfo: {
      age: history.age,
      gender: history.gender,
      occupation: history.occupation,
      medications: history.ongoing_medication.has_medication ? history.ongoing_medication.details : 'None reported',
      pastHistory: history.past_psychiatric_history.has_history ? history.past_psychiatric_history.details : 'No past psychiatric history',
      familyHistory: history.family_psychiatric_history ? 'Positive' : 'Negative',
      trauma: history.trauma_history.has_trauma ? 'Reported' : 'None reported'
    },
    scores: {
      shortQuestionnaire: shortScore,
      deepScreening: deepScore
    },
    symptoms,
    aiInterpretation,
    differentials,
    keyQuestions,
    recommendations: {
      triage,
      actions: recommendations,
      urgentFlags
    }
  };
};

/**
 * Generate Patient-Facing Summary
 */
export const generatePatientSummary = (
  shortScore: AssessmentScores['shortQuestionnaire'],
  deepScore?: AssessmentScores['deepScreening']
): {
  message: string;
  activities: string[];
  nextSteps: string;
} => {
  const { triage } = generateRecommendations(shortScore, deepScore);
  
  let message = '';
  const activities: string[] = [];
  let nextSteps = '';

  // Generate user-friendly message (no diagnosis)
  const totalScore = deepScore ? deepScore.total : shortScore.total;
  
  if (triage === 'monitor') {
    message = "You're managing stress pretty well! Here are some simple strategies to maintain your mental wellness.";
    activities.push('5-minute guided breathing exercise at night');
    activities.push('Write 3 lines about your day in a journal');
    nextSteps = 'Continue with self-care and monitor how you feel';
  } else if (triage === 'therapist') {
    message = "We noticed signs of stress that may be affecting your daily life. A mental health professional can guide you better.";
    activities.push('5-minute guided breathing at night');
    activities.push('Write 3 lines about your day in a journal');
    nextSteps = 'Book a session with a therapist';
  } else if (triage === 'therapist_psychiatrist') {
    message = "We found patterns that suggest you could benefit from professional support. Both therapy and medical evaluation may be helpful.";
    activities.push('Practice deep breathing exercises');
    activities.push('Maintain a daily mood journal');
    nextSteps = 'Book sessions with both a therapist and psychiatrist';
  } else {
    message = "We're concerned about your wellbeing and strongly recommend speaking with a mental health professional soon.";
    activities.push('Reach out to a trusted friend or family member');
    activities.push('Practice grounding techniques when feeling overwhelmed');
    nextSteps = 'Schedule an urgent appointment with a psychiatrist';
  }

  return {
    message,
    activities,
    nextSteps
  };
};