import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export const ProductCarousel = ({ images, videos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    // Combine images and videos into a single media array
    const mediaItems = [
        ...(videos || []).map(v => ({ type: 'video', url: v.video_path || v })),
        ...(images || []).map(i => ({ type: 'image', url: i.image_path || i }))
    ];

    const isVideo = (item) => item?.type === 'video';

    useEffect(() => {
        // Pause video if we navigate away from a video slide
        if (videoRef.current && !isVideo(mediaItems[currentIndex])) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [currentIndex, mediaItems]);

    const goNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    if (mediaItems.length === 0) {
        return (
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-xl">
                <span className="text-gray-400">No media available</span>
            </div>
        );
    }

    const currentMedia = mediaItems[currentIndex];

    return (
        <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden group">
            {/* Main Media Display */}
            <div className="absolute inset-0 flex items-center justify-center">
                {currentMedia.type === 'video' ? (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            src={`${import.meta.env.VITE_BASE_URL || ''}${currentMedia.url}`}
                            className="w-full h-full object-cover"
                            loop
                            muted={isMuted}
                            playsInline
                            onClick={togglePlay}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-4 right-4 flex space-x-2">
                            <button
                                onClick={toggleMute}
                                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <button
                                onClick={togglePlay}
                                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <img
                        src={`${import.meta.env.VITE_BASE_URL || ''}${currentMedia.url}`}
                        alt={`Product representation ${currentIndex + 1}`}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Navigation Arrows (only show if multiple items) */}
            {mediaItems.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Indicator Dots */}
            {mediaItems.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {mediaItems.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
