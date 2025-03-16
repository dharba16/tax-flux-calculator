
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

// States with no income tax based on the new information
const NO_INCOME_TAX_STATES = [
  'Alaska', 'Florida', 'Nevada', 'New Hampshire', 'South Dakota', 
  'Tennessee', 'Texas', 'Washington', 'Wyoming'
];

// States with flat tax rates based on the new information
const FLAT_TAX_STATES = [
  'Arizona', 'Colorado', 'Idaho', 'Illinois', 'Indiana',
  'Iowa', 'Kentucky', 'Massachusetts', 'Michigan', 'Mississippi',
  'North Carolina', 'Pennsylvania', 'Utah'
];

// State Tax Brackets for 2023 - updated from image
const STATE_TAX_BRACKETS = {
  // States with graduated tax rates
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
  "District of Columbia": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 10000, rate: 0.04 },
      { min: 10001, max: 40000, rate: 0.06 },
      { min: 40001, max: 60000, rate: 0.065 },
      { min: 60001, max: 250000, rate: 0.085 },
      { min: 250001, max: 500000, rate: 0.0925 },
      { min: 500001, max: 1000000, rate: 0.0975 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
    married: [
      { min: 0, max: 10000, rate: 0.04 },
      { min: 10001, max: 40000, rate: 0.06 },
      { min: 40001, max: 60000, rate: 0.065 },
      { min: 60001, max: 250000, rate: 0.085 },
      { min: 250001, max: 500000, rate: 0.0925 },
      { min: 500001, max: 1000000, rate: 0.0975 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
    headOfHousehold: [
      { min: 0, max: 10000, rate: 0.04 },
      { min: 10001, max: 40000, rate: 0.06 },
      { min: 40001, max: 60000, rate: 0.065 },
      { min: 60001, max: 250000, rate: 0.085 },
      { min: 250001, max: 500000, rate: 0.0925 },
      { min: 500001, max: 1000000, rate: 0.0975 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
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
      { min: 35731, max: Infinity, rate: 0.0684 }
    ],
    married: [
      { min: 0, max: 7370, rate: 0.0246 },
      { min: 7371, max: 44330, rate: 0.0351 },
      { min: 44331, max: 71450, rate: 0.0501 },
      { min: 71451, max: Infinity, rate: 0.0684 }
    ],
    headOfHousehold: [
      { min: 0, max: 6860, rate: 0.0246 },
      { min: 6861, max: 37950, rate: 0.0351 },
      { min: 37951, max: 59750, rate: 0.0501 },
      { min: 59751, max: Infinity, rate: 0.0684 }
    ],
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
      { min: 500001, max: 1000000, rate: 0.0897 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
    headOfHousehold: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 50000, rate: 0.0175 },
      { min: 50001, max: 70000, rate: 0.035 },
      { min: 70001, max: 80000, rate: 0.05525 },
      { min: 80001, max: 150000, rate: 0.0637 },
      { min: 150001, max: 500000, rate: 0.0897 },
      { min: 500001, max: 1000000, rate: 0.0897 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
  },
  "New Mexico": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 5500, rate: 0.017 },
      { min: 5501, max: 11000, rate: 0.032 },
      { min: 11001, max: 16000, rate: 0.047 },
      { min: 16001, max: 210000, rate: 0.059 },
      { min: 210001, max: Infinity, rate: 0.059 }
    ],
    married: [
      { min: 0, max: 8000, rate: 0.017 },
      { min: 8001, max: 16000, rate: 0.032 },
      { min: 16001, max: 24000, rate: 0.047 },
      { min: 24001, max: 315000, rate: 0.059 },
      { min: 315001, max: Infinity, rate: 0.059 }
    ],
    headOfHousehold: [
      { min: 0, max: 8000, rate: 0.017 },
      { min: 8001, max: 16000, rate: 0.032 },
      { min: 16001, max: 24000, rate: 0.047 },
      { min: 24001, max: 315000, rate: 0.059 },
      { min: 315001, max: Infinity, rate: 0.059 }
    ],
  },
  "New York": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8501, max: 11700, rate: 0.045 },
      { min: 11701, max: 13900, rate: 0.0525 },
      { min: 13901, max: 80650, rate: 0.0585 },
      { min: 80651, max: 215400, rate: 0.0625 },
      { min: 215401, max: 1077550, rate: 0.0685 },
      { min: 1077551, max: 5000000, rate: 0.0965 },
      { min: 5000001, max: 25000000, rate: 0.103 },
      { min: 25000001, max: Infinity, rate: 0.109 }
    ],
    married: [
      { min: 0, max: 17150, rate: 0.04 },
      { min: 17151, max: 23600, rate: 0.045 },
      { min: 23601, max: 27900, rate: 0.0525 },
      { min: 27901, max: 161550, rate: 0.0585 },
      { min: 161551, max: 323200, rate: 0.0625 },
      { min: 323201, max: 2155350, rate: 0.0685 },
      { min: 2155351, max: 5000000, rate: 0.0965 },
      { min: 5000001, max: 25000000, rate: 0.103 },
      { min: 25000001, max: Infinity, rate: 0.109 }
    ],
    headOfHousehold: [
      { min: 0, max: 12800, rate: 0.04 },
      { min: 12801, max: 17650, rate: 0.045 },
      { min: 17651, max: 20900, rate: 0.0525 },
      { min: 20901, max: 107650, rate: 0.0585 },
      { min: 107651, max: 269300, rate: 0.0625 },
      { min: 269301, max: 1616450, rate: 0.0685 },
      { min: 1616451, max: 5000000, rate: 0.0965 },
      { min: 5000001, max: 25000000, rate: 0.103 },
      { min: 25000001, max: Infinity, rate: 0.109 }
    ],
  },
  "North Dakota": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 40525, rate: 0.011 },
      { min: 40526, max: 98100, rate: 0.0204 },
      { min: 98101, max: 204675, rate: 0.0227 },
      { min: 204676, max: 445000, rate: 0.0264 },
      { min: 445001, max: Infinity, rate: 0.029 }
    ],
    married: [
      { min: 0, max: 67700, rate: 0.011 },
      { min: 67701, max: 163550, rate: 0.0204 },
      { min: 163551, max: 249150, rate: 0.0227 },
      { min: 249151, max: 445000, rate: 0.0264 },
      { min: 445001, max: Infinity, rate: 0.029 }
    ],
    headOfHousehold: [
      { min: 0, max: 54300, rate: 0.011 },
      { min: 54301, max: 140200, rate: 0.0204 },
      { min: 140201, max: 226850, rate: 0.0227 },
      { min: 226851, max: 445000, rate: 0.0264 },
      { min: 445001, max: Infinity, rate: 0.029 }
    ],
  },
  "Ohio": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 25000, rate: 0.0 },
      { min: 25001, max: 44250, rate: 0.0277 },
      { min: 44251, max: 88450, rate: 0.0323 },
      { min: 88451, max: 110650, rate: 0.0369 },
      { min: 110651, max: Infinity, rate: 0.0399 }
    ],
    married: [
      { min: 0, max: 25000, rate: 0.0 },
      { min: 25001, max: 44250, rate: 0.0277 },
      { min: 44251, max: 88450, rate: 0.0323 },
      { min: 88451, max: 110650, rate: 0.0369 },
      { min: 110651, max: Infinity, rate: 0.0399 }
    ],
    headOfHousehold: [
      { min: 0, max: 25000, rate: 0.0 },
      { min: 25001, max: 44250, rate: 0.0277 },
      { min: 44251, max: 88450, rate: 0.0323 },
      { min: 88451, max: 110650, rate: 0.0369 },
      { min: 110651, max: Infinity, rate: 0.0399 }
    ],
  },
  "Oklahoma": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 1000, rate: 0.0025 },
      { min: 1001, max: 2500, rate: 0.0075 },
      { min: 2501, max: 3750, rate: 0.0175 },
      { min: 3751, max: 4900, rate: 0.0275 },
      { min: 4901, max: 7200, rate: 0.0375 },
      { min: 7201, max: Infinity, rate: 0.0475 }
    ],
    married: [
      { min: 0, max: 2000, rate: 0.0025 },
      { min: 2001, max: 5000, rate: 0.0075 },
      { min: 5001, max: 7500, rate: 0.0175 },
      { min: 7501, max: 9800, rate: 0.0275 },
      { min: 9801, max: 12200, rate: 0.0375 },
      { min: 12201, max: Infinity, rate: 0.0475 }
    ],
    headOfHousehold: [
      { min: 0, max: 2000, rate: 0.0025 },
      { min: 2001, max: 5000, rate: 0.0075 },
      { min: 5001, max: 7500, rate: 0.0175 },
      { min: 7501, max: 9800, rate: 0.0275 },
      { min: 9801, max: 12200, rate: 0.0375 },
      { min: 12201, max: Infinity, rate: 0.0475 }
    ],
  },
  "Oregon": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3650, rate: 0.0475 },
      { min: 3651, max: 9200, rate: 0.0675 },
      { min: 9201, max: 125000, rate: 0.0875 },
      { min: 125001, max: Infinity, rate: 0.099 }
    ],
    married: [
      { min: 0, max: 7300, rate: 0.0475 },
      { min: 7301, max: 18400, rate: 0.0675 },
      { min: 18401, max: 250000, rate: 0.0875 },
      { min: 250001, max: Infinity, rate: 0.099 }
    ],
    headOfHousehold: [
      { min: 0, max: 7300, rate: 0.0475 },
      { min: 7301, max: 18400, rate: 0.0675 },
      { min: 18401, max: 250000, rate: 0.0875 },
      { min: 250001, max: Infinity, rate: 0.099 }
    ],
  },
  "Rhode Island": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 70300, rate: 0.0375 },
      { min: 70301, max: 160600, rate: 0.0475 },
      { min: 160601, max: Infinity, rate: 0.0599 }
    ],
    married: [
      { min: 0, max: 70300, rate: 0.0375 },
      { min: 70301, max: 160600, rate: 0.0475 },
      { min: 160601, max: Infinity, rate: 0.0599 }
    ],
    headOfHousehold: [
      { min: 0, max: 70300, rate: 0.0375 },
      { min: 70301, max: 160600, rate: 0.0475 },
      { min: 160601, max: Infinity, rate: 0.0599 }
    ],
  },
  "South Carolina": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3200, rate: 0.0 },
      { min: 3201, max: 6410, rate: 0.03 },
      { min: 6411, max: 9620, rate: 0.04 },
      { min: 9621, max: 12820, rate: 0.05 },
      { min: 12821, max: 16040, rate: 0.06 },
      { min: 16041, max: Infinity, rate: 0.068 }
    ],
    married: [
      { min: 0, max: 3200, rate: 0.0 },
      { min: 3201, max: 6410, rate: 0.03 },
      { min: 6411, max: 9620, rate: 0.04 },
      { min: 9621, max: 12820, rate: 0.05 },
      { min: 12821, max: 16040, rate: 0.06 },
      { min: 16041, max: Infinity, rate: 0.068 }
    ],
    headOfHousehold: [
      { min: 0, max: 3200, rate: 0.0 },
      { min: 3201, max: 6410, rate: 0.03 },
      { min: 6411, max: 9620, rate: 0.04 },
      { min: 9621, max: 12820, rate: 0.05 },
      { min: 12821, max: 16040, rate: 0.06 },
      { min: 16041, max: Infinity, rate: 0.068 }
    ],
  },
  "Vermont": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 43500, rate: 0.0335 },
      { min: 43501, max: 105500, rate: 0.066 },
      { min: 105501, max: 199500, rate: 0.076 },
      { min: 199501, max: Infinity, rate: 0.0875 }
    ],
    married: [
      { min: 0, max: 73100, rate: 0.0335 },
      { min: 73101, max: 176000, rate: 0.066 },
      { min: 176001, max: 231450, rate: 0.076 },
      { min: 231451, max: Infinity, rate: 0.0875 }
    ],
    headOfHousehold: [
      { min: 0, max: 58600, rate: 0.0335 },
      { min: 58601, max: 145600, rate: 0.066 },
      { min: 145601, max: 207600, rate: 0.076 },
      { min: 207601, max: Infinity, rate: 0.0875 }
    ],
  },
  "Virginia": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 17000, rate: 0.05 },
      { min: 17001, max: Infinity, rate: 0.0575 }
    ],
    married: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 17000, rate: 0.05 },
      { min: 17001, max: Infinity, rate: 0.0575 }
    ],
    headOfHousehold: [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 17000, rate: 0.05 },
      { min: 17001, max: Infinity, rate: 0.0575 }
    ],
  },
  "West Virginia": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10001, max: 25000, rate: 0.04 },
      { min: 25001, max: 40000, rate: 0.045 },
      { min: 40001, max: 60000, rate: 0.06 },
      { min: 60001, max: Infinity, rate: 0.065 }
    ],
    married: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10001, max: 25000, rate: 0.04 },
      { min: 25001, max: 40000, rate: 0.045 },
      { min: 40001, max: 60000, rate: 0.06 },
      { min: 60001, max: Infinity, rate: 0.065 }
    ],
    headOfHousehold: [
      { min: 0, max: 10000, rate: 0.03 },
      { min: 10001, max: 25000, rate: 0.04 },
      { min: 25001, max: 40000, rate: 0.045 },
      { min: 40001, max: 60000, rate: 0.06 },
      { min: 60001, max: Infinity, rate: 0.065 }
    ],
  },
  "Wisconsin": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 12760, rate: 0.0354 },
      { min: 12761, max: 25520, rate: 0.0465 },
      { min: 25521, max: 280950, rate: 0.0627 },
      { min: 280951, max: Infinity, rate: 0.0765 }
    ],
    married: [
      { min: 0, max: 17010, rate: 0.0354 },
      { min: 17011, max: 34030, rate: 0.0465 },
      { min: 34031, max: 374030, rate: 0.0627 },
      { min: 374031, max: Infinity, rate: 0.0765 }
    ],
    headOfHousehold: [
      { min: 0, max: 12760, rate: 0.0354 },
      { min: 12761, max: 25520, rate: 0.0465 },
      { min: 25521, max: 280950, rate: 0.0627 },
      { min: 280951, max: Infinity, rate: 0.0765 }
    ],
  },

  // Add flat tax states with a single bracket
  "Arizona": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.024 }],
    married: [{ min: 0, max: Infinity, rate: 0.024 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.024 }],
  },
  "Colorado": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.043 }],
    married: [{ min: 0, max: Infinity, rate: 0.043 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.043 }],
  },
  "Idaho": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0573 }],
    married: [{ min: 0, max: Infinity, rate: 0.0573 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0573 }],
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
    single: [{ min: 0, max: Infinity, rate: 0.0375 }],
    married: [{ min: 0, max: Infinity, rate: 0.0375 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0375 }],
  },
  "Kentucky": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.042 }],
    married: [{ min: 0, max: Infinity, rate: 0.042 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.042 }],
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
  "Mississippi": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.04 }],
    married: [{ min: 0, max: Infinity, rate: 0.04 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.04 }],
  },
  "North Carolina": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0475 }],
    married: [{ min: 0, max: Infinity, rate: 0.0475 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0475 }],
  },
  "Pennsylvania": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0307 }],
    married: [{ min: 0, max: Infinity, rate: 0.0307 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0307 }],
  },
  "Utah": {
    type: TAX_TYPES.Flat,
    single: [{ min: 0, max: Infinity, rate: 0.0425 }],
    married: [{ min: 0, max: Infinity, rate: 0.0425 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0.0425 }],
  },

  // Add no income tax states with empty brackets and a 0 rate
  "Alaska": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "Florida": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
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
  "South Dakota": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
  "Tennessee": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
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
  },
  "Wyoming": {
    type: TAX_TYPES.NoIncomeTax,
    single: [{ min: 0, max: Infinity, rate: 0 }],
    married: [{ min: 0, max: Infinity, rate: 0 }],
    headOfHousehold: [{ min: 0, max: Infinity, rate: 0 }],
  },
};

