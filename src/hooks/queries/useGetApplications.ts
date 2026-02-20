import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationUsage } from "../../types/tauriDtos";

const useGetApplications = (
	startTime: number,
	endTime: number,
	pageCount: number,
	pageSize: number,
	sortValue?: "window_exe" | "duration",
	sortDirection?: "ASC" | "DESC",
	searchValue?: string,
) => {
	return useQuery({
		queryKey: ["applications", startTime, endTime, pageCount, pageSize, sortValue, sortDirection, searchValue],
		queryFn: async () => {
			try {
				const applications: ApplicationUsage[] = await invoke(
					"get_applications",
					{
						startTime,
						endTime,
						pageCount,
						pageSize,
						sortValue,
						sortDirection,
						searchValue
					},
				);
				return applications;
			} catch (e) {
				console.error("get top usage failed");
				throw e;
			}
		},
	});
};

export default useGetApplications;
