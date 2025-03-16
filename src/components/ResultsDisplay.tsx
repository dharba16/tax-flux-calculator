
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TaxResults, formatCurrency, formatPercentage } from '@/utils/taxCalculations';
import AnimatedNumber from './AnimatedNumber';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface ResultsDisplayProps {
  results: TaxResults;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const isRefund = results.refundOrOwed > 0;
  
  return (
    <div className="animate-fade-in space-y-6">
      <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {isRefund ? "Your Tax Refund" : "You Owe"}
            </h3>
            <div className={`flex items-center text-4xl md:text-5xl font-semibold ${isRefund ? 'text-emerald-500' : 'text-rose-500'}`}>
              <AnimatedNumber 
                value={Math.abs(results.refundOrOwed)}
                formatter={(val) => formatCurrency(val)}
                duration={800}
              />
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              {isRefund ? (
                <ArrowDownIcon className="w-4 h-4 mr-1 text-emerald-500" />
              ) : (
                <ArrowUpIcon className="w-4 h-4 mr-1 text-rose-500" />
              )}
              <span>{isRefund ? "Refund" : "Amount Due"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      {/* Tax Bracket Breakdown */}
      {results.bracketBreakdown.length > 0 && (
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">Tax Bracket Breakdown</h3>
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
                    <span className="font-medium">{formatCurrency(bracket.amount)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-border mt-2 text-sm font-medium">
                <span>Total Tax</span>
                <span>{formatCurrency(results.taxLiability)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface DetailCardProps {
  label: string;
  value: number;
  formatter: (value: number) => string;
}

const DetailCard: React.FC<DetailCardProps> = ({ label, value, formatter }) => {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="text-xl font-medium mt-1">
            <AnimatedNumber 
              value={value}
              formatter={formatter}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
