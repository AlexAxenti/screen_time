import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { AvgTimeOfDayUsage } from "../../types/tauriDtos";

const useGetAvgTimeOfDayUsage = (startTime: number, endTime: number, appId?: string) => {
	return useQuery({
		queryKey: ["avg_time_of_day_usage", startTime, endTime, appId],
		queryFn: async () => {
			try {
				let avgTimeOfDayUsage: AvgTimeOfDayUsage[] = await invoke(
					"get_app_avg_time_of_day_usage",
					{ startTime, endTime, appId },
				);
				return avgTimeOfDayUsage;
			} catch (e) {
				console.error("get app_avg_time_of_day_usage invoke failed");
				throw e;
			}
		},
	});
};

export default useGetAvgTimeOfDayUsage;
