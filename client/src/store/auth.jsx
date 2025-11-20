import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Create context
export const AuthContext = createContext();

// Helper function to get token from cookies or localStorage
const getTokenFromStorage = () => {
    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="));
    const cookieToken = cookieValue ? cookieValue.split("=")[1] : null;
    if (cookieToken) return cookieToken;
    try {
        return localStorage.getItem('authToken');
    } catch (_) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(getTokenFromStorage());

    const [user, setUser] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDoctor, setIsDoctor] = useState(false);
    const authorizationToken = `Bearer ${token}`;
    // const navigate = useNavigate();

    // Function to store token in cookies
    const storeTokenInCookies = (serverToken) => {
        setToken(serverToken);
        try {
            document.cookie = `authToken=${serverToken}; path=/; max-age=3600`;
            localStorage.setItem('authToken', serverToken);
        } catch (_) {}
    };

    // API URL from environment variables
    const API = import.meta.env.VITE_APP_URI_API || 'http://localhost:5000';

    // Check if the user is logged in
    let isLoggedIn = !!token;
    console.log("isLoggedIn", isLoggedIn);

    // Logout functionality
    const LogoutUser = () => {
        setToken(null);
        setIsDoctor(false);
        // Remove token from cookies
        document.cookie = "authToken=; path=/; max-age=0";
        try { localStorage.removeItem('authToken'); } catch (_) {}

        toast.success(`Logout Successfully`);

        // Navigate to the home page after a short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 500); // Delay navigation for 2 seconds (2000 ms)

    };

    // JWT Authentication - fetch current logged-in user data
    const userAuthentication = async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const response = await axios.get(`${API}/api/auth/current`, {
                headers: {
                    Authorization: authorizationToken,
                },
                withCredentials: true,
            });
            if (response.status == 200) {
                const data = response.data;
                setUser(data.user);
                const { isDoctor } = data.user || {}
                setIsDoctor(isDoctor || false);

            } else {
                console.error("Error fetching user data");
            }
        } catch (error) {
            console.log("Error fetching user data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Normal login (username/password)
    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API}/api/auth/login`, { username, password });
            if (res.status === 200 && res.data?.token) {
                storeTokenInCookies(res.data.token);
                await userAuthentication();
                return true;
            }
            throw new Error(res.data?.message || 'Login failed');
        } catch (err) {
            throw err;
        }
    };

    // Effect to handle initial user authentication if token exists
    useEffect(() => {
        if (token) {
            userAuthentication();
        } else {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {

        // Check and set roles based on the user object
        if (user) {
            const { isDoctor } = user;

            if (isDoctor) {
                console.log(`This is isDoctor`);
            }
        }
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                storeTokenInCookies,
                LogoutUser,
                user,
                authorizationToken,
                isLoading,
                isDoctor,
                API,
                login,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth must be used within the AuthProvider");
    }
    return authContextValue;
};