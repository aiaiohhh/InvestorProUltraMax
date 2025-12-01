'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Video {
  id: string;
  title: string;
  description: string;
  src: string;
  thumbnail: string;
  duration?: string;
}

const videos: Video[] = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'See how easy it is to track your entire portfolio at a glance',
    src: '/videos/dashboard-overview.mp4',
    thumbnail: '/videos/thumbnails/dashboard-overview.jpg',
    duration: '2:15',
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Discover how our AI analyzes market patterns and predicts trends',
    src: '/videos/ai-insights.mp4',
    thumbnail: '/videos/thumbnails/ai-insights.jpg',
    duration: '1:45',
  },
  {
    id: 'fair-value',
    title: 'Fair Value Analysis',
    description: 'Learn how we calculate intrinsic value for smarter investment decisions',
    src: '/videos/fair-value.mp4',
    thumbnail: '/videos/thumbnails/fair-value.jpg',
    duration: '2:30',
  },
  {
    id: 'real-time-alerts',
    title: 'Real-Time Alerts',
    description: 'Never miss an opportunity with instant price and market alerts',
    src: '/videos/real-time-alerts.mp4',
    thumbnail: '/videos/thumbnails/real-time-alerts.jpg',
    duration: '1:20',
  },
  {
    id: 'portfolio-analytics',
    title: 'Advanced Analytics',
    description: 'Deep dive into your portfolio performance with professional-grade tools',
    src: '/videos/portfolio-analytics.mp4',
    thumbnail: '/videos/thumbnails/portfolio-analytics.jpg',
    duration: '2:00',
  },
];

export function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentVideo = videos[selectedVideo];

  // Auto-play when video changes
  useEffect(() => {
    if (videoRef.current) {
      setVideoError(false);
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Auto-play may be blocked by browser
          setIsPlaying(false);
        });
      }
    }
  }, [selectedVideo, isPlaying]);

  // Handle video errors
  const handleVideoError = () => {
    setVideoError(true);
    setIsPlaying(false);
  };

  // Handle video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [selectedVideo]);

  // Handle controls visibility
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowControls(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      setShowControls(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
    setShowControls(true);
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const selectVideo = (index: number) => {
    setSelectedVideo(index);
    setIsPlaying(false);
    setProgress(0);
    setShowControls(true);
  };

  const nextVideo = () => {
    selectVideo((selectedVideo + 1) % videos.length);
  };

  const prevVideo = () => {
    selectVideo((selectedVideo - 1 + videos.length) % videos.length);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    videoRef.current.currentTime = percent * videoRef.current.duration;
    setShowControls(true);
  };

  return (
    <div className="w-full">
      {/* Main Video Player */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-midnight-500/50 shadow-2xl shadow-electric-cyan/10 bg-midnight-900"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="relative aspect-video bg-midnight-900">
          {/* Video Element */}
          {!videoError ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={currentVideo.src}
              poster={currentVideo.thumbnail}
              muted={isMuted}
              loop
              playsInline
              onClick={handleVideoClick}
              onError={handleVideoError}
            />
          ) : (
            /* Animated Placeholder when video is missing */
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-midnight-800 via-midnight-900 to-midnight-800">
                {/* Animated Grid */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-px h-full bg-electric-cyan"
                      style={{ left: `${(i * 100) / 20}%` }}
                      animate={{
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-px w-full bg-electric-cyan"
                      style={{ top: `${(i * 100) / 12}%` }}
                      animate={{
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Floating Elements */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-lg bg-electric-cyan/10 border border-electric-cyan/20"
                    style={{
                      width: `${40 + Math.random() * 60}px`,
                      height: `${40 + Math.random() * 60}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}

                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-electric-cyan/20 to-electric-purple/20 border-2 border-electric-cyan/30 flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-12 h-12 text-electric-cyan" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{currentVideo.title}</h3>
                  <p className="text-white/60 text-center max-w-md px-4">{currentVideo.description}</p>
                  <p className="text-sm text-white/40 mt-4">
                    Video coming soon - Add your video file to <code className="text-electric-cyan/60">public/videos/{currentVideo.id}.mp4</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent pointer-events-none" />

          {/* Video Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {/* Play/Pause Button */}
                <button
                  onClick={handleVideoClick}
                  className="pointer-events-auto w-20 h-20 rounded-full bg-electric-cyan/20 backdrop-blur-md border-2 border-electric-cyan/50 flex items-center justify-center hover:bg-electric-cyan/30 transition-all hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-electric-cyan ml-1" />
                  ) : (
                    <Play className="w-8 h-8 text-electric-cyan ml-1" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Controls Bar */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-midnight-900/95 to-transparent pointer-events-auto"
              >
                {/* Progress Bar */}
                <div
                  className="h-1.5 bg-midnight-700 rounded-full mb-3 cursor-pointer group"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-electric-cyan rounded-full transition-all group-hover:bg-electric-green"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <div className="text-sm text-white/70 font-mono">
                      {currentVideo.duration}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevVideo}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="text-xs text-white/50">
                      {selectedVideo + 1} / {videos.length}
                    </div>
                    <button
                      onClick={nextVideo}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Title Overlay */}
          <div className="absolute top-4 left-4 right-4 pointer-events-none">
            <motion.div
              key={currentVideo.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-midnight-900/80 backdrop-blur-md rounded-lg p-3 border border-midnight-500/50"
            >
              <h3 className="font-semibold text-white mb-1">{currentVideo.title}</h3>
              <p className="text-sm text-white/60">{currentVideo.description}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Thumbnail Selector */}
      <div className="mt-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-midnight-500 scrollbar-track-midnight-800">
          {videos.map((video, index) => (
            <motion.button
              key={video.id}
              onClick={() => selectVideo(index)}
              className={clsx(
                'flex-shrink-0 relative rounded-xl overflow-hidden border-2 transition-all group',
                index === selectedVideo
                  ? 'border-electric-cyan scale-105 shadow-lg shadow-electric-cyan/20'
                  : 'border-midnight-500/50 hover:border-midnight-500'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-32 h-20 bg-midnight-800">
                {/* Thumbnail Placeholder - Replace with actual thumbnail images */}
                <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/20 to-electric-purple/20 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white/40" />
                </div>
                
                {/* Selected Indicator */}
                {index === selectedVideo && (
                  <div className="absolute inset-0 bg-electric-cyan/10" />
                )}

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-midnight-900/40 group-hover:bg-midnight-900/20 transition-colors">
                  <Play className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </div>

                {/* Video Title */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-midnight-900/90 to-transparent">
                  <p className="text-xs font-medium text-white truncate">{video.title}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-white/50">
          Click on any video thumbnail to watch, or use the navigation arrows
        </p>
      </div>
    </div>
  );
}

