import { totalProductFeesPesewas, type LoanProduct } from './loan-product';

export type LoanTerms = {
  currency: 'GHS';
  principalPesewas: number;
  flatRateBasisPoints: number;
  fixedFeesPesewas: number;
  repaymentCount: number;
  repaymentFrequency: 'weekly';
  totalRepaymentPesewas: number;
  regularInstalmentPesewas: number;
  finalInstalmentPesewas: number;
};

export function calculateLoanTerms(principalPesewas: number, product: LoanProduct): LoanTerms {
  if (product.lifecycle.status !== 'active') {
    throw new Error('Loan terms can only be calculated for an active product.');
  }

  const fixedFeesPesewas = totalProductFeesPesewas(product);
  const interestPesewas = Math.round(
    (principalPesewas * product.pricing.flatRateBasisPoints) / 10_000,
  );
  const totalRepaymentPesewas = principalPesewas + interestPesewas + fixedFeesPesewas;
  const regularInstalmentPesewas = Math.floor(totalRepaymentPesewas / product.repayment.count);
  const finalInstalmentPesewas =
    totalRepaymentPesewas - regularInstalmentPesewas * (product.repayment.count - 1);

  return {
    currency: product.profile.currency,
    principalPesewas,
    flatRateBasisPoints: product.pricing.flatRateBasisPoints,
    fixedFeesPesewas,
    repaymentCount: product.repayment.count,
    repaymentFrequency: product.repayment.frequency,
    totalRepaymentPesewas,
    regularInstalmentPesewas,
    finalInstalmentPesewas,
  };
}
