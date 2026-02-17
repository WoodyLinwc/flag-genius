import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Pixel Art Base Styles
  const baseStyles = "inline-flex items-center justify-center font-['VT323'] text-xl uppercase tracking-wider transition-transform active:translate-y-1 active:translate-x-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border-2 sm:border-4";
  
  // Pixel Art Variants (Stardew/Retro Palette)
  // Shadow effect is created via box-shadow
  const variants = {
    primary: "bg-[#4a90e2] border-[#1a4b7c] text-white shadow-[4px_4px_0px_0px_#1a4b7c] hover:bg-[#5aa0f2]",
    secondary: "bg-[#d2b48c] border-[#8b4513] text-[#5c4033] shadow-[4px_4px_0px_0px_#8b4513] hover:bg-[#e6ccb2]",
    outline: "bg-transparent border-[#8b4513] text-[#d2b48c] shadow-[4px_4px_0px_0px_#8b4513] hover:bg-[#8b4513] hover:text-[#d2b48c]",
    danger: "bg-[#e25c5c] border-[#7c1a1a] text-white shadow-[4px_4px_0px_0px_#7c1a1a] hover:bg-[#f26b6b]",
    success: "bg-[#76c442] border-[#3a6b1a] text-white shadow-[4px_4px_0px_0px_#3a6b1a] hover:bg-[#86d452]",
    ghost: "bg-transparent hover:bg-white/10 text-[#d2b48c] border-transparent shadow-none",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const spacing = variant === 'ghost' ? 'py-2 px-4' : 'py-3 px-6';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${spacing} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;