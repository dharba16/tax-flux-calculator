
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
      { min: 0, max: 7390, rate: 0.0246 },
      { min: 7391, max: 44330, rate: 0.0351 },
      { min: 44331, max: 71460, rate: 0.0501 },
      { min: 71461, max: Infinity, rate: 0.0684 }
    ],
    headOfHousehold: [
      { min: 0, max: 6860, rate: 0.0246 },
      { min: 6861, max: 33340, rate: 0.0351 },
      { min: 33341, max: 53600, rate: 0.0501 },
      { min: 53601, max: Infinity, rate: 0.0684 }
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
      { min: 500001, max: 1000000, rate: 0.1075 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
    headOfHousehold: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 50000, rate: 0.0175 },
      { min: 50001, max: 70000, rate: 0.035 },
      { min: 70001, max: 80000, rate: 0.05525 },
      { min: 80001, max: 150000, rate: 0.0637 },
      { min: 150001, max: 500000, rate: 0.0897 },
      { min: 500001, max: 1000000, rate: 0.1075 },
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
      { min: 13901, max: 80650, rate: 0.055 },
      { min: 80651, max: 215400, rate: 0.06 },
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
      { min: 161551, max: 323200, rate: 0.0645 },
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
      { min: 107651, max: 269300, rate: 0.0645 },
      { min: 269301, max: 1616450, rate: 0.0685 },
      { min: 1616451, max: 5000000, rate: 0.0965 },
      { min: 5000001, max: 25000000, rate: 0.103 },
      { min: 25000001, max: Infinity, rate: 0.109 }
    ],
  },
  "North Dakota": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 41775, rate: 0.011 },
      { min: 41776, max: 101050, rate: 0.0204 },
      { min: 101051, max: 210825, rate: 0.0227 },
      { min: 210826, max: 458350, rate: 0.0264 },
      { min: 458351, max: Infinity, rate: 0.029 }
    ],
    married: [
      { min: 0, max: 69700, rate: 0.011 },
      { min: 69701, max: 168550, rate: 0.0204 },
      { min: 168551, max: 256550, rate: 0.0227 },
      { min: 256551, max: 349700, rate: 0.0264 },
      { min: 349701, max: Infinity, rate: 0.029 }
    ],
    headOfHousehold: [
      { min: 0, max: 55900, rate: 0.011 },
      { min: 55901, max: 145600, rate: 0.0204 },
      { min: 145601, max: 221450, rate: 0.0227 },
      { min: 221451, max: 335250, rate: 0.0264 },
      { min: 335251, max: Infinity, rate: 0.029 }
    ],
  },
  "Ohio": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 25000, rate: 0.0285 },
      { min: 25001, max: 44250, rate: 0.03326 },
      { min: 44251, max: 88450, rate: 0.03802 },
      { min: 88451, max: 110650, rate: 0.04413 },
      { min: 110651, max: Infinity, rate: 0.04797 }
    ],
    married: [
      { min: 0, max: 25000, rate: 0.0285 },
      { min: 25001, max: 44250, rate: 0.03326 },
      { min: 44251, max: 88450, rate: 0.03802 },
      { min: 88451, max: 110650, rate: 0.04413 },
      { min: 110651, max: Infinity, rate: 0.04797 }
    ],
    headOfHousehold: [
      { min: 0, max: 25000, rate: 0.0285 },
      { min: 25001, max: 44250, rate: 0.03326 },
      { min: 44251, max: 88450, rate: 0.03802 },
      { min: 88451, max: 110650, rate: 0.04413 },
      { min: 110651, max: Infinity, rate: 0.04797 }
    ],
  },
  "Oklahoma": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 1000, rate: 0.005 },
      { min: 1001, max: 2500, rate: 0.01 },
      { min: 2501, max: 3750, rate: 0.02 },
      { min: 3751, max: 4900, rate: 0.03 },
      { min: 4901, max: 7200, rate: 0.04 },
      { min: 7201, max: Infinity, rate: 0.05 }
    ],
    married: [
      { min: 0, max: 2000, rate: 0.005 },
      { min: 2001, max: 5000, rate: 0.01 },
      { min: 5001, max: 7500, rate: 0.02 },
      { min: 7501, max: 9800, rate: 0.03 },
      { min: 9801, max: 12000, rate: 0.04 },
      { min: 12001, max: Infinity, rate: 0.05 }
    ],
    headOfHousehold: [
      { min: 0, max: 2000, rate: 0.005 },
      { min: 2001, max: 5000, rate: 0.01 },
      { min: 5001, max: 7500, rate: 0.02 },
      { min: 7501, max: 9800, rate: 0.03 },
      { min: 9801, max: 12000, rate: 0.04 },
      { min: 12001, max: Infinity, rate: 0.05 }
    ],
  },
  "Oregon": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3750, rate: 0.0475 },
      { min: 3751, max: 9450, rate: 0.0675 },
      { min: 9451, max: 125000, rate: 0.0875 },
      { min: 125001, max: Infinity, rate: 0.099 }
    ],
    married: [
      { min: 0, max: 7500, rate: 0.0475 },
      { min: 7501, max: 18900, rate: 0.0675 },
      { min: 18901, max: 250000, rate: 0.0875 },
      { min: 250001, max: Infinity, rate: 0.099 }
    ],
    headOfHousehold: [
      { min: 0, max: 3750, rate: 0.0475 },
      { min: 3751, max: 9450, rate: 0.0675 },
      { min: 9451, max: 125000, rate: 0.0875 },
      { min: 125001, max: Infinity, rate: 0.099 }
    ],
  },
  "Rhode Island": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 70300, rate: 0.0375 },
      { min: 70301, max: 160450, rate: 0.0475 },
      { min: 160451, max: Infinity, rate: 0.0599 }
    ],
    married: [
      { min: 0, max: 70300, rate: 0.0375 },
      { min: 70301, max: 160450, rate: 0.0475 },
      { min: 160451, max: Infinity, rate: 0.0599 }
    ],
    headOfHousehold: [
      { min: 0, max: 70300, rate: 0.0375 },
      { min: 70301, max: 160450, rate: 0.0475 },
      { min: 160451, max: Infinity, rate: 0.0599 }
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
      { min: 16041, max: Infinity, rate: 0.07 }
    ],
    married: [
      { min: 0, max: 3200, rate: 0.0 },
      { min: 3201, max: 6410, rate: 0.03 },
      { min: 6411, max: 9620, rate: 0.04 },
      { min: 9621, max: 12820, rate: 0.05 },
      { min: 12821, max: 16040, rate: 0.06 },
      { min: 16041, max: Infinity, rate: 0.07 }
    ],
    headOfHousehold: [
      { min: 0, max: 3200, rate: 0.0 },
      { min: 3201, max: 6410, rate: 0.03 },
      { min: 6411, max: 9620, rate: 0.04 },
      { min: 9621, max: 12820, rate: 0.05 },
      { min: 12821, max: 16040, rate: 0.06 },
      { min: 16041, max: Infinity, rate: 0.07 }
    ],
  },
  "Vermont": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 43500, rate: 0.0335 },
      { min: 43501, max: 105500, rate: 0.066 },
      { min: 105501, max: 200200, rate: 0.076 },
      { min: 200201, max: Infinity, rate: 0.0875 }
    ],
    married: [
      { min: 0, max: 73100, rate: 0.0335 },
      { min: 73101, max: 176000, rate: 0.066 },
      { min: 176001, max: 239500, rate: 0.076 },
      { min: 239501, max: Infinity, rate: 0.0875 }
    ],
    headOfHousehold: [
      { min: 0, max: 58600, rate: 0.0335 },
      { min: 58601, max: 141100, rate: 0.066 },
      { min: 141101, max: 219900, rate: 0.076 },
      { min: 219901, max: Infinity, rate: 0.0875 }
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
};

