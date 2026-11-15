import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWorkspace } from "@/lib/workspace-fns";

export function useWorkspace() {
  const fetchWorkspace = useServerFn(getWorkspace);
  return useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace(),
    staleTime: 60000,
    retry: false,
  });
}