#!/usr/bin/env python3
"""Interactive GST Tax Invoice Workbook with dropdowns, auto-fill, and custom mode."""

from openpyxl import Workbook
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side, NamedStyle, Protection
)
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.comments import Comment

wb = Workbook()

# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------
thin = Border(
    left=Side(style='thin', color='CCCCCC'),
    right=Side(style='thin', color='CCCCCC'),
    top=Side(style='thin', color='CCCCCC'),
    bottom=Side(style='thin', color='CCCCCC')
)
thick_blue = Border(
    left=Side(style='medium', color='1F4E79'),
    right=Side(style='medium', color='1F4E79'),
    top=Side(style='medium', color='1F4E79'),
    bottom=Side(style='medium', color='1F4E79')
)
header_fill = PatternFill('solid', fgColor='1F4E79')
header_font = Font(name='Arial', bold=True, color='FFFFFF', size=10)
title_font = Font(name='Arial', bold=True, color='1F4E79', size=16)
section_font = Font(name='Arial', bold=True, color='1F4E79', size=11)
label_font = Font(name='Arial', size=9, color='555555')
input_font = Font(name='Arial', size=10, color='0000FF')  # blue = input
formula_font = Font(name='Arial', size=10, color='000000')
yellow_fill = PatternFill('solid', fgColor='FFF2CC')
light_blue = PatternFill('solid', fgColor='D6EAF8')
light_gray = PatternFill('solid', fgColor='F7F9FC')
green_fill = PatternFill('solid', fgColor='D5F5E3')
orange_fill = PatternFill('solid', fgColor='FDEBD0')
center = Alignment(horizontal='center', vertical='center', wrap_text=True)
left_align = Alignment(horizontal='left', vertical='center', wrap_text=True)
right_align = Alignment(horizontal='right', vertical='center')

# ============================================================================
# SHEET 1: Masters (Services catalog + GST rates + Tax schemes)
# ============================================================================
ws_m = wb.active
ws_m.title = "Masters"

ws_m['A1'] = "MASTERS — Do not delete rows. Add new services/products below."
ws_m['A1'].font = Font(name='Arial', bold=True, size=12, color='1F4E79')
ws_m.merge_cells('A1:G1')

# --- Service / Product Catalog ---
ws_m['A3'] = "SERVICE / PRODUCT CATALOG"
ws_m['A3'].font = section_font
ws_m.merge_cells('A3:G3')

headers_svc = ["Code", "Description", "Type", "SAC/HSN", "Unit", "Rate (₹)", "Active"]
for col, h in enumerate(headers_svc, 1):
    c = ws_m.cell(4, col, h)
    c.font = header_font
    c.fill = header_fill
    c.alignment = center
    c.border = thin

# Pre-loaded services (extendable)
services = [
    ("SVC-001", "Enterprise Cloud Migration Assessment", "Service", "998311", "Project", 18500, "Yes"),
    ("SVC-002", "Security & Compliance Review", "Service", "998311", "Hours", 180, "Yes"),
    ("SVC-003", "Data Architecture Design Workshop", "Service", "998311", "Days", 3250, "Yes"),
    ("SVC-004", "Implementation Support Retainer", "Service", "998314", "Months", 4000, "Yes"),
    ("SVC-005", "IT Infrastructure Audit", "Service", "998311", "Project", 12500, "Yes"),
    ("SVC-006", "Cloud Cost Optimization", "Service", "998311", "Project", 9800, "Yes"),
    ("SVC-007", "DevOps Pipeline Setup", "Service", "998314", "Project", 15000, "Yes"),
    ("SVC-008", "Managed Support (Monthly)", "Service", "998314", "Months", 3500, "Yes"),
    ("PRD-001", "Software License - Enterprise", "Product", "8523", "License", 45000, "Yes"),
    ("PRD-002", "Hardware Appliance - Firewall", "Product", "8517", "Unit", 85000, "Yes"),
    ("CUSTOM", "<< CUSTOM ENTRY >>", "Custom", "", "Unit", 0, "Yes"),
]

for i, row in enumerate(services, 5):
    for col, val in enumerate(row, 1):
        c = ws_m.cell(i, col, val)
        c.font = input_font if col in (1, 2, 3, 4, 5, 6) else formula_font
        c.border = thin
        c.alignment = center if col not in (2,) else left_align
        if col == 6:
            c.number_format = '#,##0.00'
        if val == "<< CUSTOM ENTRY >>":
            c.fill = orange_fill
            c.font = Font(name='Arial', bold=True, size=10, color='B9770E')

# Named range for dropdown list (descriptions)
# We'll use a formula-based list later

