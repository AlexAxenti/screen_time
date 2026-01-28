import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { UsageSummary } from "../types/dto";

const useGetUsageSummary = (startTime: number, endTime: number) => {
	return useQuery({
		queryKey: ["usage_summary", startTime, endTime],
		queryFn: async () => {
			try {
				const summary: UsageSummary = await invoke("get_usage_summary", {
					startTime,
					endTime,
				});
				return summary;
			} catch (e) {
				console.error("get usage_summary invoke failed");
				throw e;
			}
		},
	});
};

export default useGetUsageSummary;
