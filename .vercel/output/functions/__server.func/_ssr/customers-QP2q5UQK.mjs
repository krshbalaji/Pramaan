import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as deleteParty, x as saveParty } from "./server-d_ZARDES.mjs";
import { i as INDIAN_STATES, l as stateFromGstin, s as gstinLooksValid } from "./catalog-C2pOHWsL.mjs";
import { t as Button } from "./button-BFmAaUMG.mjs";
import { r as useWorkspace, t as Card } from "./use-workspace-BtVulKUr.mjs";
import { t as Input } from "./input-Dr12qvXR.mjs";
import { n as Select, t as Label } from "./select-z89nk8bM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-QP2q5UQK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function blank() {
	return {
		kind: "customer",
		name: "",
		gstin: "",
		pan: "",
		stateCode: "27",
		stateName: "Maharashtra",
		address1: "",
		address2: "",
		city: "",
		contact: ""
	};
}
function PartiesPage() {
	const ws = useWorkspace();
	const qc = useQueryClient();
	const [draft, setDraft] = (0, import_react.useState)(null);
	const save = useMutation({
		mutationFn: (d) => saveParty({ data: {
			id: d.id,
			companyId: ws.data.company.id,
			kind: d.kind,
			name: d.name,
			gstin: d.gstin,
			pan: d.pan,
			stateCode: d.stateCode,
			stateName: d.stateName,
			address1: d.address1,
			address2: d.address2,
			city: d.city,
			contact: d.contact
		} }),
		onSuccess: () => {
			toast.success("Party saved");
			setDraft(null);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const del = useMutation({
		mutationFn: (id) => deleteParty({ data: id }),
		onSuccess: () => {
			toast.success("Removed");
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	if (!ws.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle" });
	const parties = ws.data.parties;
	function fromParty(p) {
		return {
			id: p.id,
			kind: p.kind,
			name: p.name,
			gstin: p.gstin,
			pan: p.pan,
			stateCode: p.stateCode,
			stateName: p.stateName,
			address1: p.address1,
			address2: p.address2,
			city: p.city,
			contact: p.contact
		};
	}
	function onGstin(value) {
		setDraft((d) => {
			if (!d) return d;
			const next = {
				...d,
				gstin: value.toUpperCase()
			};
			if (gstinLooksValid(value)) {
				const st = stateFromGstin(value);
				next.stateCode = st.code;
				next.stateName = st.name;
			}
			return next;
		});
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
					children: "Parties"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => setDraft(blank()),
					children: "Add party"
				})]
			}),
			draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Kind",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: draft.kind,
							onChange: (e) => setDraft({
								...draft,
								kind: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "customer",
								children: "Customer"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "vendor",
								children: "Vendor"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Legal name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.name,
							onChange: (e) => setDraft({
								...draft,
								name: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "GSTIN",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.gstin,
							onChange: (e) => onGstin(e.target.value),
							placeholder: "Optional for B2C"
						}), draft.gstin && !gstinLooksValid(draft.gstin) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-danger",
							children: "GSTIN should be 15 characters (state + PAN + entity + Z + check)."
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "PAN",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.pan,
							onChange: (e) => setDraft({
								...draft,
								pan: e.target.value.toUpperCase()
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "State",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: draft.stateCode,
							onChange: (e) => {
								const st = INDIAN_STATES.find((s) => s.code === e.target.value);
								setDraft({
									...draft,
									stateCode: e.target.value,
									stateName: st?.name ?? draft.stateName
								});
							},
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
						label: "City",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.city,
							onChange: (e) => setDraft({
								...draft,
								city: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.address1,
							onChange: (e) => setDraft({
								...draft,
								address1: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Address 2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.address2,
							onChange: (e) => setDraft({
								...draft,
								address2: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Contact",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: draft.contact,
							onChange: (e) => setDraft({
								...draft,
								contact: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2 md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							disabled: save.isPending || !draft.name,
							onClick: () => save.mutate(draft),
							children: "Save party"
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
					className: "w-full min-w-[640px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-fg-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Kind"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "GSTIN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "State"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "City"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: parties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 capitalize",
								children: p.kind
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-mono text-xs",
								children: p.gstin || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [
									p.stateCode,
									"-",
									p.stateName
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: p.city
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mr-3 text-sm text-accent",
									onClick: () => setDraft(fromParty(p)),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-danger",
									onClick: () => del.mutate(p.id),
									children: "Remove"
								})]
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
export { PartiesPage as component };
