
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * A component that smoothly animates between number values
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  formatter = (num) => num.toString(),
  className,
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (value === displayValue) return;
    
    setIsAnimating(true);
    
    // Simple animation for small values
    if (Math.abs(value - displayValue) < 10 || value === 0) {
      setDisplayValue(value);
      setTimeout(() => setIsAnimating(false), duration);
      return;
    }
    
    // For larger values, animate with frames
    const startTime = Date.now();
    const startValue = displayValue;
    const change = value - startValue;
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < duration) {
        // Easing function: cubic-bezier(.17,.67,.83,.67)
        const t = elapsed / duration;
        const easedT = t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
        setDisplayValue(Math.round(startValue + change * easedT));
        requestAnimationFrame(animateValue);
      } else {
        setDisplayValue(value);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [value, duration]);
  
  return (
    <span className={cn("inline-block relative overflow-hidden", className)}>
      <span className={cn(
        "inline-block transition-transform",
        isAnimating ? "animate-number-change" : "transform-none"
      )}>
        {prefix}{formatter(displayValue)}{suffix}
      </span>
    </span>
  );
};

export default AnimatedNumber;
