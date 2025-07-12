import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { AudioPlayerProps } from '../types';

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onTimeUpdate }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            onTimeUpdate?.(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setError(null);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        const handleError = () => {
            setError('Failed to load audio file');
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [onTimeUpdate]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const downloadAudio = () => {
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'audio.mp3';
        a.click();
    };

    // Handle empty or invalid audio URLs
    if (!audioUrl || audioUrl.trim() === '') {
        return (
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Audio processing in progress...
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Please wait while we generate the audio response
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full">
                        <Volume2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Audio file not available
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border border-blue-200 dark:border-gray-600 shadow-sm">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <div className="flex items-center space-x-4">
                <button
                    onClick={togglePlayPause}
                    className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    {isPlaying ? (
                        <Pause className="h-5 w-5 text-white" />
                    ) : (
                        <Play className="h-5 w-5 text-white ml-0.5" />
                    )}
                </button>

                <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    <div
                        className="h-2 bg-gray-200 dark:bg-gray-500 rounded-full cursor-pointer hover:h-3 transition-all duration-200"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-150 shadow-sm"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-gray-200 dark:bg-gray-500 rounded-lg appearance-none cursor-pointer hover:h-2 transition-all duration-200"
                    />
                    <button
                        onClick={downloadAudio}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110"
                    >
                        <Download className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;