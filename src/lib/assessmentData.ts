/**
 * Assessment Data Structures for Neurona AI Intake System
 * Based on neurona_onboarding.txt specifications
 */

// History Taking Questions (Basic Intake)
export interface HistoryTakingData {
  name?: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation: 'student' | 'working' | 'unemployed' | 'retired' | 'other';
  ongoing_medication: {
    has_medication: boolean;
    details?: string;
  };
  past_psychiatric_history: {
    has_history: boolean;
    details?: string;
  };
  past_medical_history: {
    has_history: boolean;
    conditions: string[];
  };
  family_psychiatric_history: boolean;
  trauma_history: {
    has_trauma: boolean;
    details?: string;
  };
}

// Short Questionnaire (10 Questions, 0-30 total score)
export interface ShortQuestionnaireData {
  q1_sadness: number; // 0-3
  q2_anxiety: number; // 0-3
  q3_concentration: number; // 0-3
  q4_lost_interest: number; // 0-3
  q5_sleep: number; // 0-3
  q6_fatigue: number; // 0-3
  q7_social_anxiety: number; // 0-3
  q8_irritability: number; // 0-3
  q9_digital_escape: number; // 0-3
  q10_suicidal_thoughts: number; // 0-3
}

// Deep Screening (17 Questions, 0-51 total score)
export interface DeepScreeningData {
  // Depression (4 Qs - PHQ-9 based)
  depression_q1_sadness: number; // 0-3
  depression_q2_anhedonia: number; // 0-3
  depression_q3_sleep_energy: number; // 0-3
  depression_q4_suicidal_thoughts: number; // 0-3
  
  // Anxiety (3 Qs - GAD-7 based)
  anxiety_q5_nervousness: number; // 0-3
  anxiety_q6_excessive_worry: number; // 0-3
  anxiety_q7_restlessness: number; // 0-3
  
  // Suicidality (2 Qs - C-SSRS based)
  suicide_q8_passive_thoughts: number; // 0-3
  suicide_q9_active_thoughts: number; // 0-3
  
  // Mania (2 Qs - YMRS based)
  mania_q10_elevated_mood: number; // 0-3
  mania_q11_decreased_sleep: number; // 0-3
  
  // Psychosis (2 Qs - PANSS based)
  psychosis_q12_hallucinations: number; // 0-3
  psychosis_q13_paranoia: number; // 0-3
  
  // Substance Use (2 Qs - ASSIST based)
  substance_q14_alcohol_tobacco: number; // 0-3
  substance_q15_drugs: number; // 0-3
  
  // Functioning & Sleep (2 Qs)
  functioning_q16_impairment: number; // 0-3
  sleep_q17_hours: number; // 0-3
}

// Assessment Results
export interface AssessmentScores {
  shortQuestionnaire: {
    total: number; // 0-30
    severity: 'normal' | 'moderate' | 'moderate-severe' | 'severe';
    needsDeepScreening: boolean;
    autoFlags: string[];
  };
  deepScreening?: {
    total: number; // 0-51
    severity: 'normal' | 'moderate' | 'moderate-severe' | 'severe';
    domainScores: {
      depression: number;
      anxiety: number;
      suicidality: number;
      mania: number;
      psychosis: number;
      substance: number;
      functioning: number;
    };
    riskFlags: string[];
  };
}

