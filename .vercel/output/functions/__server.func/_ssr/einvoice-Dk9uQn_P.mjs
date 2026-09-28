import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as inr } from "./engine-CPod6u8E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as generateEinvoice, h as listInvoices, n as cancelEinvoice } from "./server-MP4V7QM2.mjs";
import { t as Badge } from "./badge-C-Rcfo4t.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { n as useActiveCompanyId, r as useWorkspace, t as Card } from "./use-workspace-CH9p7Qvn.mjs";
import { n as qrSvg } from "./irn-WNim9sE-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/einvoice-Dk9uQn_P.js
var import_jsx_runtime = require_jsx_runtime();
function EinvoicePage() {
	const companyId = useActiveCompanyId();
	const ws = useWorkspace();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["invoices", companyId],
		queryFn: () => listInvoices({ data: companyId }),
		enabled: companyId != null
	});
	const generate = useMutation({
		mutationFn: (id) => generateEinvoice({ data: id }),
		onSuccess: () => {
			toast.success("Sandbox IRN generated");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const cancel = useMutation({
		mutationFn: (id) => cancelEinvoice({ data: id }),
		onSuccess: () => {
			toast.success("IRN cancelled (24h window)");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const rows = (q.data ?? []).filter((inv) => inv.status === "issued");
	const queue = rows.filter((inv) => inv.einvoiceStatus === "pending" || inv.einvoiceStatus === "failed");
	const generated = rows.filter((inv) => inv.einvoiceStatus === "generated");
	const aato = ws.data?.company.aato ?? 0;
	const required = aato >= 5e7;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
					children: "IRP sandbox"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "E-Invoice"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: required ? "warn" : "success",
					children: required ? "IRN mandatory on B2B" : "Below ₹5 Cr AATO"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg-muted",
				children: "Pramaan issues a sandbox IRN and QR for demo and GSTR-1 auto-population. It does not call NIC / IRP. Cancel is allowed only within 24 hours. Taxpayers with AATO of ₹10 crore or more must report within 30 days of invoice date."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-sm",
				children: [
					"AATO ₹ ",
					inr(aato),
					" · GSTIN ",
					ws.data?.gstins[0]?.gstin ?? "—"
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Awaiting IRN",
						value: String(queue.length),
						warn: queue.length > 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Generated",
						value: String(generated.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Issued B2B docs",
						value: String(rows.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "overflow-x-auto p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Invoice"
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
								children: "Value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "IRN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 no-print",
								children: "Action"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0 align-top",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/invoices/$id",
									params: { id: String(inv.id) },
									className: "font-medium text-accent",
									children: inv.number
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: inv.customerName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-[11px] text-fg-subtle",
									children: inv.customerGstin || "Unregistered"
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: inv.einvoiceStatus === "generated" ? "success" : inv.einvoiceStatus === "failed" ? "danger" : inv.einvoiceStatus === "cancelled" ? "warn" : "neutral",
									children: inv.einvoiceStatus
								}), inv.irn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { dangerouslySetInnerHTML: { __html: qrSvg(inv.irn, 56) } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "break-all font-mono text-[10px] text-fg-subtle",
										children: inv.irn
									})]
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [
									inv.einvoiceStatus === "pending" || inv.einvoiceStatus === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										variant: "accent",
										disabled: generate.isPending || !inv.customerGstin,
										onClick: () => generate.mutate(inv.id),
										children: "Generate IRN"
									}) : null,
									inv.einvoiceStatus === "generated" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										disabled: cancel.isPending,
										onClick: () => cancel.mutate(inv.id),
										children: "Cancel IRN"
									}) : null,
									!inv.customerGstin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-fg-subtle",
										children: "B2C — IRN not required"
									}) : null
								]
							})
						]
					}, inv.id)) })]
				}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "p-6 text-sm text-fg-muted",
					children: "Issue a B2B invoice to see it on the IRN queue."
				}) : null]
			})
		]
	});
}
function Stat({ label, value, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs uppercase tracking-wide text-fg-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `mt-2 font-display text-2xl ${warn ? "text-danger" : ""}`,
		children: value
	})] });
}
//#endregion
export { EinvoicePage as component };
