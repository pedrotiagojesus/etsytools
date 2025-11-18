import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const Tooltip = ({ content, children, position = 'top', delay = 200 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState(position);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 8; // Gap between trigger and tooltip

    let finalPosition = position;
    let top = 0;
    let left = 0;

    // Calculate initial position
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

        // Check if tooltip goes above viewport
        if (top < 0) {
          finalPosition = 'bottom';
          top = triggerRect.bottom + gap;
        }
        break;

      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;

        // Check if tooltip goes below viewport
        if (top + tooltipRect.height > viewportHeight) {
          finalPosition = 'top';
          top = triggerRect.top - tooltipRect.height - gap;
        }
        break;

      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;

        // Check if tooltip goes left of viewport
        if (left < 0) {
          finalPosition = 'right';
          left = triggerRect.right + gap;
        }
        break;

      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;

        // Check if tooltip goes right of viewport
        if (left + tooltipRect.width > viewportWidth) {
          finalPosition = 'left';
          left = triggerRect.left - tooltipRect.width - gap;
        }
        break;
    }

    // Ensure tooltip stays within horizontal viewport bounds
    if (left < 0) {
      left = gap;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - gap;
    }

    // Ensure tooltip stays within vertical viewport bounds
    if (top < 0) {
      top = gap;
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - gap;
    }

    setCalculatedPosition(finalPosition);
    setCoords({ top, left });
  };

  const handleShow = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleHide = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, delay);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      setIsVisible(false);
      // Return focus to trigger element
      if (triggerRef.current) {
        const focusableElement = triggerRef.current.querySelector<HTMLElement>('[tabindex], button, a, input, select, textarea');
        focusableElement?.focus();
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="tooltip-wrapper"
      ref={triggerRef}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`custom-tooltip custom-tooltip-${calculatedPosition}`}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          role="tooltip"
          aria-live="polite"
        >
          <div className="custom-tooltip-content">{content}</div>
          <div className="custom-tooltip-arrow" aria-hidden="true"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
