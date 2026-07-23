import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSnackbar } from "../contexts/SnackbarContext";

export default function Home() {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const { showMessage } = useSnackbar();

    const [meetingCode, setMeetingCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem("token");
    const isAuthenticated = userData || token;

    // Adjust this to match your backend URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const generateMeetingCode = () => {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        let code = "";
        for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        code += "-";
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        code += "-";
        for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    };

    const handleCreateMeeting = async () => {
        if (!isAuthenticated) {
            showMessage("Only logged-in users can create a meeting. Please log in.", "error");
            navigate("/auth");
            return;
        }
        
        setIsLoading(true);
        const newCode = generateMeetingCode();

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/meetings/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    user_id: userData?._id || userData?.id, // Send user ID to backend
                    meetingCode: newCode 
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage("Meeting created successfully", "success");
                navigate(`/${data.meetingCode}`);
            } else {
                showMessage(data.error || "Failed to create meeting", "error");
            }
        } catch (error) {
            showMessage("Server error while creating meeting", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinMeeting = async (e) => {
        e.preventDefault();
        
        if (!meetingCode.trim()) {
            showMessage("Please enter a valid meeting code.", "error");
            return;
        }
        
        const code = meetingCode.replace(/^https?:\/\/[^\/]+\//, "").trim();
        setIsLoading(true);

        try {
            // Check if meeting exists in backend
            const response = await fetch(`${API_BASE_URL}/api/v1/meetings/join/${code}`);
            const data = await response.json();

            if (response.ok) {
                // Meeting exists, join it
                navigate(`/${code}`);
            } else {
                // 404 or other errors
                showMessage(data.error || "Meeting not found or invalid code.", "error");
            }
        } catch (error) {
            showMessage("Server error while joining meeting.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center max-w-7xl w-full mx-auto px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                
                {/* Left Column: Quick Actions */}
                <div className="flex flex-col gap-8 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                            Premium video meetings. <br />
                            Now open for everyone.
                        </h1>
                        <p className="text-gray-500 text-base md:text-lg mt-4 leading-relaxed">
                            We re-engineered OpenMeet to offer secure, high-definition video conferencing accessible on any device.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Create Meeting Button */}
                        <button 
                            onClick={handleCreateMeeting}
                            disabled={isLoading}
                            className={`flex items-center justify-center gap-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3.5 rounded-xl font-medium text-base transition shadow-md shadow-[var(--primary)]/20 w-full sm:w-auto shrink-0 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {isLoading ? "Loading..." : "New Meeting"}
                        </button>

                        {/* Join Input */}
                        <form onSubmit={handleJoinMeeting} className="flex items-center gap-2 w-full">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Enter a code or link" 
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-11 pr-4 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] w-full transition text-[var(--text)] placeholder-gray-400 disabled:opacity-50"
                                />
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={!meetingCode.trim() || isLoading}
                                className={`font-semibold px-5 py-3.5 rounded-xl transition ${
                                    meetingCode.trim() && !isLoading
                                    ? "text-[var(--primary)] hover:bg-[var(--card-bg)] cursor-pointer" 
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                Join
                            </button>
                        </form>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-sm text-gray-500">
                        <span>Need help? </span>
                        <a href="#" className="text-[var(--primary)] hover:underline font-medium">Learn more</a> about OpenMeet
                    </div>
                </div>

                {/* Right Column: Google Meet Feature Display Card */}
                <div className="flex justify-center items-center">
                    <div className="w-full max-w-md bg-[var(--card-bg)] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 text-center flex flex-col items-center gap-6 shadow-sm">
                        <div className="w-48 h-48 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] my-2">
                            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Get a link you can share</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Click <strong className="text-[var(--text)]">New meeting</strong> to get a link you can send to people you want to meet with.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}