'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, memo, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

// ========================================
// TYPES
// ========================================
type SurpriseStage = 
  | 'idle'       // Box visible, waiting for interaction
  | 'opening'    // Box opening animation
  | 'flowers'    // Flowers start appearing
  | 'expanding'  // Flowers multiply and fill screen
  | 'transition' // Blur/fade transition effect
  | 'revealed'   // Final surprise content

interface FlowerData {
  id: string
  image: string
  x: number  // percentage
  y: number  // percentage
  rotation: number
  scale: number
  layer: number // 0=background, 1=midground, 2=foreground
  delay: number
}

interface Music {
  id: string
  title: string
  artist: string | null
  file_url: string
  duration: number | null
}

// ========================================
// CONFIGURATION
// ========================================
const FLOWER_CONFIG = {
  images: [
    '/flower/pngwing.com.png',
    '/flower/pngwing.com (1).png',
    '/flower/pngwing.com (2).png',
    '/flower/pngwing.com (3).png',
    '/flower/pngwing.com (4).png',
    '/flower/pngwing.com (5).png',
    '/flower/pngwing.com (6).png',
    '/flower/pngwing.com (7).png',
    '/flower/pngwing.com (8).png',
    '/flower/—Pngtree—beautiful natural red rose flowers_9002652.png',
    '/flower/—Pngtree—outlined leaves decoration with watercolor_8491556.png',
  ],
  
  timings: {
    opening: 1500,      // Envelope opening duration (ms)
    flowerStagger: 20,  // Slightly slower for smoother render
    flowerDuration: 800,// Each flower animation duration (ms)
    expandStagger: 12,  // Optimized for performance
    expandDuration: 1000,// Longer expansion for smooth fill
    transition: 2500,   // Longer transition with blur
  },
  
  counts: {
    initial: 60,     // Optimized count (was 80)
    expansion: 180,  // Optimized count (was 240) - 240 total still full coverage
  },
}

// ========================================
// ENVELOPE CONFIGURATION - CSS VARIABLES
// ========================================
const ENVELOPE_CONFIG = {
  width: 240,        // Base envelope width (px)
  height: 160,       // Base envelope height (px)
  flapHeight: 100,   // Flap triangle height (px)
  colors: {
    back: '#e8d5c4',       // Envelope back (beige)
    front: '#f5e6d3',      // Envelope front (light beige)
    flap: '#d4bfaa',       // Flap (darker beige)
    seal: '#e53935',       // Seal/sticker (red)
    sealAccent: '#c62828', // Seal shadow (dark red)
    letter: '#ffffff',     // Letter/card (white)
    shadow: 'rgba(0,0,0,0.3)',
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

// Memoized Flower Component for better performance
const FlowerItem = memo(({ 
  flower, 
  stage, 
  isTransitioning, 
  scaleMultiplier,
  prefersReducedMotion 
}: { 
  flower: FlowerData
  stage: SurpriseStage
  isTransitioning: boolean
  scaleMultiplier: number
  prefersReducedMotion: boolean
}) => {
  const finalScale = flower.scale * scaleMultiplier
  
  // CLUSTER EXPANSION EFFECT
  const centerX = 50
  const centerY = 50
  const dx = flower.x - centerX
  const dy = flower.y - centerY
  
  // Expansion factor
  const expansionFactor = stage === 'expanding' ? 2.0 : stage === 'transition' ? 2.5 : 1
  const expandedX = centerX + (dx * expansionFactor)
  const expandedY = centerY + (dy * expansionFactor)
  
  // Layer-based opacity and blur for depth
  const layerOpacity = flower.layer === 0 ? 0.8 : flower.layer === 1 ? 0.95 : 1
  const layerBlur = flower.layer === 0 ? 'blur(1px)' : 'blur(0px)'
  
  return (
    <motion.div
      key={flower.id}
      initial={{ 
        scale: 0, 
        opacity: 0,
        rotate: flower.rotation - 20,
      }}
      animate={{ 
        // USE TRANSLATE (x, y) instead of left/top for GPU acceleration
        x: isTransitioning ? `${expandedX - flower.x}vw` : 
           (stage === 'expanding' ? `${expandedX - flower.x}vw` : '0vw'),
        y: isTransitioning ? `${expandedY - flower.y}vw` : 
           (stage === 'expanding' ? `${expandedY - flower.y}vw` : '0vw'),
        
        // SCALE: grows MUCH larger as cluster expands to fill screen
        scale: isTransitioning ? finalScale * 3.5 : 
               (stage === 'expanding' ? finalScale * 2.0 : finalScale),
        
        // OPACITY: solid then fades for transition
        opacity: isTransitioning ? 0 : layerOpacity,
        
        // ROTATION: rotates as it expands
        rotate: flower.rotation,
      }}
      exit={{
        // FALLING DOWN ANIMATION - berjatuhan ke bawah
        y: '120vh', // Jatuh keluar layar
        opacity: 0,
        rotate: flower.rotation + (Math.random() > 0.5 ? 360 : -360),
        transition: { 
          duration: 1.2, 
          ease: [0.4, 0.0, 0.6, 1], // Ease out for natural fall
          delay: flower.delay / 3000 // Staggered fall
        }
      }}
      transition={{
        delay: flower.delay / 1000,
        duration: prefersReducedMotion ? 0.4 : 
                 (stage === 'flowers' ? 0.8 : 
                  stage === 'expanding' ? 1.0 : 1.2),
        ease: [0.34, 1.56, 0.64, 1],
      }}
      style={{
        position: 'absolute',
        left: `${flower.x}%`,
        top: `${flower.y}%`,
        transform: `translate(-50%, -50%)`,
        zIndex: 10 + flower.layer,
        willChange: 'transform',
        filter: layerBlur,
      }}
      className="pointer-events-none"
    >
      <img
        src={flower.image}
        alt=""
        className="w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain select-none"
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))',
        }}
      />
    </motion.div>
  )
})

