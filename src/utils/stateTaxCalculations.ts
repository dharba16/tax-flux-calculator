import { FilingStatus } from './taxCalculations';
import { DeductionInfo } from './deductionEligibility';

export interface StateTaxInputs {
  income: number;
  filingStatus: FilingStatus;
  deductions: number;
  useStandardDeduction: boolean;
  state: string;
  withholding?: number; // Making withholding optional with a default
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

// Tax types for state tax calculations
const TAX_TYPES = {
  Graduated: "Graduated",
  Flat: "Flat",
  NoIncomeTax: "No Income Tax"
};

// State Tax Brackets for 2023
const STATE_TAX_BRACKETS = {
  // Existing states from before
  "California": {
    type: TAX_TYPES.Graduated,
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
  "New York": {
    type: TAX_TYPES.Graduated,
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
  
  // New states from the image
  "Alabama": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 501, max: 3000, rate: 0.04 },
      { min: 3001, max: Infinity, rate: 0.05 },
    ],
    married: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 6000, rate: 0.04 },
      { min: 6001, max: Infinity, rate: 0.05 },
    ],
    headOfHousehold: [
      { min: 0, max: 500, rate: 0.02 },
      { min: 501, max: 3000, rate: 0.04 },
      { min: 3001, max: Infinity, rate: 0.05 },
    ],
  },
  "Alaska": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "Arizona": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.025 }],
    married: [{ min: 0, max: Infinity, rate: 0.025 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.025 }],
  },
  "Arkansas": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 4300, rate: 0.02 },
      { min: 4301, max: 8500, rate: 0.04 },
      { min: 8501, max: Infinity, rate: 0.055 }
    ],
    married: [
      { min: 0, max: 4300, rate: 0.02 },
      { min: 4301, max: 8500, rate: 0.04 },
      { min: 8501, max: Infinity, rate: 0.055 }
    ],
    headOfHousehold: [
      { min: 0, max: 4300, rate: 0.02 },
      { min: 4301, max: 8500, rate: 0.04 },
      { min: 8501, max: Infinity, rate: 0.055 }
    ],
  },
  "Colorado": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.044 }],
    married: [{ min: 0, max: Infinity, rate: 0.044 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.044 }],
  },
  "Connecticut": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10001, max: 50000, rate: 0.05 },
      { min: 50001, max: 100000, rate: 0.055 },
      { min: 100001, max: 200000, rate: 0.06 },
      { min: 200001, max: Infinity, rate: 0.069 }
    ],
    married: [
      { min: 0, max: 20000, rate: 0.03 },
      { min: 20001, max: 100000, rate: 0.05 },
      { min: 100001, max: 200000, rate: 0.055 },
      { min: 200001, max: 400000, rate: 0.06 },
      { min: 400001, max: Infinity, rate: 0.069 }
    ],
    headOfHousehold: [
      { min: 0, max: 16000, rate: 0.03 },
      { min: 16001, max: 80000, rate: 0.05 },
      { min: 80001, max: 160000, rate: 0.055 },
      { min: 160001, max: 320000, rate: 0.06 },
      { min: 320001, max: Infinity, rate: 0.069 }
    ],
  },
  "Delaware": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 5000, rate: 0.022 },
      { min: 5001, max: 10000, rate: 0.039 },
      { min: 10001, max: 20000, rate: 0.048 },
      { min: 20001, max: 25000, rate: 0.052 },
      { min: 25001, max: 60000, rate: 0.055 },
      { min: 60001, max: Infinity, rate: 0.066 }
    ],
    married: [
      { min: 0, max: 5000, rate: 0.022 },
      { min: 5001, max: 10000, rate: 0.039 },
      { min: 10001, max: 20000, rate: 0.048 },
      { min: 20001, max: 25000, rate: 0.052 },
      { min: 25001, max: 60000, rate: 0.055 },
      { min: 60001, max: Infinity, rate: 0.066 }
    ],
    headOfHousehold: [
      { min: 0, max: 5000, rate: 0.022 },
      { min: 5001, max: 10000, rate: 0.039 },
      { min: 10001, max: 20000, rate: 0.048 },
      { min: 20001, max: 25000, rate: 0.052 },
      { min: 25001, max: 60000, rate: 0.055 },
      { min: 60001, max: Infinity, rate: 0.066 }
    ],
  },
  "Florida": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "Georgia": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0535 }],
    married: [{ min: 0, max: Infinity, rate: 0.0535 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0535 }],
  },
  "Hawaii": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 2400, rate: 0.014 },
      { min: 2401, max: 4800, rate: 0.032 },
      { min: 4801, max: 9600, rate: 0.055 },
      { min: 9601, max: 14400, rate: 0.064 },
      { min: 14401, max: 19200, rate: 0.068 },
      { min: 19201, max: 24000, rate: 0.072 },
      { min: 24001, max: 36000, rate: 0.076 },
      { min: 36001, max: 48000, rate: 0.079 },
      { min: 48001, max: 150000, rate: 0.0825 },
      { min: 150001, max: 175000, rate: 0.09 },
      { min: 175001, max: 200000, rate: 0.10 },
      { min: 200001, max: Infinity, rate: 0.11 }
    ],
    married: [
      { min: 0, max: 4800, rate: 0.014 },
      { min: 4801, max: 9600, rate: 0.032 },
      { min: 9601, max: 19200, rate: 0.055 },
      { min: 19201, max: 28800, rate: 0.064 },
      { min: 28801, max: 38400, rate: 0.068 },
      { min: 38401, max: 48000, rate: 0.072 },
      { min: 48001, max: 72000, rate: 0.076 },
      { min: 72001, max: 96000, rate: 0.079 },
      { min: 96001, max: 300000, rate: 0.0825 },
      { min: 300001, max: 350000, rate: 0.09 },
      { min: 350001, max: 400000, rate: 0.10 },
      { min: 400001, max: Infinity, rate: 0.11 }
    ],
    headOfHousehold: [
      { min: 0, max: 3600, rate: 0.014 },
      { min: 3601, max: 7200, rate: 0.032 },
      { min: 7201, max: 14400, rate: 0.055 },
      { min: 14401, max: 21600, rate: 0.064 },
      { min: 21601, max: 28800, rate: 0.068 },
      { min: 28801, max: 36000, rate: 0.072 },
      { min: 36001, max: 54000, rate: 0.076 },
      { min: 54001, max: 72000, rate: 0.079 },
      { min: 72001, max: 225000, rate: 0.0825 },
      { min: 225001, max: 262500, rate: 0.09 },
      { min: 262501, max: 300000, rate: 0.10 },
      { min: 300001, max: Infinity, rate: 0.11 }
    ],
  },
  "Idaho": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.058 }],
    married: [{ min: 0, max: Infinity, rate: 0.058 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.058 }],
  },
  "Illinois": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0495 }],
    married: [{ min: 0, max: Infinity, rate: 0.0495 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0495 }],
  },
  "Indiana": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0315 }],
    married: [{ min: 0, max: Infinity, rate: 0.0315 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0315 }],
  },
  "Iowa": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.035 }],
    married: [{ min: 0, max: Infinity, rate: 0.035 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.035 }],
  },
  "Kansas": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15001, max: 30000, rate: 0.057 },
      { min: 30001, max: Infinity, rate: 0.057 }
    ],
    married: [
      { min: 0, max: 30000, rate: 0.031 },
      { min: 30001, max: 60000, rate: 0.057 },
      { min: 60001, max: Infinity, rate: 0.057 }
    ],
    headOfHousehold: [
      { min: 0, max: 15000, rate: 0.031 },
      { min: 15001, max: 30000, rate: 0.057 },
      { min: 30001, max: Infinity, rate: 0.057 }
    ],
  },
  "Kentucky": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.045 }],
    married: [{ min: 0, max: Infinity, rate: 0.045 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.045 }],
  },
  "Louisiana": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12501, max: 50000, rate: 0.035 },
      { min: 50001, max: Infinity, rate: 0.0425 }
    ],
    married: [
      { min: 0, max: 25000, rate: 0.0185 },
      { min: 25001, max: 100000, rate: 0.035 },
      { min: 100001, max: Infinity, rate: 0.0425 }
    ],
    headOfHousehold: [
      { min: 0, max: 12500, rate: 0.0185 },
      { min: 12501, max: 50000, rate: 0.035 },
      { min: 50001, max: Infinity, rate: 0.0425 }
    ],
  },
  "Maine": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 23000, rate: 0.058 },
      { min: 23001, max: 54450, rate: 0.0675 },
      { min: 54451, max: Infinity, rate: 0.0715 }
    ],
    married: [
      { min: 0, max: 46000, rate: 0.058 },
      { min: 46001, max: 108900, rate: 0.0675 },
      { min: 108901, max: Infinity, rate: 0.0715 }
    ],
    headOfHousehold: [
      { min: 0, max: 34500, rate: 0.058 },
      { min: 34501, max: 81700, rate: 0.0675 },
      { min: 81701, max: Infinity, rate: 0.0715 }
    ],
  },
  "Maryland": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 100000, rate: 0.0475 },
      { min: 100001, max: 125000, rate: 0.05 },
      { min: 125001, max: 150000, rate: 0.0525 },
      { min: 150001, max: 250000, rate: 0.055 },
      { min: 250001, max: Infinity, rate: 0.0575 }
    ],
    married: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 150000, rate: 0.0475 },
      { min: 150001, max: 175000, rate: 0.05 },
      { min: 175001, max: 225000, rate: 0.0525 },
      { min: 225001, max: 300000, rate: 0.055 },
      { min: 300001, max: Infinity, rate: 0.0575 }
    ],
    headOfHousehold: [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 150000, rate: 0.0475 },
      { min: 150001, max: 175000, rate: 0.05 },
      { min: 175001, max: 225000, rate: 0.0525 },
      { min: 225001, max: 300000, rate: 0.055 },
      { min: 300001, max: Infinity, rate: 0.0575 }
    ],
  },
  "Massachusetts": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.05 }],
    married: [{ min: 0, max: Infinity, rate: 0.05 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.05 }],
  },
  "Michigan": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0425 }],
    married: [{ min: 0, max: Infinity, rate: 0.0425 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0425 }],
  },
  "Minnesota": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 30070, rate: 0.0535 },
      { min: 30071, max: 98760, rate: 0.068 },
      { min: 98761, max: 183340, rate: 0.0785 },
      { min: 183341, max: Infinity, rate: 0.0985 }
    ],
    married: [
      { min: 0, max: 43950, rate: 0.0535 },
      { min: 43951, max: 174610, rate: 0.068 },
      { min: 174611, max: 304970, rate: 0.0785 },
      { min: 304971, max: Infinity, rate: 0.0985 }
    ],
    headOfHousehold: [
      { min: 0, max: 37010, rate: 0.0535 },
      { min: 37011, max: 136680, rate: 0.068 },
      { min: 136681, max: 244150, rate: 0.0785 },
      { min: 244151, max: Infinity, rate: 0.0985 }
    ],
  },
  "Mississippi": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.05 }],
    married: [{ min: 0, max: Infinity, rate: 0.05 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.05 }],
  },
  "Missouri": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 1000, rate: 0.015 },
      { min: 1001, max: 2000, rate: 0.02 },
      { min: 2001, max: 3000, rate: 0.025 },
      { min: 3001, max: 4000, rate: 0.03 },
      { min: 4001, max: 5000, rate: 0.035 },
      { min: 5001, max: 6000, rate: 0.04 },
      { min: 6001, max: 7000, rate: 0.045 },
      { min: 7001, max: 8000, rate: 0.05 },
      { min: 8001, max: 9000, rate: 0.054 },
      { min: 9001, max: Infinity, rate: 0.054 }
    ],
    married: [
      { min: 0, max: 1000, rate: 0.015 },
      { min: 1001, max: 2000, rate: 0.02 },
      { min: 2001, max: 3000, rate: 0.025 },
      { min: 3001, max: 4000, rate: 0.03 },
      { min: 4001, max: 5000, rate: 0.035 },
      { min: 5001, max: 6000, rate: 0.04 },
      { min: 6001, max: 7000, rate: 0.045 },
      { min: 7001, max: 8000, rate: 0.05 },
      { min: 8001, max: 9000, rate: 0.054 },
      { min: 9001, max: Infinity, rate: 0.054 }
    ],
    headOfHousehold: [
      { min: 0, max: 1000, rate: 0.015 },
      { min: 1001, max: 2000, rate: 0.02 },
      { min: 2001, max: 3000, rate: 0.025 },
      { min: 3001, max: 4000, rate: 0.03 },
      { min: 4001, max: 5000, rate: 0.035 },
      { min: 5001, max: 6000, rate: 0.04 },
      { min: 6001, max: 7000, rate: 0.045 },
      { min: 7001, max: 8000, rate: 0.05 },
      { min: 8001, max: 9000, rate: 0.054 },
      { min: 9001, max: Infinity, rate: 0.054 }
    ],
  },
  "Montana": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3300, rate: 0.01 },
      { min: 3301, max: 5800, rate: 0.02 },
      { min: 5801, max: 8900, rate: 0.03 },
      { min: 8901, max: 12000, rate: 0.04 },
      { min: 12001, max: 15400, rate: 0.05 },
      { min: 15401, max: 19800, rate: 0.06 },
      { min: 19801, max: Infinity, rate: 0.0675 }
    ],
    married: [
      { min: 0, max: 3300, rate: 0.01 },
      { min: 3301, max: 5800, rate: 0.02 },
      { min: 5801, max: 8900, rate: 0.03 },
      { min: 8901, max: 12000, rate: 0.04 },
      { min: 12001, max: 15400, rate: 0.05 },
      { min: 15401, max: 19800, rate: 0.06 },
      { min: 19801, max: Infinity, rate: 0.0675 }
    ],
    headOfHousehold: [
      { min: 0, max: 3300, rate: 0.01 },
      { min: 3301, max: 5800, rate: 0.02 },
      { min: 5801, max: 8900, rate: 0.03 },
      { min: 8901, max: 12000, rate: 0.04 },
      { min: 12001, max: 15400, rate: 0.05 },
      { min: 15401, max: 19800, rate: 0.06 },
      { min: 19801, max: Infinity, rate: 0.0675 }
    ],
  },
  "Nebraska": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3700, rate: 0.0246 },
      { min: 3701, max: 22170, rate: 0.0351 },
      { min: 22171, max: 35730, rate: 0.0501 },
      { min: 35731, max: Infinity, rate: 0.0627 }
    ],
    married: [
      { min: 0, max: 7390, rate: 0.0246 },
      { min: 7391, max: 44330, rate: 0.0351 },
      { min: 44331, max: 71450, rate: 0.0501 },
      { min: 71451, max: Infinity, rate: 0.0627 }
    ],
    headOfHousehold: [
      { min: 0, max: 6860, rate: 0.0246 },
      { min: 6861, max: 36680, rate: 0.0351 },
      { min: 36681, max: 59660, rate: 0.0501 },
      { min: 59661, max: Infinity, rate: 0.0627 }
    ],
  },
  "Nevada": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "New Hampshire": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "New Jersey": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 35000, rate: 0.0175 },
      { min: 35001, max: 40000, rate: 0.035 },
      { min: 40001, max: 75000, rate: 0.05525 },
      { min: 75001, max: 500000, rate: 0.0637 },
      { min: 500001, max: 1000000, rate: 0.0897 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
    married: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 50000, rate: 0.0175 },
      { min: 50001, max: 70000, rate: 0.035 },
      { min: 70001, max: 80000, rate: 0.05525 },
      { min: 80001, max: 150000, rate: 0.0637 },
      { min: 150001, max: 500000, rate: 0.0897 },
      { min: 500001, max: Infinity, rate: 0.1075 }
    ],
    headOfHousehold: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 50000, rate: 0.0175 },
      { min: 50001, max: 70000, rate: 0.035 },
      { min: 70001, max: 80000, rate: 0.05525 },
      { min: 80001, max: 150000, rate: 0.0637 },
      { min: 150001, max: 500000, rate: 0.0897 },
      { min: 500001, max: Infinity, rate: 0.1075 }
    ],
  },
  "New Mexico": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 5500, rate: 0.017 },
      { min: 5501, max: 11000, rate: 0.032 },
      { min: 11001, max: 16000, rate: 0.047 },
      { min: 16001, max: 210000, rate: 0.049 },
      { min: 210001, max: Infinity, rate: 0.059 }
    ],
    married: [
      { min: 0, max: 8000, rate: 0.017 },
      { min: 8001, max: 16000, rate: 0.032 },
      { min: 16001, max: 24000, rate: 0.047 },
      { min: 24001, max: 315000, rate: 0.049 },
      { min: 315001, max: Infinity, rate: 0.059 }
    ],
    headOfHousehold: [
      { min: 0, max: 8000, rate: 0.017 },
      { min: 8001, max: 16000, rate: 0.032 },
      { min: 16001, max: 24000, rate: 0.047 },
      { min: 24001, max: 315000, rate: 0.049 },
      { min: 315001, max: Infinity, rate: 0.059 }
    ],
  },
  "Texas": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "Washington": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  }
};

