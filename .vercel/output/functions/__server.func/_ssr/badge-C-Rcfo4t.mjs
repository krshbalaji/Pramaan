import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-C-Rcfo4t.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide", tone === "neutral" && "bg-bg-subtle text-fg-muted", tone === "success" && "bg-calc text-success", tone === "warn" && "bg-input text-warn", tone === "danger" && "bg-[#f4e4e1] text-danger", tone === "accent" && "bg-[#e4ebf5] text-accent", className),
		...props
	});
}
//#endregion
export { Badge as t };
