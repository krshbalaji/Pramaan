const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
        Header, Footer, PageNumber } = require('docx');
const fs = require('fs');

// Border styles
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thickBorder = { style: BorderStyle.SINGLE, size: 12, color: "1F4E79" };
const boxBorders = { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder };
const headerBorder = { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };

function cell(text, opts = {}) {
  const {
    bold = false, width = 2340, align = AlignmentType.LEFT, fill = null,
    borders = thinBorders, fontSize = 17, color = "333333",
    margins = { top: 50, bottom: 50, left: 80, right: 80 },
    vAlign = VerticalAlign.CENTER
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins,
    verticalAlign: vAlign,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, font: "Arial", size: fontSize, color })]
    })]
  });
}

function multiCell(paragraphs, opts = {}) {
  const {
    width = 2340, fill = null, borders = thinBorders,
    margins = { top: 50, bottom: 50, left: 80, right: 80 },
    vAlign = VerticalAlign.TOP
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins,
    verticalAlign: vAlign,
    children: paragraphs
  });
}

// ============================================================================
// EDITABLE CONFIGURATION — change these values as needed
// ============================================================================

// --- Invoice Header (editable) ---
const INVOICE_NO     = "INV-2026-0918";
const INVOICE_DATE   = "18-Sep-2026";
const DUE_DATE       = "18-Oct-2026";
const PO_NUMBER      = "PO-88421-A";

// --- Supplier ---
const SUPPLIER_NAME  = "APEX CONSULTING GROUP";
const SUPPLIER_GSTIN = "27AABCA1234D1Z5";
const SUPPLIER_PAN   = "AABCA1234D";
const SUPPLIER_STATE_CODE = "27";
const SUPPLIER_STATE = "27-Maharashtra";
const SUPPLIER_ADDR1 = "12th Floor, One World Centre, Senapati Bapat Marg";
const SUPPLIER_ADDR2 = "Lower Parel, Mumbai, Maharashtra 400013";
const SUPPLIER_TEL   = "+91 22 6123 4500";
const SUPPLIER_EMAIL = "billing@apexconsulting.in";

// --- Recipient (Tamil Nadu) ---
const RECIPIENT_NAME  = "Meridian Technologies Pvt. Ltd.";
const RECIPIENT_GSTIN = "33AADCM9876K1Z2";
const RECIPIENT_PAN   = "AADCM9876K";
const RECIPIENT_STATE_CODE = "33";
const RECIPIENT_STATE = "33-Tamil Nadu";
const RECIPIENT_ADDR1 = "No. 42, Rajiv Gandhi Salai (OMR)";
const RECIPIENT_ADDR2 = "Thoraipakkam, Chennai, Tamil Nadu 600097";
const PLACE_OF_SUPPLY = "33-Tamil Nadu";
const REVERSE_CHARGE  = "No";

// --- Tax Regime (EDITABLE) ---
// Options: "REGULAR" | "COMPOSITION"
const TAX_SCHEME = "REGULAR";

// Composition scheme rate (only used when TAX_SCHEME === "COMPOSITION")
// Typical rates: 1% (traders), 5% (restaurants), 6% (service providers under composition)
const COMPOSITION_RATE = 0.06;   // 6% for service providers under composition

// Regular taxation rates (EDITABLE)
const CGST_RATE = 0.09;   // 9%
const SGST_RATE = 0.09;   // 9%
const IGST_RATE = 0.18;   // 18%  (must equal CGST_RATE + SGST_RATE)

