'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginWithUsernameAndBirthday } from '@/lib/auth/auth'

// Mini lantern component untuk decorative elements
function MiniLantern({ className = '', size = 1, delay = 0 }: { className?: string; size?: number; delay?: number }) {
  const baseSize = 20 * size;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1],
        scale: [0, 1, 1],
        y: [0, -5, 0],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
      }}
      className={`relative ${className}`}
      style={{
        width: `${baseSize}px`,
        height: `${baseSize * 1.4}px`,
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-lg"
        style={{
          background: 'radial-gradient(circle, rgba(252, 211, 77, 0.6) 0%, transparent 70%)',
        }}
      />
      
      {/* Top cap */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 bg-lantern-gold-dark rounded-t-md"
        style={{
          width: `${baseSize * 0.7}px`,
          height: `${baseSize * 0.15}px`,
        }}
      />
      
      {/* Body */}
      <div 
        className="absolute top-[15%] left-1/2 -translate-x-1/2 rounded-lg"
        style={{
          width: `${baseSize * 0.8}px`,
          height: `${baseSize * 0.7}px`,
          background: 'linear-gradient(180deg, rgba(252, 211, 77, 0.9) 0%, rgba(245, 158, 11, 0.8) 100%)',
          boxShadow: `0 0 ${baseSize * 0.5}px rgba(252, 211, 77, 0.6)`,
        }}
      />
      
      {/* Bottom cap */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-lantern-gold-dark rounded-b-md"
        style={{
          width: `${baseSize * 0.7}px`,
          height: `${baseSize * 0.15}px`,
        }}
      />
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [username, setUsername] = useState('')
  const [birthday, setBirthday] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<'username' | 'birthday' | 'both' | null>(null)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasAttempted, setHasAttempted] = useState(false)

  // Only render random elements on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setErrorField(null)
    setShowErrorMessage(false)
    setHasAttempted(true)
    
    // Login with Supabase
    const result = await loginWithUsernameAndBirthday({ username, birthday })
    
    if (result.success) {
      // Success - show loading state then redirect
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      // Error - show PLAYFUL EXPLOSION! 🎉
      setIsLoading(false)
      
      // Determine which field is wrong
      const errorMsg = result.error || 'Login failed'
      if (errorMsg.toLowerCase().includes('username')) {
        setErrorField('username')
        setError("That username isn't quite right 👀")
      } else if (errorMsg.toLowerCase().includes('birthday') || errorMsg.toLowerCase().includes('date')) {
        setErrorField('birthday')
        setError("That special date doesn't seem right 🎂")
      } else {
        setErrorField('both')
        setError("Oops! Something isn't quite right yet 👀")
      }
      
      // Start explosion animation
      setShowExplosion(true)
      
      // Show error message after explosion
      setTimeout(() => {
        setShowErrorMessage(true)
      }, 700)
      
      // Reset explosion after animation
      setTimeout(() => {
        setShowExplosion(false)
      }, 1500)
    }
  }

  // Clear error when user starts typing again
  useEffect(() => {
    if (hasAttempted && (username || birthday)) {
      setShowErrorMessage(false)
      setError('')
    }
  }, [username, birthday, hasAttempted])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated decorative lanterns in corners - REPLACED CIRCLES */}
      <motion.div
        className="absolute hidden sm:block"
        style={{ top: '15%', right: '10%' }}
        animate={prefersReducedMotion ? {} : {
          y: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-24 h-24 flex items-center justify-center flex-wrap gap-3">
          <MiniLantern size={1.2} delay={0} />
          <MiniLantern size={1} delay={0.3} />
          <MiniLantern size={0.9} delay={0.6} />
          <MiniLantern size={1.1} delay={0.9} />
        </div>
      </motion.div>

      {/* Left side decorative lantern cluster */}
      <motion.div
        className="absolute hidden md:block"
        style={{ top: '30%', left: '8%' }}
        animate={prefersReducedMotion ? {} : {
          x: [-5, 5, -5],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative flex flex-col items-center gap-4">
          <MiniLantern size={1.3} delay={0} />
          <MiniLantern size={1} delay={0.5} />
          <MiniLantern size={1.1} delay={1} />
        </div>
      </motion.div>

      {/* Right bottom decorative lanterns */}
      <motion.div
        className="absolute hidden sm:block"
        style={{ bottom: '20%', right: '15%' }}
        animate={prefersReducedMotion ? {} : {
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex gap-3">
          <MiniLantern size={1.2} delay={0} />
          <MiniLantern size={1} delay={0.4} />
        </div>
      </motion.div>

      {/* Left bottom floating lantern */}
      <motion.div
        className="absolute hidden md:block"
        style={{ bottom: '25%', left: '12%' }}
        animate={prefersReducedMotion ? {} : {
          y: [0, -25, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <MiniLantern size={1.5} delay={0.2} />
      </motion.div>

      {/* Stars background */}
      {mounted && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Main login form - STAGGER ENTRANCE */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* ✨ ELEGANT FLOATING LANTERNS ERROR ANIMATION - Themed! ✨ */}
        <AnimatePresence>
          {showExplosion && (
            <>
              {/* Floating lanterns yang terbang keluar */}
              {[...Array(prefersReducedMotion ? 6 : 12)].map((_, i) => {
                const angle = (i * 360) / (prefersReducedMotion ? 6 : 12)
                const distance = prefersReducedMotion ? 60 : (100 + Math.random() * 60)
                const x = Math.cos((angle * Math.PI) / 180) * distance
                const y = Math.sin((angle * Math.PI) / 180) * distance - 50 // float upward
                
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: x,
                      y: y,
                      scale: [0, 1, 0.8],
                      opacity: [0, 1, 0],
                      rotate: [0, 360]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.8 : 1.5,
                      ease: [0.22, 0.61, 0.36, 1] // easeOutCubic
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <MiniLantern size={0.6 + Math.random() * 0.4} delay={0} />
                  </motion.div>
                )
              })}
              
              {/* Central glow burst - gold theme */}
              {!prefersReducedMotion && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-lantern-gold via-lantern-gold-light to-lantern-gold rounded-full blur-2xl pointer-events-none"
                  />
                  
                  {/* Gentle shimmer waves */}
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={`wave-${i}`}
                      initial={{ scale: 0.5, opacity: 0.6 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.2, delay, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-lantern-gold rounded-full pointer-events-none"
                    />
                  ))}
                  
                  {/* Sparkles */}
                  {[...Array(8)].map((_, i) => {
                    const sparkAngle = (i * 360) / 8
                    const sparkDist = 40
                    const sparkX = Math.cos((sparkAngle * Math.PI) / 180) * sparkDist
                    const sparkY = Math.sin((sparkAngle * Math.PI) / 180) * sparkDist
                    
                    return (
                      <motion.div
                        key={`spark-${i}`}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{
                          x: sparkX,
                          y: sparkY,
                          scale: [0, 1, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.05,
                          ease: "easeOut"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-lantern-gold-light rounded-full pointer-events-none"
                        style={{ boxShadow: '0 0 8px rgba(252, 211, 77, 0.8)' }}
                      />
                    )
                  })}
                </>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Header with Buzz - STAGGERED */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 0.2, 
            duration: 0.7,
            ease: "easeOut"
          }}
          className="text-center mb-8"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : {
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative inline-block mb-6"
          >
            {/* Photo with lantern theme */}
            <motion.div
              animate={prefersReducedMotion ? {} : {
                boxShadow: [
                  '0 0 30px rgba(252, 211, 77, 0.4)',
                  '0 0 50px rgba(252, 211, 77, 0.7)',
                  '0 0 30px rgba(252, 211, 77, 0.4)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-lantern-gold/10 to-transparent backdrop-blur-sm border-4 border-lantern-gold/30"
            >
              <img 
                src="/buzz/foto login.jpg"
                alt="Welcome"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Animated mini lanterns around photo - replacing colored circles */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={prefersReducedMotion ? {} : { 
                y: [0, -3, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              <MiniLantern size={0.8} delay={0} />
            </motion.div>
            
            <motion.div
              className="absolute -top-2 -left-2"
              animate={prefersReducedMotion ? {} : { 
                y: [0, -4, 0],
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            >
              <MiniLantern size={0.7} delay={0.3} />
            </motion.div>
            
            <motion.div
              className="absolute -bottom-2 -left-2"
              animate={prefersReducedMotion ? {} : { 
                y: [0, -3, 0],
              }}
              transition={{ duration: 2.1, repeat: Infinity, delay: 0.6 }}
            >
              <MiniLantern size={0.75} delay={0.6} />
            </motion.div>
            
            <motion.div
              className="absolute -bottom-2 -right-2"
              animate={prefersReducedMotion ? {} : { 
                y: [0, -5, 0],
              }}
              transition={{ duration: 2.3, repeat: Infinity, delay: 0.9 }}
            >
              <MiniLantern size={0.8} delay={0.9} />
            </motion.div>
          </motion.div>

          {/* Title - STAGGERED with lantern theme */}
          <motion.h1 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.4, duration: 0.6 }}
            className="text-2xl sm:text-3xl text-lantern-lilac-light tracking-wide" 
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 20px rgba(196, 181, 253, 0.4)' 
            }}
          >
            Welcome Back!
          </motion.h1>
          
          {/* Subtitle - STAGGERED */}
          <motion.p 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.6, duration: 0.6 }}
            className="text-lantern-gold/80 text-xs sm:text-sm font-light"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Enter your details to continue
          </motion.p>
        </motion.div>

        {/* Login Form - themed glassmorphism */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { 
            delay: 0.5, 
            duration: 0.6,
            ease: "easeOut"
          }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-lantern-gold/30 relative overflow-hidden"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 40px rgba(252, 211, 77, 0.15)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative z-10">
            {/* Username Input - themed */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-lantern-gold mb-2 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <span className="text-lg">👤</span> USERNAME
              </label>
              <motion.input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                animate={errorField === 'username' || errorField === 'both' ? {
                  x: prefersReducedMotion ? 0 : [-10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.4 }}
                className={`
                  w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-white/40 
                  font-medium transition-all duration-200
                  ${(errorField === 'username' || errorField === 'both') 
                    ? 'border-2 border-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/30' 
                    : 'border-2 border-lantern-gold/40 hover:border-lantern-gold/70 hover:shadow-[0_0_15px_rgba(252,211,77,0.3)] focus:border-lantern-gold focus:ring-2 focus:ring-lantern-gold/40 focus:shadow-[0_0_20px_rgba(252,211,77,0.5)]'
                  }
                  outline-none
                `}
                placeholder="Enter your username"
              />
            </div>

            {/* Birthday Input - themed */}
            <div>
              <label
                htmlFor="birthday"
                className="block text-sm font-semibold text-lantern-gold mb-2 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <motion.span 
                  className="text-lg inline-block"
                  animate={birthday ? {
                    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  🎂
                </motion.span> 
                BIRTHDAY
              </label>
              <motion.input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
                animate={errorField === 'birthday' || errorField === 'both' ? {
                  x: prefersReducedMotion ? 0 : [-10, 10, -10, 10, 0],
                } : {}}
                transition={{ duration: 0.4 }}
                className={`
                  w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-white/40 
                  font-medium transition-all duration-200 [color-scheme:dark]
                  ${(errorField === 'birthday' || errorField === 'both') 
                    ? 'border-2 border-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/30' 
                    : 'border-2 border-lantern-gold/40 hover:border-lantern-gold/70 hover:shadow-[0_0_15px_rgba(252,211,77,0.3)] focus:border-lantern-gold focus:ring-2 focus:ring-lantern-gold/40 focus:shadow-[0_0_20px_rgba(252,211,77,0.5)]'
                  }
                  outline-none
                `}
                placeholder="dd/mm/yyyy"
              />
              {/* Helper text - themed */}
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mt-2 text-xs text-lantern-lilac/70 flex items-center gap-1 font-light"
                style={{ fontFamily: "'Lora', serif" }}
              >
                <span className="text-sm">�</span>
                <span>Enter your special day</span>
              </motion.p>
            </div>

            {/* Friendly Error Message - appears AFTER explosion, lantern themed */}
            <AnimatePresence>
              {showErrorMessage && error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-gradient-to-br from-lantern-gold/20 to-lantern-lilac/20 border-2 border-lantern-gold/40 rounded-xl p-4 text-center backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-block mb-2"
                  >
                    <MiniLantern size={1} delay={0} />
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lantern-lilac-light font-semibold text-lg mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Almost there! ✨
                  </motion.p>
                  <p 
                    className="text-lantern-mist/90 font-light text-sm"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button - lantern themed */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : (prefersReducedMotion ? {} : { scale: 1.02, y: -2 })}
              whileTap={isLoading ? {} : (prefersReducedMotion ? {} : { scale: 0.98 })}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-lantern-gold-dark via-lantern-gold to-lantern-gold-dark rounded-xl text-lantern-midnight font-bold text-base sm:text-lg transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed border-4 border-white/30 relative overflow-hidden"
              style={{
                fontFamily: "'Playfair Display', serif",
                boxShadow: '0 0 30px rgba(252, 211, 77, 0.6)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-lantern-midnight border-t-transparent rounded-full"
                  />
                  <span>Opening your world... ✨</span>
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  ENTER MY WORLD 🎁
                </span>
              )}
            </motion.button>
          </form>

          {/* Decorative mini lanterns at bottom - replacing colored dots */}
          <div className="mt-6 flex justify-center gap-3">
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                y: [0, -5, 0],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              <MiniLantern size={0.5} delay={0} />
            </motion.div>
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                y: [0, -5, 0],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              <MiniLantern size={0.6} delay={0.3} />
            </motion.div>
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                y: [0, -5, 0],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              <MiniLantern size={0.55} delay={0.6} />
            </motion.div>
            <motion.div
              animate={prefersReducedMotion ? {} : { 
                y: [0, -5, 0],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
            >
              <MiniLantern size={0.5} delay={0.9} />
            </motion.div>
          </div>
        </motion.div>

        {/* Back Link - themed */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { delay: 0.8, duration: 0.6 }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className="group text-sm text-lantern-lilac hover:text-lantern-lilac-light transition-colors duration-300 font-light flex items-center justify-center gap-2"
            style={{ fontFamily: "'Lora', serif" }}
          >
            <motion.span
              className="inline-block"
              whileHover={prefersReducedMotion ? {} : { x: -3 }}
              transition={{ duration: 0.2 }}
            >
              ←
            </motion.span> 
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