FlowerItem.displayName = 'FlowerItem'

// ========================================
// HELPER FUNCTIONS
// ========================================

// Generate deterministic flower position based on index
// FLORAL CLUSTER EXPANSION - bunga berkumpul di tengah lalu expand keluar
function generateFlowerPosition(index: number, total: number, stage: 'initial' | 'expansion'): Omit<FlowerData, 'id' | 'image' | 'delay'> {
  // CLUSTER CENTER POINT - ABSOLUTE CENTER (50%, 50%)
  const centerX = 50
  const centerY = 50
  
  // DENSE CLUSTER - flowers packed tightly at center
  const flowersPerRing = 10
  const ringIndex = Math.floor(index / flowersPerRing)
  const angleInRing = (index % flowersPerRing) / flowersPerRing
  
  // Golden ratio for natural distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const angle = angleInRing * Math.PI * 2 + (index * goldenAngle * 0.15)
  
  // START FROM ABSOLUTE CENTER (radius 0) then expand to FULL SCREEN
  // Initial: very tight cluster starting from CENTER (0-25vw radius)
  // Expansion: extends to cover ENTIRE screen including corners (0-100vw radius)
  const baseRadius = stage === 'initial' 
    ? Math.sqrt(ringIndex) * 3.5  // Tight cluster: 0-25vw from center
    : Math.sqrt(ringIndex) * 12   // FULL COVERAGE: 0-100vw (reaches all corners!)
  
  // Add organic variation
  const radiusVariation = Math.sin(index * 2.4) * 3
  const radius = baseRadius + radiusVariation
  
  // Calculate position (percentage from ABSOLUTE center point)
  const x = centerX + Math.cos(angle) * radius
  const y = centerY + Math.sin(angle) * radius
  
  // Rotation for natural look
  const rotation = (index * 47 + angle * 57.3) % 360
  
  // DEPTH/SIZE variation - closer flowers are BIGGER
  const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
  const maxDistance = 100 // Max distance to viewport corners (full diagonal)
  const depthFactor = 1 - (distanceFromCenter / maxDistance) * 0.5
  
  // Flowers in center are MUCH larger (0.5 - 0.9 scale)
  const scaleBase = 0.45 + depthFactor * 0.45
  const scale = stage === 'expansion' ? scaleBase * 1.6 : scaleBase
  
  // Layer based on distance - closer = higher z-index
  const layer = depthFactor > 0.7 ? 2 : depthFactor > 0.4 ? 1 : 0
  
  return { x, y, rotation, scale, layer }
}

