import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ToggleTrackedInput } from "../../types/tauriInputs";

const useToggleTrackedApp = () => {
  return useMutation({
    mutationFn: async ({ appId, isTracked }: ToggleTrackedInput) => {
      try {
        await invoke("set_app_tracked", {
          appId,
          isTracked,
        });
      } catch (e) {
        console.error("toggle tracked failed");
        throw e;
      }
    },
  });
};

export default useToggleTrackedApp;