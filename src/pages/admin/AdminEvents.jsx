import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../supabaseClient';
import { Plus, Pencil, Trash2, X, Search, Calendar, Users, MessageSquare, Settings2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ManageCategoriesModal from '../../components/ManageCategoriesModal';

const AdminEvents = () => {
    const { i18n } = useTranslation();
    const { showToast } = useToast();
    const lang = i18n.language || 'en';
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
    const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [rejectionReason, setRejectionReason] = useState('');

    const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
    const [selectedEventForAnnouncements, setSelectedEventForAnnouncements] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ message_ar: '', message_fr: '', message_en: '' });

    const emptyEvent = {
        title: { ar: '', fr: '', en: '' },
        description: { ar: '', fr: '', en: '' },
        category_id: null,
        start_date: '',
        end_date: '',
        location: '',
        latitude: null,
        longitude: null,
        max_participants: '',
        is_solidarity: false,
        is_active: true,
        audio_url: '',
    };

    const [form, setForm] = useState(emptyEvent);

    useEffect(() => { fetchEvents(); fetchCategories(); }, []);

    async function fetchCategories() {
        const { data } = await supabase.from('event_categories').select('*').order('sort_order');
        if (data) setCategories(data);
    }

    async function fetchEvents() {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*, event_registrations(count)')
            .order('start_date', { ascending: false });
        if (error) showToast('Failed to load events: ' + error.message, 'error');
        else setEvents(data || []);
        setLoading(false);
    }

    const getCategory = (id) => categories.find(c => c.id === id);

    const handleSave = async () => {
        if (!form.title.fr && !form.title.en) return showToast('Please enter a title.', 'info');
        if (!form.start_date) return showToast('Please set a start date.', 'info');

        const payload = {
            title: form.title,
            description: form.description,
            category_id: form.category_id,
            start_date: form.start_date,
            end_date: form.end_date || null,
            location: form.location,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            max_participants: form.max_participants ? parseInt(form.max_participants) : null,
            is_solidarity: form.is_solidarity,
            is_active: form.is_active,
            audio_url: form.audio_url,
        };

        if (editingEvent) {
            const { error } = await supabase.from('events').update(payload).eq('id', editingEvent.id);
            if (error) return showToast(error.message, 'error');
        } else {
            const { error } = await supabase.from('events').insert(payload);
            if (error) return showToast(error.message, 'error');
        }
        showToast('Event saved successfully!', 'success');
        setShowModal(false);
        setEditingEvent(null);
        setForm(emptyEvent);
        fetchEvents();
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event permanently?')) return;
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) return showToast(error.message, 'error');
        showToast('Event deleted.', 'success');
        fetchEvents();
    };

    const openEdit = (evt) => {
        setEditingEvent(evt);
        setForm({
            title: evt.title || { ar: '', fr: '', en: '' },
            description: evt.description || { ar: '', fr: '', en: '' },
            category_id: evt.category_id,
            start_date: evt.start_date || '',
            end_date: evt.end_date || '',
            location: evt.location || '',
            latitude: evt.latitude || '',
            longitude: evt.longitude || '',
            max_participants: evt.max_participants || '',
            is_solidarity: evt.is_solidarity,
            is_active: evt.is_active,
            audio_url: evt.audio_url || '',
        });
        setShowModal(true);
    };

    const getRegistrationStatus = (reg) => {
        if (reg.status === 'accepted') return { label: 'Accepted', style: 'bg-emerald-100 text-emerald-700' };
        if (reg.status === 'rejected') return { label: 'Rejected', style: 'bg-red-100 text-red-600' };
        if (reg.status === 'cancelled') return { label: 'Cancelled', style: 'bg-slate-100 text-slate-500' };
        return { label: 'Pending', style: 'bg-amber-100 text-amber-700' };
    };

    const openRegistrations = async (evt) => {
        setSelectedEventForRegistrations(evt);
        setShowRegistrationsModal(true);
        setRejectionReason('');
        const { data } = await supabase
            .from('event_registrations')
            .select(`
                id, status, registered_at, rejection_reason,
                profiles (full_name, email)
            `)
            .eq('event_id', evt.id)
            .order('registered_at', { ascending: false });
        setRegistrations(data || []);
    };

    const updateRegistrationStatus = async (regId, newStatus) => {
        const payload = { status: newStatus };
        if (newStatus === 'rejected') {
            const reason = prompt('Enter rejection reason:');
            if (reason === null) return;
            payload.rejection_reason = reason;
        }
        const { error } = await supabase.from('event_registrations').update(payload).eq('id', regId);
        if (error) return showToast(error.message, 'error');
        showToast(`Registration ${newStatus}.`, 'success');
        openRegistrations(selectedEventForRegistrations);
    };

    const openAnnouncements = async (evt) => {
        setSelectedEventForAnnouncements(evt);
        setShowAnnouncementsModal(true);
        setNewAnnouncement({ message_ar: '', message_fr: '', message_en: '' });
        const { data } = await supabase
            .from('event_announcements')
            .select('*')
            .eq('event_id', evt.id)
            .order('created_at', { ascending: false });
        setAnnouncements(data || []);
    };

    const postAnnouncement = async () => {
        if (!newAnnouncement.message_fr && !newAnnouncement.message_en) {
            return showToast('Please enter at least a French or English message.', 'info');
        }
        const { error } = await supabase.from('event_announcements').insert({
            event_id: selectedEventForAnnouncements.id,
            message_ar: newAnnouncement.message_ar,
            message_fr: newAnnouncement.message_fr,
            message_en: newAnnouncement.message_en,
        });
        if (error) return showToast(error.message, 'error');
        showToast('Announcement posted!', 'success');
        setNewAnnouncement({ message_ar: '', message_fr: '', message_en: '' });
        const { data } = await supabase
            .from('event_announcements')
            .select('*')
            .eq('event_id', selectedEventForAnnouncements.id)
            .order('created_at', { ascending: false });
        setAnnouncements(data || []);

        // Fire-and-forget push notification to accepted registrants
        try {
            const funcUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push`;
            fetch(funcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
                body: JSON.stringify({ event_id: selectedEventForAnnouncements.id }),
            });
        } catch (err) {
            logger.error('Push notification failed:', err);
        }
    };

    const filteredEvents = events.filter(e =>
        (filterCategory === 'all' || e.category_id === filterCategory) &&
        ((e.title?.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.title?.en || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Events</h2>
                    <p className="text-sm text-slate-500">{events.length} events total</p>
                </div>
                <button onClick={() => { setEditingEvent(null); setForm(emptyEvent); setShowModal(true); }} className="flex items-center px-5 py-2.5 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-700 transition-colors shadow-sm self-start">
                    <Plus size={18} className="mr-2" /> Add Event
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-sky-500">
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c[`name_${lang}`] || c.name_en}</option>)}
                </select>
                <button onClick={() => setShowCategoryManager(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors bg-white">
                    <Settings2 size={16} /> Manage
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Calendar size={40} className="mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No events found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Registrations</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEvents.map(evt => (
                                    <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{evt.title?.fr || evt.title?.en || '—'}</div>
                                            <div className="text-xs text-slate-400">{evt.location || '—'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">{getCategory(evt.category_id)?.[`name_${lang}`] || getCategory(evt.category_id)?.name_en || evt.category_id || '—'}</span>
                                            {evt.is_solidarity && <span className="ml-1.5 px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">Solidarity</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{evt.start_date ? new Date(evt.start_date).toLocaleDateString() : '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                                                <Users size={14} />
                                                {evt.event_registrations?.[0]?.count || 0}
                                                {evt.max_participants && <span className="text-slate-400 font-normal">/ {evt.max_participants}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openRegistrations(evt)} className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg" title="Attendees"><Users size={16} /></button>
                                            <button onClick={() => openAnnouncements(evt)} className="text-slate-400 hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg" title="Announcements"><MessageSquare size={16} /></button>
                                            <button onClick={() => openEdit(evt)} className="text-slate-400 hover:text-sky-600 p-1.5 hover:bg-sky-50 rounded-lg"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(evt.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['fr', 'en', 'ar'].map(lng => (
                                    <div key={lng}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title ({lng})</label>
                                        <input type="text" value={form.title[lng]} onChange={e => setForm({ ...form, title: { ...form.title, [lng]: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" dir={lng === 'ar' ? 'rtl' : 'ltr'} />
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                    <select value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value || null })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                                        <option value="">Select category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c[`name_${lang}`] || c.name_en}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
                                    <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Participants</label>
                                    <input type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_solidarity} onChange={e => setForm({ ...form, is_solidarity: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-sky-600" />
                                    <span className="text-sm font-medium text-slate-700">Solidarity Event</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-sky-600" />
                                    <span className="text-sm font-medium text-slate-700">Active</span>
                                </label>
                            </div>
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audio Narration URL (MP3)</label>
                                    <input
                                        type="text"
                                        value={form.audio_url}
                                        onChange={e => setForm({ ...form, audio_url: e.target.value })}
                                        placeholder="https://.../narration.mp3"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Add an audio narration/guide for this event.</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm">{editingEvent ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Registrations Modal */}
            {showRegistrationsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowRegistrationsModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Attendees</h3>
                                <p className="text-sm text-slate-500">{selectedEventForRegistrations?.title?.en || selectedEventForRegistrations?.title?.fr}</p>
                            </div>
                            <button onClick={() => setShowRegistrationsModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="overflow-y-auto p-6 flex-1">
                            {registrations.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No attendees registered yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {registrations.map(reg => {
                                        const statusInfo = getRegistrationStatus(reg);
                                        return (
                                            <div key={reg.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{reg.profiles?.full_name || 'Anonymous'}</p>
                                                        <p className="text-xs text-slate-500">{reg.profiles?.email}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">Registered: {new Date(reg.registered_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.style}`}>{statusInfo.label}</span>
                                                </div>
                                                {reg.status === 'pending' && (
                                                    <div className="mt-3 flex gap-2">
                                                        <button onClick={() => updateRegistrationStatus(reg.id, 'accepted')} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Accept</button>
                                                        <button onClick={() => updateRegistrationStatus(reg.id, 'rejected')} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Reject</button>
                                                    </div>
                                                )}
                                                {reg.status === 'rejected' && reg.rejection_reason && (
                                                    <p className="mt-2 text-xs text-red-500 italic">Reason: {reg.rejection_reason}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements Modal */}
            {showAnnouncementsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowAnnouncementsModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Event Announcements</h3>
                                <p className="text-sm text-slate-500">{selectedEventForAnnouncements?.title?.en || selectedEventForAnnouncements?.title?.fr}</p>
                            </div>
                            <button onClick={() => setShowAnnouncementsModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="overflow-y-auto p-6 flex-1 space-y-6">
                            {/* Post new announcement */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Post an Update</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {['fr', 'en', 'ar'].map(lng => (
                                        <div key={lng}>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message ({lng})</label>
                                            <textarea
                                                value={newAnnouncement[`message_${lng}`]}
                                                onChange={e => setNewAnnouncement(prev => ({ ...prev, [`message_${lng}`]: e.target.value }))}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-sky-500"
                                                dir={lng === 'ar' ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button onClick={postAnnouncement} className="mt-3 px-5 py-2 rounded-lg text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors">Post Announcement</button>
                            </div>

                            {/* Existing announcements */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Previous Announcements</h4>
                                {announcements.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">No announcements yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {announcements.map(a => (
                                            <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-white">
                                                <div className="text-xs text-slate-400 mb-2">{new Date(a.created_at).toLocaleString()}</div>
                                                {a.message_fr && <p className="text-sm text-slate-700 mb-1"><span className="font-bold text-[10px] uppercase text-slate-400">FR:</span> {a.message_fr}</p>}
                                                {a.message_en && <p className="text-sm text-slate-700 mb-1"><span className="font-bold text-[10px] uppercase text-slate-400">EN:</span> {a.message_en}</p>}
                                                {a.message_ar && <p className="text-sm text-slate-700" dir="rtl"><span className="font-bold text-[10px] uppercase text-slate-400">AR:</span> {a.message_ar}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showCategoryManager && (
                <ManageCategoriesModal
                    tableName="event_categories"
                    categories={categories}
                    onCategoryChange={c => setCategories(c)}
                    onClose={() => setShowCategoryManager(false)}
                />
            )}
        </div>
    );
};

export default AdminEvents;
