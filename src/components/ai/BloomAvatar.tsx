import { Brain } from 'lucide-react';

interface BloomAvatarProps {
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BloomAvatar({ isTyping = false, size = 'md' }: BloomAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 12,
    md: 18,
    lg: 24,
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]}`}>
      {/* Outer pulsing ring */}
      <div 
        className={`absolute inset-0 rounded-full bg-bloom-400 opacity-20 blur-sm transition-all duration-1000
          ${isTyping ? 'animate-ping' : ''}
        `}
      />
      
      {/* Solid background */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-bloom-400 to-purple-600 shadow-md flex items-center justify-center transition-all duration-500
          ${isTyping ? 'scale-105 shadow-bloom-300/50 shadow-lg' : 'scale-100'}
        `}
      >
        <div className="absolute inset-0 bg-white/10 rounded-full mix-blend-overlay" />
      </div>
      
      {/* Center Icon */}
      <div className={`relative z-10 text-white transition-all duration-300 ${isTyping ? 'scale-90 animate-pulse' : 'scale-100'}`}>
        <Brain size={iconSizes[size]} />
      </div>
    </div>
  );
}
