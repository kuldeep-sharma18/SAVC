import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Twitter, Facebook } from 'lucide-react';

export const ShareModal = ({
  isOpen,
  onClose,
  video,
  onTrackShare,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      await onTrackShare(video.id, 'copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handlePlatformShare = async (platform, url) => {
    await onTrackShare(video.id, platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      action: () =>
        handlePlatformShare(
          'whatsapp',
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Check out this reel "${video.title}": ${shareUrl}`
          )}`
        ),
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
      action: () =>
        handlePlatformShare(
          'twitter',
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Check out "${video.title}" on Socially Approved Carousel!`
          )}&url=${encodeURIComponent(shareUrl)}`
        ),
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
      action: () =>
        handlePlatformShare(
          'facebook',
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-100 text-base">Share Reel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview banner */}
        <div className="flex items-center space-x-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-5">
          <video
            src={video.videoUrl}
            muted
            playsInline
            className="w-12 h-16 rounded-lg object-cover bg-slate-800"
          />
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              Shared Video
            </h4>
            <p className="text-[10px] text-rose-400 mt-1">
              {video.sharesCount} total shares
            </p>
          </div>
        </div>

        {/* Share buttons grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.name}
                onClick={opt.action}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${opt.color}`}
              >
                <Icon className="w-5 h-5 mb-1.5" />
                <span className="text-[11px] font-medium">{opt.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copy Link Input Bar */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-24 py-2.5 text-xs text-slate-400 select-all"
          />
          <button
            onClick={handleCopyLink}
            className="absolute right-1 top-1 bottom-1 px-3 bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs rounded-lg transition-all flex items-center space-x-1 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
