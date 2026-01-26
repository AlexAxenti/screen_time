import { Box } from "@mui/material";
import { Bar, BarChart, Cell, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useGetWeeksDailyUsage from "../../queries/getWeeksDailyUsage";
import { getStartOfDayMs } from "../../lib/epochDayHelpers";
import { formatMsToHoursOrMinutes } from "../../lib/durationHelpers";
import { useMemo, useState } from "react";

interface LastWeekScaffold {
  startOfDayMs: number;
  dayLabel: string;
  order: number;
}

interface UsageFragmentationChartProps {
  epochStartOfWeekMs: number,
  epochEndOfWeekMs: number,
  handleSetRange: (startMs: number, endMs: number) => void,
}

const WeeklyUsageChart = ({ 
  epochStartOfWeekMs, 
  epochEndOfWeekMs, 
  handleSetRange 
}: UsageFragmentationChartProps) => {
  const { data: weeksDailyUsage } = useGetWeeksDailyUsage(epochStartOfWeekMs, epochEndOfWeekMs);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const lastWeekScaffold: LastWeekScaffold[] = useMemo(() => {
    const scaffold: LastWeekScaffold[] = [];
    const startOfWeekDate: Date = new Date(epochStartOfWeekMs);

    for (let i = 0; i < 7; i++) {
      startOfWeekDate.setDate(startOfWeekDate.getDate() + (i === 0 ? 0 : 1));

      const dayLabel = startOfWeekDate.toLocaleDateString('en-US', { weekday: 'short' });

      scaffold.push({
        startOfDayMs: getStartOfDayMs(startOfWeekDate),
        dayLabel,
        order: i + 1,
      });
    }
    return scaffold;
  }, [epochStartOfWeekMs]);  

  const mergedWeeksDailyUsage = useMemo(() => {
    return lastWeekScaffold.map((day) => {
    const match = weeksDailyUsage?.find((usage) => usage.day_start_ms === day.startOfDayMs);
    
    return {
      ...day,
      totalDurationMs: match ? match.total_duration_ms : 0,
      segmentCount: match ? match.segment_count : 0,
      exeCount: match ? match.exe_count : 0,
    };
  });
  }, [lastWeekScaffold, weeksDailyUsage]);
  
  const selectedLabel = selectedIndex !== null ? mergedWeeksDailyUsage[selectedIndex]?.dayLabel : null;
  
  return (
    <Box sx={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={mergedWeeksDailyUsage}
          onClick={(e) => {
              const idx = e?.activeTooltipIndex;
              if (idx === null || idx === undefined) return;

              const d = mergedWeeksDailyUsage[Number(idx)];
              if (!d) return;

              handleSetRange(d.startOfDayMs ?? 0, (d.startOfDayMs ?? 0) + 24 * 60 * 60 * 1000);
              setSelectedIndex(Number(idx) === selectedIndex ? null : Number(idx));
            }}
          margin={{
            top: 5,
            right: 20,
            left: 40,
            bottom: 5,
          }}
        >
          {selectedLabel && (
            <ReferenceArea
              x1={selectedLabel}
              x2={selectedLabel}
              strokeOpacity={0}
              fill="rgba(255,255,255,0.75)"
            />
          )}

          <XAxis
            type="category"
            dataKey="dayLabel"
          />
          <YAxis
            type="number"
            allowDecimals={false}
            label={{ value: 'Daily usage', angle: -90, position: 'left', offset: 20 }}
            tickFormatter={(v) => formatMsToHoursOrMinutes(Number(v))}
          />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value) => [`${formatMsToHoursOrMinutes(Number(value))}`, 'Duration']}
          />
          <Bar
            dataKey="totalDurationMs"
            fill="#1976d2"
            radius={[6, 6, 0, 0]}
          >
            {mergedWeeksDailyUsage.map((_, i) => {
              const isSelected = selectedIndex == null || i === selectedIndex;

              return (
                <Cell
                  key={i}
                  opacity={isSelected ? 1 : 0.35} // dim others
                  stroke={i === selectedIndex ? "#fff" : undefined}
                  strokeWidth={i === selectedIndex ? 2 : 0}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default WeeklyUsageChart;