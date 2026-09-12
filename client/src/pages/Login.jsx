import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Building2, Truck, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const loggedInUser = await login(email, password);
            if (from) {
                navigate(from, { replace: true });
            } else if (loggedInUser.role === 'BUYER') {
                navigate('/buyer/dashboard', { replace: true });
            } else {
                navigate('/supplier/marketplace', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const fillQuickAccount = (quickEmail, quickPassword) => {
        setEmail(quickEmail);
        setPassword(quickPassword);
        setError('');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                        <p className="text-sm text-slate-400 mt-1">Sign in to manage your RFQs and quotations</p>
                    </div>

                    <div className="mb-6 p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
                            ⚡ Quick 1-Click Login
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fillQuickAccount('buyer@apexind.com', 'Password123!')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-400 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 rounded-xl transition cursor-pointer"
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                Buyer Account
                            </button>
                            <button
                                type="button"
                                onClick={() => fillQuickAccount('supplier1@globaltech.com', 'Password123!')}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 rounded-xl transition cursor-pointer"
                            >
                                <Truck className="w-3.5 h-3.5" />
                                Supplier Account
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Business Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                            Register here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}