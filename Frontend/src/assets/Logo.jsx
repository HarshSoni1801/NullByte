import React from 'react';

const Logo = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 105 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NullByte Logo"
    >
      {/* The null symbol (circle) */}
      <circle cx="35" cy="50" r="20" stroke="currentColor" strokeWidth="8" />
      
      {/* The slash for the null symbol */}
      <line x1="18" y1="67" x2="52" y2="33" stroke="currentColor" strokeWidth="8" />
      
      {/* The 'B' */}
      <path
        d="M60 25 V 75 H 75 C 90 75 90 62.5 75 62.5"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M60 50 H 78 C 93 50 93 37.5 78 37.5"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;