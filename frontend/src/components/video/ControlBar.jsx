import React, { useState } from "react";

export default function ControlBar({
    audioState,
    videoState,
    screenState,
    audioAvailable,
    videoAvailable,
    screenAvailable,
    unreadCount,
    participantsCount = 1, // NEW: Defaults to 1 (just you)
    toggleAudio,
    toggleVideo,
    handleScreenShare,
    isDrawerOpen,          // NEW: Replaced isChatOpen
    activeTab,             // NEW: 'chat' or 'people' to highlight active button
    toggleChatTab,         // NEW: Function to open/close chat
    togglePeopleTab,       // NEW: Function to open/close people list
    leaveMeeting,
    meetingUrl 
}) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        const urlToCopy = meetingUrl || window.location.href;
        try {
            await navigator.clipboard.writeText(urlToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    return (
        <div className="bg-gray-950/90 backdrop-blur-md border-t border-gray-800/80 px-4 py-3 flex justify-between items-center shrink-0 z-50">
            
            {/* Left section: Meeting Brand & Quick Copy Link (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 text-gray-400 text-sm font-medium">
                <span className="text-white font-semibold">OpenMeet</span>
                <span className="text-gray-700">|</span>
                
                {/* Desktop Copy Link Pill */}
                <button
                    onClick={handleCopyLink}
                    title="Copy Meeting Link"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs font-medium ${
                        copied 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                            : 'bg-gray-900 border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white'
                    }`}
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Link Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy Link</span>
                        </>
                    )}
                </button>
            </div>

            {/* Center section: Media & Interaction Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mx-auto sm:mx-0">
                
                {/* Microphone Button */}
                <button 
                    onClick={toggleAudio} 
                    disabled={!audioAvailable}
                    title={audioState ? "Mute Microphone" : "Unmute Microphone"}
                    className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        audioState && audioAvailable 
                            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {audioState && audioAvailable ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </button>

                {/* Camera Button */}
                <button 
                    onClick={toggleVideo} 
                    disabled={!videoAvailable}
                    title={videoState ? "Turn Off Camera" : "Turn On Camera"}
                    className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        videoState && videoAvailable 
                            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {videoState && videoAvailable ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    )}
                </button>

                {/* Screen Share Button */}
                {screenAvailable && (
                    <button 
                        onClick={handleScreenShare} 
                        title={screenState ? "Stop Presenting" : "Present Screen"}
                        className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                            screenState 
                                ? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-lg shadow-[var(--primary)]/30' 
                                : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </button>
                )}

                {/* Mobile / Quick Share Link Button */}
                <button
                    onClick={handleCopyLink}
                    title="Share Meeting Link"
                    className={`p-3.5 rounded-full transition-all duration-200 flex items-center justify-center sm:hidden ${
                        copied 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                >
                    {copied ? (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    )}
                </button>

                {/* NEW: People / Participants Toggle Button */}
                <button 
                    onClick={togglePeopleTab} 
                    title="Show Everyone"
                    className={`relative p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isDrawerOpen && activeTab === 'people'
                            ? 'bg-[var(--primary)] text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-gray-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-gray-950">
                        {participantsCount}
                    </span>
                </button>

                {/* Chat Panel Toggle Button */}
                <button 
                    onClick={toggleChatTab} 
                    title="In-call Chat"
                    className={`relative p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isDrawerOpen && activeTab === 'chat'
                            ? 'bg-[var(--primary)] text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-gray-950 animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {/* Leave / End Call Button */}
                <button 
                    onClick={leaveMeeting} 
                    title="Leave Call"
                    className="px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-600/30 ml-2"
                >
                    <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span className="hidden md:inline font-semibold text-sm">Leave</span>
                </button>
            </div>

            {/* Right section: Spacer to align center section */}
            <div className="hidden sm:block w-36"></div>
        </div>
    );
}