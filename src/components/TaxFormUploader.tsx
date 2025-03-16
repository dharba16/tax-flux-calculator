
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaxFormUploaderProps {
  onFormProcessed: (formData: {
    income?: number;
    federalWithholding?: number;
    stateWithholding?: number;
  }) => void;
}

// Group tax forms by category for better organization
const TAX_FORM_CATEGORIES = {
  income: {
    label: "Income & Earnings",
    forms: [
      { id: "w2", name: "W-2", description: "Wage and Tax Statement (employees)" },
      { id: "1099nec", name: "1099-NEC", description: "Nonemployee Compensation (freelancers/contractors)" },
      { id: "1099misc", name: "1099-MISC", description: "Miscellaneous Income (rents, royalties, other payments)" },
      { id: "1099k", name: "1099-K", description: "Payment Card & Third Party Network Transactions" },
      { id: "1099int", name: "1099-INT", description: "Interest Income (banks, savings accounts)" },
      { id: "1099div", name: "1099-DIV", description: "Dividend Income (stocks, mutual funds)" },
      { id: "1099b", name: "1099-B", description: "Proceeds from Broker and Barter Exchange" },
      { id: "1099r", name: "1099-R", description: "Distributions from Pensions, Annuities, IRAs" },
      { id: "ssa1099", name: "SSA-1099", description: "Social Security Benefit Statement" }
    ]
  },
  business: {
    label: "Self-Employed & Business",
    forms: [
      { id: "scheduleC", name: "Schedule C", description: "Profit or Loss from Business (sole proprietors)" },
      { id: "scheduleSE", name: "Schedule SE", description: "Self-Employment Tax" },
      { id: "1040es", name: "Form 1040-ES", description: "Estimated Tax Payment" },
      { id: "1120", name: "Form 1120", description: "Corporate Income Tax Return (C corps)" },
      { id: "1120s", name: "Form 1120S", description: "S Corporation Tax Return" },
      { id: "1065", name: "Form 1065", description: "Partnership Tax Return" }
    ]
  },
  deductions: {
    label: "Deductions & Credits",
    forms: [
      { id: "scheduleA", name: "Schedule A", description: "Itemized Deductions" },
      { id: "scheduleE", name: "Schedule E", description: "Rental Income & Royalties" },
      { id: "scheduleF", name: "Schedule F", description: "Farming Income" },
      { id: "form8862", name: "Form 8862", description: "Earned Income Credit After Disallowance" },
      { id: "form2441", name: "Form 2441", description: "Child and Dependent Care Expenses" },
      { id: "form8917", name: "Form 8917", description: "Tuition and Fees Deduction" },
      { id: "form8863", name: "Form 8863", description: "Education Credits" },
      { id: "form8880", name: "Form 8880", description: "Credit for Retirement Savings Contributions" }
    ]
  },
  education: {
    label: "Education",
    forms: [
      { id: "1098t", name: "1098-T", description: "Tuition Statement (education credits)" },
      { id: "1098e", name: "1098-E", description: "Student Loan Interest Statement" }
    ]
  },
  healthcare: {
    label: "Healthcare & Insurance",
    forms: [
      { id: "1095a", name: "1095-A", description: "Health Insurance Marketplace Statement" },
      { id: "1095b", name: "1095-B", description: "Health Coverage" },
      { id: "1095c", name: "1095-C", description: "Employer-Provided Health Insurance" }
    ]
  },
  investments: {
    label: "Investments & Capital Gains",
    forms: [
      { id: "scheduleD", name: "Schedule D", description: "Capital Gains and Losses" },
      { id: "form8949", name: "Form 8949", description: "Sales of Capital Assets" },
      { id: "form4797", name: "Form 4797", description: "Sales of Business Property" }
    ]
  },
  homeowner: {
    label: "Homeownership",
    forms: [
      { id: "1098", name: "1098", description: "Mortgage Interest Statement" },
      { id: "1099s", name: "1099-S", description: "Proceeds from Real Estate Transactions" }
    ]
  },
  other: {
    label: "Other Important Forms",
    forms: [
      { id: "1040", name: "1040", description: "U.S. Individual Income Tax Return" },
      { id: "1040sr", name: "1040-SR", description: "Tax Return for Seniors" },
      { id: "1040x", name: "1040-X", description: "Amended Tax Return" },
      { id: "w4", name: "W-4", description: "Employee's Withholding Certificate" },
      { id: "w9", name: "W-9", description: "Request for Taxpayer Identification Number" }
    ]
  }
};

