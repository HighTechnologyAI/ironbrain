import React, { useState, useCallback } from 'react';
import { useLazyImage } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  showSkeleton?: boolean;
  containerClassName?: string;
  skeletonClassName?: string;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  containerClassName,
  skeletonClassName,
  showSkeleton = true,
  onLoadStart,
  onLoadComplete,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const { ref, src: lazySrc } = useLazyImage(currentSrc);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    
    // Try fallback if available and not already tried
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      return;
    }
    
    onError?.(event);
  }, [fallbackSrc, currentSrc, onError]);

  const handleLoadStart = useCallback(() => {
    onLoadStart?.();
  }, [onLoadStart]);

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Skeleton loader */}
      {showSkeleton && !isLoaded && !hasError && (
        <Skeleton 
          className={cn(
            'absolute inset-0 w-full h-full',
            skeletonClassName
          )} 
        />
      )}

      {/* Actual image */}
      {lazySrc && !hasError && (
        <img
          ref={ref}
          src={lazySrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          onLoadStart={handleLoadStart}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm',
          className
        )}>
          <div className="text-center">
            <div className="mb-2">📷</div>
            <div>Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Higher-order component for automatic image optimization
export const withImageOptimization = <P extends { src?: string; alt?: string }>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    if (!props.src) {
      return <Component {...props} />;
    }

    const optimizedProps = {
      ...props,
      loading: 'lazy' as const,
      decoding: 'async' as const,
    };

    return <Component {...optimizedProps} />;
  };

  WrappedComponent.displayName = `withImageOptimization(${Component.displayName || Component.name})`;
  return WrappedComponent;
};