// State standard deduction amounts (simplified)
const STATE_STANDARD_DEDUCTIONS = {
  "Alabama": { single: 2500, married: 7500, headOfHousehold: 4700 },
  "Arizona": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Arkansas": { single: 2200, married: 4400, headOfHousehold: 2200 },
  "California": { single: 5202, married: 10404, headOfHousehold: 10404 },
  "Colorado": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Connecticut": { single: 0, married: 0, headOfHousehold: 0 }, // Uses federal AGI with modifications
  "Delaware": { single: 3250, married: 6500, headOfHousehold: 3250 },
  "District of Columbia": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Georgia": { single: 5400, married: 7100, headOfHousehold: 7100 },
  "Hawaii": { single: 2200, married: 4400, headOfHousehold: 3212 },
  "Idaho": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Illinois": { single: 2375, married: 4750, headOfHousehold: 2375 },
  "Indiana": { single: 1000, married: 2000, headOfHousehold: 1000 },
  "Iowa": { single: 2210, married: 5450, headOfHousehold: 5450 },
  "Kansas": { single: 3500, married: 8000, headOfHousehold: 6000 },
  "Kentucky": { single: 2770, married: 5530, headOfHousehold: 2770 },
  "Louisiana": { single: 4500, married: 9000, headOfHousehold: 9000 },
  "Maine": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Maryland": { single: 2400, married: 4850, headOfHousehold: 2400 },
  "Massachusetts": { single: 5000, married: 10000, headOfHousehold: 5000 },
  "Michigan": { single: 5000, married: 10000, headOfHousehold: 5000 },
  "Minnesota": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Mississippi": { single: 6000, married: 12000, headOfHousehold: 8000 },
  "Missouri": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Montana": { single: 5450, married: 10900, headOfHousehold: 5450 },
  "Nebraska": { single: 7350, married: 14700, headOfHousehold: 10850 },
  "New Jersey": { single: 0, married: 0, headOfHousehold: 0 }, // No standard deduction
  "New Mexico": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "New York": { single: 8000, married: 16050, headOfHousehold: 11200 },
  "North Carolina": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "North Dakota": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Ohio": { single: 0, married: 0, headOfHousehold: 0 }, // No standard deduction
  "Oklahoma": { single: 6350, married: 12700, headOfHousehold: 9350 },
  "Oregon": { single: 2420, married: 4840, headOfHousehold: 2420 },
  "Pennsylvania": { single: 0, married: 0, headOfHousehold: 0 }, // No standard deduction
  "Rhode Island": { single: 9300, married: 18600, headOfHousehold: 14800 },
  "South Carolina": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Utah": { single: 0, married: 0, headOfHousehold: 0 }, // No standard deduction
  "Vermont": { single: 6500, married: 13000, headOfHousehold: 9800 },
  "Virginia": { single: 4500, married: 9000, headOfHousehold: 4500 },
  "West Virginia": { single: 12950, married: 25900, headOfHousehold: 19400 },
  "Wisconsin": { single: 11900, married: 22000, headOfHousehold: 15630 },
};

