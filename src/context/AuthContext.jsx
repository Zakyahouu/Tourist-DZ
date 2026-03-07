import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

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

    useEffect(() => {
        let mounted = true;

        // Listen for auth changes - this also emits an initial event on mount
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                // Handle the session state
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        // Fallback: If no event fires for some reason, ensure we stop loading
        const timer = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
            }
        }, 5000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const fetchProfile = async (userId) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Profile fetch error (might not exist yet):', error.message);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
    };

    const isAdmin = profile?.role === 'admin';

    const value = useMemo(() => ({
        session,
        user,
        profile,
        loading,
        isAdmin,
        signOut,
    }), [session, user, profile, loading, isAdmin]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
