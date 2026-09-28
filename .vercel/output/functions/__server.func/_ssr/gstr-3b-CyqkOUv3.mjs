import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { a as formatGstPeriod, c as inr, r as currentGstPeriod } from "./engine-CPod6u8E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as lockReturn, c as getGstr3b } from "./server-MP4V7QM2.mjs";
import { t as Badge } from "./badge-C-Rcfo4t.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { n as useActiveCompanyId, t as Card } from "./use-workspace-CH9p7Qvn.mjs";
import { t as PeriodSelect } from "./period-select-DxbXAIUX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gstr-3b-CyqkOUv3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Gstr3bPage() {
	const companyId = useActiveCompanyId();
	const [period, setPeriod] = (0, import_react.useState)(currentGstPeriod());
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: [
			"gstr3b",
			companyId,
			period
		],
		queryFn: () => getGstr3b({ data: {
			companyId,
			period
		} }),
		enabled: companyId != null
	});
	const file = useMutation({
		mutationFn: () => lockReturn({ data: {
			companyId,
			period,
			which: "gstr3b"
		} }),
		onSuccess: () => {
			toast.success("GSTR-3B marked filed (draft worksheet).");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const data = q.data;
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl",
			children: "GSTR-3B"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" })]
	});
	const net = data.payable.igst + data.payable.cgst + data.payable.sgst;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
					children: "Summary return"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "GSTR-3B"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: data.locked ? "success" : "warn",
					children: data.locked ? "filed" : "draft"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodSelect, {
					value: period,
					onChange: setPeriod
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => file.mutate(),
					disabled: data.locked || file.isPending,
					children: "Mark 3B filed"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg-muted",
				children: [
					"Worksheet for ",
					formatGstPeriod(period),
					". Outward tax comes from issued invoices; ITC is taken only from purchases that appear in GSTR-2B. Cash payable is outward minus 2B ITC — not a live GSTN filing."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Outward taxable",
						value: `₹ ${inr(data.outward.taxable)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "ITC claimed (2B)",
						value: `₹ ${inr(data.itc.igst + data.itc.cgst + data.itc.sgst)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Net payable",
						value: `₹ ${inr(net)}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "3.1 Outward supplies"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxTable, { rows: [
				["Taxable value", data.outward.taxable],
				["IGST", data.outward.igst],
				["CGST", data.outward.cgst],
				["SGST", data.outward.sgst],
				["Total outward", data.outward.total]
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "4 Eligible ITC (from 2B)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxTable, { rows: [
				["Taxable inward", data.itc.taxable],
				["IGST", data.itc.igst],
				["CGST", data.itc.cgst],
				["SGST", data.itc.sgst]
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "6.1 Payment of tax"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaxTable, {
				rows: [
					["IGST payable", data.payable.igst],
					["CGST payable", data.payable.cgst],
					["SGST payable", data.payable.sgst],
					["Net cash", net]
				],
				lastStrong: true
			})] })
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs uppercase tracking-wide text-fg-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 font-display text-2xl",
		children: value
	})] });
}
function TaxTable({ rows, lastStrong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: "mt-3 space-y-1 font-mono text-sm",
		children: rows.map(([k, v], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `flex justify-between ${lastStrong && i === rows.length - 1 ? "border-t border-border pt-2 font-medium" : ""}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-sans text-fg-muted",
				children: k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(v)] })]
		}, k))
	});
}
//#endregion
export { Gstr3bPage as component };
