
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilingStatus } from '@/utils/taxCalculations';

interface IncomeInputProps {
  income: number;
  withholding: number;
  filingStatus: FilingStatus;
  setIncome: (value: number) => void;
  setWithholding: (value: number) => void;
  setFilingStatus: (status: FilingStatus) => void;
}

const IncomeInput: React.FC<IncomeInputProps> = ({
  income,
  withholding,
  filingStatus,
  setIncome,
  setWithholding,
  setFilingStatus
}) => {
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setIncome(value ? parseInt(value, 10) : 0);
  };

  const handleWithholdingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setWithholding(value ? parseInt(value, 10) : 0);
  };

  const formatInputValue = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('en-US');
  };

  return (
    <div className="animate-fade-in">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="income" className="text-sm font-medium">
            Annual Income
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="income"
              type="text"
              inputMode="numeric"
              className="pl-7 h-12 text-lg"
              value={formatInputValue(income)}
              onChange={handleIncomeChange}
              placeholder="Enter your annual income"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withholding" className="text-sm font-medium">
            Tax Withholding
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="withholding"
              type="text"
              inputMode="numeric"
              className="pl-7 h-12 text-lg"
              value={formatInputValue(withholding)}
              onChange={handleWithholdingChange}
              placeholder="Amount already withheld"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filing-status" className="text-sm font-medium">
            Filing Status
          </Label>
          <Select
            value={filingStatus}
            onValueChange={(value) => setFilingStatus(value as FilingStatus)}
          >
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="Select your filing status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single" className="text-base">Single</SelectItem>
              <SelectItem value="married" className="text-base">Married Filing Jointly</SelectItem>
              <SelectItem value="headOfHousehold" className="text-base">Head of Household</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default IncomeInput;
