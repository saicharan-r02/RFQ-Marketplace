import { useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { BarChart3, PieChart, TrendingUp, Layers, DollarSign, Package, CheckCircle2, Award, Info } from 'lucide-react';

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

const statusColors = {
    OPEN: '#6366f1',         // Indigo
    UNDER_REVIEW: '#f59e0b', // Amber
    AWARDED: '#10b981',      // Emerald
    CLOSED: '#64748b',       // Slate
};

export default function AnalyticsCharts({ rfqs = [] }) {
    const [activeTab, setActiveTab] = useState('ALL');
    const [barMetric, setBarMetric] = useState('count'); // 'count' or 'budget'

    // If no RFQs exist, provide sample preview data option
    const hasData = Array.isArray(rfqs) && rfqs.length > 0;

    // 1. Process Category Data for Bar Chart
    const categoryMap = {};
    rfqs.forEach((rfq) => {
        const cat = rfq.category || 'General';
        if (!categoryMap[cat]) {
            categoryMap[cat] = {
                category: cat,
                count: 0,
                totalBudget: 0,
            };
        }
        categoryMap[cat].count += 1;
        categoryMap[cat].totalBudget += Number(rfq.targetBudget || 0);
    });

    const categoryData = Object.values(categoryMap).map((item) => ({
        category: item.category.length > 12 ? `${item.category.slice(0, 11)}…` : item.category,
        fullCategory: item.category,
        count: item.count,
        totalBudget: item.totalBudget,
    }));

    // 2. Process Status Data for Pie / Donut Chart
    const statusCounts = { OPEN: 0, UNDER_REVIEW: 0, AWARDED: 0, CLOSED: 0 };
    rfqs.forEach((rfq) => {
        const s = (rfq.status || 'OPEN').toUpperCase();
        if (statusCounts[s] !== undefined) {
            statusCounts[s] += 1;
        } else {
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        }
    });

    const statusData = Object.entries(statusCounts)
        .filter(([, val]) => val > 0)
        .map(([key, val]) => ({
            id: key,
            label: key.replace('_', ' '),
            value: val,
            color: statusColors[key] || '#8b5cf6',
        }));

    // 3. Process Timeline Data for Line Chart
    const timelineMap = {};
    rfqs.forEach((rfq) => {
        const d = new Date(rfq.createdAt || Date.now());
        const day = d.toISOString().slice(5, 10); // MM-DD
        timelineMap[day] = (timelineMap[day] || 0) + 1;
    });

    const sortedDays = Object.keys(timelineMap).sort();
    let cumulative = 0;
    const timelinePoints = sortedDays.map((day) => {
        cumulative += timelineMap[day];
        return {
            x: day,
            y: timelineMap[day],
            cumulative,
        };
    });

    const lineData = [
        {
            id: 'Daily RFQs',
            color: '#6366f1',
            data: timelinePoints.length > 0 ? timelinePoints : [{ x: 'Today', y: 1 }],
        },
    ];

    // 4. Quotations Volume per RFQ (Top 5 active RFQs)
    const quoteVolumeData = [...rfqs]
        .map((rfq) => ({
            title: rfq.title.length > 18 ? `${rfq.title.slice(0, 17)}…` : rfq.title,
            fullTitle: rfq.title,
            quotes: rfq._count?.quotations ?? rfq.quotations?.length ?? 0,
            budget: Number(rfq.targetBudget || 0),
        }))
        .sort((a, b) => b.quotes - a.quotes)
        .slice(0, 6);

    // Calculate Summary High-Level Metrics
    const totalPipelineValue = rfqs.reduce((sum, r) => sum + Number(r.targetBudget || 0), 0);
    const totalQuotesCount = rfqs.reduce((sum, r) => sum + (r._count?.quotations ?? r.quotations?.length ?? 0), 0);
    const avgQuotesPerRfq = rfqs.length > 0 ? (totalQuotesCount / rfqs.length).toFixed(1) : '0';

    if (!hasData) {
        return (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 text-center text-slate-400">
                <Info className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-200">No procurement data to visualize yet</p>
                <p className="text-xs text-slate-500 mt-1">Post your first RFQ to generate dynamic interactive charts and analytics.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                            <BarChart3 className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                Procurement Analytics & Insights
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                                    Nivo Powered
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Real-time data visualization of categories, lifecycle status, trends, and supplier engagement</p>
                        </div>
                    </div>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80 self-start sm:self-center overflow-x-auto max-w-full">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'ALL'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('BAR')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'BAR'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Categories (Bar)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('PIE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'PIE'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <PieChart className="w-3.5 h-3.5" />
                        Status (Donut)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('LINE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'LINE'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Trend (Line)
                    </button>
                </div>
            </div>

            {/* Quick KPI Summary Ribbons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Pipeline Value
                    </span>
                    <div className="text-lg font-bold text-white mt-1">
                        ${totalPipelineValue.toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-indigo-400" /> Active RFQs
                    </span>
                    <div className="text-lg font-bold text-indigo-400 mt-1">
                        {rfqs.length}
                    </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Quotes Received
                    </span>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                        {totalQuotesCount}
                    </div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Bids / RFQ Avg
                    </span>
                    <div className="text-lg font-bold text-sky-400 mt-1">
                        {avgQuotesPerRfq}
                    </div>
                </div>
            </div>

            {/* Charts View Area */}
            {(activeTab === 'ALL' || activeTab === 'BAR') && (
                <div className={activeTab === 'ALL' ? 'grid grid-cols-1 lg:grid-cols-3 gap-5' : 'grid grid-cols-1 lg:grid-cols-2 gap-5'}>
                    {/* Category Volume & Budget Bar Chart */}
                    <div className={`bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col ${activeTab === 'ALL' ? 'lg:col-span-2' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Bar Chart Representation</span>
                                <h3 className="text-sm font-bold text-white">RFQ Volume & Spend by Category</h3>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
                                <button
                                    type="button"
                                    onClick={() => setBarMetric('count')}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
                                        barMetric === 'count' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    RFQ Count
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBarMetric('budget')}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition cursor-pointer ${
                                        barMetric === 'budget' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Target Budget ($)
                                </button>
                            </div>
                        </div>

                        <div className="h-72 w-full mt-2">
                            <ResponsiveBar
                                data={categoryData}
                                keys={[barMetric === 'count' ? 'count' : 'totalBudget']}
                                indexBy="category"
                                margin={{ top: 20, right: 25, bottom: 55, left: barMetric === 'budget' ? 65 : 45 }}
                                padding={0.4}
                                valueScale={{ type: 'linear' }}
                                indexScale={{ type: 'band', round: true }}
                                colors={barMetric === 'count' ? ['#6366f1'] : ['#10b981']}
                                borderRadius={6}
                                borderWidth={1}
                                borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                    tickSize: 0,
                                    tickPadding: 10,
                                    legend: 'Category',
                                    legendPosition: 'middle',
                                    legendOffset: 40,
                                }}
                                axisLeft={{
                                    tickSize: 0,
                                    tickPadding: 8,
                                    legend: barMetric === 'count' ? 'RFQs' : 'Budget ($)',
                                    legendPosition: 'middle',
                                    legendOffset: barMetric === 'budget' ? -55 : -35,
                                    format: (v) => barMetric === 'budget' ? `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}` : v,
                                }}
                                enableLabel={true}
                                labelFormat={(v) => barMetric === 'budget' ? `$${Number(v).toLocaleString()}` : v}
                                labelTextColor="#f8fafc"
                                theme={nivoDarkTheme}
                                tooltip={({ data }) => (
                                    <div className="space-y-1">
                                        <div className="font-bold text-white text-xs">{data.fullCategory}</div>
                                        <div className="text-[11px] text-slate-300">
                                            RFQs Posted: <span className="font-semibold text-indigo-400">{data.count}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-300">
                                            Total Budget: <span className="font-semibold text-emerald-400">${data.totalBudget.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* RFQ Status Breakdown Donut / Pie Chart */}
                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col">
                        <div className="mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Pie / Donut Representation</span>
                            <h3 className="text-sm font-bold text-white">Status Breakdown</h3>
                        </div>

                        <div className="h-72 w-full relative">
                            <ResponsivePie
                                data={statusData}
                                margin={{ top: 20, right: 30, bottom: 45, left: 30 }}
                                innerRadius={0.58}
                                padAngle={1.2}
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
                                            Count: <span className="font-semibold text-white">{datum.value} RFQs</span> ({((datum.value / rfqs.length) * 100).toFixed(0)}%)
                                        </div>
                                    </div>
                                )}
                            />
                            {/* Centered Donut Total */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                                <span className="text-2xl font-extrabold text-white">{rfqs.length}</span>
                                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Quotations Inflow per RFQ (Horizontal Bar) - rendered in BAR view */}
                    {activeTab === 'BAR' && (
                        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col lg:col-span-2">
                            <div className="mb-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Horizontal Bar Representation</span>
                                <h3 className="text-sm font-bold text-white">Quotations Inflow per RFQ (Top Bids Activity)</h3>
                            </div>
                            <div className="h-72 w-full mt-2">
                                <ResponsiveBar
                                    data={quoteVolumeData}
                                    keys={['quotes']}
                                    indexBy="title"
                                    layout="horizontal"
                                    margin={{ top: 15, right: 30, bottom: 45, left: 140 }}
                                    padding={0.35}
                                    colors={['#8b5cf6']}
                                    borderRadius={5}
                                    axisTop={null}
                                    axisRight={null}
                                    axisBottom={{
                                        tickSize: 0,
                                        tickPadding: 8,
                                        legend: 'Quotes Received',
                                        legendPosition: 'middle',
                                        legendOffset: 35,
                                    }}
                                    axisLeft={{
                                        tickSize: 0,
                                        tickPadding: 8,
                                    }}
                                    enableLabel={true}
                                    labelTextColor="#f8fafc"
                                    theme={nivoDarkTheme}
                                    tooltip={({ data }) => (
                                        <div className="space-y-1">
                                            <div className="font-bold text-white text-xs">{data.fullTitle}</div>
                                            <div className="text-[11px] text-slate-300">
                                                Quotes Received: <span className="font-semibold text-indigo-400">{data.quotes}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-300">
                                                Target Budget: <span className="font-semibold text-emerald-400">${data.budget.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Standalone PIE view */}
            {activeTab === 'PIE' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col">
                        <div className="mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Pie / Donut Representation</span>
                            <h3 className="text-sm font-bold text-white">RFQ Lifecycle Status Mix</h3>
                        </div>
                        <div className="h-80 w-full relative">
                            <ResponsivePie
                                data={statusData}
                                margin={{ top: 25, right: 40, bottom: 45, left: 40 }}
                                innerRadius={0.6}
                                padAngle={1.5}
                                cornerRadius={6}
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
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                                <span className="text-3xl font-extrabold text-white">{rfqs.length}</span>
                                <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Total RFQs</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-center space-y-4">
                        <h4 className="text-sm font-bold text-white">Status Breakdown Details</h4>
                        <div className="space-y-3">
                            {statusData.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <div>
                                            <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                                            <div className="text-[11px] text-slate-500">
                                                {item.id === 'OPEN' && 'Active for supplier proposals'}
                                                {item.id === 'UNDER_REVIEW' && 'Reviewing submitted quotes'}
                                                {item.id === 'AWARDED' && 'Contract awarded to supplier'}
                                                {item.id === 'CLOSED' && 'Expired or fulfilled'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-white">{item.value}</span>
                                        <div className="text-[11px] text-slate-400">
                                            {((item.value / rfqs.length) * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* LINE / Timeline View */}
            {(activeTab === 'ALL' || activeTab === 'LINE') && (
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Line Graph Representation</span>
                            <h3 className="text-sm font-bold text-white">Procurement Velocity & RFQ Timeline</h3>
                        </div>
                        <div className="text-xs text-slate-400">
                            Showing posting frequency over recent activity
                        </div>
                    </div>

                    <div className="h-72 w-full mt-2">
                        <ResponsiveLine
                            data={lineData}
                            margin={{ top: 20, right: 30, bottom: 50, left: 45 }}
                            xScale={{ type: 'point' }}
                            yScale={{ type: 'linear', min: 0, nice: true }}
                            curve="monotoneX"
                            axisTop={null}
                            axisRight={null}
                            axisBottom={{
                                tickSize: 0,
                                tickPadding: 10,
                                legend: 'Date (MM-DD)',
                                legendPosition: 'middle',
                                legendOffset: 38,
                            }}
                            axisLeft={{
                                tickSize: 0,
                                tickPadding: 8,
                                legend: 'RFQs Created',
                                legendPosition: 'middle',
                                legendOffset: -35,
                            }}
                            enableGridX={false}
                            enableGridY={true}
                            colors={['#6366f1']}
                            lineWidth={3}
                            enablePoints={true}
                            pointSize={8}
                            pointColor="#090d16"
                            pointBorderWidth={2.5}
                            pointBorderColor="#6366f1"
                            enableArea={true}
                            areaOpacity={0.15}
                            areaBaselineValue={0}
                            theme={nivoDarkTheme}
                            tooltip={({ point }) => (
                                <div className="space-y-1">
                                    <div className="font-bold text-white text-xs">Date: {point.data.x}</div>
                                    <div className="text-[11px] text-slate-300">
                                        RFQs Posted: <span className="font-semibold text-indigo-400">{point.data.y}</span>
                                    </div>
                                    {point.data.cumulative !== undefined && (
                                        <div className="text-[11px] text-slate-400">
                                            Cumulative Total: <span className="font-semibold text-emerald-400">{point.data.cumulative}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
