import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { COMPOSITION_RATES, CUSTOM_PRODUCT_CODE, findPreset } from "./catalog";
import {
  computeTax,
  einvoiceRequired,
  fyFromDate,
  num,
  periodFromDate,
  roundMoney,
  withinReportingWindow,
} from "./engine";
import { mockIrn } from "./irn";
import type { Company, GstinRow, Invoice, InvoiceLine, Party, Product, Purchase, Workspace } from "./types";

function mapCompany(r: Record<string, unknown>): Company {
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
    role: String(r.role),
  };
}

async function audit(userId: string, companyId: number | null, action: string, entity: string, entityId: string, detail: string) {
  const sql = await getSql();
  await sql`insert into audit_log (user_id, company_id, action, entity, entity_id, detail)
    values (${userId}, ${companyId}, ${action}, ${entity}, ${entityId}, ${detail})`;
}

async function ensureWorkspace(userId: string): Promise<number> {
  const sql = await getSql();
  const existing = await sql<{ id: number }>`select id from companies where user_id = ${userId} order by id asc limit 1`;
  if (existing[0]) return existing[0].id;

  const inserted = await sql<{ id: number }>`
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
    ) returning id`;
  const companyId = inserted[0].id;

  const g = await sql<{ id: number }>`
    insert into gstins (user_id, company_id, gstin, state_code, state_name, address, is_primary, invoice_prefix, next_number)
    values (${userId}, ${companyId}, '27AABCA1234D1Z5', '27', 'Maharashtra',
      '12th Floor, One World Centre, Lower Parel, Mumbai 400013', true, 'INV', 5)
    returning id`;
  const gstinId = g[0].id;

  const meridian = await sql<{ id: number }>`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, address2, city, contact)
    values (${userId}, ${companyId}, 'customer', 'Meridian Technologies Pvt. Ltd.', '33AADCM9876K1Z2', 'AADCM9876K',
      '33', 'Tamil Nadu', 'No. 42, Rajiv Gandhi Salai (OMR)', 'Thoraipakkam', 'Chennai', 'Accounts Payable')
    returning id`;
  await sql`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, city, contact)
    values (${userId}, ${companyId}, 'customer', 'Walk-in / Unregistered', '', '', '27', 'Maharashtra',
      'Retail counter', 'Mumbai', '')`;
  const vendor = await sql<{ id: number }>`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, city, contact)
    values (${userId}, ${companyId}, 'vendor', 'Nimbus Cloud Services LLP', '29AABCN4433P1Z8', 'AABCN4433P',
      '29', 'Karnataka', 'Manyata Tech Park', 'Bengaluru', 'Billing desk')
    returning id`;
  await sql`
    insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, city, contact)
    values (${userId}, ${companyId}, 'vendor', 'Harbour Stationery', '27AAGCH2211Q1Z3', 'AAGCH2211Q',
      '27', 'Maharashtra', 'Fort', 'Mumbai', '')`;

  const products = [
    ["SVC-001", "Enterprise Cloud Migration Assessment", "service", "998311", "Project", 18500],
    ["SVC-002", "Security & Compliance Review", "service", "998311", "Hours", 180],
    ["SVC-003", "Data Architecture Design Workshop", "service", "998311", "Days", 3250],
    ["SVC-004", "Implementation Support Retainer", "service", "998314", "Months", 4000],
    ["SVC-005", "IT Infrastructure Audit", "service", "998311", "Project", 12500],
    ["SVC-006", "Cloud Cost Optimization", "service", "998311", "Project", 9800],
    ["SVC-007", "DevOps Pipeline Setup", "service", "998314", "Project", 15000],
    ["SVC-008", "Managed Support (Monthly)", "service", "998314", "Months", 3500],
    ["PRD-001", "Software License - Enterprise", "product", "852380", "License", 45000],
    [CUSTOM_PRODUCT_CODE, "<< CUSTOM ENTRY >>", "custom", "", "Unit", 0],
  ] as const;
  for (const p of products) {
    await sql`insert into products (user_id, company_id, code, description, kind, hsn_sac, unit, rate)
      values (${userId}, ${companyId}, ${p[0]}, ${p[1]}, ${p[2]}, ${p[3]}, ${p[4]}, ${p[5]})`;
  }

  const custId = meridian[0].id;
  const seedInvoices: {
    number: string;
    date: string;
    due: string;
    status: string;
    ei: string;
    irn: string;
    lines: { desc: string; sac: string; qty: number; unit: string; rate: number }[];
  }[] = [
    {
      number: "INV-2026-0001",
      date: "2026-09-04",
      due: "2026-10-04",
      status: "issued",
      ei: "generated",
      irn: mockIrn("27AABCA1234D1Z5", "INV-2026-0001", "2026-27"),
      lines: [{ desc: "Enterprise Cloud Migration Assessment", sac: "998311", qty: 1, unit: "Project", rate: 18500 }],
    },
    {
      number: "INV-2026-0002",
      date: "2026-09-10",
      due: "2026-10-10",
      status: "issued",
      ei: "generated",
      irn: mockIrn("27AABCA1234D1Z5", "INV-2026-0002", "2026-27"),
      lines: [{ desc: "Security & Compliance Review", sac: "998311", qty: 80, unit: "Hours", rate: 180 }],
    },
    {
      number: "INV-2026-0003",
      date: "2026-09-14",
      due: "2026-10-14",
      status: "issued",
      ei: "failed",
      irn: "",
      lines: [{ desc: "Data Architecture Design Workshop", sac: "998311", qty: 3, unit: "Days", rate: 3250 }],
    },
    {
      number: "INV-2026-0004",
      date: "2026-09-18",
      due: "2026-10-18",
      status: "draft",
      ei: "pending",
      irn: "",
      lines: [{ desc: "Implementation Support Retainer", sac: "998314", qty: 3, unit: "Months", rate: 4000 }],
    },
  ];

  for (const inv of seedInvoices) {
    const taxable = roundMoney(inv.lines.reduce((s, l) => s + l.qty * l.rate, 0));
    const tax = computeTax({
      presetName: "Regular 18% (Inter-State IGST)",
      supplierState: "27",
      recipientState: "33",
      taxable,
    });
    const eiStatus = inv.ei;
    const rows = await sql<{ id: number }>`
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
      ) returning id`;
    const invoiceId = rows[0].id;
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

async function loadWorkspace(userId: string, companyId?: number): Promise<Workspace> {
  const sql = await getSql();
  const cid = companyId ?? (await ensureWorkspace(userId));
  const companies = await sql<Record<string, unknown>>`select * from companies where user_id = ${userId} and id = ${cid} limit 1`;
  if (!companies[0]) {
    const fallback = await ensureWorkspace(userId);
    return loadWorkspace(userId, fallback);
  }
  const company = mapCompany(companies[0]);
  const gstins = await sql<Record<string, unknown>>`select * from gstins where user_id = ${userId} and company_id = ${company.id} order by is_primary desc, id`;
  const parties = await sql<Record<string, unknown>>`select * from parties where user_id = ${userId} and company_id = ${company.id} order by kind, name`;
  const products = await sql<Record<string, unknown>>`select * from products where user_id = ${userId} and company_id = ${company.id} order by code`;
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
      nextNumber: num(g.next_number),
    })),
    parties: parties.map(mapParty),
    products: products.map(mapProduct),
  };
}

