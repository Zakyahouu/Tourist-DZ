import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Eye, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

const AdminSolidarity = () => {
    const { showToast } = useToast();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expanded, setExpanded] = useState(null); // id of expanded row

    useEffect(() => { fetchApps(); }, [filterStatus]);

    async function fetchApps() {
        setLoading(true);
        let q = supabase.from('solidarity_applications').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
        if (filterStatus !== 'all') q = q.eq('status', filterStatus);
        const { data } = await q;
        setApps(data || []);
        setLoading(false);
    }

    const filtered = apps.filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (a.full_name?.toLowerCase().includes(s) || a.phone?.includes(s) || a.category?.toLowerCase().includes(s));
    });

    async function changeStatus(id, newStatus) {
        const { error } = await supabase.from('solidarity_applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) return showToast(error.message, 'error');
        showToast(`Application marked as ${newStatus}.`, 'success');
        fetchApps();
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle size={14} className="mr-1" />;
            case 'rejected': return <XCircle size={14} className="mr-1" />;
            default: return <Clock size={14} className="mr-1" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'rejected': return 'bg-red-100 text-red-600';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Solidarity Applications</h2>
                <p className="text-sm text-slate-500">Review and manage solidarity tourism requests.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or category..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-sky-500" />
                </div>
                <div className="flex gap-2">
                    {['all', ...STATUS_OPTIONS].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filterStatus === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {s === 'all' ? 'All' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Count */}
            <div className="text-sm text-slate-500 font-medium">{filtered.length} application{filtered.length !== 1 ? 's' : ''}</div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">No applications found.</div>
                ) : filtered.map(app => (
                    <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-colors">
                        {/* Main Row */}
                        <div className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {app.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{app.full_name}</p>
                                    <p className="text-xs text-slate-400">{app.phone} · <span className="capitalize">{app.category?.replace('_', ' ')}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(app.status)}`}>
                                    {getStatusIcon(app.status)} {app.status}
                                </span>
                                <span className="text-xs text-slate-400">{new Date(app.created_at).toLocaleDateString()}</span>
                                {expanded === app.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expanded === app.id && (
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-4">
                                {app.special_needs && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Special Needs</p>
                                        <p className="text-sm text-slate-700">{app.special_needs}</p>
                                    </div>
                                )}
                                {app.preferred_trip_types?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Preferred Trip Types</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {app.preferred_trip_types.map(t => (
                                                <span key={t} className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold capitalize">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {app.profiles && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Linked Account</p>
                                        <p className="text-sm text-slate-700">{app.profiles.full_name} ({app.profiles.email})</p>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase mr-2 self-center">Set Status:</p>
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => changeStatus(app.id, s)}
                                            disabled={app.status === s}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${app.status === s
                                                ? 'bg-slate-200 text-slate-400 cursor-default'
                                                : s === 'approved' ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    : s === 'rejected' ? 'bg-red-500 text-white hover:bg-red-600'
                                                        : 'bg-amber-500 text-white hover:bg-amber-600'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSolidarity;
