import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Adjust the import path if necessary

export default function LobbyScreen({ 
    lobbyVideoRef, 
    videoAvailable, 
    audioAvailable, 
    videoState, 
    audioState, 
    toggleAudio, 
    toggleVideo, 
    username, 
    setUsername, 
    connectToMeeting 
}) {
    const { userData } = useAuth();

    // Pre-fill the username if the user is logged in
    useEffect(() => {
        if (!username) {
            if (userData?.name) {
                setUsername(userData.name);
            } else if (userData?.username) {
                setUsername(userData.username);
            } else {
                // Fallback to localStorage in case context is lost on page reload
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        setUsername(parsed.name || parsed.username || "");
                    } catch (e) {
                        console.error("Error parsing user from local storage", e);
                    }
                }
            }
        }
    }, [userData, setUsername, username]);

    // Helper to determine if we should show the video feed
    const showVideo = videoAvailable && videoState;

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--text)] w-full min-h-[80vh]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full max-w-6xl mx-auto">
                
                {/* Left Column: Video Preview Box (Google Meet Style) */}
                <div className="lg:col-span-8 flex flex-col items-center w-full">
                    <div className="relative w-full aspect-video bg-[#202124] rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center group">
                        
                        {/* 
                          The video element must ALWAYS remain in the DOM. 
                          We use the 'hidden' tailwind class to hide it when the camera is off.
                        */}
                        <video 
                            ref={lobbyVideoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className={`w-full h-full object-cover transform scale-x-[-1] ${!showVideo ? 'hidden' : ''}`} 
                        />
                        
                        {/* Placeholder - Only shows when video is off */}
                        {!showVideo && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <div className="w-24 h-24 rounded-full bg-[#3c4043] flex items-center justify-center text-4xl font-normal text-white shadow-inner">
                                    {username ? username.charAt(0).toUpperCase() : "?"}
                                </div>
                                <p className="text-white text-sm tracking-wide">Camera is off</p>
                            </div>
                        )}

                        {/* Floating Media Controls Overlay */}
                        <div className="absolute bottom-6 flex items-center gap-4">
                            {/* Microphone Toggle */}
                            <button 
                                onClick={toggleAudio} 
                                disabled={!audioAvailable}
                                title={audioState ? "Turn off microphone" : "Turn on microphone"}
                                className={`p-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                                    audioState && audioAvailable 
                                        ? 'bg-[#3c4043] hover:bg-[#4a4d51] text-white border border-transparent' 
                                        : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-md border border-transparent'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                                {audioState && audioAvailable ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                )}
                            </button>

                            {/* Camera Toggle */}
                            <button 
                                onClick={toggleVideo} 
                                disabled={!videoAvailable}
                                title={videoState ? "Turn off camera" : "Turn on camera"}
                                className={`p-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                                    videoState && videoAvailable 
                                        ? 'bg-[#3c4043] hover:bg-[#4a4d51] text-white border border-transparent' 
                                        : 'bg-[#ea4335] hover:bg-[#d93025] text-white shadow-md border border-transparent'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                                {videoState && videoAvailable ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Join Controls */}
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left gap-8 px-4">
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-normal tracking-tight mb-3">Ready to join?</h2>
                        <p className="text-gray-500 text-base leading-relaxed">
                            Configure your display name and check your video output before entering the room.
                        </p>
                    </div>

                    <div className="w-full space-y-5">
                        <div className="flex flex-col gap-2 text-left w-full">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3.5 bg-[var(--bg)] border border-gray-300 dark:border-gray-700 text-[var(--text)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition shadow-sm"
                                onKeyDown={(e) => e.key === 'Enter' && connectToMeeting()}
                            />
                        </div>

                        <button 
                            onClick={connectToMeeting} 
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3.5 rounded-full font-medium text-base transition shadow-md flex items-center justify-center gap-2"
                        >
                            <span>Join Now</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}