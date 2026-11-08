export type CustomerIdentity = {
  fullLegalName: string;
  dateOfBirth: string;
  document: {
    kind: 'ghana-card';
    lastFour: string;
  };
};

export type CustomerContact = {
  mobileNumber: string;
  preferredSpokenLanguage: string;
};

export type CustomerAddress = {
  community: string;
  district: string;
  region: string;
  digitalAddress: string;
};

export type CustomerLivelihood = {
  occupation: string;
  primaryIncomeSource: string;
  monthlyNetIncomePesewas: number;
};

export type CustomerVerification = {
  kind: 'external-biometric';
  reference: string;
  completedAt: string;
};

export type CustomerRecord = {
  identity: CustomerIdentity;
  contact: CustomerContact;
  address: CustomerAddress;
  livelihood: CustomerLivelihood;
  verification: CustomerVerification;
};
