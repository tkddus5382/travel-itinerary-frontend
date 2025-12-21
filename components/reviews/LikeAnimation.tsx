'use client';

import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

export default function LikeAnimation({ trigger }: { trigger: number }) {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // 하트 여러 개 생성 - 위로 올라가는 물방울 효과
    const newHearts: Heart[] = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 30, // -15 ~ 15px (좌우 약간만)
      y: -50 - Math.random() * 40, // -50 ~ -90px (위로만)
      rotation: (Math.random() - 0.5) * 30, // -15 ~ 15도 (약간만 회전)
      delay: i * 80, // 순차적으로 올라감
    }));

    setHearts(newHearts);

    // 애니메이션 종료 후 제거
    const timer = setTimeout(() => {
      setHearts([]);
    }, 1200);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute top-1/2 left-1/2 animate-heart-burst"
          style={{
            '--heart-x': `${heart.x}px`,
            '--heart-y': `${heart.y}px`,
            '--heart-rotation': `${heart.rotation}deg`,
            '--heart-delay': `${heart.delay}ms`,
            transform: 'translate(-50%, -50%)',
          } as React.CSSProperties}
        >
          <span className="text-red-500 text-lg">❤️</span>
        </div>
      ))}
    </div>
  );
}
