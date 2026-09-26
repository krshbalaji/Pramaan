import { useQuery } from "@tanstack/react-query";
import { useCompanyStore } from "./company-store";
import { getWorkspace, listCompanies } from "./server";

export function useActiveCompanyId() {
  const stored = useCompanyStore((s) => s.companyId);
  const companies = useQuery({ queryKey: ["companies"], queryFn: () => listCompanies() });
  return stored ?? companies.data?.[0]?.id ?? null;
}

export function useWorkspace() {
  const companyId = useActiveCompanyId();
  const query = useQuery({
    queryKey: ["workspace", companyId],
    queryFn: () => getWorkspace({ data: companyId ?? undefined }),
    enabled: companyId != null,
  });
  return { companyId, ...query };
}
