import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ApplicationMetadata } from "../../types/tauriDtos";

const useGetApplicationMetadata = (
	appId: string
) => {
	return useQuery({
		queryKey: ["application", appId],
		queryFn: async () => {
			try {
				const application: ApplicationMetadata = await invoke(
					"get_application_metadata",
					{
						appId
					},
				);
				return application;
			} catch (e) {
				console.error("get application metadata failed");
				throw e;
			}
		},
	});
};

export default useGetApplicationMetadata;