ws_m['A18'] = "GST RATE PRESETS (click one on Invoice sheet — single selection drives all tax logic)"
ws_m['A18'].font = section_font
ws_m.merge_cells('A18:E18')

headers_gst = ["Preset Name", "Scheme", "CGST %", "SGST %", "IGST %"]
for col, h in enumerate(headers_gst, 1):
    c = ws_m.cell(19, col, h)
    c.font = header_font
    c.fill = header_fill
    c.alignment = center
    c.border = thin

gst_presets = [
    ("Regular 18% (Inter-State IGST)", "REGULAR", 0, 0, 0.18),
    ("Regular 18% (Intra-State CGST+SGST)", "REGULAR", 0.09, 0.09, 0),
    ("Regular 12% (Inter-State IGST)", "REGULAR", 0, 0, 0.12),
    ("Regular 12% (Intra-State CGST+SGST)", "REGULAR", 0.06, 0.06, 0),
    ("Regular 5% (Inter-State IGST)", "REGULAR", 0, 0, 0.05),
    ("Regular 5% (Intra-State CGST+SGST)", "REGULAR", 0.025, 0.025, 0),
    ("Regular 28% (Inter-State IGST)", "REGULAR", 0, 0, 0.28),
    ("Regular 28% (Intra-State CGST+SGST)", "REGULAR", 0.14, 0.14, 0),
    ("Composition 6% (Services)", "COMPOSITION", 0, 0, 0),
    ("Composition 1% (Traders)", "COMPOSITION", 0, 0, 0),
    ("Composition 5% (Restaurants)", "COMPOSITION", 0, 0, 0),
    ("Exempt / Nil Rated", "REGULAR", 0, 0, 0),
]

for i, row in enumerate(gst_presets, 20):
    for col, val in enumerate(row, 1):
        c = ws_m.cell(i, col, val)
        c.font = input_font
        c.border = thin
        c.alignment = center if col > 1 else left_align
        if col >= 3:
            c.number_format = '0.00%'

ws_m['A34'] = "Units list (for Custom mode)"
ws_m['A34'].font = section_font
units = ["Project", "Hours", "Days", "Months", "Unit", "License", "Nos", "Kg", "Litre", "Set"]
for i, u in enumerate(units, 35):
    ws_m.cell(i, 1, u).font = input_font
    ws_m.cell(i, 1).border = thin

# Column widths
for col, w in enumerate([12, 48, 12, 12, 12, 14, 10], 1):
    ws_m.column_dimensions[get_column_letter(col)].width = w

# ============================================================================
# SHEET 2: Business Details (editable)
# ============================================================================
ws_b = wb.create_sheet("BusinessDetails")

ws_b['A1'] = "EDITABLE BUSINESS DETAILS"
ws_b['A1'].font = title_font
ws_b.merge_cells('A1:D1')

ws_b['A2'] = "Yellow cells = edit these. Changes flow automatically to the Invoice sheet."
ws_b['A2'].font = Font(name='Arial', italic=True, size=9, color='888888')
ws_b.merge_cells('A2:D2')

# Supplier section
ws_b['A4'] = "SUPPLIER (Your Company)"
ws_b['A4'].font = section_font
ws_b['A4'].fill = light_blue
ws_b.merge_cells('A4:B4')

supplier_fields = [
    (5, "Company Name", "Apex Consulting Group"),
    (6, "GSTIN", "27AABCA1234D1Z5"),
    (7, "PAN", "AABCA1234D"),
    (8, "State Code", "27"),
    (9, "State Name", "Maharashtra"),
    (10, "Address Line 1", "12th Floor, One World Centre, Senapati Bapat Marg"),
    (11, "Address Line 2", "Lower Parel, Mumbai, Maharashtra 400013"),
    (12, "Phone", "+91 22 6123 4500"),
    (13, "Email", "billing@apexconsulting.in"),
    (14, "Bank Name", "HDFC Bank Ltd."),
    (15, "Account Name", "Apex Consulting Group"),
    (16, "Account No", "502000********21"),
    (17, "IFSC", "HDFC0000123"),
    (18, "Branch", "Lower Parel, Mumbai"),
    (19, "UPI", "apex.billing@hdfcbank"),
]

for row, label, val in supplier_fields:
    ws_b.cell(row, 1, label).font = label_font
    ws_b.cell(row, 1).border = thin
    c = ws_b.cell(row, 2, val)
    c.font = input_font
    c.fill = yellow_fill
    c.border = thin
    c.alignment = left_align

