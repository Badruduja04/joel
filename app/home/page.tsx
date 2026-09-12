'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

// Mini lantern component
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
      <div 
        className="absolute inset-0 rounded-full blur-lg"
        style={{
          background: 'radial-gradient(circle, rgba(252, 211, 77, 0.6) 0%, transparent 70%)',
        }}
      />
      
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 bg-lantern-gold-dark rounded-t-md"
        style={{
          width: `${baseSize * 0.7}px`,
          height: `${baseSize * 0.15}px`,
        }}
      />
      
      <div 
        className="absolute top-[15%] left-1/2 -translate-x-1/2 rounded-lg"
        style={{
          width: `${baseSize * 0.8}px`,
          height: `${baseSize * 0.7}px`,
          background: 'linear-gradient(180deg, rgba(252, 211, 77, 0.9) 0%, rgba(245, 158, 11, 0.8) 100%)',
          boxShadow: `0 0 ${baseSize * 0.5}px rgba(252, 211, 77, 0.6)`,
        }}
      />
      
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

function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Good morning'
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon'
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening'
  } else {
    return 'Good night'
  }
}

// Only 4 menu items - removed diary & music
const menuItems = [
  { 
    id: 'memories',
    icon: '📸', 
    title: 'Memories', 
    description: 'Photo gallery',
    href: '/memories',
  },
  { 
    id: 'puzzle',
    icon: '🧩', 
    title: 'Puzzle', 
    description: 'Photo puzzle game',
    href: '/puzzle',
  },
  { 
    id: 'camera',
    icon: '📷', 
    title: 'Camera', 
    description: 'Photobooth',
    href: '/camera/photobooth',
  },
  { 
    id: 'surprise',
    icon: '🎁', 
    title: 'Surprise', 
    description: 'Something special',
    href: '/surprise',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState('Good morning')
  const [memoriesCount, setMemoriesCount] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)
  
  useEffect(() => {
    setMounted(true)
    setGreeting(getGreeting())
    
    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    fetchStats(currentUser.id)
  }, [router])

  const fetchStats = async (userId: string) => {
    try {
      const { count: memoriesCount } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      setMemoriesCount(memoriesCount || 0)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lantern-lilac">Loading...</div>
      </div>
    )
  }
  
  const displayName = user.display_name || user.username || "Birthday Star"

  return (
    <main className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative floating lanterns */}
      <motion.div
        className="absolute top-20 right-10 hidden md:block"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <MiniLantern size={2} delay={0} />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 left-10 hidden md:block"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <MiniLantern size={1.8} delay={0.5} />
      </motion.div>

      {/* Stars */}
      {mounted && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-1 h-1 bg-lantern-gold rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            boxShadow: '0 0 4px rgba(252, 211, 77, 0.8)'
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-block mb-6"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 30px rgba(252, 211, 77, 0.4)',
                  '0 0 50px rgba(252, 211, 77, 0.7)',
                  '0 0 30px rgba(252, 211, 77, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-28 h-28 mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-lantern-gold/10 to-transparent backdrop-blur-sm border-4 border-lantern-gold/30"
            >
              <img 
                src="/buzz/foto login.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div className="absolute -top-2 -right-2" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <MiniLantern size={0.8} delay={0} />
            </motion.div>
            <motion.div className="absolute -top-2 -left-2" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
              <MiniLantern size={0.7} delay={0.3} />
            </motion.div>
            <motion.div className="absolute -bottom-2 -left-2" animate={{ y: [0, -3, 0] }} transition={{ duration: 2.1, repeat: Infinity }}>
              <MiniLantern size={0.75} delay={0.6} />
            </motion.div>
            <motion.div className="absolute -bottom-2 -right-2" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.3, repeat: Infinity }}>
              <MiniLantern size={0.8} delay={0.9} />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-5xl mb-3 text-lantern-lilac-light tracking-wide"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 20px rgba(196, 181, 253, 0.4)' 
            }}
          >
            {greeting}, {displayName}! 💖
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-lantern-gold/80 mb-8 font-light"
            style={{ fontFamily: "'Lora', serif" }}
          >
            A little space made just for you ✨
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="bg-lantern-midnight-light/40 backdrop-blur-lg rounded-3xl p-6 border border-lantern-gold/20 relative overflow-hidden shadow-xl">
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-lantern-gold/10 to-lantern-lilac/10 blur-xl"
              />

              <div className="relative z-10">
                <div className="text-center mb-4">
                  <MiniLantern size={1.2} delay={0} className="inline-block mb-2" />
                  <h2 
                    className="text-2xl text-lantern-lilac-light mb-1"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Your Little Space
                  </h2>
                  <p 
                    className="text-lantern-mist/60 text-sm font-light"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    Everything here is just for you
                  </p>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                    <div className="text-3xl mb-2">📸</div>
                    <div className="text-3xl font-bold text-lantern-gold">
                      {loadingStats ? '...' : memoriesCount}
                    </div>
                    <div 
                      className="text-xs text-lantern-mist/60 mt-1 font-light"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      Precious Memories
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-gradient-to-r from-lantern-gold/10 to-lantern-lilac/10 backdrop-blur-lg rounded-2xl p-4 border border-lantern-lilac/20">
              <p 
                className="text-lantern-lilac-light/80 text-sm text-center italic font-light"
                style={{ fontFamily: "'Lora', serif" }}
              >
                "In a sky full of lanterns, you shine the brightest" ✨
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Menu Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 
            className="text-2xl md:text-3xl mb-2 text-lantern-lilac-light tracking-wide" 
            style={{ 
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 2px 15px rgba(196, 181, 253, 0.3)' 
            }}
          >
            Explore Your Space 🚀
          </h2>
          <p 
            className="text-lantern-gold/60 text-sm font-light"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Choose your adventure
          </p>
        </motion.div>

        {/* Menu Grid - 2x2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="grid grid-cols-2 gap-4 md:gap-6 mb-12 max-w-2xl mx-auto"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
            >
              <Link href={item.href} className="block relative">
                <div className={`
                  bg-lantern-midnight-light/40 backdrop-blur-lg rounded-3xl p-6 md:p-8
                  border ${hoveredItem === item.id ? 'border-lantern-gold' : 'border-lantern-gold/20'}
                  transition-all duration-300
                  shadow-lg hover:shadow-2xl hover:shadow-lantern-gold/20
                  relative overflow-hidden
                  group
                `}>
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      className="absolute inset-0 bg-gradient-to-br from-lantern-gold to-lantern-lilac"
                    />
                  )}

                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: hoveredItem === item.id ? 1.2 : 1,
                        rotate: hoveredItem === item.id ? [0, -10, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-5xl md:text-6xl mb-4"
                    >
                      {item.icon}
                    </motion.div>

                    <h3 
                      className="text-xl md:text-2xl mb-2 text-lantern-lilac-light"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </h3>
                    
                    <p 
                      className="text-sm text-lantern-mist/70 font-light"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 border border-lantern-gold rounded-3xl"
                      style={{ boxShadow: '0 0 20px rgba(252, 211, 77, 0.3)' }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-lantern-midnight-light/40 hover:bg-lantern-midnight-light/60 backdrop-blur-lg rounded-full text-lantern-lilac hover:text-lantern-lilac-light border-2 border-lantern-gold/30 hover:border-lantern-gold/60 transition-all duration-300 text-sm font-light"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Logout
          </button>
        </motion.div>

        {/* Corner lantern */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="fixed bottom-10 right-10 hidden md:block z-20"
        >
          <MiniLantern size={1.5} delay={0.3} />
        </motion.div>
      </div>
    </main>
  )
}