/**
 * Calculates state income tax
 * @param inputs Tax calculation inputs
 * @returns Tax calculation results or null if the state has no income tax
 */
export const calculateStateTaxes = (inputs: StateTaxInputs): StateTaxResults | null => {
  const { income, filingStatus, deductions, useStandardDeduction, state, withholding = 0 } = inputs;
  
  // Check if the state has no income tax
  if (NO_INCOME_TAX_STATES.includes(state)) {
    return null;
  }
  
  // Get state tax brackets based on the state and filing status
  const brackets = STATE_TAX_BRACKETS[state]?.[filingStatus.toLowerCase()] || [];
  
  if (!brackets || brackets.length === 0) {
    console.error(`No tax brackets found for ${state} with filing status ${filingStatus}`);
    return null;
  }
  
  // Get standard deduction for the state
  const stateStandardDeduction = STATE_STANDARD_DEDUCTIONS[state]?.[filingStatus.toLowerCase()] || 0;
  
  // Calculate taxable income
  const deductionAmount = useStandardDeduction ? stateStandardDeduction : deductions;
  const taxableIncome = Math.max(0, income - deductionAmount);
  
  // Calculate tax by bracket
  let taxLiability = 0;
  let marginalRate = 0;
  const bracketBreakdown = [];
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      // Amount of income in this bracket
      const amountInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
      const taxForBracket = amountInBracket * bracket.rate;
      
      taxLiability += taxForBracket;
      marginalRate = bracket.rate; // The last rate used is the marginal rate
      
      // Add this bracket to the breakdown
      bracketBreakdown.push({
        rate: bracket.rate,
        amount: taxForBracket,
        rangeStart: bracket.min,
        rangeEnd: bracket.max
      });
    }
  }
  
  // Calculate effective tax rate
  const effectiveTaxRate = taxableIncome > 0 ? taxLiability / taxableIncome : 0;
  
  // Calculate refund or tax owed
  const refundOrOwed = withholding - taxLiability;
  
  return {
    taxableIncome,
    taxLiability,
    effectiveTaxRate,
    marginalRate,
    deductionAmount,
    refundOrOwed,
    bracketBreakdown
  };
};

