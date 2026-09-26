//#region node_modules/.nitro/vite/services/ssr/assets/catalog-C2pOHWsL.js
var GST_PRESETS = [
	{
		name: "Regular 18% (Inter-State IGST)",
		scheme: "REGULAR",
		cgst: 0,
		sgst: 0,
		igst: .18
	},
	{
		name: "Regular 18% (Intra-State CGST+SGST)",
		scheme: "REGULAR",
		cgst: .09,
		sgst: .09,
		igst: 0
	},
	{
		name: "Regular 12% (Inter-State IGST)",
		scheme: "REGULAR",
		cgst: 0,
		sgst: 0,
		igst: .12
	},
	{
		name: "Regular 12% (Intra-State CGST+SGST)",
		scheme: "REGULAR",
		cgst: .06,
		sgst: .06,
		igst: 0
	},
	{
		name: "Regular 5% (Inter-State IGST)",
		scheme: "REGULAR",
		cgst: 0,
		sgst: 0,
		igst: .05
	},
	{
		name: "Regular 5% (Intra-State CGST+SGST)",
		scheme: "REGULAR",
		cgst: .025,
		sgst: .025,
		igst: 0
	},
	{
		name: "Regular 28% (Inter-State IGST)",
		scheme: "REGULAR",
		cgst: 0,
		sgst: 0,
		igst: .28
	},
	{
		name: "Regular 28% (Intra-State CGST+SGST)",
		scheme: "REGULAR",
		cgst: .14,
		sgst: .14,
		igst: 0
	},
	{
		name: "Composition 6% (Services)",
		scheme: "COMPOSITION",
		cgst: 0,
		sgst: 0,
		igst: 0
	},
	{
		name: "Composition 1% (Traders)",
		scheme: "COMPOSITION",
		cgst: 0,
		sgst: 0,
		igst: 0
	},
	{
		name: "Composition 5% (Restaurants)",
		scheme: "COMPOSITION",
		cgst: 0,
		sgst: 0,
		igst: 0
	},
	{
		name: "Exempt / Nil Rated",
		scheme: "REGULAR",
		cgst: 0,
		sgst: 0,
		igst: 0
	}
];
var COMPOSITION_RATES = {
	"Composition 6% (Services)": .06,
	"Composition 1% (Traders)": .01,
	"Composition 5% (Restaurants)": .05
};
function findPreset(name) {
	return GST_PRESETS.find((p) => p.name === name) ?? GST_PRESETS[0];
}
var INDIAN_STATES = [
	{
		code: "01",
		name: "Jammu and Kashmir"
	},
	{
		code: "02",
		name: "Himachal Pradesh"
	},
	{
		code: "03",
		name: "Punjab"
	},
	{
		code: "04",
		name: "Chandigarh"
	},
	{
		code: "05",
		name: "Uttarakhand"
	},
	{
		code: "06",
		name: "Haryana"
	},
	{
		code: "07",
		name: "Delhi"
	},
	{
		code: "08",
		name: "Rajasthan"
	},
	{
		code: "09",
		name: "Uttar Pradesh"
	},
	{
		code: "10",
		name: "Bihar"
	},
	{
		code: "11",
		name: "Sikkim"
	},
	{
		code: "12",
		name: "Arunachal Pradesh"
	},
	{
		code: "13",
		name: "Nagaland"
	},
	{
		code: "14",
		name: "Manipur"
	},
	{
		code: "15",
		name: "Mizoram"
	},
	{
		code: "16",
		name: "Tripura"
	},
	{
		code: "17",
		name: "Meghalaya"
	},
	{
		code: "18",
		name: "Assam"
	},
	{
		code: "19",
		name: "West Bengal"
	},
	{
		code: "20",
		name: "Jharkhand"
	},
	{
		code: "21",
		name: "Odisha"
	},
	{
		code: "22",
		name: "Chhattisgarh"
	},
	{
		code: "23",
		name: "Madhya Pradesh"
	},
	{
		code: "24",
		name: "Gujarat"
	},
	{
		code: "27",
		name: "Maharashtra"
	},
	{
		code: "29",
		name: "Karnataka"
	},
	{
		code: "30",
		name: "Goa"
	},
	{
		code: "32",
		name: "Kerala"
	},
	{
		code: "33",
		name: "Tamil Nadu"
	},
	{
		code: "34",
		name: "Puducherry"
	},
	{
		code: "36",
		name: "Telangana"
	},
	{
		code: "37",
		name: "Andhra Pradesh"
	}
];
function stateName(code) {
	return INDIAN_STATES.find((s) => s.code === code)?.name ?? code;
}
var UNITS = [
	"Project",
	"Hours",
	"Days",
	"Months",
	"Unit",
	"License",
	"Nos",
	"Kg",
	"Litre",
	"Set"
];
var CUSTOM_PRODUCT_CODE = "CUSTOM";
function gstinLooksValid(gstin) {
	return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gstin.trim());
}
function stateFromGstin(gstin) {
	const code = gstin.trim().slice(0, 2);
	return {
		code,
		name: stateName(code)
	};
}
function hsnRequiredDigits(aato) {
	if (aato > 5e7) return 6;
	return 4;
}
//#endregion
export { UNITS as a, hsnRequiredDigits as c, INDIAN_STATES as i, stateFromGstin as l, CUSTOM_PRODUCT_CODE as n, findPreset as o, GST_PRESETS as r, gstinLooksValid as s, COMPOSITION_RATES as t };
