import React from "react";

export default function LocalVideo({ 
    videoAvailable, 
    videoState, 
    localVideoRef, 
    username, 
    isPinned, 
    isSidebarItem, 
    onPin 
}) {
    const initial = username ? username.charAt(0).toUpperCase() : "U";

    return (
        <div 
            className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center w-full h-full group transition-all duration-300 cursor-pointer ${
                isPinned && !isSidebarItem ? 'border-2 border-blue-500' : 'border border-gray-800'
            }`} 
            onClick={onPin}
        >
            {videoAvailable && videoState ? (
                <video 
                    ref={localVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                />
            ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-white/10">
                        {initial}
                    </div>
                </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-[5] shadow-md">
                <span className="truncate max-w-[140px]">{username} (You)</span>
            </div>
        </div>
    );
}