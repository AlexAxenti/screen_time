import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationInfo } from "../../types/tauriDtos";

const useSearchApplicationsTitles = (query: string, tracked?: boolean) => {
	return useQuery({
		queryKey: ["search_applications_titles", query, tracked],
		queryFn: async () => {
			try {
				const applications: ApplicationInfo[] = await invoke(
					"search_application_titles",
					{
						query,
						tracked,
					},
				);
				return applications;
			} catch (e) {
				console.error("search applications titles failed");
				throw e;
			}
		},
	});
};

export default useSearchApplicationsTitles;
