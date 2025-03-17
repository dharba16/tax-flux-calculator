import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import IncomeInput from './IncomeInput';
import DeductionsInput from './DeductionsInput';
import ResultsDisplay from './ResultsDisplay';
import DeductionsEligibility from './DeductionsEligibility';
import StateTaxSettings from './StateTaxSettings';
import TaxFormUploader from './TaxFormUploader';
import ScenarioCompare from './ScenarioCompare';
import AuthSection from './AuthSection';
import { calculateTaxes, TaxResults, FilingStatus } from '@/utils/taxCalculations';
import { getEligibleDeductions, DeductionInfo } from '@/utils/deductionEligibility';
import { calculateStateTax, getStateDeductionInfo } from '@/utils/stateTaxCalculations';
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
import { CheckIcon, GlobeIcon, Upload, Columns } from 'lucide-react';
import { authService, User } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { TaxScenario } from '@/components/ScenarioCompare';

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

const calculateStateTaxes = calculateStateTax;
const getStateEligibleDeductions = getStateDeductionInfo;

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
  
  const handleFormProcessed = (formData: {
    income?: number;
    federalWithholding?: number;
    stateWithholding?: number;
  }) => {
    if (formData.income) {
      setIncome(prevIncome => prevIncome + formData.income!);
    }
    
    if (formData.federalWithholding) {
      setFederalWithholding(prevWithholding => prevWithholding + formData.federalWithholding!);
    }
    
    if (formData.stateWithholding) {
      setStateWithholding(prevWithholding => prevWithholding + formData.stateWithholding!);
    }
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
    if (!user) return;
    
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
      stateResults
    };
    
    const savedScenario = profileService.saveProfile(user.id, newScenario);
    setSavedScenarios(prev => [...prev, savedScenario]);
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
  };
  
  const handleDeleteScenario = (id: string) => {
    if (!user) return;
    
    profileService.deleteProfile(user.id, id);
    setSavedScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };
  
  useEffect(() => {
    const result = calculateTaxes({
      income,
      withholding: federalWithholding,
      filingStatus,
      deductions,
      useStandardDeduction
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
        withholding: stateWithholding
      });
      
      if (stateResult) {
        setStateResults(stateResult);

        const stateDeductionsList = getStateEligibleDeductions(income, filingStatus, selectedState);
        setStateEligibleDeductions(stateDeductionsList);
      } else {
        setStateResults(null);
        setStateEligibleDeductions([]);
      }
    } else {
      setStateResults(null);
      setStateEligibleDeductions([]);
    }
  }, [income, federalWithholding, stateWithholding, filingStatus, deductions, useStandardDeduction, includeStateTaxes, selectedState]);

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
    stateResults
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
                  <TabsTrigger value="deductions">Deductions</TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="compare">
                    <Columns className="h-4 w-4 mr-1" />
                    Compare
                  </TabsTrigger>
                  <TabsTrigger value="state" disabled={!includeStateTaxes}>State</TabsTrigger>
                </TabsList>
                
                <div className="flex justify-end mt-4">
                  <AuthSection 
                    user={user} 
                    onLogin={handleLogin} 
                    onSignup={handleSignup} 
                    onLogout={handleLogout} 
                  />
                </div>
                
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
                
                <TabsContent value="deductions" className="mt-4">
                  <DeductionsInput
                    deductions={deductions}
                    useStandardDeduction={useStandardDeduction}
                    filingStatus={filingStatus}
                    setDeductions={setDeductions}
                    setUseStandardDeduction={setUseStandardDeduction}
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="mt-4">
                  <TaxFormUploader onFormProcessed={handleFormProcessed} />
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