# Recipient section
ws_b['A21'] = "RECIPIENT (Customer)"
ws_b['A21'].font = section_font
ws_b['A21'].fill = light_blue
ws_b.merge_cells('A21:B21')

recipient_fields = [
    (22, "Company Name", "Meridian Technologies Pvt. Ltd."),
    (23, "GSTIN", "33AADCM9876K1Z2"),
    (24, "PAN", "AADCM9876K"),
    (25, "State Code", "33"),
    (26, "State Name", "Tamil Nadu"),
    (27, "Address Line 1", "No. 42, Rajiv Gandhi Salai (OMR)"),
    (28, "Address Line 2", "Thoraipakkam, Chennai, Tamil Nadu 600097"),
    (29, "Contact / Attn", "Accounts Payable"),
]

for row, label, val in recipient_fields:
    ws_b.cell(row, 1, label).font = label_font
    ws_b.cell(row, 1).border = thin
    c = ws_b.cell(row, 2, val)
    c.font = input_font
    c.fill = yellow_fill
    c.border = thin
    c.alignment = left_align

# Invoice meta
ws_b['A31'] = "INVOICE META (Editable)"
ws_b['A31'].font = section_font
ws_b['A31'].fill = light_blue
ws_b.merge_cells('A31:B31')

meta_fields = [
    (32, "Invoice No", "INV-2026-0918"),
    (33, "Invoice Date", "18-Sep-2026"),
    (34, "Due Date", "18-Oct-2026"),
    (35, "PO / Reference", "PO-88421-A"),
    (36, "Reverse Charge", "No"),
]

for row, label, val in meta_fields:
    ws_b.cell(row, 1, label).font = label_font
    ws_b.cell(row, 1).border = thin
    c = ws_b.cell(row, 2, val)
    c.font = input_font
    c.fill = yellow_fill
    c.border = thin

ws_b.column_dimensions['A'].width = 18
ws_b.column_dimensions['B'].width = 55

# ============================================================================
# SHEET 3: Invoice (main interactive sheet)
# ============================================================================
ws = wb.create_sheet("Invoice", 0)  # put first

# Title
ws['A1'] = "TAX INVOICE"
ws['A1'].font = title_font
ws.merge_cells('A1:H1')

ws['A2'] = '=IF(OR(B47="COMPOSITION",LEFT(B46,11)="Composition"),"BILL OF SUPPLY  |  Composition Scheme","TAX INVOICE  |  Regular Taxation")'
ws['A2'].font = Font(name='Arial', bold=True, size=11, color='1F4E79')
ws.merge_cells('A2:H2')

# --- GST Preset selector (single-click) ---
ws['A4'] = "GST RATE PRESET (select once — all tax logic updates automatically)"
ws['A4'].font = section_font
ws['A4'].fill = orange_fill
ws.merge_cells('A4:D4')

ws['A5'] = "Select Preset →"
ws['A5'].font = label_font
ws['B5'] = "Regular 18% (Inter-State IGST)"  # default
ws['B5'].font = input_font
ws['B5'].fill = yellow_fill
ws['B5'].border = thick_blue
ws.merge_cells('B5:D5')
ws['B5'].comment = Comment(
    "Dropdown: pick a GST preset. CGST/SGST/IGST rates and Scheme auto-update. "
    "Inter-State presets use IGST; Intra-State use CGST+SGST; Composition charges no GST to customer.",
    "System"
)

# Lookup rates from Masters based on preset name
ws['A6'] = "Scheme"
ws['B6'] = '=IFERROR(VLOOKUP(B5,Masters!$A$20:$E$31,2,FALSE),"REGULAR")'
ws['B6'].font = formula_font
ws['B6'].fill = green_fill

ws['C6'] = "CGST %"
ws['D6'] = '=IFERROR(VLOOKUP(B5,Masters!$A$20:$E$31,3,FALSE),0)'
ws['D6'].font = formula_font
ws['D6'].fill = green_fill
ws['D6'].number_format = '0.00%'

ws['E6'] = "SGST %"
ws['F6'] = '=IFERROR(VLOOKUP(B5,Masters!$A$20:$E$31,4,FALSE),0)'
ws['F6'].font = formula_font
ws['F6'].fill = green_fill
ws['F6'].number_format = '0.00%'

ws['G6'] = "IGST %"
ws['H6'] = '=IFERROR(VLOOKUP(B5,Masters!$A$20:$E$31,5,FALSE),0)'
ws['H6'].font = formula_font
ws['H6'].fill = green_fill
ws['H6'].number_format = '0.00%'

