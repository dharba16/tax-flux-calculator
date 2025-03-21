
import React from 'react';
import TaxCalculator from '@/components/TaxCalculator';
import Navigation from '@/components/Navigation';

const TaxCalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="py-6 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
                alt="The Alchemist's Solutions Logo" 
                className="h-16 sm:h-20 alchemist-logo"
              />
            </div>
            <Navigation hideAuth={true} />
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-16">
        <div className="container max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-8 animate-slide-down text-center">
            Tax Return Calculator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance mb-12 animate-slide-down text-center text-lg">
            Estimate your tax refund or amount owed based on your income, filing status, and deductions.
            Now with support for all major filing statuses including Qualifying Surviving Spouse and Married Filing Separately.
          </p>
          <div className="animate-fade-in max-w-5xl mx-auto">
            <TaxCalculator />
          </div>
        </div>
      </main>
      
      <footer className="py-10 border-t border-border/40 bg-background/80 backdrop-blur-sm mt-16">
        <div className="container max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-6">
            <img 
              src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
              alt="The Alchemist's Solutions Logo" 
              className="h-12 mb-2 alchemist-logo"
            />
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} The Alchemist's Solutions. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                This calculator provides estimates for educational purposes only and should not be used for filing taxes.
                Consult a tax professional for advice specific to your situation.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TaxCalculatorPage;
