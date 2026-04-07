import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { AppOverallSummary } from "../../types/tauriDtos";

const useGetAppOverallSummary = (appId: string) => {
	return useQuery({
		queryKey: ["app_overall_summary", appId],
		queryFn: async () => {
			try {
				const summary: AppOverallSummary = await invoke("get_app_overall_summary", {
					appId,
				});
				return summary;
			} catch (e) {
				console.error("get_app_overall_summary invoke failed");
				throw e;
			}
		},
	});
};

export default useGetAppOverallSummary;
