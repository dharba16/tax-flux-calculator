
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
import { Separator } from '@/components/ui/separator';
import { DollarSignIcon, GlobeIcon } from 'lucide-react';

interface IncomeInputProps {
  income: number;
  federalWithholding: number;
  stateWithholding: number;
  filingStatus: FilingStatus;
  setIncome: (value: number) => void;
  setFederalWithholding: (value: number) => void;
  setStateWithholding: (value: number) => void;
  setFilingStatus: (status: FilingStatus) => void;
  includeStateTaxes: boolean;
}

const IncomeInput: React.FC<IncomeInputProps> = ({
  income,
  federalWithholding,
  stateWithholding,
  filingStatus,
  setIncome,
  setFederalWithholding,
  setStateWithholding,
  setFilingStatus,
  includeStateTaxes
}) => {
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setIncome(value ? parseInt(value, 10) : 0);
  };

  const handleFederalWithholdingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFederalWithholding(value ? parseInt(value, 10) : 0);
  };

  const handleStateWithholdingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setStateWithholding(value ? parseInt(value, 10) : 0);
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

        <div>
          <h3 className="text-sm font-medium mb-3">Tax Withholding</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="federal-withholding" className="text-sm font-medium flex items-center">
                <DollarSignIcon className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 py-0.5 px-2 rounded mr-2">Federal</span>
                Federal Tax Withheld (Box 2 on W-2)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="federal-withholding"
                  type="text"
                  inputMode="numeric"
                  className="pl-7 h-12 text-lg"
                  value={formatInputValue(federalWithholding)}
                  onChange={handleFederalWithholdingChange}
                  placeholder="Federal tax already withheld"
                />
              </div>
            </div>

            {includeStateTaxes && (
              <div className="space-y-2">
                <Label htmlFor="state-withholding" className="text-sm font-medium flex items-center">
                  <GlobeIcon className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 py-0.5 px-2 rounded mr-2">State</span>
                  State Tax Withheld (Box 17 on W-2)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="state-withholding"
                    type="text"
                    inputMode="numeric"
                    className="pl-7 h-12 text-lg"
                    value={formatInputValue(stateWithholding)}
                    onChange={handleStateWithholdingChange}
                    placeholder="State tax already withheld"
                  />
                </div>
              </div>
            )}
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