function mapParty(p: Record<string, unknown>): Party {
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
    contact: String(p.contact),
  };
}

function mapProduct(p: Record<string, unknown>): Product {
  return {
    id: num(p.id),
    code: String(p.code),
    description: String(p.description),
    kind: String(p.kind),
    hsnSac: String(p.hsn_sac),
    unit: String(p.unit),
    rate: num(p.rate),
    taxability: String(p.taxability),
    active: Boolean(p.active),
  };
}

function mapLine(l: Record<string, unknown>): InvoiceLine {
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
    isCustom: Boolean(l.is_custom),
  };
}

function isoDate(v: unknown) {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function mapInvoice(r: Record<string, unknown>, lines: InvoiceLine[], customer?: Party | null): Invoice {
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
    customer: customer ?? null,
  };
}

export const getWorkspace = createServerFn({ method: "GET" })
  .validator((companyId?: number) => companyId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    return loadWorkspace(context.userId, data);
  });

export const listCompanies = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureWorkspace(context.userId);
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from companies where user_id = ${context.userId} order by id`;
    return rows.map(mapCompany);
  });

const companyUpdate = z.object({
  id: z.number(),
  legalName: z.string(),
  tradeName: z.string(),
  pan: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  stateCode: z.string(),
  stateName: z.string(),
  phone: z.string(),
  email: z.string(),
  bankName: z.string(),
  accountName: z.string(),
  accountNo: z.string(),
  ifsc: z.string(),
  branch: z.string(),
  upi: z.string(),
  aato: z.number(),
  role: z.string(),
});

export const saveCompany = createServerFn({ method: "POST" })
  .validator((d: unknown) => companyUpdate.parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update companies set
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

const gstinUpdate = z.object({
  id: z.number(),
  gstin: z.string(),
  stateCode: z.string(),
  stateName: z.string(),
  address: z.string(),
  invoicePrefix: z.string(),
});

export const saveGstin = createServerFn({ method: "POST" })
  .validator((d: unknown) => gstinUpdate.parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update gstins set gstin = ${data.gstin}, state_code = ${data.stateCode},
      state_name = ${data.stateName}, address = ${data.address}, invoice_prefix = ${data.invoicePrefix}
      where id = ${data.id} and user_id = ${context.userId}`;
    await audit(context.userId, null, "update", "gstin", data.gstin, "GSTIN updated");
    return { ok: true };
  });