// History Taking Questions
export const historyQuestions = [
  {
    id: 'name',
    question: "What's your name? (Optional)",
    type: 'text',
    required: false,
  },
  {
    id: 'age',
    question: "How old are you?",
    type: 'number',
    required: true,
    validation: { min: 13, max: 100 }
  },
  {
    id: 'gender',
    question: "What is your gender?",
    type: 'radio',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ]
  },
  {
    id: 'occupation',
    question: "What is your occupation?",
    type: 'radio',
    required: true,
    options: [
      { value: 'student', label: 'Student' },
      { value: 'working', label: 'Working/Employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    id: 'ongoing_medication',
    question: "Are you currently taking any medications?",
    type: 'radio',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    followUp: {
      condition: 'yes',
      question: "Please tell us about your current medications:",
      type: 'textarea'
    }
  },
  {
    id: 'past_psychiatric_history',
    question: "Do you have any past psychiatric history?",
    type: 'radio',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    followUp: {
      condition: 'yes',
      question: "Please provide details:",
      type: 'textarea'
    }
  },
  {
    id: 'family_psychiatric_history',
    question: "Is there any family history of psychiatric illness?",
    type: 'radio',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  },
  {
    id: 'trauma_history',
    question: "Have you experienced any trauma? (accident, abuse, grief, major stress events)",
    type: 'radio',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    followUp: {
      condition: 'yes',
      question: "Please share what you're comfortable with:",
      type: 'textarea',
      placeholder: "You can share as much or as little as you'd like..."
    }
  }
];

// Short Questionnaire Questions (10 Questions)
export const shortQuestionnaireQuestions = [
  {
    id: 'q1_sadness',
    question: "In the past 2 weeks, have you often felt sad, low, or hopeless?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A few days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'q2_anxiety',
    question: "Do you often feel nervous, anxious, or \"on edge\"?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A few days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'q3_concentration',
    question: "Do you find it hard to concentrate on studies/work or daily tasks?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A few days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'q4_lost_interest',
    question: "Have you lost interest in things you usually enjoy (friends, hobbies, activities)?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A few days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'q5_sleep',
    question: "How has your sleep been recently?",
    options: [
      { value: 0, label: "Normal" },
      { value: 1, label: "Mild trouble falling asleep / waking up" },
      { value: 2, label: "Trouble most nights" },
      { value: 3, label: "Severe sleep problem (hardly sleeping / oversleeping daily)" }
    ]
  },
  {
    id: 'q6_fatigue',
    question: "Do you feel tired or low on energy most of the time?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "A few days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'q7_social_anxiety',
    question: "Do you feel nervous or uncomfortable in social situations (talking, presentations, meeting people)?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Mild discomfort sometimes" },
      { value: 2, label: "Often uncomfortable" },
      { value: 3, label: "Very anxious, avoid such situations" }
    ]
  },
  {
    id: 'q8_irritability',
    question: "Have you been more irritable or short-tempered than usual?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Often" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'q9_digital_escape',
    question: "Do you spend too much time on your phone/internet to escape stress (social media, gaming, etc.)?",
    options: [
      { value: 0, label: "No, rarely" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Frequently" },
      { value: 3, label: "Almost every day, for hours" }
    ]
  },
  {
    id: 'q10_suicidal_thoughts',
    question: "Have you had any thoughts that life is not worth living?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often / Strong thoughts" }
    ],
    isRiskQuestion: true
  }
];

