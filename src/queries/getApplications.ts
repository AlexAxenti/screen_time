import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationUsage } from "../types/dto";

const useGetApplications = (
	startTime: number,
	endTime: number,
	sortValue?: string,
	sortDirection?: string
) => {
	return useQuery({
		queryKey: ["applications", startTime, endTime, sortValue, sortDirection],
		queryFn: async () => {
			try {
				const applications: ApplicationUsage[] = await invoke("get_applications", {
					startTime,
					endTime,
					sortValue,
					sortDirection,
				});
				return applications;
			} catch (e) {
				console.error("get top usage failed");
				throw e;
			}
		},
	});
};

export default useGetApplications;
