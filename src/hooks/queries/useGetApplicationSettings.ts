import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { Settings } from "../../types/tauriDtos";

const useGetApplicationSettings = () => {
	return useQuery({
		queryKey: ["settings"],
		queryFn: async () => {
			try {
				const settings: Settings = await invoke(
					"get_application_settings"
				);
				return settings;
			} catch (e) {
				console.error("get application settings failed");
				throw e;
			}
		},
	});
};

export default useGetApplicationSettings;
