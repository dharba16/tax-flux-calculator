
import { FilingStatus } from './taxCalculations';
import { DeductionInfo } from './deductionEligibility';

// Define interfaces for state tax calculations
export interface StateTaxResults {
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  marginRate: number;
  filingStatus: FilingStatus;
  standardDeduction: number;
  brackets: TaxBracket[];
  selectedDeductionsTotal: number;
  taxLiability: number; 
  bracketBreakdown?: Array<{
    rate: number;
    amount: number;
    rangeStart: number;
    rangeEnd: number;
  }>;
  // These properties are required for type compatibility with TaxResults
  effectiveTaxRate: number;
  refundOrOwed: number;
  deductionAmount: number;
  marginalRate: number;
}

export interface StateTaxInputs {
  income: number;
  withholding?: number;
  filingStatus: FilingStatus;
  deductions: number;
  useStandardDeduction: boolean;
  state: string;
  selectedDeductions?: { id: string; amount: number; name: string }[];
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

// State-specific standard deductions
const stateStandardDeductions: Record<string, Record<FilingStatus, number>> = {
  'California': {
    'single': 4803,
    'married': 9606,
    'marriedSeparate': 4803,
    'headOfHousehold': 9606,
    'qualifiedWidow': 9606
  },
  'New York': {
    'single': 8000,
    'married': 16050,
    'marriedSeparate': 8000,
    'headOfHousehold': 11200,
    'qualifiedWidow': 16050
  },
  'Texas': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0,
    'qualifiedWidow': 0
  },
  'Florida': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0,
    'qualifiedWidow': 0
  },
  'Illinois': {
    'single': 2375,
    'married': 4750,
    'marriedSeparate': 2375,
    'headOfHousehold': 2375,
    'qualifiedWidow': 4750
  },
  'Pennsylvania': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0,
    'qualifiedWidow': 0
  },
  'Ohio': {
    'single': 2400,
    'married': 4800,
    'marriedSeparate': 2400,
    'headOfHousehold': 3600,
    'qualifiedWidow': 4800
  },
  'Michigan': {
    'single': 4900,
    'married': 9800,
    'marriedSeparate': 4900,
    'headOfHousehold': 4900,
    'qualifiedWidow': 9800
  },
  'Georgia': {
    'single': 5400,
    'married': 7100,
    'marriedSeparate': 3550,
    'headOfHousehold': 7100,
    'qualifiedWidow': 7100
  },
};

