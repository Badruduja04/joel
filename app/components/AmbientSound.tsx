'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AmbientSoundProps {
  /**
   * URL atau path ke file audio
   * Untuk suara angin malam, bisa gunakan:
   * - Freesound.org
   * - YouTube Audio Library
   * - Atau placeholder URL
   */
  audioSrc?: string;
  
  /**
   * Volume (0.0 - 1.0)
   * Default: 0.2 (20%) - subtle dan tidak mengganggu
   */
  volume?: number;
  
  /**
   * Autoplay saat component mount
   * Default: true
   */
  autoPlay?: boolean;
  
  /**
   * Fade in duration dalam detik
   * Default: 3
   */
  fadeInDuration?: number;
  
  /**
   * Show controls untuk user
   * Default: true
   */
  showControls?: boolean;
}

export default function AmbientSound({
  audioSrc = '/sounds/night-wind-ambient.mp3', // placeholder path
  volume = 0.2,
  autoPlay = true,
  fadeInDuration = 3,
  showControls = true,
}: AmbientSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    // Set initial volume
    audioRef.current.volume = 0;
    audioRef.current.loop = true;

    // Autoplay dengan fade in
    if (autoPlay) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
          fadeInAudio();
        } catch (error) {
          // Autoplay might be blocked by browser
          console.log('Autoplay blocked. User interaction required.');
        }
      };
      
      // Delay sedikit agar smooth
      setTimeout(playAudio, 500);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [autoPlay]);

  // Fade in audio
  const fadeInAudio = () => {
    if (!audioRef.current) return;

    let currentVol = 0;
    const targetVol = currentVolume;
    const steps = fadeInDuration * 20; // 20 steps per second
    const increment = targetVol / steps;
    
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }

      currentVol += increment;
      if (currentVol >= targetVol) {
        audioRef.current.volume = targetVol;
        clearInterval(fadeInterval);
      } else {
        audioRef.current.volume = currentVol;
      }
    }, 50);
  };

  // Fade out audio
  const fadeOutAudio = (callback?: () => void) => {
    if (!audioRef.current) return;

    const currentVol = audioRef.current.volume;
    const steps = 20; // 1 second fade out
    const decrement = currentVol / steps;
    
    const fadeInterval = setInterval(() => {
      if (!audioRef.current) {
        clearInterval(fadeInterval);
        return;
      }

      const newVol = audioRef.current.volume - decrement;
      if (newVol <= 0) {
        audioRef.current.volume = 0;
        clearInterval(fadeInterval);
        if (callback) callback();
      } else {
        audioRef.current.volume = newVol;
      }
    }, 50);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      fadeOutAudio(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        fadeInAudio();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = currentVolume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setCurrentVolume(newVolume);
    
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    console.error('Audio file not found or cannot be loaded');
  };

  if (!showControls && audioError) {
    // Jika tidak ada controls dan audio error, hide component completely
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onError={handleAudioError}
        preload="auto"
      />

      {/* Floating controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <div className="flex items-center gap-2">
            {/* Volume slider - appears on hover */}
            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-lantern-midnight/90 backdrop-blur-md border border-lantern-lilac/20 rounded-full px-4 py-2 shadow-lg"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentVolume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-lantern-gold cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(252, 211, 77, 0.5) 0%, rgba(252, 211, 77, 0.5) ${currentVolume * 100}%, rgba(255, 255, 255, 0.1) ${currentVolume * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Control buttons container */}
            <div className="bg-lantern-midnight/90 backdrop-blur-md border border-lantern-lilac/20 rounded-full p-2 shadow-lg flex items-center gap-1">
              {/* Play/Pause button */}
              <motion.button
                onClick={togglePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-lantern-gold/20 hover:bg-lantern-gold/30 flex items-center justify-center transition-colors duration-300"
                title={isPlaying ? 'Pause ambient sound' : 'Play ambient sound'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-lantern-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-lantern-gold ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.button>

              {/* Mute button */}
              <motion.button
                onClick={toggleMute}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-lantern-lilac/20 hover:bg-lantern-lilac/30 flex items-center justify-center transition-colors duration-300"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg className="w-5 h-5 text-lantern-lilac" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-lantern-lilac" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </motion.button>

              {/* Volume button */}
              <motion.button
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-lantern-gold/20 hover:bg-lantern-gold/30 flex items-center justify-center transition-colors duration-300"
                title="Adjust volume"
              >
                <svg className="w-5 h-5 text-lantern-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83z" />
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" opacity="0.6" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Label - subtle hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isPlaying ? 0.5 : 0.3 }}
            className="text-xs text-lantern-mist/60 text-right mt-2 font-light"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {audioError ? 'Audio unavailable' : isPlaying ? '🌙 Night ambience' : 'Ambient sound'}
          </motion.p>
        </motion.div>
      )}
    </>
  );
}

/**
 * Simplified version - auto-play only, no controls
 */
export function AmbientSoundSimple({ 
  audioSrc = '/sounds/night-wind-ambient.mp3',
  volume = 0.15,
}: { 
  audioSrc?: string;
  volume?: number;
}) {
  return (
    <AmbientSound
      audioSrc={audioSrc}
      volume={volume}
      autoPlay={true}
      showControls={false}
      fadeInDuration={4}
    />
  );
}