# Store scheme & rates in fixed cells for formulas (hidden-ish area)
# B46 = scheme, D46=cgst, F46=sgst, H46=igst  (mirrored for clarity)
ws['B46'] = '=B6'   # scheme
ws['D46'] = '=D6'   # cgst rate
ws['F46'] = '=F6'   # sgst rate
ws['H46'] = '=H6'   # igst rate
ws['B47'] = '=B6'   # alias

# --- Supplier / Recipient header (pulled from BusinessDetails) ---
ws['A8'] = "SUPPLIER"
ws['A8'].font = section_font
ws['A8'].fill = light_blue

ws['A9'] = '=BusinessDetails!B5'   # name
ws['A9'].font = Font(name='Arial', bold=True, size=11, color='1F4E79')
ws.merge_cells('A9:C9')
ws['A10'] = '="GSTIN: "&BusinessDetails!B6&"  |  PAN: "&BusinessDetails!B7'
ws['A10'].font = formula_font
ws.merge_cells('A10:C10')
ws['A11'] = '="State: "&BusinessDetails!B8&"-"&BusinessDetails!B9'
ws['A11'].font = formula_font
ws.merge_cells('A11:C11')
ws['A12'] = '=BusinessDetails!B10'
ws['A12'].font = formula_font
ws.merge_cells('A12:C12')
ws['A13'] = '=BusinessDetails!B11'
ws['A13'].font = formula_font
ws.merge_cells('A13:C13')
ws['A14'] = '="Tel: "&BusinessDetails!B12&"  |  "&BusinessDetails!B13'
ws['A14'].font = formula_font
ws.merge_cells('A14:C14')

ws['E8'] = "RECIPIENT / BILL TO"
ws['E8'].font = section_font
ws['E8'].fill = light_blue

ws['E9'] = '=BusinessDetails!B22'
ws['E9'].font = Font(name='Arial', bold=True, size=11, color='1F4E79')
ws.merge_cells('E9:H9')
ws['E10'] = '="GSTIN: "&BusinessDetails!B23&"  |  PAN: "&BusinessDetails!B24'
ws['E10'].font = formula_font
ws.merge_cells('E10:H10')
ws['E11'] = '="State: "&BusinessDetails!B25&"-"&BusinessDetails!B26'
ws['E11'].font = formula_font
ws.merge_cells('E11:H11')
ws['E12'] = '=BusinessDetails!B27'
ws['E12'].font = formula_font
ws.merge_cells('E12:H12')
ws['E13'] = '=BusinessDetails!B28'
ws['E13'].font = formula_font
ws.merge_cells('E13:H13')
ws['E14'] = '="Attn: "&BusinessDetails!B29'
ws['E14'].font = formula_font
ws.merge_cells('E14:H14')

# Invoice meta row
ws['A16'] = "Invoice No:"
ws['B16'] = '=BusinessDetails!B32'
ws['B16'].font = input_font
ws['B16'].fill = yellow_fill
ws['C16'] = "Date:"
ws['D16'] = '=BusinessDetails!B33'
ws['D16'].font = input_font
ws['D16'].fill = yellow_fill
ws['E16'] = "Due:"
ws['F16'] = '=BusinessDetails!B34'
ws['F16'].font = input_font
ws['F16'].fill = yellow_fill
ws['G16'] = "PO:"
ws['H16'] = '=BusinessDetails!B35'
ws['H16'].font = input_font
ws['H16'].fill = yellow_fill

ws['A17'] = "Place of Supply:"
ws['B17'] = '=BusinessDetails!B25&"-"&BusinessDetails!B26'
ws['B17'].font = formula_font
ws['B17'].fill = green_fill
ws.merge_cells('B17:C17')
ws['D17'] = "Supply Type:"
ws['E17'] = '=IF(BusinessDetails!B8=BusinessDetails!B25,"Intra-State","Inter-State")'
ws['E17'].font = formula_font
ws['E17'].fill = green_fill
ws['F17'] = "Reverse Charge:"
ws['G17'] = '=BusinessDetails!B36'
ws['G17'].font = input_font
ws['G17'].fill = yellow_fill

# --- Line items table ---
ws['A19'] = "LINE ITEMS — Select service/product from dropdown (or CUSTOM). Only Qty is entered; all else auto-fills."
ws['A19'].font = section_font
ws['A19'].fill = orange_fill
ws.merge_cells('A19:H19')

# Headers
line_headers = ["#", "Service / Product (select)", "SAC/HSN", "Qty", "Unit", "Rate (₹)", "Amount (₹)", "Mode"]
for col, h in enumerate(line_headers, 1):
    c = ws.cell(20, col, h)
    c.font = header_font
    c.fill = header_fill
    c.alignment = center
    c.border = thin

