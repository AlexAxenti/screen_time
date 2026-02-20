import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationInfo } from "../../types/tauriDtos";

const useGetUntrackedApps = () => {
	return useQuery({
		queryKey: ["untracked_applications"],
		queryFn: async () => {
			try {
				const applications: ApplicationInfo[] = await invoke(
					"get_untracked_apps",
					{},
				);
				return applications;
			} catch (e) {
				console.error("get_untracked_apps failed");
				throw e;
			}
		},
	});
};

export default useGetUntrackedApps;
