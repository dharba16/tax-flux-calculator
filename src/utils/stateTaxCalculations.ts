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
    'headOfHousehold': 9606
  },
  'New York': {
    'single': 8000,
    'married': 16050,
    'marriedSeparate': 8000,
    'headOfHousehold': 11200
  },
  'Texas': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Florida': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Illinois': {
    'single': 2375,
    'married': 4750,
    'marriedSeparate': 2375,
    'headOfHousehold': 2375
  },
  'Pennsylvania': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Ohio': {
    'single': 2400,
    'married': 4800,
    'marriedSeparate': 2400,
    'headOfHousehold': 3600
  },
  'Michigan': {
    'single': 4900,
    'married': 9800,
    'marriedSeparate': 4900,
    'headOfHousehold': 4900
  },
  'Georgia': {
    'single': 5400,
    'married': 7100,
    'marriedSeparate': 3550,
    'headOfHousehold': 7100
  },
  'North Carolina': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'New Jersey': {
    'single': 3000,
    'married': 6000,
    'marriedSeparate': 3000,
    'headOfHousehold': 4500
  },
  'Virginia': {
    'single': 4500,
    'married': 9000,
    'marriedSeparate': 4500,
    'headOfHousehold': 4500
  },
  'Washington': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Massachusetts': {
    'single': 3600,
    'married': 7200,
    'marriedSeparate': 3600,
    'headOfHousehold': 5600
  },
  'Indiana': {
    'single': 1000,
    'married': 2000,
    'marriedSeparate': 1000,
    'headOfHousehold': 1000
  },
  'Arizona': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Tennessee': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Missouri': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Maryland': {
    'single': 2300,
    'married': 4600,
    'marriedSeparate': 2300,
    'headOfHousehold': 2300
  },
  'Wisconsin': {
    'single': 11130,
    'married': 20760,
    'marriedSeparate': 10380,
    'headOfHousehold': 14470
  },
  'Minnesota': {
    'single': 12750,
    'married': 25500,
    'marriedSeparate': 12750,
    'headOfHousehold': 19200
  },
  'Colorado': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Alabama': {
    'single': 2500,
    'married': 7500,
    'marriedSeparate': 3750,
    'headOfHousehold': 4700
  },
  'South Carolina': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Louisiana': {
    'single': 4500,
    'married': 9000,
    'marriedSeparate': 4500,
    'headOfHousehold': 9000
  },
  'Kentucky': {
    'single': 2690,
    'married': 5380,
    'marriedSeparate': 2690,
    'headOfHousehold': 2690
  },
  'Oregon': {
    'single': 2270,
    'married': 4545,
    'marriedSeparate': 2270,
    'headOfHousehold': 3655
  },
  'Oklahoma': {
    'single': 6350,
    'married': 12700,
    'marriedSeparate': 6350,
    'headOfHousehold': 9350
  },
  'Connecticut': {
    'single': 15000,
    'married': 24000,
    'marriedSeparate': 12000,
    'headOfHousehold': 19000
  },
  'Iowa': {
    'single': 2110,
    'married': 5210,
    'marriedSeparate': 2110,
    'headOfHousehold': 5210
  },
  'Mississippi': {
    'single': 6000,
    'married': 12000,
    'marriedSeparate': 6000,
    'headOfHousehold': 8000
  },
  'Arkansas': {
    'single': 2200,
    'married': 4400,
    'marriedSeparate': 2200,
    'headOfHousehold': 3200
  },
  'Kansas': {
    'single': 3000,
    'married': 7500,
    'marriedSeparate': 3750,
    'headOfHousehold': 5500
  },
  'Utah': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Nevada': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'New Mexico': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Nebraska': {
    'single': 6900,
    'married': 13800,
    'marriedSeparate': 6900,
    'headOfHousehold': 10100
  },
  'West Virginia': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Idaho': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Hawaii': {
    'single': 2200,
    'married': 4400,
    'marriedSeparate': 2200,
    'headOfHousehold': 3212
  },
  'Maine': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'New Hampshire': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Rhode Island': {
    'single': 8900,
    'married': 17800,
    'marriedSeparate': 8900,
    'headOfHousehold': 13850
  },
  'Montana': {
    'single': 4790,
    'married': 9580,
    'marriedSeparate': 4790,
    'headOfHousehold': 4790
  },
  'Delaware': {
    'single': 3250,
    'married': 6500,
    'marriedSeparate': 3250,
    'headOfHousehold': 3250
  },
  'South Dakota': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'North Dakota': {
    'single': 12200,
    'married': 24400,
    'marriedSeparate': 12200,
    'headOfHousehold': 18350
  },
  'Alaska': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  },
  'Vermont': {
    'single': 6150,
    'married': 12300,
    'marriedSeparate': 6150,
    'headOfHousehold': 9650
  },
  'Wyoming': {
    'single': 0,
    'married': 0,
    'marriedSeparate': 0,
    'headOfHousehold': 0
  }
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
    ]
  },
  'Texas': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'Florida': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'Illinois': {
    'single': [{ min: 0, max: null, rate: 0.0495 }],
    'married': [{ min: 0, max: null, rate: 0.0495 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0495 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0495 }]
  },
  'Pennsylvania': {
    'single': [{ min: 0, max: null, rate: 0.0307 }],
    'married': [{ min: 0, max: null, rate: 0.0307 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0307 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0307 }]
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
    ]
  },
  'Michigan': {
    'single': [{ min: 0, max: null, rate: 0.0405 }],
    'married': [{ min: 0, max: null, rate: 0.0405 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0405 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0405 }]
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
    ]
  },
  'North Carolina': {
    'single': [{ min: 0, max: null, rate: 0.0475 }],
    'married': [{ min: 0, max: null, rate: 0.0475 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0475 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0475 }]
  },
  'New Jersey': {
    'single': [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 35000, rate: 0.0175 },
      { min: 35001, max: 40000, rate: 0.0245 },
      { min: 40001, max: 75000, rate: 0.035 },
      { min: 75001, max: 500000, rate: 0.05525 },
      { min: 500001, max: null, rate: 0.0897 }
    ],
    'married': [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 35000, rate: 0.0175 },
      { min: 35001, max: 40000, rate: 0.0245 },
      { min: 40001, max: 75000, rate: 0.035 },
      { min: 75001, max: 500000, rate: 0.05525 },
      { min: 500001, max: null, rate: 0.0897 }
    ],
    'marriedSeparate': [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 35000, rate: 0.0175 },
      { min: 35001, max: 40000, rate: 0.0245 },
      { min: 40001, max: 75000, rate: 0.035 },
      { min: 75001, max: 500000, rate: 0.05525 },
      { min: 500001, max: null, rate: 0.0897 }
    ],
    'headOfHousehold': [
      { min: 0, max: 20000, rate: 0.014 },
      { min: 20001, max: 35000, rate: 0.0175 },
      { min: 35001, max: 40000, rate: 0.0245 },
      { min: 40001, max: 75000, rate: 0.035 },
      { min: 75001, max: 500000, rate: 0.05525 },
      { min: 500001, max: null, rate: 0.0897 }
    ]
  },
  'Virginia': {
    'single': [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 17000, rate: 0.05 },
      { min: 17001, max: null, rate: 0.0575 }
    ],
    'married': [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 17000, rate: 0.05 },
      { min: 17001, max: null, rate: 0.0575 }
    ],
    'marriedSeparate': [
      { min: 0, max: 1500, rate: 0.02 },
      { min: 1501, max: 2500, rate: 0.03 },
      { min: 2501, max: 8500, rate: 0.05 },
      { min: 8501, max: null, rate: 0.0575 }
    ],
    'headOfHousehold': [
      { min: 0, max: 3000, rate: 0.02 },
      { min: 3001, max: 5000, rate: 0.03 },
      { min: 5001, max: 17000, rate: 0.05 },
      { min: 17001, max: null, rate: 0.0575 }
    ]
  },
  'Washington': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'Massachusetts': {
    'single': [{ min: 0, max: null, rate: 0.05 }],
    'married': [{ min: 0, max: null, rate: 0.05 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.05 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.05 }]
  },
  'Indiana': {
    'single': [{ min: 0, max: null, rate: 0.0323 }],
    'married': [{ min: 0, max: null, rate: 0.0323 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0323 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0323 }]
  },
  'Arizona': {
    'single': [{ min: 0, max: null, rate: 0.025 }],
    'married': [{ min: 0, max: null, rate: 0.025 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.025 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.025 }]
  },
  'Tennessee': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'Missouri': {
    'single': [
      { min: 0, max: 1088, rate: 0.015 },
      { min: 1089, max: 2176, rate: 0.02 },
      { min: 2177, max: 3264, rate: 0.025 },
      { min: 3265, max: 4352, rate: 0.03 },
      { min: 4353, max: 5440, rate: 0.035 },
      { min: 5441, max: 6528, rate: 0.04 },
      { min: 6529, max: 7616, rate: 0.045 },
      { min: 7617, max: 8704, rate: 0.05 },
      { min: 8705, max: null, rate: 0.053 }
    ],
    'married': [
      { min: 0, max: 1088, rate: 0.015 },
      { min: 1089, max: 2176, rate: 0.02 },
      { min: 2177, max: 3264, rate: 0.025 },
      { min: 3265, max: 4352, rate: 0.03 },
      { min: 4353, max: 5440, rate: 0.035 },
      { min: 5441, max: 6528, rate: 0.04 },
      { min: 6529, max: 7616, rate: 0.045 },
      { min: 7617, max: 8704, rate: 0.05 },
      { min: 8705, max: null, rate: 0.053 }
    ],
    'marriedSeparate': [
      { min: 0, max: 1088, rate: 0.015 },
      { min: 1089, max: 2176, rate: 0.02 },
      { min: 2177, max: 3264, rate: 0.025 },
      { min: 3265, max: 4352, rate: 0.03 },
      { min: 4353, max: 5440, rate: 0.035 },
      { min: 5441, max: 6528, rate: 0.04 },
      { min: 6529, max: 7616, rate: 0.045 },
      { min: 7617, max: 8704, rate: 0.05 },
      { min: 8705, max: null, rate: 0.053 }
    ],
    'headOfHousehold': [
      { min: 0, max: 1088, rate: 0.015 },
      { min: 1089, max: 2176, rate: 0.02 },
      { min: 2177, max: 3264, rate: 0.025 },
      { min: 3265, max: 4352, rate: 0.03 },
      { min: 4353, max: 5440, rate: 0.035 },
      { min: 5441, max: 6528, rate: 0.04 },
      { min: 6529, max: 7616, rate: 0.045 },
      { min: 7617, max: 8704, rate: 0.05 },
      { min: 8705, max: null, rate: 0.053 }
    ]
  },
  'Maryland': {
    'single': [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 100000, rate: 0.0475 },
      { min: 100001, max: 125000, rate: 0.05 },
      { min: 125001, max: 150000, rate: 0.0525 },
      { min: 150001, max: 250000, rate: 0.055 },
      { min: 250001, max: null, rate: 0.0575 }
    ],
    'married': [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 150000, rate: 0.0475 },
      { min: 150001, max: 175000, rate: 0.05 },
      { min: 175001, max: 225000, rate: 0.0525 },
      { min: 225001, max: 300000, rate: 0.055 },
      { min: 300001, max: null, rate: 0.0575 }
    ],
    'marriedSeparate': [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 100000, rate: 0.0475 },
      { min: 100001, max: 125000, rate: 0.05 },
      { min: 125001, max: 150000, rate: 0.0525 },
      { min: 150001, max: 250000, rate: 0.055 },
      { min: 250001, max: null, rate: 0.0575 }
    ],
    'headOfHousehold': [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 2000, rate: 0.03 },
      { min: 2001, max: 3000, rate: 0.04 },
      { min: 3001, max: 150000, rate: 0.0475 },
      { min: 150001, max: 175000, rate: 0.05 },
      { min: 175001, max: 225000, rate: 0.0525 },
      { min: 225001, max: 300000, rate: 0.055 },
      { min: 300001, max: null, rate: 0.0575 }
    ]
  },
  'Wisconsin': {
    'single': [{ min: 0, max: null, rate: 0.0465 }],
    'married': [{ min: 0, max: null, rate: 0.0465 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0465 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0465 }]
  },
  'Minnesota': {
    'single': [{ min: 0, max: null, rate: 0.0685 }],
    'married': [{ min: 0, max: null, rate: 0.0685 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0685 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0685 }]
  },
  'Colorado': {
    'single': [{ min: 0, max: null, rate: 0.044 }],
    'married': [{ min: 0, max: null, rate: 0.044 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.044 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.044 }]
  },
  'Alabama': {
    'single': [
      { min: 0, max: 500, rate: 0.02 },
      { min: 501, max: 3000, rate: 0.04 },
      { min: 3001, max: null, rate: 0.05 }
    ],
    'married': [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 6000, rate: 0.04 },
      { min: 6001, max: null, rate: 0.05 }
    ],
    'marriedSeparate': [
      { min: 0, max: 500, rate: 0.02 },
      { min: 501, max: 3000, rate: 0.04 },
      { min: 3001, max: null, rate: 0.05 }
    ],
    'headOfHousehold': [
      { min: 0, max: 1000, rate: 0.02 },
      { min: 1001, max: 6000, rate: 0.04 },
      { min: 6001, max: null, rate: 0.05 }
    ]
  },
  'South Carolina': {
    'single': [{ min: 0, max: null, rate: 0.07 }],
    'married': [{ min: 0, max: null, rate: 0.07 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.07 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.07 }]
  },
  'Louisiana': {
    'single': [{ min: 0, max: null, rate: 0.0425 }],
    'married': [{ min: 0, max: null, rate: 0.0425 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0425 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0425 }]
  },
  'Kentucky': {
    'single': [{ min: 0, max: null, rate: 0.045 }],
    'married': [{ min: 0, max: null, rate: 0.045 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.045 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.045 }]
  },
  'Oregon': {
    'single': [{ min: 0, max: null, rate: 0.0875 }],
    'married': [{ min: 0, max: null, rate: 0.0875 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0875 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0875 }]
  },
  'Oklahoma': {
    'single': [{ min: 0, max: null, rate: 0.0475 }],
    'married': [{ min: 0, max: null, rate: 0.0475 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0475 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0475 }]
  },
  'Connecticut': {
    'single': [{ min: 0, max: null, rate: 0.065 }],
    'married': [{ min: 0, max: null, rate: 0.065 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.065 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.065 }]
  },
  'Iowa': {
    'single': [{ min: 0, max: null, rate: 0.0425 }],
    'married': [{ min: 0, max: null, rate: 0.0425 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0425 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0425 }]
  },
  'Mississippi': {
    'single': [{ min: 0, max: null, rate: 0.05 }],
    'married': [{ min: 0, max: null, rate: 0.05 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.05 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.05 }]
  },
  'Arkansas': {
    'single': [{ min: 0, max: null, rate: 0.049 }],
    'married': [{ min: 0, max: null, rate: 0.049 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.049 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.049 }]
  },
  'Kansas': {
    'single': [{ min: 0, max: null, rate: 0.0525 }],
    'married': [{ min: 0, max: null, rate: 0.0525 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0525 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0525 }]
  },
  'Utah': {
    'single': [{ min: 0, max: null, rate: 0.0485 }],
    'married': [{ min: 0, max: null, rate: 0.0485 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0485 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0485 }]
  },
  'Nevada': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'New Mexico': {
    'single': [{ min: 0, max: null, rate: 0.059 }],
    'married': [{ min: 0, max: null, rate: 0.059 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.059 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.059 }]
  },
  'Nebraska': {
    'single': [{ min: 0, max: null, rate: 0.0664 }],
    'married': [{ min: 0, max: null, rate: 0.0664 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0664 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0664 }]
  },
  'West Virginia': {
    'single': [{ min: 0, max: null, rate: 0.065 }],
    'married': [{ min: 0, max: null, rate: 0.065 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.065 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.065 }]
  },
  'Idaho': {
    'single': [{ min: 0, max: null, rate: 0.06 }],
    'married': [{ min: 0, max: null, rate: 0.06 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.06 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.06 }]
  },
  'Hawaii': {
    'single': [{ min: 0, max: null, rate: 0.11 }],
    'married': [{ min: 0, max: null, rate: 0.11 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.11 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.11 }]
  },
  'Maine': {
    'single': [{ min: 0, max: null, rate: 0.0715 }],
    'married': [{ min: 0, max: null, rate: 0.0715 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0715 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0715 }]
  },
  'New Hampshire': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'Rhode Island': {
    'single': [{ min: 0, max: null, rate: 0.0599 }],
    'married': [{ min: 0, max: null, rate: 0.0599 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0599 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0599 }]
  },
  'Montana': {
    'single': [{ min: 0, max: null, rate: 0.0675 }],
    'married': [{ min: 0, max: null, rate: 0.0675 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0675 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0675 }]
  },
  'Delaware': {
    'single': [{ min: 0, max: null, rate: 0.066 }],
    'married': [{ min: 0, max: null, rate: 0.066 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.066 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.066 }]
  },
  'South Dakota': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'North Dakota': {
    'single': [{ min: 0, max: null, rate: 0.029 }],
    'married': [{ min: 0, max: null, rate: 0.029 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.029 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.029 }]
  },
  'Alaska': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  },
  'Vermont': {
    'single': [{ min: 0, max: null, rate: 0.0875 }],
    'married': [{ min: 0, max: null, rate: 0.0875 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0.0875 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0.0875 }]
  },
  'Wyoming': {
    'single': [{ min: 0, max: null, rate: 0 }],
    'married': [{ min: 0, max: null, rate: 0 }],
    'marriedSeparate': [{ min: 0, max: null, rate: 0 }],
    'headOfHousehold': [{ min: 0, max: null, rate: 0 }]
  }
};