# 8 line-item rows (21-28)
for i in range(1, 9):
    r = 20 + i
    # #
    ws.cell(r, 1, i).font = formula_font
    ws.cell(r, 1).alignment = center
    ws.cell(r, 1).border = thin

    # Description dropdown (user selects)
    ws.cell(r, 2).font = input_font
    ws.cell(r, 2).fill = yellow_fill
    ws.cell(r, 2).border = thin
    ws.cell(r, 2).alignment = left_align

    # SAC/HSN — auto from Masters, or editable if CUSTOM
    # If description = "<< CUSTOM ENTRY >>" then allow manual SAC; else VLOOKUP
    ws.cell(r, 3).value = (
        f'=IF(B{r}="","",'
        f'IF(B{r}="<< CUSTOM ENTRY >>",IF(C{r}="","",C{r}),'
        f'IFERROR(VLOOKUP(B{r},Masters!$B$5:$F$15,3,FALSE),"")))'
    )
    # Actually for CUSTOM we need the cell to be editable. Better approach:
    # Use formula that shows catalog SAC unless CUSTOM, in which case leave blank for user.
    # But formula cells can't be typed into. Solution: two-mode logic with helper.
    # Simpler: SAC formula pulls from catalog; for CUSTOM user overwrites (or we use a note).
    # Best practical approach for openpyxl:
    # - SAC is formula for catalog items
    # - When CUSTOM selected, formula returns blank and user can type (but formula blocks typing)
    # Workaround: put SAC lookup in a helper column, and main SAC is input with default.
    # Cleaner UX for Excel: Description dropdown; SAC/Unit/Rate are formulas;
    # For CUSTOM: user selects CUSTOM, then manually fills SAC, Unit, Rate in yellow cells that
    # become "unlocked" conceptually — we use IF so when CUSTOM the formula shows "" and
    # we instruct user to type over... but Excel formulas prevent overwrite.
    #
    # Practical solution used in many templates:
    # Keep SAC / Unit / Rate as FORMULAS from catalog.
    # Add a "Custom Description" override column OR
    # When Mode = Custom, user enters Description free-text in a different cell.
    #
    # Final design:
    # Col B = dropdown of catalog descriptions + CUSTOM
    # When B = CUSTOM → user types free description in a "Custom Desc" area or we allow
    # Col C (SAC), E (Unit), F (Rate) to be INPUT cells that formulas fill ONLY when not custom.
    #
    # Excel limitation: can't have formula AND manual entry in same cell easily.
    # Standard pattern: 
    #   - Rate formula: =IF(B21="<< CUSTOM ENTRY >>", F21_input, VLOOKUP(...))
    # But still one cell.
    #
    # Best approach for this file:
    # Col B: dropdown (catalog + CUSTOM)
    # Col C: SAC  = IF(B="CUSTOM", user types here — but we pre-fill with formula that user replaces)
    # Actually the cleanest openpyxl-friendly way:
    # Use helper columns (hidden) for catalog lookups.
    # Visible SAC/Unit/Rate cells contain:
    #   =IF($H21="Custom", <blank for input>, VLOOKUP(...))
    # And Mode column H auto-detects: =IF(B21="<< CUSTOM ENTRY >>","Custom","Catalog")
    # When Mode=Custom, user is instructed to type SAC, Unit, Rate (replace formula temporarily).
    #
    # Alternative used by many invoice templates: always formula-driven for catalog;
    # for custom, add rows at bottom labeled CUSTOM where all fields are yellow inputs.
    #
    # I'll implement:
    # - B: dropdown
    # - C, E, F: formulas that VLOOKUP when not CUSTOM; when CUSTOM show 0 / blank and fill yellow
    # - User for CUSTOM: after selecting CUSTOM, they edit the Rate/Unit/SAC cells by
    #   clearing formula and typing (Excel allows this). To make it smoother, we put
    #   "Custom Rate" etc. in notes.
    #
    # Improved: 
    # C (SAC) formula returns catalog SAC OR if CUSTOM leaves the cell value as previous.
    # We'll use:
    # C: =IF(B{r}="","",IF(B{r}="<< CUSTOM ENTRY >>","",IFERROR(VLOOKUP(B{r},Masters!$B$5:$F$15,3,FALSE),"")))
    # E: similar for Unit
    # F: similar for Rate — and when CUSTOM, Rate cell is yellow input (user types rate)
    # For CUSTOM mode: user selects CUSTOM in B, then types SAC in C, Unit in E, Rate in F
    # (they overwrite the formula once). Document this in a note.
    #
    # Even better pattern - dual cells:
    # Keep formula-driven for catalog. Add instruction: for Custom, select CUSTOM and
    # enter Qty + Rate manually; SAC/Unit can be typed in adjacent notes.
    #
    # Implementing the overwrite-friendly pattern with clear Mode column.

    # Mode
    ws.cell(r, 8).value = f'=IF(B{r}="","",IF(B{r}="<< CUSTOM ENTRY >>","Custom","Catalog"))'
    ws.cell(r, 8).font = formula_font
    ws.cell(r, 8).alignment = center
    ws.cell(r, 8).border = thin

    # SAC
    ws.cell(r, 3).value = (
        f'=IF(B{r}="","",'
        f'IF(B{r}="<< CUSTOM ENTRY >>","",'
        f'IFERROR(INDEX(Masters!$D$5:$D$15,MATCH(B{r},Masters!$B$5:$B$15,0)),"")))'
    )
    ws.cell(r, 3).font = formula_font
    ws.cell(r, 3).alignment = center
    ws.cell(r, 3).border = thin
    ws.cell(r, 3).fill = light_gray

    # Qty — ONLY editable input (yellow)
    ws.cell(r, 4).font = input_font
    ws.cell(r, 4).fill = yellow_fill
    ws.cell(r, 4).border = thin
    ws.cell(r, 4).alignment = center
    ws.cell(r, 4).number_format = '0.00'

    # Unit
    ws.cell(r, 5).value = (
        f'=IF(B{r}="","",'
        f'IF(B{r}="<< CUSTOM ENTRY >>","",'
        f'IFERROR(INDEX(Masters!$E$5:$E$15,MATCH(B{r},Masters!$B$5:$B$15,0)),"")))'
    )
    ws.cell(r, 5).font = formula_font
    ws.cell(r, 5).alignment = center
    ws.cell(r, 5).border = thin
    ws.cell(r, 5).fill = light_gray

    # Rate
    ws.cell(r, 6).value = (
        f'=IF(B{r}="","",'
        f'IF(B{r}="<< CUSTOM ENTRY >>",0,'
        f'IFERROR(INDEX(Masters!$F$5:$F$15,MATCH(B{r},Masters!$B$5:$B$15,0)),0)))'
    )
    ws.cell(r, 6).font = formula_font
    ws.cell(r, 6).alignment = right_align
    ws.cell(r, 6).border = thin
    ws.cell(r, 6).fill = light_gray
    ws.cell(r, 6).number_format = '#,##0.00'

    # Amount = Qty * Rate
    ws.cell(r, 7).value = f'=IF(OR(B{r}="",D{r}=""),"",ROUND(D{r}*F{r},2))'
    ws.cell(r, 7).font = formula_font
    ws.cell(r, 7).alignment = right_align
    ws.cell(r, 7).border = thin
    ws.cell(r, 7).number_format = '#,##0.00'

