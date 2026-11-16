import { CsvOnboardingDataService } from './csv/CsvOnboardingDataService';
import { MockOnboardingDataService } from './MockOnboardingDataService';
import type { OnboardingDataService } from './OnboardingDataService';

/**
 * Single place to choose the data source.
 *  - Default: fictional mock data.
 *  - VITE_DATA_SOURCE=csv (in the file `.env.local`): reads the Power BI exports
 *    in `public/real-data/` (see src/services/csv/csvConfig.ts).
 * A future backend would be another implementation of OnboardingDataService.
 */
export const dataService: OnboardingDataService =
  import.meta.env.VITE_DATA_SOURCE === 'csv' ? new CsvOnboardingDataService() : new MockOnboardingDataService();

export type { OnboardingDataService, ScopedData } from './OnboardingDataService';
