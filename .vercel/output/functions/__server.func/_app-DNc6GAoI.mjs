import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, n as useQuery } from "./_libs/react+tanstack__react-query.mjs";
import { o as getDashboard } from "./_ssr/server-d_ZARDES.mjs";
import { c as inr } from "./_ssr/engine-fM4Ykfgu.mjs";
import { t as Badge } from "./_ssr/badge-C-Rcfo4t.mjs";
import { t as Button } from "./_ssr/button-BFmAaUMG.mjs";
import { n as useActiveCompanyId, t as Card } from "./_ssr/use-workspace-BtVulKUr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app-DNc6GAoI.js
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const companyId = useActiveCompanyId();
	const q = useQuery({
		queryKey: ["dashboard", companyId],
		queryFn: () => getDashboard({ data: companyId }),
		enabled: companyId != null
	});
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" });
	const d = q.data;
	const aatoCr = d.workspace.company.aato / 1e7;
	const eInvDue = d.workspace.company.aato >= 5e7;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
					children: "September 2026"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl md:text-4xl",
					children: "Ledger home"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/invoices/new",
						children: "New invoice"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Issued this month",
						value: `₹ ${inr(d.monthSales)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "GST on books",
						value: `₹ ${inr(d.tax)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "ITC in 2B",
						value: `₹ ${inr(d.itc)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pending IRN",
						value: String(d.pendingIrn + d.failedIrn),
						warn: d.failedIrn > 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wide text-fg-subtle",
						children: "AATO tracker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl",
						children: ["₹ ", inr(d.workspace.company.aato)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-fg-muted",
						children: [aatoCr.toFixed(2), " crore PAN-level. E-invoicing threshold is ₹5 crore."]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: eInvDue ? "warn" : "success",
					children: eInvDue ? "IRN mandatory on B2B" : "Below IRN threshold"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Recent documents"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/invoices",
							className: "text-sm text-accent",
							children: "All invoices"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: d.recent.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/invoices/$id",
									params: { id: String(r.id) },
									className: "font-medium",
									children: r.number
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-fg-muted",
									children: [
										r.customerName,
										" · ",
										r.issueDate
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-sm",
									children: ["₹ ", inr(r.total)]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
									status: r.status,
									ei: r.einvoiceStatus
								})]
							})]
						}, r.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: "Compliance calendar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 space-y-3 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between border-b border-border pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GSTR-1 (Sep)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg-muted",
										children: "11 Oct"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between border-b border-border pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GSTR-3B (Sep)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg-muted",
										children: "20 Oct"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drafts waiting" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: d.drafts
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 space-y-2 text-xs text-fg-muted",
							children: d.audit.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								a.action,
								" · ",
								a.entity,
								" ",
								a.entityId
							] }, i))
						})
					]
				})]
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
function Status({ status, ei }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex justify-end gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: status === "issued" ? "success" : status === "cancelled" ? "danger" : "warn",
			children: status
		}), ei === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			tone: "danger",
			children: "IRN"
		}) : null]
	});
}
//#endregion
export { Dashboard as component };
