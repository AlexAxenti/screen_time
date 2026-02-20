import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { ToggleTrackedInput } from "../../types/tauriInputs";
import type { ApplicationInfo } from "../../types/tauriDtos";

const useToggleTrackedApp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ appId, isTracked }: ToggleTrackedInput) => {
      try {
        await invoke("set_app_tracked", {
          appId,
          isTracked,
        });
        return { appId, isTracked };
      } catch (e) {
        console.error("toggle tracked failed");
        throw e;
      }
    },
    onSuccess: ({ appId, isTracked }) => {
      queryClient.setQueryData<ApplicationInfo[]>(
        ["untracked_applications"],
        (old) => {
          if (!old) return old;

          if (isTracked) {
            return old.filter((app) => app.app_id !== appId);
          } else {
            queryClient.invalidateQueries({ queryKey: ["untracked_applications"] });
            return old;
          }
        }
      );
    },
  });
};

export default useToggleTrackedApp;