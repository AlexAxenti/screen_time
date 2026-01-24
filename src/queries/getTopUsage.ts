import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { WindowSegment } from "../types/dto";

let useGetTopUsage = (startTime: number) => { 
  return useQuery({
    queryKey: ['topUsage', startTime],
    queryFn: async () => {
      try { 
        let windowSegments: WindowSegment[] = await invoke('get_top_usage', { startTime })
        return windowSegments;
      } catch (e) {
        console.error("get top usage failed");
        throw e;
      }
    }
  })
}

export default useGetTopUsage;