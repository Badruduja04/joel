'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/auth'
import { supabase } from '@/lib/supabase/client'

type Template = {
  id: number
  name: string
  slots: number
  layout: 'stamp-1' | 'stamp-2' | 'polaroid-1' | 'polaroid-3'
  icon?: string
}

const TEMPLATES: Template[] = [
  { id: 1, name: 'Single Shot', slots: 1, layout: 'stamp-1', icon: '📸' },
  { id: 2, name: 'Stamp Duo', slots: 2, layout: 'stamp-2', icon: '📮' },
  { id: 3, name: 'Rapunzel Polaroid', slots: 1, layout: 'polaroid-1', icon: '/buzz/rapunzel.jpg' },
  { id: 4, name: 'Quad Polaroid', slots: 4, layout: 'polaroid-3', icon: '/buzz/rapunzel 1.jpg' }
]

export default function PhotoBoothSimple() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [step, setStep] = useState<'select' | 'capture'>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) router.push('/login')
  }, [router])

  // Cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const selectTemplate = async (template: Template) => {
    setSelectedTemplate(template)
    setStep('capture')
    
    // Start camera
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        console.log('Camera started, stream:', mediaStream.active)
      }
    } catch (err) {
      console.error('Camera error:', err)
      alert('Cannot access camera')
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || isCountingDown) return
    
    // Start countdown
    setIsCountingDown(true)
    setCountdown(3)
    
    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      
      if (count <= 0) {
        clearInterval(countdownInterval)
        capturePhoto()
      }
    }, 1000)
  }
  
  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Flip horizontal to un-mirror the photo (video is mirrored for preview)
      ctx.save()
      ctx.scale(-1, 1) // Flip horizontally
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      const newPhotos = [...capturedPhotos, dataUrl]
      setCapturedPhotos(newPhotos)
      setIsCountingDown(false)
      setCountdown(null)
      
      console.log(`Photo ${newPhotos.length} of ${selectedTemplate?.slots} captured`)
      
      if (newPhotos.length >= (selectedTemplate?.slots || 1)) {
        // All photos captured - generate and save composite
        if (selectedTemplate?.layout === 'stamp-1') {
          generateSingleComposite(newPhotos)
        } else if (selectedTemplate?.layout === 'stamp-2') {
          generateStampComposite(newPhotos)
        } else if (selectedTemplate?.layout === 'polaroid-1') {
          generatePolaroid1Composite(newPhotos)
        } else if (selectedTemplate?.layout === 'polaroid-3') {
          generatePolaroid3Composite(newPhotos)
        }
      }
    }
  }

  // Helper function to create rounded rectangle path
  const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + w - radius, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
    ctx.lineTo(x + w, y + h - radius)
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
    ctx.lineTo(x + radius, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const generateSingleComposite = async (photos: string[]) => {
    setIsSaving(true)
    
    // Load template image for single photo
    const templateImg = new Image()
    templateImg.src = '/foto `1.png'
    
    await new Promise<void>((resolve) => {
      templateImg.onload = () => resolve()
    })
    
    // Load photo
    const photoImg = new Image()
    photoImg.src = photos[0]
    
    await new Promise<void>((resolve) => {
      photoImg.onload = () => resolve()
    })
    
    // Create main canvas with template size
    const canvas = document.createElement('canvas')
    canvas.width = templateImg.width
    canvas.height = templateImg.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Define photo slot area in template (koordinat area foto pada template)
    const photoSlot = {
      x: 230,
      y: 270,
      w: 610,
      h: 840
    }
    
    // === SIMPLE: Template background + Foto ===
    
    // STEP 1: Draw template sebagai background
    ctx.drawImage(templateImg, 0, 0)
    
    // STEP 2: Draw foto user di atas template (clipped ke photo slot)
    const imgAspect = photoImg.width / photoImg.height
    const slotAspect = photoSlot.w / photoSlot.h
    
    let drawWidth, drawHeight, offsetX, offsetY
    
    if (imgAspect > slotAspect) {
      drawHeight = photoSlot.h
      drawWidth = photoImg.width * (photoSlot.h / photoImg.height)
      offsetX = -(drawWidth - photoSlot.w) / 2
      offsetY = 0
    } else {
      drawWidth = photoSlot.w
      drawHeight = photoImg.height * (photoSlot.w / photoImg.width)
      offsetX = 0
      offsetY = -(drawHeight - photoSlot.h) / 2
    }
    
    // Draw foto (clipped ke slot with rounded corners - SINGLE PHOTO)
    ctx.save()
    roundedRect(ctx, photoSlot.x, photoSlot.y, photoSlot.w, photoSlot.h, 12)
    ctx.clip()
    ctx.drawImage(
      photoImg, 
      photoSlot.x + offsetX, 
      photoSlot.y + offsetY, 
      drawWidth, 
      drawHeight
    )
    ctx.restore()
    
    // SELESAI - Tidak perlu draw template lagi
    
    // Convert to blob and save
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await saveToGallery(blob)
    }, 'image/jpeg', 0.95)
  }

  const generateStampComposite = async (photos: string[]) => {
    setIsSaving(true)
    
    // Load template image
    const templateImg = new Image()
    templateImg.src = '/tamplate.png'
    
    await new Promise<void>((resolve) => {
      templateImg.onload = () => resolve()
    })
    
    // Create canvas with same size as template
    const canvas = document.createElement('canvas')
    canvas.width = templateImg.width
    canvas.height = templateImg.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Define photo slots (koordinat area foto pada template)
    const photoSlots = [
      { x: 235,
        y: 250, 
        w: 550, 
        h: 420 },  // Top photo slot
      { x: 235, 
        y: 710, 
        w: 550, 
        h: 420 }   // Bottom photo slot
    ]
    
    // === SIMPLE: Template background + Foto ===
    
    // STEP 1: Draw template sebagai background
    ctx.drawImage(templateImg, 0, 0)
    
    // STEP 2: Draw EACH PHOTO di atas template (clipped ke slot with rounded corners)
    for (let i = 0; i < photos.length; i++) {
      const photoImg = new Image()
      photoImg.src = photos[i]
      
      await new Promise<void>((resolve) => {
        photoImg.onload = () => {
          const slot = photoSlots[i]
          
          // Calculate object-fit: cover dimensions
          const imgAspect = photoImg.width / photoImg.height
          const slotAspect = slot.w / slot.h
          
          let drawWidth, drawHeight, offsetX, offsetY
          
          if (imgAspect > slotAspect) {
            drawHeight = slot.h
            drawWidth = photoImg.width * (slot.h / photoImg.height)
            offsetX = -(drawWidth - slot.w) / 2
            offsetY = 0
          } else {
            drawWidth = slot.w
            drawHeight = photoImg.height * (slot.w / photoImg.width)
            offsetX = 0
            offsetY = -(drawHeight - slot.h) / 2
          }
          
          // Clip photo ke area slot with rounded corners
          ctx.save()
          roundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 12)
          ctx.clip()
          
          // Draw photo centered in slot
          ctx.drawImage(
            photoImg, 
            slot.x + offsetX, 
            slot.y + offsetY, 
            drawWidth, 
            drawHeight
          )
          
          ctx.restore()
          resolve()
        }
      })
    }
    
    // SELESAI - Tidak perlu draw template lagi
    
    // Convert to blob and save
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await saveToGallery(blob)
    }, 'image/jpeg', 0.95)
  }

  const generatePolaroid1Composite = async (photos: string[]) => {
    setIsSaving(true)
    
    // Load template image for buzz polaroid 1
    const templateImg = new Image()
    templateImg.src = '/polaroid_1.png'
    
    await new Promise<void>((resolve) => {
      templateImg.onload = () => resolve()
    })
    
    // Load photo
    const photoImg = new Image()
    photoImg.src = photos[0]
    
    await new Promise<void>((resolve) => {
      photoImg.onload = () => resolve()
    })
    
    // Create main canvas with template size
    const canvas = document.createElement('canvas')
    canvas.width = templateImg.width
    canvas.height = templateImg.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Define photo slot area - SAME AS foto `1.png (ukuran sama)
    const photoSlot = {
      x: 241,
      y: 215,
      w: 607,
      h: 810
    }
    
    // STEP 1: Draw template sebagai background
    ctx.drawImage(templateImg, 0, 0)
    
    // STEP 2: Draw foto user di atas template (clipped ke photo slot with rounded corners)
    const imgAspect = photoImg.width / photoImg.height
    const slotAspect = photoSlot.w / photoSlot.h
    
    let drawWidth, drawHeight, offsetX, offsetY
    
    if (imgAspect > slotAspect) {
      drawHeight = photoSlot.h
      drawWidth = photoImg.width * (photoSlot.h / photoImg.height)
      offsetX = -(drawWidth - photoSlot.w) / 2
      offsetY = 0
    } else {
      drawWidth = photoSlot.w
      drawHeight = photoImg.height * (photoSlot.w / photoImg.width)
      offsetX = 0
      offsetY = -(drawHeight - photoSlot.h) / 2
    }
    
    // Draw foto (clipped ke slot with rounded corners)
    ctx.save()
    roundedRect(ctx, photoSlot.x, photoSlot.y, photoSlot.w, photoSlot.h, 12)
    ctx.clip()
    ctx.drawImage(
      photoImg, 
      photoSlot.x + offsetX, 
      photoSlot.y + offsetY, 
      drawWidth, 
      drawHeight
    )
    ctx.restore()
    
    // Convert to blob and save
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await saveToGallery(blob)
    }, 'image/jpeg', 0.95)
  }

  const generatePolaroid3Composite = async (photos: string[]) => {
    setIsSaving(true)
    
    // Load template image for buzz polaroid 3
    const templateImg = new Image()
    templateImg.src = '/polaroid_2.png'
    
    await new Promise<void>((resolve) => {
      templateImg.onload = () => resolve()
    })
    
    // Create canvas with same size as template
    const canvas = document.createElement('canvas')
    canvas.width = templateImg.width
    canvas.height = templateImg.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Define photo slots untuk 4 polaroid positions VERTIKAL (ke bawah)
    // Width: 350, Height: 200 (landscape orientation)
    const photoSlots = [
      { x: 377, y: 172, w: 323, h: 244 },   // Top polaroid (foto 1)
      { x: 377, y: 442, w: 323, h: 245 },   // Second polaroid (foto 2)
      { x: 377, y: 715, w: 323, h: 244 },   // Third polaroid (foto 3)
      { x: 377, y: 985, w: 323, h: 245 }    // Bottom polaroid (foto 4)
    ]
    
    // STEP 1: Draw template sebagai background
    ctx.drawImage(templateImg, 0, 0)
    
    // STEP 2: Draw EACH PHOTO di atas template (clipped ke slot with rounded corners)
    for (let i = 0; i < photos.length && i < photoSlots.length; i++) {
      const photoImg = new Image()
      photoImg.src = photos[i]
      
      await new Promise<void>((resolve) => {
        photoImg.onload = () => {
          const slot = photoSlots[i]
          
          // Calculate object-fit: cover dimensions
          const imgAspect = photoImg.width / photoImg.height
          const slotAspect = slot.w / slot.h
          
          let drawWidth, drawHeight, offsetX, offsetY
          
          if (imgAspect > slotAspect) {
            drawHeight = slot.h
            drawWidth = photoImg.width * (slot.h / photoImg.height)
            offsetX = -(drawWidth - slot.w) / 2
            offsetY = 0
          } else {
            drawWidth = slot.w
            drawHeight = photoImg.height * (slot.w / photoImg.width)
            offsetX = 0
            offsetY = -(drawHeight - slot.h) / 2
          }
          
          // Clip photo ke area slot with rounded corners
          ctx.save()
          roundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 12)
          ctx.clip()
          
          // Draw photo centered in slot
          ctx.drawImage(
            photoImg, 
            slot.x + offsetX, 
            slot.y + offsetY, 
            drawWidth, 
            drawHeight
          )
          
          ctx.restore()
          resolve()
        }
      })
    }
    
    // Convert to blob and save
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await saveToGallery(blob)
    }, 'image/jpeg', 0.95)
  }

  const saveToGallery = async (imageBlob: Blob) => {
    try {
      const user = getCurrentUser()
      if (!user) throw new Error('Not authenticated')

      const filename = `${user.id}/${Date.now()}.jpg`
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filename, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('memories')
        .getPublicUrl(filename)

      // Save to database
      const { error: dbError } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          title: `${selectedTemplate?.name} Photo`,
          description: 'Photo Booth Memory',
          image_url: urlData.publicUrl,
          memory_date: new Date().toISOString().split('T')[0]
        })

      if (dbError) throw dbError

      // Don't stop camera - let user continue taking photos
      // if (stream) stream.getTracks().forEach(track => track.stop())
      
      setIsSaving(false)
      setShowSuccessModal(true)
      
      // Reset for next photo session
      setCapturedPhotos([])
      setStep('select')
      setSelectedTemplate(null)
      setCountdown(null)
      setIsCountingDown(false)
      
      // Auto-hide success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)
      
    } catch (err: any) {
      console.error('Save error:', err)
      setIsSaving(false)
      alert('Failed to save: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-green-900 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Photo Booth
        </h1>

        {step === 'select' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {TEMPLATES.map((template) => (
              <motion.button
                key={template.id}
                onClick={() => selectTemplate(template)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 backdrop-blur-lg p-8 rounded-2xl text-white font-bold text-xl border-4 border-pink-400/30 hover:border-pink-400/60 transition-all shadow-xl"
              >
                {/* Icon - emoji or image */}
                <div className="text-6xl mb-4 flex items-center justify-center">
                  {template.icon?.startsWith('/') ? (
                    <img 
                      src={template.icon} 
                      alt={template.name}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg"
                    />
                  ) : (
                    <span>{template.icon}</span>
                  )}
                </div>
                <h3 className="text-2xl mb-2">{template.name}</h3>
                <p className="text-sm font-normal text-white/70">
                  Take {template.slots} photo{template.slots > 1 ? 's' : ''}
                </p>
              </motion.button>
            ))}
          </div>
        )}

        {step === 'capture' && (
          <div className="space-y-4">
            <p className="text-white text-center text-xl">
              Photo {capturedPhotos.length + 1} of {selectedTemplate?.slots}
            </p>
            
            {/* Video dengan countdown overlay */}
            <div className="relative bg-black rounded-2xl overflow-hidden mx-auto" 
                 style={{ 
                   aspectRatio: '4/3',
                   maxWidth: '100%',
                   width: '100%'
                 }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ 
                  display: 'block',
                  transform: 'scaleX(-1)' // Mirror effect for live preview
                }}
              />
              
              {/* Countdown Overlay */}
              {countdown !== null && countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-[200px] font-bold text-white"
                    style={{
                      textShadow: '0 0 40px rgba(236, 72, 153, 0.8)'
                    }}
                  >
                    {countdown}
                  </motion.div>
                </motion.div>
              )}
              
              {/* Flash effect */}
              {countdown === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-white"
                />
              )}
            </div>

            {/* Thumbnails */}
            {capturedPhotos.length > 0 && (
              <div className="flex gap-2 justify-center">
                {capturedPhotos.map((photo, i) => (
                  <img key={i} src={photo} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-xl border-2 border-green-500" />
                ))}
              </div>
            )}

            {/* Simple buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={takePhoto}
                disabled={isCountingDown || isSaving}
                className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '💾 Saving...' : isCountingDown ? '📸 Taking Photo...' : `📸 Take Photo ${capturedPhotos.length + 1}`}
              </button>
              <button
                onClick={() => {
                  if (stream) stream.getTracks().forEach(track => track.stop())
                  setCapturedPhotos([])
                  setStep('select')
                  setCountdown(null)
                  setIsCountingDown(false)
                }}
                disabled={isCountingDown || isSaving}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/home" className="text-white/70 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Success Modal - Simple & Modern */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                Photo Saved! ✨
              </motion.h2>
              
              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-6"
              >
                Your memory has been saved to the gallery
              </motion.p>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  📸 Take Another Photo
                </button>
                <Link
                  href="/memories"
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-all duration-300 text-center"
                >
                  🖼️ Go to Gallery
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}
