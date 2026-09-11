import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { FileText, Building2, ExternalLink, Clock, CheckCircle2, XCircle, DollarSign, Truck } from 'lucide-react';

export default function SupplierQuotes() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyQuotes = async () => {
        try {
            setLoading(true);
            const res = await API.get('/quotations/my-quotes');
            setQuotes(res.data.data.quotations || []);
        } catch (err) {
            console.error('Failed to load supplier quotes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyQuotes();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accepted / Won!
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        Not Selected
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Under Review
                    </span>
                );
        }
    };

    return (
        <div className="space-y-8">

            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Quotations</h1>
                <p className="text-sm text-slate-400 mt-1">Track the status and details of all quotation proposals you have submitted</p>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : quotes.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-200">No Quotations Submitted Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Explore the RFQ Marketplace to find opportunities and submit your business proposals.
                    </p>
                    <Link
                        to="/supplier/marketplace"
                        className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition cursor-pointer"
                    >
                        Explore Marketplace
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {quotes.map((q) => (
                        <div
                            key={q.id}
                            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg transition hover:border-slate-700"
                        >

                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-800/40">
                                        {q.rfq?.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Buyer: <strong className="text-slate-200">{q.rfq?.buyer?.companyName}</strong></span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white">
                                    {q.rfq?.title}
                                </h3>

                                {q.notes && (
                                    <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 max-w-xl">
                                        "{q.notes}"
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">

                                <div className="text-left sm:text-right">
                                    <div className="text-xs text-slate-500">Your Bid Price</div>
                                    <div className="text-xl font-bold text-emerald-400 flex items-center gap-0.5">
                                        <DollarSign className="w-4 h-4 -mr-1" />
                                        {Number(q.price).toLocaleString()}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                        <Truck className="w-3 h-3 text-slate-500" />
                                        {q.deliveryDays} Days Lead Time
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(q.status)}

                                    <Link
                                        to={`/rfqs/${q.rfq?.id}`}
                                        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition mt-1"
                                    >
                                        <span>View RFQ</span>
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