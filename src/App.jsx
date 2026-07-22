import React, { useState, useEffect, useMemo } from 'react';
import { OuterSlider } from './components/OuterSlider';
import { InnerSliderModal } from './components/InnerSliderModal';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  // Inner Slider Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Fetch videos from backend
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setError('Failed to load videos catalog');
      }
    } catch (err) {
      console.error('Error fetching videos', err);
      setError('Could not connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filtered videos based on search query
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.author.name.toLowerCase().includes(q) ||
        v.author.handle.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [videos, searchQuery]);

  // Handlers for Backend Interactions
  // 1. Like Video
  const handleLikeVideo = async (videoId) => {
    // Optimistic UI update
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const userLiked = !v.userLiked;
          const likesCount = userLiked ? v.likesCount + 1 : Math.max(0, v.likesCount - 1);
          return { ...v, userLiked, likesCount };
        }
        return v;
      })
    );

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, likesCount: data.likesCount, userLiked: data.userLiked }
              : v
          )
        );
      }
    } catch (err) {
      console.error('Like API error', err);
    }
  };

  // 2. Add Comment
  const handleAddComment = async (videoId, text) => {
    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, author: 'John', text }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => {
            if (v.id === videoId) {
              return {
                ...v,
                comments: [data.comment, ...v.comments],
                commentsCount: data.commentsCount,
              };
            }
            return v;
          })
        );
      }
    } catch (err) {
      console.error('Comment API error', err);
    }
  };

  // 3. Share Video
  const handleTrackShare = async (videoId, platform) => {
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, platform }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, sharesCount: data.sharesCount } : v
          )
        );
      }
    } catch (err) {
      console.error('Share API error', err);
    }
  };

  // Select video from outer slider or grid
  const handleSelectVideo = (video, index) => {
    setActiveVideoIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 sm:px-8 max-w-7xl w-full mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
          Socially Approved Carousel
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full h-72 mx-auto pb-16 flex flex-col items-center justify-center">
        
        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="my-8 mx-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center text-sm">
            <p>{error}</p>
            <button
              onClick={fetchVideos}
              className="mt-2 px-4 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Outer Slider Section (4-video grid & carousel like driptrip.in) */}
        {!isLoading && filteredVideos.length > 0 && (
          <OuterSlider
            videos={filteredVideos}
            onSelectVideo={handleSelectVideo}
            isMuted={isMuted}
          />
        )}

        {/* Empty state when query matches nothing */}
        {!isLoading && filteredVideos.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm font-medium">
              No reels found matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-rose-400 hover:underline font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* Inner Slider Modal (3-Video Carousel, Controls, Likes, Comments, Share) */}
      <InnerSliderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videos={filteredVideos}
        initialIndex={activeVideoIndex}
        onLikeVideo={handleLikeVideo}
        onAddComment={handleAddComment}
        onTrackShare={handleTrackShare}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
      />
    </div>
  );
}
