import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as saveInvoice } from "./server-d_ZARDES.mjs";
import { a as UNITS, n as CUSTOM_PRODUCT_CODE, r as GST_PRESETS } from "./catalog-C2pOHWsL.mjs";
import { c as inr, n as computeTax, u as roundMoney } from "./engine-fM4Ykfgu.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { t as Card } from "./use-workspace-BtVulKUr.mjs";
import { n as Textarea, t as Input } from "./input-Dr12qvXR.mjs";
import { n as Select, t as Label } from "./select-z89nk8bM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoice-form-UbyItaxk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function today() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function plusDays(iso, n) {
	const d = new Date(iso);
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
}
function InvoiceForm({ workspace, invoice }) {
	const nav = useNavigate();
	const customers = workspace.parties.filter((p) => p.kind === "customer");
	const catalog = workspace.products.filter((p) => p.active);
	const defaultProduct = catalog.find((p) => p.code !== "CUSTOM") ?? catalog[0];
	const [customerId, setCustomerId] = (0, import_react.useState)(invoice?.customerId ?? customers[0]?.id ?? null);
	const [gstinId, setGstinId] = (0, import_react.useState)(invoice?.gstinId ?? workspace.gstins[0]?.id);
	const [docType, setDocType] = (0, import_react.useState)(invoice?.docType ?? "tax_invoice");
	const [issueDate, setIssueDate] = (0, import_react.useState)(invoice?.issueDate || today());
	const [dueDate, setDueDate] = (0, import_react.useState)(invoice?.dueDate || plusDays(today(), 30));
	const [poNumber, setPoNumber] = (0, import_react.useState)(invoice?.poNumber ?? "PO-88421-A");
	const [reverseCharge, setReverseCharge] = (0, import_react.useState)(invoice?.reverseCharge ?? false);
	const [gstPreset, setGstPreset] = (0, import_react.useState)(invoice?.gstPreset || workspace.company.gstPreset);
	const [notes, setNotes] = (0, import_react.useState)(invoice?.notes ?? "Net 30. Quote invoice number on remittance.");
	const [lines, setLines] = (0, import_react.useState)(invoice?.lines.length ? invoice.lines.map((l) => ({
		productId: l.productId,
		description: l.description,
		hsnSac: l.hsnSac,
		qty: l.qty,
		unit: l.unit,
		rate: l.rate,
		isCustom: l.isCustom
	})) : [{
		productId: defaultProduct?.id ?? null,
		description: defaultProduct?.description ?? "",
		hsnSac: defaultProduct?.hsnSac ?? "",
		qty: 1,
		unit: defaultProduct?.unit ?? "Nos",
		rate: defaultProduct?.rate ?? 0,
		isCustom: defaultProduct?.code === CUSTOM_PRODUCT_CODE
	}]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const customer = customers.find((c) => c.id === customerId);
	const gstin = workspace.gstins.find((g) => g.id === gstinId);
	const taxable = roundMoney(lines.reduce((s, l) => s + roundMoney(l.qty * l.rate), 0));
	const tax = (0, import_react.useMemo)(() => computeTax({
		presetName: gstPreset,
		supplierState: gstin?.stateCode ?? workspace.company.stateCode,
		recipientState: customer?.stateCode || gstin?.stateCode || workspace.company.stateCode,
		taxable
	}), [
		gstPreset,
		gstin?.stateCode,
		customer?.stateCode,
		taxable,
		workspace.company.stateCode
	]);
	function pickProduct(index, productId) {
		const p = catalog.find((x) => x.id === productId);
		if (!p) return;
		const custom = p.code === CUSTOM_PRODUCT_CODE;
		setLines((prev) => prev.map((l, i) => i === index ? {
			productId: p.id,
			description: custom ? "" : p.description,
			hsnSac: custom ? l.hsnSac : p.hsnSac,
			qty: l.qty || 1,
			unit: custom ? l.unit : p.unit,
			rate: custom ? l.rate : p.rate,
			isCustom: custom
		} : l));
	}
	async function onSave() {
		if (!gstinId) {
			toast.error("Select a GSTIN");
			return;
		}
		setBusy(true);
		try {
			const saved = await saveInvoice({ data: {
				id: invoice?.id,
				companyId: workspace.company.id,
				gstinId,
				customerId,
				docType,
				issueDate,
				dueDate,
				poNumber,
				reverseCharge,
				gstPreset,
				notes,
				lines: lines.filter((l) => l.description && l.qty > 0)
			} });
			toast.success("Draft saved");
			nav({
				to: "/invoices/$id",
				params: { id: String(saved?.id) }
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Could not save");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Customer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: customerId ?? "",
							onChange: (e) => setCustomerId(e.target.value ? Number(e.target.value) : null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Unregistered / B2C"
							}), customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c.id,
								children: c.name
							}, c.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Issuing GSTIN",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: gstinId,
							onChange: (e) => setGstinId(Number(e.target.value)),
							children: workspace.gstins.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: g.id,
								children: [
									g.gstin,
									" · ",
									g.stateName
								]
							}, g.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Document type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: docType,
							onChange: (e) => setDocType(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "tax_invoice",
									children: "Tax invoice"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "bill_of_supply",
									children: "Bill of supply"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "credit_note",
									children: "Credit note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "debit_note",
									children: "Debit note"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "GST rate preset",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: gstPreset,
							onChange: (e) => setGstPreset(e.target.value),
							children: GST_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.name,
								children: p.name
							}, p.name))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Invoice date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: issueDate,
							onChange: (e) => setIssueDate(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Due date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: dueDate,
							onChange: (e) => setDueDate(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "PO / reference",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: poNumber,
							onChange: (e) => setPoNumber(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Reverse charge",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: reverseCharge ? "yes" : "no",
							onChange: (e) => setReverseCharge(e.target.value === "yes"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "no",
								children: "No"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "yes",
								children: "Yes"
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl",
					children: "Line items"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: () => setLines((p) => [...p, {
						productId: defaultProduct?.id ?? null,
						description: defaultProduct?.description ?? "",
						hsnSac: defaultProduct?.hsnSac ?? "",
						qty: 1,
						unit: defaultProduct?.unit ?? "Nos",
						rate: defaultProduct?.rate ?? 0,
						isCustom: defaultProduct?.code === CUSTOM_PRODUCT_CODE
					}]),
					children: "Add line"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: lines.map((line, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 rounded-[var(--radius-md)] border border-border p-3 md:grid-cols-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Service / product" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
									value: line.productId ?? "",
									onChange: (e) => pickProduct(idx, Number(e.target.value)),
									children: catalog.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: p.id,
										children: p.description
									}, p.id))
								}),
								line.isCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-2",
									placeholder: "Custom description",
									value: line.description,
									onChange: (e) => setLines((p) => p.map((l, i) => i === idx ? {
										...l,
										description: e.target.value
									} : l))
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "SAC / HSN" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: line.isCustom ? "bg-input" : "bg-calc",
								readOnly: !line.isCustom,
								value: line.hsnSac,
								onChange: (e) => setLines((p) => p.map((l, i) => i === idx ? {
									...l,
									hsnSac: e.target.value
								} : l))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Qty" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								step: "0.01",
								value: line.qty,
								onChange: (e) => setLines((p) => p.map((l, i) => i === idx ? {
									...l,
									qty: Number(e.target.value)
								} : l))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								disabled: !line.isCustom,
								className: line.isCustom ? "bg-input" : "bg-calc",
								value: line.unit,
								onChange: (e) => setLines((p) => p.map((l, i) => i === idx ? {
									...l,
									unit: e.target.value
								} : l)),
								children: UNITS.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: u }, u))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rate" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								className: line.isCustom ? "bg-input" : "bg-calc",
								readOnly: !line.isCustom,
								value: line.rate,
								onChange: (e) => setLines((p) => p.map((l, i) => i === idx ? {
									...l,
									rate: Number(e.target.value)
								} : l))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between md:col-span-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Amt" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm",
								children: ["₹", inr(roundMoney(line.qty * line.rate))]
							})] }), lines.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-xs text-danger",
								onClick: () => setLines((p) => p.filter((_, i) => i !== idx)),
								children: "Remove"
							}) : null]
						}),
						line.isCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "md:col-span-12 text-xs text-warn",
							children: "Custom mode — SAC, unit and rate are editable."
						}) : null
					]
				}, idx))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					className: "mt-1",
					value: notes,
					onChange: (e) => setNotes(e.target.value)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wide text-fg-subtle",
						children: "Tax summary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-fg-muted",
						children: [
							tax.docTitle,
							" · ",
							tax.supplyType,
							" · Place of supply ",
							customer?.stateCode || gstin?.stateCode,
							"-",
							customer?.stateName || gstin?.stateName
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 space-y-1 font-mono text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Taxable",
								v: tax.taxable
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: `CGST ${tax.cgstRate * 100}%`,
								v: tax.cgst
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: `SGST ${tax.sgstRate * 100}%`,
								v: tax.sgst
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: `IGST ${tax.igstRate * 100}%`,
								v: tax.igst
							}),
							tax.compositionTax ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Composition (info)",
								v: tax.compositionTax
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "Grand total",
								v: tax.grandTotal,
								strong: true
							})
						]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 no-print",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: busy,
					onClick: onSave,
					children: busy ? "Saving…" : "Save draft"
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
function Row({ k, v, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between ${strong ? "border-t border-border pt-2 font-medium" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(v)] })]
	});
}
//#endregion
export { InvoiceForm as t };
