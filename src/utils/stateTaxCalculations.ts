
import { FilingStatus } from './taxCalculations';
import { DeductionInfo } from './deductionEligibility';

export interface StateTaxInputs {
  income: number;
  filingStatus: FilingStatus;
  deductions: number;
  useStandardDeduction: boolean;
  state: string;
}

export interface StateTaxResults {
  taxableIncome: number;
  taxLiability: number;
  effectiveTaxRate: number;
  marginalRate: number;
  deductionAmount: number;
  refundOrOwed: number; // Added this property to match TaxResults interface
  bracketBreakdown: Array<{
    rate: number;
    amount: number;
    rangeStart: number;
    rangeEnd: number;
  }>;
}

// State Tax Brackets for 2023 (California example)
const STATE_TAX_BRACKETS = {
  California: {
    single: [
      { min: 0, max: 10099, rate: 0.01 },
      { min: 10100, max: 23942, rate: 0.02 },
      { min: 23943, max: 37788, rate: 0.04 },
      { min: 37789, max: 52455, rate: 0.06 },
      { min: 52456, max: 66295, rate: 0.08 },
      { min: 66296, max: 338639, rate: 0.093 },
      { min: 338640, max: 406364, rate: 0.103 },
      { min: 406365, max: 677275, rate: 0.113 },
      { min: 677276, max: Infinity, rate: 0.123 },
    ],
    married: [
      { min: 0, max: 20198, rate: 0.01 },
      { min: 20199, max: 47884, rate: 0.02 },
      { min: 47885, max: 75576, rate: 0.04 },
      { min: 75577, max: 104910, rate: 0.06 },
      { min: 104911, max: 132590, rate: 0.08 },
      { min: 132591, max: 677278, rate: 0.093 },
      { min: 677279, max: 812728, rate: 0.103 },
      { min: 812729, max: 1354550, rate: 0.113 },
      { min: 1354551, max: Infinity, rate: 0.123 },
    ],
    headOfHousehold: [
      { min: 0, max: 20212, rate: 0.01 },
      { min: 20213, max: 47887, rate: 0.02 },
      { min: 47888, max: 61730, rate: 0.04 },
      { min: 61731, max: 76397, rate: 0.06 },
      { min: 76398, max: 90240, rate: 0.08 },
      { min: 90241, max: 460547, rate: 0.093 },
      { min: 460548, max: 552658, rate: 0.103 },
      { min: 552659, max: 921095, rate: 0.113 },
      { min: 921096, max: Infinity, rate: 0.123 },
    ],
  },
};

const STATE_STANDARD_DEDUCTION = {
  California: {
    single: 5202,
    married: 10404,
    headOfHousehold: 10404,
  },
};

/**
 * Calculate state taxes based on provided inputs
 */
export function calculateStateTaxes(inputs: StateTaxInputs): StateTaxResults | null {
  const { income, filingStatus, deductions, useStandardDeduction, state } = inputs;
  
  // Only support California for now
  if (state !== 'California' || !STATE_TAX_BRACKETS[state]) {
    return null;
  }
  
  // Calculate deduction amount
  const deductionAmount = useStandardDeduction 
    ? STATE_STANDARD_DEDUCTION[state][filingStatus] 
    : deductions;

  // Calculate taxable income
  const taxableIncome = Math.max(0, income - deductionAmount);
  
  // Calculate tax liability using progressive brackets for the appropriate filing status
  const brackets = STATE_TAX_BRACKETS[state][filingStatus];
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
      
      // Add bracket information to the breakdown
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
  
  // Calculate effective tax rate
  const effectiveTaxRate = taxableIncome > 0 ? taxLiability / taxableIncome : 0;
  
  // Set refundOrOwed to negative tax liability (since we don't have withholding for state taxes)
  const refundOrOwed = -taxLiability; // State taxes are always owed (negative refund)
  
  return {
    taxableIncome,
    taxLiability,
    effectiveTaxRate,
    marginalRate: lastBracketUsed.rate,
    deductionAmount,
    refundOrOwed,
    bracketBreakdown
  };
}

/**
 * Get eligible state-specific deductions
 */
export function getStateEligibleDeductions(
  income: number,
  filingStatus: FilingStatus,
  state: string
): DeductionInfo[] {
  const deductions: DeductionInfo[] = [];
  
  // California-specific deductions
  if (state === 'California') {
    // CA SDI (State Disability Insurance)
    deductions.push({
      id: 'ca_sdi',
      name: 'CA SDI Deduction',
      description: 'California State Disability Insurance contributions',
      eligibleAmount: 1378.48, // Maximum SDI withholding for 2023
      eligibilityMessage: 'You can deduct State Disability Insurance (SDI) contributions on your California tax return.',
      icon: 'heart-pulse'
    });
    
    // CA Child and Dependent Care Credit
    if (income < 100000) {
      deductions.push({
        id: 'ca_childcare',
        name: 'CA Child Care Credit',
        description: 'California credit for child and dependent care expenses',
        eligibleAmount: null,
        eligibilityMessage: 'You may qualify for a credit of 30-50% of your federal child care credit, depending on your income.',
        icon: 'baby'
      });
    }
    
    // CA Renter's Credit
    deductions.push({
      id: 'ca_renters_credit',
      name: 'CA Renter\'s Credit',
      description: 'Credit for California renters',
      eligibleAmount: filingStatus === 'married' ? 120 : 60,
      eligibilityMessage: `You may qualify for a ${filingStatus === 'married' ? '$120' : '$60'} nonrefundable credit if you paid rent for your main residence in California.`,
      icon: 'home'
    });
    
    // CA College Access Tax Credit
    deductions.push({
      id: 'ca_college_credit',
      name: 'College Access Tax Credit',
      description: 'Credit for contributions to the College Access Tax Credit Fund',
      eligibleAmount: null,
      eligibilityMessage: 'You may claim a credit for 50% of contributions to the College Access Tax Credit Fund.',
      icon: 'graduation-cap'
    });
  }
  
  return deductions;
}
