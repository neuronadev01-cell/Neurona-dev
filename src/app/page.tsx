import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardTitle, HealthWaveCard, AICard } from '@/components/ui/Card'
import { HeartIcon, BrainIcon, SparklesIcon, UserGroupIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-teal-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-teal to-accent-lime rounded-xl flex items-center justify-center">
                <BrainIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-heading font-bold gradient-text">Neurona</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="font-primary text-neutral-600 hover:text-primary-teal transition-colors">
                About
              </a>
              <a href="#features" className="font-primary text-neutral-600 hover:text-primary-teal transition-colors">
                Features
              </a>
              <a href="#providers" className="font-primary text-neutral-600 hover:text-primary-teal transition-colors">
                For Providers
              </a>
              <Button variant="outline" size="sm">
                Login
              </Button>
            </div>
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-teal-100 rounded-full animate-wave-flow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-lime/20 rounded-full animate-empathy-breathe" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInFromLeft">
              <h1 className="text-6xl lg:text-7xl font-heading font-bold text-neutral-800 leading-tight mb-6">
                From AI Insight to{' '}
                <span className="gradient-text">Human Care</span>
              </h1>
              <p className="text-xl font-primary text-neutral-600 leading-relaxed mb-8 max-w-2xl">
                Neurona transforms your mental health journey with intelligent symptom assessment 
                and personalized therapy plans that connect you to the right care, right away.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" className="group">
                  Start Your Wellness Journey
                  <SparklesIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </Button>
                <Button variant="outline" size="xl">
                  Learn More
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 mt-12 text-sm text-neutral-500">
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-primary-teal" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="w-5 h-5 text-primary-teal" />
                  <span>Verified Providers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-primary-teal" />
                  <span>Evidence-Based</span>
                </div>
              </div>
            </div>
            
            <div className="animate-slideInFromRight">
              <HealthWaveCard className="max-w-md mx-auto">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-teal to-accent-lime rounded-full flex items-center justify-center mx-auto animate-ai-pulse">
                    <HeartIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-semibold text-neutral-800 mb-2">
                      Start with AI Assessment
                    </h3>
                    <p className="font-primary text-neutral-600 leading-relaxed">
                      Our intelligent system creates personalized recommendations 
                      based on validated clinical scales.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-primary-teal rounded-full animate-typing-pulse" />
                    <div className="w-3 h-3 bg-primary-teal rounded-full animate-typing-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-3 h-3 bg-primary-teal rounded-full animate-typing-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </HealthWaveCard>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-neutral-800 mb-6">
              Structured Mental Wellness That Works
            </h2>
            <p className="text-xl font-primary text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines the precision of AI with the warmth of human expertise 
              to deliver personalized mental health care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="feature" className="group">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-teal to-primary-teal-light rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <BrainIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">AI-Powered Assessment</CardTitle>
                <CardDescription>
                  Clinical-grade evaluation using PHQ-9, GAD-7, and other validated scales 
                  to understand your mental health needs.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card variant="feature" className="group">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-coral to-secondary-coral-light rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Expert Matching</CardTitle>
                <CardDescription>
                  Smart triage connects you with the right mental health professional 
                  based on your specific symptoms and needs.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card variant="feature" className="group">
              <CardContent className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-lime to-accent-lime-dark rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Structured Progress</CardTitle>
                <CardDescription>
                  Gamified daily activities and therapy plans that keep you engaged 
                  and motivated throughout your healing journey.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Companion Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-accent-purple/5 to-accent-purple/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <AICard>
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-accent-purple rounded-full flex items-center justify-center mx-auto relative">
                    <SparklesIcon className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 rounded-full border-2 border-accent-purple/20 animate-ai-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-semibold text-neutral-800 mb-4">
                      Meet Your AI Companion
                    </h3>
                    <div className="space-y-4 text-left">
                      <div className="bg-accent-purple/10 rounded-xl p-4">
                        <p className="font-primary text-neutral-700 italic">
                          "I notice you mentioned feeling overwhelmed lately. 
                          Let's explore some coping strategies together."
                        </p>
                      </div>
                      <div className="flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-accent-purple rounded-full animate-typing-pulse" />
                        <div className="w-2 h-2 bg-accent-purple rounded-full animate-typing-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-accent-purple rounded-full animate-typing-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </AICard>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-heading font-bold text-neutral-800">
                Always There, Never Alone
              </h2>
              <p className="text-lg font-primary text-neutral-600 leading-relaxed">
                Our AI companion provides continuous support, motivation, and guidance 
                while respecting your privacy and connecting you with human experts when needed.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-primary font-medium text-neutral-800">24/7 Availability</h4>
                    <p className="text-neutral-600">Get support whenever you need it, day or night</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-primary font-medium text-neutral-800">Crisis Detection</h4>
                    <p className="text-neutral-600">Immediate escalation to human experts when needed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-primary font-medium text-neutral-800">Personalized Insights</h4>
                    <p className="text-neutral-600">Tailored recommendations based on your progress</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg">
                Try AI Assessment Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-teal to-accent-lime text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl font-primary mb-8 opacity-90 leading-relaxed">
            Join thousands of people who have found their path to better mental health 
            through our AI-powered platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="xl" 
              variant="secondary" 
              className="bg-white text-primary-teal hover:bg-neutral-100 hover:shadow-xl shadow-button-hover"
            >
              Start Your Assessment
            </Button>
            <Button 
              size="xl" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              Talk to a Provider
            </Button>
          </div>
          
          <p className="text-sm mt-6 opacity-70">
            Free assessment • No commitment • Get results in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-teal to-accent-lime rounded-lg flex items-center justify-center">
                <BrainIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">Neurona</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-neutral-400">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-sm text-neutral-400">
            <p>&copy; 2024 Neurona. All rights reserved. Empowering mental wellness through AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
