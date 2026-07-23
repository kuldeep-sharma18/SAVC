import React, { useState, useEffect, useMemo } from 'react';
import { OuterSlider } from './components/OuterSlider';
import { InnerSliderModal } from './components/InnerSliderModal';
import { RefreshCw } from 'lucide-react';
import { INITIAL_VIDEOS } from './data/videosData';

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

  // Fetch videos from backend, fall back to bundled data if unavailable
  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      // Backend unavailable (e.g. static hosting) — use bundled data
      console.info('Backend unavailable, using bundled data:', err.message);
      setVideos(JSON.parse(JSON.stringify(INITIAL_VIDEOS)));
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
      if (!res.ok) return; // backend unavailable, keep optimistic state
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
    } catch {
      // Backend unavailable — optimistic update already applied, nothing to do
    }
  };

  // 2. Add Comment
  const handleAddComment = async (videoId, text) => {
    // Optimistic local comment so UI feels instant
    const tempComment = {
      id: `c-local-${Date.now()}`,
      author: 'John',
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyh9ZR7j2Oi5JHGSIe2mt2cgeVlwQb4mXg3kXIaPgEJQ&s=10',
      text: text.trim(),
      timestamp: 'Just now',
      likes: 0,
    };
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const comments = [tempComment, ...v.comments];
        return { ...v, comments, commentsCount: comments.length };
      })
    );

    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, author: 'John', text }),
      });
      if (!res.ok) return; // backend unavailable, optimistic comment stays
      const data = await res.json();
      if (data.success) {
        // Replace temp comment with server comment
        setVideos((prev) =>
          prev.map((v) => {
            if (v.id !== videoId) return v;
            const comments = [data.comment, ...v.comments.filter((c) => c.id !== tempComment.id)];
            return { ...v, comments, commentsCount: data.commentsCount };
          })
        );
      }
    } catch {
      // Backend unavailable — optimistic comment already shown
    }
  };

  // 3. Share Video
  const handleTrackShare = async (videoId, platform) => {
    // Optimistic shares count increment
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, sharesCount: v.sharesCount + 1 } : v))
    );

    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, platform }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, sharesCount: data.sharesCount } : v
          )
        );
      }
    } catch {
      // Backend unavailable — optimistic count already applied
    }
  };

  // Select video from outer slider or grid
  const handleSelectVideo = (_video, index) => {
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

        {/* Error State - only shown if bundled data also fails */}
        {error && (
          <div className="my-8 mx-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center text-sm">
            <p>{error}</p>
            <button
              onClick={fetchVideos}
              className="mt-2 px-4 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg"
            >
              Retry
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
