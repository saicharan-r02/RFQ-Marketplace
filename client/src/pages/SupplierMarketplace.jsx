import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, MapPin, Calendar, Building2, ArrowUpRight, ShoppingBag, Clock, DollarSign, CheckCircle2, XCircle } from 'lucide-react';

const CATEGORIES = [
    'ALL',
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

export default function SupplierMarketplace() {
    const { role } = useAuth();
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    const fetchRfqs = async () => {
        try {
            setLoading(true);
            const params = {
                status: 'OPEN',
                search: search.trim() || undefined,
                category: category !== 'ALL' ? category : undefined,
                sortBy,
                order,
            };

            const res = await API.get('/rfqs', { params });
            setRfqs(res.data.data.rfqs || []);
        } catch (err) {
            console.error('Failed to fetch marketplace RFQs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRfqs();
        }, 250);

        return () => clearTimeout(timer);
    }, [search, category, sortBy, order]);

    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">B2B RFQ Marketplace</h1>
                <p className="text-sm text-slate-400 mt-1">Discover verified business requirements and submit competitive quotations</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xl">

                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, location, keywords..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c} className="bg-slate-900 text-white">
                                    {c === 'ALL' ? 'All Categories' : c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={`${sortBy}-${order}`}
                            onChange={(e) => {
                                const [newSort, newOrder] = e.target.value.split('-');
                                setSortBy(newSort);
                                setOrder(newOrder);
                            }}
                            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                        >
                            <option value="createdAt-desc" className="bg-slate-900 text-white">Newest First</option>
                            <option value="deadline-asc" className="bg-slate-900 text-white">Closing Soonest</option>
                            <option value="targetBudget-desc" className="bg-slate-900 text-white">Highest Budget</option>
                        </select>
                    </div>
                </div>

            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : rfqs.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
                    <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-200">No Open RFQs Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Try adjusting your search query or selecting a different industry category.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rfqs.map((rfq) => (
                        <div
                            key={rfq.id}
                            className="bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition duration-200 hover:shadow-indigo-500/10 group"
                        >
                            <div>

                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-800/40 truncate max-w-42.5">
                                        {rfq.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="truncate max-w-30">{rfq.buyer?.companyName}</span>
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                                    {rfq.title}
                                </h3>

                                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                    {rfq.description}
                                </p>

                                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Required Quantity:</span>
                                        <span className="font-medium text-slate-200">{rfq.quantity.toLocaleString()} {rfq.unit}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            Delivery Location:
                                        </span>
                                        <span className="font-medium text-slate-200 truncate max-w-35">{rfq.deliveryLocation}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Deadline:
                                        </span>
                                        <span className="font-medium text-amber-400">
                                            {new Date(rfq.deadline).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {rfq.targetBudget && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <DollarSign className="w-3.5 h-3.5" />
                                                Target Budget:
                                            </span>
                                            <span className="font-semibold text-emerald-400">
                                                ${Number(rfq.targetBudget).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">
                                    {rfq._count?.quotations || 0} quotes submitted
                                </span>

                                {role === 'SUPPLIER' && rfq.myQuotation ? (
                                    <Link
                                        to={`/rfqs/${rfq.id}`}
                                        className="flex items-center gap-1 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3.5 py-1.5 rounded-xl shadow-md transition cursor-pointer"
                                    >
                                        <span>{rfq.myQuotation.status === 'REJECTED' ? 'Not Selected' : 'View Quote'}</span>
                                        {rfq.myQuotation.status === 'REJECTED' ? <XCircle className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/rfqs/${rfq.id}`}
                                        className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer"
                                    >
                                        <span>Submit Quote</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}