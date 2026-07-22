import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import heroImage from "../assets/hero.png";

export default function LandingPage() {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [meetingCode, setMeetingCode] = useState("");
    
    const token = localStorage.getItem("token");
    const isAuthenticated = userData || token;

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/home");
        } else {
            navigate("/auth");
        }
    };

    const handleJoinMeeting = (e) => {
        e.preventDefault();
        if (meetingCode.trim()) {
            const cleanCode = meetingCode.replace(/^https?:\/\/[^\/]+\//, "").trim();
            navigate(`/${cleanCode}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-between max-w-7xl mx-auto px-6 w-full py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1">
                
                {/* Hero Text */}
                <div className="flex flex-col gap-6 text-center lg:text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                        Video calls and meetings for <span className="text-[var(--primary)]">everyone.</span>
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Connect, collaborate, and celebrate from anywhere with OpenMeet. Crystal-clear video meetings built for seamless productivity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
                        <button 
                            onClick={handleGetStarted}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-[var(--primary)]/30 w-full sm:w-auto"
                        >
                            {isAuthenticated ? "Go to Dashboard" : "Start for Free"}
                        </button>

                        <form onSubmit={handleJoinMeeting} className="flex items-center gap-2 w-full sm:w-auto">
                            <input 
                                type="text"
                                placeholder="Enter meeting code"
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                                className="px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-[var(--bg)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] w-full sm:w-64"
                            />
                            <button 
                                type="submit"
                                disabled={!meetingCode.trim()}
                                className="px-5 py-3.5 font-semibold text-[var(--primary)] disabled:text-gray-400 hover:bg-[var(--card-bg)] rounded-xl transition"
                            >
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                {/* Hero Banner / Graphic */}
                <div className="flex justify-center items-center">
                    <div className="w-full max-w-lg bg-[var(--card-bg)] p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl">
                        <img 
                            src={heroImage} 
                            alt="OpenMeet Video Conference UI" 
                            className="w-full h-auto object-cover rounded-2xl"
                            onError={(e) => { 
                                e.target.style.display = 'none'; 
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 text-center text-gray-500 text-sm border-t border-gray-200 dark:border-gray-800 mt-12">
                &copy; {new Date().getFullYear()} OpenMeet. All rights reserved.
            </footer>
        </div>
    );
}