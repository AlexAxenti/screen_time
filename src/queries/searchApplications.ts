import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationTitles } from "../types/dto";

const useSearchApplications = (
  query: string,
) => {
	return useQuery({
		queryKey: ["search_applications", query],
		queryFn: async () => {
			try {
				const applications: ApplicationTitles[] = await invoke("search_applications", {
				  query
				});
				return applications;
			} catch (e) {
				console.error("get top usage failed");
				throw e;
			}
		},
	});
};

export default useSearchApplications;