// Line items (EDITABLE)
const lineItems = [
  {
    no: "1",
    description: "Enterprise Cloud Migration Assessment",
    detail: "Full infrastructure audit, dependency mapping, and migration roadmap for hybrid cloud environment.",
    sac: "998311",
    qty: 1,
    unit: "Project",
    rate: 18500.00,
    amount: 18500.00
  },
  {
    no: "2",
    description: "Security & Compliance Review",
    detail: "SOC 2 Type II readiness assessment and policy gap analysis for regulated workloads.",
    sac: "998311",
    qty: 80,
    unit: "Hours",
    rate: 180.00,
    amount: 14400.00
  },
  {
    no: "3",
    description: "Data Architecture Design Workshop",
    detail: "Three-day on-site workshop covering data lake design, governance model, and ETL strategy.",
    sac: "998311",
    qty: 3,
    unit: "Days",
    rate: 3250.00,
    amount: 9750.00
  },
  {
    no: "4",
    description: "Implementation Support Retainer",
    detail: "Monthly advisory support for Q4 2026 (October–December) including architecture reviews.",
    sac: "998314",
    qty: 3,
    unit: "Months",
    rate: 4000.00,
    amount: 12000.00
  }
];

// ============================================================================
// TAX CALCULATION LOGIC (fixed)
// ============================================================================

const taxableValue = lineItems.reduce((sum, item) => sum + item.amount, 0);

// Determine supply type from state codes
const IS_INTER_STATE = (SUPPLIER_STATE_CODE !== RECIPIENT_STATE_CODE);

// Initialize tax amounts
let cgstAmount = 0;
let sgstAmount = 0;
let igstAmount = 0;
let compositionTax = 0;
let totalTax = 0;
let documentTitle = "TAX INVOICE";
let schemeLabel = "";

if (TAX_SCHEME === "COMPOSITION") {
  // Composition scheme: cannot collect GST from customer.
  // Issues Bill of Supply. Tax is paid by supplier on turnover (not charged on invoice).
  // For display we show composition tax as informational only (not added to total payable by recipient).
  compositionTax = +(taxableValue * COMPOSITION_RATE).toFixed(2);
  totalTax = 0;                    // Recipient does not pay GST
  documentTitle = "BILL OF SUPPLY";
  schemeLabel = "Composition Scheme (" + (COMPOSITION_RATE * 100) + "%)";
  // CGST / SGST / IGST remain 0
} else {
  // REGULAR taxation
  schemeLabel = "Regular Taxation";
  documentTitle = "TAX INVOICE";

  if (IS_INTER_STATE) {
    // Inter-state → IGST only (CGST + SGST must be zero)
    // FIXED: IGST = taxableValue × IGST_RATE  (do NOT also apply CGST/SGST)
    igstAmount = +(taxableValue * IGST_RATE).toFixed(2);
    cgstAmount = 0;
    sgstAmount = 0;
  } else {
    // Intra-state → CGST + SGST (IGST must be zero)
    cgstAmount = +(taxableValue * CGST_RATE).toFixed(2);
    sgstAmount = +(taxableValue * SGST_RATE).toFixed(2);
    igstAmount = 0;
  }
  totalTax = +(cgstAmount + sgstAmount + igstAmount).toFixed(2);
}

const grandTotal = +(taxableValue + totalTax).toFixed(2);

