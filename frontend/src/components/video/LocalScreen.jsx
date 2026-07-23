import React from "react";

export default function LocalScreen({ localScreenStream, isPinned, onPin }) {
    if (!localScreenStream) return null;

    return (
        <div 
            className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center w-full h-full group transition-all duration-300 cursor-pointer ${
                isPinned ? 'border-2 border-blue-500' : 'border border-gray-800'
            }`} 
            onClick={onPin}
        >
            <video 
                ref={video => { if (video && video.srcObject !== localScreenStream) video.srcObject = localScreenStream; }} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-contain" 
            />
            <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-[5] shadow-md">
                <span className="truncate max-w-[140px]">Your Presentation</span>
            </div>
        </div>
    );
}