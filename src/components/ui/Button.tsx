'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button variants following Neurona design system
 * - Primary: Main health-related actions (teal)
 * - Secondary: Urgent/motivational actions (coral)
 * - Outline: Secondary actions with border
 * - Ghost: Subtle actions without background
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        // Primary button - teal background
        primary: 
          'bg-primary-teal text-white shadow-button hover:bg-primary-teal-dark hover:shadow-button-hover hover:-translate-y-0.5',
        
        // Secondary button - coral background  
        secondary:
          'bg-secondary-coral text-white shadow-button hover:bg-secondary-coral-dark hover:shadow-button-hover hover:-translate-y-0.5',
        
        // Outline button - teal border
        outline:
          'border-2 border-primary-teal bg-transparent text-primary-teal hover:bg-primary-teal hover:text-white hover:shadow-button-hover',
        
        // Ghost button - no background
        ghost:
          'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800',
          
        // Success button - lime accent
        success:
          'bg-accent-lime text-white shadow-button hover:bg-accent-lime-dark hover:shadow-button-hover hover:-translate-y-0.5',
          
        // Danger/Error button - error color
        destructive:
          'bg-error text-white shadow-button hover:bg-error-dark hover:shadow-button-hover hover:-translate-y-0.5',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        default: 'h-12 px-6 py-3',
        lg: 'h-14 px-8 py-4 text-lg',
        xl: 'h-16 px-10 py-5 text-xl',
        icon: 'h-10 w-10',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
        fit: 'w-fit',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      width: 'auto',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Button Component
 * 
 * Primary component for user actions following Neurona design system
 * 
 * @param variant - Button style variant
 * @param size - Button size
 * @param width - Button width behavior
 * @param loading - Show loading state
 * @param leftIcon - Icon to show on the left
 * @param rightIcon - Icon to show on the right
 * @param disabled - Disable the button
 * @param children - Button content
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    width,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(buttonVariants({ variant, size, width, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size === 'sm' ? 'sm' : 'default'} />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Loading spinner component for button loading states
interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'default' }) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size]

  return (
    <svg
      className={cn('animate-spin', sizeClass)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export { Button, buttonVariants }