
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import IncomeInput from './IncomeInput';
import DeductionsInput from './DeductionsInput';
import ResultsDisplay from './ResultsDisplay';
import DeductionsEligibility from './DeductionsEligibility';
import StateTaxSettings from './StateTaxSettings';
import { calculateTaxes, TaxResults, FilingStatus } from '@/utils/taxCalculations';
import { getEligibleDeductions, DeductionInfo } from '@/utils/deductionEligibility';
import { getStateEligibleDeductions, calculateStateTaxes } from '@/utils/stateTaxCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckIcon, GlobeIcon } from 'lucide-react';

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

const TaxCalculator: React.FC = () => {
  // Input state
  const [income, setIncome] = useState<number>(75000);
  const [withholding, setWithholding] = useState<number>(12000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [deductions, setDeductions] = useState<number>(0);
  const [useStandardDeduction, setUseStandardDeduction] = useState<boolean>(true);
  const [includeStateTaxes, setIncludeStateTaxes] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>('California');
  
  // Results state
  const [results, setResults] = useState<TaxResults | null>(null);
  const [stateResults, setStateResults] = useState<TaxResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>('income');
  const [eligibleDeductions, setEligibleDeductions] = useState<DeductionInfo[]>([]);
  const [stateEligibleDeductions, setStateEligibleDeductions] = useState<DeductionInfo[]>([]);
  
  // Calculate taxes whenever inputs change
  useEffect(() => {
    // Calculate federal taxes
    const result = calculateTaxes({
      income,
      withholding,
      filingStatus,
      deductions,
      useStandardDeduction
    });
    
    setResults(result);
    
    // Calculate eligible federal deductions
    const deductionsList = getEligibleDeductions(income, filingStatus);
    setEligibleDeductions(deductionsList);

    // Calculate state taxes if enabled
    if (includeStateTaxes) {
      const stateResult = calculateStateTaxes({
        income,
        filingStatus,
        deductions,
        useStandardDeduction,
        state: selectedState
      });
      
      // Only set state results if we got a valid result
      if (stateResult) {
        setStateResults(stateResult);

        // Get state-specific deductions
        const stateDeductionsList = getStateEligibleDeductions(income, filingStatus, selectedState);
        setStateEligibleDeductions(stateDeductionsList);
      } else {
        setStateResults(null);
        setStateEligibleDeductions([]);
      }
    } else {
      setStateResults(null);
      setStateEligibleDeductions([]);
    }
  }, [income, withholding, filingStatus, deductions, useStandardDeduction, includeStateTaxes, selectedState]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="income">Income</TabsTrigger>
                      <TabsTrigger value="deductions">Deductions</TabsTrigger>
                      <TabsTrigger value="state" disabled={!includeStateTaxes}>State</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="income" className="mt-0">
                      <IncomeInput
                        income={income}
                        withholding={withholding}
                        filingStatus={filingStatus}
                        setIncome={setIncome}
                        setWithholding={setWithholding}
                        setFilingStatus={setFilingStatus}
                      />
                      
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="state-taxes"
                            checked={includeStateTaxes}
                            onCheckedChange={(checked) => {
                              setIncludeStateTaxes(checked);
                              // Auto-switch to state tab if enabling state taxes
                              if (checked && activeTab !== 'state') {
                                setActiveTab('state');
                              }
                            }}
                          />
                          <Label htmlFor="state-taxes" className="text-sm cursor-pointer">
                            Include State Taxes
                          </Label>
                        </div>
                        
                        {includeStateTaxes && (
                          <div className="flex-1 max-w-[180px] ml-4">
                            <Select
                              value={selectedState}
                              onValueChange={setSelectedState}
                            >
                              <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="Select State" />
                              </SelectTrigger>
                              <SelectContent>
                                {US_STATES.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="deductions" className="mt-0">
                      <DeductionsInput
                        deductions={deductions}
                        useStandardDeduction={useStandardDeduction}
                        filingStatus={filingStatus}
                        setDeductions={setDeductions}
                        setUseStandardDeduction={setUseStandardDeduction}
                      />
                    </TabsContent>
                    
                    <TabsContent value="state" className="mt-0">
                      <StateTaxSettings 
                        selectedState={selectedState}
                        setSelectedState={setSelectedState}
                        income={income}
                        filingStatus={filingStatus}
                        stateResults={stateResults}
                        stateEligibleDeductions={stateEligibleDeductions}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <DeductionsEligibility 
            eligibleDeductions={eligibleDeductions} 
            stateEligibleDeductions={includeStateTaxes ? stateEligibleDeductions : []}
            includeStateTaxes={includeStateTaxes}
            selectedState={selectedState}
          />
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          {results && (
            <ResultsDisplay 
              results={results} 
              stateResults={stateResults}
              includeStateTaxes={includeStateTaxes}
              selectedState={selectedState}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
