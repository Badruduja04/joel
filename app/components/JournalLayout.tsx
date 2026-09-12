'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface JournalLayoutProps {
  children: ReactNode;
  className?: string;
}

// Main container untuk journal pages
export function JournalContainer({ children, className = '' }: JournalLayoutProps) {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(252, 211, 77, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
        {children}
      </div>
    </div>
  );
}

// Card dengan arch border untuk konten
interface ArchCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'top' | 'photo';
  delay?: number;
}

export function ArchCard({ 
  children, 
  className = '', 
  variant = 'default',
  delay = 0 
}: ArchCardProps) {
  const borderClass = variant === 'top' ? 'arch-border-top' : 'arch-border';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`
        ${borderClass}
        bg-gradient-to-br from-lantern-midnight-light/40 to-lantern-twilight/30
        backdrop-blur-md
        border border-lantern-lilac/20
        p-6 sm:p-8
        shadow-lg
        hover:shadow-xl hover:shadow-lantern-gold/10
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// Photo frame dengan arch border
interface PhotoFrameProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  delay?: number;
}

export function PhotoFrame({ 
  src, 
  alt, 
  caption, 
  className = '',
  delay = 0 
}: PhotoFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay }}
      className={`group ${className}`}
    >
      {/* Frame container */}
      <div className="arch-border bg-gradient-to-br from-lantern-gold/20 to-lantern-lilac/10 p-3 sm:p-4 border-2 border-lantern-gold/30 shadow-lg hover:shadow-xl hover:shadow-lantern-gold/20 transition-all duration-300">
        {/* Image */}
        <div className="arch-border overflow-hidden bg-lantern-midnight/50">
          <motion.img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Caption */}
      {caption && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="text-center text-sm text-lantern-lilac/70 mt-3 font-light italic"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {caption}
        </motion.p>
      )}
    </motion.div>
  );
}

// Section header dengan decorative elements
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  delay?: number;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  className = '',
  delay = 0 
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`text-center space-y-3 mb-8 ${className}`}
    >
      {/* Decorative line */}
      <div className="flex items-center justify-center gap-4">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-lantern-gold/50"
        />
        
        {/* Small lantern icon */}
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-2 h-3 bg-lantern-gold rounded-sm shadow-lg shadow-lantern-gold/50"
        />
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-lantern-gold/50"
        />
      </div>
      
      {/* Title */}
      <h2 
        className="text-2xl sm:text-3xl md:text-4xl text-lantern-lilac-light tracking-wide"
        style={{ 
          fontFamily: "'Playfair Display', serif",
          textShadow: '0 2px 20px rgba(196, 181, 253, 0.3)'
        }}
      >
        {title}
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p 
          className="text-base sm:text-lg text-lantern-mist/70 font-light"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

// Quote card dengan special styling
interface QuoteCardProps {
  quote: string;
  author?: string;
  className?: string;
  delay?: number;
}

export function QuoteCard({ 
  quote, 
  author, 
  className = '',
  delay = 0 
}: QuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay }}
      className={`relative ${className}`}
    >
      {/* Quote marks background */}
      <div className="absolute -top-4 -left-2 text-6xl text-lantern-gold/20 font-serif leading-none">
        "
      </div>
      
      <ArchCard className="pl-8">
        <blockquote 
          className="text-lg sm:text-xl text-lantern-lilac-light/90 leading-relaxed italic"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {quote}
        </blockquote>
        
        {author && (
          <p className="text-right text-lantern-gold/80 mt-4 text-sm sm:text-base font-light">
            — {author}
          </p>
        )}
      </ArchCard>
    </motion.div>
  );
}

// Message card untuk pesan personal
interface MessageCardProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  className?: string;
  delay?: number;
}

export function MessageCard({ 
  title, 
  message, 
  icon,
  className = '',
  delay = 0 
}: MessageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <ArchCard className="text-center space-y-4">
        {/* Icon */}
        {icon && (
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block text-4xl"
          >
            {icon}
          </motion.div>
        )}
        
        {/* Title */}
        {title && (
          <h3 
            className="text-xl sm:text-2xl text-lantern-gold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h3>
        )}
        
        {/* Message */}
        <p 
          className="text-base sm:text-lg text-lantern-mist/80 leading-relaxed"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {message}
        </p>
      </ArchCard>
    </motion.div>
  );
}

// Grid layout untuk photo gallery
interface PhotoGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function PhotoGrid({ 
  children, 
  columns = 3,
  className = '' 
}: PhotoGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-6 sm:gap-8 ${className}`}>
      {children}
    </div>
  );
}

// Divider dengan ornament
export function JournalDivider({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className={`flex items-center justify-center gap-4 my-12 ${className}`}
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-lantern-lilac/30 to-transparent" />
      
      {/* Center ornament */}
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="relative w-8 h-8"
      >
        {[0, 90, 180, 270].map((rotation, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-lantern-gold/50"
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              transformOrigin: 'center',
            }}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-lantern-gold" />
      </motion.div>
      
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-lantern-lilac/30 to-transparent" />
    </motion.div>
  );
}

// Floating back button
interface BackButtonProps {
  href: string;
  label?: string;
}

export function FloatingBackButton({ href, label = 'Back' }: BackButtonProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ x: -5 }}
      className="fixed top-8 left-8 z-50 group"
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-lantern-midnight/80 backdrop-blur-md border border-lantern-lilac/20 text-lantern-lilac hover:bg-lantern-midnight transition-all duration-300 shadow-lg">
        <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span>
        <span className="text-sm font-light" style={{ fontFamily: "'Lora', serif" }}>{label}</span>
      </div>
    </motion.a>
  );
}
