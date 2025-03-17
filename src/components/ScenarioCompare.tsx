
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Copy, ArrowLeftRight } from 'lucide-react';
import { TaxResults, formatCurrency, formatPercentage, FilingStatus } from '@/utils/taxCalculations';

export interface TaxScenario {
  id: string;
  name: string;
  income: number;
  filingStatus: FilingStatus;
  deductions: number;
  useStandardDeduction: boolean;
  federalWithholding: number;
  stateWithholding: number;
  includeStateTaxes: boolean;
  selectedState: string;
  results: TaxResults | null;
  stateResults: TaxResults | null;
}

interface ScenarioCompareProps {
  currentScenario: Omit<TaxScenario, 'id' | 'name'>;
  savedScenarios: TaxScenario[];
  onSaveScenario: (name: string) => void;
  onLoadScenario: (scenario: TaxScenario) => void;
  onDeleteScenario: (id: string) => void;
}

const ScenarioCompare: React.FC<ScenarioCompareProps> = ({
  currentScenario,
  savedScenarios,
  onSaveScenario,
  onLoadScenario,
  onDeleteScenario
}) => {
  const [scenarioName, setScenarioName] = React.useState('');
  const [showComparison, setShowComparison] = React.useState(false);
  const [comparisonScenario, setComparisonScenario] = React.useState<TaxScenario | null>(null);

  const handleSaveScenario = () => {
    if (scenarioName.trim()) {
      onSaveScenario(scenarioName);
      setScenarioName('');
    }
  };

  const handleCompare = (scenario: TaxScenario) => {
    setComparisonScenario(scenario);
    setShowComparison(true);
  };

  const formatFilingStatus = (status: FilingStatus): string => {
    switch (status) {
      case 'single': return 'Single';
      case 'married': return 'Married Filing Jointly';
      case 'marriedSeparate': return 'Married Filing Separately';
      case 'qualifiedWidow': return 'Qualifying Surviving Spouse';
      case 'headOfHousehold': return 'Head of Household';
      default: return status;
    }
  };

  // Get total refund/owed amount (federal + state if applicable)
  const getTotalRefundOrOwed = (results: TaxResults | null, stateResults: TaxResults | null) => {
    if (!results) return 0;
    return results.refundOrOwed + (stateResults?.refundOrOwed || 0);
  };

  // Calculate difference between scenarios
  const calculateDifference = () => {
    if (!comparisonScenario || !currentScenario.results) return 0;
    
    const currentTotal = getTotalRefundOrOwed(currentScenario.results, currentScenario.stateResults);
    const comparisonTotal = getTotalRefundOrOwed(comparisonScenario.results, comparisonScenario.stateResults);
    
    return currentTotal - comparisonTotal;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tax Scenarios</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Save Current Scenario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Tax Scenario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="scenario-name" className="text-sm font-medium">
                  Scenario Name
                </label>
                <input
                  id="scenario-name"
                  className="w-full border rounded px-3 py-2"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., Standard Deduction Scenario"
                />
              </div>
              <Button onClick={handleSaveScenario} disabled={!scenarioName.trim()}>
                Save Scenario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {savedScenarios.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {savedScenarios.map((scenario) => (
            <Card key={scenario.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleCompare(scenario)}
                      aria-label="Compare scenario"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onLoadScenario(scenario)}
                      aria-label="Load scenario"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income:</span>
                    <span>{formatCurrency(scenario.income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filing Status:</span>
                    <span>{formatFilingStatus(scenario.filingStatus)}</span>
                  </div>
                  {scenario.results && (
                    <div className="flex justify-between font-medium pt-1">
                      <span>Total Refund/Owed:</span>
                      <span className={getTotalRefundOrOwed(scenario.results, scenario.stateResults) > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                        {formatCurrency(Math.abs(getTotalRefundOrOwed(scenario.results, scenario.stateResults)))}
                        {getTotalRefundOrOwed(scenario.results, scenario.stateResults) > 0 ? ' Refund' : ' Owed'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Save tax scenarios to compare different options and maximize your refund.</p>
        </div>
      )}

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Scenario Comparison</DialogTitle>
          </DialogHeader>
          
          {comparisonScenario && currentScenario.results && (
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-4">
                <h3 className="font-medium">Current Scenario</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income:</span>
                    <span>{formatCurrency(currentScenario.income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filing Status:</span>
                    <span>{formatFilingStatus(currentScenario.filingStatus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deduction:</span>
                    <span>
                      {currentScenario.useStandardDeduction 
                        ? 'Standard' 
                        : `Itemized (${formatCurrency(currentScenario.deductions)})`}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1">
                    <span>Federal Tax:</span>
                    <span>{formatCurrency(currentScenario.results.taxLiability)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Refund/Owed:</span>
                    <span 
                      className={getTotalRefundOrOwed(
                        currentScenario.results, 
                        currentScenario.stateResults
                      ) > 0 ? 'text-emerald-500' : 'text-rose-500'}
                    >
                      {formatCurrency(Math.abs(getTotalRefundOrOwed(
                        currentScenario.results, 
                        currentScenario.stateResults
                      )))}
                      {getTotalRefundOrOwed(currentScenario.results, currentScenario.stateResults) > 0 
                        ? ' Refund' 
                        : ' Owed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">{comparisonScenario.name}</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income:</span>
                    <span>{formatCurrency(comparisonScenario.income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filing Status:</span>
                    <span>{formatFilingStatus(comparisonScenario.filingStatus)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deduction:</span>
                    <span>
                      {comparisonScenario.useStandardDeduction 
                        ? 'Standard' 
                        : `Itemized (${formatCurrency(comparisonScenario.deductions)})`}
                    </span>
                  </div>
                  {comparisonScenario.results && (
                    <>
                      <div className="flex justify-between font-medium pt-1">
                        <span>Federal Tax:</span>
                        <span>{formatCurrency(comparisonScenario.results.taxLiability)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Refund/Owed:</span>
                        <span 
                          className={getTotalRefundOrOwed(
                            comparisonScenario.results, 
                            comparisonScenario.stateResults
                          ) > 0 ? 'text-emerald-500' : 'text-rose-500'}
                        >
                          {formatCurrency(Math.abs(getTotalRefundOrOwed(
                            comparisonScenario.results, 
                            comparisonScenario.stateResults
                          )))}
                          {getTotalRefundOrOwed(comparisonScenario.results, comparisonScenario.stateResults) > 0 
                            ? ' Refund' 
                            : ' Owed'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="col-span-2 mt-4 p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Difference:</span>
                  <span 
                    className={`font-bold ${calculateDifference() > 0 
                      ? 'text-emerald-500' 
                      : calculateDifference() < 0 
                        ? 'text-rose-500' 
                        : ''}`}
                  >
                    {formatCurrency(Math.abs(calculateDifference()))}
                    {calculateDifference() === 0
                      ? ''
                      : calculateDifference() > 0
                        ? ' better in current scenario'
                        : ' better in saved scenario'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenarioCompare;
