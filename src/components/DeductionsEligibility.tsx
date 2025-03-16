
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

interface DeductionsEligibilityProps {
  eligibleDeductions: DeductionInfo[];
  stateEligibleDeductions?: DeductionInfo[];
  includeStateTaxes?: boolean;
  selectedState?: string;
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
  selectedState = ''
}) => {
  // Calculate the total potential deduction amount
  const calculateTotalPotential = (deductions: DeductionInfo[]) => {
    return deductions.reduce((total, deduction) => 
      total + (deduction.eligibleAmount || 0), 0);
  };
  
  const federalTotal = calculateTotalPotential(eligibleDeductions);
  const stateTotal = calculateTotalPotential(stateEligibleDeductions);
  
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Potential Deduction Opportunities</span>
          <Badge variant="outline" className="font-normal">
            Federal: <AnimatedNumber 
              value={federalTotal} 
              formatter={(val) => formatCurrency(val)}
              className="ml-1"
            />
            {includeStateTaxes && stateTotal > 0 && (
              <span className="ml-2">
                State: <AnimatedNumber 
                  value={stateTotal} 
                  formatter={(val) => formatCurrency(val)}
                  className="ml-1"
                />
              </span>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Federal deductions */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Federal</h4>
          {eligibleDeductions.map((deduction) => (
            <div key={deduction.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
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
        
        {/* State deductions if enabled - only show in main component, not in the StateTaxSettings */}
        {includeStateTaxes && stateEligibleDeductions.length > 0 && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {selectedState} State
              </h4>
              
              {stateEligibleDeductions.map((deduction) => (
                <div key={deduction.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                      {iconMap[deduction.icon] || <BadgeDollarSign className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">{deduction.name}</h4>
                        {deduction.eligibleAmount !== null && (
                          <span className="text-sm font-medium text-secondary">
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
          </>
        )}
        
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            These are potential deductions you may be eligible for. Consult with a tax professional for personalized advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionsEligibility;
