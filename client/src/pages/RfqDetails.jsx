import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ArrowLeft, Building2, MapPin, Calendar, DollarSign, Truck, CheckCircle2, XCircle, Clock, Send, AlertCircle, MessageSquare, ShieldCheck } from 'lucide-react';

export default function RfqDetails() {
    const { id } = useParams();
    const { user, role, isAuthenticated } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [rfq, setRfq] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [myQuotation, setMyQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const [quoteForm, setQuoteForm] = useState({ price: '', deliveryDays: '', validUntil: '', notes: '' });
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
    const [updatingQuoteId, setUpdatingQuoteId] = useState(null);

    const fetchRfqDetails = async (showLoadingSpinner = false) => {
        try {
            if (showLoadingSpinner) setLoading(true);
            const res = await API.get(`/rfqs/${id}`);
            setRfq(res.data.data.rfq);
            setQuotations(res.data.data.quotations || []);
            setMyQuotation(res.data.data.myQuotation || null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load RFQ details.');
        } finally {
            if (showLoadingSpinner) setLoading(false);
        }
    };

    useEffect(() => {
        fetchRfqDetails(true);
    }, [id]);

    useEffect(() => {
    if (!socket) {
        return;
    }

    const handleQuotationStatusUpdated = (data) => {
        console.log(
            'RfqDetails: quotation status update received',
            data
        );

        if (Number(data.rfqId) !== Number(id)) {
            return;
        }
        fetchRfqDetails(false);
    };

    const handleNewQuotation = (data) => {
        console.log(
            'RfqDetails: new quotation received',
            data
        );

        if (Number(data.rfqId) !== Number(id)) {
            return;
        }
        fetchRfqDetails(false);
    };

    const handleRfqUpdated = (data) => {
        console.log(
            'RfqDetails: RFQ updated',
            data
        );

        if (Number(data.id) !== Number(id)) {
            return;
        }
        fetchRfqDetails(false);
    };
    socket.on(
        'quotation_status_updated',
        handleQuotationStatusUpdated
    );
    socket.on(
        'new_quotation',
        handleNewQuotation
    );
    socket.on(
        'rfq_updated',
        handleRfqUpdated
    );
    return () => {
        socket.off(
            'quotation_status_updated',
            handleQuotationStatusUpdated
        );

        socket.off(
            'new_quotation',
            handleNewQuotation
        );

        socket.off(
            'rfq_updated',
            handleRfqUpdated
        );
    };
}, [socket, id]);

    const handleQuoteStatus = async (quoteId, status) => {
        const actionLabel = status === 'ACCEPTED' ? 'Accept' : 'Reject';

        try {
            setUpdatingQuoteId(quoteId);
            setActionSuccess('');
            setQuotations((prev) =>
                prev.map((q) => {
                    if (q.id === quoteId) {
                        return { ...q, status };
                    }
                    return q;
                })
            );
            if (status === 'ACCEPTED') {
                setRfq((prev) => (prev ? { ...prev, status: 'AWARDED' } : prev));
            }

            await API.patch(`/quotations/${quoteId}/status`, { status });

            setActionSuccess(
                status === 'ACCEPTED'
                    ? 'Quotation accepted! Status marked as Completed (Awarded Deal).'
                    : 'Quotation rejected! Status marked as Completed (Rejected).'
            );
            await fetchRfqDetails(false);
        } catch (err) {
            console.error('Error updating quotation status:', err);
            await fetchRfqDetails(false);
            alert(err.response?.data?.message || `Failed to ${actionLabel.toLowerCase()} quotation.`);
        } finally {
            setUpdatingQuoteId(null);
        }
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingQuote(true);
        setActionSuccess('');

        try {
            const payload = {
                price: parseFloat(quoteForm.price),
                deliveryDays: parseInt(quoteForm.deliveryDays, 10),
                validUntil: quoteForm.validUntil || undefined,
                notes: quoteForm.notes,
            };

            const res = await API.post(`/rfqs/${id}/quotations`, payload);
            setActionSuccess('Your quotation has been submitted successfully!');
            setMyQuotation(res.data.data.quotation);
            await fetchRfqDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit quotation.');
        } finally {
            setIsSubmittingQuote(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !rfq) {
        return (
            <div className="text-center py-20 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-white">Error Loading RFQ</h2>
                <p className="text-xs text-slate-400 mt-1">{error || 'RFQ not found.'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-xl transition cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isOwner = user && Number(user.id) === Number(rfq.buyerId);
    const isOpen = rfq.status === 'OPEN';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN':
                return <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">OPEN</span>;
            case 'AWARDED':
                return (
                    <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        COMPLETED (AWARDED)
                    </span>
                );
            case 'CLOSED':
                return <span className="px-3 py-1 text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30 rounded-full">CLOSED</span>;
            default:
                return <span className="px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-2">

            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            {actionSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{actionSuccess}</span>
                </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-800/40">
                                {rfq.category}
                            </span>
                            {getStatusBadge(rfq.status)}
                        </div>
                        <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">{rfq.title}</h1>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-4 py-2.5 rounded-2xl">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div className="text-xs">
                            <span className="text-slate-400 block">Buyer Organization</span>
                            <strong className="text-slate-200">{rfq.buyer?.companyName}</strong>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800">
                    <div>
                        <span className="text-xs text-slate-500 block">Required Volume</span>
                        <span className="text-sm sm:text-base font-semibold text-white mt-0.5 block">
                            {rfq.quantity.toLocaleString()} {rfq.unit}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            Delivery Location
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-white mt-0.5 block truncate">
                            {rfq.deliveryLocation}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Submission Deadline
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-amber-400 mt-0.5 block">
                            {new Date(rfq.deadline).toLocaleDateString()}
                        </span>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            Target Budget
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-emerald-400 mt-0.5 block">
                            {rfq.targetBudget ? `$${Number(rfq.targetBudget).toLocaleString()}` : 'Flexible'}
                        </span>
                    </div>
                </div>

                <div className="pt-6">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Detailed Scope & Specifications
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                        {rfq.description}
                    </p>
                </div>
            </div>

            {isOwner && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                            Received Quotations ({quotations.length})
                        </h2>
                        <span className="text-xs text-slate-400">Sorted by best bid price</span>
                    </div>

                    {rfq.status === 'AWARDED' && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div>
                                <strong className="block text-emerald-200">RFQ Deal Completed & Awarded</strong>
                                <span className="text-xs text-emerald-400/90">A supplier proposal has been accepted. The winning quotation is marked Completed below.</span>
                            </div>
                        </div>
                    )}

                    {quotations.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                            <h3 className="text-sm font-semibold text-slate-200">No Quotations Yet</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Suppliers have not submitted quotes on this RFQ yet. Incoming bids will appear here automatically in real-time.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quotations.map((q) => (
                                <div
                                    key={q.id}
                                    className={`bg-slate-900/90 border rounded-2xl p-5 sm:p-6 transition shadow-lg ${
                                        q.status === 'ACCEPTED'
                                            ? 'border-emerald-500/50 bg-emerald-950/15 ring-1 ring-emerald-500/30'
                                            : q.status === 'REJECTED'
                                                ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
                                                : 'border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-base">{q.supplier?.companyName}</h4>
                                                <span className="text-xs text-slate-400">({q.supplier?.name})</span>
                                                {q.status === 'ACCEPTED' && (
                                                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1 border border-emerald-500/30">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed • Awarded Deal
                                                    </span>
                                                )}
                                                {q.status === 'REJECTED' && (
                                                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/20 text-rose-400 rounded-full flex items-center gap-1 border border-rose-500/30">
                                                        <XCircle className="w-3.5 h-3.5" /> Completed • Rejected
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{q.supplier?.email} • {q.supplier?.phone || 'No phone provided'}</p>

                                            {q.notes && (
                                                <p className="text-xs text-slate-300 italic bg-slate-800/40 p-3 rounded-xl border border-slate-800 mt-3 max-w-xl">
                                                    "{q.notes}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                            <div className="text-left sm:text-right">
                                                <span className="text-xs text-slate-500">Quoted Price</span>
                                                <div className="text-2xl font-bold text-emerald-400 flex items-center sm:justify-end">
                                                    ${Number(q.price).toLocaleString()}
                                                </div>
                                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                                                    Delivery in {q.deliveryDays} days
                                                </span>
                                            </div>

                                            {updatingQuoteId === q.id ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium">
                                                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-white rounded-full animate-spin"></div>
                                                    <span>Updating Status...</span>
                                                </div>
                                            ) : q.status === 'ACCEPTED' ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/40">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    <span>Completed (Awarded Deal)</span>
                                                </div>
                                            ) : q.status === 'REJECTED' ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold shadow-sm">
                                                    <XCircle className="w-4 h-4 text-rose-400" />
                                                    <span>Completed (Rejected)</span>
                                                </div>
                                            ) : rfq.status === 'AWARDED' ? (
                                                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-xl text-xs font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>RFQ Completed (Another Quote Awarded)</span>
                                                </div>
                                            ) : rfq.status !== 'CLOSED' ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuoteStatus(q.id, 'REJECTED')}
                                                        disabled={updatingQuoteId !== null}
                                                        className="px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/30 hover:border-rose-500/50 rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Reject
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuoteStatus(q.id, 'ACCEPTED')}
                                                        disabled={updatingQuoteId !== null}
                                                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Accept & Award
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-xl text-xs font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    <span>RFQ Closed</span>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {role === 'SUPPLIER' && !isOwner && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">

                    {myQuotation ? (
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-lg font-bold text-white">Your Submitted Quotation</h2>
                                </div>
                                {myQuotation.status === 'ACCEPTED' ? (
                                    <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepted / Won!
                                    </span>
                                ) : myQuotation.status === 'REJECTED' ? (
                                    <span className="px-3 py-1 text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full">
                                        Not Selected
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> Under Buyer Review
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5">
                                <div>
                                    <span className="text-xs text-slate-500">Your Quoted Price</span>
                                    <p className="text-xl font-bold text-emerald-400 mt-1">
                                        ${Number(myQuotation.price).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500">Delivery Lead Time</span>
                                    <p className="text-sm font-semibold text-white mt-1">
                                        {myQuotation.deliveryDays} business days
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500">Submitted On</span>
                                    <p className="text-sm font-semibold text-white mt-1">
                                        {new Date(myQuotation.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {myQuotation.notes && (
                                <div className="pt-2">
                                    <span className="text-xs text-slate-500 block mb-1">Your Proposal Notes:</span>
                                    <p className="text-xs text-slate-300 italic bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                                        "{myQuotation.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : isOpen ? (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Send className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-white">Submit Your Quotation</h2>
                            </div>

                            <form onSubmit={handleQuoteSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                            Total Bid Price in USD ($) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            step="0.01"
                                            value={quoteForm.price}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                                            placeholder="e.g. 45000"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                            Estimated Delivery Time (Days) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={quoteForm.deliveryDays}
                                            onChange={(e) => setQuoteForm({ ...quoteForm, deliveryDays: e.target.value })}
                                            placeholder="e.g. 14"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Quote Validity Expiration Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={quoteForm.validUntil}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                        Proposal Terms / Notes to Buyer *
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        value={quoteForm.notes}
                                        onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                                        placeholder="Include warranty details, payment milestones (e.g. 50/50), freight terms (FOB/CIF), or bulk discounts..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingQuote}
                                    className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isSubmittingQuote ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Submit Quotation Proposal</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400 text-xs">
                            This RFQ is currently <span className="font-semibold text-white">{rfq.status}</span> and is no longer accepting quotation proposals.
                        </div>
                    )}

                </div>
            )}

            {!isAuthenticated && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
                    <p className="text-sm text-slate-300">
                        Are you a supplier capable of fulfilling this requirement?
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 mt-3 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition cursor-pointer"
                    >
                        Log In as Supplier to Submit Quote
                    </Link>
                </div>
            )}

        </div>
    );
}