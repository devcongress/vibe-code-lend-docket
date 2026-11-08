import type { BranchId, LenderId } from './ids';

export type LenderStatus = 'active' | 'inactive';
export type BranchStatus = 'active' | 'inactive';

export type LenderBranch = {
  id: BranchId;
  profile: {
    name: string;
    code: string;
  };
  status: BranchStatus;
};

export type Lender = {
  id: LenderId;
  profile: {
    displayName: string;
    countryCode: 'GH';
    defaultCurrency: 'GHS';
  };
  status: LenderStatus;
  branches: LenderBranch[];
};

export type LenderScopeReference = {
  lenderId: LenderId;
  branchId: BranchId;
};

export type ResolvedLenderScope = {
  lender: Lender;
  branch: LenderBranch;
};

export const DEMO_BRANCH: LenderBranch = {
  id: 'branch_adum',
  profile: {
    name: 'Adum',
    code: 'ADUM',
  },
  status: 'active',
};

export const DEMO_LENDER: Lender = {
  id: 'lender_aseda_microcredit',
  profile: {
    displayName: 'Aseda Microcredit',
    countryCode: 'GH',
    defaultCurrency: 'GHS',
  },
  status: 'active',
  branches: [DEMO_BRANCH],
};

export const DEMO_LENDERS: readonly Lender[] = [DEMO_LENDER];

export function resolveLenderScope(
  reference: LenderScopeReference,
  lenders: readonly Lender[] = DEMO_LENDERS,
): ResolvedLenderScope | undefined {
  const lender = lenders.find((candidate) => candidate.id === reference.lenderId);
  const branch = lender?.branches.find((candidate) => candidate.id === reference.branchId);

  return lender && branch ? { lender, branch } : undefined;
}
