import React, { useEffect, useRef } from "react";

export default function RemoteVideo({ stream, username }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream || null;
        }
    }, [stream]);

    // Extract participant initial for placeholder avatar
    const initial = username ? username.charAt(0).toUpperCase() : "?";

    return (
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl flex items-center justify-center min-h-[240px] w-full aspect-video group transition-all duration-300 hover:border-gray-700">
            
            {stream ? (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                />
            ) : (
                /* Camera Off - Google Meet Style Avatar Placeholder */
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-[var(--primary)]/20 border-2 border-white/10">
                        {initial}
                    </div>
                    <span className="text-gray-400 text-xs font-medium tracking-wide">
                        Camera Off
                    </span>
                </div>
            )}
            
            {/* Bottom Left Badge: Participant Name */}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-10 shadow-md">
                <span className="truncate max-w-[140px]">
                    {username || "Connecting..."}
                </span>
            </div>

            {/* Subtle Hover Action Overlay (Google Meet Pin/Menu placeholder) */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 z-10">
                <button className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}