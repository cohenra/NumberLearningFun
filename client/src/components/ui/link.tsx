import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Link({ href, children, className, onClick }: LinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Call the original onClick if provided
    if (onClick) {
      onClick();
    }
    
    // Update the browser history
    window.history.pushState(null, '', href);
    
    // Dispatch an event to notify about the navigation
    window.dispatchEvent(new CustomEvent('pushstate'));
    
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };
  
  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
} 