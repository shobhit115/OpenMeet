import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSnackbar } from "../contexts/SnackbarContext";

export default function Layout() {
    const navigate = useNavigate();
    const { userData, setUserData } = useAuth();
    const { showMessage } = useSnackbar();
    const [currentTime, setCurrentTime] = useState(new Date());

    const token = localStorage.getItem("token");
const storedUser = JSON.parse(localStorage.getItem("user"));

const currentUser = userData || storedUser;
const isAuthenticated = !!token;

    // Live clock update
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUserData(null);

    showMessage("Logged out successfully", "info");
    navigate("/");
};

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center shrink-0">
                {/* Logo */}
                <div 
                    className="flex items-center gap-3 cursor-pointer select-none" 
                    onClick={() => navigate("/")}
                >
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-[var(--primary)]/30">
                        O
                    </div>
                    <span className="text-2xl font-bold tracking-tight">OpenMeet</span>
                </div>

                {/* Right Header Area */}
                <div className="flex items-center gap-6 text-sm md:text-base">
                    {/* Live Date & Time */}
                    <span className="hidden md:inline-block font-medium text-gray-500">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className="font-medium hidden sm:inline">
                                    {currentUser?.name || "User"}
                                </span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg text-sm font-medium transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate("/auth")} 
                                className="text-[var(--primary)] font-semibold hover:text-[var(--primary-hover)] px-3 py-2 transition"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => navigate("/auth")} 
                                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}