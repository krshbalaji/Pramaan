import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { C as useCompanyStore, f as getWorkspace, m as listCompanies } from "./server-MP4V7QM2.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-workspace-CH9p7Qvn.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5", className),
		...props
	});
}
function useActiveCompanyId() {
	const stored = useCompanyStore((s) => s.companyId);
	const companies = useQuery({
		queryKey: ["companies"],
		queryFn: () => listCompanies()
	});
	return stored ?? companies.data?.[0]?.id ?? null;
}
function useWorkspace() {
	const companyId = useActiveCompanyId();
	return {
		companyId,
		...useQuery({
			queryKey: ["workspace", companyId],
			queryFn: () => getWorkspace({ data: companyId ?? void 0 }),
			enabled: companyId != null
		})
	};
}
//#endregion
export { useActiveCompanyId as n, useWorkspace as r, Card as t };
