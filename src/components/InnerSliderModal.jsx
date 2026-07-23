import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Sparkles
} from 'lucide-react';
import { CommentDrawer } from './CommentDrawer';
import { ShareModal } from './ShareModal';

export const InnerSliderModal = ({
  isOpen,
  onClose,
  videos,
  initialIndex,
  onLikeVideo,
  onAddComment,
  onTrackShare,
  isMuted,
  onToggleMute,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Synchronize active index when modal opens or initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isCommentDrawerOpen) setIsCommentDrawerOpen(false);
        else if (isShareModalOpen) setIsShareModalOpen(false);
        else onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, isCommentDrawerOpen, isShareModalOpen]);

  if (!isOpen || videos.length === 0) return null;

  const currentVideo = videos[activeIndex] || videos[0];

  const goToPrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0));
  };

  // Determine the 3-video dynamic view range [prevIndex, activeIndex, nextIndex]
  const prevIndex = activeIndex > 0 ? activeIndex - 1 : videos.length - 1;
  const nextIndex = activeIndex < videos.length - 1 ? activeIndex + 1 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between overflow-hidden animate-fade-in select-none">
      
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between p-4 lg:px-8 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inner Slider</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {activeIndex + 1} of {videos.length}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-full border transition-all ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3-Video Horizontal Carousel View */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        
        {/* Navigation Arrow Left */}
        <button
          onClick={goToPrev}
          className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:bg-rose-500 hover:border-rose-400 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
          aria-label="Previous video"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* 3 Videos Carousel Layout Container */}
        <div className="w-full max-w-[1400px] h-full flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 px-2 sm:px-12">
          
          {/* Left Video Card (Prev) — full opacity, no hover fade */}
          <div
            onClick={goToPrev}
            className="hidden md:block relative w-[280px] lg:w-[320px] h-[75%] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 opacity-100 transition-all duration-300 transform scale-90 cursor-pointer shadow-xl hover:scale-95"
          >
            <SingleVideoPlayer
              video={videos[prevIndex]}
              isActive={false}
              isMuted={true}
            />
            <div className="absolute inset-0 bg-transparent pointer-events-none flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
                Prev Reel
              </span>
            </div>
          </div>

          {/* Center Active Video Card (Active Playing) */}
          <div className="relative w-full max-w-[400px] sm:max-w-[460px] lg:max-w-[520px] h-[92vh] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl shadow-rose-500/10 transition-all duration-500 z-20">
            <SingleVideoPlayer
              key={currentVideo.id}
              video={currentVideo}
              isActive={true}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              onLike={() => onLikeVideo(currentVideo.id)}
              onOpenComments={() => setIsCommentDrawerOpen(true)}
              onOpenShare={() => setIsShareModalOpen(true)}
            />
          </div>

          {/* Right Video Card (Next) — full opacity, no hover fade */}
          <div
            onClick={goToNext}
            className="hidden md:block relative w-[280px] lg:w-[320px] h-[75%] rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 opacity-100 transition-all duration-300 transform scale-90 cursor-pointer shadow-xl hover:scale-95"
          >
            <SingleVideoPlayer
              video={videos[nextIndex]}
              isActive={false}
              isMuted={true}
            />
            <div className="absolute inset-0 bg-transparent pointer-events-none flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700">
                Next Reel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:bg-rose-500 hover:border-rose-400 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
          aria-label="Next video"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Comment Drawer Modal */}
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        video={currentVideo}
        onAddComment={onAddComment}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        video={currentVideo}
        onTrackShare={onTrackShare}
      />
    </div>
  );
};

