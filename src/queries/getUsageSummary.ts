import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { UsageSummary } from "../types/dto";

let useGetUsageSummary = (startTime: number) => { 
  return useQuery({
    queryKey: ['usage_summary', startTime],
    queryFn: async () => {
      try {
        let summary: UsageSummary = await invoke('get_usage_summary', { startTime })
        return summary;
      } catch (e) {
        console.error("get usage_summary invoke failed");
        throw e;
      }
      
    }
  })
}

export default useGetUsageSummary;