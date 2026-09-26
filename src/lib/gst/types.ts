export type Company = {
  id: number;
  legalName: string;
  tradeName: string;
  pan: string;
  address1: string;
  address2: string;
  city: string;
  stateCode: string;
  stateName: string;
  phone: string;
  email: string;
  bankName: string;
  accountName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  upi: string;
  taxScheme: string;
  compositionRate: number;
  gstPreset: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  aato: number;
  role: string;
};

export type GstinRow = {
  id: number;
  gstin: string;
  stateCode: string;
  stateName: string;
  address: string;
  isPrimary: boolean;
  invoicePrefix: string;
  nextNumber: number;
};

export type Party = {
  id: number;
  kind: string;
  name: string;
  gstin: string;
  pan: string;
  stateCode: string;
  stateName: string;
  address1: string;
  address2: string;
  city: string;
  contact: string;
};

export type Product = {
  id: number;
  code: string;
  description: string;
  kind: string;
  hsnSac: string;
  unit: string;
  rate: number;
  taxability: string;
  active: boolean;
};

export type InvoiceLine = {
  id: number;
  lineNo: number;
  productId: number | null;
  description: string;
  hsnSac: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  isCustom: boolean;
};

export type Invoice = {
  id: number;
  companyId: number;
  gstinId: number;
  customerId: number | null;
  docType: string;
  number: string;
  issueDate: string;
  dueDate: string;
  poNumber: string;
  placeOfSupplyCode: string;
  placeOfSupplyName: string;
  supplyType: string;
  reverseCharge: boolean;
  gstPreset: string;
  scheme: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  notes: string;
  status: string;
  einvoiceStatus: string;
  irn: string;
  irnDate: string | null;
  qrPayload: string;
  lines: InvoiceLine[];
  customer?: Party | null;
};

export type Purchase = {
  id: number;
  vendorId: number | null;
  number: string;
  issueDate: string;
  hsnSac: string;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  inGstr2b: boolean;
  notes: string;
  vendorName?: string;
};

export type Workspace = {
  company: Company;
  gstins: GstinRow[];
  parties: Party[];
  products: Product[];
};