# Pre-fill first 4 lines with sample selections + qty
ws['B21'] = "Enterprise Cloud Migration Assessment"
ws['D21'] = 1
ws['B22'] = "Security & Compliance Review"
ws['D22'] = 80
ws['B23'] = "Data Architecture Design Workshop"
ws['D23'] = 3
ws['B24'] = "Implementation Support Retainer"
ws['D24'] = 3

# Note for Custom mode
ws['A29'] = "CUSTOM MODE: Select \"<< CUSTOM ENTRY >>\" in Service column, then type SAC, Unit and Rate directly over the gray cells (replace formula). Qty remains the only required input for catalog items."
ws['A29'].font = Font(name='Arial', italic=True, size=8, color='B9770E')
ws.merge_cells('A29:H29')

# --- Totals ---
ws['E31'] = "Taxable Value"
ws['E31'].font = label_font
ws['E31'].alignment = right_align
ws['G31'] = '=IFERROR(SUM(G21:G28),0)'
ws['G31'].font = Font(name='Arial', bold=True, size=10)
ws['G31'].number_format = '₹#,##0.00'
ws['G31'].fill = green_fill
ws['G31'].border = thin

ws['E32'] = "CGST"
ws['E32'].font = label_font
ws['E32'].alignment = right_align
ws['F32'] = '=D6'  # rate display
ws['F32'].number_format = '0.00%'
ws['G32'] = '=IF(B6="COMPOSITION",0,ROUND(G31*D6,2))'
ws['G32'].font = formula_font
ws['G32'].number_format = '₹#,##0.00'
ws['G32'].border = thin

