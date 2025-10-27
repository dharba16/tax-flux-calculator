
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TaxResults, formatCurrency, formatPercentage } from '@/utils/taxCalculations';
import AnimatedNumber from './AnimatedNumber';
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, GlobeIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ResultsDisplayProps {
  results: TaxResults;
  stateResults?: TaxResults | null;
  includeStateTaxes?: boolean;
  selectedState?: string;
  isInternationalStudent?: boolean;
  allStateResults?: Record<string, any>;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  stateResults = null,
  includeStateTaxes = false,
  selectedState = '',
  isInternationalStudent = false,
  allStateResults = {}
}) => {
  const isRefund = results.refundOrOwed > 0;
  
  // Calculate combined federal and state refund/owed if state taxes are included
  const combinedRefundOrOwed = includeStateTaxes && stateResults 
    ? results.refundOrOwed + stateResults.refundOrOwed
    : results.refundOrOwed;
  
  const isCombinedRefund = combinedRefundOrOwed > 0;
  
  // If international student, show all state comparison
  if (isInternationalStudent && includeStateTaxes) {
    const sortedStates = Object.entries(allStateResults)
      .map(([state, result]) => ({
        state,
        taxLiability: result.taxLiability || 0,
        refundOrOwed: result.refundOrOwed || 0,
        effectiveRate: result.effectiveTaxRate || 0
      }))
      .sort((a, b) => a.taxLiability - b.taxLiability);
    
    return (
      <div className="animate-fade-in space-y-6">
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <GlobeIcon className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">All States Tax Comparison</h3>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Sorted by lowest to highest tax liability
            </p>
            <div className="max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {sortedStates.map(({ state, taxLiability, refundOrOwed, effectiveRate }) => (
                  <div 
                    key={state}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/80 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{state}</h4>
                      <p className="text-xs text-muted-foreground">
                        Effective Rate: {formatPercentage(effectiveRate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(taxLiability)}
                      </div>
                      <div className={`text-xs ${refundOrOwed > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {refundOrOwed > 0 ? 'Refund: ' : 'Owed: '}
                        {formatCurrency(Math.abs(refundOrOwed))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Federal Tax Card */}
        <Card className="overflow-hidden border border-border/50 bg-blue-50 dark:bg-blue-950/20 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="space-y-5">
              <div className="flex items-center mb-2">
                <DollarSignIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-medium">Federal Tax Results</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center text-center mb-5">
                <p className="text-sm text-muted-foreground mb-1">
                  {isRefund ? "Federal Refund" : "Federal Amount Due"}
                </p>
                <div className={`flex items-center text-3xl md:text-4xl font-semibold min-w-32 ${isRefund ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <AnimatedNumber 
                    value={Math.abs(results.refundOrOwed)}
                    formatter={(val) => formatCurrency(val)}
                    duration={800}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs text-muted-foreground">Taxable Income</p>
                  <div className="text-base font-medium min-w-24">
                    <AnimatedNumber 
                      value={results.taxableIncome}
                      formatter={formatCurrency}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs text-muted-foreground">Tax Liability</p>
                  <div className="text-base font-medium min-w-24">
                    <AnimatedNumber 
                      value={results.taxLiability}
                      formatter={formatCurrency}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs text-muted-foreground">Effective Rate</p>
                  <div className="text-base font-medium min-w-24">
                    <AnimatedNumber 
                      value={results.effectiveTaxRate}
                      formatter={formatPercentage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      {/* Combined Result Card */}
      {includeStateTaxes && (
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Tax Result
              </h3>
              <div className={`flex items-center text-4xl md:text-5xl font-semibold min-w-40 ${isCombinedRefund ? 'text-emerald-500' : 'text-rose-500'}`}>
                <AnimatedNumber 
                  value={Math.abs(combinedRefundOrOwed)}
                  formatter={(val) => formatCurrency(val)}
                  duration={800}
                />
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                {isCombinedRefund ? (
                  <ArrowDownIcon className="w-4 h-4 mr-1 text-emerald-500" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4 mr-1 text-rose-500" />
                )}
                <span>{isCombinedRefund ? "Refund" : "Amount Due"}</span>
                <span className="ml-1">(Federal + State)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Federal Tax Card */}
      <Card className="overflow-hidden border border-border/50 bg-blue-50 dark:bg-blue-950/20 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="space-y-5">
            <div className="flex items-center mb-2">
              <DollarSignIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-medium">Federal Tax Results</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center text-center mb-5">
              <p className="text-sm text-muted-foreground mb-1">
                {isRefund ? "Federal Refund" : "Federal Amount Due"}
              </p>
              <div className={`flex items-center text-3xl md:text-4xl font-semibold min-w-32 ${isRefund ? 'text-emerald-500' : 'text-rose-500'}`}>
                <AnimatedNumber 
                  value={Math.abs(results.refundOrOwed)}
                  formatter={(val) => formatCurrency(val)}
                  duration={800}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground">Taxable Income</p>
                <div className="text-base font-medium min-w-24">
                  <AnimatedNumber 
                    value={results.taxableIncome}
                    formatter={formatCurrency}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground">Tax Liability</p>
                <div className="text-base font-medium min-w-24">
                  <AnimatedNumber 
                    value={results.taxLiability}
                    formatter={formatCurrency}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground">Effective Rate</p>
                <div className="text-base font-medium min-w-24">
                  <AnimatedNumber 
                    value={results.effectiveTaxRate}
                    formatter={formatPercentage}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground">Marginal Rate</p>
                <div className="text-base font-medium min-w-24">
                  <AnimatedNumber 
                    value={results.marginalRate}
                    formatter={formatPercentage}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground">Deduction</p>
                <div className="text-base font-medium min-w-24">
                  <AnimatedNumber 
                    value={results.deductionAmount}
                    formatter={formatCurrency}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Federal Tax Bracket Breakdown */}
      {results.bracketBreakdown.length > 0 && (
        <Card className="overflow-hidden border border-border/50 bg-blue-50 dark:bg-blue-950/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
              Federal Tax Bracket Breakdown
            </h3>
            <div className="space-y-2">
              {results.bracketBreakdown.map((bracket, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ 
                        backgroundColor: `hsl(${210 - index * 25}, ${70}%, ${50 + index * 5}%)` 
                      }}
                    />
                    <span>{formatPercentage(bracket.rate)} bracket</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-muted-foreground">
                      {formatCurrency(bracket.rangeStart)} - {bracket.rangeEnd === Infinity ? '+' : formatCurrency(bracket.rangeEnd)}
                    </span>
                    <span className="font-medium min-w-20 text-right">{formatCurrency(bracket.amount)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border mt-2 text-sm font-medium">
                <span>Total Federal Tax</span>
                <span className="min-w-20 text-right">{formatCurrency(results.taxLiability)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* State Tax Card */}
      {includeStateTaxes && stateResults && (
        <>
          <Card className="overflow-hidden border border-border/50 bg-green-50 dark:bg-green-950/20 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="space-y-5">
                <div className="flex items-center mb-2">
                  <GlobeIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  <h3 className="text-base font-medium">{selectedState} State Tax Results</h3>
                </div>
                
                {["Florida", "Texas", "Washington", "Nevada", "Alaska", "Wyoming", "South Dakota"].includes(selectedState) ? (
                  <div className="text-center py-4">
                    <h3 className="text-lg font-medium mb-2">No State Income Tax</h3>
                    <p className="text-muted-foreground">
                      {selectedState} does not impose a state income tax on residents.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center text-center mb-5">
                      <p className="text-sm text-muted-foreground mb-1">
                        {stateResults.refundOrOwed > 0 ? "State Refund" : "State Amount Due"}
                      </p>
                      <div className={`flex items-center text-3xl md:text-4xl font-semibold min-w-32 ${stateResults.refundOrOwed > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <AnimatedNumber 
                          value={Math.abs(stateResults.refundOrOwed)}
                          formatter={(val) => formatCurrency(val)}
                          duration={800}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs text-muted-foreground">Taxable Income</p>
                        <div className="text-base font-medium min-w-24">
                          <AnimatedNumber 
                            value={stateResults.taxableIncome}
                            formatter={formatCurrency}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs text-muted-foreground">Tax Liability</p>
                        <div className="text-base font-medium min-w-24">
                          <AnimatedNumber 
                            value={stateResults.taxLiability}
                            formatter={formatCurrency}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs text-muted-foreground">Effective Rate</p>
                        <div className="text-base font-medium min-w-24">
                          <AnimatedNumber 
                            value={stateResults.effectiveTaxRate}
                            formatter={formatPercentage}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs text-muted-foreground">Marginal Rate</p>
                        <div className="text-base font-medium min-w-24">
                          <AnimatedNumber 
                            value={stateResults.marginalRate}
                            formatter={formatPercentage}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs text-muted-foreground">Deduction</p>
                        <div className="text-base font-medium min-w-24">
                          <AnimatedNumber 
                            value={stateResults.deductionAmount}
                            formatter={formatCurrency}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* State Tax Bracket Breakdown */}
          {stateResults.bracketBreakdown.length > 0 && stateResults.bracketBreakdown[0].rate > 0 && (
            <Card className="overflow-hidden border border-border/50 bg-green-50 dark:bg-green-950/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <GlobeIcon className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                  {selectedState} State Tax Bracket Breakdown
                </h3>
                <div className="space-y-2">
                  {stateResults.bracketBreakdown.map((bracket, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: `hsl(${150 - index * 20}, ${65}%, ${55 + index * 5}%)` 
                          }}
                        />
                        <span>{formatPercentage(bracket.rate)} bracket</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-muted-foreground">
                          {formatCurrency(bracket.rangeStart)} - {bracket.rangeEnd === Infinity ? '+' : formatCurrency(bracket.rangeEnd)}
                        </span>
                        <span className="font-medium min-w-20 text-right">{formatCurrency(bracket.amount)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-border mt-2 text-sm font-medium">
                    <span>Total {selectedState} State Tax</span>
                    <span className="min-w-20 text-right">{formatCurrency(stateResults.taxLiability)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsDisplay;
