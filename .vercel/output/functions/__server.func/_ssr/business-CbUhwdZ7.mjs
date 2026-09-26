import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as applyGstPreset, v as saveCompany, y as saveGstin } from "./server-d_ZARDES.mjs";
import { i as INDIAN_STATES, l as stateFromGstin, r as GST_PRESETS, s as gstinLooksValid } from "./catalog-C2pOHWsL.mjs";
import { c as inr, i as einvoiceRequired } from "./engine-fM4Ykfgu.mjs";
import { t as Badge } from "./badge-C-Rcfo4t.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { r as useWorkspace, t as Card } from "./use-workspace-BtVulKUr.mjs";
import { t as Input } from "./input-Dr12qvXR.mjs";
import { n as Select, t as Label } from "./select-z89nk8bM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/business-CbUhwdZ7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BusinessPage() {
	const ws = useWorkspace();
	const qc = useQueryClient();
	const [legalName, setLegalName] = (0, import_react.useState)("");
	const [tradeName, setTradeName] = (0, import_react.useState)("");
	const [pan, setPan] = (0, import_react.useState)("");
	const [address1, setAddress1] = (0, import_react.useState)("");
	const [address2, setAddress2] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [stateCode, setStateCode] = (0, import_react.useState)("27");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [bankName, setBankName] = (0, import_react.useState)("");
	const [accountName, setAccountName] = (0, import_react.useState)("");
	const [accountNo, setAccountNo] = (0, import_react.useState)("");
	const [ifsc, setIfsc] = (0, import_react.useState)("");
	const [branch, setBranch] = (0, import_react.useState)("");
	const [upi, setUpi] = (0, import_react.useState)("");
	const [aato, setAato] = (0, import_react.useState)(0);
	const [role, setRole] = (0, import_react.useState)("owner");
	const [gstin, setGstin] = (0, import_react.useState)("");
	const [gstinAddress, setGstinAddress] = (0, import_react.useState)("");
	const [prefix, setPrefix] = (0, import_react.useState)("INV");
	const [gstinState, setGstinState] = (0, import_react.useState)({
		code: "27",
		name: "Maharashtra"
	});
	(0, import_react.useEffect)(() => {
		const c = ws.data?.company;
		const g = ws.data?.gstins[0];
		if (!c) return;
		setLegalName(c.legalName);
		setTradeName(c.tradeName);
		setPan(c.pan);
		setAddress1(c.address1);
		setAddress2(c.address2);
		setCity(c.city);
		setStateCode(c.stateCode);
		setPhone(c.phone);
		setEmail(c.email);
		setBankName(c.bankName);
		setAccountName(c.accountName);
		setAccountNo(c.accountNo);
		setIfsc(c.ifsc);
		setBranch(c.branch);
		setUpi(c.upi);
		setAato(c.aato);
		setRole(c.role);
		if (g) {
			setGstin(g.gstin);
			setGstinAddress(g.address);
			setPrefix(g.invoicePrefix);
			setGstinState({
				code: g.stateCode,
				name: g.stateName
			});
		}
	}, [ws.data]);
	const save = useMutation({
		mutationFn: async () => {
			const c = ws.data.company;
			const g = ws.data.gstins[0];
			const st = INDIAN_STATES.find((s) => s.code === stateCode);
			await saveCompany({ data: {
				id: c.id,
				legalName,
				tradeName,
				pan,
				address1,
				address2,
				city,
				stateCode,
				stateName: st?.name ?? c.stateName,
				phone,
				email,
				bankName,
				accountName,
				accountNo,
				ifsc,
				branch,
				upi,
				aato,
				role
			} });
			if (g) await saveGstin({ data: {
				id: g.id,
				gstin,
				stateCode: gstinState.code,
				stateName: gstinState.name,
				address: gstinAddress,
				invoicePrefix: prefix
			} });
		},
		onSuccess: () => {
			toast.success("Business profile saved");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const preset = useMutation({
		mutationFn: (name) => applyGstPreset({ data: {
			companyId: ws.data.company.id,
			preset: name
		} }),
		onSuccess: () => {
			toast.success("GST preset applied. Open drafts were recast.");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!ws.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" });
	const company = ws.data.company;
	const irnDue = einvoiceRequired(aato, company.taxScheme === "COMPOSITION" ? "COMPOSITION" : "REGULAR", true, "tax_invoice");
	function onGstinChange(value) {
		const next = value.toUpperCase();
		setGstin(next);
		if (gstinLooksValid(next)) setGstinState(stateFromGstin(next));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.18em] text-fg-subtle",
					children: "Entity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Business"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: save.isPending,
					onClick: () => save.mutate(),
					children: save.isPending ? "Saving…" : "Save profile"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-fg-subtle",
					children: "GST scheme"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-xl",
					children: company.gstPreset
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: irnDue ? "warn" : "success",
						children: irnDue ? "E-invoice in scope" : "IRN not mandatory"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						className: "w-72",
						value: company.gstPreset,
						onChange: (e) => preset.mutate(e.target.value),
						disabled: preset.isPending,
						children: GST_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.name,
							children: p.name
						}, p.name))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg-muted",
				children: "Changing the preset recasts open drafts: Regular intra-state splits CGST+SGST, inter-state is IGST only, Composition issues a Bill of Supply with tax shown for information and not charged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Legal name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: legalName,
							onChange: (e) => setLegalName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Trade name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: tradeName,
							onChange: (e) => setTradeName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "PAN",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: pan,
							onChange: (e) => setPan(e.target.value.toUpperCase())
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "State of registration",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: stateCode,
							onChange: (e) => setStateCode(e.target.value),
							children: INDIAN_STATES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s.code,
								children: [
									s.code,
									" — ",
									s.name
								]
							}, s.code))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: address1,
							onChange: (e) => setAddress1(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address 2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: address2,
							onChange: (e) => setAddress2(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "City",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: city,
							onChange: (e) => setCity(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "AATO (₹)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 0,
							value: aato,
							onChange: (e) => setAato(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: phone,
							onChange: (e) => setPhone(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Workspace role",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: role,
							onChange: (e) => setRole(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "owner",
									children: "Owner"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "accountant",
									children: "Accountant"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "ca",
									children: "CA"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "viewer",
									children: "Viewer"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl md:col-span-2",
						children: "GSTIN"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "GSTIN",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: gstin,
							onChange: (e) => onGstinChange(e.target.value)
						}), gstin && !gstinLooksValid(gstin) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-danger",
							children: "Check the 15-character GSTIN."
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Invoice prefix",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: prefix,
							onChange: (e) => setPrefix(e.target.value.toUpperCase())
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "GSTIN state",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							readOnly: true,
							className: "bg-calc",
							value: `${gstinState.code} — ${gstinState.name}`
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Principal place",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: gstinAddress,
							onChange: (e) => setGstinAddress(e.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl md:col-span-2",
						children: "Bank & UPI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Bank",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: bankName,
							onChange: (e) => setBankName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Account name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: accountName,
							onChange: (e) => setAccountName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Account number",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: accountNo,
							onChange: (e) => setAccountNo(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "IFSC",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: ifsc,
							onChange: (e) => setIfsc(e.target.value.toUpperCase())
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Branch",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: branch,
							onChange: (e) => setBranch(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "UPI",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: upi,
							onChange: (e) => setUpi(e.target.value)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-fg-subtle",
				children: [
					"Current AATO ₹ ",
					inr(aato),
					". E-invoicing threshold is ₹5 crore; 30-day IRN window applies from ₹10 crore."
				]
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
export { BusinessPage as component };
