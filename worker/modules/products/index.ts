export type { LoanProduct, LoanProductStatus } from '../../../shared/domain/loan-product';
export type { LoanProductId } from '../../../shared/domain/ids';
export { calculateLoanTerms, type LoanTerms } from '../../../shared/domain/loan-terms';

export const productsModule = 'products' as const;
