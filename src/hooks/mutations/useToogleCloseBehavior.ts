import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { CloseBehavior, Settings } from "../../types/tauriDtos";

const useToggleCloseBehavior = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ closeBehavior }: { closeBehavior: CloseBehavior }) => {
      try {
        await invoke("set_close_behavior", {
          closeBehavior,
        });
        return { closeBehavior };
      } catch (e) {
        console.error("toggle close behavior failed");
        throw e;
      }
    },
    onSuccess: ({ closeBehavior }) => {
      queryClient.setQueryData<Settings>(["settings"], (old) => {
        if (!old) return old;
        return { ...old, close_behavior: closeBehavior };
      });
    },
  });
};

export default useToggleCloseBehavior;