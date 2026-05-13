import { useId } from 'react';

interface BloomAvatarProps {
  isTyping?: boolean;
  size?: 'sm' | 'lg';
}

const petalColors = [
  'var(--bloom-glow)',
  'var(--bloom-rose)',
  'var(--bloom-glow)',
  'var(--bloom-rose)',
  'var(--bloom-glow)',
  'var(--bloom-rose)',
];

const sizeMap = {
  sm: { outer: 24, pw: 8, ph: 14, center: 6 },
  lg: { outer: 36, pw: 12, ph: 21, center: 8 },
} as const;

export default function BloomAvatar({ isTyping = false, size = 'sm' }: BloomAvatarProps) {
  const id = useId();
  const spinName = `s${id.replace(/[^a-z0-9]/gi, '')}`;
  const s = sizeMap[size];

  return (
    <>
      <style>{`@keyframes ${spinName}{to{transform:rotate(360deg)}}`}</style>
      <div
        className="relative shrink-0"
        style={{ width: s.outer, height: s.outer }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            animation: isTyping ? `${spinName} 1.5s linear infinite` : undefined,
          }}
        >
          {petalColors.map((color, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: s.pw,
                height: s.ph,
                bottom: '50%',
                left: '50%',
                transformOrigin: 'center bottom',
                transform: `translateX(-50%) rotate(${i * 60}deg)`,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: color,
                  opacity: 0.7,
                  animation: isTyping ? undefined : 'bloom-float 4s ease-in-out infinite',
                  animationDelay: isTyping ? undefined : `${i * 0.4}s`,
                }}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute"
          style={{
            width: s.center,
            height: s.center,
            borderRadius: '50%',
            background: 'var(--bloom-teal)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 12px rgba(6, 214, 160, 0.5)',
            zIndex: 2,
          }}
        />
      </div>
    </>
  );
}
