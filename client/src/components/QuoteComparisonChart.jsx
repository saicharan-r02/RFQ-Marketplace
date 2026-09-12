import { ResponsiveBar } from '@nivo/bar';
import { TrendingDown, ShieldCheck, DollarSign, Truck, AlertCircle, BarChart2 } from 'lucide-react';

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
    tooltip: {
        container: {
            background: '#090d16',
            color: '#f8fafc',
            fontSize: 12,
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
            padding: '10px 14px',
        },
    },
};

export default function QuoteComparisonChart({ quotations = [], targetBudget = 0 }) {
    if (!quotations || quotations.length === 0) {
        return null;
    }

    const budgetNum = Number(targetBudget || 0);

    // Prepare chart data
    const chartData = quotations.map((q) => {
        const priceNum = Number(q.price || 0);
        const supplierName = q.supplier?.companyName || q.supplier?.name || `Supplier #${q.supplierId}`;
        const shortName = supplierName.length > 15 ? `${supplierName.slice(0, 14)}…` : supplierName;

        let color = '#6366f1'; // default indigo
        if (budgetNum > 0) {
            if (priceNum < budgetNum) {
                color = '#10b981'; // below budget: savings (emerald)
            } else if (priceNum === budgetNum) {
                color = '#f59e0b'; // exact budget (amber)
            } else {
                color = '#f43f5e'; // above budget (rose)
            }
        }

        const diff = budgetNum > 0 ? priceNum - budgetNum : 0;
        const diffPercent = budgetNum > 0 ? ((diff / budgetNum) * 100).toFixed(1) : 0;

        return {
            supplier: shortName,
            fullSupplier: supplierName,
            price: priceNum,
            color,
            deliveryDays: q.deliveryDays,
            diff,
            diffPercent,
            status: q.status,
            quoteId: q.id,
        };
    });

    // Best / Lowest Quote stats
    const lowestQuote = [...chartData].sort((a, b) => a.price - b.price)[0];
    const maxSavings = budgetNum > 0 && lowestQuote && lowestQuote.price < budgetNum
        ? budgetNum - lowestQuote.price
        : 0;

    return (
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                        <BarChart2 className="w-5 h-5" />
                    </span>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            Bid Price Comparison Chart
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                                Nivo Bar
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400">Comparing supplier quotations against your Target Budget of ${budgetNum.toLocaleString()}</p>
                    </div>
                </div>

                {lowestQuote && (
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        {maxSavings > 0 ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-400">
                                <TrendingDown className="w-4 h-4" />
                                Save up to ${maxSavings.toLocaleString()} with {lowestQuote.supplier}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-300">
                                <ShieldCheck className="w-4 h-4" />
                                Lowest Bid: ${lowestQuote.price.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Target Budget Reference Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-1 px-3 bg-slate-950/60 border border-slate-800/70 rounded-xl">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-3 rounded-md bg-emerald-500" />
                        Under Target Budget (Savings)
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-3 rounded-md bg-rose-500" />
                        Above Target Budget
                    </span>
                </div>
                <div className="text-slate-400">
                    Target Budget: <span className="font-bold text-white">${budgetNum.toLocaleString()}</span>
                </div>
            </div>

            <div className="h-64 w-full mt-2">
                <ResponsiveBar
                    data={chartData}
                    keys={['price']}
                    indexBy="supplier"
                    margin={{ top: 20, right: 30, bottom: 50, left: 65 }}
                    padding={0.4}
                    colors={({ data }) => data.color}
                    borderRadius={6}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 0,
                        tickPadding: 10,
                        legend: 'Suppliers',
                        legendPosition: 'middle',
                        legendOffset: 38,
                    }}
                    axisLeft={{
                        tickSize: 0,
                        tickPadding: 8,
                        legend: 'Quoted Price ($)',
                        legendPosition: 'middle',
                        legendOffset: -55,
                        format: (v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
                    }}
                    enableLabel={true}
                    labelFormat={(v) => `$${Number(v).toLocaleString()}`}
                    labelTextColor="#ffffff"
                    theme={nivoDarkTheme}
                    tooltip={({ data }) => (
                        <div className="space-y-1.5">
                            <div className="font-bold text-white text-xs">{data.fullSupplier}</div>
                            <div className="text-xs text-slate-300 flex items-center justify-between gap-4">
                                <span>Quoted Price:</span>
                                <span className="font-bold text-white">${data.price.toLocaleString()}</span>
                            </div>
                            {budgetNum > 0 && (
                                <div className="text-xs flex items-center justify-between gap-4">
                                    <span className="text-slate-400">vs Target Budget:</span>
                                    <span className={`font-bold ${data.diff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {data.diff <= 0 ? `-$${Math.abs(data.diff).toLocaleString()} (${Math.abs(data.diffPercent)}% savings)` : `+$${data.diff.toLocaleString()} (+${data.diffPercent}%)`}
                                    </span>
                                </div>
                            )}
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 pt-1 border-t border-slate-800">
                                <Truck className="w-3 h-3 text-slate-500" />
                                <span>Delivery in {data.deliveryDays} days</span>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
