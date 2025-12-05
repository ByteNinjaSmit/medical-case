import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDoctor, setIsDoctor] = useState(false);
    // const navigate = useNavigate();

    // API URL from environment variables
    const API = import.meta.env.VITE_APP_URI_API || 'http://localhost:5000';

    // Check if the user is logged in
    let isLoggedIn = !!user;
    console.log("isLoggedIn", isLoggedIn);

    // Logout functionality
    const LogoutUser = async () => {
        try {
            await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
        } catch (_) {
        } finally {
            try { localStorage.removeItem('authToken'); } catch (_) {}
            setUser("");
            setIsDoctor(false);

            toast.success(`Logout Successfully`);

            // Navigate to the home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 500); // Delay navigation for 2 seconds (2000 ms)
        }

    };

    const refreshSession = async () => {
        try {
            const res = await axios.post(`${API}/api/auth/refresh`, {}, {
                withCredentials: true,
            });
            return res.status === 200;
        } catch (_) {
            return false;
        }
    };

    // JWT Authentication - fetch current logged-in user data
    const userAuthentication = async (options = { skipRefresh: false }) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API}/api/auth/current`, {
                withCredentials: true,
            });
            if (response.status === 200) {
                const data = response.data;
                setUser(data.user || "");
                const { isDoctor } = data.user || {};
                setIsDoctor(isDoctor || false);

            } else {
                console.error("Error fetching user data");
                setUser("");
                setIsDoctor(false);
            }
        } catch (error) {
            if (!options.skipRefresh && error?.response?.status === 401) {
                const refreshed = await refreshSession();
                if (refreshed) {
                    await userAuthentication({ skipRefresh: true });
                    return;
                }
            }

            console.log("Error fetching user data", error);
            setUser("");
            setIsDoctor(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Normal login (username/password)
    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API}/api/auth/login`, { username, password }, { withCredentials: true });
            if (res.status === 200) {
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
        userAuthentication();
    }, []);

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
                LogoutUser,
                user,
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