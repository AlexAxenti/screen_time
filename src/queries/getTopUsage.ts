import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { TopUsage } from "../types/dto";

let useGetTopUsage = (startTime: number, endTime: number, appCount: number) => { 
  return useQuery({
    queryKey: ['top_usage', startTime, endTime, appCount],
    queryFn: async () => {
      try { 
        let topUsage: TopUsage = await invoke('get_top_usage', { startTime, endTime, appCount })
        return topUsage;
      } catch (e) {
        console.error("get top usage failed");
        throw e;
      }
    }
  })
}

export default useGetTopUsage;