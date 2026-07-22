import React, { useEffect, useRef } from "react";

export default function ChatDrawer({
    isDrawerOpen,
    setIsDrawerOpen,
    activeTab,
    setActiveTab,
    messages = [],
    username,
    messageInput,
    setMessageInput,
    sendMessage,
    remoteUsers = {},
    remoteStreams = [],
    audioState,
    videoState
}) {
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom whenever new messages arrive
    useEffect(() => {
        if (activeTab === "chat" && isDrawerOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, activeTab, isDrawerOpen]);

    if (!isDrawerOpen) return null;

    // Helper to get remote user stream status
    const getRemoteMediaStatus = (socketId) => {
        const peerObj = remoteStreams.find((s) => s.socketId === socketId);
        const stream = peerObj?.stream;

        if (!stream) return { hasAudio: false, hasVideo: false };

        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        return {
            hasAudio: audioTrack ? audioTrack.enabled && !audioTrack.muted : false,
            hasVideo: videoTrack ? videoTrack.enabled && !videoTrack.muted : false
        };
    };

    return (
        <div className="w-80 bg-gray-950 border-l border-gray-800/80 flex flex-col h-full absolute right-0 top-0 bottom-0 z-45 shadow-2xl backdrop-blur-xl transition-all duration-300">
            
            {/* Drawer Header with Tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-gray-900/50">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === "chat"
                                ? "bg-[var(--primary)] text-white shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab("people")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === "people"
                                ? "bg-[var(--primary)] text-white shadow-md"
                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                        }`}
                    >
                        People ({1 + Object.keys(remoteUsers).length})
                    </button>
                </div>

                {/* Close Drawer Button */}
                <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* TAB CONTENT: CHAT */}
            {activeTab === "chat" && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Messages Container */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs px-4">
                                <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>No messages yet. Send a message to start chatting with participants!</span>
                            </div>
                        ) : (
                           messages.map((msg, index) => {
    const isString = typeof msg === 'string';
    
    // Safely extract sender and content (Added msg.data here!)
    const msgSender = isString ? 'Someone' : (msg.sender || msg.username || 'Unknown');
    const content = isString ? msg : (msg.data || msg.text || msg.message || msg.content || msg.body || JSON.stringify(msg));
    
    const isMe = msgSender === username;

    return (
        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-medium text-gray-400">
                    {isMe ? "You" : msgSender}
                </span>
                <span className="text-[10px] text-gray-600">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <div className={`p-3 rounded-2xl text-xs max-w-[85%] break-words ${
                isMe 
                    ? 'bg-[var(--primary)] text-white rounded-tr-none' 
                    : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
            }`}>
                {content}
            </div>
        </div>
    );
})
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Message Input Form */}
                    <form onSubmit={sendMessage} className="p-3 border-t border-gray-800/80 bg-gray-900/30 flex gap-2">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Send a message to everyone..."
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary)] transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white px-3.5 py-2 rounded-xl transition-all flex items-center justify-center shadow-md"
                        >
                            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* TAB CONTENT: PEOPLE */}
            {activeTab === "people" && (
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        In call ({1 + Object.keys(remoteUsers).length})
                    </div>

                    {/* Local User Entry */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/60">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs">
                                {username ? username.charAt(0).toUpperCase() : "U"}
                            </div>
                            <span className="text-xs font-medium text-white truncate max-w-[120px]">
                                {username} <span className="text-gray-500">(You)</span>
                            </span>
                        </div>

                        {/* Local Mic & Camera State */}
                        <div className="flex items-center gap-2">
                            {/* Local Mic Icon */}
                            {audioState ? (
                                <svg className="w-4 h-4 text-emerald-400" title="Microphone On" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-rose-500" title="Microphone Off" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            )}

                            {/* Local Camera Icon */}
                            {videoState ? (
                                <svg className="w-4 h-4 text-emerald-400" title="Camera On" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-rose-500" title="Camera Off" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Remote Users Entries */}
                    {Object.entries(remoteUsers).map(([socketId, remoteUsername]) => {
                        const { hasAudio, hasVideo } = getRemoteMediaStatus(socketId);
                        return (
                            <div key={socketId} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center font-bold text-xs border border-gray-700">
                                        {remoteUsername ? remoteUsername.charAt(0).toUpperCase() : "G"}
                                    </div>
                                    <span className="text-xs font-medium text-white truncate max-w-[120px]">
                                        {remoteUsername || "Guest Participant"}
                                    </span>
                                </div>

                                {/* Remote User Mic & Camera State */}
                                <div className="flex items-center gap-2">
                                    {/* Remote Mic Icon */}
                                    {hasAudio ? (
                                        <svg className="w-4 h-4 text-emerald-400" title="Microphone On" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-rose-500" title="Microphone Off" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                        </svg>
                                    )}

                                    {/* Remote Camera Icon */}
                                    {hasVideo ? (
                                        <svg className="w-4 h-4 text-emerald-400" title="Camera On" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-rose-500" title="Camera Off" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}