export const applyGstPreset = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ companyId: z.number(), preset: z.string() }).parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const preset = findPreset(data.preset);
    const compositionRate = COMPOSITION_RATES[preset.name] ?? 0;
    const sql = await getSql();
    await sql`update companies set gst_preset = ${preset.name}, tax_scheme = ${preset.scheme},
      cgst_rate = ${preset.cgst}, sgst_rate = ${preset.sgst}, igst_rate = ${preset.igst},
      composition_rate = ${compositionRate}
      where id = ${data.companyId} and user_id = ${context.userId}`;
    const drafts = await sql<Record<string, unknown>>`
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
        taxable: num(inv.taxable),
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

const partySchema = z.object({
  id: z.number().optional(),
  companyId: z.number(),
  kind: z.string(),
  name: z.string().min(1),
  gstin: z.string(),
  pan: z.string(),
  stateCode: z.string(),
  stateName: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  contact: z.string(),
});

export const saveParty = createServerFn({ method: "POST" })
  .validator((d: unknown) => partySchema.parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`update parties set name = ${data.name}, gstin = ${data.gstin}, pan = ${data.pan},
        state_code = ${data.stateCode}, state_name = ${data.stateName}, address1 = ${data.address1},
        address2 = ${data.address2}, city = ${data.city}, contact = ${data.contact}, kind = ${data.kind}
        where id = ${data.id} and user_id = ${context.userId}`;
      return data.id;
    }
    const rows = await sql<{ id: number }>`insert into parties (user_id, company_id, kind, name, gstin, pan, state_code, state_name, address1, address2, city, contact)
      values (${context.userId}, ${data.companyId}, ${data.kind}, ${data.name}, ${data.gstin}, ${data.pan}, ${data.stateCode}, ${data.stateName}, ${data.address1}, ${data.address2}, ${data.city}, ${data.contact})
      returning id`;
    return rows[0].id;
  });

export const deleteParty = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from parties where id = ${data} and user_id = ${context.userId}`;
  });

