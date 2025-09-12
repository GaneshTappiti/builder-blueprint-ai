// Virtualized message list for performance with large chat histories
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChatMessage } from '@/types/chat';

interface VirtualizedMessagesOptions {
  messages: ChatMessage[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizedItem {
  index: number;
  message: ChatMessage;
  top: number;
  height: number;
}

export function useVirtualizedMessages({
  messages,
  itemHeight,
  containerHeight,
  overscan = 5
}: VirtualizedMessagesOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = messages.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    messages.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems: VirtualizedItem[] = useMemo(() => {
    const items: VirtualizedItem[] = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (messages[i]) {
        items.push({
          index: i,
          message: messages[i],
          top: i * itemHeight,
          height: itemHeight
        });
      }
    }
    
    return items;
  }, [messages, startIndex, endIndex, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const scrollToMessage = useCallback((messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1 && containerRef.current) {
      const scrollTop = messageIndex * itemHeight;
      containerRef.current.scrollTop = scrollTop;
    }
  }, [messages, itemHeight]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    scrollTop,
    handleScroll,
    scrollToBottom,
    scrollToMessage
  };
}
