
import { FilingStatus } from './taxCalculations';

export interface DeductionInfo {
  id: string;
  name: string;
  description: string;
  eligibleAmount: number | null;
  eligibilityMessage: string;
  icon: string;
}

export const getEligibleDeductions = (
  income: number,
  filingStatus: FilingStatus
): DeductionInfo[] => {
  const deductions: DeductionInfo[] = [];
  
  // Student Loan Interest Deduction
  if (income < (filingStatus === 'married' ? 145000 : 85000)) {
    const maxDeduction = 2500;
    const phaseOutStart = filingStatus === 'married' ? 135000 : 70000;
    const phaseOutEnd = filingStatus === 'married' ? 145000 : 85000;
    
    let eligibleAmount = maxDeduction;
    let eligibilityMessage = `You can deduct up to $${maxDeduction} of student loan interest.`;
    
    if (income > phaseOutStart) {
      const phaseOutPercentage = (income - phaseOutStart) / (phaseOutEnd - phaseOutStart);
      eligibleAmount = Math.round(maxDeduction * (1 - phaseOutPercentage));
      eligibilityMessage = `You are in the phase-out range. You can deduct up to $${eligibleAmount} of student loan interest.`;
    }
    
    deductions.push({
      id: 'studentLoanInterest',
      name: 'Student Loan Interest',
      description: 'Deduction for interest paid on student loans',
      eligibleAmount,
      eligibilityMessage,
      icon: 'graduation-cap'
    });
  } else {
    deductions.push({
      id: 'studentLoanInterest',
      name: 'Student Loan Interest',
      description: 'Deduction for interest paid on student loans',
      eligibleAmount: null,
      eligibilityMessage: 'Your income exceeds the limit for this deduction.',
      icon: 'graduation-cap'
    });
  }
  
  // Self-employed health insurance deduction
  deductions.push({
    id: 'selfEmployedHealth',
    name: 'Self-Employed Health Insurance',
    description: 'Deduction for health insurance premiums if you are self-employed',
    eligibleAmount: null,
    eligibilityMessage: 'You may be eligible if you are self-employed. Consult a tax professional for details.',
    icon: 'stethoscope'
  });
  
  // IRA Contributions
  const iraLimit = 6500;
  const iraLimitOver50 = 7500;
  
  deductions.push({
    id: 'iraContributions',
    name: 'Traditional IRA Contributions',
    description: 'Deduction for contributions to a Traditional IRA',
    eligibleAmount: iraLimit,
    eligibilityMessage: `You can contribute up to $${iraLimit} ($${iraLimitOver50} if over 50). Deductibility may be limited based on retirement plan coverage.`,
    icon: 'piggy-bank'
  });
  
  // HSA Contributions
  const hsaLimitIndividual = 3850;
  const hsaLimitFamily = 7750;
  
  deductions.push({
    id: 'hsaContributions',
    name: 'HSA Contributions',
    description: 'Contributions to a Health Savings Account',
    eligibleAmount: filingStatus === 'married' ? hsaLimitFamily : hsaLimitIndividual,
    eligibilityMessage: `You may contribute up to $${filingStatus === 'married' ? hsaLimitFamily : hsaLimitIndividual} if you have a qualifying high-deductible health plan.`,
    icon: 'heart-pulse'
  });
  
  // Charitable Contributions
  deductions.push({
    id: 'charitableContributions',
    name: 'Charitable Contributions',
    description: 'Deductions for donations to qualified organizations',
    eligibleAmount: null,
    eligibilityMessage: 'You can deduct charitable contributions when you itemize deductions.',
    icon: 'hand-coins'
  });
  
  // Mortgage Interest Deduction
  deductions.push({
    id: 'mortgageInterest',
    name: 'Mortgage Interest',
    description: 'Deduction for interest paid on home mortgages',
    eligibleAmount: null,
    eligibilityMessage: 'You can deduct mortgage interest on qualified home loans up to $750,000 when you itemize deductions.',
    icon: 'home'
  });
  
  // Child and Dependent Care Credit
  if (filingStatus !== 'single' || income < 200000) {
    deductions.push({
      id: 'childDependentCare',
      name: 'Child & Dependent Care Credit',
      description: 'Credit for child or dependent care expenses',
      eligibleAmount: 8000,
      eligibilityMessage: 'Up to $8,000 for one qualifying person or $16,000 for two or more. Credit percentage varies based on income.',
      icon: 'baby'
    });
  }
  
  // Education Credits
  if (income < (filingStatus === 'married' ? 180000 : 90000)) {
    deductions.push({
      id: 'educationCredits',
      name: 'Education Credits',
      description: 'American Opportunity and Lifetime Learning credits',
      eligibleAmount: 2500,
      eligibilityMessage: 'The American Opportunity Credit provides up to $2,500 per eligible student, while the Lifetime Learning Credit offers up to $2,000 per tax return.',
      icon: 'graduation-cap'
    });
  }
  
  return deductions;
};