// Standard deduction amounts for states, if applicable
const STATE_STANDARD_DEDUCTION = {
  "Alabama": {
    single: 2500,
    married: 7500,
    headOfHousehold: 4700
  },
  "Arizona": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Arkansas": {
    single: 2200,
    married: 4400,
    headOfHousehold: 2200
  },
  "California": {
    single: 5202,
    married: 10404,
    headOfHousehold: 10404
  },
  "Colorado": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Connecticut": {
    single: 15000,
    married: 24000,
    headOfHousehold: 19000
  },
  "Delaware": {
    single: 3250,
    married: 6500,
    headOfHousehold: 3250
  },
  "Georgia": {
    single: 5400,
    married: 7100,
    headOfHousehold: 7100
  },
  "Hawaii": {
    single: 2200,
    married: 4400,
    headOfHousehold: 3212
  },
  "Idaho": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Illinois": {
    single: 2425,
    married: 4850,
    headOfHousehold: 2425
  },
  "Indiana": {
    single: 1000,
    married: 2000,
    headOfHousehold: 1000
  },
  "Iowa": {
    single: 2210,
    married: 5450,
    headOfHousehold: 2210
  },
  "Kansas": {
    single: 3500,
    married: 8000,
    headOfHousehold: 6000
  },
  "Kentucky": {
    single: 2770,
    married: 5540,
    headOfHousehold: 2770
  },
  "Louisiana": {
    single: 4500,
    married: 9000,
    headOfHousehold: 4500
  },
  "Maine": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Maryland": {
    single: 2400,
    married: 4850,
    headOfHousehold: 2400
  },
  "Massachusetts": {
    single: 4400,
    married: 8800,
    headOfHousehold: 4400
  },
  "Michigan": {
    single: 4900,
    married: 9800,
    headOfHousehold: 4900
  },
  "Minnesota": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Mississippi": {
    single: 2300,
    married: 4600,
    headOfHousehold: 3400
  },
  "Missouri": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Montana": {
    single: 5140,
    married: 10280,
    headOfHousehold: 5140
  },
  "Nebraska": {
    single: 7350,
    married: 14700,
    headOfHousehold: 10850
  },
  "New Jersey": {
    single: 1000,
    married: 2000,
    headOfHousehold: 1000
  },
  "New Mexico": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "New York": {
    single: 8000,
    married: 16050,
    headOfHousehold: 11200
  },
  "North Carolina": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "North Dakota": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Ohio": {
    single: 2400,
    married: 4800,
    headOfHousehold: 2400
  },
  "Oklahoma": {
    single: 6350,
    married: 12700,
    headOfHousehold: 9350
  },
  "Oregon": {
    single: 2420,
    married: 4840,
    headOfHousehold: 2420
  },
  "Rhode Island": {
    single: 9300,
    married: 18600,
    headOfHousehold: 9300
  },
  "South Carolina": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Utah": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Vermont": {
    single: 6350,
    married: 12700,
    headOfHousehold: 9350
  },
  "Virginia": {
    single: 4500,
    married: 9000,
    headOfHousehold: 4500
  },
  "West Virginia": {
    single: 12950,
    married: 25900,
    headOfHousehold: 19400
  },
  "Wisconsin": {
    single: 11890,
    married: 22010,
    headOfHousehold: 15430
  },
};