const productSchema = z.object({
  id: z.number().optional(),
  companyId: z.number(),
  code: z.string().min(1),
  description: z.string().min(1),
  kind: z.string(),
  hsnSac: z.string(),
  unit: z.string(),
  rate: z.number(),
  taxability: z.string(),
  active: z.boolean(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .validator((d: unknown) => productSchema.parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`update products set code = ${data.code}, description = ${data.description}, kind = ${data.kind},
        hsn_sac = ${data.hsnSac}, unit = ${data.unit}, rate = ${data.rate}, taxability = ${data.taxability}, active = ${data.active}
        where id = ${data.id} and user_id = ${context.userId}`;
      return data.id;
    }
    const rows = await sql<{ id: number }>`insert into products (user_id, company_id, code, description, kind, hsn_sac, unit, rate, taxability, active)
      values (${context.userId}, ${data.companyId}, ${data.code}, ${data.description}, ${data.kind}, ${data.hsnSac}, ${data.unit}, ${data.rate}, ${data.taxability}, ${data.active})
      returning id`;
    return rows[0].id;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from products where id = ${data} and user_id = ${context.userId} and code <> ${CUSTOM_PRODUCT_CODE}`;
  });

export const listInvoices = createServerFn({ method: "GET" })
  .validator((companyId: number) => companyId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await ensureWorkspace(context.userId);
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select i.*, p.name as customer_name, p.gstin as customer_gstin
      from invoices i
      left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data}
      order by i.issue_date desc, i.id desc`;
    return rows.map((r) => ({
      ...mapInvoice(r, []),
      customerName: String(r.customer_name ?? "—"),
      customerGstin: String(r.customer_gstin ?? ""),
    }));
  });

async function loadInvoice(userId: string, id: number): Promise<Invoice | null> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from invoices where id = ${id} and user_id = ${userId} limit 1`;
  if (!rows[0]) return null;
  const lines = await sql<Record<string, unknown>>`select * from invoice_lines where invoice_id = ${id} and user_id = ${userId} order by line_no`;
  let customer: Party | null = null;
  if (rows[0].customer_id) {
    const p = await sql<Record<string, unknown>>`select * from parties where id = ${num(rows[0].customer_id)} and user_id = ${userId}`;
    customer = p[0] ? mapParty(p[0]) : null;
  }
  return mapInvoice(rows[0], lines.map(mapLine), customer);
}

export const getInvoice = createServerFn({ method: "GET" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => loadInvoice(context.userId, data));

const lineInput = z.object({
  productId: z.number().nullable(),
  description: z.string(),
  hsnSac: z.string(),
  qty: z.number(),
  unit: z.string(),
  rate: z.number(),
  isCustom: z.boolean(),
});

const invoiceInput = z.object({
  id: z.number().optional(),
  companyId: z.number(),
  gstinId: z.number(),
  customerId: z.number().nullable(),
  docType: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  poNumber: z.string(),
  reverseCharge: z.boolean(),
  gstPreset: z.string(),
  notes: z.string(),
  lines: z.array(lineInput),
});

export const saveInvoice = createServerFn({ method: "POST" })
  .validator((d: unknown) => invoiceInput.parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const companyRows = await sql<Record<string, unknown>>`select * from companies where id = ${data.companyId} and user_id = ${context.userId}`;
    const gstinRows = await sql<Record<string, unknown>>`select * from gstins where id = ${data.gstinId} and user_id = ${context.userId}`;
    if (!companyRows[0] || !gstinRows[0]) throw new Error("Company or GSTIN not found");
    if (String(companyRows[0].role) === "viewer") throw new Error("Viewers cannot edit invoices");
    let recipientState = String(gstinRows[0].state_code);
    let customerGstin = "";
    if (data.customerId) {
      const p = await sql<Record<string, unknown>>`select * from parties where id = ${data.customerId} and user_id = ${context.userId}`;
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
      taxable,
    });
    const docType = tax.scheme === "COMPOSITION" ? "bill_of_supply" : data.docType;
    const required = einvoiceRequired(num(companyRows[0].aato), tax.scheme, Boolean(customerGstin), docType);
    const placeName = String(
      (await sql<Record<string, unknown>>`select state_name from parties where id = ${data.customerId} and user_id = ${context.userId}`)?.[0]
        ?.state_name ?? gstinRows[0].state_name,
    );

    let invoiceId = data.id;
    if (invoiceId) {
      const existing = await sql<{ status: string }>`select status from invoices where id = ${invoiceId} and user_id = ${context.userId}`;
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
    } else {
      const rows = await sql<{ id: number }>`insert into invoices (
        user_id, company_id, gstin_id, customer_id, doc_type, number, issue_date, due_date, po_number,
        place_of_supply_code, place_of_supply_name, supply_type, reverse_charge, gst_preset, scheme,
        cgst_rate, sgst_rate, igst_rate, taxable, cgst, sgst, igst, total, notes, status, einvoice_status
      ) values (
        ${context.userId}, ${data.companyId}, ${data.gstinId}, ${data.customerId}, ${docType}, '', ${data.issueDate}::date,
        ${data.dueDate}::date, ${data.poNumber}, ${recipientState}, ${placeName}, ${tax.supplyType}, ${data.reverseCharge},
        ${data.gstPreset}, ${tax.scheme}, ${tax.cgstRate}, ${tax.sgstRate}, ${tax.igstRate}, ${tax.taxable},
        ${tax.cgst}, ${tax.sgst}, ${tax.igst}, ${tax.grandTotal}, ${data.notes}, 'draft', ${required ? "pending" : "not_required"}
      ) returning id`;
      invoiceId = rows[0].id;
    }
    for (let i = 0; i < data.lines.length; i++) {
      const l = data.lines[i];
      const amount = roundMoney(l.qty * l.rate);
      await sql`insert into invoice_lines (user_id, invoice_id, line_no, product_id, description, hsn_sac, qty, unit, rate, amount, is_custom)
        values (${context.userId}, ${invoiceId}, ${i + 1}, ${l.productId}, ${l.description}, ${l.hsnSac}, ${l.qty}, ${l.unit}, ${l.rate}, ${amount}, ${l.isCustom})`;
    }
    await audit(context.userId, data.companyId, "save", "invoice", String(invoiceId), docType);
    return loadInvoice(context.userId, invoiceId!);
  });

export const issueInvoice = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const inv = await sql<Record<string, unknown>>`select * from invoices where id = ${data} and user_id = ${context.userId}`;
    if (!inv[0]) throw new Error("Invoice not found");
    if (String(inv[0].status) !== "draft") return loadInvoice(context.userId, data);
    const g = await sql<Record<string, unknown>>`select * from gstins where id = ${num(inv[0].gstin_id)} and user_id = ${context.userId}`;
    const next = num(g[0].next_number);
    const prefix = String(g[0].invoice_prefix);
    const year = String(inv[0].issue_date).slice(0, 4);
    const number = `${prefix}-${year}-${String(next).padStart(4, "0")}`;
    await sql`update gstins set next_number = ${next + 1} where id = ${num(g[0].id)} and user_id = ${context.userId}`;
    await sql`update invoices set status = 'issued', number = ${number} where id = ${data} and user_id = ${context.userId}`;
    await audit(context.userId, num(inv[0].company_id), "issue", "invoice", number, "Issued");
    return loadInvoice(context.userId, data);
  });

export const generateEinvoice = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const inv = await loadInvoice(context.userId, data);
    if (!inv) throw new Error("Invoice not found");
    const company = (await loadWorkspace(context.userId, inv.companyId)).company;
    const gstin = (await loadWorkspace(context.userId, inv.companyId)).gstins.find((g) => g.id === inv.gstinId);
    if (inv.status !== "issued") throw new Error("Issue the invoice before generating IRN");
    if (!einvoiceRequired(company.aato, inv.scheme as "REGULAR" | "COMPOSITION", Boolean(inv.customer?.gstin), inv.docType)) {
      throw new Error("E-invoicing is not required for this document");
    }
    if (!withinReportingWindow(company.aato, inv.issueDate)) {
            await sql`update invoices set einvoice_status = 'failed' where id = ${data} and user_id = ${context.userId}`;
      throw new Error("IRP rejected: invoice is older than 30 days (AATO ≥ ₹10 Cr)");
    }
    const irn = mockIrn(gstin?.gstin ?? "", inv.number, fyFromDate(inv.issueDate));
    const payload = JSON.stringify({
      irn,
      gstin: gstin?.gstin,
      number: inv.number,
      date: inv.issueDate,
      value: inv.total,
    });
    await sql`update invoices set einvoice_status = 'generated', irn = ${irn}, irn_date = now(), qr_payload = ${payload}
      where id = ${data} and user_id = ${context.userId}`;
    await audit(context.userId, inv.companyId, "irn", "invoice", inv.number, irn);
    return loadInvoice(context.userId, data);
  });

export const cancelEinvoice = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const inv = await loadInvoice(context.userId, data);
    if (!inv) throw new Error("Invoice not found");
    if (!inv.irnDate) throw new Error("No IRN to cancel");
    const age = Date.now() - new Date(inv.irnDate).getTime();
    if (age > 24 * 60 * 60 * 1000) throw new Error("IRN can be cancelled only within 24 hours");
    await sql`update invoices set einvoice_status = 'cancelled', irn = '', qr_payload = '' where id = ${data} and user_id = ${context.userId}`;
    return loadInvoice(context.userId, data);
  });

export const getDashboard = createServerFn({ method: "GET" })
  .validator((companyId: number) => companyId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const ws = await loadWorkspace(context.userId, data);
    const sql = await getSql();
    const totals = await sql<Record<string, unknown>>`
      select
        count(*)::int as invoice_count,
        coalesce(sum(total),0) as sales,
        coalesce(sum(igst+cgst+sgst),0) as tax,
        count(*) filter (where einvoice_status = 'pending' and status = 'issued')::int as pending_irn,
        count(*) filter (where einvoice_status = 'failed')::int as failed_irn,
        count(*) filter (where status = 'draft')::int as drafts
      from invoices where user_id = ${context.userId} and company_id = ${data}`;
    const month = await sql<Record<string, unknown>>`
      select coalesce(sum(total),0) as sales
      from invoices
      where user_id = ${context.userId} and company_id = ${data}
        and status <> 'cancelled' and issue_date >= date_trunc('month', current_date)`;
    const purchases = await sql<Record<string, unknown>>`
      select coalesce(sum(igst+cgst+sgst),0) as itc, coalesce(sum(total),0) as spend
      from purchases where user_id = ${context.userId} and company_id = ${data}`;
    const recent = await sql<Record<string, unknown>>`
      select i.id, i.number, i.issue_date, i.total, i.status, i.einvoice_status, i.doc_type, p.name as customer_name
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data}
      order by i.created_at desc limit 6`;
    const auditRows = await sql<Record<string, unknown>>`
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
        customerName: String(r.customer_name ?? "—"),
      })),
      audit: auditRows.map((r) => ({
        action: String(r.action),
        entity: String(r.entity),
        entityId: String(r.entity_id),
        detail: String(r.detail),
        createdAt: String(r.created_at),
      })),
    };
  });

