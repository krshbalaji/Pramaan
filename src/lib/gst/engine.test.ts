import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeTax, presetRate, roundMoney } from "./engine.ts";

const TAXABLE = 18_500;
const INTER_18 = "Regular 18% (Inter-State IGST)";
const INTRA_18 = "Regular 18% (Intra-State CGST+SGST)";
const INTER_12 = "Regular 12% (Inter-State IGST)";
const INTRA_12 = "Regular 12% (Intra-State CGST+SGST)";
const INTER_5 = "Regular 5% (Inter-State IGST)";
const INTRA_5 = "Regular 5% (Intra-State CGST+SGST)";
const EXEMPT = "Exempt / Nil Rated";
const COMPOSITION_6 = "Composition 6% (Services)";

function tax(presetName: string, supplierState: string, recipientState: string, taxable = TAXABLE) {
  return computeTax({ presetName, supplierState, recipientState, taxable });
}

describe("presetRate — Inter/Intra labels encode the same total", () => {
  it("18% Inter and Intra both resolve to 0.18", () => {
    assert.equal(presetRate(INTER_18), 0.18);
    assert.equal(presetRate(INTRA_18), 0.18);
  });
  it("12% Inter and Intra both resolve to 0.12", () => {
    assert.equal(presetRate(INTER_12), 0.12);
    assert.equal(presetRate(INTRA_12), 0.12);
  });
});

describe("computeTax — place of supply, not preset split", () => {
  it("A: ₹18,500 MH → TN 18% is IGST 3330", () => {
    const r = tax(INTER_18, "27", "33");
    assert.equal(r.supplyType, "Inter-State");
    assert.equal(r.scheme, "REGULAR");
    assert.equal(r.docTitle, "Tax Invoice");
    assert.equal(r.igst, 3330);
    assert.equal(r.cgst, 0);
    assert.equal(r.sgst, 0);
    assert.equal(r.totalTax, 3330);
    assert.equal(r.grandTotal, 21830);
    assert.equal(r.igstRate, 0.18);
    assert.equal(r.cgstRate, 0);
    assert.equal(r.sgstRate, 0);
  });

  it("B: ₹18,500 MH → MH 18% is CGST 1665 + SGST 1665 (Walk-in / B2C)", () => {
    const r = tax(INTRA_18, "27", "27");
    assert.equal(r.supplyType, "Intra-State");
    assert.equal(r.igst, 0);
    assert.equal(r.cgst, 1665);
    assert.equal(r.sgst, 1665);
    assert.equal(r.totalTax, 3330);
    assert.equal(r.grandTotal, 21830);
    assert.equal(r.cgstRate, 0.09);
    assert.equal(r.sgstRate, 0.09);
    assert.equal(r.igstRate, 0);
  });

  it("C: ₹18,500 MH → TN with the Intra-State 18% preset is still IGST 3330", () => {
    const r = tax(INTRA_18, "27", "33");
    assert.equal(r.supplyType, "Inter-State");
    assert.equal(r.igst, 3330);
    assert.equal(r.cgst, 0);
    assert.equal(r.sgst, 0);
    assert.equal(r.totalTax, 3330);
    assert.equal(r.igstRate, 0.18);
  });

  it("D: ₹18,500 MH → MH with the Inter-State 18% preset (company default) is CGST+SGST, not zero", () => {
    const r = tax(INTER_18, "27", "27");
    assert.equal(r.supplyType, "Intra-State");
    assert.equal(r.igst, 0);
    assert.equal(r.cgst, 1665);
    assert.equal(r.sgst, 1665);
    assert.equal(r.totalTax, 3330);
    assert.equal(r.grandTotal, 21830);
    assert.equal(r.cgstRate, 0.09);
    assert.equal(r.sgstRate, 0.09);
  });

  it("E: 12% inter-state ₹18,500 is IGST 2220", () => {
    const r = tax(INTER_12, "27", "33");
    assert.equal(r.igst, 2220);
    assert.equal(r.cgst, 0);
    assert.equal(r.sgst, 0);
    assert.equal(r.grandTotal, 20720);
  });

  it("F: 12% intra-state ₹18,500 is CGST 1110 + SGST 1110", () => {
    const r = tax(INTRA_12, "27", "27");
    assert.equal(r.igst, 0);
    assert.equal(r.cgst, 1110);
    assert.equal(r.sgst, 1110);
    assert.equal(r.grandTotal, 20720);
  });

  it("12% Intra preset on MH → TN still yields IGST 2220", () => {
    const r = tax(INTRA_12, "27", "33");
    assert.equal(r.igst, 2220);
    assert.equal(r.cgst, 0);
    assert.equal(r.sgst, 0);
  });

  it("G: Exempt / nil rated — all tax 0", () => {
    const inter = tax(EXEMPT, "27", "33");
    const intra = tax(EXEMPT, "27", "27");
    for (const r of [inter, intra]) {
      assert.equal(r.scheme, "REGULAR");
      assert.equal(r.cgst, 0);
      assert.equal(r.sgst, 0);
      assert.equal(r.igst, 0);
      assert.equal(r.totalTax, 0);
      assert.equal(r.compositionTax, 0);
      assert.equal(r.grandTotal, TAXABLE);
      assert.equal(r.docTitle, "Tax Invoice");
    }
  });

  it("H: Composition — invoice tax 0, compositionTax preserved, Bill of Supply", () => {
    const r = tax(COMPOSITION_6, "27", "33");
    assert.equal(r.scheme, "COMPOSITION");
    assert.equal(r.docTitle, "Bill of Supply");
    assert.equal(r.cgst, 0);
    assert.equal(r.sgst, 0);
    assert.equal(r.igst, 0);
    assert.equal(r.totalTax, 0);
    assert.equal(r.grandTotal, TAXABLE);
    assert.equal(r.compositionTax, roundMoney(TAXABLE * 0.06));
    assert.equal(r.compositionTax, 1110);
  });
});

describe("computeTax — 5% rounding (existing roundMoney, not a new policy)", () => {
  // 5% / 2 = 2.5%. Amounts are roundMoney(taxable * half), not roundMoney(rate).
  // roundMoney(18500 * 0.025) = roundMoney(462.5) = 462.5
  it("5% inter-state uses roundMoney(taxable * 0.05)", () => {
    const r = tax(INTER_5, "27", "33");
    const expected = roundMoney(TAXABLE * 0.05);
    assert.equal(expected, 925);
    assert.equal(r.igst, expected);
    assert.equal(r.cgst, 0);
    assert.equal(r.sgst, 0);
  });

  it("5% intra-state splits with roundMoney on each 2.5% half", () => {
    const r = tax(INTRA_5, "27", "27");
    const half = roundMoney(TAXABLE * 0.025);
    assert.equal(half, 462.5);
    assert.equal(r.cgst, half);
    assert.equal(r.sgst, half);
    assert.equal(r.igst, 0);
    assert.equal(r.totalTax, roundMoney(half + half));
    assert.equal(r.cgstRate, 0.025);
    assert.equal(r.sgstRate, 0.025);
  });

  it("5% Inter preset on MH → MH still splits, not zero", () => {
    const r = tax(INTER_5, "27", "27");
    assert.equal(r.cgst, 462.5);
    assert.equal(r.sgst, 462.5);
    assert.equal(r.igst, 0);
  });
});