// Mock form processing function - in a real app, this would use OCR or a parsing service
const processTaxForm = (file: File): Promise<{
  formType: string;
  income?: number;
  federalWithholding?: number;
  stateWithholding?: number;
}> => {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // This is just a mock implementation
      // In a real app, this would use PDF parsing or OCR to extract data
      
      // Generate some mock data based on the filename
      const filename = file.name.toLowerCase();
      let formType = 'unknown';
      let income = 0;
      let federalWithholding = 0;
      let stateWithholding = 0;
      
      // Handle income and earnings forms
      if (filename.includes('w2') || filename.includes('w-2')) {
        formType = 'W-2';
        income = 75000 + Math.floor(Math.random() * 15000);
        federalWithholding = Math.floor(income * 0.15);
        stateWithholding = Math.floor(income * 0.04);
      } else if (filename.includes('1099')) {
        if (filename.includes('nec')) {
          formType = '1099-NEC';
          income = 45000 + Math.floor(Math.random() * 25000);
          federalWithholding = 0; // 1099-NEC typically doesn't have withholding
        } else if (filename.includes('int')) {
          formType = '1099-INT';
          income = 2000 + Math.floor(Math.random() * 3000);
          federalWithholding = Math.floor(income * 0.10);
        } else if (filename.includes('div')) {
          formType = '1099-DIV';
          income = 3000 + Math.floor(Math.random() * 5000);
          federalWithholding = Math.floor(income * 0.15);
        } else if (filename.includes('misc')) {
          formType = '1099-MISC';
          income = 15000 + Math.floor(Math.random() * 10000);
          federalWithholding = Math.floor(income * 0.07);
        } else if (filename.includes('b')) {
          formType = '1099-B';
          income = 8000 + Math.floor(Math.random() * 20000);
          federalWithholding = Math.floor(income * 0.15);
        } else if (filename.includes('r')) {
          formType = '1099-R';
          income = 22000 + Math.floor(Math.random() * 18000);
          federalWithholding = Math.floor(income * 0.12);
        } else if (filename.includes('k')) {
          formType = '1099-K';
          income = 30000 + Math.floor(Math.random() * 40000);
          federalWithholding = 0; // 1099-K typically doesn't have withholding
        } else if (filename.includes('s')) {
          formType = '1099-S';
          income = 250000 + Math.floor(Math.random() * 150000);
          federalWithholding = 0;
        } else {
          formType = '1099';
          income = 25000 + Math.floor(Math.random() * 15000);
          federalWithholding = Math.floor(income * 0.05);
        }
      } else if (filename.includes('1098')) {
        if (filename.includes('t')) {
          formType = '1098-T';
          // This would show education expenses, not income
          income = 0;
          federalWithholding = 0;
        } else if (filename.includes('e')) {
          formType = '1098-E';
          // This would show student loan interest, not income
          income = 0;
          federalWithholding = 0;
        } else {
          formType = '1098';
          // This would show mortgage interest, not income
          income = 0;
          federalWithholding = 0;
        }
      } else if (filename.includes('1095')) {
        if (filename.includes('a')) {
          formType = '1095-A';
        } else if (filename.includes('b')) {
          formType = '1095-B';
        } else if (filename.includes('c')) {
          formType = '1095-C';
        } else {
          formType = '1095';
        }
        // Health insurance forms don't indicate income
        income = 0;
        federalWithholding = 0;
      } else if (filename.includes('ssa') || filename.includes('ssa-1099')) {
        formType = 'SSA-1099';
        income = 18000 + Math.floor(Math.random() * 12000);
        federalWithholding = Math.floor(income * 0.10);
      } else if (filename.includes('schedule')) {
        if (filename.includes('a')) {
          formType = 'Schedule A';
        } else if (filename.includes('c')) {
          formType = 'Schedule C';
          income = 55000 + Math.floor(Math.random() * 45000);
        } else if (filename.includes('d')) {
          formType = 'Schedule D';
          income = 12000 + Math.floor(Math.random() * 38000);
        } else if (filename.includes('e')) {
          formType = 'Schedule E';
          income = 25000 + Math.floor(Math.random() * 35000);
        } else if (filename.includes('f')) {
          formType = 'Schedule F';
          income = 40000 + Math.floor(Math.random() * 60000);
        } else if (filename.includes('se')) {
          formType = 'Schedule SE';
        }
        federalWithholding = 0; // Schedules typically don't show withholding
      }
      
      resolve({ formType, income, federalWithholding, stateWithholding });
    }, 1500);
  });
};