const STATE_STANDARD_DEDUCTION = {
  "California": {
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
  },
  // Add more state standard deductions as needed
  "Alabama": {
    single: 2500,
    married: 7500,
    headOfHousehold: 4700,
  },
  "Arizona": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400,
  },
  "Arkansas": {
    single: 2200,
    married: 4400,
    headOfHousehold: 2200,
  },
  "Colorado": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400,
  },
  "Connecticut": {
    single: 15000,
    married: 24000,
    headOfHousehold: 19000,
  },
  "Georgia": {
    single: 5400,
    married: 7100,
    headOfHousehold: 7100,
  },
  "Hawaii": {
    single: 2200,
    married: 4400,
    headOfHousehold: 3212,
  },
  "Idaho": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400,
  },
  "Illinois": {
    single: 2425,
    married: 4850,
    headOfHousehold: 2425,
  },
  "Massachusetts": {
    single: 5000,
    married: 10000,
    headOfHousehold: 10000,
  },
  "Maryland": {
    single: 2300,
    married: 4650,
    headOfHousehold: 2300,
  },
  "Michigan": {
    single: 4900,
    married: 9800,
    headOfHousehold: 4900,
  },
  "Minnesota": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400,
  },
};

/**
 * Calculate state taxes based on provided inputs
 */
