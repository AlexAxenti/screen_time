import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { AppUsageSummary } from "../../types/tauriDtos";

const useGetAppUsageSummary = (startTime: number, endTime: number, appId: string) => {
	return useQuery({
		queryKey: ["app_usage_summary", startTime, endTime, appId],
		queryFn: async () => {
			try {
				const summary: AppUsageSummary = await invoke("get_app_usage_summary", {
					startTime,
					endTime,
					appId,
				});
				return summary;
			} catch (e) {
				console.error("get_app_usage_summary invoke failed");
				throw e;
			}
		},
	});
};

export default useGetAppUsageSummary;
