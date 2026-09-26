import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-Ab27EcdM.mjs";
import { r as createSsrRpc } from "./router-KVGFt7Cp.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-d_ZARDES.js
var useCompanyStore = create()(persist((set) => ({
	companyId: null,
	setCompanyId: (id) => set({ companyId: id })
}), { name: "pramaan-company" }));
var getWorkspace = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(createSsrRpc("0df20c339bea2f0c6ecf606c006c1943a5e66e1d1d7c0b482828836f0151706e"));
var listCompanies = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("85d71d8f5c0b798efbb97c0e58f926eabe6912d2958df566f6989674e9833711"));
var companyUpdate = object({
	id: number(),
	legalName: string(),
	tradeName: string(),
	pan: string(),
	address1: string(),
	address2: string(),
	city: string(),
	stateCode: string(),
	stateName: string(),
	phone: string(),
	email: string(),
	bankName: string(),
	accountName: string(),
	accountNo: string(),
	ifsc: string(),
	branch: string(),
	upi: string(),
	aato: number(),
	role: string()
});
var saveCompany = createServerFn({ method: "POST" }).validator((d) => companyUpdate.parse(d)).middleware([authMiddleware]).handler(createSsrRpc("05870d754d43e2d1aba77a9fee4f220541564ad8839f78b4370877ffb2f6510c"));
var gstinUpdate = object({
	id: number(),
	gstin: string(),
	stateCode: string(),
	stateName: string(),
	address: string(),
	invoicePrefix: string()
});
var saveGstin = createServerFn({ method: "POST" }).validator((d) => gstinUpdate.parse(d)).middleware([authMiddleware]).handler(createSsrRpc("55654cc9a0306075ba2ef1efdcf52bcae0f331f9e8a0a613fff53a9908e37226"));
var applyGstPreset = createServerFn({ method: "POST" }).validator((d) => object({
	companyId: number(),
	preset: string()
}).parse(d)).middleware([authMiddleware]).handler(createSsrRpc("295dc9b8e357705a069a7cd9d8c0827cb991c937356494a6f3907cffecaee5ed"));
var partySchema = object({
	id: number().optional(),
	companyId: number(),
	kind: string(),
	name: string().min(1),
	gstin: string(),
	pan: string(),
	stateCode: string(),
	stateName: string(),
	address1: string(),
	address2: string(),
	city: string(),
	contact: string()
});
var saveParty = createServerFn({ method: "POST" }).validator((d) => partySchema.parse(d)).middleware([authMiddleware]).handler(createSsrRpc("0611059b209ac81096401cca7e706474bf0882a9eb968aefb0106118394e6a23"));
var deleteParty = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("9b7defae313c2e7c5d6971060a59bf8d7ff748750126698844296fc4f45916ec"));
var productSchema = object({
	id: number().optional(),
	companyId: number(),
	code: string().min(1),
	description: string().min(1),
	kind: string(),
	hsnSac: string(),
	unit: string(),
	rate: number(),
	taxability: string(),
	active: boolean()
});
var saveProduct = createServerFn({ method: "POST" }).validator((d) => productSchema.parse(d)).middleware([authMiddleware]).handler(createSsrRpc("0e0355647a5358fc7c0bfd099021d18162fb6f0c8eadd6030bbb1af33485be9c"));
var deleteProduct = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("715be1ba1720add3744ffc5e92b50a501412f8dbbaac8ea317cd60cd16b71874"));
var listInvoices = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(createSsrRpc("a605073d978b571ce1b0167a46716badff449dff5c32b8804ff71d43156fd4b6"));
var getInvoice = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("729ea0c0c36dc9e52e296a5b90c1b27218ba225ed41829459b3649a9e4c851fc"));
var lineInput = object({
	productId: number().nullable(),
	description: string(),
	hsnSac: string(),
	qty: number(),
	unit: string(),
	rate: number(),
	isCustom: boolean()
});
var invoiceInput = object({
	id: number().optional(),
	companyId: number(),
	gstinId: number(),
	customerId: number().nullable(),
	docType: string(),
	issueDate: string(),
	dueDate: string(),
	poNumber: string(),
	reverseCharge: boolean(),
	gstPreset: string(),
	notes: string(),
	lines: array(lineInput)
});
var saveInvoice = createServerFn({ method: "POST" }).validator((d) => invoiceInput.parse(d)).middleware([authMiddleware]).handler(createSsrRpc("9f6754563c5e3b24d5431463144b60fcd15c96cab3c8a1825dde7ed70845ecfc"));
var issueInvoice = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("91af85c6cde76dd686b235148fa467beca2807890e438e586cc34cbfde477330"));
var generateEinvoice = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("711d862f8f05487e47d133bd39e9de80baac37587a0514b33f810144c6a3ab40"));
var cancelEinvoice = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("22f51cb1314f40056728a9650c17438a10e880000f2f6d92fc71d22423170841"));
var getDashboard = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(createSsrRpc("18f9408f9821e6a611aac86339937888ab0b921a57e9d5ca5e3818dfc79bec2c"));
var getGstr1 = createServerFn({ method: "GET" }).validator((d) => object({
	companyId: number(),
	period: string()
}).parse(d)).middleware([authMiddleware]).handler(createSsrRpc("9cf6b0f1d535a433bded955a0201159a330b75a5c6ae23fcf8efaf6f54427246"));
var getGstr3b = createServerFn({ method: "GET" }).validator((d) => object({
	companyId: number(),
	period: string()
}).parse(d)).middleware([authMiddleware]).handler(createSsrRpc("a871dfefa8287534060a22582b7099799c6a0d9569d03db65d5cec3c1a20c913"));
var lockReturn = createServerFn({ method: "POST" }).validator((d) => object({
	companyId: number(),
	period: string(),
	which: _enum(["gstr1", "gstr3b"])
}).parse(d)).middleware([authMiddleware]).handler(createSsrRpc("9bf69396f79e98d4f2b742926654bbda25d752ea75c1a23b54037123bea8f9d0"));
var getReconciliation = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(createSsrRpc("e5f3509479b7436ec1da4a9b366654d834aceeeff0a3ba761f260b1c20ccae4b"));
var listPurchases = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(createSsrRpc("e57a2267c668f5847e7f9f05ac53d2223ff5511c72ef47c1c8982600661f4adf"));
var getReports = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(createSsrRpc("88f9f8a14395419822022454dd50a39ba6a466fc8507b649e71b6b651e36a2f0"));
//#endregion
export { useCompanyStore as C, saveProduct as S, lockReturn as _, generateEinvoice as a, saveInvoice as b, getGstr3b as c, getReports as d, getWorkspace as f, listPurchases as g, listInvoices as h, deleteProduct as i, getInvoice as l, listCompanies as m, cancelEinvoice as n, getDashboard as o, issueInvoice as p, deleteParty as r, getGstr1 as s, applyGstPreset as t, getReconciliation as u, saveCompany as v, saveParty as x, saveGstin as y };
