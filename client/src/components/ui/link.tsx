import React from 'react';
import { Link as WouterLink } from 'wouter';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Link({ href, children, className, onClick }: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick();
  };

  return (
    <WouterLink href={href} className={className} onClick={handleClick}>
      {children}
    </WouterLink>
  );
} 