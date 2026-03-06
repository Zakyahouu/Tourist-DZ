import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Shield, User, Mail, Calendar, Filter, UserCheck, UserX } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => { fetchUsers(); }, []);

    async function fetchUsers() {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error) setUsers(data || []);
        setLoading(false);
    }

    const updateRole = async (userId, newRole) => {
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (error) return showToast(error.message, 'error');
        showToast('User role updated successfully', 'success');
        fetchUsers();
    };

    const roles = ['tourist', 'admin', 'guide'];

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'guide': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Users & Roles</h2>
                <p className="text-sm text-slate-500">{users.length} registered users</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                </div>
                <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white">
                    <option value="all">All Roles</option>
                    {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Language</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Change Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                                                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-800">{u.full_name || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{u.email || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRoleBadge(u.role)}`}>
                                                {u.role === 'admin' && <Shield size={10} className="inline mr-1" />}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 uppercase font-medium text-xs">{u.preferred_language || 'fr'}</td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={u.role}
                                                onChange={e => updateRole(u.id, e.target.value)}
                                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:ring-2 focus:ring-sky-500"
                                            >
                                                {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
