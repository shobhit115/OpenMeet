import { createContext, useContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/v1/user`
});

// Helper function to safely read from localStorage
const getStoredUser = () => {
    try {
        const item = localStorage.getItem("user");
        return item && item !== "undefined" ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // Initialize state directly from localStorage safely
    const [userData, setUserData] = useState(getStoredUser);

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", { name, username, password });
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const request = await client.post("/login", { username, password });
            
            if (request.status === 200) {
                const { token, user } = request.data;

                if (token) {
                    localStorage.setItem("token", token);
                }

                // Fix: Only stringify and store if 'user' is actually defined!
                if (user) {
                    localStorage.setItem("user", JSON.stringify(user));
                    setUserData(user);
                } else {
                    // Fallback in case API returns user data under a different key or format
                    localStorage.removeItem("user");
                    setUserData(null);
                }
            }
        } catch (err) {
            throw err;
        }
    };

    const data = { userData, setUserData, handleRegister, handleLogin };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);