// Deep Screening Questions (17 Questions)
export const deepScreeningQuestions = [
  // Depression Domain (4 questions)
  {
    id: 'depression_q1_sadness',
    domain: 'depression',
    question: "In the past 2 weeks, have you often felt sad, low, or hopeless?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'depression_q2_anhedonia',
    domain: 'depression',
    question: "Do you find yourself not enjoying things you usually like (hobbies, friends, activities)?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'depression_q3_sleep_energy',
    domain: 'depression',
    question: "How has your sleep and energy been? (Sleeping too much/too little, feeling tired most of the time)",
    options: [
      { value: 0, label: "Normal" },
      { value: 1, label: "Mildly disturbed" },
      { value: 2, label: "Frequently disturbed" },
      { value: 3, label: "Severely disturbed" }
    ]
  },
  {
    id: 'depression_q4_suicidal_thoughts',
    domain: 'depression',
    question: "Have you had any thoughts that life is not worth living or hurting yourself?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ],
    isRiskQuestion: true
  },
  
  // Anxiety Domain (3 questions)
  {
    id: 'anxiety_q5_nervousness',
    domain: 'anxiety',
    question: "Do you often feel nervous, anxious, or \"on edge\"?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'anxiety_q6_excessive_worry',
    domain: 'anxiety',
    question: "Do you feel like you worry too much or can't stop worrying?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: 'anxiety_q7_restlessness',
    domain: 'anxiety',
    question: "Do you find it hard to relax, or feel restless most of the time?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  
  // Suicidality Domain (2 questions)
  {
    id: 'suicide_q8_passive_thoughts',
    domain: 'suicidality',
    question: "In the past month, have you wished you could go to sleep and not wake up?",
    options: [
      { value: 0, label: "No, never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often / Strong thoughts" }
    ],
    isRiskQuestion: true
  },
  {
    id: 'suicide_q9_active_thoughts',
    domain: 'suicidality',
    question: "Have you thought about hurting or killing yourself?",
    options: [
      { value: 0, label: "No, never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often / Strong thoughts" }
    ],
    isRiskQuestion: true,
    isCriticalRisk: true
  },
  
  // Mania Domain (2 questions)
  {
    id: 'mania_q10_elevated_mood',
    domain: 'mania',
    question: "Have there been times you felt unusually cheerful, full of energy, or more confident than usual?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" }
    ]
  },
  {
    id: 'mania_q11_decreased_sleep',
    domain: 'mania',
    question: "Did you need less sleep during those times and still felt full of energy?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" }
    ]
  },
  
  // Psychosis Domain (2 questions)
  {
    id: 'psychosis_q12_hallucinations',
    domain: 'psychosis',
    question: "Have you ever heard voices or seen things that others don't?",
    options: [
      { value: 0, label: "No, never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" }
    ],
    isRiskQuestion: true
  },
  {
    id: 'psychosis_q13_paranoia',
    domain: 'psychosis',
    question: "Do you ever feel that people are watching you or trying to control your thoughts?",
    options: [
      { value: 0, label: "No, never" },
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" }
    ],
    isRiskQuestion: true
  },
  
  // Substance Use Domain (2 questions)
  {
    id: 'substance_q14_alcohol_tobacco',
    domain: 'substance',
    question: "In the past 3 months, how often have you used alcohol or smoked?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Once or twice" },
      { value: 2, label: "Monthly/Weekly" },
      { value: 3, label: "Daily" }
    ]
  },
  {
    id: 'substance_q15_drugs',
    domain: 'substance',
    question: "In the past 3 months, how often have you used cannabis, stimulants, or other drugs?",
    options: [
      { value: 0, label: "Never" },
      { value: 1, label: "Once or twice" },
      { value: 2, label: "Monthly/Weekly" },
      { value: 3, label: "Daily" }
    ]
  },
  
  // Functioning & Sleep Domain (2 questions)
  {
    id: 'functioning_q16_impairment',
    domain: 'functioning',
    question: "Have these feelings or problems made it harder for you at work, school, or with friends/family?",
    options: [
      { value: 0, label: "No effect" },
      { value: 1, label: "Mild" },
      { value: 2, label: "Moderate" },
      { value: 3, label: "Severe" }
    ]
  },
  {
    id: 'sleep_q17_hours',
    domain: 'functioning',
    question: "On average, how many hours do you usually sleep per night?",
    options: [
      { value: 0, label: "7-9 hrs (normal)" },
      { value: 1, label: "6-7 hrs (mild issue)" },
      { value: 2, label: "4-6 hrs or >9 hrs (moderate issue)" },
      { value: 3, label: "<4 hrs (severe)" }
    ]
  }
];

// AI Responses for different stages
export const aiResponses = {
  welcome: "Hi! I'm here to help you understand how you've been feeling and connect you with the right support. This will take about 10-15 minutes. Everything you share is completely confidential.",
  
  historyTransition: "Thank you for sharing that with me. Now I'd like to ask you some questions about how you've been feeling recently.",
  
  shortQuestionnaireComplete: "I appreciate you answering those questions. Based on your responses, I'd like to ask you a few more questions to better understand your situation. It will take just 5 minutes, and this helps us guide you to the right doctor and support.",
  
  deepScreeningComplete: "Thank you for taking the time to share all of that with me. I'm now preparing a personalized report that will help connect you with the most appropriate care.",
  
  reportReady: "Your assessment is complete. I've prepared some recommendations and next steps for you."
};