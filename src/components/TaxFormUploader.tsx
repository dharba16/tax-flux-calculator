
import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TaxFormUploaderProps {
  onFormProcessed: (formData: {
    income?: number;
    federalWithholding?: number;
    stateWithholding?: number;
  }) => void;
}

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
      
      if (filename.includes('w2') || filename.includes('w-2')) {
        formType = 'W-2';
        income = 75000 + Math.floor(Math.random() * 15000);
        federalWithholding = Math.floor(income * 0.15);
        stateWithholding = Math.floor(income * 0.04);
      } else if (filename.includes('1099')) {
        formType = '1099';
        if (filename.includes('nec')) {
          income = 45000 + Math.floor(Math.random() * 25000);
          federalWithholding = 0; // 1099-NEC typically doesn't have withholding
        } else if (filename.includes('int')) {
          income = 2000 + Math.floor(Math.random() * 3000);
          federalWithholding = Math.floor(income * 0.10);
        } else if (filename.includes('div')) {
          income = 3000 + Math.floor(Math.random() * 5000);
          federalWithholding = Math.floor(income * 0.15);
        } else {
          income = 25000 + Math.floor(Math.random() * 15000);
          federalWithholding = Math.floor(income * 0.05);
        }
      }
      
      resolve({ formType, income, federalWithholding, stateWithholding });
    }, 1500);
  });
};

const TaxFormUploader: React.FC<TaxFormUploaderProps> = ({ onFormProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
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
          Supported forms: W-2, 1099-NEC, 1099-MISC, 1099-K, 1099-INT, 1099-DIV, 1099-B, 1099-R
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
