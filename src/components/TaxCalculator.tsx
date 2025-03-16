
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncomeInput from './IncomeInput';
import DeductionsInput from './DeductionsInput';
import ResultsDisplay from './ResultsDisplay';
import DeductionsEligibility from './DeductionsEligibility';
import { calculateTaxes, TaxResults, FilingStatus } from '@/utils/taxCalculations';
import { getEligibleDeductions, DeductionInfo } from '@/utils/deductionEligibility';
import { Card, CardContent } from '@/components/ui/card';

const TaxCalculator: React.FC = () => {
  // Input state
  const [income, setIncome] = useState<number>(75000);
  const [withholding, setWithholding] = useState<number>(12000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [deductions, setDeductions] = useState<number>(0);
  const [useStandardDeduction, setUseStandardDeduction] = useState<boolean>(true);
  
  // Results state
  const [results, setResults] = useState<TaxResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>('income');
  const [eligibleDeductions, setEligibleDeductions] = useState<DeductionInfo[]>([]);
  
  // Calculate taxes whenever inputs change
  useEffect(() => {
    const result = calculateTaxes({
      income,
      withholding,
      filingStatus,
      deductions,
      useStandardDeduction
    });
    
    setResults(result);
    
    // Calculate eligible deductions
    const deductionsList = getEligibleDeductions(income, filingStatus);
    setEligibleDeductions(deductionsList);
  }, [income, withholding, filingStatus, deductions, useStandardDeduction]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="col-span-1 lg:col-span-3 overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
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
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="col-span-1 lg:col-span-2">
          {results && (
            <div className="space-y-6">
              <ResultsDisplay results={results} />
              <DeductionsEligibility eligibleDeductions={eligibleDeductions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
