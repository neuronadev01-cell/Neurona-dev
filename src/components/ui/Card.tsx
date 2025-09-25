'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Card variants following Neurona design system
 */
const cardVariants = cva(
  'rounded-2xl border border-neutral-200 bg-white transition-all duration-300',
  {
    variants: {
      variant: {
        // Standard card with subtle shadow
        default: 'shadow-card hover:shadow-card-hover hover:-translate-y-1',
        
        // Glassmorphism card with backdrop blur
        glass: 'bg-white/80 backdrop-blur-md border-white/20 shadow-2xl',
        
        // Feature card for highlights
        feature: 'border-2 border-neutral-100 shadow-lg hover:border-primary-teal-light hover:scale-[1.02]',
        
        // Flat card without shadow
        flat: 'shadow-none hover:shadow-sm',
        
        // Interactive card with strong hover effects
        interactive: 'cursor-pointer shadow-card hover:shadow-card-hover hover:scale-[1.01] active:scale-[0.99]',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      spacing: {
        none: 'p-0',
        tight: 'p-3',
        normal: 'p-6',
        loose: 'p-8',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

/**
 * Base Card Component
 * 
 * Flexible container component following Neurona design system
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size: spacing || size, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

/**
 * Card Header Component
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * Card Title Component
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-heading text-2xl font-semibold leading-snug tracking-tight text-neutral-800',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

/**
 * Card Description Component
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('font-primary text-base text-neutral-600 leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * Card Content Component
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

/**
 * Card Footer Component
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

/**
 * Special Health Wave Card with animated background
 */
const HealthWaveCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white shadow-card',
        className
      )}
      {...props}
    >
      {/* Animated health waves background */}
      <div className="absolute inset-0 opacity-30">
        <div className="health-waves animate-wave-flow h-full w-full bg-gradient-to-br from-primary-teal-50 via-primary-teal-100 to-accent-lime-light" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  )
)
HealthWaveCard.displayName = 'HealthWaveCard'

/**
 * AI Companion Card with special glow effect
 */
const AICard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-2xl bg-white shadow-card overflow-hidden',
        className
      )}
      {...props}
    >
      {/* AI glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-accent-purple/10" />
      
      {/* AI pulse border */}
      <div className="absolute inset-0 rounded-2xl border border-accent-purple/20 animate-ai-pulse" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  )
)
AICard.displayName = 'AICard'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  HealthWaveCard,
  AICard,
}