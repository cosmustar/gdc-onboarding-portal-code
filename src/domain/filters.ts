/**
 * URL-safe filter values ("slugs") shared by pages and cross-page links.
 * Keeping them here guarantees that links from Overview always match the
 * filters understood by Employees / Accesses.
 */
import type { AccessStatus, OnboardingStatus } from '../types/models';
import { ACCESS_STATUSES } from '../types/models';
import type { AccessView } from './enrich';

export const ONBOARDING_SLUGS: Record<string, OnboardingStatus> = {
  finished: 'Finished',
  pending: 'Pending',
  'not-requested': 'Not Requested in IDC',
};

export const onboardingSlugOf = (s: OnboardingStatus) => Object.keys(ONBOARDING_SLUGS).find((k) => ONBOARDING_SLUGS[k] === s) ?? '';

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

/** Grouped access filters, offered before the individual raw statuses. */
export const ACCESS_STATUS_GROUPS: Record<string, { label: string; match: (a: AccessView) => boolean }> = {
  'onboarding-pending': { label: 'Pending (keeps onboarding pending)', match: (a) => a.keepsOnboardingPending },
  outstanding: { label: 'Needs action (not completed)', match: (a) => !a.isCompleted },
  completed: { label: 'Completed', match: (a) => a.isCompleted },
};

export const ACCESS_STATUS_SLUGS: Record<string, AccessStatus> = Object.fromEntries(ACCESS_STATUSES.map((s) => [slugify(s), s]));

export const accessStatusSlugOf = (s: AccessStatus) => slugify(s);

export function matchesAccessStatusFilter(a: AccessView, slug: string): boolean {
  if (!slug) return true;
  const group = ACCESS_STATUS_GROUPS[slug];
  if (group) return group.match(a);
  const status = ACCESS_STATUS_SLUGS[slug];
  return status ? a.status === status : true;
}

/** Sentinel for "Pending Approval with no approver available". */
export const NO_APPROVER = '__none__';

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
