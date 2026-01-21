import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { WindowSegment } from "../routes";

let useGetUsage = () => { 
  return useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      let windowSegments: WindowSegment[] = await invoke('get_usage')
      return windowSegments;
    }
  })
}

export default useGetUsage;