import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const CmsContext = createContext({});

export const useCms = () => useContext(CmsContext);

export const CmsProvider = ({ children }) => {
    const [cms, setCms] = useState({});

    useEffect(() => {
        supabase
            .from('site_content')
            .select('key, value')
            .then(({ data, error }) => {
                if (error) {
                    console.error('CMS fetch error:', error);
                    return;
                }
                if (data) setCms(Object.fromEntries(data.map(d => [d.key, d.value])));
            })
            .catch(err => console.error('CMS fetch exception:', err));
    }, []);

    return <CmsContext.Provider value={cms}>{children}</CmsContext.Provider>;
};
