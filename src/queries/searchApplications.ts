import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationInfo } from "../types/dto";

const useSearchApplications = (query: string) => {
	return useQuery({
		queryKey: ["search_applications", query],
		queryFn: async () => {
			try {
				const applications: ApplicationInfo[] = await invoke(
					"search_applications",
					{
						query,
					},
				);
				return applications;
			} catch (e) {
				console.error("search applications failed");
				throw e;
			}
		},
	});
};

export default useSearchApplications;
