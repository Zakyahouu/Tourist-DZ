import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    Calendar,
    Users,
    Image as ImageIcon,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    Hotel,
    HeartHandshake,
    MessageSquare,
    Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const navigate = useNavigate();
    const { signOut, profile } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/sites', icon: MapPin, label: 'Tourist Sites' },
        { path: '/admin/events', icon: Calendar, label: 'Events' },
        { path: '/admin/accommodations', icon: Hotel, label: 'Accommodations' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/gallery', icon: ImageIcon, label: 'Gallery' },
        { path: '/admin/solidarity', icon: HeartHandshake, label: 'Solidarity' },
        { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
        { path: '/admin/settings', icon: Settings, label: 'Site Content' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            {/* Sidebar Desktop */}
            <aside className={`bg-slate-900 text-white w-64 flex-shrink-0 transition-all duration-300 z-20 hidden md:flex flex-col`}>
                <div className="h-16 flex items-center justify-center border-b border-slate-800">
                    <span className="text-xl font-bold tracking-wider">
                        ADMIN<span className="text-sky-500">DZ</span>
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-sky-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-3 border-t border-slate-800 space-y-1">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white w-full transition-colors"
                    >
                        <ArrowLeft className="mr-3 h-4 w-4" />
                        Back to Website
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 w-full transition-colors"
                    >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <aside className="w-64 h-full bg-slate-900 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 text-white">
                            <span className="text-xl font-bold tracking-wider">
                                ADMIN<span className="text-sky-500">DZ</span>
                            </span>
                            <button onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="space-y-1 px-3">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.end}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'bg-sky-600 text-white'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`
                                        }
                                    >
                                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                        <div className="p-3 border-t border-slate-800">
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white w-full transition-colors"
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">

                {/* Topbar */}
                <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 shadow-sm">
                    <div className="flex items-center">
                        <button
                            className="text-slate-500 hover:text-slate-700 focus:outline-none md:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="ml-4 md:ml-0 text-lg font-bold text-slate-800">
                            Admin Panel
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold shadow-md text-sm">
                            {profile?.full_name?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
