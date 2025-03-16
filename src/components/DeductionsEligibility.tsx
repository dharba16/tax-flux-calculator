
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DeductionInfo } from '@/utils/deductionEligibility';
import { formatCurrency } from '@/utils/taxCalculations';
import { 
  GraduationCap, 
  Stethoscope, 
  PiggyBank, 
  HeartPulse, 
  HandCoins,
  BadgeDollarSign,
  Receipt
} from 'lucide-react';

interface DeductionsEligibilityProps {
  eligibleDeductions: DeductionInfo[];
}

const iconMap: Record<string, React.ReactNode> = {
  'graduation-cap': <GraduationCap className="h-5 w-5" />,
  'stethoscope': <Stethoscope className="h-5 w-5" />,
  'piggy-bank': <PiggyBank className="h-5 w-5" />,
  'heart-pulse': <HeartPulse className="h-5 w-5" />,
  'hand-coins': <HandCoins className="h-5 w-5" />,
  'badge-dollar-sign': <BadgeDollarSign className="h-5 w-5" />,
  'receipt': <Receipt className="h-5 w-5" />
};

const DeductionsEligibility: React.FC<DeductionsEligibilityProps> = ({ eligibleDeductions }) => {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-3">Potential Deduction Opportunities</h3>
        <div className="space-y-4">
          {eligibleDeductions.map((deduction) => (
            <div key={deduction.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {iconMap[deduction.icon] || <BadgeDollarSign className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{deduction.name}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{deduction.description}</p>
                  <div className="text-xs">
                    {deduction.eligibleAmount !== null && (
                      <p className="font-medium text-primary">
                        Up to {formatCurrency(deduction.eligibleAmount)}
                      </p>
                    )}
                    <p className="text-muted-foreground">{deduction.eligibilityMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
