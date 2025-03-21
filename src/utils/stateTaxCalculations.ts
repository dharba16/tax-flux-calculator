import { FilingStatus } from './taxCalculations';
import { DeductionInfo } from './deductionEligibility';

export interface StateTaxInputs {
  income: number;
  filingStatus: FilingStatus;
  deductions: number;
  useStandardDeduction: boolean;
  state: string;
  withholding?: number; // Making withholding optional with a default
  selectedDeductions?: Array<{ id: string; amount: number }>; // Support for multiple deductions
}

export interface StateTaxResults {
  taxableIncome: number;
  taxLiability: number;
  effectiveTaxRate: number;
  marginalRate: number;
  deductionAmount: number;
  refundOrOwed: number;
  selectedDeductionsTotal: number; // Added to match TaxResults
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
      { min: 35731, max: Infinity, rate: 0.0664 }
    ],
    married: [
      { min: 0, max: 7400, rate: 0.0246 },
      { min: 7401, max: 44340, rate: 0.0351 },
      { min: 44341, max: 71460, rate: 0.0501 },
      { min: 71461, max: Infinity, rate: 0.0664 }
    ],
    headOfHousehold: [
      { min: 0, max: 6860, rate: 0.0246 },
      { min: 6861, max: 40820, rate: 0.0351 },
      { min: 40821, max: 65920, rate: 0.0501 },
      { min: 65921, max: Infinity, rate: 0.0664 }
    ],
  },
  "New Jersey": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 35000, rate: 0.0175 },
      { min: 35001, max: 40000, rate: 0.035 },
      { min: 40001, max: 75000, rate: 0.0553 },
      { min: 75001, max: 500000, rate: 0.0637 },
      { min: 500001, max: 1000000, rate: 0.0897 },
      { min: 1000001, max: Infinity, rate: 0.1075 }
    ],
    married: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 50000, rate: 0.0175 },
      { min: 50001, max: 70000, rate: 0.035 },
      { min: 70001, max: 80000, rate: 0.0553 },
      { min: 80001, max: 150000, rate: 0.0637 },
      { min: 150001, max: 500000, rate: 0.0897 },
      { min: 500001, max: Infinity, rate: 0.1075 }
    ],
    headOfHousehold: [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 50000, rate: 0.0175 },
      { min: 50001, max: 70000, rate: 0.035 },
      { min: 70001, max: 80000, rate: 0.0553 },
      { min: 80001, max: 150000, rate: 0.0637 },
      { min: 150001, max: 500000, rate: 0.0897 },
      { min: 500001, max: Infinity, rate: 0.1075 }
    ],
  },
  "New Mexico": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 5500, rate: 0.019 },
      { min: 5501, max: 11000, rate: 0.032 },
      { min: 11001, max: 16000, rate: 0.047 },
      { min: 16001, max: Infinity, rate: 0.059 }
    ],
    married: [
      { min: 0, max: 8000, rate: 0.019 },
      { min: 8001, max: 16000, rate: 0.032 },
      { min: 16001, max: 24000, rate: 0.047 },
      { min: 24001, max: Infinity, rate: 0.059 }
    ],
    headOfHousehold: [
      { min: 0, max: 8000, rate: 0.019 },
      { min: 8001, max: 16000, rate: 0.032 },
      { min: 16001, max: 24000, rate: 0.047 },
      { min: 24001, max: Infinity, rate: 0.059 }
    ],
  },
  "New York": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8501, max: 11700, rate: 0.045 },
      { min: 11701, max: 13900, rate: 0.0525 },
      { min: 13901, max: 21400, rate: 0.059 },
      { min: 21401, max: 80650, rate: 0.0645 },
      { min: 80651, max: 215400, rate: 0.0685 },
      { min: 215401, max: 1077550, rate: 0.0965 },
      { min: 1077551, max: Infinity, rate: 0.109 }
    ],
    married: [
      { min: 0, max: 17150, rate: 0.04 },
      { min: 17151, max: 23600, rate: 0.045 },
      { min: 23601, max: 27900, rate: 0.0525 },
      { min: 27901, max: 43000, rate: 0.059 },
      { min: 43001, max: 161550, rate: 0.0645 },
      { min: 161551, max: 323200, rate: 0.0685 },
      { min: 323201, max: 2155350, rate: 0.0965 },
      { min: 2155351, max: Infinity, rate: 0.109 }
    ],
    headOfHousehold: [
      { min: 0, max: 12800, rate: 0.04 },
      { min: 12801, max: 17650, rate: 0.045 },
      { min: 17651, max: 20900, rate: 0.0525 },
      { min: 20901, max: 32200, rate: 0.059 },
      { min: 32201, max: 107650, rate: 0.0645 },
      { min: 107651, max: 269300, rate: 0.0685 },
      { min: 269301, max: 1616450, rate: 0.0965 },
      { min: 1616451, max: Infinity, rate: 0.109 }
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
      { min: 140201, max: 226950, rate: 0.0227 },
      { min: 226951, max: 445000, rate: 0.0264 },
      { min: 445001, max: Infinity, rate: 0.029 }
    ],
  },
  "Ohio": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 25000, rate: 0.0 },
      { min: 25001, max: 44250, rate: 0.0277 },
      { min: 44251, max: 88450, rate: 0.0323 },
      { min: 88451, max: 110650, rate: 0.038 },
      { min: 110651, max: Infinity, rate: 0.0399 }
    ],
    married: [
      { min: 0, max: 25000, rate: 0.0 },
      { min: 25001, max: 44250, rate: 0.0277 },
      { min: 44251, max: 88450, rate: 0.0323 },
      { min: 88451, max: 110650, rate: 0.038 },
      { min: 110651, max: Infinity, rate: 0.0399 }
    ],
    headOfHousehold: [
      { min: 0, max: 25000, rate: 0.0 },
      { min: 25001, max: 44250, rate: 0.0277 },
      { min: 44251, max: 88450, rate: 0.0323 },
      { min: 88451, max: 110650, rate: 0.038 },
      { min: 110651, max: Infinity, rate: 0.0399 }
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
      { min: 9801, max: 12200, rate: 0.04 },
      { min: 12201, max: Infinity, rate: 0.05 }
    ],
    headOfHousehold: [
      { min: 0, max: 2000, rate: 0.005 },
      { min: 2001, max: 5000, rate: 0.01 },
      { min: 5001, max: 7500, rate: 0.02 },
      { min: 7501, max: 9800, rate: 0.03 },
      { min: 9801, max: 12200, rate: 0.04 },
      { min: 12201, max: Infinity, rate: 0.05 }
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
      { min: 18401, max: 125000, rate: 0.0875 },
      { min: 125001, max: Infinity, rate: 0.099 }
    ],
  },
  "Rhode Island": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 66200, rate: 0.0375 },
      { min: 66201, max: 150550, rate: 0.0475 },
      { min: 150551, max: Infinity, rate: 0.0599 }
    ],
    married: [
      { min: 0, max: 66200, rate: 0.0375 },
      { min: 66201, max: 150550, rate: 0.0475 },
      { min: 150551, max: Infinity, rate: 0.0599 }
    ],
    headOfHousehold: [
      { min: 0, max: 66200, rate: 0.0375 },
      { min: 66201, max: 150550, rate: 0.0475 },
      { min: 150551, max: Infinity, rate: 0.0599 }
    ],
  },
  "South Carolina": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 3070, rate: 0.0 },
      { min: 3071, max: 6150, rate: 0.03 },
      { min: 6151, max: 9230, rate: 0.04 },
      { min: 9231, max: 12310, rate: 0.05 },
      { min: 12311, max: 15400, rate: 0.06 },
      { min: 15401, max: Infinity, rate: 0.07 }
    ],
    married: [
      { min: 0, max: 3070, rate: 0.0 },
      { min: 3071, max: 6150, rate: 0.03 },
      { min: 6151, max: 9230, rate: 0.04 },
      { min: 9231, max: 12310, rate: 0.05 },
      { min: 12311, max: 15400, rate: 0.06 },
      { min: 15401, max: Infinity, rate: 0.07 }
    ],
    headOfHousehold: [
      { min: 0, max: 3070, rate: 0.0 },
      { min: 3071, max: 6150, rate: 0.03 },
      { min: 6151, max: 9230, rate: 0.04 },
      { min: 9231, max: 12310, rate: 0.05 },
      { min: 12311, max: 15400, rate: 0.06 },
      { min: 15401, max: Infinity, rate: 0.07 }
    ],
  },
  "Vermont": {
    type: TAX_TYPES.Graduated,
    single: [
      { min: 0, max: 40950, rate: 0.0335 },
      { min: 40951, max: 99200, rate: 0.066 },
      { min: 99201, max: 206950, rate: 0.076 },
      { min: 206951, max: Infinity, rate: 0.0875 }
    ],
    married: [
      { min: 0, max: 68400, rate: 0.0335 },
      { min: 68401, max: 165350, rate: 0.066 },
      { min: 165351, max: 251950, rate: 0.076 },
      { min: 251951, max: Infinity, rate: 0.0875 }
    ],
    headOfHousehold: [
      { min: 0, max: 54700, rate: 0.0335 },
      { min: 54701, max: 132200, rate: 0.066 },
      { min: 132201, max: 216600, rate: 0.076 },
      { min: 216601, max: Infinity, rate: 0.0875 }
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

// Calculate state taxes - Main function
export const calculateStateTax = (inputs: StateTaxInputs): StateTaxResults | null => {
  const { income, filingStatus, deductions, useStandardDeduction, state, withholding = 0, selectedDeductions = [] } = inputs;
  
  // Calculate selected deductions total
  const selectedDeductionsTotal = selectedDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  
  // Check if state has no income tax
  if (NO_INCOME_TAX_STATES.includes(state)) {
    return {
      taxableIncome: income,
      taxLiability: 0,
      effectiveTaxRate: 0,
      marginalRate: 0,
      deductionAmount: 0,
      refundOrOwed: withholding,
      selectedDeductionsTotal,
      bracketBreakdown: []
    };
  }
  
  // Get the state's tax brackets or flat rate
  const stateTaxInfo = STATE_TAX_BRACKETS[state as keyof typeof STATE_TAX_BRACKETS];
  
  if (!stateTaxInfo) {
    console.error(`No tax information available for state: ${state}`);
    return null;
  }
  
  // Determine if graduated or flat tax
  const isFlatTax = FLAT_TAX_STATES.includes(state);
  
  // Set standard deduction based on filing status (simplified for demonstration)
  const standardDeduction = filingStatus === 'married' ? 25900 : (filingStatus === 'headOfHousehold' ? 19400 : 12950);
  
  // Determine deduction amount
  const deductionAmount = useStandardDeduction ? standardDeduction : deductions;
  
  // Calculate taxable income
  let taxableIncome = Math.max(0, income - deductionAmount - selectedDeductionsTotal);
  
  let taxLiability = 0;
  let marginalRate = 0;
  let bracketBreakdown: Array<{rate: number, amount: number, rangeStart: number, rangeEnd: number}> = [];
  
  if (isFlatTax) {
    // Apply flat tax rate
    const flatRate = 0.05; // Default to 5% if specific rate not available
    taxLiability = taxableIncome * flatRate;
    marginalRate = flatRate;
    bracketBreakdown = [
      {
        rate: flatRate,
        amount: taxLiability,
        rangeStart: 0,
        rangeEnd: taxableIncome
      }
    ];
  } else {
    // Apply graduated tax rates
    const brackets = stateTaxInfo[filingStatus];
    bracketBreakdown = [];
    
    if (brackets) {
      let remainingIncome = taxableIncome;
      
      for (const bracket of brackets) {
        const { min, max, rate } = bracket;
        
        if (remainingIncome <= 0) break;
        
        const taxableAmountInBracket = Math.min(remainingIncome, max - min);
        
        if (taxableAmountInBracket > 0) {
          const taxForBracket = taxableAmountInBracket * rate;
          taxLiability += taxForBracket;
          
          bracketBreakdown.push({
            rate,
            amount: taxForBracket,
            rangeStart: min,
            rangeEnd: min + taxableAmountInBracket
          });
          
          remainingIncome -= taxableAmountInBracket;
          marginalRate = rate; // Last bracket applied is the marginal rate
        }
      }
    }
  }
  
  // Calculate effective tax rate
  const effectiveTaxRate = income > 0 ? taxLiability / income : 0;
  
  // Calculate refund or amount owed
  const refundOrOwed = withholding - taxLiability;
  
  return {
    taxableIncome,
    taxLiability,
    effectiveTaxRate,
    marginalRate,
    deductionAmount,
    refundOrOwed,
    selectedDeductionsTotal,
    bracketBreakdown
  };
};

// Export a function to get state-specific deduction information
export const getStateDeductionInfo = (income: number, filingStatus: FilingStatus, state: string): DeductionInfo[] => {
  // Sample state-specific deductions
  // In a real implementation, this would vary by state
  const stateDeductions: DeductionInfo[] = [
    {
      id: 'state_property_tax',
      name: 'State Property Tax Credit',
      description: 'Deduction for property taxes paid to the state',
      eligibleAmount: Math.min(income * 0.01, 2500),
      icon: 'home'
    },
    {
      id: 'state_education_expenses',
      name: 'Education Expenses Credit',
      description: 'Credit for qualified education expenses',
      eligibleAmount: filingStatus === 'married' ? 1000 : 500,
      icon: 'school'
    },
    {
      id: 'state_childcare',
      name: 'Child Care Expenses',
      description: 'Deduction for child care expenses',
      eligibleAmount: filingStatus === 'single' ? 0 : 1200,
      icon: 'baby'
    },
    {
      id: 'state_commuter',
      name: 'Commuter Credit',
      description: 'Credit for public transportation',
      eligibleAmount: 750,
      icon: 'train'
    },
    {
      id: 'state_healthcare',
      name: 'Healthcare Premium Credit',
      description: 'Credit for healthcare premium payments',
      eligibleAmount: income < 100000 ? 1200 : 0,
      icon: 'heart'
    }
  ];
  
  // For some high-tax states, add additional deductions
  const highTaxStates = ['California', 'New York', 'New Jersey', 'Connecticut', 'Hawaii'];
  
  if (highTaxStates.includes(state)) {
    stateDeductions.push({
      id: 'state_high_tax_relief',
      name: 'High Tax State Relief',
      description: 'Special deduction for residents of high-tax states',
      eligibleAmount: Math.min(income * 0.02, 5000),
      icon: 'trending-down'
    });
  }
  
  return stateDeductions;
};
