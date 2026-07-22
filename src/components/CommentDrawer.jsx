import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';

export const CommentDrawer = ({
  isOpen,
  onClose,
  video,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(video.id, commentText.trim());
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content panel */}
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-100 text-base">
              Comments ({video.commentsCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {video.comments && video.comments.length > 0 ? (
            video.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 items-start group">
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700 mt-0.5"
                />
                <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-200">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-4 text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className={`p-2.5 rounded-xl font-medium text-xs transition-all flex items-center justify-center ${
                commentText.trim() && !isSubmitting
                  ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