// Export the constants for use in other modules
export const STATE_STANDARD_DEDUCTIONS = stateStandardDeductions;
export const STATE_TAX_BRACKETS = stateTaxBrackets;

// Function to calculate state taxes
export function calculateStateTaxes(inputs: StateTaxInputs): StateTaxResults | null {
  const { income, filingStatus, deductions, useStandardDeduction, state, selectedDeductions = [] } = inputs;
  
  // Return null if the state has no income tax
  if (!stateTaxBrackets[state]) {
    return null;
  }
  
  // Calculate the total amount from selected deductions
  const selectedDeductionsTotal = selectedDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  
  // Get standard deduction for the state
  const standardDeduction = stateStandardDeductions[state][filingStatus] || 0;
  
  // Determine which deduction to use
  const totalItemizedDeduction = deductions + selectedDeductionsTotal;
  const deductionAmount = useStandardDeduction ? standardDeduction : totalItemizedDeduction;
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, income - deductionAmount);
  
  // Get tax brackets for the state and filing status
  const brackets = stateTaxBrackets[state][filingStatus];
  
  // Calculate tax amount
  let taxAmount = 0;
  let lastBracketUsed = brackets[0];
  const bracketBreakdown: Array<{
    rate: number;
    amount: number;
    rangeStart: number;
    rangeEnd: number;
  }> = [];
  
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(taxableIncome, bracket.max !== null ? bracket.max : Infinity) - bracket.min;
      const taxAmountForBracket = taxableInThisBracket * bracket.rate;
      taxAmount += taxAmountForBracket;
      lastBracketUsed = bracket;
      
      if (taxableInThisBracket > 0) {
        bracketBreakdown.push({
          rate: bracket.rate,
          amount: taxAmountForBracket,
          rangeStart: bracket.min,
          rangeEnd: bracket.max !== null ? Math.min(taxableIncome, bracket.max) : taxableIncome
        });
      }
    }
  }
  
  // Calculate effective tax rate
  const effectiveRate = taxableIncome > 0 ? taxAmount / taxableIncome : 0;
  
  return {
    taxableIncome,
    taxAmount,
    effectiveRate,
    marginRate: lastBracketUsed.rate,
    filingStatus,
    standardDeduction,
    brackets,
    selectedDeductionsTotal,
    bracketBreakdown
  };
}
