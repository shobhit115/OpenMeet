import { createContext, useContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext({});

const client = axios.create({
    // Always include http://
    baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/v1/user`
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

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
                localStorage.setItem("token", request.data.token);
                setUserData(request.data.user); // Assuming your API returns user info
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