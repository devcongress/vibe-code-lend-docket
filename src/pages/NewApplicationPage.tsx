import { ArrowLeft, ArrowRight, Check, FileText, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { DEMO_LOAN_PRODUCT, totalProductFeesPesewas } from '../../shared/domain/loan-product';
import { calculateTerms, formatGhs, type NewApplicationInput } from '../playground/model';
import { usePlayground } from '../playground/store';

const steps = ['Customer', 'Livelihood & verification', 'Terms & submit'];
const minimumPrincipalGhs = DEMO_LOAN_PRODUCT.principalLimits.minimumPesewas / 100;
const maximumPrincipalGhs = DEMO_LOAN_PRODUCT.principalLimits.maximumPesewas / 100;
const productFeesPesewas = totalProductFeesPesewas(DEMO_LOAN_PRODUCT);

const customerFields: Array<keyof NewApplicationInput> = [
  'fullLegalName',
  'dateOfBirth',
  'mobileNumber',
  'ghanaCardPin',
  'community',
  'district',
  'region',
  'digitalAddress',
];
const verificationFields: Array<keyof NewApplicationInput> = [
  'occupation',
  'primaryIncomeSource',
  'monthlyNetIncomeGhs',
  'preferredLanguage',
  'verificationReference',
  'verificationTimestamp',
];

export function NewApplicationPage() {
  const navigate = useNavigate();
  const { role, createAndSubmit } = usePlayground();
  const [step, setStep] = useState(0);
  // React Compiler is not enabled; React Hook Form intentionally exposes stable field subscriptions.
  // oxlint-disable-next-line react/incompatible-library
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewApplicationInput>({
    defaultValues: {
      preferredLanguage: 'Twi',
      principalGhs: 8_000,
      acknowledged: false,
    },
  });
  // oxlint-disable-next-line react/incompatible-library
  const principalGhs = Number(watch('principalGhs')) || 0;
  const terms = calculateTerms(principalGhs);

  if (role !== 'agent') {
    return (
      <section className="content-card access-card">
        <ShieldCheck aria-hidden="true" />
        <p className="eyebrow">Separation of duties</p>
        <h1>Reviewers cannot create applications.</h1>
        <p>Switch to the Agent demo persona to enter customer information.</p>
        <Link className="secondary-button" to="/review">
          Return to review queue
        </Link>
      </section>
    );
  }

  const fillSample = () => {
    const sample: Omit<NewApplicationInput, 'acknowledged'> = {
      fullLegalName: 'Abena Osei',
      dateOfBirth: '1991-04-19',
      mobileNumber: '024 555 0138',
      ghanaCardPin: 'GHA-123456789-0',
      verificationReference: 'BV-DEMO-8821',
      verificationTimestamp: '2026-11-08T11:30',
      community: 'Atonsu',
      district: 'Kumasi Metropolitan',
      region: 'Ashanti',
      digitalAddress: 'AK-225-1034',
      occupation: 'Food vendor',
      primaryIncomeSource: 'Prepared meals',
      monthlyNetIncomeGhs: 3_850,
      preferredLanguage: 'Twi',
      principalGhs: 8_000,
    };
    for (const [field, value] of Object.entries(sample)) {
      setValue(field as keyof NewApplicationInput, value, { shouldValidate: false });
    }
  };

  const next = async () => {
    const valid = await trigger(step === 0 ? customerFields : verificationFields);
    if (valid) setStep((current) => Math.min(current + 1, 2));
  };

  const submit = (input: NewApplicationInput) => {
    const applicationId = createAndSubmit(input);
    navigate(`/applications/${applicationId}?created=1`);
  };

  return (
    <div className="application-form-layout">
      <section className="form-workspace">
        <header className="form-header">
          <div>
            <Link className="back-link" to="/applications">
              <ArrowLeft aria-hidden="true" /> My applications
            </Link>
            <p className="eyebrow">New application</p>
            <h1>Record what the customer tells you.</h1>
            <p>Use fictional information only while this demo is in development.</p>
          </div>
          <button type="button" className="sample-button" onClick={fillSample}>
            <Sparkles aria-hidden="true" /> Fill sample details
          </button>
        </header>

        <ol className="stepper" aria-label="Application progress">
          {steps.map((label, index) => (
            <li key={label} className={index === step ? 'active' : index < step ? 'complete' : ''}>
              <span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span>
              <strong>{label}</strong>
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit(submit)} noValidate>
          {step === 0 ? (
            <div className="form-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Step 1 of 3</p>
                  <h2>Customer details</h2>
                </div>
              </div>
              <div className="privacy-callout">
                <Info aria-hidden="true" />
                <p>
                  <strong>Ghana Card images are prohibited.</strong> This playground immediately
                  keeps only the last four characters of the entered fictional PIN.
                </p>
              </div>
              <div className="field-grid">
                <label className="field field-wide">
                  <span>Full legal name</span>
                  <input
                    {...register('fullLegalName', { required: 'Enter the customer’s legal name.' })}
                    autoComplete="off"
                  />
                  <FieldError message={errors.fullLegalName?.message} />
                </label>
                <label className="field">
                  <span>Date of birth</span>
                  <input
                    type="date"
                    {...register('dateOfBirth', { required: 'Enter the date of birth.' })}
                  />
                  <FieldError message={errors.dateOfBirth?.message} />
                </label>
                <label className="field">
                  <span>Mobile telephone</span>
                  <input
                    {...register('mobileNumber', {
                      required: 'Enter a mobile number.',
                      minLength: { value: 10, message: 'Enter a complete mobile number.' },
                    })}
                    inputMode="tel"
                    placeholder="024 000 0000"
                  />
                  <FieldError message={errors.mobileNumber?.message} />
                </label>
                <label className="field field-wide">
                  <span>Fictional Ghana Card PIN</span>
                  <input
                    {...register('ghanaCardPin', {
                      required: 'Enter the fictional Ghana Card PIN.',
                      minLength: { value: 8, message: 'Enter a complete fictional PIN.' },
                    })}
                    autoComplete="off"
                    placeholder="GHA-000000000-0"
                  />
                  <small>Never enter a real customer’s information in this demo.</small>
                  <FieldError message={errors.ghanaCardPin?.message} />
                </label>
                <label className="field">
                  <span>Residential community</span>
                  <input {...register('community', { required: 'Enter the community.' })} />
                  <FieldError message={errors.community?.message} />
                </label>
                <label className="field">
                  <span>District</span>
                  <input {...register('district', { required: 'Enter the district.' })} />
                  <FieldError message={errors.district?.message} />
                </label>
                <label className="field">
                  <span>Region</span>
                  <select {...register('region', { required: 'Choose the region.' })}>
                    <option value="">Choose region</option>
                    <option>Ashanti</option>
                    <option>Greater Accra</option>
                    <option>Central</option>
                    <option>Eastern</option>
                    <option>Western</option>
                    <option>Northern</option>
                  </select>
                  <FieldError message={errors.region?.message} />
                </label>
                <label className="field">
                  <span>GhanaPost GPS address</span>
                  <input
                    {...register('digitalAddress', { required: 'Enter the digital address.' })}
                    placeholder="AK-000-0000"
                  />
                  <FieldError message={errors.digitalAddress?.message} />
                </label>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="form-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Step 2 of 3</p>
                  <h2>Livelihood and verification</h2>
                </div>
              </div>
              <div className="field-grid">
                <label className="field">
                  <span>Occupation</span>
                  <input {...register('occupation', { required: 'Enter the occupation.' })} />
                  <FieldError message={errors.occupation?.message} />
                </label>
                <label className="field">
                  <span>Primary income source</span>
                  <input
                    {...register('primaryIncomeSource', { required: 'Enter the income source.' })}
                  />
                  <FieldError message={errors.primaryIncomeSource?.message} />
                </label>
                <label className="field">
                  <span>Monthly net income (GHS)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    {...register('monthlyNetIncomeGhs', {
                      required: 'Enter monthly income.',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Income must be greater than zero.' },
                    })}
                  />
                  <FieldError message={errors.monthlyNetIncomeGhs?.message} />
                </label>
                <label className="field">
                  <span>Preferred spoken language</span>
                  <select {...register('preferredLanguage', { required: 'Choose a language.' })}>
                    <option>Twi</option>
                    <option>English</option>
                    <option>Ga</option>
                    <option>Ewe</option>
                    <option>Dagbani</option>
                    <option>Fante</option>
                    <option>Hausa</option>
                  </select>
                  <FieldError message={errors.preferredLanguage?.message} />
                </label>
                <label className="field">
                  <span>External biometric reference</span>
                  <input
                    {...register('verificationReference', {
                      required: 'Enter the verification reference.',
                    })}
                    placeholder="BV-DEMO-0000"
                  />
                  <FieldError message={errors.verificationReference?.message} />
                </label>
                <label className="field">
                  <span>Verification date and time</span>
                  <input
                    type="datetime-local"
                    {...register('verificationTimestamp', {
                      required: 'Enter when verification succeeded.',
                    })}
                  />
                  <FieldError message={errors.verificationTimestamp?.message} />
                </label>
              </div>
              <div className="privacy-callout success">
                <ShieldCheck aria-hidden="true" />
                <p>
                  <strong>External verification only.</strong> LendDocket records the supplied
                  reference; it does not perform identity checks or retain biometrics.
                </p>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="form-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Step 3 of 3</p>
                  <h2>Terms and acknowledgement</h2>
                </div>
              </div>
              <div className="product-summary">
                <div>
                  <span>Product</span>
                  <strong>{DEMO_LOAN_PRODUCT.profile.name}</strong>
                </div>
                <div>
                  <span>Flat interest</span>
                  <strong>{DEMO_LOAN_PRODUCT.pricing.flatRateBasisPoints / 100}%</strong>
                </div>
                <div>
                  <span>Repayments</span>
                  <strong>{DEMO_LOAN_PRODUCT.repayment.count} weekly</strong>
                </div>
                <div>
                  <span>Fixed fees</span>
                  <strong>{formatGhs(productFeesPesewas)}</strong>
                </div>
              </div>
              <label className="field principal-field">
                <span>Requested principal (GHS)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  {...register('principalGhs', {
                    required: 'Enter the principal.',
                    valueAsNumber: true,
                    min: {
                      value: minimumPrincipalGhs,
                      message: `Minimum is GHS ${minimumPrincipalGhs.toLocaleString()}.`,
                    },
                    max: {
                      value: maximumPrincipalGhs,
                      message: `Maximum is GHS ${maximumPrincipalGhs.toLocaleString()}.`,
                    },
                  })}
                />
                <small>
                  Allowed range: GHS {minimumPrincipalGhs.toLocaleString()}–
                  {maximumPrincipalGhs.toLocaleString()}
                </small>
                <FieldError message={errors.principalGhs?.message} />
              </label>

              <div className="repayment-card">
                <div>
                  <span>Principal</span>
                  <strong>{formatGhs(terms.principalPesewas)}</strong>
                </div>
                <div>
                  <span>Total repayment</span>
                  <strong>{formatGhs(terms.totalRepaymentPesewas)}</strong>
                </div>
                <div>
                  <span>Weekly instalment</span>
                  <strong>{formatGhs(terms.regularInstalmentPesewas)}</strong>
                </div>
                <div>
                  <span>Final instalment</span>
                  <strong>{formatGhs(terms.finalInstalmentPesewas)}</strong>
                </div>
              </div>

              <div className="demo-files">
                <FileText aria-hidden="true" />
                <div>
                  <strong>Two clean demo attachments will be added</strong>
                  <span>Income record and business premises · upload comes later</span>
                </div>
                <span className="clean-pill">
                  <Check aria-hidden="true" /> Clean
                </span>
              </div>

              <label className="acknowledgement">
                <input
                  type="checkbox"
                  {...register('acknowledged', {
                    required: 'Confirm that the customer acknowledged the information and terms.',
                  })}
                />
                <span>
                  <strong>
                    I read back or explained all recorded information and proposed terms in the
                    customer’s preferred language.
                  </strong>
                  <small>The customer verbally acknowledged them before submission.</small>
                </span>
              </label>
              <FieldError message={errors.acknowledged?.message} />
              <div className="decision-boundary">
                <ShieldCheck aria-hidden="true" />
                <p>
                  <strong>Submission creates a review record.</strong> Approval later will record a
                  decision only; it will not disburse funds or create a credit agreement.
                </p>
              </div>
            </div>
          ) : null}

          <footer className="form-actions">
            {step > 0 ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setStep((current) => current - 1)}
              >
                <ArrowLeft aria-hidden="true" /> Back
              </button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button type="button" className="primary-button" onClick={next}>
                Continue <ArrowRight aria-hidden="true" />
              </button>
            ) : (
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                Submit for review <ArrowRight aria-hidden="true" />
              </button>
            )}
          </footer>
        </form>
      </section>

      <aside className="form-aside">
        <span className="aside-icon">
          <ShieldCheck aria-hidden="true" />
        </span>
        <p className="eyebrow">Safe demo</p>
        <h2>Complete, separate, explainable.</h2>
        <ol>
          <li>
            <span>1</span>
            <p>
              <strong>Agent records</strong> Fictional customer and loan details.
            </p>
          </li>
          <li>
            <span>2</span>
            <p>
              <strong>Agent submits</strong> A fixed snapshot enters the queue.
            </p>
          </li>
          <li>
            <span>3</span>
            <p>
              <strong>Reviewer decides</strong> A different persona approves or rejects.
            </p>
          </li>
        </ol>
      </aside>
    </div>
  );
}

function FieldError({ message }: { message: string | undefined }) {
  return message ? (
    <span className="field-error" role="alert">
      {message}
    </span>
  ) : null;
}
