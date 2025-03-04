
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, STANDARD_DEDUCTION, FilingStatus } from '@/utils/taxCalculations';

interface DeductionsInputProps {
  deductions: number;
  useStandardDeduction: boolean;
  filingStatus: FilingStatus;
  setDeductions: (value: number) => void;
  setUseStandardDeduction: (value: boolean) => void;
}

const DeductionsInput: React.FC<DeductionsInputProps> = ({
  deductions,
  useStandardDeduction,
  filingStatus,
  setDeductions,
  setUseStandardDeduction
}) => {
  const handleDeductionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDeductions(value ? parseInt(value, 10) : 0);
  };

  const formatInputValue = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('en-US');
  };

  const standardDeductionAmount = STANDARD_DEDUCTION[filingStatus];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="standard-deduction" className="text-sm font-medium cursor-pointer">
            Use Standard Deduction
          </Label>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(standardDeductionAmount)} for {filingStatus === 'single' ? 'Single' : filingStatus === 'married' ? 'Married Filing Jointly' : 'Head of Household'}
          </p>
        </div>
        <Switch
          id="standard-deduction"
          checked={useStandardDeduction}
          onCheckedChange={setUseStandardDeduction}
        />
      </div>

      {!useStandardDeduction && (
        <div className="space-y-2 animate-slide-down">
          <Label htmlFor="itemized-deductions" className="text-sm font-medium">
            Itemized Deductions
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="itemized-deductions"
              type="text"
              inputMode="numeric"
              className="pl-7 h-12 text-lg"
              value={formatInputValue(deductions)}
              onChange={handleDeductionsChange}
              placeholder="Enter your total deductions"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeductionsInput;
