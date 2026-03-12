import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // Track the user ID we last fetched a profile for to avoid redundant fetches
    const lastFetchedUserId = useRef(null);

    useEffect(() => {
        let mounted = true;

        const fetchProfile = async (userId) => {
            if (!userId) return;
            const MAX_ATTEMPTS = 3;

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                if (!mounted) return;
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (!mounted) return;

                    if (error) {
                        // Retry only on initial load (no profile loaded yet) and within limit
                        if (attempt < MAX_ATTEMPTS && !lastFetchedUserId.current) {
                            logger.warn(`Profile fetch attempt ${attempt} failed, retrying...`);
                            await new Promise(r => setTimeout(r, attempt * 800));
                            continue;
                        }
                        logger.warn('Profile fetch error:', error.message);
                        // Keep existing profile — don't wipe admin state
                        break;
                    }

                    setProfile(data);
                    lastFetchedUserId.current = userId;
                    break; // success
                } catch (err) {
                    if (attempt < MAX_ATTEMPTS && !lastFetchedUserId.current) {
                        await new Promise(r => setTimeout(r, attempt * 800));
                        continue;
                    }
                    logger.error('Error in fetchProfile:', err);
                    break;
                }
            }

            if (mounted) setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Only re-fetch profile when the user actually changes (sign-in / initial load).
                    // TOKEN_REFRESHED, USER_UPDATED etc. don't change the profile row —
                    // re-fetching on those events was wiping admin state on errors.
                    const isNewUser = session.user.id !== lastFetchedUserId.current;
                    if (isNewUser || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                        await fetchProfile(session.user.id);
                    } else {
                        setLoading(false);
                    }
                } else {
                    setProfile(null);
                    lastFetchedUserId.current = null;
                    setLoading(false);
                }
            }
        );

        // Fallback: ensure we stop loading if no event fires within 5s
        const timer = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 5000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
    }, []);

    const isAdmin = profile?.role === 'admin';

    const value = useMemo(() => ({
        session,
        user,
        profile,
        loading,
        isAdmin,
        signOut,
    }), [session, user, profile, loading, isAdmin, signOut]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
