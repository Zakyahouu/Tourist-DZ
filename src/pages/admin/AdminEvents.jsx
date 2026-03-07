import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Pencil, Trash2, X, Search, Calendar, MapPin, Users, Heart, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminEvents = () => {
    const { showToast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
    const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    const emptyEvent = {
        title: { ar: '', fr: '', en: '' },
        description: { ar: '', fr: '', en: '' },
        type: 'tour',
        start_date: '',
        end_date: '',
        location: '',
        latitude: null,
        longitude: null,
        max_participants: '',
        is_solidarity: false,
        is_active: true,
        audio_url: '',
        qr_code_url: '',
    };

    const [form, setForm] = useState(emptyEvent);

    useEffect(() => { fetchEvents(); }, []);

    async function fetchEvents() {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*, event_registrations(count)')
            .order('start_date', { ascending: false });
        if (!error) setEvents(data || []);
        setLoading(false);
    }

    const handleSave = async () => {
        if (!form.title.fr && !form.title.en) return showToast('Please enter a title.', 'info');
        if (!form.start_date) return showToast('Please set a start date.', 'info');

        const payload = {
            title: form.title,
            description: form.description,
            type: form.type,
            start_date: form.start_date,
            end_date: form.end_date || null,
            location: form.location,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            max_participants: form.max_participants ? parseInt(form.max_participants) : null,
            is_solidarity: form.is_solidarity,
            is_active: form.is_active,
            audio_url: form.audio_url,
            qr_code_url: form.qr_code_url,
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
            type: evt.type,
            start_date: evt.start_date || '',
            end_date: evt.end_date || '',
            location: evt.location || '',
            latitude: evt.latitude || '',
            longitude: evt.longitude || '',
            max_participants: evt.max_participants || '',
            is_solidarity: evt.is_solidarity,
            is_active: evt.is_active,
            audio_url: evt.audio_url || '',
            qr_code_url: evt.qr_code_url || '',
        });
        setShowModal(true);
    };

    const types = ['tour', 'camp', 'competition', 'volunteer', 'cultural'];

    const openRegistrations = async (evt) => {
        setSelectedEventForRegistrations(evt);
        setShowRegistrationsModal(true);
        const { data } = await supabase
            .from('event_registrations')
            .select(`
                id, status, registered_at,
                profiles (full_name, email)
            `)
            .eq('event_id', evt.id)
            .order('registered_at', { ascending: false });
        setRegistrations(data || []);
    };

    const toggleRegistrationStatus = async (regId, currentStatus) => {
        const newStatus = currentStatus === 'confirmed' ? 'pending' : 'confirmed';
        const { error } = await supabase.from('event_registrations').update({ status: newStatus }).eq('id', regId);
        if (error) return showToast(error.message, 'error');
        showToast(`Registration set to ${newStatus}.`, 'success');
        openRegistrations(selectedEventForRegistrations);
    };

    const filteredEvents = events.filter(e =>
        (e.title?.fr || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.title?.en || '').toLowerCase().includes(searchQuery.toLowerCase())
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

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500" />
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
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700">{evt.type}</span>
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
                                            <button onClick={() => openRegistrations(evt)} className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg"><Users size={16} /></button>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                                        {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">QR Code Image URL (Marketing)</label>
                                    <input
                                        type="text"
                                        value={form.qr_code_url}
                                        onChange={e => setForm({ ...form, qr_code_url: e.target.value })}
                                        placeholder="https://.../event-qr.png"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Audio Narration URL (MP3)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={form.audio_url}
                                            onChange={e => setForm({ ...form, audio_url: e.target.value })}
                                            placeholder="https://.../narration.mp3"
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500"
                                        />
                                        {editingEvent && (
                                            <button
                                                onClick={() => {
                                                    const url = `https://tourstizbiskra.com/event/${editingEvent.id}`;
                                                    navigator.clipboard.writeText(url);
                                                    showToast('Scan URL copied to clipboard!', 'success');
                                                }}
                                                type="button"
                                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
                                                title="Copy the URL to encode in your QR generator"
                                            >
                                                Copy Scan URL
                                            </button>
                                        )}
                                    </div>
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
                                    {registrations.map(reg => (
                                        <div key={reg.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                                            <div>
                                                <p className="font-bold text-slate-800">{reg.profiles?.full_name || 'Anonymous'}</p>
                                                <p className="text-xs text-slate-500">{reg.profiles?.email}</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">Registered: {new Date(reg.registered_at).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleRegistrationStatus(reg.id, reg.status)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${reg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                                            >
                                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
