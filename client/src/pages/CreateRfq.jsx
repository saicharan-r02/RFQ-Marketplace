import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { ArrowLeft, PlusCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
    'Electronics & Semiconductors',
    'Construction & Building Materials',
    'Packaging & Printing',
    'Raw Materials & Chemicals',
    'Logistics & Freight Services',
    'IT, Hardware & Networking',
    'Industrial Machinery',
    'Textiles & Apparel',
    'Healthcare & Medical Supplies',
    'Other Services',
];

const UNITS = ['Units', 'Pieces', 'Tons', 'Kilograms', 'Liters', 'Meters', 'Boxes', 'Hours'];

export default function CreateRfq() {
    const navigate = useNavigate();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDateString = tomorrow.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: CATEGORIES[0],
        quantity: '',
        unit: 'Units',
        deliveryLocation: '',
        deadline: minDateString,
        targetBudget: '',
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                targetBudget: formData.targetBudget ? parseFloat(formData.targetBudget) : null,
            };

            await API.post('/rfqs', payload);
            navigate('/buyer/dashboard');
        } catch (err) {
            const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Failed to create RFQ.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-4">

            <Link
                to="/buyer/dashboard"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Post a Request for Quotation</h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Submit your requirements to receive competitive bids from suppliers</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Product or Service Name *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. 5,000 Units of High-Grade Lithium-ion Batteries"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Industry Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c} className="bg-slate-900 text-white">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                required
                                min="1"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="1000"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                Measurement Unit *
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                            >
                                {UNITS.map((u) => (
                                    <option key={u} value={u} className="bg-slate-900 text-white">
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                Delivery Location *
                            </label>
                            <input
                                type="text"
                                name="deliveryLocation"
                                required
                                value={formData.deliveryLocation}
                                onChange={handleChange}
                                placeholder="e.g. Austin, Texas (Facility Port #3)"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                                Quotation Submission Deadline *
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                required
                                min={minDateString}
                                value={formData.deadline}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Target Budget in USD (Optional)
                        </label>
                        <input
                            type="number"
                            name="targetBudget"
                            min="0"
                            step="0.01"
                            value={formData.targetBudget}
                            onChange={handleChange}
                            placeholder="e.g. 50000"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Detailed Specifications / Scope of Work *
                        </label>
                        <textarea
                            name="description"
                            required
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide technical specifications, quality standards (ISO), packaging requirements, or delivery schedule preferences..."
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                        ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Link
                            to="/buyer/dashboard"
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition cursor-pointer"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-medium shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Publish RFQ to Marketplace</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

        </div>
    );
}