/**
 * Gets a list of eligible state deductions
 */
export const getStateEligibleDeductions = (income: number, filingStatus: FilingStatus, state: string): DeductionInfo[] => {
  // This is a simplified list of state-specific deductions
  // In a real application, this would be much more comprehensive
  
  // If state has no income tax, return empty array
  if (NO_INCOME_TAX_STATES.includes(state)) {
    return [];
  }
  
  const deductions: DeductionInfo[] = [];
  
  // Example state-specific deductions
  if (state === "California") {
    deductions.push({
      id: "ca-student-loan",
      name: "CA Student Loan Interest",
      description: "California allows deduction for student loan interest.",
      eligibilityMessage: "Available for qualified education loans.",
      icon: "graduation-cap",
      eligible: income < 80000,
      eligibleAmount: income < 80000 ? 2500 : 0
    });
    
    deductions.push({
      id: "ca-medical",
      name: "CA Medical Expenses",
      description: "California allows deduction for significant medical expenses.",
      eligibilityMessage: "Medical expenses exceeding 7.5% of your income may be deductible.",
      icon: "heart-pulse",
      eligible: true,
      eligibleAmount: Math.max(0, 0.075 * income)
    });
  }
  
  if (state === "New York") {
    deductions.push({
      id: "ny-college-tuition",
      name: "NY College Tuition Credit",
      description: "New York offers a tuition credit for college expenses.",
      eligibilityMessage: "Available for qualified tuition expenses up to $10,000.",
      icon: "graduation-cap",
      eligible: true,
      eligibleAmount: 10000
    });
  }
  
  if (["California", "New York", "Massachusetts", "Oregon"].includes(state)) {
    deductions.push({
      id: `${state.toLowerCase()}-child-care`,
      name: `${state} Child Care Credit`,
      description: `${state} offers additional child care credits.`,
      eligibilityMessage: "Available for working parents with children under 13.",
      icon: "baby",
      eligible: income < 100000,
      eligibleAmount: income < 100000 ? 1000 : 0
    });
  }
  
  return deductions;
};
