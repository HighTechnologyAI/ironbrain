import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  skip?: boolean;
  initialIsIntersecting?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    triggerOnce = false,
    skip = false,
    initialIsIntersecting = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: Element | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    if (skip || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (!hasIntersected && isElementIntersecting) {
          setHasIntersected(true);
        }

        if (!triggerOnce || !hasIntersected) {
          setIsIntersecting(isElementIntersecting);
        }

        if (triggerOnce && isElementIntersecting) {
          observer.unobserve(entry.target);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(elementRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, root, rootMargin, triggerOnce, hasIntersected, skip]);

  return {
    ref: setRef,
    isIntersecting,
    hasIntersected
  };
};

// Hook for lazy loading images
export const useLazyImage = (src: string, options: UseIntersectionObserverOptions = {}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const { ref, isIntersecting } = useIntersectionObserver({
    triggerOnce: true,
    ...options
  });

  const setRef = useCallback((node: HTMLImageElement | null) => {
    setImageRef(node);
    ref(node);
  }, [ref]);

  useEffect(() => {
    if (isIntersecting && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [isIntersecting, src, imageSrc]);

  return {
    ref: setRef,
    src: imageSrc,
    isLoaded: !!imageSrc
  };
};

// Hook for infinite scrolling
export const useInfiniteScroll = (
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    ...options
  });

  useEffect(() => {
    if (isIntersecting) {
      callback();
    }
  }, [isIntersecting, callback]);

  return { ref };
};