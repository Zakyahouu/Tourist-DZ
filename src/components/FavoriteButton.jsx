import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable Favorite (Heart) button.
 * Toggles the favorites table for the current user + given siteId.
 * Supports optional controlled `initialFav` and `onToggle` to avoid N+1 queries in lists.
 */
const FavoriteButton = ({ siteId, initialFav, onToggle, className = '', size = 20 }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFav, setIsFav] = useState(!!initialFav);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialFav !== undefined) {
            setIsFav(!!initialFav);
        }
    }, [initialFav]);

    // Check if already favorited (only when not controlled by parent list)
    useEffect(() => {
        if (initialFav !== undefined || !user || !siteId) return;
        let cancelled = false;
        supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('site_id', siteId)
            .maybeSingle()
            .then(({ data }) => { if (!cancelled) setIsFav(!!data); });
        return () => { cancelled = true; };
    }, [user, siteId, initialFav]);

    const toggle = async (e) => {
        e.preventDefault(); // don't follow parent <Link>
        e.stopPropagation();

        if (!user) {
            navigate('/auth', { state: { from: window.location.pathname } });
            return;
        }

        setLoading(true);
        try {
            if (isFav) {
                await supabase.from('favorites').delete().eq('user_id', user.id).eq('site_id', siteId);
                setIsFav(false);
                if (onToggle) onToggle(siteId, false);
            } else {
                await supabase.from('favorites').insert({ user_id: user.id, site_id: siteId });
                setIsFav(true);
                if (onToggle) onToggle(siteId, true);
            }
        } catch (err) {
            logger.error('Favorite toggle error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`p-2 rounded-full transition-all ${isFav
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                : 'bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 backdrop-blur-md shadow-sm'
                } ${className}`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart size={size} className={isFav ? 'fill-current' : ''} />
        </button>
    );
};

export default FavoriteButton;