// Flat tax rates for 2023
const FLAT_TAX_RATES = {
  "Arizona": 0.025,
  "Colorado": 0.044,
  "Idaho": 0.059,
  "Illinois": 0.0495,
  "Indiana": 0.0323,
  "Iowa": 0.0575,
  "Kentucky": 0.045,
  "Massachusetts": 0.05,
  "Michigan": 0.0425,
  "Mississippi": 0.05,
  "North Carolina": 0.0475,
  "Pennsylvania": 0.0307,
  "Utah": 0.0485
};

// Calculate state tax
export function calculateStateTax(inputs: StateTaxInputs): StateTaxResults | null {
  const { income, filingStatus, deductions, useStandardDeduction, state, withholding = 0 } = inputs;
  
  // Check if the state has income tax
  if (NO_INCOME_TAX_STATES.includes(state)) {
    return null;
  }
  
  // Get standard deduction amount for the state and filing status
  let stateStandardDeduction = 0;
  if (STATE_STANDARD_DEDUCTION[state as keyof typeof STATE_STANDARD_DEDUCTION]) {
    stateStandardDeduction = STATE_STANDARD_DEDUCTION[state as keyof typeof STATE_STANDARD_DEDUCTION][filingStatus];
  }
  
  // Calculate deduction amount
  const deductionAmount = useStandardDeduction ? stateStandardDeduction : deductions;
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, income - deductionAmount);
  
  let taxLiability = 0;
  let marginalRate = 0;
  let bracketBreakdown: Array<{
    rate: number;
    amount: number;
    rangeStart: number;
    rangeEnd: number;
  }> = [];
  
  // Calculate tax based on state tax type
  if (FLAT_TAX_STATES.includes(state)) {
    // Flat tax calculation
    const flatRate = FLAT_TAX_RATES[state as keyof typeof FLAT_TAX_RATES];
    taxLiability = taxableIncome * flatRate;
    marginalRate = flatRate;
    
    // Add bracket information
    bracketBreakdown.push({
      rate: flatRate,
      amount: taxLiability,
      rangeStart: 0,
      rangeEnd: taxableIncome
    });
  } else {
    // Graduated tax calculation
    const brackets = STATE_TAX_BRACKETS[state as keyof typeof STATE_TAX_BRACKETS]?.[filingStatus];
    
    if (brackets) {
      for (const bracket of brackets) {
        if (taxableIncome > bracket.min) {
          const taxableInThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
          const taxAmountForBracket = taxableInThisBracket * bracket.rate;
          taxLiability += taxAmountForBracket;
          marginalRate = bracket.rate;
          
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
    marginalRate,
    deductionAmount,
    refundOrOwed,
    bracketBreakdown
  };
}

// Function to get state-specific deductions
export function getStateDeductionInfo(income: number, filingStatus: FilingStatus, state: string): DeductionInfo[] {
  const deductions: DeductionInfo[] = [];
  
  // Add state-specific deductions based on the selected state
  switch (state) {
    case "California":
      deductions.push({
        id: "ca-renter-credit",
        name: "Renter's Credit",
        description: "Tax credit for individuals who pay rent for their primary residence in California.",
        icon: "Home",
        eligibilityMessage: income <= 87066 ? "You're eligible for the CA Renter's Credit" : "Your income exceeds the threshold",
        eligibleAmount: (filingStatus === 'married' ? 120 : 60)
      });
      deductions.push({
        id: "ca-childcare",
        name: "Child and Dependent Care Credit",
        description: "Credit for childcare expenses for children under 13 or disabled dependents.",
        icon: "Baby",
        eligibilityMessage: income <= 100000 ? "You're eligible for the CA Child Care Credit" : "Your income exceeds the threshold",
        eligibleAmount: income <= 40000 ? 1050 : 525
      });
      break;
    case "New York":
      deductions.push({
        id: "ny-college-tuition",
        name: "College Tuition Credit",
        description: "Credit for qualified college tuition expenses paid for eligible students.",
        icon: "GraduationCap",
        eligibilityMessage: income <= 80000 ? "You're eligible for the NY College Tuition Credit" : "Your income exceeds the threshold",
        eligibleAmount: income <= 80000 ? 400 : 0
      });
      deductions.push({
        id: "ny-property-tax",
        name: "Property Tax Relief Credit",
        description: "Credit for homeowners paying school property taxes.",
        icon: "Building",
        eligibilityMessage: income <= 250000 ? "You're eligible for the NY Property Tax Credit" : "Your income exceeds the threshold",
        eligibleAmount: income <= 75000 ? 350 : 250
      });
      break;
    case "Texas":
      deductions.push({
        id: "tx-no-taxes",
        name: "No State Income Tax",
        description: "Texas doesn't collect state income tax.",
        icon: "Check",
        eligibilityMessage: "Everyone in Texas is exempt from state income tax",
        eligibleAmount: 0
      });
      break;
    case "Florida":
      deductions.push({
        id: "fl-no-taxes",
        name: "No State Income Tax",
        description: "Florida doesn't collect state income tax.",
        icon: "Check",
        eligibilityMessage: "Everyone in Florida is exempt from state income tax",
        eligibleAmount: 0
      });
      break;
    // Add more states as needed
  }
  
  return deductions;
}

// Export wrapper functions to match the naming used in the import statements
export const calculateStateTaxes = calculateStateTax;
export const getStateEligibleDeductions = getStateDeductionInfo;
