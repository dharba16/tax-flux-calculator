
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Index = () => {
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
            <Navigation />
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center mb-16">
            <div className="flex-1 mb-8 md:mb-0">
              <div className="inline-flex items-center justify-center px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary animate-fade-in mb-4">
                2023 Tax Calculator
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight animate-slide-down mb-6">
                Tax Return Calculator
              </h1>
              <p className="text-muted-foreground max-w-xl text-balance animate-slide-down mb-8">
                Estimate your tax refund or amount owed based on your income, filing status, and deductions.
                Now with support for all major filing statuses including Qualifying Surviving Spouse and Married Filing Separately.
              </p>
              <Link to="/tax-calculator">
                <Button size="lg" className="animate-fade-in">
                  <Calculator className="mr-2" />
                  Start Calculating
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex justify-center">
              <img 
                src="/lovable-uploads/919bde2f-178b-47a9-9824-0a1c48c18ca9.png" 
                alt="The Alchemist's Solutions Logo" 
                className="w-2/3 max-w-sm animate-fade-in"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 my-16">
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-2">Accurate Calculations</h3>
              <p className="text-muted-foreground">Get precise tax estimates based on the latest tax brackets and rules.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-2">Multiple Filing Statuses</h3>
              <p className="text-muted-foreground">Support for all major filing statuses to match your situation.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-2">Compare Scenarios</h3>
              <p className="text-muted-foreground">Compare different tax situations to find the best outcome.</p>
            </div>
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

export default Index;
