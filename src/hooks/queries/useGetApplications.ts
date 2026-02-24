import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { PagedAppSearch } from "../../types/tauriDtos";

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
				const applications: PagedAppSearch = await invoke(
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
				console.error("get applications failed");
				throw e;
			}
		},
	});
};

export default useGetApplications;
