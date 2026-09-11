import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, LogOut, PlusCircle, LayoutDashboard, ShoppingBag, FileText, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
    const { user, role, logout, isAuthenticated } = useAuth();
    const { notifications, unreadCount, markAllAsRead, clearNotifications } = useSocket();
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                RFQ
                            </div>
                            <span className="font-bold text-lg text-slate-100 tracking-tight">
                                Market<span className="text-indigo-400">Flow</span>
                            </span>
                        </Link>

                        {isAuthenticated && (
                            <div className="hidden md:flex items-center ml-8 gap-1">
                                {role === 'BUYER' && (
                                    <>
                                        <Link
                                            to="/buyer/dashboard"
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isActive('/buyer/dashboard')
                                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            My RFQs
                                        </Link>
                                        <Link
                                            to="/buyer/create-rfq"
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isActive('/buyer/create-rfq')
                                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Create RFQ
                                        </Link>
                                    </>
                                )}

                                {role === 'SUPPLIER' && (
                                    <>
                                        <Link
                                            to="/supplier/marketplace"
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isActive('/supplier/marketplace')
                                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            <ShoppingBag className="w-4 h-4" />
                                            RFQ Marketplace
                                        </Link>
                                        <Link
                                            to="/supplier/my-quotes"
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isActive('/supplier/my-quotes')
                                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                            My Quotations
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowNotifications(!showNotifications);
                                            if (!showNotifications) markAllAsRead();
                                        }}
                                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
                                        aria-label="Notifications"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 text-left">
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                                <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-indigo-400" />
                                                    Live Notifications
                                                </span>
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={clearNotifications}
                                                        className="text-xs text-slate-400 hover:text-rose-400 transition"
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                                                {notifications.length === 0 ? (
                                                    <div className="py-6 text-center text-xs text-slate-400">
                                                        No notifications yet.
                                                    </div>
                                                ) : (
                                                    notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition text-xs"
                                                        >
                                                            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                                                                <span>{n.title}</span>
                                                                <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                                                            </div>
                                                            <p className="text-slate-400 leading-relaxed">{n.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Role Badge */}
                                <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
                                    <div className={`w-2 h-2 rounded-full ${role === 'BUYER' ? 'bg-sky-400' : 'bg-emerald-400'}`}></div>
                                    <span className="font-medium text-slate-200">{user?.companyName}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">({role})</span>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
}