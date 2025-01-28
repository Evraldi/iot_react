import React from 'react';

export const Alert = ({ children, className }) => (
  <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className || ''}`} role="alert">
    {children}
  </div>
);

export const AlertDescription = ({ children, className }) => (
  <p className={`text-sm ${className || ''}`}>
    {children}
  </p>
);