const TaxFormUploader: React.FC<TaxFormUploaderProps> = ({ onFormProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("income");
  const [uploadedForms, setUploadedForms] = useState<{
    name: string;
    type: string;
    status: 'processing' | 'success' | 'error';
    data?: any;
  }[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if it's a PDF or image file
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF or image files only",
          variant: "destructive",
        });
        continue;
      }
      
      // Add the file to the uploaded forms list
      const newFormIndex = uploadedForms.length;
      setUploadedForms(prev => [
        ...prev,
        { name: file.name, type: 'Detecting...', status: 'processing' }
      ]);
      
      setIsProcessing(true);
      
      try {
        // Process the form
        const result = await processTaxForm(file);
        
        // Update the form in the list
        setUploadedForms(prev => {
          const updated = [...prev];
          updated[newFormIndex] = {
            name: file.name,
            type: result.formType,
            status: 'success',
            data: result
          };
          return updated;
        });
        
        // Call the callback with the extracted data
        onFormProcessed(result);
        
        toast({
          title: "Form processed successfully",
          description: `${result.formType} data extracted from ${file.name}`,
        });
      } catch (error) {
        console.error("Error processing form:", error);
        
        // Update the form in the list to show error
        setUploadedForms(prev => {
          const updated = [...prev];
          updated[newFormIndex] = {
            name: file.name,
            type: 'Unknown',
            status: 'error'
          };
          return updated;
        });
        
        toast({
          title: "Failed to process form",
          description: "There was an error extracting data from the form",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
    
    // Reset the input
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tax-form-upload" className="text-sm font-medium">
          Upload Tax Forms
        </Label>
        <p className="text-sm text-muted-foreground">
          We support a wide range of tax forms. Browse by category below or upload directly.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="w-full h-20 border-dashed flex flex-col gap-1 items-center justify-center hover:bg-muted/50"
            onClick={() => document.getElementById('tax-form-upload')?.click()}
            disabled={isProcessing}
          >
            <Upload className="h-5 w-5 mb-1" />
            <span className="text-sm font-medium">
              {isProcessing ? 'Processing...' : 'Click to upload tax forms'}
            </span>
            <span className="text-xs text-muted-foreground">
              PDF or Image files
            </span>
          </Button>
          <input
            id="tax-form-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Supported Tax Forms
        </Label>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid grid-cols-4 gap-2 mb-2 h-auto overflow-auto">
            <TabsTrigger value="income" className="h-auto py-1.5 text-xs">Income & Earnings</TabsTrigger>
            <TabsTrigger value="business" className="h-auto py-1.5 text-xs">Business</TabsTrigger>
            <TabsTrigger value="deductions" className="h-auto py-1.5 text-xs">Deductions</TabsTrigger>
            <TabsTrigger value="other" className="h-auto py-1.5 text-xs">Other</TabsTrigger>
          </TabsList>
          
          <Card className="border border-border/50">
            <CardContent className="p-3">
              {Object.entries(TAX_FORM_CATEGORIES).map(([key, category]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">{category.label} Forms</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {category.forms.map(form => (
                        <div key={form.id} className="flex items-start p-2 bg-background rounded border border-border/40 text-xs">
                          <FileText className="h-3.5 w-3.5 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="font-medium">{form.name}</p>
                            <p className="text-muted-foreground text-[10px] mt-0.5">{form.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </CardContent>
          </Card>
        </Tabs>
      </div>
      
      {uploadedForms.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Uploaded Forms
          </h3>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="max-h-48 overflow-y-auto">
                <ul className="divide-y">
                  {uploadedForms.map((form, index) => (
                    <li key={index} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[180px]">{form.name}</p>
                          <p className="text-xs text-muted-foreground">{form.type}</p>
                        </div>
                      </div>
                      <div>
                        {form.status === 'processing' && (
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            Processing
                          </span>
                        )}
                        {form.status === 'success' && (
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Complete
                          </span>
                        )}
                        {form.status === 'error' && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TaxFormUploader;
