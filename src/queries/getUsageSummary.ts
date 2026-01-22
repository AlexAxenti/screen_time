import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface UsageSummary {
  total_duration: number,
  segments_count: number,
  exe_count: number,
}

let useGetUsageSummary = () => { 
  return useQuery({
    queryKey: ['usage_summary'],
    queryFn: async () => {
      try {
        let summary: UsageSummary = await invoke('get_usage_summary', { startTime: 0 })
        return summary;
      } catch (e) {
        console.error("get usage_summary invoke failed");
        throw e;
      }
      
    }
  })
}

export default useGetUsageSummary;