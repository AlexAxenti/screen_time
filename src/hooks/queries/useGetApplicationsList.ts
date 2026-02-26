import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { PagedAppSearch } from "../../types/tauriDtos";

const useGetApplicationsList = (
	startTime: number,
	endTime: number,
	pageCount: number,
	pageSize: number,
	sortValue?: "window_exe" | "duration",
	sortDirection?: "ASC" | "DESC",
	searchValue?: string,
) => {
	return useQuery({
		queryKey: ["applications_list", startTime, endTime, pageCount, pageSize, sortValue, sortDirection, searchValue],
		queryFn: async () => {
			try {
				const applications: PagedAppSearch = await invoke(
					"get_applications_list",
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
				console.error("get applications list failed");
				throw e;
			}
		},
	});
};

export default useGetApplicationsList;
