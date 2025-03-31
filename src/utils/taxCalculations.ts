/**
 * Tax brackets for 2023 based on filing status
 */
export const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11001, max: 44725, rate: 0.12 },
    { min: 44726, max: 95375, rate: 0.22 },
    { min: 95376, max: 182100, rate: 0.24 },
    { min: 182101, max: 231250, rate: 0.32 },
    { min: 231251, max: 578125, rate: 0.35 },
    { min: 578126, max: Infinity, rate: 0.37 }
  ],
  married: [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22001, max: 89450, rate: 0.12 },
    { min: 89451, max: 190750, rate: 0.22 },
    { min: 190751, max: 364200, rate: 0.24 },
    { min: 364201, max: 462500, rate: 0.32 },
    { min: 462501, max: 693750, rate: 0.35 },
    { min: 693751, max: Infinity, rate: 0.37 }
  ],
  marriedSeparate: [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11001, max: 44725, rate: 0.12 },
    { min: 44726, max: 95375, rate: 0.22 },
    { min: 95376, max: 182100, rate: 0.24 },
    { min: 182101, max: 231250, rate: 0.32 },
    { min: 231251, max: 346875, rate: 0.35 },
    { min: 346876, max: Infinity, rate: 0.37 }
  ],
  qualifiedWidow: [
    { min: 0, max: 22000, rate: 0.10 },
    { min: 22001, max: 89450, rate: 0.12 },
    { min: 89451, max: 190750, rate: 0.22 },
    { min: 190751, max: 364200, rate: 0.24 },
    { min: 364201, max: 462500, rate: 0.32 },
    { min: 462501, max: 693750, rate: 0.35 },
    { min: 693751, max: Infinity, rate: 0.37 }
  ],
  headOfHousehold: [
    { min: 0, max: 15700, rate: 0.10 },
    { min: 15701, max: 59850, rate: 0.12 },
    { min: 59851, max: 95350, rate: 0.22 },
    { min: 95351, max: 182100, rate: 0.24 },
    { min: 182101, max: 231250, rate: 0.32 },
    { min: 231251, max: 578100, rate: 0.35 },
    { min: 578101, max: Infinity, rate: 0.37 }
  ]
};

export const STANDARD_DEDUCTION = {
  single: 13850,
  married: 27700,
  marriedSeparate: 13850,
  qualifiedWidow: 27700,
  headOfHousehold: 20800
};

export type FilingStatus = 'single' | 'married' | 'marriedSeparate' | 'qualifiedWidow' | 'headOfHousehold';

export interface TaxInputs {
  income: number;
  filingStatus: FilingStatus;
  withholding: number;
  deductions: number;
  useStandardDeduction: boolean;
  selectedDeductions?: Array<{ id: string; amount: number }>;
}

export interface TaxResults {
  taxableIncome: number;
  taxLiability: number;
  effectiveTaxRate: number;
  refundOrOwed: number;
  marginalRate: number;
  deductionAmount: number;
  selectedDeductionsTotal: number;
  bracketBreakdown: Array<{
    rate: number;
    amount: number;
    rangeStart: number;
    rangeEnd: number;
  }>;
}

/**
 * Calculate taxes based on provided inputs
 */
export function calculateTaxes(inputs: TaxInputs): TaxResults {
  const { income, filingStatus, withholding, deductions, useStandardDeduction, selectedDeductions = [] } = inputs;
  
  // Calculate the total amount from selected deductions
  const selectedDeductionsTotal = selectedDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  
  // Determine the total deduction amount
  const standardDeductionAmount = STANDARD_DEDUCTION[filingStatus];
  const itemizedDeductionAmount = deductions + selectedDeductionsTotal;
  
  // Use the greater of standard or itemized deductions
  const deductionAmount = useStandardDeduction 
    ? standardDeductionAmount 
    : itemizedDeductionAmount;

  const taxableIncome = Math.max(0, income - deductionAmount);
  
  const brackets = TAX_BRACKETS[filingStatus];
  let taxLiability = 0;
  let lastBracketUsed = brackets[0];
  const bracketBreakdown: Array<{
    rate: number;
    amount: number;
    rangeStart: number;
    rangeEnd: number;
  }> = [];
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      const taxAmountForBracket = taxableInThisBracket * bracket.rate;
      taxLiability += taxAmountForBracket;
      lastBracketUsed = bracket;
      
      if (taxableInThisBracket > 0) {
        bracketBreakdown.push({
          rate: bracket.rate,
          amount: taxAmountForBracket,
          rangeStart: bracket.min,
          rangeEnd: Math.min(taxableIncome, bracket.max)
        });
      }
    }
  }
  
  const effectiveTaxRate = taxableIncome > 0 ? taxLiability / taxableIncome : 0;
  
  const refundOrOwed = withholding - taxLiability;
  
  return {
    taxableIncome,
    taxLiability,
    effectiveTaxRate,
    refundOrOwed,
    marginalRate: lastBracketUsed.rate,
    deductionAmount,
    selectedDeductionsTotal,
    bracketBreakdown
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

/**
 * Calculate withholding based on income and filing status
 * This is used for estimating withholding from W-2 forms
 */
export function calculateWithholding(income: number, filingStatus: FilingStatus): {
  federal: number;
  state: number;
} {
  // Calculate estimated federal withholding based on income and filing status
  // These are approximate calculations that mirror typical withholding
  let federalBase = 0;
  if (filingStatus === 'single' || filingStatus === 'marriedSeparate') {
    federalBase = income * 0.18;  // Approximate federal tax rate for single filers
  } else if (filingStatus === 'married' || filingStatus === 'qualifiedWidow') {
    federalBase = income * 0.16;  // Slightly lower for joint filers
  } else if (filingStatus === 'headOfHousehold') {
    federalBase = income * 0.17;  // In between for head of household
  }
  
  // Adjust for progressive nature of tax system
  if (income > 100000) {
    federalBase += (income - 100000) * 0.02;  // Additional withholding for higher incomes
  }
  
  // Calculate state withholding (varies greatly by state, using average)
  const stateWithholding = income * 0.045;  // Approximate 4.5% state tax
  
  return {
    federal: Math.round(federalBase),
    state: Math.round(stateWithholding)
  };
}
