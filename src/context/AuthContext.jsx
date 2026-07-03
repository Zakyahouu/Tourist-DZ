import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
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
    // Track the user ID we last fetched a profile for to avoid redundant fetches
    const lastFetchedUserId = useRef(null);
    const currentSessionRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        let eventSeen = false;

        const fetchProfile = async (userId) => {
            if (!userId) return;
            const MAX_ATTEMPTS = 3;
            console.log(`[TDZ Auth] fetchProfile called for userId=${userId}`);

            for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                if (!mounted) return;
                console.log(`[TDZ Auth] Profile fetch attempt ${attempt}/${MAX_ATTEMPTS}`);
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (!mounted) return;

                    if (error) {
                        console.warn(`[TDZ Auth] Profile fetch error (attempt ${attempt}):`, error.code, error.message);
                        // Retry only on initial load (no profile loaded yet) and within limit
                        if (attempt < MAX_ATTEMPTS && !lastFetchedUserId.current) {
                            console.log(`[TDZ Auth] Retrying profile fetch in ${attempt * 800}ms...`);
                            await new Promise(r => setTimeout(r, attempt * 800));
                            continue;
                        }
                        console.warn('[TDZ Auth] Profile fetch failed — keeping existing profile. Current profile:', lastFetchedUserId.current ? 'exists' : 'none');
                        // Keep existing profile — don't wipe admin state
                        break;
                    }

                    console.log(`[TDZ Auth] Profile fetched OK → id=${data?.id} role=${data?.role} full_name=${data?.full_name}`);
                    setProfile(data);
                    lastFetchedUserId.current = userId;
                    break; // success
                } catch (err) {
                    console.error(`[TDZ Auth] fetchProfile threw (attempt ${attempt}):`, err);
                    if (attempt < MAX_ATTEMPTS && !lastFetchedUserId.current) {
                        await new Promise(r => setTimeout(r, attempt * 800));
                        continue;
                    }
                    break;
                }
            }

            if (mounted) setLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                eventSeen = true;

                const refreshToken = session?.refresh_token ? `(${session.refresh_token.slice(0, 20)}...)` : 'none';
                const accessToken = session?.access_token ? `(${session.access_token.slice(0, 20)}...)` : 'none';
                console.log(`[TDZ Auth] onAuthStateChange → event=${event} | userId=${session?.user?.id ?? 'none'} | accessToken=${accessToken} | refreshToken=${refreshToken} | sessionExpiry=${session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'n/a'}`);

                currentSessionRef.current = session;
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Only re-fetch profile when the user actually changes (sign-in / initial load).
                    // TOKEN_REFRESHED, USER_UPDATED etc. don't change the profile row —
                    // re-fetching on those events was wiping admin state on errors.
                    const isNewUser = session.user.id !== lastFetchedUserId.current;
                    const shouldFetch = isNewUser || event === 'SIGNED_IN' || event === 'INITIAL_SESSION';
                    console.log(`[TDZ Auth] isNewUser=${isNewUser} shouldFetch=${shouldFetch} lastFetchedUser=${lastFetchedUserId.current ?? 'none'}`);
                    if (shouldFetch) {
                        await fetchProfile(session.user.id);
                    } else {
                        console.log('[TDZ Auth] Skipping profile re-fetch (same user, non-login event)');
                        setLoading(false);
                    }
                } else {
                    console.log('[TDZ Auth] No session → clearing profile and user state');
                    setProfile(null);
                    lastFetchedUserId.current = null;
                    setLoading(false);
                }
            }
        );

        // Listen for cross-tab logout: if another tab clears localStorage, 
        // this tab should also logout (prevents re-sync from other tabs)
        const handleStorageChange = (e) => {
            // If zibango-auth key is removed and we have a session, another tab logged out
            if (e.key === 'zibango-auth' && e.newValue === null && currentSessionRef.current) {
                console.warn('[TDZ Auth] CROSS-TAB LOGOUT DETECTED: Another tab logged out. Forcing logout here too.');
                setSession(null);
                setUser(null);
                setProfile(null);
                lastFetchedUserId.current = null;
                currentSessionRef.current = null;
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Fallback: ensure we stop loading if no event fires within 5s
        const timer = setTimeout(() => {
            if (mounted && !eventSeen) {
                console.warn('[TDZ Auth] 5s timeout hit — forcing loading=false. No auth event fired?');
                setLoading(false);
            }
        }, 5000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
            clearTimeout(timer);
        };
    }, []);

    const signOut = useCallback(async () => {
        console.log('[TDZ Auth] signOut initiated');
        // Always clear local state first so the UI responds immediately,
        // even if the API call hangs or fails.
        setSession(null);
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
        currentSessionRef.current = null;
        
        // Log storage before
        const storageKeyBefore = localStorage.getItem('zibango-auth');
        console.log('[TDZ Auth] localStorage before signOut:', storageKeyBefore ? `(${storageKeyBefore.length} chars)` : 'empty');
        
        try {
            // Race the server call against a 5s timeout so we never hang
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 5000)),
            ]);
            console.log('[TDZ Auth] signOut: server call completed');
        } catch (err) {
            // State was already cleared above — this only affects the server-side revocation
            console.warn('[TDZ Auth] signOut: server call failed or timed out:', err.message);
        }
        
        // Log storage after
        const storageKeyAfter = localStorage.getItem('zibango-auth');
        console.log('[TDZ Auth] localStorage after signOut:', storageKeyAfter ? `(${storageKeyAfter.length} chars)` : 'empty');
        
        // Emergency: if localStorage still has a session after signOut, wipe it manually
        if (storageKeyAfter) {
            console.warn('[TDZ Auth] WARNING: localStorage still has session after signOut! Manually clearing...');
            localStorage.removeItem('zibango-auth');
            console.log('[TDZ Auth] localStorage manually cleared');
        }
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
