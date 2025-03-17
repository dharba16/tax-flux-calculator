
import React from 'react';
import TaxCalculator from '@/components/TaxCalculator';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-8 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="inline-flex items-center justify-center px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary animate-fade-in">
              2023 Tax Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight animate-slide-down">
              Tax Return Calculator
            </h1>
            <p className="text-muted-foreground max-w-xl text-balance animate-slide-down">
              Estimate your tax refund or amount owed based on your income, filing status, and deductions.
              Now with support for all major filing statuses including Qualifying Surviving Spouse and Married Filing Separately.
              Upload tax forms (W-2, 1099s, 1098s, 1095s) to automatically populate your data or compare multiple tax scenarios.
            </p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl animate-fade-in">
          <TaxCalculator />
        </div>
      </main>
      
      <footer className="py-6 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl">
          <p className="text-center text-sm text-muted-foreground">
            This calculator provides estimates for educational purposes only and should not be used for filing taxes.
            Consult a tax professional for advice specific to your situation.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
