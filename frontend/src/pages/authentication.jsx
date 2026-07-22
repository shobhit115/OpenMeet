import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../contexts/SnackbarContext';

const Authentication = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', username: '', password: '' });
    const { handleRegister, handleLogin } = useAuth();
    const navigate = useNavigate();
    const { showMessage } = useSnackbar(); 

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await handleLogin(formData.username, formData.password);
                showMessage("Logged in successfully!", "success");
                navigate('/home');
            } else {
                await handleRegister(formData.name, formData.username, formData.password);
                showMessage("Registration successful! Please login.", "success");
                setIsLogin(true); 
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong";
            showMessage(errorMsg, "error");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--card-bg)] border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-xl transition-all">
                
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[var(--primary)]/30 mb-3">
                        O
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isLogin ? "Welcome back to OpenMeet" : "Create your OpenMeet account"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {isLogin ? "Enter your credentials to continue" : "Start hosting seamless meetings in minutes"}
                    </p>
                </div>
                
                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Full Name</label>
                            <input 
                                name="name" 
                                placeholder="e.g. Alex Johnson" 
                                onChange={handleChange} 
                                required 
                                className="w-full px-4 py-3 bg-[var(--bg)] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text)] transition-all placeholder-gray-400"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Username</label>
                        <input 
                            name="username" 
                            placeholder="Enter your username" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-3 bg-[var(--bg)] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text)] transition-all placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-3 bg-[var(--bg)] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] text-[var(--text)] transition-all placeholder-gray-400"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full mt-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3.5 rounded-xl font-semibold shadow-md shadow-[var(--primary)]/20 transition-all hover:shadow-lg"
                    >
                        {isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>
                
                {/* Toggle Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Authentication;