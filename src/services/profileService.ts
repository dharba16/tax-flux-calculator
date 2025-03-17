
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { TaxScenario } from '@/components/ScenarioCompare';

// Helper function to get tax profiles from localStorage
const getProfiles = (userId: string): TaxScenario[] => {
  const profilesJson = localStorage.getItem(`tax-calculator-profiles-${userId}`);
  return profilesJson ? JSON.parse(profilesJson) : [];
};

// Helper function to save tax profiles to localStorage
const saveProfiles = (userId: string, profiles: TaxScenario[]) => {
  localStorage.setItem(`tax-calculator-profiles-${userId}`, JSON.stringify(profiles));
};

export const profileService = {
  // Get all profiles for a user
  getProfiles: (userId: string): TaxScenario[] => {
    return getProfiles(userId);
  },
  
  // Save a new profile
  saveProfile: (userId: string, profile: Omit<TaxScenario, 'id'>): TaxScenario => {
    const profiles = getProfiles(userId);
    
    const newProfile: TaxScenario = {
      ...profile,
      id: uuidv4()
    };
    
    profiles.push(newProfile);
    saveProfiles(userId, profiles);
    
    toast.success('Tax scenario saved successfully!');
    return newProfile;
  },
  
  // Delete a profile
  deleteProfile: (userId: string, profileId: string): void => {
    let profiles = getProfiles(userId);
    profiles = profiles.filter(profile => profile.id !== profileId);
    saveProfiles(userId, profiles);
    
    toast.info('Tax scenario deleted');
  },
  
  // Update an existing profile
  updateProfile: (userId: string, profile: TaxScenario): void => {
    let profiles = getProfiles(userId);
    const index = profiles.findIndex(p => p.id === profile.id);
    
    if (index !== -1) {
      profiles[index] = profile;
      saveProfiles(userId, profiles);
      toast.success('Tax scenario updated successfully!');
    }
  }
};
