"use client";

import React from 'react';
import { cn } from '@/lib/utils';

// Mobile-first responsive container
interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  fullHeight?: boolean;
}

export function MobileLayout({ 
  children, 
  className, 
  padding = 'md',
  maxWidth = 'full',
  fullHeight = false
}: MobileLayoutProps) {
  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-4 sm:px-6 sm:py-6',
    lg: 'px-6 py-6 sm:px-8 sm:py-8',
    xl: 'px-8 py-8 sm:px-12 sm:py-12'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      paddingClasses[padding],
      maxWidthClasses[maxWidth],
      fullHeight && 'min-h-screen',
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-responsive grid system
interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 3 | 4 | 5 | 6;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function MobileGrid({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  };

  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-responsive flex container
interface MobileFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  responsive?: {
    mobile?: 'row' | 'col';
    tablet?: 'row' | 'col';
    desktop?: 'row' | 'col';
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function MobileFlex({ 
  children, 
  className,
  direction = 'row',
  responsive,
  gap = 'md',
  align = 'start',
  justify = 'start'
}: MobileFlexProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const directionClasses = responsive ? 
    `flex-${responsive.mobile || direction} sm:flex-${responsive.tablet || direction} lg:flex-${responsive.desktop || direction}` :
    `flex-${direction}`;

  return (
    <div className={cn(
      'flex',
      directionClasses,
      gapClasses[gap],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-responsive card
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
}

export function MobileCard({
  children,
  className,
  padding = 'md',
  interactive = false,
  onClick
}: MobileCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  };

  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg border shadow-sm',
        paddingClasses[padding],
        interactive && 'cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Mobile-responsive button
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function MobileButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: MobileButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile-responsive text
interface MobileTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  responsive?: boolean;
}

export function MobileText({
  children,
  className,
  size = 'base',
  weight = 'normal',
  color = 'primary',
  responsive = true
}: MobileTextProps) {
  const sizeClasses = {
    xs: responsive ? 'text-xs sm:text-sm' : 'text-xs',
    sm: responsive ? 'text-sm sm:text-base' : 'text-sm',
    base: responsive ? 'text-base sm:text-lg' : 'text-base',
    lg: responsive ? 'text-lg sm:text-xl' : 'text-lg',
    xl: responsive ? 'text-xl sm:text-2xl' : 'text-xl',
    '2xl': responsive ? 'text-2xl sm:text-3xl' : 'text-2xl',
    '3xl': responsive ? 'text-3xl sm:text-4xl' : 'text-3xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const colorClasses = {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-green-400'
  };

  return (
    <span className={cn(
      sizeClasses[size],
      weightClasses[weight],
      colorClasses[color],
      className
    )}>
      {children}
    </span>
  );
}

// Mobile-responsive spacing utilities
export const mobileSpacing = {
  // Padding
  p: {
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  },
  // Margin
  m: {
    xs: 'm-2 sm:m-3',
    sm: 'm-3 sm:m-4',
    md: 'm-4 sm:m-6',
    lg: 'm-6 sm:m-8',
    xl: 'm-8 sm:m-12'
  },
  // Gap
  gap: {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  }
};

// Mobile breakpoint hook
export function useMobileBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
}
