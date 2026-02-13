import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { utcMidnightToLocalMidnight } from "../../lib/epochDayHelpers";
import type { WeeksDailyUsage } from "../../types/dto";

const useGetHeatmapUsage = (startTime: number, endTime: number, appId?: string) => {
	return useQuery({
		queryKey: ["heatmap_usage", startTime, endTime, appId],
		queryFn: async () => {
			try {
				let heatmapUsage: WeeksDailyUsage[] = await invoke(
					"get_usage_heat_map",
					{ startTime, endTime, appId },
				);
				heatmapUsage = heatmapUsage.map((usage) => ({
					...usage,
					day_start_ms: utcMidnightToLocalMidnight(usage.day_start_ms),
				}));
				return heatmapUsage;
			} catch (e) {
				console.error("get usage_heat_map invoke failed");
				throw e;
			}
		},
	});
};

export default useGetHeatmapUsage;
