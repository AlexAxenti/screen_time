import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { WindowSegment } from "../types/dto";

let useGetTopUsage = (startTime: number, endTime: number) => { 
  return useQuery({
    queryKey: ['top_usage', startTime, endTime],
    queryFn: async () => {
      try { 
        let windowSegments: WindowSegment[] = await invoke('get_top_usage', { startTime, endTime })
        return windowSegments;
      } catch (e) {
        console.error("get top usage failed");
        throw e;
      }
    }
  })
}

export default useGetTopUsage;