// Single Active Video Player Sub-Component with full player controls, loading spinner, scrubbable progress bar, and side action icons
const SingleVideoPlayer = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onLike,
  onOpenComments,
  onOpenShare,
}) => {
  const FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const progressBarRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState(video.videoUrl || FALLBACK_VIDEO);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 15);
  const [likePop, setLikePop] = useState(false);

  const sendYouTubeCommand = (func, args = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args,
          }),
          '*'
        );
      } catch (err) {
        console.warn('YouTube postMessage error:', err);
      }
    }
  };

  // Debounce showing the loading spinner to prevent brief flashes when videos play quickly
  useEffect(() => {
    let timer;
    if (isLoading && isActive) {
      timer = setTimeout(() => {
        setShowSpinner(true);
      }, 150);
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading, isActive]);

  // Synchronize muted property for both HTML5 video and YouTube iframe
  useEffect(() => {
    if (getYouTubeEmbedUrl(videoSrc)) {
      sendYouTubeCommand(isMuted ? 'mute' : 'unMute');
    } else if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, videoSrc]);

  // Control YouTube play/pause when isActive, isPlaying, or isMuted changes
  useEffect(() => {
    if (getYouTubeEmbedUrl(videoSrc)) {
      if (isActive && isPlaying) {
        sendYouTubeCommand('playVideo');
        sendYouTubeCommand(isMuted ? 'mute' : 'unMute');
      } else {
        sendYouTubeCommand('pauseVideo');
      }
    }
  }, [isActive, isPlaying, isMuted, videoSrc]);

  const isImageOrGif = (url) => {
    if (!url) return false;
    return url.endsWith('.gif') || url.includes('.gif') || url.includes('giphy.com');
  };

  const getYouTubeEmbedUrl = (url, autoplay = true, muted = true) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([^?&/#]+)/);
    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
    }
    return null;
  };

  useEffect(() => {
    if (isImageOrGif(videoSrc) || getYouTubeEmbedUrl(videoSrc)) {
      setIsLoading(false);
      setIsPlaying(isActive);
    }
  }, [videoSrc, isActive]);

  // Simulated progress timer for GIF/Image/YouTube media
  useEffect(() => {
    if ((!isImageOrGif(videoSrc) && !getYouTubeEmbedUrl(videoSrc)) || !isActive || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + 0.1;
        if (nextTime >= duration) {
          return 0;
        }
        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [videoSrc, isActive, isPlaying, duration]);

  useEffect(() => {
    setVideoSrc(video.videoUrl || FALLBACK_VIDEO);
    setHasError(false);
  }, [video.videoUrl, video.id]);

  const handleVideoError = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (videoSrc !== FALLBACK_VIDEO) {
      setVideoSrc(FALLBACK_VIDEO);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Play/pause management based on active state for HTML5 video
  useEffect(() => {
    if (isImageOrGif(videoSrc) || getYouTubeEmbedUrl(videoSrc)) return;
    if (!videoRef.current) return;

    if (isActive && !hasError) {
      videoRef.current.muted = isMuted;

      if (videoRef.current.readyState >= 2) {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Autoplay prevented or interrupted, retrying with muted video:', err);
            // Browser autoplay policy might reject unmuted play without prior user gesture
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(() => {
                  setIsPlaying(false);
                  setIsLoading(false);
                });
            } else {
              setIsPlaying(false);
              setIsLoading(false);
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [isActive, hasError, video.id, videoSrc, isMuted]);

  const togglePlay = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (isImageOrGif(videoSrc)) {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (getYouTubeEmbedUrl(videoSrc)) {
      setIsPlaying((prev) => {
        const nextState = !prev;
        sendYouTubeCommand(nextState ? 'playVideo' : 'pauseVideo');
        return nextState;
      });
      return;
    }

    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
      if (videoRef.current.currentTime > 0) {
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(pos * duration, duration));
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const triggerLike = () => {
    if (onLike) {
      onLike();
      setLikePop(true);
      setTimeout(() => setLikePop(false), 800);
    }
  };

  const formatTime = (timeInSec) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
      
      {/* Background fallback when video fails */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-center z-10">
          <p className="text-sm font-semibold text-slate-300">Video Unavailable</p>
          <p className="text-xs text-slate-500 mt-1">Unable to load media playback</p>
        </div>
      )}

      {/* Video, YouTube, or GIF element */}
      {!hasError && (
        getYouTubeEmbedUrl(videoSrc) ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <iframe
              ref={iframeRef}
              src={getYouTubeEmbedUrl(videoSrc, isActive && isPlaying, isMuted)}
              title={video.title || "YouTube Video"}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
            {/* Click overlay to toggle play or double click to like */}
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-10 cursor-pointer pointer-events-auto"
            />
          </div>
        ) : isImageOrGif(videoSrc) ? (
          <img
            src={videoSrc}
            alt={video.title || "Video"}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            onLoadStart={() => {
              if (videoRef.current && videoRef.current.readyState < 2 && isActive) {
                setIsLoading(true);
              }
            }}
            onTimeUpdate={handleTimeUpdate}
            onWaiting={() => {
              if (isActive && videoRef.current && videoRef.current.readyState < 3) {
                setIsLoading(true);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.readyState >= 2) {
                setIsLoading(false);
              }
            }}
            onLoadedData={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onCanPlayThrough={() => setIsLoading(false)}
            onPlay={() => setIsLoading(false)}
            onPlaying={() => setIsLoading(false)}
            onError={handleVideoError}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />
        )
      )}

      {/* Paused State Overlay Button */}
      {!isPlaying && isActive && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-slate-950/30 z-20 pointer-events-auto cursor-pointer group"
          aria-label="Play video"
        >
          <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-white fill-current ml-1" />
          </div>
        </button>
      )}

      {/* Loading Spinner - non-intrusive delayed indicator */}
      {showSpinner && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 pointer-events-none z-30 transition-opacity duration-200">
          <div className="relative w-10 h-10 flex items-center justify-center bg-slate-900/80 p-2 rounded-full shadow-lg border border-slate-700/50">
            <svg
              className="w-6 h-6 animate-spin text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {[...Array(12)].map((_, i) => (
                <rect
                  key={i}
                  x="11"
                  y="1.5"
                  width="2"
                  height="5"
                  rx="1"
                  fill="currentColor"
                  opacity={0.15 + (i / 12) * 0.85}
                  transform={`rotate(${i * 30} 12 12)`}
                />
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Heart Pop Animation on Like */}
      {likePop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-ping opacity-90" />
        </div>
      )}

      {/* Controls Overlay (Only on Active Video) */}
      {isActive && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 `bg-gradient-to-t` from-slate-950 via-transparent to-slate-950/40 pointer-events-none">
          
          {/* Top Bar Overlay */}
          <div className="flex items-center justify-end pointer-events-auto">
            {/* Quick Mute Toggle */}
            <button
              onClick={onToggleMute}
              className="p-2 rounded-full bg-slate-950/60 border border-white/10 text-white hover:bg-slate-900 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Side Action Bar (Likes, Comments, Shares) */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-4 pointer-events-auto z-20">
            
            {/* Like Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={triggerLike}
                className={`p-3 rounded-full border transition-all duration-300 transform active:scale-75 ${
                  video.userLiked
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                    : 'bg-slate-950/60 text-white border-white/10 hover:bg-slate-900'
                }`}
              >
                <Heart className={`w-6 h-6 ${video.userLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-xs font-bold text-white shadow-sm">
                {video.likesCount}
              </span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={onOpenComments}
                className="p-3 rounded-full bg-slate-950/60 text-white border border-white/10 hover:bg-slate-900 transition-all active:scale-90"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <span className="text-xs font-bold text-white shadow-sm">
                {video.commentsCount}
              </span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={onOpenShare}
                className="p-3 rounded-full bg-slate-950/60 text-white border border-white/10 hover:bg-slate-900 transition-all active:scale-90"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <span className="text-xs font-bold text-white shadow-sm">
                {video.sharesCount}
              </span>
            </div>
          </div>

          {/* Bottom Info & Progress Controls */}
          <div className="pointer-events-auto space-y-3">
            {/* Scrubbable Progress Bar & Duration Counter */}
            <div className="space-y-1">
              <div
                ref={progressBarRef}
                onClick={handleSeek}
                className="relative w-full h-2 bg-slate-800/80 hover:h-2.5 rounded-full cursor-pointer overflow-hidden transition-all group"
              >
                <div
                  className="h-full `bg-gradient-to-r` from-rose-500 to-pink-500 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-rose-400 font-sans font-bold flex items-center space-x-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </>
                  )
                }
                </button>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
