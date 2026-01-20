// src/components/NexachainVideo.tsx
"use client"

import { useState } from "react"
import { Play, Volume2, VolumeX, Maximize } from "lucide-react"
import { motion } from "framer-motion"

interface NexachainVideoProps {
  title?: string
  description?: string
}

export default function NexachainVideo({ title, description }: NexachainVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handlePlayPause = () => {
    const video = document.getElementById("nexachain-video") as HTMLVideoElement
    if (video) {
      if (video.paused) {
        video.play()
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleMuteToggle = () => {
    const video = document.getElementById("nexachain-video") as HTMLVideoElement
    if (video) {
      video.muted = !video.muted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = () => {
    const video = document.getElementById("nexachain-video") as HTMLVideoElement
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {title && (
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-3">{title}</h2>
          {description && <p className="text-lg text-[#4A4A4A] dark:text-[#B8B8B8]">{description}</p>}
        </div>
      )}

      <div className="relative group rounded-2xl overflow-hidden border-4 border-[#D4AF37]/30 shadow-2xl hover:border-[#D4AF37] transition-all">
        {/* Video Element */}
        <video
          id="nexachain-video"
          className="w-full aspect-video object-cover bg-black"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          poster="/videos/nexachain-thumbnail.jpg"
          controls={false}
        >
          <source src="/videos/nexachain-intro.mp4" type="video/mp4" />
          <source src="/videos/nexachain-intro.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Custom Play Button Overlay */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            onClick={handlePlayPause}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-2xl"
            >
              <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-2" fill="white" />
            </motion.div>
          </motion.div>
        )}

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-white rounded" />
                    <div className="w-1 h-4 bg-white rounded" />
                  </div>
                ) : (
                  <Play className="w-5 h-5 text-white ml-1" fill="white" />
                )}
              </button>

              <button
                onClick={handleMuteToggle}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <button
              onClick={handleFullscreen}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              aria-label="Fullscreen"
            >
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Fallback Message */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] opacity-0 pointer-events-none">
          <div className="text-center text-white p-6">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-xl font-semibold mb-2">Video Coming Soon</p>
            <p className="text-sm text-[#B8B8B8]">
              We're preparing an exciting introduction video for you.
              <br />
              Check back soon!
            </p>
          </div>
        </div>
      </div>

      {/* Video Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#D4AF37]/20">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1">Easy to Understand</p>
          <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Clear explanation of our platform</p>
        </div>
        <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#D4AF37]/20">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1">Quick Overview</p>
          <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">Learn in just a few minutes</p>
        </div>
        <div className="p-4 bg-white dark:bg-[#1A1A1A] rounded-lg border border-[#D4AF37]/20">
          <div className="text-2xl mb-2">💎</div>
          <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1">Professional Quality</p>
          <p className="text-xs text-[#4A4A4A] dark:text-[#B8B8B8]">High-quality production</p>
        </div>
      </div>
    </motion.div>
  )
}
