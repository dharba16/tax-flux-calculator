
import React from 'react';
import { TaxResults, formatCurrency, formatPercentage } from '@/utils/taxCalculations';
import { DeductionInfo } from '@/utils/deductionEligibility';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  GlobeIcon, 
  MapPinIcon, 
  ReceiptIcon, 
  PercentIcon, 
  DollarSign, 
  BadgeDollarSign,
  GraduationCap,
  HeartPulse,
  Home,
  Baby,
  CheckIcon,
  InfoIcon
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// List of US states for the dropdown
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
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

// States with flat tax rates
const FLAT_TAX_STATES = [
  'Arizona', 'Colorado', 'Idaho', 'Illinois', 'Indiana',
  'Iowa', 'Kentucky', 'Massachusetts', 'Michigan', 'Mississippi',
  'North Carolina', 'Pennsylvania', 'Utah'
];

const TAX_TYPE_COLORS = {
  'Graduated': 'amber',
  'Flat': 'green',
  'No Income Tax': 'blue'
};

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
  const hasFlatTax = FLAT_TAX_STATES.includes(selectedState);
  
  // Determine tax type based on the state
  let taxType = "Graduated"; // Default value
  if (hasNoIncomeTax) {
    taxType = "No Income Tax";
  } else if (hasFlatTax) {
    taxType = "Flat";
  }

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
        
        {/* Display tax type banner */}
        <Card className={`border border-${TAX_TYPE_COLORS[taxType]}-200/30 bg-${TAX_TYPE_COLORS[taxType]}-50/30 dark:bg-${TAX_TYPE_COLORS[taxType]}-900/10`}>
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <span className={`text-${TAX_TYPE_COLORS[taxType]}-600 dark:text-${TAX_TYPE_COLORS[taxType]}-400 font-medium`}>
                {taxType} Tax Structure
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {taxType === "Graduated" && "Tax rates increase as income increases through multiple brackets."}
              {taxType === "Flat" && "A single tax rate applies to all taxable income."}
              {taxType === "No Income Tax" && `${selectedState} does not collect personal income tax from residents.`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {hasNoIncomeTax ? (
        <Card className="border border-blue-200/30 bg-blue-50/30 dark:bg-blue-900/10">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400">No State Income Tax</h4>
                <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-1">
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
          
          {/* Display tax bracket breakdown for graduated tax states */}
          {taxType === "Graduated" && stateResults && stateResults.bracketBreakdown.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <InfoIcon className="w-4 h-4 mr-2 text-primary/70" />
                <h4 className="text-sm font-medium">Tax Bracket Breakdown</h4>
              </div>
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bracket</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Tax Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stateResults.bracketBreakdown.map((bracket, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {formatCurrency(bracket.rangeStart)} - {bracket.rangeEnd === Infinity ? "∞" : formatCurrency(bracket.rangeEnd)}
                        </TableCell>
                        <TableCell>{formatPercentage(bracket.rate)}</TableCell>
                        <TableCell>{formatCurrency(bracket.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
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
                          {deduction.icon === 'graduation-cap' && <GraduationCap className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'heart-pulse' && <HeartPulse className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'home' && <Home className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'baby' && <Baby className="w-4 h-4 mr-2 text-primary/70" />}
                          {deduction.icon === 'check' && <CheckIcon className="w-4 h-4 mr-2 text-primary/70" />}
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
