import React from 'react';

export const Button = ({ children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition ${
      disabled
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-blue-500 hover:bg-blue-600 text-white'
    } ${className || ''}`}
  >
    {children}
  </button>
);
