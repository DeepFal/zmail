import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // 延迟毫秒数
  threshold?: number; // 触发可视比例 0-1
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  threshold = 0.1 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 稍微延迟一点设置可见，配合 CSS transition
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          // 触发一次后取消观察，避免反复闪烁
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -50px 0px', // 视口底部向上偏移50px才触发，保证用户真的看得到
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-1000 ease-out will-change-[opacity,transform] ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-12' // 初始状态：完全透明且向下偏移
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;