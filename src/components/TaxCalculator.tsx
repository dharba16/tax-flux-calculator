import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import IncomeInput from './IncomeInput';
import DeductionsInput from './DeductionsInput';
import ResultsDisplay from './ResultsDisplay';
import DeductionsEligibility from './DeductionsEligibility';
import StateTaxSettings from './StateTaxSettings';
import ScenarioCompare, { TaxScenario, SelectedDeduction } from './ScenarioCompare';
import TaxFormUploader from './TaxFormUploader';
import { calculateTaxes, TaxResults, FilingStatus } from '@/utils/taxCalculations';
import { getEligibleDeductions, DeductionInfo } from '@/utils/deductionEligibility';
import { calculateStateTaxes, getStateDeductionInfo } from '@/utils/stateTaxCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckIcon, GlobeIcon, Columns, Upload } from 'lucide-react';
import { authService, User } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { toast } from 'sonner';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
  'Wisconsin', 'Wyoming'
];

const TaxCalculator: React.FC = () => {
  const [income, setIncome] = useState<number>(75000);
  const [federalWithholding, setFederalWithholding] = useState<number>(12000);
  const [stateWithholding, setStateWithholding] = useState<number>(3000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [deductions, setDeductions] = useState<number>(0);
  const [useStandardDeduction, setUseStandardDeduction] = useState<boolean>(true);
  const [includeStateTaxes, setIncludeStateTaxes] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>('California');
  
  const [results, setResults] = useState<TaxResults | null>(null);
  const [stateResults, setStateResults] = useState<TaxResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>('income');
  const [eligibleDeductions, setEligibleDeductions] = useState<DeductionInfo[]>([]);
  const [stateEligibleDeductions, setStateEligibleDeductions] = useState<DeductionInfo[]>([]);
  const [selectedDeductionIds, setSelectedDeductionIds] = useState<string[]>([]);
  
  const [user, setUser] = useState<User | null>(null);
  
  const [savedScenarios, setSavedScenarios] = useState<TaxScenario[]>([]);
  
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      const userScenarios = profileService.getProfiles(currentUser.id);
      setSavedScenarios(userScenarios);
    }
  }, []);
  
  const handleDeductionSelect = (id: string, selected: boolean) => {
    setSelectedDeductionIds(prev => {
      if (selected) {
        return [...prev, id];
      } else {
        return prev.filter(dId => dId !== id);
      }
    });
  };
  
  const getSelectedDeductions = (): SelectedDeduction[] => {
    const allDeductions = [...eligibleDeductions, ...stateEligibleDeductions];
    
    return selectedDeductionIds
      .map(id => {
        const deduction = allDeductions.find(d => d.id === id);
        if (deduction && deduction.eligibleAmount !== null) {
          return {
            id: deduction.id,
            amount: deduction.eligibleAmount,
            name: deduction.name
          };
        }
        return null;
      })
      .filter((d): d is SelectedDeduction => d !== null);
  };
  
  // Handle form upload processing
  const handleFormProcessed = (formData: {
    income?: number;
    federalWithholding?: number;
    stateWithholding?: number;
  }) => {
    if (formData.income) {
      setIncome(formData.income);
    }
    if (formData.federalWithholding) {
      setFederalWithholding(formData.federalWithholding);
    }
    if (formData.stateWithholding) {
      setStateWithholding(formData.stateWithholding);
    }
    
    toast.success('Tax form data imported successfully!');
  };
  
  const handleLogin = (email: string, password: string) => {
    try {
      const loggedInUser = authService.login(email, password);
      setUser(loggedInUser);
      
      const userScenarios = profileService.getProfiles(loggedInUser.id);
      setSavedScenarios(userScenarios);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleSignup = (email: string, password: string, name: string) => {
    try {
      const newUser = authService.signup(email, password, name);
      setUser(newUser);
      setSavedScenarios([]);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };
  
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSavedScenarios([]);
  };
  
  const handleSaveScenario = (name: string) => {
    if (!user) {
      toast.error("Please log in to save scenarios");
      return;
    }
    
    const selectedDeductions = getSelectedDeductions();
    
    const newScenario: Omit<TaxScenario, 'id'> = {
      name,
      income,
      filingStatus,
      deductions,
      useStandardDeduction,
      federalWithholding,
      stateWithholding,
      includeStateTaxes,
      selectedState,
      results,
      stateResults,
      selectedDeductions
    };
    
    const savedScenario = profileService.saveProfile(user.id, newScenario);
    setSavedScenarios(prev => [...prev, savedScenario]);
    toast.success(`Scenario "${name}" saved successfully!`);
  };
  
  const handleLoadScenario = (scenario: TaxScenario) => {
    setIncome(scenario.income);
    setFilingStatus(scenario.filingStatus);
    setDeductions(scenario.deductions);
    setUseStandardDeduction(scenario.useStandardDeduction);
    setFederalWithholding(scenario.federalWithholding);
    setStateWithholding(scenario.stateWithholding);
    setIncludeStateTaxes(scenario.includeStateTaxes);
    setSelectedState(scenario.selectedState);
    
    const deductionIds = scenario.selectedDeductions.map(d => d.id);
    setSelectedDeductionIds(deductionIds);
    
    toast.info(`Loaded scenario: ${scenario.name}`);
  };
  
  const handleDeleteScenario = (id: string) => {
    if (!user) return;
    
    profileService.deleteProfile(user.id, id);
    setSavedScenarios(prev => prev.filter(scenario => scenario.id !== id));
    toast.info("Scenario deleted");
  };
  
  useEffect(() => {
    const selectedDeductions = getSelectedDeductions();
    
    const result = calculateTaxes({
      income,
      withholding: federalWithholding,
      filingStatus,
      deductions,
      useStandardDeduction,
      selectedDeductions
    });
    
    setResults(result);
    
    const deductionsList = getEligibleDeductions(income, filingStatus);
    setEligibleDeductions(deductionsList);

    if (includeStateTaxes) {
      const stateResult = calculateStateTaxes({
        income,
        filingStatus,
        deductions,
        useStandardDeduction,
        state: selectedState,
        withholding: stateWithholding,
        selectedDeductions
      });
      
      if (stateResult) {
        setStateResults(stateResult as unknown as TaxResults);

        const stateDeductionsList = getStateDeductionInfo(income, filingStatus, selectedState);
        setStateEligibleDeductions(stateDeductionsList);
      } else {
        setStateResults(null);
        setStateEligibleDeductions([]);
      }
    } else {
      setStateResults(null);
      setStateEligibleDeductions([]);
    }
  }, [income, federalWithholding, stateWithholding, filingStatus, deductions, useStandardDeduction, includeStateTaxes, selectedState, selectedDeductionIds]);

  const currentScenario: Omit<TaxScenario, 'id' | 'name'> = {
    income,
    filingStatus,
    deductions,
    useStandardDeduction,
    federalWithholding,
    stateWithholding,
    includeStateTaxes,
    selectedState,
    results,
    stateResults,
    selectedDeductions: getSelectedDeductions()
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full mb-4"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="deductions">Deductions</TabsTrigger>
                  <TabsTrigger value="compare">
                    <Columns className="h-4 w-4 mr-1" />
                    Compare
                  </TabsTrigger>
                  <TabsTrigger value="state" disabled={!includeStateTaxes}>State</TabsTrigger>
                </TabsList>
                
                <TabsContent value="income" className="mt-4">
                  <IncomeInput
                    income={income}
                    federalWithholding={federalWithholding}
                    stateWithholding={stateWithholding}
                    filingStatus={filingStatus}
                    setIncome={setIncome}
                    setFederalWithholding={setFederalWithholding}
                    setStateWithholding={setStateWithholding}
                    setFilingStatus={setFilingStatus}
                    includeStateTaxes={includeStateTaxes}
                  />
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="state-taxes"
                        checked={includeStateTaxes}
                        onCheckedChange={(checked) => {
                          setIncludeStateTaxes(checked);
                          if (checked && activeTab !== 'state') {
                            setActiveTab('state');
                          }
                        }}
                      />
                      <Label htmlFor="state-taxes" className="text-sm cursor-pointer">
                        Include State Taxes
                      </Label>
                    </div>
                    
                    {includeStateTaxes && (
                      <div className="flex-1 max-w-[180px] ml-4">
                        <Select
                          value={selectedState}
                          onValueChange={setSelectedState}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-4">
                  <TaxFormUploader onFormProcessed={handleFormProcessed} />
                </TabsContent>
                
                <TabsContent value="deductions" className="mt-4">
                  <DeductionsInput
                    deductions={deductions}
                    useStandardDeduction={useStandardDeduction}
                    filingStatus={filingStatus}
                    setDeductions={setDeductions}
                    setUseStandardDeduction={setUseStandardDeduction}
                  />
                </TabsContent>
                
                <TabsContent value="compare" className="mt-4">
                  <ScenarioCompare
                    currentScenario={currentScenario}
                    savedScenarios={savedScenarios}
                    onSaveScenario={handleSaveScenario}
                    onLoadScenario={handleLoadScenario}
                    onDeleteScenario={handleDeleteScenario}
                  />
                </TabsContent>
                
                <TabsContent value="state" className="mt-4">
                  <StateTaxSettings 
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    income={income}
                    filingStatus={filingStatus}
                    stateResults={stateResults}
                    stateEligibleDeductions={stateEligibleDeductions}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <DeductionsEligibility 
            eligibleDeductions={eligibleDeductions} 
            stateEligibleDeductions={includeStateTaxes ? stateEligibleDeductions : []}
            includeStateTaxes={includeStateTaxes}
            selectedState={selectedState}
            selectedDeductionIds={selectedDeductionIds}
            onDeductionSelect={handleDeductionSelect}
          />
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          {results && (
            <ResultsDisplay 
              results={results} 
              stateResults={stateResults}
              includeStateTaxes={includeStateTaxes}
              selectedState={selectedState}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