// Generate all flowers for a stage
function generateFlowers(stage: 'initial' | 'expansion', startIndex: number = 0): FlowerData[] {
  const count = stage === 'initial' 
    ? FLOWER_CONFIG.counts.initial 
    : FLOWER_CONFIG.counts.expansion
  
  const staggerDelay = stage === 'initial'
    ? FLOWER_CONFIG.timings.flowerStagger
    : FLOWER_CONFIG.timings.expandStagger
  
  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i
    const imageIndex = index % FLOWER_CONFIG.images.length
    
    return {
      id: `flower-${stage}-${i}`,
      image: FLOWER_CONFIG.images[imageIndex],
      delay: i * staggerDelay,
      ...generateFlowerPosition(i, count, stage),
    }
  })
}

// ========================================
// MAIN COMPONENT
// ========================================
export default function SurprisePage() {
  const [stage, setStage] = useState<SurpriseStage>('idle')
  const [isAnimating, setIsAnimating] = useState(false)
  const [flowers, setFlowers] = useState<FlowerData[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  // Music player state
  const audioRef = useRef<HTMLAudioElement>(null)
  const [surpriseMusic, setSurpriseMusic] = useState<Music | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  
  // Load surprise song from database (first song uploaded)
  useEffect(() => {
    loadSurpriseMusic()
  }, [])
  
  const loadSurpriseMusic = async () => {
    try {
      // ========================================
      // PILIHAN LOGIC UNTUK MEMILIH LAGU
      // ========================================
      
      // OPTION 1: Pilih berdasarkan TITLE (Exact Match)
      // Uncomment baris ini dan ganti 'Song Title' dengan judul lagu yang diinginkan
      /*
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .eq('title', 'Song Title')  // Ganti dengan judul lagu yang diinginkan
        .single()
      */
      
      // OPTION 2: Pilih berdasarkan ARTIST
      // Uncomment baris ini dan ganti 'Artist Name' dengan nama artist yang diinginkan
      /*
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .eq('artist', 'Artist Name')  // Ganti dengan nama artist
        .limit(1)
        .single()
      */
      
      // OPTION 3: Pilih LAGU TERAKHIR yang diupload (most recent)
      // Uncomment baris ini untuk menggunakan lagu terbaru
      /*
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .order('created_at', { ascending: false })  // Descending = terbaru
        .limit(1)
        .single()
      */
      
      // OPTION 4: Pilih LAGU RANDOM (acak)
      // Uncomment baris ini untuk lagu random
      /*
      const { data: allMusic, error: fetchError } = await supabase
        .from('music')
        .select('*')
      
      if (fetchError || !allMusic || allMusic.length === 0) {
        console.log('No music found')
        return
      }
      
      const randomIndex = Math.floor(Math.random() * allMusic.length)
      const data = allMusic[randomIndex]
      const error = null
      */
      
      // OPTION 5: Pilih berdasarkan ID spesifik
      // Uncomment baris ini dan ganti 'SONG_ID_HERE' dengan ID lagu yang diinginkan
      /*
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .eq('id', 'SONG_ID_HERE')  // Ganti dengan ID lagu spesifik
        .single()
      */
      
      // OPTION 6 (DEFAULT - CURRENTLY ACTIVE): Pilih lagu PERTAMA yang diupload
      const { data, error } = await supabase
        .from('music')
        .select('*')
        .order('created_at', { ascending: true }) // First uploaded song
        .limit(1)
        .single()
      
      if (error) {
        console.log('No music found for surprise page')
        return
      }
      
      setSurpriseMusic(data)
    } catch (err) {
      console.error('Error loading surprise music:', err)
    }
  }
  
  // Handle play/pause using same logic as music page
  const togglePlay = async () => {
    if (!audioRef.current || !surpriseMusic) return
    
    try {
      if (isPlaying) {
        // Pause current
        audioRef.current.pause()
      } else {
        // Play or resume
        if (audioRef.current.src !== surpriseMusic.file_url) {
          audioRef.current.src = surpriseMusic.file_url
          audioRef.current.load()
        }
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Playback error:', error)
      alert('❌ Failed to play audio. Please check if the file is accessible.')
      setIsPlaying(false)
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])
  
  // Stage transition logic
  useEffect(() => {
    if (stage === 'idle' || stage === 'revealed') return
    
    const durationMultiplier = prefersReducedMotion ? 0.3 : 1
    
    let timeout: NodeJS.Timeout
    
    if (stage === 'opening') {
      timeout = setTimeout(() => {
        setStage('flowers')
        setFlowers(generateFlowers('initial'))
      }, FLOWER_CONFIG.timings.opening * durationMultiplier)
    } else if (stage === 'flowers') {
      const duration = 
        FLOWER_CONFIG.counts.initial * FLOWER_CONFIG.timings.flowerStagger + 
        FLOWER_CONFIG.timings.flowerDuration
      
      timeout = setTimeout(() => {
        setStage('expanding')
        setFlowers(prev => [
          ...prev,
          ...generateFlowers('expansion', FLOWER_CONFIG.counts.initial)
        ])
      }, duration * durationMultiplier)
    } else if (stage === 'expanding') {
      const duration = 
        FLOWER_CONFIG.counts.expansion * FLOWER_CONFIG.timings.expandStagger + 
        FLOWER_CONFIG.timings.expandDuration
      
      timeout = setTimeout(() => {
        setStage('transition')
      }, duration * durationMultiplier)
    } else if (stage === 'transition') {
      timeout = setTimeout(() => {
        setStage('revealed')
        setFlowers([]) // Clear flowers
        setIsAnimating(false)
      }, FLOWER_CONFIG.timings.transition * durationMultiplier)
    }
    
    return () => clearTimeout(timeout)
  }, [stage, prefersReducedMotion])
  
  // Handle box interaction
  const handleBoxClick = () => {
    if (isAnimating || stage !== 'idle') return
    
    setIsAnimating(true)
    setStage('opening')
  }
  
  // Handle replay
  const handleReplay = () => {
    setStage('idle')
    setIsAnimating(false)
    setFlowers([])
  }
  
  // Get responsive flower scale multiplier
  const getScaleMultiplier = () => {
    if (typeof window === 'undefined') return 1
    return window.innerWidth < 768 ? 0.7 : 1
  }
  
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background gradient - lighter for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-lantern-lilac/40 via-purple-200 to-lantern-lilac/40" />
      
      {/* Subtle animated orbs - lantern glow */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-40 h-40 bg-lantern-gold/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-20 left-10 w-48 h-48 bg-lantern-lilac/30 rounded-full blur-3xl"
      />
      
      {/* Surprise Box & Flowers */}
      <AnimatePresence mode="wait">
        {stage !== 'revealed' && (
          <motion.div
            key="surprise-scene"
            className="relative w-full h-full flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            {/* Flower Field */}
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence>
                {flowers.map((flower) => (
                  <FlowerItem
                    key={flower.id}
                    flower={flower}
                    stage={stage}
                    isTransitioning={stage === 'transition'}
                    scaleMultiplier={getScaleMultiplier()}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {/* ENVELOPE - Pure Code (SVG + CSS) */}
            <motion.button
              onClick={handleBoxClick}
              onKeyDown={(e) => e.key === 'Enter' && handleBoxClick()}
              disabled={isAnimating}
              aria-label="Open surprise envelope"
              className="relative z-20 focus:outline-none focus:ring-4 focus:ring-buzz-red disabled:cursor-not-allowed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                stage === 'idle' ? {
                  opacity: 1,
                  scale: 1,
                  y: [-8, 8, -8], // Entire envelope floats
                } : {
                  opacity: stage === 'opening' ? 1 : 0,
                  scale: stage === 'opening' ? 1 : 0.8,
                  y: 0,
                }
              }
              transition={
                stage === 'idle' ? {
                  duration: prefersReducedMotion ? 2 : 3.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {
                  duration: prefersReducedMotion ? 0.5 : 0.8,
                  ease: "easeInOut"
                }
              }
              style={{
                ['--envelope-width' as string]: `${ENVELOPE_CONFIG.width}px`,
                ['--envelope-height' as string]: `${ENVELOPE_CONFIG.height}px`,
                ['--flap-height' as string]: `${ENVELOPE_CONFIG.flapHeight}px`,
              }}
            >
              {/* Envelope Container */}
              <div 
                className="relative"
                style={{
                  width: ENVELOPE_CONFIG.width,
                  height: ENVELOPE_CONFIG.height + ENVELOPE_CONFIG.flapHeight, // Full height with flap
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Layer 1: Envelope Back */}
                <div
                  className="absolute"
                  style={{
                    bottom: 0,
                    left: 0,
                    width: ENVELOPE_CONFIG.width,
                    height: ENVELOPE_CONFIG.height,
                    zIndex: 1,
                  }}
                >
                  <svg
                    width={ENVELOPE_CONFIG.width}
                    height={ENVELOPE_CONFIG.height}
                    viewBox={`0 0 ${ENVELOPE_CONFIG.width} ${ENVELOPE_CONFIG.height}`}
                  >
                    {/* Back rectangle */}
                    <rect
                      x="0"
                      y="0"
                      width={ENVELOPE_CONFIG.width}
                      height={ENVELOPE_CONFIG.height}
                      fill={ENVELOPE_CONFIG.colors.back}
                      stroke="#a0826d"
                      strokeWidth="2"
                    />
                    {/* Decorative border lines */}
                    <rect
                      x="8"
                      y="8"
                      width={ENVELOPE_CONFIG.width - 16}
                      height={ENVELOPE_CONFIG.height - 16}
                      fill="none"
                      stroke="#c4a789"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  </svg>
                </div>

                {/* Layer 2: Letter/Card (inside envelope) */}
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    width: ENVELOPE_CONFIG.width - 20,
                    height: ENVELOPE_CONFIG.height - 10,
                    x: '-50%',
                    zIndex: 2,
                  }}
                  animate={
                    stage === 'idle' ? {
                      bottom: 10,
                      opacity: 0,
                    } : stage === 'opening' ? {
                      bottom: [10, ENVELOPE_CONFIG.height * 0.3, ENVELOPE_CONFIG.height * 0.8],
                      opacity: [0, 0.5, 1],
                    } : {
                      bottom: ENVELOPE_CONFIG.height,
                      opacity: 1,
                    }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.5 : 1.8,
                    ease: [0.34, 1.56, 0.64, 1],
                    delay: stage === 'opening' ? 0.3 : 0,
                  }}
                >
                  <svg
                    width={ENVELOPE_CONFIG.width - 20}
                    height={ENVELOPE_CONFIG.height - 10}
                    viewBox={`0 0 ${ENVELOPE_CONFIG.width - 20} ${ENVELOPE_CONFIG.height - 10}`}
                  >
                    {/* Letter paper */}
                    <rect
                      x="0"
                      y="0"
                      width={ENVELOPE_CONFIG.width - 20}
                      height={ENVELOPE_CONFIG.height - 10}
                      fill={ENVELOPE_CONFIG.colors.letter}
                      stroke="#e0e0e0"
                      strokeWidth="2"
                      rx="4"
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                    />
                    {/* Letter lines decoration */}
                    {[...Array(5)].map((_, i) => (
                      <line
                        key={i}
                        x1="20"
                        y1={30 + i * 20}
                        x2={ENVELOPE_CONFIG.width - 40}
                        y2={30 + i * 20}
                        stroke="#e0e0e0"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    ))}
                    {/* Heart decoration */}
                    <text
                      x={ENVELOPE_CONFIG.width / 2 - 10}
                      y={ENVELOPE_CONFIG.height / 2 - 5}
                      fontSize="48"
                      fill="#e91e63"
                      opacity="0.3"
                    >
                      💌
                    </text>
                  </svg>
                </motion.div>

                {/* Layer 3: Envelope Front */}
                <div
                  className="absolute"
                  style={{
                    bottom: 0,
                    left: 0,
                    width: ENVELOPE_CONFIG.width,
                    height: ENVELOPE_CONFIG.height,
                    zIndex: 3,
                  }}
                >
                  <svg
                    width={ENVELOPE_CONFIG.width}
                    height={ENVELOPE_CONFIG.height}
                    viewBox={`0 0 ${ENVELOPE_CONFIG.width} ${ENVELOPE_CONFIG.height}`}
                  >
                    {/* Front rectangle with bottom part */}
                    <path
                      d={`
                        M 0,${ENVELOPE_CONFIG.height}
                        L 0,${ENVELOPE_CONFIG.height * 0.5}
                        L ${ENVELOPE_CONFIG.width / 2},${ENVELOPE_CONFIG.height * 0.7}
                        L ${ENVELOPE_CONFIG.width},${ENVELOPE_CONFIG.height * 0.5}
                        L ${ENVELOPE_CONFIG.width},${ENVELOPE_CONFIG.height}
                        Z
                      `}
                      fill={ENVELOPE_CONFIG.colors.front}
                      stroke="#b89968"
                      strokeWidth="2"
                    />
                    {/* Left side triangle */}
                    <path
                      d={`
                        M 0,${ENVELOPE_CONFIG.height * 0.5}
                        L 0,0
                        L ${ENVELOPE_CONFIG.width / 2},${ENVELOPE_CONFIG.height * 0.5}
                        Z
                      `}
                      fill={ENVELOPE_CONFIG.colors.front}
                      stroke="#b89968"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                    {/* Right side triangle */}
                    <path
                      d={`
                        M ${ENVELOPE_CONFIG.width},${ENVELOPE_CONFIG.height * 0.5}
                        L ${ENVELOPE_CONFIG.width},0
                        L ${ENVELOPE_CONFIG.width / 2},${ENVELOPE_CONFIG.height * 0.5}
                        Z
                      `}
                      fill={ENVELOPE_CONFIG.colors.front}
                      stroke="#b89968"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  </svg>
                </div>

                {/* Layer 4: Envelope Flap (Top) - Opens with rotation */}
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    bottom: ENVELOPE_CONFIG.height - 100, // CLOSED: flush with envelope body (subtract small gap)
                    width: ENVELOPE_CONFIG.width,
                    height: ENVELOPE_CONFIG.flapHeight,
                    x: '-50%',
                    transformOrigin: 'center bottom',
                    zIndex: 4,
                  }}
                  animate={
                    stage === 'idle' ? {
                      rotateX: 0,  // CLOSED: flat on envelope
                      z: 0,
                    } : stage === 'opening' ? {
                      rotateX: [0, -120, -180],  // OPENS: rotates UPWARD
                      z: [0, 30, 50],
                    } : {
                      rotateX: -180,
                      z: 50,
                      opacity: 0,
                    }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.5 : 1.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  <svg
                    width={ENVELOPE_CONFIG.width}
                    height={ENVELOPE_CONFIG.flapHeight}
                    viewBox={`0 0 ${ENVELOPE_CONFIG.width} ${ENVELOPE_CONFIG.flapHeight}`}
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                    }}
                  >
                    {/* Flap triangle */}
                    <path
                      d={`
                        M 0,0
                        L ${ENVELOPE_CONFIG.width / 2},${ENVELOPE_CONFIG.flapHeight}
                        L ${ENVELOPE_CONFIG.width},0
                        Z
                      `}
                      fill={ENVELOPE_CONFIG.colors.flap}
                      stroke="#9d7a5a"
                      strokeWidth="2"
                    />
                    {/* Flap inner shadow */}
                    <path
                      d={`
                        M 10,5
                        L ${ENVELOPE_CONFIG.width / 2},${ENVELOPE_CONFIG.flapHeight - 10}
                        L ${ENVELOPE_CONFIG.width - 10},5
                      `}
                      fill="none"
                      stroke="#b89968"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  </svg>
                </motion.div>

                {/* Layer 5: Seal/Sticker (on flap) */}
                <motion.div
                  className="absolute"
                  style={{
                    left: '50%',
                    bottom: ENVELOPE_CONFIG.height + ENVELOPE_CONFIG.flapHeight / 2 - 110, // Centered on flap
                    x: '-50%',
                    zIndex: 5,
                  }}
                  animate={
                    stage === 'idle' ? {
                      scale: 1,
                      rotate: 0,
                    } : stage === 'opening' ? {
                      scale: [1, 1.2, 0.8],
                      rotate: [0, 15, 180],
                      opacity: [1, 0.8, 0],
                    } : {
                      opacity: 0,
                    }
                  }
                  transition={{
                    duration: prefersReducedMotion ? 0.5 : 1.2,
                    ease: "easeOut",
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    {/* Seal circle */}
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill={ENVELOPE_CONFIG.colors.seal}
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.3))"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="15"
                      fill={ENVELOPE_CONFIG.colors.sealAccent}
                      opacity="0.3"
                    />
                    {/* Heart symbol */}
                    <text
                      x="20"
                      y="27"
                      fontSize="20"
                      textAnchor="middle"
                      fill="white"
                    >
                      ❤️
                    </text>
                  </svg>
                </motion.div>

                {/* Glow effect (only in idle state) */}
                {stage === 'idle' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ zIndex: 6 }}
                    animate={{
                      boxShadow: [
                        '0 0 30px rgba(229, 57, 53, 0.2)',
                        '0 0 50px rgba(229, 57, 53, 0.4)',
                        '0 0 30px rgba(229, 57, 53, 0.2)',
                      ],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </div>

              {/* Hint text */}
              {stage === 'idle' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/90 text-lg font-semibold whitespace-nowrap"
                  style={{ textShadow: '0 3px 15px rgba(0,0,0,0.6)' }}
                >
                  Click to open 
                </motion.p>
              )}
            </motion.button>
          </motion.div>
        )}
        
        {/* Final Revealed Content - Smooth fade in after flowers fall */}
        {stage === 'revealed' && (
          <motion.div
            key="revealed-content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: prefersReducedMotion ? 0.5 : 1.2, 
              ease: [0.34, 1.56, 0.64, 1],
              delay: 0.3 // Slight delay after flowers finish falling
            }}
            className="relative z-30 px-6 w-full max-w-4xl mx-auto"
          >
            {/* Birthday Card with Scrapbook Style */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-buzz-green/30 relative overflow-hidden"
            >
              {/* Decorative corner flowers */}
              <div className="absolute top-4 left-4 text-4xl opacity-30">🌸</div>
              <div className="absolute top-4 right-4 text-4xl opacity-30">🌺</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-30">🌷</div>
              <div className="absolute bottom-4 right-4 text-4xl opacity-30">🌼</div>

              {/* Content Container */}
              <div className="relative z-10">
                {/* Header with emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
                  className="text-center mb-6"
                >
                  <div className="inline-block p-4 bg-gradient-to-br from-buzz-green/20 to-buzz-purple/20 rounded-full mb-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-7xl"
                    >
                      🎁
                    </motion.div>
                  </div>
                  <p className="text-buzz-purple/60 text-sm uppercase tracking-wider font-semibold">
                     Only for You
                  </p>
                </motion.div>

                {/* Birthday Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold text-center mb-3"
                  style={{ 
                    fontFamily: "'Playfair Display', serif",
                    background: 'linear-gradient(135deg, #FCD34D 0%, #C4B5FD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Semangat, Joel! 🏮
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-center text-lantern-lilac text-xl md:text-2xl font-semibold mb-8"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  A Little Light for Your Journey
                </motion.p>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex items-center justify-center gap-2 mb-8"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-lantern-gold to-transparent flex-1" />
                  <div className="text-lantern-gold text-2xl">🏮</div>
                  <div className="h-px bg-gradient-to-r from-transparent via-lantern-gold to-transparent flex-1" />
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="text-center mb-8 space-y-4"
                >
                  <p 
                    className="text-gray-900 text-base md:text-lg leading-relaxed font-medium"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Ga bisa dirangkaikan dengan kata-kata, tapi aku tahu kamu pasti bisa melewati semua ini dengan baik.
                    Setiap langkah yang kamu ambil, setiap usaha yang kamu lakukan, semuanya bermakna.
                  </p>
                  <p 
                    className="text-gray-900 text-base md:text-lg leading-relaxed font-medium"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Semoga lancar ya, Joel. Apapun yang sedang kamu hadapi, ingat bahwa kamu tidak sendirian.
                    Ada cahaya yang selalu menyinarimu, bahkan di malam paling gelap sekalipun.
                  </p>
                  <p 
                    className="text-lantern-gold text-lg md:text-xl font-bold italic"
                    style={{ 
                      fontFamily: "'Playfair Display', serif",
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    You shine brighter than a thousand lanterns. Keep going, you've got this! ✨
                  </p>
                </motion.div>

                {/* Music Section */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="bg-lantern-midnight/30 backdrop-blur-md rounded-2xl p-6 mb-8 border-2 border-lantern-gold/20 shadow-xl"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="text-2xl"
                    >
                      🎵
                    </motion.div>
                    <h3 
                      className="text-lantern-gold font-bold text-lg"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      A Song for You
                    </h3>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-2xl"
                    >
                      🏮
                    </motion.div>
                  </div>
                  <p 
                    className="text-gray-800 text-sm text-center mb-4 italic"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Press play — semoga lagu ini bisa menemanimu
                  </p>
                  
                  {surpriseMusic ? (
                    <>
                      <div className="bg-white/50 rounded-full p-3 flex items-center justify-center gap-4">
                        <motion.button
                          onClick={togglePlay}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-12 h-12 bg-buzz-red rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:bg-red-600 transition-colors"
                          style={{ boxShadow: '0 0 20px rgba(229, 57, 53, 0.4)' }}
                        >
                          {isPlaying ? '⏸️' : '▶️'}
                        </motion.button>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-semibold text-sm truncate">{surpriseMusic.title}</p>
                          <p className="text-gray-500 text-xs truncate">{surpriseMusic.artist || 'Your favorite song'} ♥</p>
                        </div>
                        <div className="text-gray-600 text-sm font-mono whitespace-nowrap">
                          {formatTime(currentTime)} / {formatTime(surpriseMusic.duration || 0)}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3 px-3">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-buzz-red to-buzz-purple"
                            style={{
                              width: surpriseMusic.duration 
                                ? `${(currentTime / surpriseMusic.duration) * 100}%`
                                : '0%'
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      </div>
                      
                      {/* Hidden Audio Element - with inline event handlers like music page */}
                      <audio 
                        ref={audioRef} 
                        src={surpriseMusic.file_url} 
                        preload="metadata"
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onEnded={() => {
                          setIsPlaying(false)
                          setCurrentTime(0)
                        }}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onError={(e) => {
                          console.error('Audio error:', e)
                          setIsPlaying(false)
                        }}
                      />
                    </>
                  ) : (
                    <div className="bg-white/50 rounded-full p-3 flex items-center justify-center gap-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white text-2xl">
                        🎵
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm">No music uploaded yet</p>
                        <p className="text-gray-400 text-xs">Upload a song in Music page</p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Decorative flowers animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="flex justify-center gap-6 mb-8"
                >
                  <motion.span
                    animate={{ rotate: [0, 360], y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-4xl"
                  >
                    🌸
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl"
                  >
                    💐
                  </motion.span>
                  <motion.span
                    animate={{ rotate: [0, -360], y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="text-4xl"
                  >
                    🌺
                  </motion.span>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    href="/memories"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-buzz-green to-buzz-green-dark rounded-full text-white font-bold text-center transition-all duration-300 hover:scale-105 border-4 border-white/50 shadow-xl flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 0 30px rgba(139, 195, 74, 0.4)' }}
                  >
                    <span>📸</span>
                    <span>See Our Album</span>
                  </Link>
                  
                  <motion.button
                    onClick={handleReplay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-4 bg-white hover:bg-gray-50 rounded-full text-gray-700 font-medium transition-all duration-300 border-2 border-gray-200 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    <span>Replay</span>
                  </motion.button>
                </motion.div>

                {/* Back to home link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="text-center mt-6"
                >
                  <Link
                    href="/home"
                    className="text-gray-500 hover:text-buzz-green transition-colors text-sm underline"
                  >
                    ← Back to Home
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {stage === 'idle' && 'Envelope ready to open'}
        {stage === 'opening' && 'Opening envelope'}
        {stage === 'flowers' && 'Flowers appearing'}
        {stage === 'expanding' && 'More flowers blooming'}
        {stage === 'transition' && 'Creating surprise reveal'}
        {stage === 'revealed' && 'Happy Birthday message revealed'}
      </div>
    </main>
  )
}
