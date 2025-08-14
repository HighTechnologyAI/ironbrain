import { useState, useEffect, useMemo, useCallback } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  scrollElement?: HTMLElement | null;
}

interface VirtualListItem {
  index: number;
  style: React.CSSProperties;
}

export const useVirtualList = <T,>(
  items: T[],
  options: VirtualListOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollElement = null
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Add overscan
    const overscanStartIndex = Math.max(0, startIndex - overscan);
    const overscanEndIndex = Math.min(items.length - 1, endIndex + overscan);

    return {
      startIndex: overscanStartIndex,
      endIndex: overscanEndIndex,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Generate virtual items
  const virtualItems = useMemo((): VirtualListItem[] => {
    const items: VirtualListItem[] = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      items.push({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }
      });
    }
    
    return items;
  }, [visibleRange, itemHeight]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Scroll handler
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Set up scroll listener
  useEffect(() => {
    const element = scrollElement || window;
    
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [scrollElement, handleScroll]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    const element = scrollElement || document.documentElement;
    
    let targetScrollTop = index * itemHeight;
    
    if (align === 'center') {
      targetScrollTop -= containerHeight / 2 - itemHeight / 2;
    } else if (align === 'end') {
      targetScrollTop -= containerHeight - itemHeight;
    }
    
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalHeight - containerHeight));
    
    if (scrollElement) {
      scrollElement.scrollTop = targetScrollTop;
    } else {
      window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, [scrollElement, itemHeight, containerHeight, totalHeight]);

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    visibleRange
  };
};

// Hook for dynamic item heights
export const useDynamicVirtualList = <T,>(
  items: T[],
  estimatedItemHeight: number,
  containerHeight: number,
  getItemHeight?: (index: number, item: T) => number
) => {
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  // Update item height
  const setItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newHeights = [...prev];
      newHeights[index] = height;
      return newHeights;
    });
  }, []);

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: number[] = [];
    let totalHeight = 0;

    for (let i = 0; i < items.length; i++) {
      positions[i] = totalHeight;
      const height = itemHeights[i] || getItemHeight?.(i, items[i]) || estimatedItemHeight;
      totalHeight += height;
    }

    return { positions, totalHeight };
  }, [items, itemHeights, getItemHeight, estimatedItemHeight]);

  // Find visible range for dynamic heights
  const visibleRange = useMemo(() => {
    const { positions } = itemPositions;
    
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Binary search for start index
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] >= scrollTop) {
        startIndex = Math.max(0, i - 1);
        break;
      }
    }

    // Find end index
    for (let i = startIndex; i < positions.length; i++) {
      if (positions[i] > scrollTop + containerHeight) {
        endIndex = i;
        break;
      }
    }

    return { startIndex, endIndex };
  }, [itemPositions, scrollTop, containerHeight, items.length]);

  // Generate virtual items for dynamic heights
  const virtualItems = useMemo(() => {
    const items: (VirtualListItem & { height: number })[] = [];
    const { positions } = itemPositions;

    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      const height = itemHeights[i] || estimatedItemHeight;
      
      items.push({
        index: i,
        height,
        style: {
          position: 'absolute',
          top: positions[i],
          left: 0,
          right: 0,
          height,
        }
      });
    }

    return items;
  }, [visibleRange, itemPositions, itemHeights, estimatedItemHeight]);

  return {
    virtualItems,
    totalHeight: itemPositions.totalHeight,
    setItemHeight,
    visibleRange
  };
};