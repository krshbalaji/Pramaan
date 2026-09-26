create table if not exists companies (
  id serial primary key,
  user_id text not null,
  legal_name text not null,
  trade_name text not null default '',
  pan text not null default '',
  address1 text not null default '',
  address2 text not null default '',
  city text not null default '',
  state_code text not null default '27',
  state_name text not null default 'Maharashtra',
  phone text not null default '',
  email text not null default '',
  bank_name text not null default '',
  account_name text not null default '',
  account_no text not null default '',
  ifsc text not null default '',
  branch text not null default '',
  upi text not null default '',
  tax_scheme text not null default 'REGULAR',
  composition_rate numeric not null default 0,
  gst_preset text not null default 'Regular 18% (Inter-State IGST)',
  cgst_rate numeric not null default 0,
  sgst_rate numeric not null default 0,
  igst_rate numeric not null default 0.18,
  aato numeric not null default 62000000,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);
create index if not exists companies_user_id_idx on companies (user_id);

create table if not exists gstins (
  id serial primary key,
  user_id text not null,
  company_id integer not null references companies(id) on delete cascade,
  gstin text not null,
  state_code text not null,
  state_name text not null,
  address text not null default '',
  is_primary boolean not null default false,
  invoice_prefix text not null default 'INV',
  next_number integer not null default 1
);
create index if not exists gstins_user_id_idx on gstins (user_id);

create table if not exists parties (
  id serial primary key,
  user_id text not null,
  company_id integer not null references companies(id) on delete cascade,
  kind text not null default 'customer',
  name text not null,
  gstin text not null default '',
  pan text not null default '',
  state_code text not null default '',
  state_name text not null default '',
  address1 text not null default '',
  address2 text not null default '',
  city text not null default '',
  contact text not null default ''
);
create index if not exists parties_user_id_idx on parties (user_id);

create table if not exists products (
  id serial primary key,
  user_id text not null,
  company_id integer not null references companies(id) on delete cascade,
  code text not null,
  description text not null,
  kind text not null default 'service',
  hsn_sac text not null default '',
  unit text not null default 'Nos',
  rate numeric not null default 0,
  taxability text not null default 'taxable',
  active boolean not null default true
);
create index if not exists products_user_id_idx on products (user_id);

create table if not exists invoices (
  id serial primary key,
  user_id text not null,
  company_id integer not null references companies(id) on delete cascade,
  gstin_id integer not null references gstins(id),
  customer_id integer references parties(id),
  doc_type text not null default 'tax_invoice',
  number text not null default '',
  issue_date date not null,
  due_date date not null,
  po_number text not null default '',
  place_of_supply_code text not null default '',
  place_of_supply_name text not null default '',
  supply_type text not null default 'Inter-State',
  reverse_charge boolean not null default false,
  gst_preset text not null default '',
  scheme text not null default 'REGULAR',
  cgst_rate numeric not null default 0,
  sgst_rate numeric not null default 0,
  igst_rate numeric not null default 0,
  taxable numeric not null default 0,
  cgst numeric not null default 0,
  sgst numeric not null default 0,
  igst numeric not null default 0,
  total numeric not null default 0,
  notes text not null default '',
  status text not null default 'draft',
  einvoice_status text not null default 'pending',
  irn text not null default '',
  irn_date timestamptz,
  qr_payload text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists invoices_user_id_idx on invoices (user_id);
create index if not exists invoices_company_id_idx on invoices (company_id);

create table if not exists invoice_lines (
  id serial primary key,
  user_id text not null,
  invoice_id integer not null references invoices(id) on delete cascade,
  line_no integer not null,
  product_id integer,
  description text not null,
  hsn_sac text not null default '',
  qty numeric not null default 1,
  unit text not null default 'Nos',
  rate numeric not null default 0,
  amount numeric not null default 0,
  is_custom boolean not null default false
);
create index if not exists invoice_lines_invoice_id_idx on invoice_lines (invoice_id);

create table if not exists purchases (
  id serial primary key,
  user_id text not null,
  company_id integer not null references companies(id) on delete cascade,
  vendor_id integer references parties(id),
  number text not null,
  issue_date date not null,
  hsn_sac text not null default '',
  taxable numeric not null default 0,
  cgst numeric not null default 0,
  sgst numeric not null default 0,
  igst numeric not null default 0,
  total numeric not null default 0,
  in_gstr2b boolean not null default true,
  notes text not null default ''
);
create index if not exists purchases_user_id_idx on purchases (user_id);

create table if not exists return_periods (
  id serial primary key,
  user_id text not null,
  company_id integer not null references companies(id) on delete cascade,
  period text not null,
  gstr1_status text not null default 'draft',
  gstr3b_status text not null default 'draft',
  locked boolean not null default false,
  unique (user_id, company_id, period)
);

create table if not exists audit_log (
  id serial primary key,
  user_id text not null,
  company_id integer,
  action text not null,
  entity text not null,
  entity_id text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists audit_log_user_id_idx on audit_log (user_id);
