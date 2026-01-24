import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { WeeksDailyUsage } from "../types/dto";

let useGetWeeksDailyUsage = (startTime: number, endTime: number) => { 
  return useQuery({
    queryKey: ['weeks_daily_usage', startTime, endTime],
    queryFn: async () => {
      try {
        let weeksDailyUsage: WeeksDailyUsage[] = await invoke('get_weeks_daily_usage', { startTime, endTime })
        return weeksDailyUsage;
      } catch (e) {
        console.error("get weeks_daily_usage invoke failed");
        throw e;
      }
      
    }
  })
}

export default useGetWeeksDailyUsage;