export const getGstr1 = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ companyId: z.number(), period: z.string() }).parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const ws = await loadWorkspace(context.userId, data.companyId);
    const sql = await getSql();
    const mm = data.period.slice(0, 2);
    const yyyy = data.period.slice(2);
    const rows = await sql<Record<string, unknown>>`
      select i.*, p.name as customer_name, p.gstin as customer_gstin
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data.companyId}
        and i.status = 'issued'
        and to_char(i.issue_date, 'MMYYYY') = ${mm + yyyy}`;
    const invoices = rows.map((r) =>
      mapInvoice(r, [], {
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
        contact: "",
      }),
    );
    const lines = await sql<Record<string, unknown>>`
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
    const hsnMap = new Map<string, { hsn: string; taxable: number; igst: number; cgst: number; sgst: number; qty: number }>();
    for (const l of lines) {
      const key = String(l.hsn_sac || "NA");
      const cur = hsnMap.get(key) ?? { hsn: key, taxable: 0, igst: 0, cgst: 0, sgst: 0, qty: 0 };
      cur.taxable += num(l.amount);
      cur.qty += num(l.qty);
      hsnMap.set(key, cur);
    }
    const periodRow = await sql<Record<string, unknown>>`
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
          inv: [
            {
              inum: i.number,
              idt: i.issueDate.split("-").reverse().join("-"),
              val: i.total,
              pos: i.placeOfSupplyCode,
              inv_typ: "R",
              itms: [{ num: 1, itm_det: { txval: i.taxable, rt: roundMoney((i.igstRate || i.cgstRate + i.sgstRate) * 100), iamt: i.igst, camt: i.cgst, samt: i.sgst } }],
            },
          ],
        })),
        hsn: { data: [...hsnMap.values()].map((h, idx) => ({ num: idx + 1, hsn_sc: h.hsn, txval: h.taxable })) },
      },
    };
  });

