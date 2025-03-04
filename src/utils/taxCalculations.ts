
/**
 * Tax brackets for 2023 (simplified for demonstration)
 * These should be replaced with actual tax brackets for accurate calculations
 */
export const TAX_BRACKETS = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11001, max: 44725, rate: 0.12 },
  { min: 44726, max: 95375, rate: 0.22 },
  { min: 95376, max: 182100, rate: 0.24 },
  { min: 182101, max: 231250, rate: 0.32 },
  { min: 231251, max: 578125, rate: 0.35 },
  { min: 578126, max: Infinity, rate: 0.37 }
];

export const STANDARD_DEDUCTION = {
  single: 13850,
  married: 27700,
  headOfHousehold: 20800
};

export type FilingStatus = 'single' | 'married' | 'headOfHousehold';

export interface TaxInputs {
  income: number;
  filingStatus: FilingStatus;
  withholding: number;
  deductions: number;
  useStandardDeduction: boolean;
}

export interface TaxResults {
  taxableIncome: number;
  taxLiability: number;
  effectiveTaxRate: number;
  refundOrOwed: number;
  marginalRate: number;
  deductionAmount: number;
}

/**
 * Calculate taxes based on provided inputs
 */
export function calculateTaxes(inputs: TaxInputs): TaxResults {
  const { income, filingStatus, withholding, deductions, useStandardDeduction } = inputs;
  
  // Calculate deduction amount
  const deductionAmount = useStandardDeduction 
    ? STANDARD_DEDUCTION[filingStatus] 
    : deductions;

  // Calculate taxable income
  const taxableIncome = Math.max(0, income - deductionAmount);
  
  // Calculate tax liability using progressive brackets
  let taxLiability = 0;
  let lastBracketUsed = TAX_BRACKETS[0];
  
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      taxLiability += taxableInThisBracket * bracket.rate;
      lastBracketUsed = bracket;
    }
  }
  
  // Calculate effective tax rate
  const effectiveTaxRate = taxableIncome > 0 ? taxLiability / taxableIncome : 0;
  
  // Calculate refund or amount owed
  const refundOrOwed = withholding - taxLiability;
  
  return {
    taxableIncome,
    taxLiability,
    effectiveTaxRate,
    refundOrOwed,
    marginalRate: lastBracketUsed.rate,
    deductionAmount
  };
}

/**
 * Format currency values with commas and dollar sign
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + '%';
}
