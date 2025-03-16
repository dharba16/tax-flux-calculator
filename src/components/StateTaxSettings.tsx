
import React from 'react';
import { TaxResults, formatCurrency, formatPercentage } from '@/utils/taxCalculations';
import { DeductionInfo } from '@/utils/deductionEligibility';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { GlobeIcon, MapPinIcon, ReceiptIcon, PercentIcon, DollarSign, BadgeDollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// List of US states for the dropdown
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

// States with no income tax
const NO_INCOME_TAX_STATES = [
  'Alaska', 'Florida', 'Nevada', 'New Hampshire', 'South Dakota', 
  'Tennessee', 'Texas', 'Washington', 'Wyoming'
];

interface StateTaxSettingsProps {
  selectedState: string;
  setSelectedState: (state: string) => void;
  income: number;
  filingStatus: string;
  stateResults: TaxResults | null;
  stateEligibleDeductions: DeductionInfo[];
}

const StateTaxSettings: React.FC<StateTaxSettingsProps> = ({
  selectedState,
  setSelectedState,
  income,
  filingStatus,
  stateResults,
  stateEligibleDeductions
}) => {
  const hasNoIncomeTax = NO_INCOME_TAX_STATES.includes(selectedState);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <GlobeIcon className="w-5 h-5 mr-2 text-primary" />
          <h3 className="text-base font-medium">State Tax Settings</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Select State:</span>
          </div>
          
          <div className="flex-1 max-w-[220px]">
            <Select
              value={selectedState}
              onValueChange={setSelectedState}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state} {NO_INCOME_TAX_STATES.includes(state) && '(No Income Tax)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {hasNoIncomeTax ? (
        <Card className="border border-amber-200/30 bg-amber-50/30 dark:bg-amber-900/10">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-400">No State Income Tax</h4>
                <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mt-1">
                  {selectedState} does not collect personal income tax from residents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {stateResults && (
            <div className="grid grid-cols-2 gap-4">
              <StateInfoCard 
                icon={<ReceiptIcon className="w-4 h-4 text-primary/70" />}
                label="Taxable Income"
                value={formatCurrency(stateResults.taxableIncome)}
              />
              <StateInfoCard 
                icon={<DollarSign className="w-4 h-4 text-primary/70" />}
                label="Tax Amount"
                value={formatCurrency(stateResults.taxLiability)}
              />
              <StateInfoCard 
                icon={<PercentIcon className="w-4 h-4 text-primary/70" />}
                label="Effective Rate"
                value={formatPercentage(stateResults.effectiveTaxRate)}
              />
              <StateInfoCard 
                icon={<PercentIcon className="w-4 h-4 text-primary/70" />}
                label="Marginal Rate"
                value={formatPercentage(stateResults.marginalRate)}
              />
            </div>
          )}
          
          {/* Show state deduction opportunities in the state tab */}
          {stateEligibleDeductions.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center">
                <BadgeDollarSign className="w-4 h-4 mr-2 text-primary" />
                <h4 className="text-sm font-medium">{selectedState} Deduction Opportunities</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {stateEligibleDeductions.map((deduction) => (
                  <Card key={deduction.id} className="border border-border/50 bg-card/80">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {deduction.icon === 'graduation-cap' && <ReceiptIcon className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'heart-pulse' && <ReceiptIcon className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'home' && <ReceiptIcon className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'baby' && <ReceiptIcon className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'check' && <ReceiptIcon className="w-4 h-4 mr-2 text-primary/70" />}
                          <h5 className="text-sm font-medium">{deduction.name}</h5>
                        </div>
                        {deduction.eligibleAmount !== null && (
                          <span className="text-sm font-medium text-primary">
                            {formatCurrency(deduction.eligibleAmount)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{deduction.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{deduction.eligibilityMessage}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              State tax information is for estimation purposes only. Consult with a tax professional for personalized advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface StateInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StateInfoCard: React.FC<StateInfoCardProps> = ({ icon, label, value }) => {
  return (
    <div className="bg-card/80 border border-border/50 rounded-md p-3">
      <div className="flex items-center space-x-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
};

export default StateTaxSettings;
