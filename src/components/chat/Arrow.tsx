'use client';

import React from 'react';

interface ArrowProps {
  disabled: boolean;
  left?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const Arrow: React.FC<ArrowProps> = (props) => {
  const disabled = props.disabled ? " arrow--disabled" : "";
  
  return (
    <svg
      onClick={props.onClick}
      className={`arrow ${
        props.left ? "arrow--left" : "arrow--right"
      } ${disabled}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      {props.left && (
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
      )}
      {!props.left && (
        <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
      )}
    </svg>
  );
};

export default Arrow; 