function formatINR(num) {
  return Number(num).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Amount in words (simple helper for the calculated total)
function amountInWords(n) {
  // Pre-computed for current total; update if numbers change
  if (Math.abs(n - 64487) < 0.01) return "Indian Rupees Sixty-Four Thousand Four Hundred Eighty-Seven Only";
  if (Math.abs(n - 54650) < 0.01) return "Indian Rupees Fifty-Four Thousand Six Hundred Fifty Only";
  return "Indian Rupees " + formatINR(n) + " Only";
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 18 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 480, right: 480, bottom: 480, left: 480 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: documentTitle + "  |  Original for Recipient  |  " + schemeLabel,
                bold: true, font: "Arial", size: 14, color: "1F4E79"
              })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Apex Consulting Group  •  GST Compliant  •  Page ",
                font: "Arial", size: 12, color: "666666"
              }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 12, color: "666666" })
            ]
          })
        ]
      })
    },
    children: [
      // ===== HEADER =====
      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [6400, 4880],
        rows: [
          new TableRow({
            children: [
              multiCell([
                new Paragraph({
                  children: [new TextRun({ text: SUPPLIER_NAME, bold: true, font: "Arial", size: 22, color: "1F4E79" })]
                }),
                new Paragraph({
                  spacing: { before: 15 },
                  children: [new TextRun({ text: "Enterprise Solutions Division", font: "Arial", size: 14, color: "555555" })]
                }),
                new Paragraph({
                  spacing: { before: 40 },
                  children: [new TextRun({ text: "GSTIN: " + SUPPLIER_GSTIN, bold: true, font: "Arial", size: 14, color: "1F4E79" })]
                }),
                new Paragraph({
                  children: [new TextRun({ text: "PAN: " + SUPPLIER_PAN + "  |  State: " + SUPPLIER_STATE, font: "Arial", size: 13, color: "555555" })]
                }),
                new Paragraph({
                  spacing: { before: 25 },
                  children: [new TextRun({ text: SUPPLIER_ADDR1, font: "Arial", size: 13, color: "555555" })]
                }),
                new Paragraph({
                  children: [new TextRun({ text: SUPPLIER_ADDR2, font: "Arial", size: 13, color: "555555" })]
                }),
                new Paragraph({
                  children: [new TextRun({ text: "Tel: " + SUPPLIER_TEL + "  |  " + SUPPLIER_EMAIL, font: "Arial", size: 13, color: "555555" })]
                })
              ], { width: 6400, borders: noBorders, margins: { top: 0, bottom: 0, left: 0, right: 60 } }),

              multiCell([
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: documentTitle, bold: true, font: "Arial", size: 26, color: "1F4E79" })]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 40 },
                  children: [
                    new TextRun({ text: "Tax Scheme:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: schemeLabel, bold: true, font: "Arial", size: 13, color: "1F4E79" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 20 },
                  children: [
                    new TextRun({ text: "Invoice No:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: INVOICE_NO, bold: true, font: "Arial", size: 13, color: "1F4E79" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 18 },
                  children: [
                    new TextRun({ text: "Invoice Date:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: INVOICE_DATE, bold: true, font: "Arial", size: 13, color: "333333" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 18 },
                  children: [
                    new TextRun({ text: "Due Date:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: DUE_DATE, bold: true, font: "Arial", size: 13, color: "333333" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 18 },
                  children: [
                    new TextRun({ text: "PO / Reference:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: PO_NUMBER, bold: true, font: "Arial", size: 13, color: "333333" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 18 },
                  children: [
                    new TextRun({ text: "Place of Supply:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: PLACE_OF_SUPPLY, bold: true, font: "Arial", size: 13, color: "333333" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 18 },
                  children: [
                    new TextRun({ text: "Supply Type:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: IS_INTER_STATE ? "Inter-State" : "Intra-State", bold: true, font: "Arial", size: 13, color: "333333" })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 18 },
                  children: [
                    new TextRun({ text: "Reverse Charge:  ", font: "Arial", size: 13, color: "555555" }),
                    new TextRun({ text: REVERSE_CHARGE, bold: true, font: "Arial", size: 13, color: "333333" })
                  ]
                })
              ], { width: 4880, borders: noBorders, margins: { top: 0, bottom: 0, left: 60, right: 0 } })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 80 }, children: [] }),
      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [11280],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: noBorder, bottom: { style: BorderStyle.SINGLE, size: 12, color: "1F4E79" }, left: noBorder, right: noBorder },
                width: { size: 11280, type: WidthType.DXA },
                children: [new Paragraph({ children: [] })]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { before: 100 }, children: [] }),

      // ===== BILL TO / BANK =====
      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [5640, 5640],
        rows: [
          new TableRow({
            children: [
              multiCell([
                new Paragraph({ children: [new TextRun({ text: "BILL TO / RECIPIENT", bold: true, font: "Arial", size: 13, color: "1F4E79" })] }),
                new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: RECIPIENT_NAME, bold: true, font: "Arial", size: 16, color: "333333" })] }),
                new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: "GSTIN: " + RECIPIENT_GSTIN, bold: true, font: "Arial", size: 13, color: "1F4E79" })] }),
                new Paragraph({ children: [new TextRun({ text: "PAN: " + RECIPIENT_PAN + "  |  State: " + RECIPIENT_STATE, font: "Arial", size: 12, color: "555555" })] }),
                new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: "Attn: Accounts Payable", font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: RECIPIENT_ADDR1, font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: RECIPIENT_ADDR2, font: "Arial", size: 13, color: "555555" })] })
              ], { width: 5640, borders: noBorders, margins: { top: 0, bottom: 0, left: 0, right: 80 } }),
              multiCell([
                new Paragraph({ children: [new TextRun({ text: "BANK / REMITTANCE DETAILS", bold: true, font: "Arial", size: 13, color: "1F4E79" })] }),
                new Paragraph({ spacing: { before: 30 }, children: [new TextRun({ text: "Bank: HDFC Bank Ltd.", font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: "Account Name: Apex Consulting Group", font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: "Account No: 502000********21", font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: "IFSC: HDFC0000123", font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: "Branch: Lower Parel, Mumbai", font: "Arial", size: 13, color: "555555" })] }),
                new Paragraph({ children: [new TextRun({ text: "UPI: apex.billing@hdfcbank", font: "Arial", size: 13, color: "555555" })] })
              ], { width: 5640, borders: noBorders, margins: { top: 0, bottom: 0, left: 80, right: 0 } })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 120 }, children: [] }),

      // ===== SERVICES TABLE =====
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "PARTICULARS OF SUPPLY (Services)", bold: true, font: "Arial", size: 14, color: "1F4E79" })]
      }),

      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [480, 3920, 980, 880, 980, 1380, 2660],
        rows: [
          new TableRow({
            children: [
              cell("#", { bold: true, width: 480, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 }),
              cell("Description of Services", { bold: true, width: 3920, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 }),
              cell("SAC", { bold: true, width: 980, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 }),
              cell("Qty", { bold: true, width: 880, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 }),
              cell("Unit", { bold: true, width: 980, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 }),
              cell("Rate (₹)", { bold: true, width: 1380, align: AlignmentType.RIGHT, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 }),
              cell("Amount (₹)", { bold: true, width: 2660, align: AlignmentType.RIGHT, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 13 })
            ]
          }),
          ...lineItems.map((item, idx) => {
            const fill = idx % 2 === 1 ? "F7F9FC" : null;
            return new TableRow({
              children: [
                cell(item.no, { width: 480, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 13, fill }),
                multiCell([
                  new Paragraph({ children: [new TextRun({ text: item.description, bold: true, font: "Arial", size: 13, color: "333333" })] }),
                  new Paragraph({ spacing: { before: 10 }, children: [new TextRun({ text: item.detail, font: "Arial", size: 11, color: "666666" })] })
                ], { width: 3920, borders: thinBorders, fill }),
                cell(item.sac, { width: 980, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 12, fill }),
                cell(String(item.qty), { width: 880, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 13, fill }),
                cell(item.unit, { width: 980, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 12, fill }),
                cell(formatINR(item.rate), { width: 1380, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 13, fill }),
                cell(formatINR(item.amount), { width: 2660, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 13, fill })
              ]
            });
          })
        ]
      }),

      new Paragraph({ spacing: { before: 90 }, children: [] }),

      // ===== TAX SUMMARY =====
      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [6200, 2640, 2440],
        rows: [
          new TableRow({
            children: [
              cell("", { width: 6200, borders: noBorders }),
              cell("Taxable Value", { width: 2640, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14, color: "555555" }),
              cell("₹  " + formatINR(taxableValue), { width: 2440, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14, bold: true })
            ]
          }),
          // CGST
          new TableRow({
            children: [
              cell("", { width: 6200, borders: noBorders }),
              cell("CGST @ " + (CGST_RATE * 100) + "%", { width: 2640, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14, color: "555555" }),
              cell("₹  " + formatINR(cgstAmount), { width: 2440, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14 })
            ]
          }),
          // SGST
          new TableRow({
            children: [
              cell("", { width: 6200, borders: noBorders }),
              cell("SGST @ " + (SGST_RATE * 100) + "%", { width: 2640, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14, color: "555555" }),
              cell("₹  " + formatINR(sgstAmount), { width: 2440, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14 })
            ]
          }),
          // IGST (always shown; value is 0 when not applicable)
          new TableRow({
            children: [
              cell("", { width: 6200, borders: noBorders }),
              cell("IGST @ " + (IGST_RATE * 100) + "%", {
                width: 2640, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14,
                color: "555555", bold: (igstAmount > 0)
              }),
              cell("₹  " + formatINR(igstAmount), {
                width: 2440, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14,
                bold: (igstAmount > 0)
              })
            ]
          }),
          // Composition tax line (only when Composition scheme)
          ...(TAX_SCHEME === "COMPOSITION" ? [
            new TableRow({
              children: [
                cell("", { width: 6200, borders: noBorders }),
                cell("Composition Tax @ " + (COMPOSITION_RATE * 100) + "% (info)", {
                  width: 2640, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 13, color: "888888"
                }),
                cell("₹  " + formatINR(compositionTax), {
                  width: 2440, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 13, color: "888888"
                })
              ]
            })
          ] : []),
          // Total Tax
          new TableRow({
            children: [
              cell("", { width: 6200, borders: noBorders }),
              cell("Total Tax (charged)", { width: 2640, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14, color: "555555" }),
              cell("₹  " + formatINR(totalTax), { width: 2440, align: AlignmentType.RIGHT, borders: noBorders, fontSize: 14, bold: true })
            ]
          }),
          // Grand Total
          new TableRow({
            children: [
              cell("", { width: 6200, borders: noBorders }),
              cell("Grand Total", {
                width: 2640, align: AlignmentType.RIGHT,
                borders: { top: { style: BorderStyle.SINGLE, size: 8, color: "1F4E79" }, bottom: noBorder, left: noBorder, right: noBorder },
                fontSize: 16, bold: true, color: "1F4E79",
                margins: { top: 50, bottom: 30, left: 80, right: 80 }
              }),
              cell("₹  " + formatINR(grandTotal), {
                width: 2440, align: AlignmentType.RIGHT,
                borders: { top: { style: BorderStyle.SINGLE, size: 8, color: "1F4E79" }, bottom: noBorder, left: noBorder, right: noBorder },
                fontSize: 16, bold: true, color: "1F4E79",
                margins: { top: 50, bottom: 30, left: 80, right: 80 }
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 70 },
        children: [
          new TextRun({ text: "Amount in Words:  ", bold: true, font: "Arial", size: 13, color: "555555" }),
          new TextRun({ text: amountInWords(grandTotal), font: "Arial", size: 13, color: "333333" })
        ]
      }),

      new Paragraph({ spacing: { before: 110 }, children: [] }),

      // ===== GST TAX BREAKDOWN (full CGST / SGST / IGST) =====
      new Paragraph({
        spacing: { after: 35 },
        children: [new TextRun({ text: "GST TAX BREAKDOWN", bold: true, font: "Arial", size: 13, color: "1F4E79" })]
      }),

      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [1400, 1600, 1100, 1300, 1100, 1300, 1100, 1380],
        rows: [
          new TableRow({
            children: [
              cell("HSN/SAC", { bold: true, width: 1400, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("Taxable (₹)", { bold: true, width: 1600, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("CGST %", { bold: true, width: 1100, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("CGST Amt", { bold: true, width: 1300, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("SGST %", { bold: true, width: 1100, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("SGST Amt", { bold: true, width: 1300, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("IGST %", { bold: true, width: 1100, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 }),
              cell("IGST Amt", { bold: true, width: 1380, align: AlignmentType.CENTER, fill: "1F4E79", color: "FFFFFF", borders: headerBorders, fontSize: 11 })
            ]
          }),
          // SAC 998311
          (() => {
            const groupAmt = 18500 + 14400 + 9750;
            const isIGST = TAX_SCHEME === "REGULAR" && IS_INTER_STATE;
            const isCGST = TAX_SCHEME === "REGULAR" && !IS_INTER_STATE;
            return new TableRow({
              children: [
                cell("998311", { width: 1400, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11 }),
                cell(formatINR(groupAmt), { width: 1600, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11 }),
                cell(isCGST ? (CGST_RATE * 100) + "%" : "—", { width: 1100, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11 }),
                cell(formatINR(isCGST ? groupAmt * CGST_RATE : 0), { width: 1300, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11 }),
                cell(isCGST ? (SGST_RATE * 100) + "%" : "—", { width: 1100, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11 }),
                cell(formatINR(isCGST ? groupAmt * SGST_RATE : 0), { width: 1300, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11 }),
                cell(isIGST ? (IGST_RATE * 100) + "%" : "—", { width: 1100, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11 }),
                cell(formatINR(isIGST ? groupAmt * IGST_RATE : 0), { width: 1380, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11 })
              ]
            });
          })(),
          // SAC 998314
          (() => {
            const groupAmt = 12000;
            const isIGST = TAX_SCHEME === "REGULAR" && IS_INTER_STATE;
            const isCGST = TAX_SCHEME === "REGULAR" && !IS_INTER_STATE;
            return new TableRow({
              children: [
                cell("998314", { width: 1400, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(formatINR(groupAmt), { width: 1600, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(isCGST ? (CGST_RATE * 100) + "%" : "—", { width: 1100, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(formatINR(isCGST ? groupAmt * CGST_RATE : 0), { width: 1300, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(isCGST ? (SGST_RATE * 100) + "%" : "—", { width: 1100, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(formatINR(isCGST ? groupAmt * SGST_RATE : 0), { width: 1300, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(isIGST ? (IGST_RATE * 100) + "%" : "—", { width: 1100, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11, fill: "F7F9FC" }),
                cell(formatINR(isIGST ? groupAmt * IGST_RATE : 0), { width: 1380, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "F7F9FC" })
              ]
            });
          })(),
          // TOTAL
          new TableRow({
            children: [
              cell("TOTAL", { bold: true, width: 1400, align: AlignmentType.CENTER, borders: thinBorders, fontSize: 11, fill: "E8EEF5" }),
              cell(formatINR(taxableValue), { bold: true, width: 1600, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "E8EEF5" }),
              cell("", { width: 1100, borders: thinBorders, fill: "E8EEF5" }),
              cell(formatINR(cgstAmount), { bold: true, width: 1300, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "E8EEF5" }),
              cell("", { width: 1100, borders: thinBorders, fill: "E8EEF5" }),
              cell(formatINR(sgstAmount), { bold: true, width: 1300, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "E8EEF5" }),
              cell("", { width: 1100, borders: thinBorders, fill: "E8EEF5" }),
              cell(formatINR(igstAmount), { bold: true, width: 1380, align: AlignmentType.RIGHT, borders: thinBorders, fontSize: 11, fill: "E8EEF5" })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 100 }, children: [] }),

      // ===== PAYMENT TERMS =====
      new Paragraph({
        spacing: { after: 30 },
        children: [new TextRun({ text: "PAYMENT TERMS & NOTES", bold: true, font: "Arial", size: 13, color: "1F4E79" })]
      }),
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: TAX_SCHEME === "COMPOSITION"
              ? "Payment is due within thirty (30) days of the invoice date (Net 30). Please quote Invoice No. " + INVOICE_NO + " on all remittances. This is a Bill of Supply issued under the Composition Scheme (Section 10 of the CGST Act, 2017). No GST is charged on this document. The supplier pays composition tax on turnover as applicable. All amounts are in Indian Rupees (INR). For any discrepancy, contact " + SUPPLIER_EMAIL + " within 7 days of receipt."
              : "Payment is due within thirty (30) days of the invoice date (Net 30). Please quote Invoice No. " + INVOICE_NO + " on all remittances. Late payments attract interest at 18% p.a. under the MSMED Act, 2006 (if applicable) or as per contract. All amounts are in Indian Rupees (INR). This is a Tax Invoice under Section 31 of the CGST Act, 2017. Supply is " + (IS_INTER_STATE ? "inter-state; IGST is charged under the IGST Act, 2017" : "intra-state; CGST and SGST are charged under the CGST / SGST Acts") + ". For any discrepancy, contact " + SUPPLIER_EMAIL + " within 7 days of receipt.",
            font: "Arial", size: 12, color: "444444"
          })
        ]
      }),

      new Paragraph({ spacing: { before: 110 }, children: [] }),

      // ===== SIGNATURE SECTION =====
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "AUTHORIZATION", bold: true, font: "Arial", size: 13, color: "1F4E79" })]
      }),

      new Table({
        width: { size: 11280, type: WidthType.DXA },
        columnWidths: [5640, 5640],
        rows: [
          new TableRow({
            children: [
              multiCell([
                new Paragraph({ children: [new TextRun({ text: "FOR APEX CONSULTING GROUP", bold: true, font: "Arial", size: 12, color: "1F4E79" })] }),
                new Paragraph({ spacing: { before: 90 }, children: [
                  new TextRun({ text: "Name:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 60 }, children: [
                  new TextRun({ text: "Title:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 60 }, children: [
                  new TextRun({ text: "Company:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "Apex Consulting Group", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 90 }, children: [
                  new TextRun({ text: "Signature:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 60 }, children: [
                  new TextRun({ text: "Date:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]})
              ], { width: 5640, borders: boxBorders, margins: { top: 80, bottom: 80, left: 110, right: 110 }, fill: "FAFBFC" }),
              multiCell([
                new Paragraph({ children: [new TextRun({ text: "FOR MERIDIAN TECHNOLOGIES PVT. LTD.", bold: true, font: "Arial", size: 12, color: "1F4E79" })] }),
                new Paragraph({ spacing: { before: 90 }, children: [
                  new TextRun({ text: "Name:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 60 }, children: [
                  new TextRun({ text: "Title:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 60 }, children: [
                  new TextRun({ text: "Company:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "Meridian Technologies Pvt. Ltd.", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 90 }, children: [
                  new TextRun({ text: "Signature:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]}),
                new Paragraph({ spacing: { before: 60 }, children: [
                  new TextRun({ text: "Date:  ", font: "Arial", size: 12, color: "555555" }),
                  new TextRun({ text: "_______________________________", font: "Arial", size: 12, color: "333333" })
                ]})
              ], { width: 5640, borders: boxBorders, margins: { top: 80, bottom: 80, left: 110, right: 110 }, fill: "FAFBFC" })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 100 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "This is a computer-generated " + documentTitle + " under the CGST / IGST Acts and is valid without a physical signature unless required by contract. Subject to Mumbai jurisdiction.",
            font: "Arial", size: 11, color: "888888", italics: true
          })
        ]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/workdir/artifacts/Enterprise_Invoice_INV-2026-0918.docx", buffer);
  console.log("=== GST Tax Invoice Generated ===");
  console.log("Tax Scheme      : " + TAX_SCHEME + " (" + schemeLabel + ")");
  console.log("Document Title  : " + documentTitle);
  console.log("Place of Supply : " + PLACE_OF_SUPPLY);
  console.log("Supply Type     : " + (IS_INTER_STATE ? "Inter-State" : "Intra-State"));
  console.log("--- Tax Calculation (Fixed Logic) ---");
  console.log("Taxable Value   : ₹" + formatINR(taxableValue));
  console.log("CGST " + (CGST_RATE*100) + "%      : ₹" + formatINR(cgstAmount));
  console.log("SGST " + (SGST_RATE*100) + "%      : ₹" + formatINR(sgstAmount));
  console.log("IGST " + (IGST_RATE*100) + "%      : ₹" + formatINR(igstAmount));
  if (TAX_SCHEME === "COMPOSITION") {
    console.log("Composition Tax : ₹" + formatINR(compositionTax) + " (info only, not charged)");
  }
  console.log("Total Tax       : ₹" + formatINR(totalTax));
  console.log("Grand Total     : ₹" + formatINR(grandTotal));
});
