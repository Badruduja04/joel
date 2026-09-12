'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LanternAnimation, { SingleLantern, CoronaSymbol } from './components/LanternAnimation'
import AmbientSound from './components/AmbientSound'

export default function Home() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLanterns, setShowLanterns] = useState(false)
  const [brightness, setBrightness] = useState(0)

  const handleReleaseLight = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsTransitioning(true)
    setShowLanterns(true)
    
    // Gradually brighten the background
    let currentBrightness = 0
    const brightenInterval = setInterval(() => {
      currentBrightness += 0.02
      setBrightness(currentBrightness)
      if (currentBrightness >= 1) {
        clearInterval(brightenInterval)
      }
    }, 50)
    
    // Navigate after lanterns animation completes (longer duration)
    setTimeout(() => {
      router.push('/login')
    }, 8000) // 8 detik agar animasi lentera selesai dulu
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Ambient background sound */}
      <AmbientSound 
        audioSrc="/sounds/night-wind-ambient.mp3"
        volume={0.15}
        autoPlay={true}
        fadeInDuration={4}
        showControls={true}
      />

      {/* Dynamic background brightness overlay */}
      <motion.div
        animate={{ 
          opacity: brightness * 0.3,
        }}
        className="fixed inset-0 bg-gradient-to-br from-lantern-lilac-pale via-lantern-mist to-lantern-lilac-light z-[1] pointer-events-none"
      />

      {/* Twinkling stars - subtle and elegant */}
      {[...Array(30)].map((_, i) => {
        const size = Math.random() > 0.7 ? 'w-1 h-1' : 'w-0.5 h-0.5'
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
            className={`absolute ${size} bg-lantern-gold rounded-full z-[2]`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: '0 0 4px rgba(252, 211, 77, 0.8)'
            }}
            suppressHydrationWarning
          />
        )
      })}

      {/* Lantern Animation - triggered on button click */}
      {showLanterns && (
        <LanternAnimation 
          count={40} 
          trigger={showLanterns}
        />
      )}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isTransitioning ? 0 : 1,
        }}
        transition={{ duration: isTransitioning ? 2 : 0 }}
        className="text-center space-y-12 relative z-10 max-w-2xl"
      >
        {/* Corona Symbol - subtle in background */}
        <motion.div
          className="absolute -top-32 left-1/2 -translate-x-1/2 opacity-20 z-0"
        >
          <CoronaSymbol />
        </motion.div>

        {/* Single glowing lantern - hero element */}
        <motion.div
          initial={prefersReducedMotion ? false : { 
            opacity: 0, 
            scale: 0.5,
            y: 20
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0
          }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            duration: 1.5,
            ease: [0.22, 0.61, 0.36, 1], // easeOutCubic
            delay: 0.3 
          }}
          className="mb-12 flex justify-center relative z-10"
        >
          <SingleLantern />
        </motion.div>

        {/* Poetic greeting - serif font */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 1.2, 
            duration: 1,
            ease: "easeOut"
          }}
          className="space-y-6 px-4"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-lantern-lilac-light tracking-wide leading-relaxed"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 20px rgba(196, 181, 253, 0.3)',
            }}
          >
            A little light
            <br />
            just for you
          </h1>
          
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { 
              delay: 1.8, 
              duration: 1,
            }}
            className="text-base sm:text-lg md:text-xl text-lantern-mist/80 max-w-md mx-auto leading-relaxed font-light"
            style={{
              fontFamily: "'Lora', serif",
            }}
          >
            A sky full of wishes,
            <br />
            waiting to take flight
          </motion.p>
        </motion.div>

        {/* Release the Light button */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0
          }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 2.2, 
            duration: 0.8,
          }}
          className="flex flex-col items-center gap-4 pt-8"
        >
          <motion.button
            onClick={handleReleaseLight}
            disabled={isTransitioning}
            className="group relative px-10 py-4 sm:px-12 sm:py-5 rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isTransitioning && !prefersReducedMotion ? { 
              scale: 1.05,
              transition: { duration: 0.3 }
            } : {}}
            whileTap={!isTransitioning && !prefersReducedMotion ? { 
              scale: 0.98 
            } : {}}
          >
            {/* Button background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-lantern-gold-dark via-lantern-gold to-lantern-gold-dark opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Glow effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle, rgba(252, 211, 77, 0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            
            {/* Shimmer effect on hover */}
            <motion.div
              initial={{ x: '-100%' }}
              whileHover={{ 
                x: '100%',
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            
            {/* Button text */}
            <span 
              className="relative z-10 text-lantern-midnight font-semibold text-base sm:text-lg tracking-wider"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              {isTransitioning ? 'Releasing...' : 'Release the Light'}
            </span>
          </motion.button>

          {/* Subtle hint */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { 
              delay: 2.8, 
              duration: 1,
            }}
            className="text-sm text-lantern-lilac/60 font-light tracking-wide"
            style={{
              fontFamily: "'Lora', serif",
            }}
          >
            Let the lanterns guide your way
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Decorative corner element - minimalist */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 right-8 w-20 h-20 z-[2]"
      >
        {/* Simplified ornamental design */}
        <div className="relative w-full h-full">
          {[0, 90, 180, 270].map((rotation, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-b from-lantern-gold to-transparent"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>
      </motion.div>
    </main>
  )
}
