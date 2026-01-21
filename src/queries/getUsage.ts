import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

let useGetUsage = () => { 
  return useQuery({
    queryKey: ['usage'],
    queryFn: async () => {
      let greeting:string = await invoke('greet')
      return greeting;
    }
  })
}

export default useGetUsage;