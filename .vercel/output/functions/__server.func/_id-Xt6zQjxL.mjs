import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "./_libs/react+tanstack__react-query.mjs";
import { c as inr, t as amountInWords } from "./_ssr/engine-CPod6u8E.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$6 } from "./_ssr/router-D2RheeEh.mjs";
import { a as generateEinvoice, l as getInvoice, n as cancelEinvoice, p as issueInvoice } from "./_ssr/server-MP4V7QM2.mjs";
import { t as Badge } from "./_ssr/badge-C-Rcfo4t.mjs";
import { t as Button } from "./_ssr/button-BFmAaUMG.mjs";
import { r as useWorkspace, t as Card } from "./_ssr/use-workspace-CH9p7Qvn.mjs";
import { n as qrSvg } from "./_ssr/irn-WNim9sE-.mjs";
import { t as InvoiceForm } from "./_ssr/invoice-form-s7YiHKkE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-Xt6zQjxL.js
var import_jsx_runtime = require_jsx_runtime();
function InvoiceDetail() {
	const { id } = Route$6.useParams();
	const qc = useQueryClient();
	const ws = useWorkspace();
	const q = useQuery({
		queryKey: ["invoice", id],
		queryFn: () => getInvoice({ data: Number(id) })
	});
	const issue = useMutation({
		mutationFn: () => issueInvoice({ data: Number(id) }),
		onSuccess: () => {
			toast.success("Invoice issued");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const irn = useMutation({
		mutationFn: () => generateEinvoice({ data: Number(id) }),
		onSuccess: () => {
			toast.success("Sandbox IRN generated");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const cancel = useMutation({
		mutationFn: () => cancelEinvoice({ data: Number(id) }),
		onSuccess: () => {
			toast.success("IRN cancelled");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const inv = q.data;
	if (!inv || !ws.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" });
	if (inv.status === "draft") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
				children: "Draft"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: "Edit invoice"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				onClick: () => issue.mutate(),
				disabled: issue.isPending,
				children: "Issue & number"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceForm, {
			workspace: ws.data,
			invoice: inv
		})]
	});
	const company = ws.data.company;
	const gstin = ws.data.gstins.find((g) => g.id === inv.gstinId);
	const qr = inv.irn ? qrSvg(inv.qrPayload || inv.irn, 112) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-print flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/invoices",
				className: "text-sm text-accent",
				children: "← All invoices"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl",
				children: inv.number
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					inv.einvoiceStatus === "pending" || inv.einvoiceStatus === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "accent",
						onClick: () => irn.mutate(),
						disabled: irn.isPending,
						children: "Generate sandbox IRN"
					}) : null,
					inv.einvoiceStatus === "generated" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => cancel.mutate(),
						disabled: cancel.isPending,
						children: "Cancel IRN"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => window.print(),
						children: "Print / PDF"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "space-y-6 print:border-0 print:shadow-none",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-between gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.2em] text-fg-subtle",
							children: "Supplier"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: company.legalName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg-muted",
							children: company.tradeName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-sm",
							children: ["GSTIN ", gstin?.gstin]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-fg-muted",
							children: [
								company.address1,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								company.city,
								", ",
								company.stateName
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl",
								children: inv.scheme === "COMPOSITION" ? "Bill of Supply" : "Tax Invoice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-mono",
								children: inv.number
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-fg-muted",
								children: ["Date ", inv.issueDate]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex justify-end gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "success",
									children: inv.status
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: inv.einvoiceStatus })]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-wide text-fg-subtle",
							children: "Bill to"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: inv.customer?.name ?? "Unregistered"
						}),
						inv.customer?.gstin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-sm",
							children: ["GSTIN ", inv.customer.gstin]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-fg-muted",
							children: [
								inv.customer?.address1,
								" ",
								inv.customer?.city
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Place of supply: ",
								inv.placeOfSupplyCode,
								"-",
								inv.placeOfSupplyName
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Supply type: ", inv.supplyType] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Preset: ", inv.gstPreset] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Reverse charge: ", inv.reverseCharge ? "Yes" : "No"] }),
							inv.irn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 break-all font-mono text-[11px]",
								children: ["IRN ", inv.irn]
							}) : null
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-y border-border text-left text-xs uppercase text-fg-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Description"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "SAC" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right",
								children: "Rate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right",
								children: "Amount"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: inv.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: l.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono",
								children: l.hsnSac
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "text-right",
								children: [
									l.qty,
									" ",
									l.unit
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-right font-mono",
								children: inr(l.rate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-right font-mono",
								children: inr(l.amount)
							})
						]
					}, l.id)) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-md text-sm text-fg-muted",
						children: amountInWords(inv.total)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "min-w-48 space-y-1 font-mono text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Taxable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(inv.taxable)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CGST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(inv.cgst)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SGST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(inv.sgst)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IGST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(inv.igst)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between border-t border-border pt-2 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹ ", inr(inv.total)] })]
							})
						]
					})]
				}),
				qr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-3",
					dangerouslySetInnerHTML: { __html: qr }
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-fg-subtle",
					children: inv.notes
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-fg-subtle",
					children: [
						"Bank ",
						company.bankName,
						" · ",
						company.ifsc,
						" · UPI ",
						company.upi
					]
				})
			]
		})]
	});
}
//#endregion
export { InvoiceDetail as component };
