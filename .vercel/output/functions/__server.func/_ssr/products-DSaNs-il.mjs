import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as saveProduct, i as deleteProduct } from "./server-d_ZARDES.mjs";
import { a as UNITS, c as hsnRequiredDigits, n as CUSTOM_PRODUCT_CODE } from "./catalog-C2pOHWsL.mjs";
import { c as inr } from "./engine-fM4Ykfgu.mjs";
import { t as Badge } from "./badge-C-Rcfo4t.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { r as useWorkspace, t as Card } from "./use-workspace-BtVulKUr.mjs";
import { t as Input } from "./input-Dr12qvXR.mjs";
import { n as Select, t as Label } from "./select-z89nk8bM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-DSaNs-il.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function blank() {
	return {
		code: "",
		description: "",
		kind: "service",
		hsnSac: "",
		unit: "Project",
		rate: 0,
		taxability: "taxable",
		active: true
	};
}
function ProductsPage() {
	const ws = useWorkspace();
	const qc = useQueryClient();
	const [draft, setDraft] = (0, import_react.useState)(null);
	const save = useMutation({
		mutationFn: (d) => saveProduct({ data: {
			id: d.id,
			companyId: ws.data.company.id,
			code: d.code,
			description: d.description,
			kind: d.kind,
			hsnSac: d.hsnSac,
			unit: d.unit,
			rate: d.rate,
			taxability: d.taxability,
			active: d.active
		} }),
		onSuccess: () => {
			toast.success("Catalog item saved");
			setDraft(null);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const del = useMutation({
		mutationFn: (id) => deleteProduct({ data: id }),
		onSuccess: () => {
			toast.success("Removed");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!ws.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" });
	const digits = hsnRequiredDigits(ws.data.company.aato);
	function fromProduct(p) {
		return {
			id: p.id,
			code: p.code,
			description: p.description,
			kind: p.kind,
			hsnSac: p.hsnSac,
			unit: p.unit,
			rate: p.rate,
			taxability: p.taxability,
			active: p.active
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
					children: "Masters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Catalog"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => setDraft(blank()),
					children: "Add item"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg-muted",
				children: [
					"Invoice lines pick from this list. Qty is the only field typed on a regular line. Custom mode is the reserved",
					" ",
					CUSTOM_PRODUCT_CODE,
					" row. HSN / SAC should be at least ",
					digits,
					" digits at this AATO."
				]
			}),
			draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.code,
							onChange: (e) => setDraft({
								...draft,
								code: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kind",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.kind,
							onChange: (e) => setDraft({
								...draft,
								kind: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "service",
									children: "Service"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "product",
									children: "Product"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "custom",
									children: "Custom placeholder"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Description",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.description,
								onChange: (e) => setDraft({
									...draft,
									description: e.target.value
								})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "HSN / SAC",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.hsnSac,
							onChange: (e) => setDraft({
								...draft,
								hsnSac: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Unit",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: draft.unit,
							onChange: (e) => setDraft({
								...draft,
								unit: e.target.value
							}),
							children: UNITS.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: u }, u))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rate (USD / INR as billed)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							step: "0.01",
							value: draft.rate,
							onChange: (e) => setDraft({
								...draft,
								rate: Number(e.target.value)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Taxability",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.taxability,
							onChange: (e) => setDraft({
								...draft,
								taxability: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "taxable",
									children: "Taxable"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "exempt",
									children: "Exempt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "nil",
									children: "Nil rated"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Active",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.active ? "yes" : "no",
							onChange: (e) => setDraft({
								...draft,
								active: e.target.value === "yes"
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "yes",
								children: "Yes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "no",
								children: "No"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2 md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							disabled: save.isPending || !draft.code || !draft.description,
							onClick: () => save.mutate(draft),
							children: "Save item"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setDraft(null),
							children: "Cancel"
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Description"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "HSN / SAC"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Unit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-right",
								children: "Rate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ws.data.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-mono text-xs",
								children: p.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: p.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-mono",
								children: p.hsnSac || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: p.unit
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right font-mono",
								children: inr(p.rate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: p.active ? "success" : "neutral",
									children: p.active ? "Active" : "Hidden"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mr-3 text-sm text-accent",
									onClick: () => setDraft(fromProduct(p)),
									children: "Edit"
								}), p.code !== "CUSTOM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-danger",
									onClick: () => del.mutate(p.id),
									children: "Remove"
								}) : null]
							})
						]
					}, p.id)) })]
				})
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1",
		children
	})] });
}
//#endregion
export { ProductsPage as component };
