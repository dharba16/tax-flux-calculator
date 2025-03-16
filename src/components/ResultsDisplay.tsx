
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TaxResults, formatCurrency, formatPercentage } from '@/utils/taxCalculations';
import AnimatedNumber from './AnimatedNumber';
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, GlobeIcon, ReceiptIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResultsDisplayProps {
  results: TaxResults;
  stateResults?: TaxResults | null;
  includeStateTaxes?: boolean;
  selectedState?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results, 
  stateResults = null,
  includeStateTaxes = false,
  selectedState = ''
}) => {
  const federalRefund = results.refundOrOwed;
  const stateRefund = stateResults ? stateResults.refundOrOwed : 0;
  const totalRefund = federalRefund + stateRefund;
  
  const isFederalRefund = federalRefund > 0;
  const isStateRefund = stateRefund > 0;
  const isTotalRefund = totalRefund > 0;
  
  return (
    <div className="animate-fade-in space-y-6">
      <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            {/* Total combined refund/owed */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Tax Result
              </h3>
              <div className={`flex items-center text-4xl md:text-5xl font-semibold ${isTotalRefund ? 'text-emerald-500' : 'text-rose-500'}`}>
                <span className="mr-1">{isTotalRefund ? '' : '-'}</span>
                <AnimatedNumber 
                  value={Math.abs(totalRefund)}
                  formatter={(val) => formatCurrency(val)}
                  duration={800}
                  className="min-w-[200px] text-right"
                />
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                {isTotalRefund ? (
                  <ArrowDownIcon className="w-4 h-4 mr-1 text-emerald-500" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4 mr-1 text-rose-500" />
                )}
                <span>{isTotalRefund ? "Total Refund" : "Total Amount Due"}</span>
              </div>
            </div>
            
            {/* Individual refund breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Federal refund card */}
              <DetailCard
                label="Federal Tax"
                value={federalRefund}
                formatter={(value) => formatCurrency(Math.abs(value))}
                isRefund={isFederalRefund}
                icon={<DollarSignIcon className="w-4 h-4" />}
                showSign={true}
              />
              
              {/* State refund card (if state taxes included) */}
              {includeStateTaxes && (
                <DetailCard
                  label={`${selectedState} State Tax`}
                  value={stateRefund}
                  formatter={(value) => formatCurrency(Math.abs(value))}
                  isRefund={isStateRefund}
                  icon={<GlobeIcon className="w-4 h-4" />}
                  showSign={true}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {includeStateTaxes ? (
        <Tabs defaultValue="federal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="federal" className="flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-1" />
              Federal
            </TabsTrigger>
            <TabsTrigger value="state" className="flex items-center">
              <GlobeIcon className="w-4 h-4 mr-1" />
              {selectedState}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="federal">
            <FederalTaxDetails results={results} />
          </TabsContent>
          
          <TabsContent value="state">
            {stateResults && (
              <StateTaxDetails stateResults={stateResults} selectedState={selectedState} />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <FederalTaxDetails results={results} />
      )}
    </div>
  );
};

interface DetailCardProps {
  label: string;
  value: number;
  formatter: (value: number) => string;
  isState?: boolean;
  isRefund?: boolean;
  icon?: React.ReactNode;
  showSign?: boolean;
}

const DetailCard: React.FC<DetailCardProps> = ({ 
  label, 
  value, 
  formatter, 
  isState = false,
  isRefund = false,
  icon = null,
  showSign = false
}) => {
  return (
    <Card className={`overflow-hidden border border-border/50 ${isState ? 'bg-secondary/5' : 'bg-card/50'} backdrop-blur-sm`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {icon}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
          <div className={`text-xl font-medium ${isRefund ? 'text-emerald-500' : 'text-rose-500'} min-w-[150px] text-right`}>
            {showSign && <span>{isRefund ? '+' : '-'} </span>}
            <AnimatedNumber 
              value={Math.abs(value)}
              formatter={formatter}
              className="w-full inline-flex justify-end"
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          {isRefund ? (
            <>
              <ArrowDownIcon className="w-3 h-3 mr-1 text-emerald-500" />
              <span>Refund</span>
            </>
          ) : (
            <>
              <ArrowUpIcon className="w-3 h-3 mr-1 text-rose-500" />
              <span>Amount Due</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface FederalTaxDetailsProps {
  results: TaxResults;
}

const FederalTaxDetails: React.FC<FederalTaxDetailsProps> = ({ results }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <DollarSignIcon className="w-4 h-4 mr-1" />
          Federal Tax Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailCard
            label="Taxable Income"
            value={results.taxableIncome}
            formatter={formatCurrency}
          />
          <DetailCard
            label="Tax Liability"
            value={results.taxLiability}
            formatter={formatCurrency}
          />
          <DetailCard
            label="Effective Rate"
            value={results.effectiveTaxRate}
            formatter={formatPercentage}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <DetailCard
            label="Marginal Tax Rate"
            value={results.marginalRate}
            formatter={formatPercentage}
          />
          <DetailCard
            label="Deduction Amount"
            value={results.deductionAmount}
            formatter={formatCurrency}
          />
        </div>
        
        <div className="mt-4">
          <DetailCard
            label="Federal Refund/Owed"
            value={results.refundOrOwed}
            formatter={(value) => `${value >= 0 ? '+' : '-'} ${formatCurrency(Math.abs(value))}`}
          />
        </div>
      </div>
      
      {/* Federal Tax Bracket Breakdown */}
      {results.bracketBreakdown.length > 0 && (
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Federal Tax Bracket Breakdown</h3>
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
                    <span className="font-medium min-w-[100px] text-right">{formatCurrency(bracket.amount)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border mt-2 text-sm font-medium">
                <span>Total Federal Tax</span>
                <span className="min-w-[100px] text-right">{formatCurrency(results.taxLiability)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface StateTaxDetailsProps {
  stateResults: TaxResults;
  selectedState: string;
}

const StateTaxDetails: React.FC<StateTaxDetailsProps> = ({ stateResults, selectedState }) => {
  const hasNoIncomeTax = ["Florida", "Texas", "Washington", "Nevada", "Alaska", "Wyoming", "South Dakota"].includes(selectedState);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <GlobeIcon className="w-4 h-4 mr-1" />
          {selectedState} State Tax Details
        </h3>
        
        {hasNoIncomeTax ? (
          <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No State Income Tax</h3>
              <p className="text-muted-foreground">
                {selectedState} does not impose a state income tax on residents.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailCard
                label="State Taxable Income"
                value={stateResults.taxableIncome}
                formatter={formatCurrency}
                isState={true}
              />
              <DetailCard
                label="State Tax Liability"
                value={stateResults.taxLiability}
                formatter={formatCurrency}
                isState={true}
              />
              <DetailCard
                label="State Effective Rate"
                value={stateResults.effectiveTaxRate}
                formatter={formatPercentage}
                isState={true}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <DetailCard
                label="State Marginal Rate"
                value={stateResults.marginalRate}
                formatter={formatPercentage}
                isState={true}
              />
              <DetailCard
                label="State Deduction"
                value={stateResults.deductionAmount}
                formatter={formatCurrency}
                isState={true}
              />
            </div>
            
            {/* State Tax Bracket Breakdown */}
            {stateResults.bracketBreakdown.length > 0 && stateResults.bracketBreakdown[0].rate > 0 && (
              <Card className="overflow-hidden border border-border/50 bg-secondary/5 backdrop-blur-sm mt-6">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-3">{selectedState} State Tax Bracket Breakdown</h3>
                  <div className="space-y-2">
                    {stateResults.bracketBreakdown.map((bracket, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ 
                              backgroundColor: `hsl(${280 - index * 20}, ${65}%, ${55 + index * 5}%)` 
                            }}
                          />
                          <span>{formatPercentage(bracket.rate)} bracket</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-muted-foreground">
                            {formatCurrency(bracket.rangeStart)} - {bracket.rangeEnd === Infinity ? '+' : formatCurrency(bracket.rangeEnd)}
                          </span>
                          <span className="font-medium min-w-[100px] text-right">{formatCurrency(bracket.amount)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-border mt-2 text-sm font-medium">
                      <span>Total {selectedState} State Tax</span>
                      <span className="min-w-[100px] text-right">{formatCurrency(stateResults.taxLiability)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
