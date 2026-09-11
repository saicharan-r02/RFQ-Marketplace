import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Building2, Truck, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({ role: 'BUYER', name: '', companyName: '', email: '', password: '', phone: '', });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const newUser = await register(formData);
            if (newUser.role === 'BUYER') {
                navigate('/buyer/dashboard');
            } else {
                navigate('/supplier/marketplace');
            }
        } catch (err) {
            const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Registration failed.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">

                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Create an Account</h1>
                        <p className="text-sm text-slate-400 mt-1">Join the B2B RFQ Marketplace ecosystem</p>
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                            I want to participate as:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                                className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${formData.role === 'BUYER'
                                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-md shadow-sky-500/10'
                                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <Building2 className="w-4 h-4 text-sky-400" />
                                    Buyer
                                </div>
                                <span className="text-[11px] text-slate-400">Post RFQs & receive quotations</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'SUPPLIER' })}
                                className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${formData.role === 'SUPPLIER'
                                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
                                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <Truck className="w-4 h-4 text-emerald-400" />
                                    Supplier
                                </div>
                                <span className="text-[11px] text-slate-400">Discover RFQs & submit bids</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Contact Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Acme Corp Ltd"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">Business Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="contact@acme.com"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min 6 characters"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Complete Registration</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Already registered?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                            Log in to your account
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}