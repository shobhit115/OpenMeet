import React, { useState } from "react";

export default function ControlBar({
    audioState,
    videoState,
    screenState,
    audioAvailable,
    videoAvailable,
    screenAvailable,
    unreadCount,
    participantsCount = 1,
    toggleAudio,
    toggleVideo,
    handleScreenShare,
    isDrawerOpen,
    activeTab,
    toggleChatTab,
    togglePeopleTab,
    leaveMeeting,
    meetingUrl 
}) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        // Fallback to window.location.href if meetingUrl isn't provided
        const urlToCopy = meetingUrl || window.location.href;
        try {
            await navigator.clipboard.writeText(urlToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
    };

    return (
        <div className="w-full bg-gray-950/85 backdrop-blur-xl border-t border-gray-800/60 p-3 sm:px-6 flex items-center justify-between z-50 transition-all">
            
            {/* LEFT: Meeting Info & Copy Link (Hidden on very small screens) */}
            <div className="hidden md:flex items-center gap-4 w-1/3">
                <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm tracking-wide">OpenMeet</span>
                </div>
                
                <div className="h-5 w-px bg-gray-700/50"></div>
                
                <button
                    onClick={handleCopyLink}
                    title="Copy Meeting Link"
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 text-xs font-medium ${
                        copied 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                    }`}
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>Copy Link</span>
                        </>
                    )}
                </button>
            </div>

            {/* CENTER: Core Media Controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full md:w-1/3">
                <button 
                    onClick={toggleAudio} 
                    disabled={!audioAvailable}
                    title={audioState ? "Mute Microphone" : "Unmute Microphone"}
                    className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        audioState && audioAvailable 
                            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {audioState && audioAvailable ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    )}
                </button>

                <button 
                    onClick={toggleVideo} 
                    disabled={!videoAvailable}
                    title={videoState ? "Turn Off Camera" : "Turn On Camera"}
                    className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                        videoState && videoAvailable 
                            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {videoState && videoAvailable ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    )}
                </button>

                {screenAvailable && (
                    <button 
                        onClick={handleScreenShare} 
                        title={screenState ? "Stop Presenting" : "Present Screen"}
                        className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                            screenState 
                                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                )}

                <button 
                    onClick={leaveMeeting} 
                    title="Leave Call"
                    className="px-4 py-3 sm:px-6 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg shadow-red-600/20 sm:ml-2"
                >
                    <svg className="w-5 h-5 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    <span className="hidden sm:inline font-medium text-sm">Leave</span>
                </button>
            </div>

            {/* RIGHT: Utilities & Mobile Copy Link */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-auto md:w-1/3">
                
                {/* Mobile Quick Copy (Only visible on small screens) */}
                <button
                    onClick={handleCopyLink}
                    title="Copy Meeting Link"
                    className={`md:hidden p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                        copied 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                >
                    {copied ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    )}
                </button>

                <button 
                    onClick={togglePeopleTab} 
                    title="Participants"
                    className={`relative p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isDrawerOpen && activeTab === 'people'
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {participantsCount > 1 && (
                        <span className="absolute 2 top-1.5 right-1.5 transform translate-x-1/2 -translate-y-1/2 bg-gray-700 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full outline outline-2 outline-gray-950">
                            {participantsCount}
                        </span>
                    )}
                </button>

                <button 
                    onClick={toggleChatTab} 
                    title="In-call Chat"
                    className={`relative p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                        isDrawerOpen && activeTab === 'chat'
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full outline outline-2 outline-gray-950 animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </div>
            
        </div>
    );
}