ws['E33'] = "SGST"
ws['E33'].font = label_font
ws['E33'].alignment = right_align
ws['F33'] = '=F6'
ws['F33'].number_format = '0.00%'
ws['G33'] = '=IF(B6="COMPOSITION",0,ROUND(G31*F6,2))'
ws['G33'].font = formula_font
ws['G33'].number_format = '₹#,##0.00'
ws['G33'].border = thin

ws['E34'] = "IGST"
ws['E34'].font = label_font
ws['E34'].alignment = right_align
ws['F34'] = '=H6'
ws['F34'].number_format = '0.00%'
ws['G34'] = '=IF(B6="COMPOSITION",0,ROUND(G31*H6,2))'
ws['G34'].font = formula_font
ws['G34'].number_format = '₹#,##0.00'
ws['G34'].border = thin
ws['G34'].fill = light_blue

ws['E35'] = "Total Tax"
ws['E35'].font = Font(name='Arial', bold=True, size=10, color='555555')
ws['E35'].alignment = right_align
ws['G35'] = '=G32+G33+G34'
ws['G35'].font = Font(name='Arial', bold=True, size=10)
ws['G35'].number_format = '₹#,##0.00'
ws['G35'].border = thin

ws['E36'] = "GRAND TOTAL"
ws['E36'].font = Font(name='Arial', bold=True, size=11, color='1F4E79')
ws['E36'].alignment = right_align
ws['G36'] = '=G31+G35'
ws['G36'].font = Font(name='Arial', bold=True, size=12, color='1F4E79')
ws['G36'].number_format = '₹#,##0.00'
ws['G36'].fill = PatternFill('solid', fgColor='D5F5E3')
ws['G36'].border = thick_blue

# Bank details
ws['A31'] = "BANK DETAILS"
ws['A31'].font = section_font
ws['A32'] = '=BusinessDetails!B14&"  |  A/c: "&BusinessDetails!B16'
ws['A32'].font = formula_font
ws.merge_cells('A32:C32')
ws['A33'] = '="IFSC: "&BusinessDetails!B17&"  |  "&BusinessDetails!B18'
ws['A33'].font = formula_font
ws.merge_cells('A33:C33')
ws['A34'] = '="UPI: "&BusinessDetails!B19'
ws['A34'].font = formula_font
ws.merge_cells('A34:C34')

# Payment terms
ws['A38'] = "PAYMENT TERMS"
ws['A38'].font = section_font
ws['A39'] = (
    "Payment due within 30 days (Net 30). Quote Invoice No. on remittance. "
    "Late payments attract interest @ 18% p.a. under MSMED Act if applicable. "
    "This document is generated under CGST/IGST Acts. All amounts in INR."
)
ws['A39'].font = Font(name='Arial', size=8, color='444444')
ws['A39'].alignment = Alignment(wrap_text=True, vertical='top')
ws.merge_cells('A39:H40')

# Signature area
ws['A42'] = "AUTHORIZATION"
ws['A42'].font = section_font
ws['A43'] = "For Supplier: ____________________  Name / Title / Date"
ws['A43'].font = Font(name='Arial', size=9)
ws.merge_cells('A43:D43')
ws['E43'] = "For Recipient: ____________________  Name / Title / Date"
ws['E43'].font = Font(name='Arial', size=9)
ws.merge_cells('E43:H43')

ws['A45'] = "How to use: 1) Edit BusinessDetails sheet for names/addresses. 2) Select GST Rate Preset (B5). 3) Select services from dropdown in col B. 4) Enter Qty only. 5) For custom items select << CUSTOM ENTRY >> and overwrite SAC/Unit/Rate."
ws['A45'].font = Font(name='Arial', italic=True, size=8, color='1F4E79')
ws.merge_cells('A45:H45')

# Column widths
widths = {'A': 14, 'B': 42, 'C': 12, 'D': 10, 'E': 12, 'F': 12, 'G': 14, 'H': 10}
for col, w in widths.items():
    ws.column_dimensions[col].width = w

# Row heights
ws.row_dimensions[1].height = 22
ws.row_dimensions[20].height = 18
for r in range(21, 29):
    ws.row_dimensions[r].height = 18

# ---------------------------------------------------------------------------
# Data Validations (Dropdowns)
# ---------------------------------------------------------------------------

