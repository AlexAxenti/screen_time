import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { Settings } from "../../types/tauriDtos";

const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Settings) => {
      try {
        await invoke("update_settings", { settings });
        return settings;
      } catch (e) {
        console.error("update settings failed");
        throw e;
      }
    },
    onSuccess: (settings) => {
      queryClient.setQueryData<Settings>(["settings"], settings);
    },
  });
};

export default useUpdateSettings;