import { DEMO_LENDER } from './lender';
import type { LenderId, LoanProductId } from './ids';

export type LoanProductStatus = 'draft' | 'active' | 'inactive' | 'retired';

export type LoanProduct = {
  id: LoanProductId;
  lenderId: LenderId;
  profile: {
    name: string;
    currency: 'GHS';
  };
  lifecycle: {
    status: LoanProductStatus;
    activatedAt?: string;
    retiredAt?: string;
  };
  principalLimits: {
    minimumPesewas: number;
    maximumPesewas: number;
  };
  pricing: {
    flatRateBasisPoints: number;
    fees: Array<{
      code: string;
      name: string;
      amountPesewas: number;
    }>;
  };
  repayment: {
    count: number;
    frequency: 'weekly';
  };
};

export const DEMO_LOAN_PRODUCT: LoanProduct = {
  id: 'lprod_trader_working_capital',
  lenderId: DEMO_LENDER.id,
  profile: {
    name: 'Trader working capital',
    currency: 'GHS',
  },
  lifecycle: {
    status: 'active',
    activatedAt: '2026-01-01T00:00:00.000Z',
  },
  principalLimits: {
    minimumPesewas: 100_000,
    maximumPesewas: 2_000_000,
  },
  pricing: {
    flatRateBasisPoints: 1_500,
    fees: [
      {
        code: 'processing',
        name: 'Processing fee',
        amountPesewas: 32_000,
      },
    ],
  },
  repayment: {
    count: 24,
    frequency: 'weekly',
  },
};

export const DEMO_LOAN_PRODUCTS: readonly LoanProduct[] = [DEMO_LOAN_PRODUCT];

export function resolveLoanProduct(
  productId: LoanProductId,
  products: readonly LoanProduct[] = DEMO_LOAN_PRODUCTS,
): LoanProduct | undefined {
  return products.find((product) => product.id === productId);
}

export function totalProductFeesPesewas(product: LoanProduct) {
  return product.pricing.fees.reduce((total, fee) => total + fee.amountPesewas, 0);
}
