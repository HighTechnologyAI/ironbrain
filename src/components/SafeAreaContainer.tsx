
import React from 'react';
import { useMobileFeatures } from '@/hooks/use-mobile-features';
import { cn } from '@/lib/utils';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  className?: string;
  includePadding?: boolean;
}

const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({ 
  children, 
  className,
  includePadding = true 
}) => {
  const { safeAreaInsets, isNativeMobile } = useMobileFeatures();

  const containerStyle = isNativeMobile && includePadding ? {
    paddingTop: `${safeAreaInsets.top}px`,
    paddingBottom: `${safeAreaInsets.bottom}px`,
    paddingLeft: `${safeAreaInsets.left}px`,
    paddingRight: `${safeAreaInsets.right}px`,
  } : {};

  return (
    <div 
      className={cn('min-h-screen bg-background', className)}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default SafeAreaContainer;
