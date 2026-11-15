import { MockOnboardingDataService } from './MockOnboardingDataService';
import type { OnboardingDataService } from './OnboardingDataService';

/**
 * Single place to choose the data source.
 * To switch to a real backend later, implement OnboardingDataService
 * (e.g. HttpOnboardingDataService) and return it here.
 */
export const dataService: OnboardingDataService = new MockOnboardingDataService();

export type { OnboardingDataService, ScopedData } from './OnboardingDataService';
