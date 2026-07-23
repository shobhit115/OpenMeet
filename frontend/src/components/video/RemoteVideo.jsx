import React, { useEffect, useRef } from "react";
// Import your snackbar context (update the path if your structure is different)
import { useSnackbar } from "../../contexts/SnackbarContext"; 

export default function RemoteVideo({ stream, username, isPinned, onPin }) {
    const videoRef = useRef(null);
    const { showMessage } = useSnackbar(); // Hook to trigger notifications

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream || null;
        }
    }, [stream]);

    const initial = username ? username.charAt(0).toUpperCase() : "?";

    // Handle pin toggle and show snackbar message
    const handlePinToggle = () => {
        onPin(); // Call the original pin handler
        
        const displayName = username || "User";
        if (isPinned) {
            showMessage(`${displayName} unpinned`, "info");
        } else {
            showMessage(`${displayName} pinned to main screen`, "success");
        }
    };

    return (
        <div className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center w-full h-full group transition-all duration-300 ${
            isPinned ? 'border-2 border-blue-500' : 'border border-gray-800'
        }`}>

            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
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

            {/* Participant Name Badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2 z-[5] shadow-md">
                <span className="truncate max-w-[140px]">
                    {username || "Connecting..."}
                </span>
            </div>

            {/* Pin Button */}
            <div className={`absolute top-3 right-3 transition-opacity duration-200 flex items-center gap-2 z-[5] ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                    onClick={handlePinToggle}
                    title={isPinned ? "Unpin video" : "Pin video"}
                    className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors flex items-center justify-center w-9 h-9 ${
                        isPinned ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black/60 hover:bg-black/80 text-white'
                    }`}
                >
                    {isPinned ? (
                        /* Added w-5, h-5, and fill-current to fix the UI */
                        <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M11.77 1.16c-.81.81-.74 2.28.02 3.76L6.1 8.71c-2.17-1.46-4.12-2-4.94-1.18l4.95 4.95-4.95 6.36 6.36-4.95 4.95 4.95c.82-.82.27-2.77-1.19-4.94l3.8-5.69c1.47.76 2.94.84 3.76.02z" />
                        </svg>
                    ) : (
                        /* Added w-5, h-5, and fill-current to fix the UI */
                        <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                            <path d="M1472 1152q93 0 174.5 35t142.5 96 96 142.5 35 174.5-35 174.5-96 142.5-142.5 96-174.5 35-174.5-35-142.5-96-96-142.5-35-174.5 35-174.5 96-142.5 142.5-96 174.5-35zm-320 448q0 66 25 124.5t68.5 102 102 68.5 124.5 25q47 0 92-13.5t84-39.5l-443-443q-26 39-39.5 84t-13.5 92zm587 176q26-39 39.5-84t13.5-92q0-66-25.5-124t-69-101.5-101.5-69-124-25.5q-47 0-92 13.5t-84 39.5zm251-1028q-33 33-64.5 60.5t-65 46.5-73 29.5T1698 895q-34 0-65-6l-134 135h-182l278-278 10 3q23 7 46 12.5t47 5.5q55 0 104-26l-495-495q-26 49-26 104 0 24 5.5 47t12.5 46l3 10-492 491q-24-10-46-19t-44-15-45.5-9.5T624 897q-57 0-111 16.5T413 962l483 483v182l-192-193-568 569-136 45 45-136 569-568-386-386 45-45q70-70 162-107t191-37q39 0 77.5 6.5T780 794l379-379q-6-31-6-65 0-49 10.5-88.5T1193 188t46.5-65.5T1300 58z"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}