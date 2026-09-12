import { useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { PieChart, BarChart3, TrendingUp, Award, DollarSign, Clock, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const nivoDarkTheme = {
    background: 'transparent',
    text: {
        fontSize: 11,
        fill: '#94a3b8',
        outlineWidth: 0,
        outlineColor: 'transparent',
    },
    axis: {
        domain: {
            line: {
                stroke: '#334155',
                strokeWidth: 1,
            },
        },
        legend: {
            text: {
                fontSize: 11,
                fontWeight: 600,
                fill: '#cbd5e1',
            },
        },
        ticks: {
            line: {
                stroke: '#334155',
                strokeWidth: 1,
            },
            text: {
                fontSize: 10,
                fill: '#94a3b8',
            },
        },
    },
    grid: {
        line: {
            stroke: '#1e293b',
            strokeWidth: 1,
        },
    },
    legends: {
        text: {
            fontSize: 11,
            fill: '#cbd5e1',
        },
    },
    tooltip: {
        container: {
            background: '#090d16',
            color: '#f8fafc',
            fontSize: 12,
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
            padding: '8px 12px',
        },
    },
    crosshair: {
        line: {
            stroke: '#6366f1',
            strokeWidth: 1,
            strokeOpacity: 0.75,
            strokeDasharray: '6 6',
        },
    },
};

const quoteStatusColors = {
    ACCEPTED: '#10b981', // Emerald
    PENDING: '#f59e0b',  // Amber
    REJECTED: '#f43f5e', // Rose
};

export default function SupplierAnalyticsCharts({ quotes = [] }) {
    const [activeTab, setActiveTab] = useState('ALL');
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!Array.isArray(quotes) || quotes.length === 0) {
        return null;
    }

    // 1. Process Status Data for Pie / Donut Chart
    const statusCounts = { ACCEPTED: 0, PENDING: 0, REJECTED: 0 };
    let totalBiddedValue = 0;
    let wonDealsValue = 0;

    quotes.forEach((q) => {
        const status = q.status || 'PENDING';
        if (statusCounts[status] !== undefined) {
            statusCounts[status] += 1;
        } else {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        }

        const price = Number(q.price || 0);
        totalBiddedValue += price;
        if (status === 'ACCEPTED') {
            wonDealsValue += price;
        }
    });

    const statusData = [
        { id: 'ACCEPTED', label: 'Accepted (Won)', value: statusCounts.ACCEPTED, color: quoteStatusColors.ACCEPTED },
        { id: 'PENDING', label: 'Under Review', value: statusCounts.PENDING, color: quoteStatusColors.PENDING },
        { id: 'REJECTED', label: 'Not Selected', value: statusCounts.REJECTED, color: quoteStatusColors.REJECTED },
    ].filter((item) => item.value > 0);

    const winRate = quotes.length > 0 ? ((statusCounts.ACCEPTED / quotes.length) * 100).toFixed(0) : 0;

    // 2. Process Bid vs Target Budget Bar Chart
    const priceComparisonData = quotes
        .filter((q) => q.rfq)
        .slice(0, 6)
        .map((q) => {
            const rawTitle = q.rfq.title || 'RFQ';
            const shortTitle = rawTitle.length > 15 ? `${rawTitle.slice(0, 14)}…` : rawTitle;
            return {
                rfq: shortTitle,
                fullTitle: rawTitle,
                myQuotePrice: Number(q.price || 0),
                buyerTargetBudget: Number(q.rfq.targetBudget || 0),
                status: q.status,
            };
        });

    // 3. Process Timeline Data for Line Chart
    const timelineMap = {};
    quotes.forEach((q) => {
        const d = new Date(q.createdAt || Date.now());
        const day = d.toISOString().slice(5, 10);
        timelineMap[day] = (timelineMap[day] || 0) + 1;
    });

    const sortedDays = Object.keys(timelineMap).sort();
    const lineData = [
        {
            id: 'Bids Submitted',
            color: '#10b981',
            data: sortedDays.map((day) => ({
                x: day,
                y: timelineMap[day],
            })),
        },
    ];

    return (
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">
                                Supplier Bid Performance & Analytics
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Track your win rates, pricing competitiveness, and quote history</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="sm:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80 self-start sm:self-center">
                        <button
                            type="button"
                            onClick={() => setActiveTab('ALL')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'ALL'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('WIN_LOSS')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'WIN_LOSS'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <PieChart className="w-3.5 h-3.5" />
                            Win Ratio
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('PRICING')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                activeTab === 'PRICING'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Pricing vs Budget
                        </button>
                    </div>
                )}
            </div>

            {!isCollapsed && (
                <>
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Won Deals Value
                            </span>
                            <div className="text-lg font-bold text-emerald-400 mt-1">
                                ${wonDealsValue.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-indigo-400" /> Win Rate
                            </span>
                            <div className="text-lg font-bold text-indigo-400 mt-1">
                                {winRate}%
                            </div>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Under Review
                            </span>
                            <div className="text-lg font-bold text-amber-400 mt-1">
                                {statusCounts.PENDING}
                            </div>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Total Bid Pipeline
                            </span>
                            <div className="text-lg font-bold text-white mt-1">
                                ${totalBiddedValue.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Chart Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Win/Loss Pie Chart */}
                        {(activeTab === 'ALL' || activeTab === 'WIN_LOSS') && (
                            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Pie / Donut Representation</span>
                                    <h3 className="text-sm font-bold text-white">Bid Win / Loss Distribution</h3>
                                </div>
                                <div className="h-72 w-full relative">
                                    <ResponsivePie
                                        data={statusData}
                                        margin={{ top: 20, right: 30, bottom: 40, left: 30 }}
                                        innerRadius={0.58}
                                        padAngle={1.5}
                                        cornerRadius={5}
                                        activeOuterRadiusOffset={8}
                                        colors={{ datum: 'data.color' }}
                                        borderWidth={1}
                                        borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                                        enableArcLinkLabels={true}
                                        arcLinkLabelsSkipAngle={10}
                                        arcLinkLabelsTextColor="#94a3b8"
                                        arcLinkLabelsThickness={1.5}
                                        arcLinkLabelsColor={{ from: 'color' }}
                                        arcLabelsSkipAngle={10}
                                        arcLabelsTextColor="#ffffff"
                                        theme={nivoDarkTheme}
                                        tooltip={({ datum }) => (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: datum.color }}></span>
                                                    <span className="font-bold text-white text-xs">{datum.label}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-300">
                                                    Quotes: <span className="font-semibold text-white">{datum.value}</span> ({((datum.value / quotes.length) * 100).toFixed(0)}%)
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                                        <span className="text-2xl font-extrabold text-white">{winRate}%</span>
                                        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Win Rate</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quoted Price vs Target Budget Bar Chart */}
                        {(activeTab === 'ALL' || activeTab === 'PRICING') && (
                            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Grouped Bar Representation</span>
                                    <h3 className="text-sm font-bold text-white">Quoted Price vs Target Budget ($)</h3>
                                </div>
                                <div className="h-72 w-full mt-2">
                                    {priceComparisonData.length > 0 ? (
                                        <ResponsiveBar
                                            data={priceComparisonData}
                                            keys={['myQuotePrice', 'buyerTargetBudget']}
                                            indexBy="rfq"
                                            groupMode="grouped"
                                            margin={{ top: 20, right: 30, bottom: 55, left: 65 }}
                                            padding={0.3}
                                            innerPadding={3}
                                            colors={['#10b981', '#6366f1']}
                                            borderRadius={5}
                                            axisTop={null}
                                            axisRight={null}
                                            axisBottom={{
                                                tickSize: 0,
                                                tickPadding: 10,
                                                legend: 'RFQ',
                                                legendPosition: 'middle',
                                                legendOffset: 40,
                                            }}
                                            axisLeft={{
                                                tickSize: 0,
                                                tickPadding: 8,
                                                legend: 'Price ($)',
                                                legendPosition: 'middle',
                                                legendOffset: -55,
                                                format: (v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
                                            }}
                                            enableLabel={false}
                                            theme={nivoDarkTheme}
                                            legends={[
                                                {
                                                    dataFrom: 'keys',
                                                    anchor: 'top-right',
                                                    direction: 'row',
                                                    justify: false,
                                                    translateX: 0,
                                                    translateY: -18,
                                                    itemsSpacing: 12,
                                                    itemWidth: 100,
                                                    itemHeight: 18,
                                                    itemDirection: 'left-to-right',
                                                    itemOpacity: 0.85,
                                                    symbolSize: 10,
                                                    symbolShape: 'circle',
                                                    effects: [{ on: 'hover', style: { itemOpacity: 1 } }],
                                                },
                                            ]}
                                            tooltip={({ id, value, data }) => (
                                                <div className="space-y-1">
                                                    <div className="font-bold text-white text-xs">{data.fullTitle}</div>
                                                    <div className="text-[11px] text-slate-300">
                                                        {id === 'myQuotePrice' ? 'Your Quote' : 'Target Budget'}:{' '}
                                                        <span className={id === 'myQuotePrice' ? 'font-bold text-emerald-400' : 'font-bold text-indigo-400'}>
                                                            ${Number(value).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-xs text-slate-500">
                                            No budget comparison data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