// State tax brackets
const stateTaxBrackets: Record<string, Record<FilingStatus, TaxBracket[]>> = {
  'California': {
    'single': [
      { min: 0, max: 9325, rate: 0.01 },
      { min: 9326, max: 22107, rate: 0.02 },
      { min: 22108, max: 34892, rate: 0.04 },
      { min: 34893, max: 48435, rate: 0.06 },
      { min: 48436, max: 61214, rate: 0.08 },
      { min: 61215, max: 312686, rate: 0.093 },
      { min: 312687, max: 375221, rate: 0.103 },
      { min: 375222, max: 625369, rate: 0.113 },
      { min: 625370, max: null, rate: 0.123 }
    ],
    'married': [
      { min: 0, max: 18650, rate: 0.01 },
      { min: 18651, max: 44214, rate: 0.02 },
      { min: 44215, max: 69784, rate: 0.04 },
      { min: 69785, max: 96870, rate: 0.06 },
      { min: 96871, max: 122428, rate: 0.08 },
      { min: 122429, max: 625372, rate: 0.093 },
      { min: 625373, max: 750442, rate: 0.103 },
      { min: 750443, max: 1250738, rate: 0.113 },
      { min: 1250739, max: null, rate: 0.123 }
    ],
    'marriedSeparate': [
      { min: 0, max: 9325, rate: 0.01 },
      { min: 9326, max: 22107, rate: 0.02 },
      { min: 22108, max: 34892, rate: 0.04 },
      { min: 34893, max: 48435, rate: 0.06 },
      { min: 48436, max: 61214, rate: 0.08 },
      { min: 61215, max: 312686, rate: 0.093 },
      { min: 312687, max: 375221, rate: 0.103 },
      { min: 375222, max: 625369, rate: 0.113 },
      { min: 625370, max: null, rate: 0.123 }
    ],
    'headOfHousehold': [
      { min: 0, max: 18663, rate: 0.01 },
      { min: 18664, max: 44217, rate: 0.02 },
      { min: 44218, max: 56999, rate: 0.04 },
      { min: 57000, max: 70542, rate: 0.06 },
      { min: 70543, max: 83324, rate: 0.08 },
      { min: 83325, max: 425251, rate: 0.093 },
      { min: 425252, max: 510303, rate: 0.103 },
      { min: 510304, max: 850503, rate: 0.113 },
      { min: 850504, max: null, rate: 0.123 }
    ],
    'qualifiedWidow': [
      { min: 0, max: 18650, rate: 0.01 },
      { min: 18651, max: 44214, rate: 0.02 },
      { min: 44215, max: 69784, rate: 0.04 },
      { min: 69785, max: 96870, rate: 0.06 },
      { min: 96871, max: 122428, rate: 0.08 },
      { min: 122429, max: 625372, rate: 0.093 },
      { min: 625373, max: 750442, rate: 0.103 },
      { min: 750443, max: 1250738, rate: 0.113 },
      { min: 1250739, max: null, rate: 0.123 }
    ]
  },
  'New York': {
    'single': [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8501, max: 11700, rate: 0.045 },
      { min: 11701, max: 13900, rate: 0.0525 },
      { min: 13901, max: 21400, rate: 0.055 },
      { min: 21401, max: 80650, rate: 0.0585 },
      { min: 80651, max: 215400, rate: 0.0625 },
      { min: 215401, max: 1077550, rate: 0.0685 },
      { min: 1077551, max: null, rate: 0.0882 }
    ],
    'married': [
      { min: 0, max: 17150, rate: 0.04 },
      { min: 17151, max: 23600, rate: 0.045 },
      { min: 23601, max: 27900, rate: 0.0525 },
      { min: 27901, max: 43000, rate: 0.055 },
      { min: 43001, max: 161550, rate: 0.0585 },
      { min: 161551, max: 323200, rate: 0.0625 },
      { min: 323201, max: 2155350, rate: 0.0685 },
      { min: 2155351, max: null, rate: 0.0882 }
    ],
    'marriedSeparate': [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8501, max: 11700, rate: 0.045 },
      { min: 11701, max: 13900, rate: 0.0525 },
      { min: 13901, max: 21400, rate: 0.055 },
      { min: 21401, max: 80650, rate: 0.0585 },
      { min: 80651, max: 215400, rate: 0.0625 },
      { min: 215401, max: 1077550, rate: 0.0685 },
      { min: 1077551, max: null, rate: 0.0882 }
    ],
    'headOfHousehold': [
      { min: 0, max: 12800, rate: 0.04 },
      { min: 12801, max: 17650, rate: 0.045 },
      { min: 17651, max: 20900, rate: 0.0525 },
      { min: 20901, max: 32200, rate: 0.055 },
      { min: 32201, max: 107650, rate: 0.0585 },
      { min: 107651, max: 269300, rate: 0.0625 },
      { min: 269301, max: 1616450, rate: 0.0685 },
      { min: 1616451, max: null, rate: 0.0882 }
    ],
    'qualifiedWidow': [
      { min: 0, max: 17150, rate: 0.04 },
      { min: 17151, max: 23600, rate: 0.045 },
      { min: 23601, max: 27900, rate: 0.0525 },
      { min: 27901, max: 43000, rate: 0.055 },
      { min: 43001, max: 161550, rate: 0.0585 },
      { min: 161551, max: 323200, rate: 0.0625 },
      { min: 323201, max: 2155350, rate: 0.0685 },
      { min: 2155351, max: null, rate: 0.0882 }
    ]
  },
  'Texas': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }],
    'qualifiedWidow': [{ min: 0, max: null, rate: 0 }]
  },
  'Florida': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }],
    'qualifiedWidow': [{ min: 0, max: null, rate: 0 }]
  },
  'Illinois': {
    'single': [{ min: 0, max: null, rate: 0.0495 }],
    'married': [{ min: 0, max: null, rate: 0.0495 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0495 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0495 }],
    'qualifiedWidow': [{ min: 0, max: null, rate: 0.0495 }]
  },
  'Pennsylvania': {
    'single': [{ min: 0, max: null, rate: 0.0307 }],
    'married': [{ min: 0, max: null, rate: 0.0307 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0307 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0307 }],
    'qualifiedWidow': [{ min: 0, max: null, rate: 0.0307 }]
  },
  'Ohio': {
    'single': [
      { min: 0, max: 25000, rate: 0 },
      { min: 25001, max: 44250, rate: 0.02765 },
      { min: 44251, max: 88450, rate: 0.03226 },
      { min: 88451, max: 110650, rate: 0.03688 },
      { min: 110651, max: null, rate: 0.0399 }
    ],
    'married': [
      { min: 0, max: 25000, rate: 0 },
      { min: 25001, max: 44250, rate: 0.02765 },
      { min: 44251, max: 88450, rate: 0.03226 },
      { min: 88451, max: 110650, rate: 0.03688 },
      { min: 110651, max: null, rate: 0.0399 }
    ],
    'marriedSeparate': [
      { min: 0, max: 12500, rate: 0 },
      { min: 12501, max: 22125, rate: 0.02765 },
      { min: 22126, max: 44225, rate: 0.03226 },
      { min: 44226, max: 55325, rate: 0.03688 },
      { min: 55326, max: null, rate: 0.0399 }
    ],
    'headOfHousehold': [
      { min: 0, max: 25000, rate: 0 },
      { min: 25001, max: 44250, rate: 0.02765 },
      { min: 44251, max: 88450, rate: 0.03226 },
      { min: 88451, max: 110650, rate: 0.03688 },
      { min: 110651, max: null, rate: 0.0399 }
    ],
    'qualifiedWidow': [
      { min: 0, max: 25000, rate: 0 },
      { min: 25001, max: 44250, rate: 0.02765 },
      { min: 44251, max: 88450, rate: 0.03226 },
      { min: 88451, max: 110650, rate: 0.03688 },
      { min: 110651, max: null, rate: 0.0399 }
    ]
  },
  'Michigan': {
    'single': [{ min: 0, max: null, rate: 0.0405 }],
    'married': [{ min: 0, max: null, rate: 0.0405 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0405 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0405 }],
    'qualifiedWidow': [{ min: 0, max: null, rate: 0.0405 }]
  },
  'Georgia': {
    'single': [
      { min: 0, max: 7000, rate: 0.01 },
      { min: 7001, max: 14000, rate: 0.02 },
      { min: 14001, max: 21000, rate: 0.03 },
      { min: 21001, max: 28000, rate: 0.04 },
      { min: 28001, max: null, rate: 0.0575 }
    ],
    'married': [
      { min: 0, max: 1000, rate: 0.01 },
      { min: 1001, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 7000, rate: 0.04 },
      { min: 7001, max: 10000, rate: 0.05 },
      { min: 10001, max: null, rate: 0.0575 }
    ],
    'marriedSeparate': [
      { min: 0, max: 500, rate: 0.01 },
      { min: 501, max: 1500, rate: 0.02 },
      { min: 1501, max: 2500, rate: 0.03 },
      { min: 2501, max: 3500, rate: 0.04 },
      { min: 3501, max: 5000, rate: 0.05 },
      { min: 5001, max: null, rate: 0.0575 }
    ],
    'headOfHousehold': [
      { min: 0, max: 7000, rate: 0.01 },
      { min: 7001, max: 14000, rate: 0.02 },
      { min: 14001, max: 21000, rate: 0.03 },
      { min: 21001, max: 28000, rate: 0.04 },
      { min: 28001, max: null, rate: 0.0575 }
    ],
    'qualifiedWidow': [
      { min: 0, max: 1000, rate: 0.01 },
      { min: 1001, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 7000, rate: 0.04 },
      { min: 7001, max: 10000, rate: 0.05 },
      { min: 10001, max: null, rate: 0.0575 }
    ]
  },
};

