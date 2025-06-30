import { createContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext({
    auth: null,
    user: null,
    updateProfile: () => {},
    logout: () => {},
    isLoggingOut: false,
    fetchProfile: () => {},
});

const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [profile, setProfile] = useState(() => {
        const savedProfile = localStorage.getItem("userProfile");
        return savedProfile ? JSON.parse(savedProfile) : null;
    });
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const logout = async () => {
        setIsLoggingOut(true);
        const token = localStorage.getItem("token");
        try {
            if (token) {
                await fetch('https://luckymillion.pro/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
            }
        } catch (e) {
            console.warn('Logout API error:', e);
        } finally {
            setToken(null);
            setProfile(null);
            localStorage.removeItem('token');
            localStorage.removeItem('userProfile');
            setIsLoggingOut(false);
            navigate('/');
        }
    }

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userProfile");
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            const interval = setInterval(() => {
                fetch('https://luckymillion.pro/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                })
                .then(res => {
                    if (res.status === 401) {
                        logout();
                        return Promise.reject('Unauthorized');
                    }
                    if (!res.ok) {
                        return Promise.reject('Failed to fetch balance');
                    }
                    return res.json();
                })
                .then(data => {
                    if (data && data.data) {
                        setProfile(currentProfile => {
                            if (currentProfile?.balance !== data.data.balance) {
                                const updatedProfile = { ...currentProfile, ...data.data };
                                localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
                                return updatedProfile;
                            }
                            return currentProfile;
                        });
                    }
                })
                .catch(error => {
                    if (error !== 'Unauthorized') {
                        console.error("Error fetching real-time balance:", error);
                    }
                });
            }, 5000); // Fetch every 5 seconds

            return () => clearInterval(interval);
        }
    }, [token]);

    const updateProfile = (newProfile) => {
        setProfile(newProfile);
        if (newProfile) {
            localStorage.setItem("userProfile", JSON.stringify(newProfile));
        } else {
            localStorage.removeItem("userProfile");
        }
    };

    const fetchProfile = async () => {
        if (!token) return;
        try {
            const res = await fetch('https://luckymillion.pro/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            if (data && data.data) {
                setProfile(currentProfile => {
                    const updatedProfile = { ...currentProfile, ...data.data };
                    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
                    return updatedProfile;
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const value = useMemo(() => ({
        auth: token,
        user: profile,
        updateProfile,
        logout,
        isLoggingOut,
        fetchProfile,
    }), [token, profile, isLoggingOut]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthContextProvider };
