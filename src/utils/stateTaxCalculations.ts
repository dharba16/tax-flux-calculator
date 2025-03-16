
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
  refundOrOwed: number;
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
  // New York State Tax Brackets
  "New York": {
    single: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8501, max: 11700, rate: 0.045 },
      { min: 11701, max: 13900, rate: 0.0525 },
      { min: 13901, max: 80650, rate: 0.055 },
      { min: 80651, max: 215400, rate: 0.06 },
      { min: 215401, max: 1077550, rate: 0.0685 },
      { min: 1077551, max: Infinity, rate: 0.0882 },
    ],
    married: [
      { min: 0, max: 17150, rate: 0.04 },
      { min: 17151, max: 23600, rate: 0.045 },
      { min: 23601, max: 27900, rate: 0.0525 },
      { min: 27901, max: 161550, rate: 0.055 },
      { min: 161551, max: 323200, rate: 0.06 },
      { min: 323201, max: 2155350, rate: 0.0685 },
      { min: 2155351, max: Infinity, rate: 0.0882 },
    ],
    headOfHousehold: [
      { min: 0, max: 12800, rate: 0.04 },
      { min: 12801, max: 17650, rate: 0.045 },
      { min: 17651, max: 20900, rate: 0.0525 },
      { min: 20901, max: 107650, rate: 0.055 },
      { min: 107651, max: 269300, rate: 0.06 },
      { min: 269301, max: 1616450, rate: 0.0685 },
      { min: 1616451, max: Infinity, rate: 0.0882 },
    ],
  },
  // Texas has no state income tax
  "Texas": {
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  // Florida has no state income tax
  "Florida": {
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  // Washington has no state income tax
  "Washington": {
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  }
};

const STATE_STANDARD_DEDUCTION = {
  California: {
    single: 5202,
    married: 10404,
    headOfHousehold: 10404,
  },
  "New York": {
    single: 8000,
    married: 16050,
    headOfHousehold: 11200,
  },
  "Texas": {
    single: 0,
    married: 0,
    headOfHousehold: 0,
  },
  "Florida": {
    single: 0,
    married: 0,
    headOfHousehold: 0,
  },
  "Washington": {
    single: 0,
    married: 0,
    headOfHousehold: 0,
  }
};

/**
 * Calculate state taxes based on provided inputs
 */
export function calculateStateTaxes(inputs: StateTaxInputs): StateTaxResults | null {
  const { income, filingStatus, deductions, useStandardDeduction, state } = inputs;
  
  // Check if we have tax data for this state
  if (!STATE_TAX_BRACKETS[state]) {
    return {
      taxableIncome: income,
      taxLiability: 0,
      effectiveTaxRate: 0,
      marginalRate: 0,
      deductionAmount: 0,
      refundOrOwed: 0,
      bracketBreakdown: [{
        rate: 0,
        amount: 0,
        rangeStart: 0,
        rangeEnd: Infinity
      }]
    };
  }
  
  // Calculate deduction amount
  const standardDeduction = STATE_STANDARD_DEDUCTION[state]?.[filingStatus] || 0;
  const deductionAmount = useStandardDeduction 
    ? standardDeduction
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
  if (state === "California") {
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
  // New York-specific deductions
  else if (state === "New York") {
    // NY College Tuition Credit/Deduction
    deductions.push({
      id: 'ny_tuition_credit',
      name: 'NY College Tuition Credit',
      description: 'New York credit for college tuition expenses',
      eligibleAmount: 400,
      eligibilityMessage: 'You may qualify for up to $400 per student for tuition expenses at qualified institutions.',
      icon: 'graduation-cap'
    });
    
    // NY Long-Term Care Insurance Credit
    deductions.push({
      id: 'ny_ltc_credit',
      name: 'NY Long-Term Care Insurance Credit',
      description: 'Credit for long-term care insurance premiums',
      eligibleAmount: null,
      eligibilityMessage: 'You may qualify for a credit of 20% of premiums paid for long-term care insurance.',
      icon: 'heart-pulse'
    });
  }
  // For no-income tax states, explain that there are no deductions
  else if (["Texas", "Florida", "Washington"].includes(state)) {
    deductions.push({
      id: 'no_income_tax',
      name: 'No State Income Tax',
      description: `${state} does not have state income tax`,
      eligibleAmount: 0,
      eligibilityMessage: `${state} does not impose a state income tax, so no state tax deductions apply.`,
      icon: 'check'
    });
  }
  
  return deductions;
}