// Calculate state taxes
export const calculateStateTaxes = (inputs: StateTaxInputs): StateTaxResults | null => {
  const { income, filingStatus, deductions, useStandardDeduction, state, withholding = 0, selectedDeductions = [] } = inputs;
  
  // If state has no income tax
  if (!stateTaxBrackets[state] || !stateStandardDeductions[state]) {
    return null;
  }

  const brackets = stateTaxBrackets[state][filingStatus];
  const standardDeduction = stateStandardDeductions[state][filingStatus];
  
  // Calculate deduction amount
  let deductionAmount = useStandardDeduction ? standardDeduction : deductions;
  
  // Add selected deductions
  const selectedDeductionsTotal = selectedDeductions.reduce((total, deduction) => total + deduction.amount, 0);
  deductionAmount += selectedDeductionsTotal;
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, income - deductionAmount);
  
  // Calculate tax amount
  let taxAmount = 0;
  let bracketBreakdown: Array<{rate: number; amount: number; rangeStart: number; rangeEnd: number}> = [];
  let marginRate = 0;
  
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const nextBracket = brackets[i + 1];
    
    const rangeStart = bracket.min;
    const rangeEnd = bracket.max !== null ? bracket.max : Infinity;
    const rate = bracket.rate;
    
    if (taxableIncome > rangeStart) {
      const taxableAmountInBracket = Math.min(taxableIncome, rangeEnd) - rangeStart;
      const taxForBracket = taxableAmountInBracket * rate;
      
      taxAmount += taxForBracket;
      
      bracketBreakdown.push({
        rate,
        amount: taxForBracket,
        rangeStart,
        rangeEnd
      });
      
      // Set marginal tax rate based on highest applicable bracket
      if (taxableIncome >= rangeStart) {
        marginRate = rate;
      }
    }
  }
  
  // Calculate effective tax rate
  const effectiveRate = taxableIncome > 0 ? taxAmount / taxableIncome : 0;
  
  // Calculate refund or owed amount
  const refundOrOwed = withholding - taxAmount;
  
  return {
    taxableIncome,
    taxAmount,
    effectiveRate,
    effectiveTaxRate: effectiveRate, // Match TaxResults property name
    marginRate,
    marginalRate: marginRate, // Match TaxResults property name
    filingStatus,
    standardDeduction,
    brackets,
    selectedDeductionsTotal,
    bracketBreakdown,
    taxLiability: taxAmount, // Add taxLiability field to match TaxResults
    refundOrOwed,
    deductionAmount
  };
};