export const getGstr3b = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ companyId: z.number(), period: z.string() }).parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const g1 = await getGstr1({ data });
    const sql = await getSql();
    const mm = data.period.slice(0, 2);
    const yyyy = data.period.slice(2);
    const purch = await sql<Record<string, unknown>>`
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
      outward: { taxable, igst, cgst, sgst, total: roundMoney(taxable + igst + cgst + sgst) },
      itc: {
        taxable: num(purch[0]?.taxable),
        igst: num(purch[0]?.igst),
        cgst: num(purch[0]?.cgst),
        sgst: num(purch[0]?.sgst),
      },
      payable: {
        igst: Math.max(0, roundMoney(igst - num(purch[0]?.igst))),
        cgst: Math.max(0, roundMoney(cgst - num(purch[0]?.cgst))),
        sgst: Math.max(0, roundMoney(sgst - num(purch[0]?.sgst))),
      },
    };
  });

export const lockReturn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ companyId: z.number(), period: z.string(), which: z.enum(["gstr1", "gstr3b"]) }).parse(d))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into return_periods (user_id, company_id, period, gstr1_status, gstr3b_status, locked)
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

export const getReconciliation = createServerFn({ method: "GET" })
  .validator((companyId: number) => companyId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const ws = await loadWorkspace(context.userId, data);
    const sql = await getSql();
    const invoices = await sql<Record<string, unknown>>`
      select i.*, p.name as customer_name from invoices i
      left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data} and i.status = 'issued'`;
    const purchases = await sql<Record<string, unknown>>`
      select pu.*, p.name as vendor_name from purchases pu
      left join parties p on p.id = pu.vendor_id
      where pu.user_id = ${context.userId} and pu.company_id = ${data}`;
    const gstr1VsIrn = invoices.map((r) => {
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
        bucket,
      };
    });
    const itc = purchases.map((p) => ({
      id: num(p.id),
      number: String(p.number),
      vendor: String(p.vendor_name ?? ""),
      total: num(p.total),
      tax: num(p.igst) + num(p.cgst) + num(p.sgst),
      inBooks: true,
      inGstr2b: Boolean(p.in_gstr2b),
      bucket: Boolean(p.in_gstr2b) ? "matched" : "missing_2b",
      notes: String(p.notes),
    }));
    return { workspace: ws, gstr1VsIrn, itc };
  });

export const listPurchases = createServerFn({ method: "GET" })
  .validator((companyId: number) => companyId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await ensureWorkspace(context.userId);
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select pu.*, p.name as vendor_name from purchases pu
      left join parties p on p.id = pu.vendor_id
      where pu.user_id = ${context.userId} and pu.company_id = ${data}
      order by pu.issue_date desc`;
    return rows.map((p) => ({
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
      vendorName: String(p.vendor_name ?? ""),
    })) satisfies Purchase[];
  });

export const getReports = createServerFn({ method: "GET" })
  .validator((companyId: number) => companyId)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureWorkspace(context.userId);
    const byParty = await sql<Record<string, unknown>>`
      select coalesce(p.name,'Unassigned') as name, count(*)::int as invoices, coalesce(sum(i.total),0) as amount
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data} and i.status <> 'cancelled'
      group by p.name order by amount desc`;
    const register = await sql<Record<string, unknown>>`
      select i.number, i.issue_date, i.doc_type, i.taxable, i.cgst, i.sgst, i.igst, i.total, i.status, p.name as party
      from invoices i left join parties p on p.id = i.customer_id
      where i.user_id = ${context.userId} and i.company_id = ${data}
      order by i.issue_date, i.id`;
    return {
      byParty: byParty.map((r) => ({ name: String(r.name), invoices: num(r.invoices), amount: num(r.amount) })),
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
        party: String(r.party ?? "—"),
      })),
    };
  });
