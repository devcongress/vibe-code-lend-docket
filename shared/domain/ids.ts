export type DomainIdPrefix =
  | 'lender'
  | 'branch'
  | 'staff'
  | 'lprod'
  | 'lappl'
  | 'ldec'
  | 'lfile'
  | 'laudit'
  | 'lreq';

export type DomainId<Prefix extends DomainIdPrefix> = `${Prefix}_${string}`;

export type LenderId = DomainId<'lender'>;
export type BranchId = DomainId<'branch'>;
export type LenderStaffId = DomainId<'staff'>;
export type LoanProductId = DomainId<'lprod'>;
export type LoanApplicationId = DomainId<'lappl'>;
export type ApplicationDecisionId = DomainId<'ldec'>;
export type ApplicationAttachmentId = DomainId<'lfile'>;
export type ApplicationAuditEventId = DomainId<'laudit'>;
export type ReturnRequirementId = DomainId<'lreq'>;

export function createDomainId<Prefix extends DomainIdPrefix>(prefix: Prefix): DomainId<Prefix> {
  return `${prefix}_${crypto.randomUUID()}`;
}