# GST Preset dropdown
dv_gst = DataValidation(
    type="list",
    formula1='"Regular 18% (Inter-State IGST),Regular 18% (Intra-State CGST+SGST),Regular 12% (Inter-State IGST),Regular 12% (Intra-State CGST+SGST),Regular 5% (Inter-State IGST),Regular 5% (Intra-State CGST+SGST),Regular 28% (Inter-State IGST),Regular 28% (Intra-State CGST+SGST),Composition 6% (Services),Composition 1% (Traders),Composition 5% (Restaurants),Exempt / Nil Rated"',
    allow_blank=False,
    showDropDown=False,
    showErrorMessage=True,
    errorTitle="Invalid Preset",
    error="Please select a GST rate preset from the list."
)
dv_gst.add('B5')
ws.add_data_validation(dv_gst)

# Service / Product dropdown (from Masters descriptions)
dv_svc = DataValidation(
    type="list",
    formula1="Masters!$B$5:$B$15",
    allow_blank=True,
    showDropDown=False,
    showErrorMessage=True,
    errorTitle="Select from list",
    error="Please select a service/product from the dropdown, or choose << CUSTOM ENTRY >>."
)
dv_svc.add('B21:B28')
ws.add_data_validation(dv_svc)

# Reverse charge dropdown on BusinessDetails
dv_rc = DataValidation(
    type="list",
    formula1='"Yes,No"',
    allow_blank=False
)
dv_rc.add('BusinessDetails!B36')
ws_b.add_data_validation(dv_rc)

# Freeze panes
ws.freeze_panes = 'A21'

# ---------------------------------------------------------------------------
# Instructions sheet
# ---------------------------------------------------------------------------
ws_i = wb.create_sheet("Instructions")
ws_i['A1'] = "HOW TO USE THIS GST INVOICE WORKBOOK"
ws_i['A1'].font = title_font
ws_i.merge_cells('A1:B1')

instructions = [
    "",
    "1. BUSINESS DETAILS (Sheet: BusinessDetails)",
    "   • Edit all yellow cells: company name, GSTIN, address, bank, customer details, invoice number/dates.",
    "   • Changes automatically appear on the Invoice sheet.",
    "",
    "2. GST RATE PRESET (Invoice sheet, cell B5) — SINGLE CLICK",
    "   • Click the yellow cell B5 and pick a preset from the dropdown.",
    "   • Options cover Regular 5%/12%/18%/28% (Inter-State IGST or Intra-State CGST+SGST),",
    "     Composition schemes (6%/1%/5%), and Exempt.",
    "   • Selecting a preset auto-updates Scheme, CGST%, SGST%, IGST% and recalculates all tax lines.",
    "   • Composition → document becomes Bill of Supply; no GST charged to customer.",
    "",
    "3. LINE ITEMS (Invoice sheet)",
    "   • Column B (Service/Product): dropdown list from Masters catalog. Select an item.",
    "   • SAC/HSN, Unit, Rate auto-fill from catalog (gray cells — formulas).",
    "   • Column D (Qty): ONLY field you need to type for catalog items (yellow).",
    "   • Amount auto-calculates (Qty × Rate).",
    "",
    "4. CUSTOM MODE",
    "   • Select \"<< CUSTOM ENTRY >>\" in the Service/Product dropdown.",
    "   • Mode column shows \"Custom\".",
    "   • Overwrite the gray SAC, Unit, and Rate cells with your own values (replace the formula).",
    "   • Enter Qty as usual. Amount still auto-calculates.",
    "   • Use this when the item is not in the catalog.",
    "",
    "5. ADDING NEW SERVICES/PRODUCTS",
    "   • Go to Masters sheet. Add a new row in the catalog table (Code, Description, Type, SAC/HSN, Unit, Rate, Active=Yes).",
    "   • The new description appears automatically in the Invoice dropdown (range B5:B15 — extend named range if needed).",
    "",
    "6. TAX LOGIC (automatic)",
    "   • Inter-State (supplier state code ≠ recipient state code) + Regular → IGST only.",
    "   • Intra-State + Regular → CGST + SGST.",
    "   • Composition → CGST=SGST=IGST=0; composition rate is informational only.",
    "   • Place of Supply and Supply Type are derived from BusinessDetails state codes.",
    "",
    "7. PRINT / PDF",
    "   • Set print area on Invoice sheet as needed. Landscape or Portrait both work.",
    "   • Hide Masters / BusinessDetails / Instructions before sharing if desired.",
]

for i, line in enumerate(instructions, 3):
    ws_i.cell(i, 1, line).font = Font(name='Arial', size=10, bold=line.startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.")))
ws_i.column_dimensions['A'].width = 100

# Reorder sheets
wb._sheets = [ws, ws_b, ws_m, ws_i]

out_path = "/home/workdir/artifacts/GST_Interactive_Invoice.xlsx"
wb.save(out_path)
print("Created:", out_path)
print("Sheets:", wb.sheetnames)
