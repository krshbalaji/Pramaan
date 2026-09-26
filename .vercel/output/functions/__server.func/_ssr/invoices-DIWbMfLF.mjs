import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { h as listInvoices } from "./server-d_ZARDES.mjs";
import { c as inr } from "./engine-fM4Ykfgu.mjs";
import { t as Badge } from "./badge-C-Rcfo4t.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { n as useActiveCompanyId, t as Card } from "./use-workspace-BtVulKUr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices-DIWbMfLF.js
var import_jsx_runtime = require_jsx_runtime();
function InvoicesPage() {
	const companyId = useActiveCompanyId();
	const q = useQuery({
		queryKey: ["invoices", companyId],
		queryFn: () => listInvoices({ data: companyId }),
		enabled: companyId != null
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
				children: "Sales register"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: "Invoices"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/invoices/new",
					children: "New invoice"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "overflow-x-auto p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[640px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Party"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Date"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-right",
							children: "Amount"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Status"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (q.data ?? []).map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/invoices/$id",
								params: { id: String(inv.id) },
								className: "font-medium text-accent",
								children: inv.number || "Draft"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: inv.customerName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[11px] text-fg-subtle",
								children: inv.customerGstin
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 whitespace-nowrap",
							children: inv.issueDate
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-right font-mono",
							children: ["₹ ", inr(inv.total)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: inv.status === "issued" ? "success" : inv.status === "cancelled" ? "danger" : "warn",
									children: inv.status
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: inv.einvoiceStatus === "generated" ? "success" : inv.einvoiceStatus === "failed" ? "danger" : "neutral",
									children: inv.einvoiceStatus
								})]
							})
						})
					]
				}, inv.id)) })]
			}), q.data?.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-6 text-sm text-fg-muted",
				children: "No invoices yet."
			}) : null]
		})]
	});
}
//#endregion
export { InvoicesPage as component };