export function calculateStateTaxes(inputs: StateTaxInputs): StateTaxResults | null {
  const { income, filingStatus, deductions, useStandardDeduction, state, withholding = 0 } = inputs;
  
  // Check if we have tax data for this state
  if (!STATE_TAX_BRACKETS[state]) {
    return {
      taxableIncome: income,
      taxLiability: 0,
      effectiveTaxRate: 0,
      marginalRate: 0,
      deductionAmount: 0,
      refundOrOwed: withholding,
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
  
  // Calculate refund or amount owed, now using the state withholding amount
  const refundOrOwed = withholding - taxLiability;
  
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
  // Georgia-specific deductions
  else if (state === "Georgia") {
    // GA Education Expense Credit
    deductions.push({
      id: 'ga_education_credit',
      name: 'GA Education Expense Credit',
      description: 'Credit for qualified education donations',
      eligibleAmount: filingStatus === 'married' ? 2500 : 1000,
      eligibilityMessage: `You may qualify for up to ${filingStatus === 'married' ? '$2,500' : '$1,000'} credit for donations to qualified education expense organizations.`,
      icon: 'graduation-cap'
    });
  }
  // Maryland-specific deductions
  else if (state === "Maryland") {
    // MD Child Care Expense Credit
    deductions.push({
      id: 'md_childcare_credit',
      name: 'MD Child Care Expense Credit',
      description: 'Credit for child care expenses',
      eligibleAmount: null,
      eligibilityMessage: 'You may qualify for a credit up to $500 per dependent under age 13 for child care expenses.',
      icon: 'baby'
    });
    
    // MD Student Loan Debt Relief Credit
    deductions.push({
      id: 'md_student_loan',
      name: 'MD Student Loan Debt Relief',
      description: 'Credit for student loan debt payments',
      eligibleAmount: 1000,
      eligibilityMessage: 'You may qualify for up to $1,000 credit for student loan debt payments if you meet income requirements.',
      icon: 'graduation-cap'
    });
  }
  // For no-income tax states, explain that there are no deductions
  else if (["Texas", "Florida", "Washington", "Alaska", "Nevada", "New Hampshire"].includes(state)) {
    deductions.push({
      id: 'no_income_tax',
      name: 'No State Income Tax',
      description: `${state} does not have state income tax`,
      eligibleAmount: 0,
      eligibilityMessage: `${state} does not impose a state income tax, so no state tax deductions apply.`,
      icon: 'check'
    });
  }
  // Add generic deductions for states without specific handling
  else {
    deductions.push({
      id: 'state_property_tax',
      name: `${state} Property Tax Deduction`,
      description: 'Deduction for property taxes paid',
      eligibleAmount: null,
      eligibilityMessage: `Many states, including ${state}, allow deductions for property taxes paid.`,
      icon: 'home'
    });
    
    deductions.push({
      id: 'state_charitable',
      name: `${state} Charitable Contribution`,
      description: 'Deduction for charitable donations',
      eligibleAmount: null,
      eligibilityMessage: `Many states, including ${state}, allow deductions for charitable contributions.`,
      icon: 'heart-pulse'
    });
  }
  
  return deductions;
}
