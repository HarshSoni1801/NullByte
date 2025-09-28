import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Clock } from 'lucide-react';

const VideoSolution = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const speedDropdownRef = useRef(null);
   const qualityDropdownRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showThumbnail, setShowThumbnail] = useState(true);

  // Don't show video player if no video URL
  if (!secureUrl) {
    return null;
  }
   useEffect(() => {
      const handleClickOutside = (event) => {
         // Close speed dropdown if clicked outside
         if (speedDropdownRef.current && !speedDropdownRef.current.contains(event.target)) {
            setShowSpeedDropdown(false);
         }
      };
   
      // Add event listener
      document.addEventListener('mousedown', handleClickOutside);
   
      // Cleanup
      return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);
 
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration || duration);
      setShowThumbnail(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => {
      setIsPlaying(true);
      setShowThumbnail(false);
    };
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [duration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * videoDuration;
    
    setCurrentTime(newTime);
    videoRef.current.currentTime = newTime;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-8  w-full mx-auto">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Solution Video
      </h3>
      
      <div ref={containerRef} className="w-[80%] mx-auto bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden shadow-lg group">
        <div className="relative aspect-video bg-black">
          {/* Thumbnail overlay */}
          {showThumbnail && thumbnailUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
              onClick={togglePlay}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={secureUrl}
            className="w-full h-full object-contain"
            preload="metadata"
          />
          
          {/* Video controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Progress bar */}
            <div 
              className="w-full h-2 bg-zinc-700 rounded-full mb-4 cursor-pointer relative hover:h-3 transition-all duration-200"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-sm" 
                style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
              ></div>
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${(currentTime / (videoDuration || 1)) * 100}%`, marginLeft: '-6px' }}
              ></div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePlay} 
                  className="text-white hover:text-red-400 transition-colors p-1"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-red-400 transition-colors p-1"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
               {/* Speed and Quality buttons */}
               <div className="flex items-center space-x-2">
                  {/* Speed button */}
                  <div className="relative" ref={speedDropdownRef}>
                     <button 
                        onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
                        className="text-white hover:text-red-400 transition-colors p-1 text-sm"
                     >
                        {playbackRate}x
                     </button>
                     {/* Speed dropdown here */}
                     {showSpeedDropdown && (
                        <div className="absolute bottom-10 right-0 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-xl p-3 w-24 z-10">
                           <div className="space-y-1">
                           {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                              <button
                                 key={rate}
                                 onClick={() => handlePlaybackRateChange(rate)}
                                 className={`block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-zinc-800 transition-colors ${
                                 playbackRate === rate ? 'text-red-400 bg-zinc-800' : 'text-white'
                                 }`}
                              >
                                 {rate}x
                              </button>
                           ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>

                
                <button 
                  onClick={toggleFullscreen} 
                  className="text-white hover:text-red-400 transition-colors p-1"
                >
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSolution;
