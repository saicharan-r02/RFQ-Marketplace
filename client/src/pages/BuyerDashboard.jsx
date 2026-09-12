import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { useSocket } from '../context/SocketContext';
import { PlusCircle, Package, Clock, CheckCircle2, MessageSquare, MapPin, Calendar, Trash2, ExternalLink, Layers, AlertCircle } from 'lucide-react';

export default function BuyerDashboard() {
    const { socket } = useSocket();
    const [rfqs, setRfqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    const fetchBuyerRfqs = async () => {
        try {
            setLoading(true);
            const res = await API.get('/rfqs/buyer/my-rfqs');
            setRfqs(res.data.data.rfqs || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load your RFQs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuyerRfqs();
    }, []);

    useEffect(() => {
    if (!socket) {
        return;
    }
    const handleNewQuotation = (data) => {
        console.log(
            'BuyerDashboard: new quotation received',
            data
        );
        fetchBuyerRfqs();
    };

    const handleRfqUpdated = (updatedRfq) => {
        console.log(
            'BuyerDashboard: RFQ updated',
            updatedRfq
        );

        setRfqs((previous) =>
            previous.map((rfq) =>
                Number(rfq.id) ===
                Number(updatedRfq.id)
                    ? {
                          ...rfq,
                          ...updatedRfq,
                      }
                    : rfq
            )
        );
    };

    const handleRfqDeleted = (data) => {
        console.log(
            'BuyerDashboard: RFQ deleted',
            data
        );

        setRfqs((previous) =>
            previous.filter(
                (rfq) =>
                    Number(rfq.id) !==
                    Number(data.id)
            )
        );
    };

    socket.on(
        'new_quotation',
        handleNewQuotation
    );
    socket.on(
        'rfq_updated',
        handleRfqUpdated
    );
    socket.on(
        'rfq_deleted',
        handleRfqDeleted
    );
    return () => {
        socket.off(
            'new_quotation',
            handleNewQuotation
        );
        socket.off(
            'rfq_updated',
            handleRfqUpdated
        );
        socket.off(
            'rfq_deleted',
            handleRfqDeleted
        );
    };
}, [socket]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this RFQ? All associated quotations will be removed.')) {
            return;
        }
        try {
            setDeletingId(id);
            await API.delete(`/rfqs/${id}`);
            setRfqs((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete RFQ.');
        } finally {
            setDeletingId(null);
        }
    };

    const totalCount = rfqs.length;
    const openCount = rfqs.filter((r) => r.status === 'OPEN').length;
    const awardedCount = rfqs.filter((r) => r.status === 'AWARDED').length;
    const totalQuotesReceived = rfqs.reduce((acc, curr) => acc + (curr._count?.quotations || 0), 0);
    const filteredRfqs = rfqs.filter((r) => {
        if (filter === 'ALL') return true;
        return r.status === filter;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN':
                return <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">OPEN</span>;
            case 'AWARDED':
                return <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">AWARDED / COMPLETED</span>;
            case 'CLOSED':
                return <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30 rounded-full">CLOSED</span>;
            default:
                return <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Buyer Command Center</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage your active business requirements and review supplier quotations</p>
                </div>
                <Link
                    to="/buyer/create-rfq"
                    className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition cursor-pointer"
                >
                    <PlusCircle className="w-4 h-4" />
                    Create New RFQ
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Total Posted</span>
                        <Layers className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mt-2">{totalCount}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Active / Open</span>
                        <Clock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400 mt-2">{openCount}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Deals Awarded</span>
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-2xl font-bold text-sky-400 mt-2">{awardedCount}</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Quotes Received</span>
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-amber-400 mt-2">{totalQuotesReceived}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                {['ALL', 'OPEN', 'AWARDED', 'CLOSED'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${filter === f
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                    >
                        {f === 'ALL' ? 'All RFQs' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : filteredRfqs.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-200">No RFQs Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {filter === 'ALL'
                            ? "You haven't created any RFQs yet. Create your first RFQ to start receiving quotations."
                            : `No RFQs match the status "${filter}".`}
                    </p>
                    {filter === 'ALL' && (
                        <Link
                            to="/buyer/create-rfq"
                            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Post Your First RFQ
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRfqs.map((rfq) => (
                        <div
                            key={rfq.id}
                            className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition duration-200 hover:shadow-indigo-500/5 group"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-800/40">
                                        {rfq.category}
                                    </span>
                                    {getStatusBadge(rfq.status)}
                                </div>
                                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                                    {rfq.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                    {rfq.description}
                                </p>
                                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Volume:</span>
                                        <span className="font-medium text-slate-200">{rfq.quantity.toLocaleString()} {rfq.unit}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            Location:
                                        </span>
                                        <span className="font-medium text-slate-200 truncate max-w-35">{rfq.deliveryLocation}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Deadline:
                                        </span>
                                        <span className="font-medium text-slate-200">
                                            {new Date(rfq.deadline).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {rfq.targetBudget && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Target Budget:</span>
                                            <span className="font-semibold text-emerald-400">
                                                ${Number(rfq.targetBudget).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{rfq._count?.quotations || 0} Quotes</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(rfq.id)}
                                        disabled={deletingId === rfq.id}
                                        title="Delete RFQ"
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <Link
                                        to={`/rfqs/${rfq.id}`}
                                        className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 px-3 py-1.5 rounded-xl border border-indigo-800/50 transition cursor-pointer"
                                    >
                                        <span>View</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}