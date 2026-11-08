import { describe, expect, it } from 'vitest';

import { DEMO_BRANCH, DEMO_LENDER, resolveLenderScope } from '../shared/domain/lender';
import {
  DEMO_LOAN_PRODUCT,
  resolveLoanProduct,
  totalProductFeesPesewas,
} from '../shared/domain/loan-product';
import {
  calculateTerms,
  createCustomerRecord,
  DEMO_APPLICATION_SCOPE,
} from '../src/playground/model';

describe('playground loan terms', () => {
  it('calculates flat interest, fixed fees, and a rounding-safe final instalment', () => {
    const terms = calculateTerms(8_000);

    expect(terms.principalPesewas).toBe(800_000);
    expect(terms.totalRepaymentPesewas).toBe(952_000);
    expect(terms.regularInstalmentPesewas * 23 + terms.finalInstalmentPesewas).toBe(952_000);
    expect(terms.currency).toBe('GHS');
  });

  it('models branches as lender-owned configuration', () => {
    expect(DEMO_LENDER.profile).toEqual({
      displayName: 'Aseda Microcredit',
      countryCode: 'GH',
      defaultCurrency: 'GHS',
    });
    expect(DEMO_LENDER.branches).toContainEqual(DEMO_BRANCH);
  });

  it('models a loan product with an independent lifecycle and lender reference', () => {
    expect(DEMO_LOAN_PRODUCT.lenderId).toBe(DEMO_LENDER.id);
    expect(DEMO_LOAN_PRODUCT.lifecycle).toEqual({
      status: 'active',
      activatedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(resolveLoanProduct(DEMO_LOAN_PRODUCT.id)).toBe(DEMO_LOAN_PRODUCT);
    expect(totalProductFeesPesewas(DEMO_LOAN_PRODUCT)).toBe(32_000);
  });

  it('stores lender ownership as stable IDs and resolves current profile details', () => {
    expect(DEMO_APPLICATION_SCOPE).toEqual({
      lenderId: DEMO_LENDER.id,
      branchId: DEMO_BRANCH.id,
    });
    expect(resolveLenderScope(DEMO_APPLICATION_SCOPE)).toEqual({
      lender: DEMO_LENDER,
      branch: DEMO_BRANCH,
    });
  });

  it('groups persisted customer data by domain and keeps only the card suffix', () => {
    const customer = createCustomerRecord({
      fullLegalName: ' Abena Osei ',
      dateOfBirth: '1991-04-19',
      mobileNumber: ' 024 555 0138 ',
      ghanaCardPin: 'GHA-123456789-0',
      verificationReference: ' BV-DEMO-8821 ',
      verificationTimestamp: '2026-11-08T11:30',
      community: ' Atonsu ',
      district: ' Kumasi Metropolitan ',
      region: ' Ashanti ',
      digitalAddress: ' ak-225-1034 ',
      occupation: ' Food vendor ',
      primaryIncomeSource: ' Prepared meals ',
      monthlyNetIncomeGhs: 3_850,
      preferredLanguage: 'Twi',
      principalGhs: 8_000,
      acknowledged: true,
    });

    expect(customer).toEqual({
      identity: {
        fullLegalName: 'Abena Osei',
        dateOfBirth: '1991-04-19',
        document: { kind: 'ghana-card', lastFour: '7890' },
      },
      contact: {
        mobileNumber: '024 555 0138',
        preferredSpokenLanguage: 'Twi',
      },
      address: {
        community: 'Atonsu',
        district: 'Kumasi Metropolitan',
        region: 'Ashanti',
        digitalAddress: 'AK-225-1034',
      },
      livelihood: {
        occupation: 'Food vendor',
        primaryIncomeSource: 'Prepared meals',
        monthlyNetIncomePesewas: 385_000,
      },
      verification: {
        kind: 'external-biometric',
        reference: 'BV-DEMO-8821',
        completedAt: '2026-11-08T11:30',
      },
    });
  });
});
