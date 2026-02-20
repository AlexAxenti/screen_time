import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { UsageFragmentation } from "../../types/tauriDtos";

const useGetUsageFragmentation = (startTime: number, endTime: number, appId?: string) => {
	return useQuery({
		queryKey: ["usage_fragmentation", startTime, endTime, appId],
		queryFn: async () => {
			try {
				const fragmentation: UsageFragmentation[] = await invoke(
					"get_usage_fragmentation",
					{ startTime, endTime, appId },
				);
				return fragmentation;
			} catch (e) {
				console.error("get usage_fragmentation invoke failed");
				throw e;
			}
		},
	});
};

export default useGetUsageFragmentation;