/**
 * Get state-specific deduction information
 */
export const getStateDeductionInfo = (income: number, filingStatus: FilingStatus, state: string): DeductionInfo[] => {
  // Return empty array for states with no income tax
  if (!stateTaxBrackets[state] || !stateTaxBrackets[state][filingStatus]) {
    return [];
  }
  
  // Otherwise, return state-specific deductions
  // This is a simplified example - real implementation would have state-specific logic
  const deductions: DeductionInfo[] = [
    {
      id: `${state.toLowerCase()}-property-tax`,
      name: `${state} Property Tax`,
      description: `Deduction for property taxes paid in ${state}`,
      eligibleAmount: income * 0.02,
      eligibilityMessage: `You may be eligible for property tax deductions in ${state}.`,
      icon: 'home'
    },
    {
      id: `${state.toLowerCase()}-education`,
      name: `${state} Education Expenses`,
      description: `Deduction for education expenses in ${state}`,
      eligibleAmount: income * 0.01,
      eligibilityMessage: `You may be eligible for education expense deductions in ${state}.`,
      icon: 'graduation-cap'
    }
  ];
  
  // For high-tax states, add additional deductions
  if (['California', 'New York', 'New Jersey', 'Massachusetts'].includes(state)) {
    deductions.push({
      id: `${state.toLowerCase()}-commuter`,
      name: `${state} Commuter Benefits`,
      description: `Deduction for commuting expenses in ${state}`,
      eligibleAmount: 2500,
      eligibilityMessage: `Residents of ${state} may qualify for commuter benefit deductions.`,
      icon: 'globe'
    });
  }
  
  return deductions;
};
