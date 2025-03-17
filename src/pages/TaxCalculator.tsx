
import React from 'react';
import TaxCalculator from '@/components/TaxCalculator';
import Navigation from '@/components/Navigation';

const TaxCalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
                alt="The Alchemist's Solutions Logo" 
                className="h-20"
              />
            </div>
            <Navigation hideAuth={true} />
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 animate-slide-down">
            Tax Return Calculator
          </h1>
          <p className="text-muted-foreground max-w-xl text-balance mb-12 animate-slide-down">
            Estimate your tax refund or amount owed based on your income, filing status, and deductions.
            Now with support for all major filing statuses including Qualifying Surviving Spouse and Married Filing Separately.
            Upload tax forms (W-2, 1099s, 1098s, 1095s) to automatically populate your data or compare multiple tax scenarios.
          </p>
          <div className="animate-fade-in">
            <TaxCalculator />
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl">
          <div className="flex flex-col items-center space-y-2">
            <img 
              src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
              alt="The Alchemist's Solutions Logo" 
              className="h-10 mb-2"
            />
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} The Alchemist's Solutions. All rights reserved.
            </p>
            <p className="text-center text-xs text-muted-foreground">
              This calculator provides estimates for educational purposes only and should not be used for filing taxes.
              Consult a tax professional for advice specific to your situation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TaxCalculatorPage;
