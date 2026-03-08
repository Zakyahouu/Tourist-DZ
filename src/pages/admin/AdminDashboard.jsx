import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import logger from '../../utils/logger';
import { useAuth } from '../../context/AuthContext';
import {
    Users,
    MapPin,
    Calendar,
    MessageSquare,
    Image as ImageIcon,
    TrendingUp,
    Star
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({ users: 0, sites: 0, events: 0, reviews: 0, gallery: 0 });
    const [categoryData, setCategoryData] = useState([]);
    const [reviewsByMonth, setReviewsByMonth] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [topSites, setTopSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                // 1. Real counts
                const [usersRes, sitesRes, eventsRes, reviewsRes, galleryRes] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('tourist_sites').select('*', { count: 'exact', head: true }),
                    supabase.from('events').select('*', { count: 'exact', head: true }),
                    supabase.from('reviews').select('*', { count: 'exact', head: true }),
                    supabase.from('gallery').select('*', { count: 'exact', head: true }),
                ]);
                setStats({
                    users: usersRes.count || 0,
                    sites: sitesRes.count || 0,
                    events: eventsRes.count || 0,
                    reviews: reviewsRes.count || 0,
                    gallery: galleryRes.count || 0,
                });

                // 2. Real category breakdown (for pie chart)
                const { data: allSites } = await supabase.from('tourist_sites').select('category');
                if (allSites) {
                    const counts = {};
                    allSites.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
                    setCategoryData(Object.entries(counts).map(([name, value]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        value
                    })));
                }

                // 3. Real reviews by month (for bar chart — last 6 months)
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                const { data: allReviews } = await supabase
                    .from('reviews')
                    .select('created_at')
                    .gte('created_at', sixMonthsAgo.toISOString());

                if (allReviews) {
                    const months = {};
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date();
                        d.setMonth(d.getMonth() - i);
                        const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
                        months[key] = 0;
                    }
                    allReviews.forEach(r => {
                        const d = new Date(r.created_at);
                        const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
                        if (months[key] !== undefined) months[key]++;
                    });
                    setReviewsByMonth(Object.entries(months).map(([name, count]) => ({ name, count })));
                }

                // 4. Top rated sites
                const { data: topRated } = await supabase
                    .from('tourist_sites')
                    .select('name, avg_rating, review_count, category')
                    .order('avg_rating', { ascending: false })
                    .limit(5);
                setTopSites(topRated || []);

                // 5. Real solidarity applications
                const { data: apps } = await supabase
                    .from('solidarity_applications')
                    .select('id, full_name, category, status, created_at')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setRecentApplications(apps || []);

            } catch (error) {
                logger.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'rejected': return 'bg-red-100 text-red-600';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const statCards = [
        { title: 'Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
        { title: 'Sites', value: stats.sites, icon: MapPin, color: 'bg-emerald-50 text-emerald-600' },
        { title: 'Events', value: stats.events, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
        { title: 'Reviews', value: stats.reviews, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
        { title: 'Photos', value: stats.gallery, icon: ImageIcon, color: 'bg-pink-50 text-pink-600' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
                </h2>
                <p className="text-sm text-slate-500">Real-time platform overview.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map(card => (
                    <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-sky-300 transition-colors">
                        <div className={`p-2.5 rounded-xl w-fit mb-3 ${card.color}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                            {loading ? <span className="animate-pulse bg-slate-200 h-7 w-12 rounded block"></span> : card.value}
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{card.title}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row — ALL REAL DATA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reviews by Month — Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-sky-500" /> Reviews Activity (Last 6 Months)
                    </h3>
                    {reviewsByMonth.length === 0 ? (
                        <p className="text-sm text-slate-400 py-16 text-center">No review data available yet.</p>
                    ) : (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reviewsByMonth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [value, 'Reviews']}
                                    />
                                    <Bar dataKey="count" name="Reviews" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Sites by Category — Pie Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Sites by Category</h3>
                    {categoryData.length === 0 ? (
                        <p className="text-sm text-slate-400 py-16 text-center">No sites data available.</p>
                    ) : (
                        <>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={75}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {categoryData.map((_, idx) => (
                                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                {categoryData.map((cat, idx) => (
                                    <div key={cat.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        {cat.name} ({cat.value})
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Rated Sites */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Top Rated Sites</h3>
                    </div>
                    {topSites.length === 0 ? (
                        <p className="text-sm text-slate-400 py-8 text-center">No rated sites yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {topSites.map((site, idx) => (
                                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black text-slate-300 w-6">#{idx + 1}</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{site.name?.fr || site.name?.en || '—'}</p>
                                            <p className="text-xs text-slate-400 capitalize">{site.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        {site.avg_rating?.toFixed(1) || '0.0'}
                                        <span className="text-xs text-slate-400 font-normal">({site.review_count || 0})</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Solidarity Applications */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Recent Solidarity Applications</h3>
                    </div>
                    {recentApplications.length === 0 ? (
                        <p className="text-sm text-slate-400 py-8 text-center">No applications yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentApplications.map(app => (
                                <div key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {app.full_name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{app.full_name}</p>
                                            <p className="text-xs text-slate-400 capitalize">{app.category?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(app.status)}`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
