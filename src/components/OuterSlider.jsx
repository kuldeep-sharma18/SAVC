import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';

export const OuterSlider = ({
  videos,
  onSelectVideo,
  isMuted,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4; // Exactly 4 videos grid/carousel like Driptrip.in

  // Reset page when video count changes
  useEffect(() => {
    setCurrentPage(0);
  }, [videos.length]);

  const totalPages = Math.ceil(videos.length / itemsPerPage) || 1;

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Extract the current 4 videos for the active page
  const startIndex = currentPage * itemsPerPage;
  const visibleVideos = videos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="relative my-8 px-4 lg:px-8 max-w-6xl mx-auto w-full flex flex-col items-center justify-center">
      {/* 4 Videos Grid Container with Sleek Side Navigation */}
      <div className="relative group my-4 w-full max-w-5xl mx-auto flex items-center justify-center">
        {/* Previous Page Floating Button */}
        {totalPages > 1 && (
          <button
            onClick={handlePrevPage}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/90 border border-slate-700/80 text-white shadow-2xl hover:bg-rose-500 hover:border-rose-400 transition-all transform hover:scale-110 active:scale-95 backdrop-blur-md"
            title="Previous 4 videos"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* 4 Videos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 transition-all duration-300 w-full justify-center items-center">
          {visibleVideos.map((video, pageOffset) => {
            const globalIndex = startIndex + pageOffset;
            return (
              <VideoCard
                key={video.id}
                video={video}
                index={globalIndex}
                onClick={() => onSelectVideo(video, globalIndex)}
                isMuted={isMuted}
              />
            );
          })}
        </div>

        {/* Next Page Floating Button */}
        {totalPages > 1 && (
          <button
            onClick={handleNextPage}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-slate-900/90 border border-slate-700/80 text-white shadow-2xl hover:bg-rose-500 hover:border-rose-400 transition-all transform hover:scale-110 active:scale-95 backdrop-blur-md"
            title="Next 4 videos"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Pagination Indicators / Dots Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`transition-all duration-300 rounded-full ${
                currentPage === idx
                  ? 'w-8 h-2.5 bg-rose-500 shadow-md shadow-rose-500/30'
                  : 'w-2.5 h-2.5 bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const VideoCard = ({
  video,
  onClick,
  isMuted,
}) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(video.videoUrl || FALLBACK_VIDEO);
  const [hasError, setHasError] = useState(false);

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

  // IntersectionObserver to ensure video resources load lazily only when entering viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPreviewSrc(video.videoUrl || FALLBACK_VIDEO);
    setHasError(false);
  }, [video.videoUrl]);

  const handlePreviewError = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (previewSrc !== FALLBACK_VIDEO) {
      setPreviewSrc(FALLBACK_VIDEO);
    } else {
      setHasError(true);
    }
  };

  // Ensure DOM muted property is synced for preview videos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isHovered]);

  // Ensure video plays when card is in view
  useEffect(() => {
    if (isInView && videoRef.current && !hasError) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isInView, hasError]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group cursor-pointer relative transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 group-hover:border-slate-600 shadow-xl transition-all duration-300">
        
        {/* Directly render video, iframe, or gif element */}
        {!hasError ? (
          getYouTubeEmbedUrl(previewSrc) ? (
            <iframe
              src={getYouTubeEmbedUrl(previewSrc, true, true)}
              title="YouTube Video"
              className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : isImageOrGif(previewSrc) ? (
            <img
              src={previewSrc}
              alt={video.title || "Video"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <video
              ref={videoRef}
              src={previewSrc}
              muted={true}
              loop
              playsInline
              preload="auto"
              onError={handlePreviewError}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
            Video Unavailable
          </div>
        )}

        {/* Overlay Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-40 transition-opacity pointer-events-none" />

        {/* Play Icon Center Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:border-rose-400 text-white transition-all duration-300 shadow-xl">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
