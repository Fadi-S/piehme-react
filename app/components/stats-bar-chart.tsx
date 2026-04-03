import type { ChartPoint } from "~/features/insights/insightsApiSlice";

interface StatsBarChartProps {
    data: ChartPoint[];
    valueSuffix?: string;
    secondarySuffix?: string;
}

function normalize(value: number | null | undefined, max: number) {
    if (!value || max <= 0) {
        return 0;
    }

    return (value / max) * 100;
}

export default function StatsBarChart({ data, valueSuffix = "", secondarySuffix = "" }: StatsBarChartProps) {
    const maxValue = Math.max(
        1,
        ...data.flatMap((point) => [point.value ?? 0, point.secondaryValue ?? 0]),
    );

    if (data.length === 0) {
        return <div className="text-sm text-gray-500">No chart data available.</div>;
    }

    return (
        <div className="space-y-4">
            {data.map((point) => (
                <div key={point.label} className="space-y-1">
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-medium text-gray-700">{point.label}</span>
                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                            {point.value !== null && <span>{point.value.toFixed(2)}{valueSuffix}</span>}
                            {point.secondaryValue !== null && <span>{point.secondaryValue.toFixed(2)}{secondarySuffix}</span>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {point.value !== null && (
                            <div className="h-3 overflow-hidden rounded-full bg-amber-100">
                                <div
                                    className="h-full rounded-full bg-amber-700 transition-all"
                                    style={{ width: `${normalize(point.value, maxValue)}%` }}
                                />
                            </div>
                        )}
                        {point.secondaryValue !== null && (
                            <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all"
                                    style={{ width: `${normalize(point.secondaryValue, maxValue)}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
