import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationInfo } from "../../types/tauriDtos";

const useSearchApplications = (query: string, tracked?: boolean) => {
	return useQuery({
		queryKey: ["search_applications", query, tracked],
		queryFn: async () => {
			try {
				const applications: ApplicationInfo[] = await invoke(
					"search_applications",
					{
						query,
						tracked,
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
