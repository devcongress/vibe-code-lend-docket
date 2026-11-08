import { DEMO_BRANCH, DEMO_LENDER } from './lender';
import type { BranchId, LenderId, LenderStaffId } from './ids';

export type LenderStaffRole = 'agent' | 'reviewer';
export type LenderStaffStatus = 'active' | 'inactive';

export type LenderStaff = {
  id: LenderStaffId;
  lenderId: LenderId;
  branchId: BranchId;
  profile: {
    displayName: string;
  };
  role: LenderStaffRole;
  status: LenderStaffStatus;
};

export const DEMO_AGENT_STAFF = {
  id: 'staff_kofi_addo',
  lenderId: DEMO_LENDER.id,
  branchId: DEMO_BRANCH.id,
  profile: {
    displayName: 'Kofi Addo',
  },
  role: 'agent',
  status: 'active',
} satisfies LenderStaff;

export const DEMO_REVIEWER_STAFF = {
  id: 'staff_ama_danso',
  lenderId: DEMO_LENDER.id,
  branchId: DEMO_BRANCH.id,
  profile: {
    displayName: 'Ama Danso',
  },
  role: 'reviewer',
  status: 'active',
} satisfies LenderStaff;
