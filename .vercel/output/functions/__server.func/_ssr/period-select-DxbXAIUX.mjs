import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { s as gstPeriodOptions } from "./engine-CPod6u8E.mjs";
import { n as Select, t as Label } from "./select-z89nk8bM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/period-select-DxbXAIUX.js
var import_jsx_runtime = require_jsx_runtime();
function PeriodSelect({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full max-w-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Return period" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
			className: "mt-1",
			value,
			onChange: (e) => onChange(e.target.value),
			children: gstPeriodOptions().map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: p.value,
				children: p.label
			}, p.value))
		})]
	});
}
//#endregion
export { PeriodSelect as t };
