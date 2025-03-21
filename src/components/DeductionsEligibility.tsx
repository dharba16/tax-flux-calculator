
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeductionInfo } from '@/utils/deductionEligibility';
import { formatCurrency } from '@/utils/taxCalculations';
import { 
  GraduationCap, 
  Stethoscope, 
  PiggyBank, 
  HeartPulse, 
  HandCoins,
  BadgeDollarSign,
  Receipt,
  Home,
  Baby,
  Globe,
  Check
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AnimatedNumber from './AnimatedNumber';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface DeductionsEligibilityProps {
  eligibleDeductions: DeductionInfo[];
  stateEligibleDeductions?: DeductionInfo[];
  includeStateTaxes?: boolean;
  selectedState?: string;
  selectedDeductionIds: string[];
  onDeductionSelect: (id: string, selected: boolean) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'graduation-cap': <GraduationCap className="h-5 w-5" />,
  'stethoscope': <Stethoscope className="h-5 w-5" />,
  'piggy-bank': <PiggyBank className="h-5 w-5" />,
  'heart-pulse': <HeartPulse className="h-5 w-5" />,
  'hand-coins': <HandCoins className="h-5 w-5" />,
  'badge-dollar-sign': <BadgeDollarSign className="h-5 w-5" />,
  'receipt': <Receipt className="h-5 w-5" />,
  'home': <Home className="h-5 w-5" />,
  'baby': <Baby className="h-5 w-5" />,
  'globe': <Globe className="h-5 w-5" />,
  'check': <Check className="h-5 w-5" />
};

const DeductionsEligibility: React.FC<DeductionsEligibilityProps> = ({ 
  eligibleDeductions, 
  stateEligibleDeductions = [],
  includeStateTaxes = false,
  selectedState = '',
  selectedDeductionIds,
  onDeductionSelect
}) => {
  // Calculate the total potential deduction amount
  const calculateTotalPotential = (deductions: DeductionInfo[]) => {
    return deductions.reduce((total, deduction) => 
      total + (deduction.eligibleAmount || 0), 0);
  };
  
  // Calculate total of selected deductions
  const calculateSelectedTotal = (deductions: DeductionInfo[]) => {
    return deductions
      .filter(deduction => selectedDeductionIds.includes(deduction.id) && deduction.eligibleAmount !== null)
      .reduce((total, deduction) => total + (deduction.eligibleAmount || 0), 0);
  };
  
  const federalTotal = calculateTotalPotential(eligibleDeductions);
  const stateTotal = calculateTotalPotential(stateEligibleDeductions);
  
  const selectedFederalTotal = calculateSelectedTotal(eligibleDeductions);
  const selectedStateTotal = calculateSelectedTotal(stateEligibleDeductions);
  
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Potential Deduction Opportunities</span>
          <div className="flex gap-2 flex-wrap items-center justify-end">
            <Badge variant="outline" className="font-normal">
              Federal: <AnimatedNumber 
                value={federalTotal} 
                formatter={(val) => formatCurrency(val)}
                className="ml-1"
              />
            </Badge>
            {selectedFederalTotal > 0 && (
              <Badge variant="default" className="font-normal bg-primary/90">
                Selected: <AnimatedNumber 
                  value={selectedFederalTotal} 
                  formatter={(val) => formatCurrency(val)}
                  className="ml-1"
                />
              </Badge>
            )}
            {includeStateTaxes && stateTotal > 0 && (
              <Badge variant="outline" className="font-normal">
                State: <AnimatedNumber 
                  value={stateTotal} 
                  formatter={(val) => formatCurrency(val)}
                  className="ml-1"
                />
              </Badge>
            )}
            {includeStateTaxes && selectedStateTotal > 0 && (
              <Badge variant="default" className="font-normal bg-primary/90">
                Selected: <AnimatedNumber 
                  value={selectedStateTotal} 
                  formatter={(val) => formatCurrency(val)}
                  className="ml-1"
                />
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Federal deductions */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Federal</h4>
          {eligibleDeductions.map((deduction) => (
            <div key={deduction.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Checkbox
                    id={`deduction-${deduction.id}`}
                    checked={selectedDeductionIds.includes(deduction.id)}
                    onCheckedChange={(checked) => {
                      onDeductionSelect(deduction.id, checked === true);
                    }}
                    disabled={deduction.eligibleAmount === null}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </div>
                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {iconMap[deduction.icon] || <BadgeDollarSign className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">{deduction.name}</h4>
                    {deduction.eligibleAmount !== null && (
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(deduction.eligibleAmount)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{deduction.description}</p>
                  <div className="text-xs">
                    <p className="text-muted-foreground">{deduction.eligibilityMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* State deductions */}
        {includeStateTaxes && stateEligibleDeductions.length > 0 && (
          <div className="space-y-3 mt-6">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{selectedState} State</h4>
            {stateEligibleDeductions.map((deduction) => (
              <div key={deduction.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      id={`state-deduction-${deduction.id}`}
                      checked={selectedDeductionIds.includes(deduction.id)}
                      onCheckedChange={(checked) => {
                        onDeductionSelect(deduction.id, checked === true);
                      }}
                      disabled={deduction.eligibleAmount === null}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  </div>
                  <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    {iconMap[deduction.icon] || <BadgeDollarSign className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{deduction.name}</h4>
                      {deduction.eligibleAmount !== null && (
                        <span className="text-sm font-medium text-primary">
                          {formatCurrency(deduction.eligibleAmount)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{deduction.description}</p>
                    <div className="text-xs">
                      <p className="text-muted-foreground">{deduction.eligibilityMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Select potential deductions to include in your calculation. These will be added to your scenarios. Consult with a tax professional for personalized advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionsEligibility;
