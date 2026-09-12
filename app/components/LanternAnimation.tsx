'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Lantern {
  id: number;
  x: number; // posisi horizontal awal
  delay: number; // delay untuk variasi timing
  duration: number; // durasi animasi
  drift: number; // seberapa jauh lantern bergerak horizontal
  size: number; // ukuran lantern
  opacity: number; // opacity awal
}

interface LanternAnimationProps {
  count?: number; // jumlah lentera
  onComplete?: () => void; // callback saat animasi selesai
  trigger?: boolean; // trigger untuk mulai animasi
}

export default function LanternAnimation({ 
  count = 40, 
  onComplete,
  trigger = false 
}: LanternAnimationProps) {
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger && !isAnimating) {
      // Generate lanterns dengan posisi dan timing yang bervariasi
      const newLanterns: Lantern[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // 0-100% dari lebar layar
        delay: Math.random() * 3, // delay 0-3 detik
        duration: 8 + Math.random() * 4, // durasi 8-12 detik
        drift: (Math.random() - 0.5) * 200, // drift -100px hingga +100px
        size: 0.6 + Math.random() * 0.8, // ukuran 0.6-1.4x
        opacity: 0.5 + Math.random() * 0.5, // opacity 0.5-1.0
      }));

      setLanterns(newLanterns);
      setIsAnimating(true);

      // Panggil callback setelah animasi terlama selesai
      const longestDuration = Math.max(...newLanterns.map(l => l.duration + l.delay));
      setTimeout(() => {
        if (onComplete) onComplete();
      }, longestDuration * 1000);
    }
  }, [trigger, isAnimating, count, onComplete]);

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {lanterns.map((lantern) => (
        <motion.div
          key={lantern.id}
          className="absolute"
          style={{
            left: `${lantern.x}%`,
            bottom: '-10%',
          }}
          initial={{ 
            y: 0,
            x: 0,
            opacity: 0,
            scale: lantern.size * 0.8,
          }}
          animate={{
            y: ['0vh', '-130vh'],
            x: [0, lantern.drift],
            opacity: [0, lantern.opacity, lantern.opacity * 0.8, 0],
            scale: [lantern.size * 0.8, lantern.size, lantern.size * 1.1, lantern.size],
          }}
          transition={{
            duration: lantern.duration,
            delay: lantern.delay,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutCubic untuk gerakan natural
            times: [0, 0.1, 0.7, 1], // timing untuk opacity changes
          }}
        >
          {/* Glow effect di belakang lentera */}
          <div 
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              width: `${40 * lantern.size}px`,
              height: `${40 * lantern.size}px`,
              background: 'radial-gradient(circle, rgba(252, 211, 77, 0.6) 0%, rgba(252, 211, 77, 0.2) 50%, transparent 100%)',
              animation: `lantern-glow ${2 + Math.random()}s ease-in-out infinite`,
            }}
          />
          
          {/* Lentera utama */}
          <LanternShape size={lantern.size} />
        </motion.div>
      ))}
    </div>
  );
}

// Komponen bentuk lentera yang detail
function LanternShape({ size }: { size: number }) {
  const baseSize = 30 * size;
  
  return (
    <div 
      className="relative"
      style={{
        width: `${baseSize}px`,
        height: `${baseSize * 1.4}px`,
      }}
    >
      {/* Bagian atas lentera */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 bg-lantern-gold-dark rounded-t-lg"
        style={{
          width: `${baseSize * 0.7}px`,
          height: `${baseSize * 0.15}px`,
        }}
      />
      
      {/* Body lentera dengan glow */}
      <div 
        className="absolute top-[15%] left-1/2 -translate-x-1/2 rounded-lg overflow-hidden"
        style={{
          width: `${baseSize * 0.8}px`,
          height: `${baseSize * 0.7}px`,
          background: 'linear-gradient(180deg, rgba(252, 211, 77, 0.9) 0%, rgba(245, 158, 11, 0.8) 100%)',
          boxShadow: `
            0 0 ${baseSize * 0.3}px rgba(252, 211, 77, 0.6),
            0 0 ${baseSize * 0.6}px rgba(252, 211, 77, 0.3),
            inset 0 2px ${baseSize * 0.2}px rgba(254, 243, 199, 0.5)
          `,
        }}
      >
        {/* Pattern di dalam lentera */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-lantern-gold-glow to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-lantern-gold-dark to-transparent" />
        </div>
      </div>
      
      {/* Bagian bawah lentera */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-lantern-gold-dark rounded-b-lg"
        style={{
          width: `${baseSize * 0.7}px`,
          height: `${baseSize * 0.15}px`,
        }}
      />
      
      {/* String/tali lentera */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 bg-lantern-gold-dark/50"
        style={{
          width: '1px',
          height: `${baseSize * 0.3}px`,
        }}
      />
    </div>
  );
}

// Komponen untuk lentera tunggal yang bersinar (untuk hero section)
export function SingleLantern({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0, 1, 1],
        scale: [0.8, 1, 1],
      }}
      transition={{
        duration: 2,
        ease: "easeOut"
      }}
    >
      {/* Large glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(252, 211, 77, 0.4) 0%, rgba(252, 211, 77, 0.2) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Lentera besar untuk hero */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <LanternShape size={3} />
      </motion.div>
    </motion.div>
  );
}

// Komponen untuk Corona sun symbol
export function CoronaSymbol({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative corona-glow ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={{ 
        opacity: [0, 0.6, 0.6],
        scale: [0.5, 1, 1],
        rotate: [180, 0, 0],
      }}
      transition={{
        duration: 2.5,
        ease: "easeOut"
      }}
    >
      {/* Sun rays */}
      <div className="relative w-32 h-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(252, 211, 77, 0.8) 0%, transparent 100%)',
              transform: `rotate(${i * 30}deg) translateX(-50%)`,
            }}
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-lantern-gold-light to-lantern-gold-dark shadow-lg" />
      </div>
    </motion.div>
  );
}
