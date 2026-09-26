import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as useWorkspace } from "./use-workspace-BtVulKUr.mjs";
import { t as InvoiceForm } from "./invoice-form-UbyItaxk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/new-BuUbORBA.js
var import_jsx_runtime = require_jsx_runtime();
function NewInvoice() {
	const ws = useWorkspace();
	if (!ws.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
			children: "Create"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl",
			children: "New invoice"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceForm, { workspace: ws.data })]
	});
}
//#endregion
export { NewInvoice as component };
