import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-ChpAMLfh.mjs";
import { t as authMiddleware } from "./middleware-Ab27EcdM.mjs";
import { n as CUSTOM_PRODUCT_CODE, o as findPreset, t as COMPOSITION_RATES } from "./catalog-C2pOHWsL.mjs";
import { d as withinReportingWindow, i as einvoiceRequired, l as num, n as computeTax, o as fyFromDate, u as roundMoney } from "./engine-fM4Ykfgu.mjs";
import { t as mockIrn } from "./irn-WNim9sE-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DirmAWoF.js
function mapCompany(r) {
	return {
		id: num(r.id),
		legalName: String(r.legal_name),
		tradeName: String(r.trade_name),
		pan: String(r.pan),
		address1: String(r.address1),
		address2: String(r.address2),
		city: String(r.city),
		stateCode: String(r.state_code),
		stateName: String(r.state_name),
		phone: String(r.phone),
		email: String(r.email),
		bankName: String(r.bank_name),
		accountName: String(r.account_name),
		accountNo: String(r.account_no),
		ifsc: String(r.ifsc),
		branch: String(r.branch),
		upi: String(r.upi),
		taxScheme: String(r.tax_scheme),
		compositionRate: num(r.composition_rate),
		gstPreset: String(r.gst_preset),
		cgstRate: num(r.cgst_rate),
		sgstRate: num(r.sgst_rate),
		igstRate: num(r.igst_rate),
		aato: num(r.aato),
		role: String(r.role)
	};
}
async function audit(userId, companyId, action, entity, entityId, detail) {
	await (await getSql())`insert into audit_log (user_id, company_id, action, entity, entity_id, detail)
    values (${userId}, ${companyId}, ${action}, ${entity}, ${entityId}, ${detail})`;
}
async function ensureWorkspace(userId) {
	const sql = await getSql();
	const existing = await sql`select id from companies where user_id = ${userId} order by id asc limit 1`;
	if (existing[0]) return existing[0].id;
	const companyId = (await sql`
    insert into companies (
      user_id, legal_name, trade_name, pan, address1, address2, city, state_code, state_name,
      phone, email, bank_name, account_name, account_no, ifsc, branch, upi, tax_scheme,
      gst_preset, cgst_rate, sgst_rate, igst_rate, aato, role
    ) values (
      ${userId}, 'Apex Consulting Group', 'Enterprise Solutions Division', 'AABCA1234D',
      '12th Floor, One World Centre, Senapati Bapat Marg', 'Lower Parel', 'Mumbai',
      '27', 'Maharashtra', '+91 22 6123 4500', 'billing@apexconsulting.in',
      'HDFC Bank Ltd.', 'Apex Consulting Group', '502000********21', 'HDFC0000123',
      'Lower Parel, Mumbai', 'apex.billing@hdfcbank', 'REGULAR',
      'Regular 18% (Inter-State IGST)', 0, 0, 0.18, 62000000, 'owner'
    ) returning id`)[0].id;
	const gstinId = (await sql`
    insert into gstins (user_id, company_id, gstin, state_code, state_name, address, is_primary, invoice_prefix, next_number)
    values (${userId}, ${companyId}, '27AABCA1234D1Z5', '27', 'Maharashtra',
      '12th Floor, One World Centre, Lower Parel, Mumbai 400013', true, 'INV', 5)
    returning id`)[0].id;
	const meridian = await sql`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, address2, city, contact)
    values (${userId}, ${companyId}, 'customer', 'Meridian Technologies Pvt. Ltd.', '33AADCM9876K1Z2', 'AADCM9876K',
      '33', 'Tamil Nadu', 'No. 42, Rajiv Gandhi Salai (OMR)', 'Thoraipakkam', 'Chennai', 'Accounts Payable')
    returning id`;
	await sql`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, city, contact)
    values (${userId}, ${companyId}, 'customer', 'Walk-in / Unregistered', '', '', '27', 'Maharashtra',
      'Retail counter', 'Mumbai', '')`;
	const vendor = await sql`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, city, contact)
    values (${userId}, ${companyId}, 'vendor', 'Nimbus Cloud Services LLP', '29AABCN4433P1Z8', 'AABCN4433P',
      '29', 'Karnataka', 'Manyata Tech Park', 'Bengaluru', 'Billing desk')
    returning id`;
	await sql`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, city, contact)
    values (${userId}, ${companyId}, 'vendor', 'Harbour Stationery', '27AAGCH2211Q1Z3', 'AAGCH2211Q',
      '27', 'Maharashtra', 'Fort', 'Mumbai', '')`;
	const products = [
		[
			"SVC-001",
			"Enterprise Cloud Migration Assessment",
			"service",
			"998311",
			"Project",
			18500
		],
		[
			"SVC-002",
			"Security & Compliance Review",
			"service",
			"998311",
			"Hours",
			180
		],
		[
			"SVC-003",
			"Data Architecture Design Workshop",
			"service",
			"998311",
			"Days",
			3250
		],
		[
			"SVC-004",
			"Implementation Support Retainer",
			"service",
			"998314",
			"Months",
			4e3
		],
		[
			"SVC-005",
			"IT Infrastructure Audit",
			"service",
			"998311",
			"Project",
			12500
		],
		[
			"SVC-006",
			"Cloud Cost Optimization",
			"service",
			"998311",
			"Project",
			9800
		],
		[
			"SVC-007",
			"DevOps Pipeline Setup",
			"service",
			"998314",
			"Project",
			15e3
		],
		[
			"SVC-008",
			"Managed Support (Monthly)",
			"service",
			"998314",
			"Months",
			3500
		],
		[
			"PRD-001",
			"Software License - Enterprise",
			"product",
			"852380",
			"License",
			45e3
		],
		[
			CUSTOM_PRODUCT_CODE,
			"<< CUSTOM ENTRY >>",
			"custom",
			"",
			"Unit",
			0
		]
	];
	for (const p of products) await sql`insert into products (user_id, company_id, code, description, kind, hsn_sac, unit, rate)
      values (${userId}, ${companyId}, ${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]})`;
	const custId = meridian[0].id;
	const seedInvoices = [
		{
			number: "INV-2026-0001",
			date: "2026-09-04",
			due: "2026-10-04",
			status: "issued",
			ei: "generated",
			irn: mockIrn("27AABCA1234D1Z5", "INV-2026-0001", "2026-27"),
			lines: [{
				desc: "Enterprise Cloud Migration Assessment",
				sac: "998311",
				qty: 1,
				unit: "Project",
				rate: 18500
			}]
		},
		{
			number: "INV-2026-0002",
			date: "2026-09-10",
			due: "2026-10-10",
			status: "issued",
			ei: "generated",
			irn: mockIrn("27AABCA1234D1Z5", "INV-2026-0002", "2026-27"),
			lines: [{
				desc: "Security & Compliance Review",
				sac: "998311",
				qty: 80,
				unit: "Hours",
				rate: 180
			}]
		},
		{
			number: "INV-2026-0003",
			date: "2026-09-14",
			due: "2026-10-14",
			status: "issued",
			ei: "failed",
			irn: "",
			lines: [{
				desc: "Data Architecture Design Workshop",
				sac: "998311",
				qty: 3,
				unit: "Days",
				rate: 3250
			}]
		},
		{
			number: "INV-2026-0004",
			date: "2026-09-18",
			due: "2026-10-18",
			status: "draft",
			ei: "pending",
			irn: "",
			lines: [{
				desc: "Implementation Support Retainer",
				sac: "998314",
				qty: 3,
				unit: "Months",
				rate: 4e3
			}]
		}
	];
	for (const inv of seedInvoices) {
		const taxable = roundMoney(inv.lines.reduce((s, l) => s + l.qty * l.rate, 0));
		const tax = computeTax({
			presetName: "Regular 18% (Inter-State IGST)",
			supplierState: "27",
			recipientState: "33",
			taxable
		});
		const eiStatus = inv.ei;
		const invoiceId = (await sql`
      insert into invoices (
        user_id, company_id, gstin_id, customer_id, doc_type, number, issue_date, due_date, po_number,
        place_of_supply_code, place_of_supply_name, supply_type, reverse_charge, gst_preset, scheme,
        cgst_rate, sgst_rate, igst_rate, taxable, cgst, sgst, igst, total, notes, status,
        einvoice_status, irn, irn_date, qr_payload
      ) values (
        ${userId}, ${companyId}, ${gstinId}, ${custId}, 'tax_invoice', ${inv.number}, ${inv.date}::date, ${inv.due}::date,
        'PO-88421-A', '33', 'Tamil Nadu', ${tax.supplyType}, false, 'Regular 18% (Inter-State IGST)', ${tax.scheme},
        ${tax.cgstRate}, ${tax.sgstRate}, ${tax.igstRate}, ${tax.taxable}, ${tax.cgst}, ${tax.sgst}, ${tax.igst},
        ${tax.grandTotal}, 'Net 30. Quote invoice number on remittance.', ${inv.status},
        ${eiStatus}, ${inv.irn}, ${inv.irn ? inv.date : null}, ${inv.irn}
      ) returning id`)[0].id;
		for (let i = 0; i < inv.lines.length; i++) {
			const l = inv.lines[i];
			const amount = roundMoney(l.qty * l.rate);
			await sql`insert into invoice_lines (user_id, invoice_id, line_no, description, hsn_sac, qty, unit, rate, amount, is_custom)
        values (${userId}, ${invoiceId}, ${i + 1}, ${l.desc}, ${l.sac}, ${l.qty}, ${l.unit}, ${l.rate}, ${amount}, false)`;
		}
	}
	await sql`insert into purchases (user_id, company_id, vendor_id, number, issue_date, hsn_sac, taxable, cgst, sgst, igst, total, in_gstr2b, notes)
    values
    (${userId}, ${companyId}, ${vendor[0].id}, 'NCS-4421', '2026-09-06'::date, '998315', 8000, 0, 0, 1440, 9440, true, 'Matches 2B'),
    (${userId}, ${companyId}, ${vendor[0].id}, 'NCS-4480', '2026-09-12'::date, '998315', 12500, 0, 0, 2250, 14750, false, 'In books, missing in 2B')`;
	await audit(userId, companyId, "seed", "workspace", String(companyId), "Demo workspace created");
	return companyId;
}
async function loadWorkspace(userId, companyId) {
	const sql = await getSql();
	const companies = await sql`select * from companies where user_id = ${userId} and id = ${companyId ?? await ensureWorkspace(userId)} limit 1`;
	if (!companies[0]) return loadWorkspace(userId, await ensureWorkspace(userId));
	const company = mapCompany(companies[0]);
	const gstins = await sql`select * from gstins where user_id = ${userId} and company_id = ${company.id} order by is_primary desc, id`;
	const parties = await sql`select * from parties where user_id = ${userId} and company_id = ${company.id} order by kind, name`;
	const products = await sql`select * from products where user_id = ${userId} and company_id = ${company.id} order by code`;
	return {
		company,
		gstins: gstins.map((g) => ({
			id: num(g.id),
			gstin: String(g.gstin),
			stateCode: String(g.state_code),
			stateName: String(g.state_name),
			address: String(g.address),
			isPrimary: Boolean(g.is_primary),
			invoicePrefix: String(g.invoice_prefix),
			nextNumber: num(g.next_number)
		})),
		parties: parties.map(mapParty),
		products: products.map(mapProduct)
	};
}
function mapParty(p) {
	return {
		id: num(p.id),
		kind: String(p.kind),
		name: String(p.name),
		gstin: String(p.gstin),
		pan: String(p.pan),
		stateCode: String(p.state_code),
		stateName: String(p.state_name),
		address1: String(p.address1),
		address2: String(p.address2 ?? ""),
		city: String(p.city),
		contact: String(p.contact)
	};
}
function mapProduct(p) {
	return {
		id: num(p.id),
		code: String(p.code),
		description: String(p.description),
		kind: String(p.kind),
		hsnSac: String(p.hsn_sac),
		unit: String(p.unit),
		rate: num(p.rate),
		taxability: String(p.taxability),
		active: Boolean(p.active)
	};
}
function mapLine(l) {
	return {
		id: num(l.id),
		lineNo: num(l.line_no),
		productId: l.product_id == null ? null : num(l.product_id),
		description: String(l.description),
		hsnSac: String(l.hsn_sac),
		qty: num(l.qty),
		unit: String(l.unit),
		rate: num(l.rate),
		amount: num(l.amount),
		isCustom: Boolean(l.is_custom)
	};
}
function isoDate(v) {
	if (!v) return "";
	if (typeof v === "string") return v.slice(0, 10);
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	return String(v).slice(0, 10);
}
function mapInvoice(r, lines, customer) {
	return {
		id: num(r.id),
		companyId: num(r.company_id),
		gstinId: num(r.gstin_id),
		customerId: r.customer_id == null ? null : num(r.customer_id),
		docType: String(r.doc_type),
		number: String(r.number),
		issueDate: isoDate(r.issue_date),
		dueDate: isoDate(r.due_date),
		poNumber: String(r.po_number),
		placeOfSupplyCode: String(r.place_of_supply_code),
		placeOfSupplyName: String(r.place_of_supply_name),
		supplyType: String(r.supply_type),
		reverseCharge: Boolean(r.reverse_charge),
		gstPreset: String(r.gst_preset),
		scheme: String(r.scheme),
		cgstRate: num(r.cgst_rate),
		sgstRate: num(r.sgst_rate),
		igstRate: num(r.igst_rate),
		taxable: num(r.taxable),
		cgst: num(r.cgst),
		sgst: num(r.sgst),
		igst: num(r.igst),
		total: num(r.total),
		notes: String(r.notes),
		status: String(r.status),
		einvoiceStatus: String(r.einvoice_status),
		irn: String(r.irn),
		irnDate: r.irn_date ? String(r.irn_date) : null,
		qrPayload: String(r.qr_payload),
		lines,
		customer: customer ?? null
	};
}
var getWorkspace_createServerFn_handler = createServerRpc({
	id: "0df20c339bea2f0c6ecf606c006c1943a5e66e1d1d7c0b482828836f0151706e",
	name: "getWorkspace",
	filename: "src/lib/gst/server.ts"
}, (opts) => getWorkspace.__executeServer(opts));
var getWorkspace = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(getWorkspace_createServerFn_handler, async ({ context, data }) => {
	return loadWorkspace(context.userId, data);
});
var listCompanies_createServerFn_handler = createServerRpc({
	id: "85d71d8f5c0b798efbb97c0e58f926eabe6912d2958df566f6989674e9833711",
	name: "listCompanies",
	filename: "src/lib/gst/server.ts"
}, (opts) => listCompanies.__executeServer(opts));
var listCompanies = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCompanies_createServerFn_handler, async ({ context }) => {
	await ensureWorkspace(context.userId);
	return (await (await getSql())`select * from companies where user_id = ${context.userId} order by id`).map(mapCompany);
});
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
var saveCompany_createServerFn_handler = createServerRpc({
	id: "05870d754d43e2d1aba77a9fee4f220541564ad8839f78b4370877ffb2f6510c",
	name: "saveCompany",
	filename: "src/lib/gst/server.ts"
}, (opts) => saveCompany.__executeServer(opts));
var saveCompany = createServerFn({ method: "POST" }).validator((d) => companyUpdate.parse(d)).middleware([authMiddleware]).handler(saveCompany_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`update companies set
      legal_name = ${data.legalName}, trade_name = ${data.tradeName}, pan = ${data.pan},
      address1 = ${data.address1}, address2 = ${data.address2}, city = ${data.city},
      state_code = ${data.stateCode}, state_name = ${data.stateName}, phone = ${data.phone},
      email = ${data.email}, bank_name = ${data.bankName}, account_name = ${data.accountName},
      account_no = ${data.accountNo}, ifsc = ${data.ifsc}, branch = ${data.branch}, upi = ${data.upi},
      aato = ${data.aato}, role = ${data.role}
      where id = ${data.id} and user_id = ${context.userId}`;
	await audit(context.userId, data.id, "update", "company", String(data.id), "Business profile updated");
	return loadWorkspace(context.userId, data.id);
});
var gstinUpdate = object({
	id: number(),
	gstin: string(),
	stateCode: string(),
	stateName: string(),
	address: string(),
	invoicePrefix: string()
});
var saveGstin_createServerFn_handler = createServerRpc({
	id: "55654cc9a0306075ba2ef1efdcf52bcae0f331f9e8a0a613fff53a9908e37226",
	name: "saveGstin",
	filename: "src/lib/gst/server.ts"
}, (opts) => saveGstin.__executeServer(opts));
var saveGstin = createServerFn({ method: "POST" }).validator((d) => gstinUpdate.parse(d)).middleware([authMiddleware]).handler(saveGstin_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`update gstins set gstin = ${data.gstin}, state_code = ${data.stateCode},
      state_name = ${data.stateName}, address = ${data.address}, invoice_prefix = ${data.invoicePrefix}
      where id = ${data.id} and user_id = ${context.userId}`;
	await audit(context.userId, null, "update", "gstin", data.gstin, "GSTIN updated");
	return { ok: true };
});
var applyGstPreset_createServerFn_handler = createServerRpc({
	id: "295dc9b8e357705a069a7cd9d8c0827cb991c937356494a6f3907cffecaee5ed",
	name: "applyGstPreset",
	filename: "src/lib/gst/server.ts"
}, (opts) => applyGstPreset.__executeServer(opts));
var applyGstPreset = createServerFn({ method: "POST" }).validator((d) => object({
	companyId: number(),
	preset: string()
}).parse(d)).middleware([authMiddleware]).handler(applyGstPreset_createServerFn_handler, async ({ context, data }) => {
	const preset = findPreset(data.preset);
	const compositionRate = COMPOSITION_RATES[preset.name] ?? 0;
	const sql = await getSql();
	await sql`update companies set gst_preset = ${preset.name}, tax_scheme = ${preset.scheme},
      cgst_rate = ${preset.cgst}, sgst_rate = ${preset.sgst}, igst_rate = ${preset.igst},
      composition_rate = ${compositionRate}
      where id = ${data.companyId} and user_id = ${context.userId}`;
	const drafts = await sql`
      select i.*, g.state_code as supplier_state, p.state_code as recipient_state
      from invoices i
      join gstins g on g.id = i.gstin_id
      left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data.companyId} and i.status = 'draft'`;
	for (const inv of drafts) {
		const tax = computeTax({
			presetName: preset.name,
			supplierState: String(inv.supplier_state),
			recipientState: String(inv.recipient_state || inv.supplier_state),
			taxable: num(inv.taxable)
		});
		const docType = tax.scheme === "COMPOSITION" ? "bill_of_supply" : String(inv.doc_type) === "bill_of_supply" ? "tax_invoice" : String(inv.doc_type);
		await sql`update invoices set gst_preset = ${preset.name}, scheme = ${tax.scheme},
        cgst_rate = ${tax.cgstRate}, sgst_rate = ${tax.sgstRate}, igst_rate = ${tax.igstRate},
        cgst = ${tax.cgst}, sgst = ${tax.sgst}, igst = ${tax.igst}, total = ${tax.grandTotal},
        supply_type = ${tax.supplyType}, doc_type = ${docType}
        where id = ${num(inv.id)} and user_id = ${context.userId}`;
	}
	await audit(context.userId, data.companyId, "preset", "company", String(data.companyId), preset.name);
	return loadWorkspace(context.userId, data.companyId);
});
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
var saveParty_createServerFn_handler = createServerRpc({
	id: "0611059b209ac81096401cca7e706474bf0882a9eb968aefb0106118394e6a23",
	name: "saveParty",
	filename: "src/lib/gst/server.ts"
}, (opts) => saveParty.__executeServer(opts));
var saveParty = createServerFn({ method: "POST" }).validator((d) => partySchema.parse(d)).middleware([authMiddleware]).handler(saveParty_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (data.id) {
		await sql`update parties set name = ${data.name}, gstin = ${data.gstin}, pan = ${data.pan},
        state_code = ${data.stateCode}, state_name = ${data.stateName}, address1 = ${data.address1},
        address2 = ${data.address2}, city = ${data.city}, contact = ${data.contact}, kind = ${data.kind}
        where id = ${data.id} and user_id = ${context.userId}`;
		return data.id;
	}
	return (await sql`insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, address2, city, contact)
      values (${context.userId}, ${data.companyId}, ${data.kind}, ${data.name}, ${data.gstin}, ${data.pan}, ${data.stateCode}, ${data.stateName}, ${data.address1}, ${data.address2}, ${data.city}, ${data.contact})
      returning id`)[0].id;
});
var deleteParty_createServerFn_handler = createServerRpc({
	id: "9b7defae313c2e7c5d6971060a59bf8d7ff748750126698844296fc4f45916ec",
	name: "deleteParty",
	filename: "src/lib/gst/server.ts"
}, (opts) => deleteParty.__executeServer(opts));
var deleteParty = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(deleteParty_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from parties where id = ${data} and user_id = ${context.userId}`;
});
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
var saveProduct_createServerFn_handler = createServerRpc({
	id: "0e0355647a5358fc7c0bfd099021d18162fb6f0c8eadd6030bbb1af33485be9c",
	name: "saveProduct",
	filename: "src/lib/gst/server.ts"
}, (opts) => saveProduct.__executeServer(opts));
var saveProduct = createServerFn({ method: "POST" }).validator((d) => productSchema.parse(d)).middleware([authMiddleware]).handler(saveProduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (data.id) {
		await sql`update products set code = ${data.code}, description = ${data.description}, kind = ${data.kind},
        hsn_sac = ${data.hsnSac}, unit = ${data.unit}, rate = ${data.rate}, taxability = ${data.taxability}, active = ${data.active}
        where id = ${data.id} and user_id = ${context.userId}`;
		return data.id;
	}
	return (await sql`insert into products (user_id, company_id, code, description, kind, hsn_sac, unit, rate, taxability, active)
      values (${context.userId}, ${data.companyId}, ${data.code}, ${data.description}, ${data.kind}, ${data.hsnSac}, ${data.unit}, ${data.rate}, ${data.taxability}, ${data.active})
      returning id`)[0].id;
});
var deleteProduct_createServerFn_handler = createServerRpc({
	id: "715be1ba1720add3744ffc5e92b50a501412f8dbbaac8ea317cd60cd16b71874",
	name: "deleteProduct",
	filename: "src/lib/gst/server.ts"
}, (opts) => deleteProduct.__executeServer(opts));
var deleteProduct = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(deleteProduct_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from products where id = ${data} and user_id = ${context.userId} and code <> ${CUSTOM_PRODUCT_CODE}`;
});
var listInvoices_createServerFn_handler = createServerRpc({
	id: "a605073d978b571ce1b0167a46716badff449dff5c32b8804ff71d43156fd4b6",
	name: "listInvoices",
	filename: "src/lib/gst/server.ts"
}, (opts) => listInvoices.__executeServer(opts));
var listInvoices = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(listInvoices_createServerFn_handler, async ({ context, data }) => {
	await ensureWorkspace(context.userId);
	return (await (await getSql())`
      select i.*, p.name as customer_name, p.gstin as customer_gstin
      from invoices i
      left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data}
      order by i.issue_date desc, i.id desc`).map((r) => ({
		...mapInvoice(r, []),
		customerName: String(r.customer_name ?? "—"),
		customerGstin: String(r.customer_gstin ?? "")
	}));
});
async function loadInvoice(userId, id) {
	const sql = await getSql();
	const rows = await sql`select * from invoices where id = ${id} and user_id = ${userId} limit 1`;
	if (!rows[0]) return null;
	const lines = await sql`select * from invoice_lines where invoice_id = ${id} and user_id = ${userId} order by line_no`;
	let customer = null;
	if (rows[0].customer_id) {
		const p = await sql`select * from parties where id = ${num(rows[0].customer_id)} and user_id = ${userId}`;
		customer = p[0] ? mapParty(p[0]) : null;
	}
	return mapInvoice(rows[0], lines.map(mapLine), customer);
}
var getInvoice_createServerFn_handler = createServerRpc({
	id: "729ea0c0c36dc9e52e296a5b90c1b27218ba225ed41829459b3649a9e4c851fc",
	name: "getInvoice",
	filename: "src/lib/gst/server.ts"
}, (opts) => getInvoice.__executeServer(opts));
var getInvoice = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(getInvoice_createServerFn_handler, async ({ context, data }) => loadInvoice(context.userId, data));
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
var saveInvoice_createServerFn_handler = createServerRpc({
	id: "9f6754563c5e3b24d5431463144b60fcd15c96cab3c8a1825dde7ed70845ecfc",
	name: "saveInvoice",
	filename: "src/lib/gst/server.ts"
}, (opts) => saveInvoice.__executeServer(opts));
var saveInvoice = createServerFn({ method: "POST" }).validator((d) => invoiceInput.parse(d)).middleware([authMiddleware]).handler(saveInvoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const companyRows = await sql`select * from companies where id = ${data.companyId} and user_id = ${context.userId}`;
	const gstinRows = await sql`select * from gstins where id = ${data.gstinId} and user_id = ${context.userId}`;
	if (!companyRows[0] || !gstinRows[0]) throw new Error("Company or GSTIN not found");
	if (String(companyRows[0].role) === "viewer") throw new Error("Viewers cannot edit invoices");
	let recipientState = String(gstinRows[0].state_code);
	let customerGstin = "";
	if (data.customerId) {
		const p = await sql`select * from parties where id = ${data.customerId} and user_id = ${context.userId}`;
		if (p[0]) {
			recipientState = String(p[0].state_code || recipientState);
			customerGstin = String(p[0].gstin || "");
		}
	}
	const taxable = roundMoney(data.lines.reduce((s, l) => s + roundMoney(l.qty * l.rate), 0));
	const tax = computeTax({
		presetName: data.gstPreset,
		supplierState: String(gstinRows[0].state_code),
		recipientState,
		taxable
	});
	const docType = tax.scheme === "COMPOSITION" ? "bill_of_supply" : data.docType;
	const required = einvoiceRequired(num(companyRows[0].aato), tax.scheme, Boolean(customerGstin), docType);
	const placeName = String((await sql`select state_name from parties where id = ${data.customerId} and user_id = ${context.userId}`)?.[0]?.state_name ?? gstinRows[0].state_name);
	let invoiceId = data.id;
	if (invoiceId) {
		const existing = await sql`select status from invoices where id = ${invoiceId} and user_id = ${context.userId}`;
		if (!existing[0]) throw new Error("Invoice not found");
		if (existing[0].status === "cancelled") throw new Error("Cancelled invoices cannot be edited");
		await sql`update invoices set gstin_id = ${data.gstinId}, customer_id = ${data.customerId}, doc_type = ${docType},
        issue_date = ${data.issueDate}::date, due_date = ${data.dueDate}::date, po_number = ${data.poNumber},
        place_of_supply_code = ${recipientState}, place_of_supply_name = ${placeName}, supply_type = ${tax.supplyType},
        reverse_charge = ${data.reverseCharge}, gst_preset = ${data.gstPreset}, scheme = ${tax.scheme},
        cgst_rate = ${tax.cgstRate}, sgst_rate = ${tax.sgstRate}, igst_rate = ${tax.igstRate},
        taxable = ${tax.taxable}, cgst = ${tax.cgst}, sgst = ${tax.sgst}, igst = ${tax.igst}, total = ${tax.grandTotal},
        notes = ${data.notes}, einvoice_status = ${required ? "pending" : "not_required"}
        where id = ${invoiceId} and user_id = ${context.userId} and status = 'draft'`;
		await sql`delete from invoice_lines where invoice_id = ${invoiceId} and user_id = ${context.userId}`;
	} else invoiceId = (await sql`insert into invoices (
        user_id, company_id, gstin_id, customer_id, doc_type, number, issue_date, due_date, po_number,
        place_of_supply_code, place_of_supply_name, supply_type, reverse_charge, gst_preset, scheme,
        cgst_rate, sgst_rate, igst_rate, taxable, cgst, sgst, igst, total, notes, status, einvoice_status
      ) values (
        ${context.userId}, ${data.companyId}, ${data.gstinId}, ${data.customerId}, ${docType}, '', ${data.issueDate}::date,
        ${data.dueDate}::date, ${data.poNumber}, ${recipientState}, ${placeName}, ${tax.supplyType}, ${data.reverseCharge},
        ${data.gstPreset}, ${tax.scheme}, ${tax.cgstRate}, ${tax.sgstRate}, ${tax.igstRate}, ${tax.taxable},
        ${tax.cgst}, ${tax.sgst}, ${tax.igst}, ${tax.grandTotal}, ${data.notes}, 'draft', ${required ? "pending" : "not_required"}
      ) returning id`)[0].id;
	for (let i = 0; i < data.lines.length; i++) {
		const l = data.lines[i];
		const amount = roundMoney(l.qty * l.rate);
		await sql`insert into invoice_lines (user_id, invoice_id, line_no, product_id, description, hsn_sac, qty, unit, rate, amount, is_custom)
        values (${context.userId}, ${invoiceId}, ${i + 1}, ${l.productId}, ${l.description}, ${l.hsnSac}, ${l.qty}, ${l.unit}, ${l.rate}, ${amount}, ${l.isCustom})`;
	}
	await audit(context.userId, data.companyId, "save", "invoice", String(invoiceId), docType);
	return loadInvoice(context.userId, invoiceId);
});
var issueInvoice_createServerFn_handler = createServerRpc({
	id: "91af85c6cde76dd686b235148fa467beca2807890e438e586cc34cbfde477330",
	name: "issueInvoice",
	filename: "src/lib/gst/server.ts"
}, (opts) => issueInvoice.__executeServer(opts));
var issueInvoice = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(issueInvoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const inv = await sql`select * from invoices where id = ${data} and user_id = ${context.userId}`;
	if (!inv[0]) throw new Error("Invoice not found");
	if (String(inv[0].status) !== "draft") return loadInvoice(context.userId, data);
	const g = await sql`select * from gstins where id = ${num(inv[0].gstin_id)} and user_id = ${context.userId}`;
	const next = num(g[0].next_number);
	const number = `${String(g[0].invoice_prefix)}-${String(inv[0].issue_date).slice(0, 4)}-${String(next).padStart(4, "0")}`;
	await sql`update gstins set next_number = ${next + 1} where id = ${num(g[0].id)} and user_id = ${context.userId}`;
	await sql`update invoices set status = 'issued', number = ${number} where id = ${data} and user_id = ${context.userId}`;
	await audit(context.userId, num(inv[0].company_id), "issue", "invoice", number, "Issued");
	return loadInvoice(context.userId, data);
});
var generateEinvoice_createServerFn_handler = createServerRpc({
	id: "711d862f8f05487e47d133bd39e9de80baac37587a0514b33f810144c6a3ab40",
	name: "generateEinvoice",
	filename: "src/lib/gst/server.ts"
}, (opts) => generateEinvoice.__executeServer(opts));
var generateEinvoice = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(generateEinvoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const inv = await loadInvoice(context.userId, data);
	if (!inv) throw new Error("Invoice not found");
	const company = (await loadWorkspace(context.userId, inv.companyId)).company;
	const gstin = (await loadWorkspace(context.userId, inv.companyId)).gstins.find((g) => g.id === inv.gstinId);
	if (inv.status !== "issued") throw new Error("Issue the invoice before generating IRN");
	if (!einvoiceRequired(company.aato, inv.scheme, Boolean(inv.customer?.gstin), inv.docType)) throw new Error("E-invoicing is not required for this document");
	if (!withinReportingWindow(company.aato, inv.issueDate)) {
		await sql`update invoices set einvoice_status = 'failed' where id = ${data} and user_id = ${context.userId}`;
		throw new Error("IRP rejected: invoice is older than 30 days (AATO ≥ ₹10 Cr)");
	}
	const irn = mockIrn(gstin?.gstin ?? "", inv.number, fyFromDate(inv.issueDate));
	await sql`update invoices set einvoice_status = 'generated', irn = ${irn}, irn_date = now(), qr_payload = ${JSON.stringify({
		irn,
		gstin: gstin?.gstin,
		number: inv.number,
		date: inv.issueDate,
		value: inv.total
	})}
      where id = ${data} and user_id = ${context.userId}`;
	await audit(context.userId, inv.companyId, "irn", "invoice", inv.number, irn);
	return loadInvoice(context.userId, data);
});
var cancelEinvoice_createServerFn_handler = createServerRpc({
	id: "22f51cb1314f40056728a9650c17438a10e880000f2f6d92fc71d22423170841",
	name: "cancelEinvoice",
	filename: "src/lib/gst/server.ts"
}, (opts) => cancelEinvoice.__executeServer(opts));
var cancelEinvoice = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(cancelEinvoice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const inv = await loadInvoice(context.userId, data);
	if (!inv) throw new Error("Invoice not found");
	if (!inv.irnDate) throw new Error("No IRN to cancel");
	if (Date.now() - new Date(inv.irnDate).getTime() > 864e5) throw new Error("IRN can be cancelled only within 24 hours");
	await sql`update invoices set einvoice_status = 'cancelled', irn = '', qr_payload = '' where id = ${data} and user_id = ${context.userId}`;
	return loadInvoice(context.userId, data);
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "18f9408f9821e6a611aac86339937888ab0b921a57e9d5ca5e3818dfc79bec2c",
	name: "getDashboard",
	filename: "src/lib/gst/server.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context, data }) => {
	const ws = await loadWorkspace(context.userId, data);
	const sql = await getSql();
	const totals = await sql`
      select
        count(*)::int as invoice_count,
        coalesce(sum(total),0) as sales,
        coalesce(sum(igst+cgst+sgst),0) as tax,
        count(*) filter (where einvoice_status = 'pending' and status = 'issued')::int as pending_irn,
        count(*) filter (where einvoice_status = 'failed')::int as failed_irn,
        count(*) filter (where status = 'draft')::int as drafts
      from invoices where user_id = ${context.userId} and company_id = ${data}`;
	const month = await sql`
      select coalesce(sum(total),0) as sales
      from invoices
      where user_id = ${context.userId} and company_id = ${data}
        and status <> 'cancelled' and issue_date >= date_trunc('month', current_date)`;
	const purchases = await sql`
      select coalesce(sum(igst+cgst+sgst),0) as itc, coalesce(sum(total),0) as spend
      from purchases where user_id = ${context.userId} and company_id = ${data}`;
	const recent = await sql`
      select i.id, i.number, i.issue_date, i.total, i.status, i.einvoice_status, i.doc_type, p.name as customer_name
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data}
      order by i.created_at desc limit 6`;
	const auditRows = await sql`
      select action, entity, entity_id, detail, created_at from audit_log
      where user_id = ${context.userId} order by id desc limit 8`;
	return {
		workspace: ws,
		invoiceCount: num(totals[0]?.invoice_count),
		sales: num(totals[0]?.sales),
		tax: num(totals[0]?.tax),
		pendingIrn: num(totals[0]?.pending_irn),
		failedIrn: num(totals[0]?.failed_irn),
		drafts: num(totals[0]?.drafts),
		monthSales: num(month[0]?.sales),
		itc: num(purchases[0]?.itc),
		spend: num(purchases[0]?.spend),
		recent: recent.map((r) => ({
			id: num(r.id),
			number: String(r.number || "Draft"),
			issueDate: isoDate(r.issue_date),
			total: num(r.total),
			status: String(r.status),
			einvoiceStatus: String(r.einvoice_status),
			docType: String(r.doc_type),
			customerName: String(r.customer_name ?? "—")
		})),
		audit: auditRows.map((r) => ({
			action: String(r.action),
			entity: String(r.entity),
			entityId: String(r.entity_id),
			detail: String(r.detail),
			createdAt: String(r.created_at)
		}))
	};
});
var getGstr1_createServerFn_handler = createServerRpc({
	id: "9cf6b0f1d535a433bded955a0201159a330b75a5c6ae23fcf8efaf6f54427246",
	name: "getGstr1",
	filename: "src/lib/gst/server.ts"
}, (opts) => getGstr1.__executeServer(opts));
var getGstr1 = createServerFn({ method: "GET" }).validator((d) => object({
	companyId: number(),
	period: string()
}).parse(d)).middleware([authMiddleware]).handler(getGstr1_createServerFn_handler, async ({ context, data }) => {
	const ws = await loadWorkspace(context.userId, data.companyId);
	const sql = await getSql();
	const mm = data.period.slice(0, 2);
	const yyyy = data.period.slice(2);
	const invoices = (await sql`
      select i.*, p.name as customer_name, p.gstin as customer_gstin
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data.companyId}
        and i.status = 'issued'
        and to_char(i.issue_date, 'MMYYYY') = ${mm + yyyy}`).map((r) => mapInvoice(r, [], {
		id: 0,
		kind: "customer",
		name: String(r.customer_name ?? ""),
		gstin: String(r.customer_gstin ?? ""),
		pan: "",
		stateCode: String(r.place_of_supply_code),
		stateName: String(r.place_of_supply_name),
		address1: "",
		address2: "",
		city: "",
		contact: ""
	}));
	const lines = await sql`
      select l.*, i.doc_type, i.reverse_charge, i.customer_id, p.gstin as customer_gstin
      from invoice_lines l
      join invoices i on i.id = l.invoice_id
      left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data.companyId}
        and i.status = 'issued' and to_char(i.issue_date, 'MMYYYY') = ${mm + yyyy}`;
	const b2b = invoices.filter((i) => i.customer?.gstin && i.docType === "tax_invoice" && !i.reverseCharge);
	const b2bRcm = invoices.filter((i) => i.customer?.gstin && i.reverseCharge);
	const exp = invoices.filter((i) => i.docType === "tax_invoice" && i.notes.toLowerCase().includes("export"));
	const cdnr = invoices.filter((i) => i.docType === "credit_note" || i.docType === "debit_note");
	const b2c = invoices.filter((i) => i.docType === "tax_invoice" && !i.customer?.gstin);
	const hsnMap = /* @__PURE__ */ new Map();
	for (const l of lines) {
		const key = String(l.hsn_sac || "NA");
		const cur = hsnMap.get(key) ?? {
			hsn: key,
			taxable: 0,
			igst: 0,
			cgst: 0,
			sgst: 0,
			qty: 0
		};
		cur.taxable += num(l.amount);
		cur.qty += num(l.qty);
		hsnMap.set(key, cur);
	}
	const periodRow = await sql`
      select * from return_periods where user_id = ${context.userId} and company_id = ${data.companyId} and period = ${data.period}`;
	return {
		workspace: ws,
		period: data.period,
		locked: Boolean(periodRow[0]?.locked),
		gstr1Status: String(periodRow[0]?.gstr1_status ?? "draft"),
		b2b,
		b2bRcm,
		exp,
		cdnr,
		b2c,
		hsn: [...hsnMap.values()],
		json: {
			gstin: ws.gstins[0]?.gstin,
			fp: data.period,
			gt: ws.company.aato,
			b2b: b2b.map((i) => ({
				ctin: i.customer?.gstin,
				inv: [{
					inum: i.number,
					idt: i.issueDate.split("-").reverse().join("-"),
					val: i.total,
					pos: i.placeOfSupplyCode,
					inv_typ: "R",
					itms: [{
						num: 1,
						itm_det: {
							txval: i.taxable,
							rt: roundMoney((i.igstRate || i.cgstRate + i.sgstRate) * 100),
							iamt: i.igst,
							camt: i.cgst,
							samt: i.sgst
						}
					}]
				}]
			})),
			hsn: { data: [...hsnMap.values()].map((h, idx) => ({
				num: idx + 1,
				hsn_sc: h.hsn,
				txval: h.taxable
			})) }
		}
	};
});
var getGstr3b_createServerFn_handler = createServerRpc({
	id: "a871dfefa8287534060a22582b7099799c6a0d9569d03db65d5cec3c1a20c913",
	name: "getGstr3b",
	filename: "src/lib/gst/server.ts"
}, (opts) => getGstr3b.__executeServer(opts));
var getGstr3b = createServerFn({ method: "GET" }).validator((d) => object({
	companyId: number(),
	period: string()
}).parse(d)).middleware([authMiddleware]).handler(getGstr3b_createServerFn_handler, async ({ context, data }) => {
	const g1 = await getGstr1({ data });
	const sql = await getSql();
	const mm = data.period.slice(0, 2);
	const yyyy = data.period.slice(2);
	const purch = await sql`
      select coalesce(sum(taxable),0) as taxable, coalesce(sum(cgst),0) as cgst, coalesce(sum(sgst),0) as sgst,
             coalesce(sum(igst),0) as igst
      from purchases
      where user_id = ${context.userId} and company_id = ${data.companyId}
        and to_char(issue_date, 'MMYYYY') = ${mm + yyyy} and in_gstr2b = true`;
	const outward = g1.b2b.concat(g1.b2c);
	const taxable = roundMoney(outward.reduce((s, i) => s + i.taxable, 0));
	const igst = roundMoney(outward.reduce((s, i) => s + i.igst, 0));
	const cgst = roundMoney(outward.reduce((s, i) => s + i.cgst, 0));
	const sgst = roundMoney(outward.reduce((s, i) => s + i.sgst, 0));
	return {
		...g1,
		outward: {
			taxable,
			igst,
			cgst,
			sgst,
			total: roundMoney(taxable + igst + cgst + sgst)
		},
		itc: {
			taxable: num(purch[0]?.taxable),
			igst: num(purch[0]?.igst),
			cgst: num(purch[0]?.cgst),
			sgst: num(purch[0]?.sgst)
		},
		payable: {
			igst: Math.max(0, roundMoney(igst - num(purch[0]?.igst))),
			cgst: Math.max(0, roundMoney(cgst - num(purch[0]?.cgst))),
			sgst: Math.max(0, roundMoney(sgst - num(purch[0]?.sgst)))
		}
	};
});
var lockReturn_createServerFn_handler = createServerRpc({
	id: "9bf69396f79e98d4f2b742926654bbda25d752ea75c1a23b54037123bea8f9d0",
	name: "lockReturn",
	filename: "src/lib/gst/server.ts"
}, (opts) => lockReturn.__executeServer(opts));
var lockReturn = createServerFn({ method: "POST" }).validator((d) => object({
	companyId: number(),
	period: string(),
	which: _enum(["gstr1", "gstr3b"])
}).parse(d)).middleware([authMiddleware]).handler(lockReturn_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`insert into return_periods (user_id, company_id, period, gstr1_status, gstr3b_status, locked)
      values (${context.userId}, ${data.companyId}, ${data.period},
        ${data.which === "gstr1" ? "filed" : "draft"},
        ${data.which === "gstr3b" ? "filed" : "draft"}, true)
      on conflict (user_id, company_id, period) do update set
        gstr1_status = case when ${data.which} = 'gstr1' then 'filed' else return_periods.gstr1_status end,
        gstr3b_status = case when ${data.which} = 'gstr3b' then 'filed' else return_periods.gstr3b_status end,
        locked = true`;
	await audit(context.userId, data.companyId, "file", data.which, data.period, "Marked filed (JSON ready — GST portal upload)");
	return { ok: true };
});
var getReconciliation_createServerFn_handler = createServerRpc({
	id: "e5f3509479b7436ec1da4a9b366654d834aceeeff0a3ba761f260b1c20ccae4b",
	name: "getReconciliation",
	filename: "src/lib/gst/server.ts"
}, (opts) => getReconciliation.__executeServer(opts));
var getReconciliation = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(getReconciliation_createServerFn_handler, async ({ context, data }) => {
	const ws = await loadWorkspace(context.userId, data);
	const sql = await getSql();
	const invoices = await sql`
      select i.*, p.name as customer_name from invoices i
      left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data} and i.status = 'issued'`;
	const purchases = await sql`
      select pu.*, p.name as vendor_name from purchases pu
      left join parties p on p.id = pu.vendor_id
      where pu.user_id = ${context.userId} and pu.company_id = ${data}`;
	return {
		workspace: ws,
		gstr1VsIrn: invoices.map((r) => {
			const hasIrn = Boolean(String(r.irn || ""));
			const required = String(r.einvoice_status) !== "not_required";
			let bucket = "matched";
			if (required && !hasIrn) bucket = "missing_irn";
			if (String(r.einvoice_status) === "failed") bucket = "failed_irn";
			if (String(r.einvoice_status) === "cancelled") bucket = "cancelled_irn";
			if (hasIrn && String(r.status) === "issued") bucket = bucket === "matched" ? "matched" : bucket;
			return {
				id: num(r.id),
				number: String(r.number),
				customer: String(r.customer_name ?? ""),
				total: num(r.total),
				einvoiceStatus: String(r.einvoice_status),
				irn: String(r.irn),
				inGstr1: true,
				bucket
			};
		}),
		itc: purchases.map((p) => ({
			id: num(p.id),
			number: String(p.number),
			vendor: String(p.vendor_name ?? ""),
			total: num(p.total),
			tax: num(p.igst) + num(p.cgst) + num(p.sgst),
			inBooks: true,
			inGstr2b: Boolean(p.in_gstr2b),
			bucket: Boolean(p.in_gstr2b) ? "matched" : "missing_2b",
			notes: String(p.notes)
		}))
	};
});
var listPurchases_createServerFn_handler = createServerRpc({
	id: "e57a2267c668f5847e7f9f05ac53d2223ff5511c72ef47c1c8982600661f4adf",
	name: "listPurchases",
	filename: "src/lib/gst/server.ts"
}, (opts) => listPurchases.__executeServer(opts));
var listPurchases = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(listPurchases_createServerFn_handler, async ({ context, data }) => {
	await ensureWorkspace(context.userId);
	return (await (await getSql())`
      select pu.*, p.name as vendor_name from purchases pu
      left join parties p on p.id = pu.vendor_id
      where pu.user_id = ${context.userId} and pu.company_id = ${data}
      order by pu.issue_date desc`).map((p) => ({
		id: num(p.id),
		vendorId: p.vendor_id == null ? null : num(p.vendor_id),
		number: String(p.number),
		issueDate: isoDate(p.issue_date),
		hsnSac: String(p.hsn_sac),
		taxable: num(p.taxable),
		cgst: num(p.cgst),
		sgst: num(p.sgst),
		igst: num(p.igst),
		total: num(p.total),
		inGstr2b: Boolean(p.in_gstr2b),
		notes: String(p.notes),
		vendorName: String(p.vendor_name ?? "")
	}));
});
var getReports_createServerFn_handler = createServerRpc({
	id: "88f9f8a14395419822022454dd50a39ba6a466fc8507b649e71b6b651e36a2f0",
	name: "getReports",
	filename: "src/lib/gst/server.ts"
}, (opts) => getReports.__executeServer(opts));
var getReports = createServerFn({ method: "GET" }).validator((companyId) => companyId).middleware([authMiddleware]).handler(getReports_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureWorkspace(context.userId);
	const byParty = await sql`
      select coalesce(p.name,'Unassigned') as name, count(*)::int as invoices, coalesce(sum(i.total),0) as amount
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data} and i.status <> 'cancelled'
      group by p.name order by amount desc`;
	const register = await sql`
      select i.number, i.issue_date, i.doc_type, i.taxable, i.cgst, i.sgst, i.igst, i.total, i.status, p.name as party
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data}
      order by i.issue_date, i.id`;
	return {
		byParty: byParty.map((r) => ({
			name: String(r.name),
			invoices: num(r.invoices),
			amount: num(r.amount)
		})),
		register: register.map((r) => ({
			number: String(r.number || "Draft"),
			issueDate: isoDate(r.issue_date),
			docType: String(r.doc_type),
			taxable: num(r.taxable),
			cgst: num(r.cgst),
			sgst: num(r.sgst),
			igst: num(r.igst),
			total: num(r.total),
			status: String(r.status),
			party: String(r.party ?? "—")
		}))
	};
});
//#endregion
export { applyGstPreset_createServerFn_handler, cancelEinvoice_createServerFn_handler, deleteParty_createServerFn_handler, deleteProduct_createServerFn_handler, generateEinvoice_createServerFn_handler, getDashboard_createServerFn_handler, getGstr1_createServerFn_handler, getGstr3b_createServerFn_handler, getInvoice_createServerFn_handler, getReconciliation_createServerFn_handler, getReports_createServerFn_handler, getWorkspace_createServerFn_handler, issueInvoice_createServerFn_handler, listCompanies_createServerFn_handler, listInvoices_createServerFn_handler, listPurchases_createServerFn_handler, lockReturn_createServerFn_handler, saveCompany_createServerFn_handler, saveGstin_createServerFn_handler, saveInvoice_createServerFn_handler, saveParty_createServerFn_handler, saveProduct_createServerFn_handler };
