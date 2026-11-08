export type { Lender, LenderBranch } from '../../../shared/domain/lender';
export type { BranchId, LenderId, LenderStaffId } from '../../../shared/domain/ids';
export type {
  LenderStaff,
  LenderStaffRole,
  LenderStaffStatus,
} from '../../../shared/domain/lender-staff';

export const lendersModule = 'lenders' as const;
