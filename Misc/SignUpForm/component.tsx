import { trackSelfDescribingEvent } from '@snowplow/browser-tracker';
import cx from 'classnames';
import { type FormikProps, withFormik } from 'formik';
import React, { type FC } from 'react';
import { useSelector } from 'react-redux';
import Yup from 'yup';

import gs from 'app/assets/css/global/globalStyles';
import { Button } from 'app/bit-migration/react-components/button/button';
import { Field as RadioField } from 'app/components/Field-Old/FieldOld';
import Field from 'app/components/Field-Old-New';
import FieldError from 'app/components/FieldError';
import Select from 'app/components/Select';
import { TermsText } from 'app/components/TermsText';
import type { SignUpPayload } from 'app/hooks/auth/signUp';
import { useRegionalData } from 'app/hooks/useRegionalData';
import { gtmSiteInteractionEvent } from 'app/lib/analytics/sharedGTMevents';
import FetchError from 'app/lib/fetchJSON/FetchError';
import { formikIsRequiredField } from 'app/lib/formikIsRequiredField';
import { PASSWORD_POLICY_REGEX, PASSWORD_POLICY_TEXT } from 'app/lib/passwordPolicy';
import { filterDialingCodes, isEmpty } from 'app/lib/siteHelpers';
import { SnowplowSchemas } from 'app/lib/snowplowSchemas';
import { CHECKOUT_URL } from 'app/views/Checkout/helpers';

import getIsValidPhoneNumber from '../../lib/phoneNumberValidation';

import s from './styles.module.css';

interface CheckoutSignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dialingCode: string;
  subscribe: 'Subscribe' | 'Unsubscribe' | '';
  phoneNumber: string;
}

interface CheckoutSignUpFormProps {
  signUpSuccess?: (subscribe: CheckoutSignUpFormValues['subscribe']) => void;
  origin: string;
  signUp: (values: SignUpPayload) => Promise<void>;
  autoOptIn: boolean;
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('presence'),
  lastName: Yup.string().required('presence'),
  email: Yup.string().email('formatting').required('presence'),
  dialingCode: Yup.string(),
  phoneNumber: getIsValidPhoneNumber(),
  password: Yup.string().required('nomessage').matches(PASSWORD_POLICY_REGEX, 'passwordPolicy'),
  subscribe: Yup.string().required('presence'),
});

const showRequiredAsterisk = (fieldName: string) => {
  return formikIsRequiredField(
    {
      validationSchema,
    },
    fieldName,
  );
};

const CheckoutSignUpFormWithoutFormik: FC<CheckoutSignUpFormProps & FormikProps<CheckoutSignUpFormValues>> = ({
  values,
  touched,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
}) => {
  const staticPageText = useRegionalData('staticPageText', [
    { 'continue-to-delivery': { defaultValue: 'Continue to delivery' } },
    { 'first-name': { defaultValue: 'First Name' } },
    { 'last-name': { defaultValue: 'Last Name' } },
    { email: { defaultValue: 'Email' } },
    { 'country-code': { defaultValue: 'Country Code' } },
    { 'phone-no': { defaultValue: 'Phone number' } },
    { password: { defaultValue: 'Password' } },
    { 'password-policy-text': { defaultValue: PASSWORD_POLICY_TEXT } },
    { email: { defaultValue: 'Email' } },
    { yes: { defaultValue: 'Yes' } },
    { no: { defaultValue: 'No' } },
    {
      'special-offers': {
        defaultValue:
          'Enjoy special offers, brand inspiration, Trinny London product \n announcements and more – sent directly to your inbox.',
      },
    },
    { newsletter: { defaultValue: 'Inspiration, news, discounts, tips – it’s all in the Newsletter' } },
  ]);

  const countries = useSelector((state) => state.checkout.countries);
  const formTouched = {
    form: (touched.email && touched.password) ?? false,
  };

  return (
    <form className={s.form} onSubmit={handleSubmit} action="#">
      {/* @ts-expect-error -- Property 'form' does not exist on type 'FormikErrors<CheckoutSignUpFormValues>'. */}
      {errors && errors.form && (
        <div>
          <FieldError
            // @ts-expect-error -- Type 'FormikErrors<CheckoutSignUpFormValues>' is not assignable to type 'Record<string, [FormError]>'.
            errors={errors}
            property="form"
            touched={formTouched}
            className={s.error}
            signUpLink={CHECKOUT_URL.options}
          />
        </div>
      )}
      <div className={s.row}>
        <Field
          name="firstName"
          placeholderText="Enter your firstname"
          label={staticPageText['first-name']}
          maxLength="40"
          className={s.field}
          type="text"
          testId="test-sign-up-first-name"
          value={values.firstName}
          onChange={handleChange}
          handleBlur={handleBlur}
          touched={touched}
          errors={errors || {}}
          showRequiredAsterisk={showRequiredAsterisk('firstName')}
        />
      </div>
      <div className={s.row}>
        <Field
          name="lastName"
          placeholderText="Enter your lastname"
          label={staticPageText['last-name']}
          maxLength="40"
          className={s.field}
          type="text"
          testId="test-sign-up-last-name"
          value={values.lastName}
          onChange={handleChange}
          handleBlur={handleBlur}
          touched={touched}
          errors={errors || {}}
          showRequiredAsterisk={showRequiredAsterisk('lastName')}
        />
      </div>
      <div className={s.row}>
        <Field
          name="email"
          placeholderText="Enter your email address"
          label={staticPageText['email']}
          maxLength="100"
          className={s.field}
          type="text"
          testId="test-sign-up-email"
          value={values.email}
          onChange={handleChange}
          showRequiredAsterisk={showRequiredAsterisk('email')}
          {...{
            handleBlur,
            errors,
            touched,
          }}
        />
      </div>
      <div className={cx(s.phoneContainer, s.row)}>
        <Select
          name="dialingCode"
          label={staticPageText['country-code']}
          value={values.dialingCode}
          onChange={handleChange}
          handleBlur={handleBlur}
          // @ts-expect-error -- Type 'FormikErrors<CheckoutSignUpFormValues>' is not assignable to type 'Record<string, [FormError]>'.
          errors={errors}
          touched={touched}
          testId="test-sign-up-dialing-code"
          className={s.countryDialingCode}
          showRequiredAsterisk={showRequiredAsterisk('dialingCode')}
        >
          <>
            {/* @ts-expect-error ts-migrate(2322) FIXME: Type 'true' is not assignable to type 'string | nu... Remove this comment to see the full error message */}
            <option id="placeholder " value="" defaultValue />
            <option value="" />
            {filterDialingCodes(countries).map((country) => (
              <option value={country.dialing_code} key={country.code}>
                {country.dialing_code}
              </option>
            ))}
          </>
        </Select>
        <Field
          name="phoneNumber"
          label={staticPageText['phone-no']}
          type="tel"
          inputMode="tel"
          replaceRegEx={/\D/g}
          value={values.phoneNumber}
          onChange={handleChange}
          handleBlur={handleBlur}
          errors={errors}
          touched={touched}
          testId="test-sign-up-phone-number"
          className={s.phoneField}
          autocomplete="tel-national"
          showRequiredAsterisk={showRequiredAsterisk('phoneNumber')}
        />
      </div>
      <div className={s.row}>
        <Field
          name="password"
          placeholderText="Enter your password"
          label={staticPageText['password']}
          maxLength="40"
          className={s.field}
          type="password"
          testId="test-sign-up-password"
          value={values.password}
          onChange={handleChange}
          handleBlur={handleBlur}
          helpText={staticPageText['password-policy-text']}
          touched={touched}
          errors={errors || {}}
          showRequiredAsterisk={showRequiredAsterisk('password')}
        />
      </div>
      <div className={s.newsletterContainer}>
        <h4 className={cx(gs.styleSectionSmallHeading, s.subscriptionHeading)}>{staticPageText['newsletter']}</h4>
        <div className={s.privacyText}>{staticPageText['special-offers']}</div>

        {/* @ts-expect-error -- Type 'FormikErrors<CheckoutSignUpFormValues>' is not assignable to type 'Record<string, [FormError]>'. */}
        <RadioField
          name="subscribe"
          id="subscribe-radio-button"
          label={staticPageText['yes']}
          value="Subscribe"
          checked={values.subscribe === 'Subscribe'}
          type="radio"
          testId="signup-subscribe"
          {...{
            handleChange,
            handleBlur,
            errors,
            touched,
          }}
        />
        {/* @ts-expect-error -- Type 'FormikErrors<CheckoutSignUpFormValues>' is not assignable to type 'Record<string, [FormError]>'. */}
        <RadioField
          name="subscribe"
          id="unsubscribe-radio-button"
          label={staticPageText['no']}
          value="Unsubscribe"
          checked={values.subscribe === 'Unsubscribe'}
          type="radio"
          testId="signup-unsubscribe"
          lastField
          {...{
            handleChange,
            handleBlur,
            errors,
            touched,
          }}
        />
      </div>
      <TermsText />
      <Button
        mt="20px"
        colorScheme="darkGrey"
        size="small"
        disabled={!isEmpty(errors)}
        data-test-id="continue-to-delivery"
      >
        {staticPageText['continue-to-delivery']}
      </Button>
    </form>
  );
};

export const CheckoutSignUpForm = withFormik<CheckoutSignUpFormProps, CheckoutSignUpFormValues>({
  mapPropsToValues: (props) => ({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    subscribe: props.autoOptIn ? 'Subscribe' : '',
    dialingCode: '',
    phoneNumber: '',
  }),
  validationSchema,
  validateOnChange: true,

  handleSubmit(payload, { props: { signUp, signUpSuccess, origin }, setErrors, setSubmitting }) {
    void (async () => {
      try {
        await signUp({ ...payload, origin });

        if (payload.subscribe === 'Subscribe') {
          gtmSiteInteractionEvent(origin, 'Newsletter Sign Up');
        }
        trackSelfDescribingEvent({
          event: {
            schema: SnowplowSchemas.sign_up_event,
            data: {
              source: 'Checkout page',
              marketing_opt_in: payload.subscribe === 'Subscribe',
              account_created: true,
            },
          },
        });

        signUpSuccess?.(payload.subscribe);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
        if (error && error.response) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- [TF-686] Make an effort to fix me
          const errorJson = await error.response.json();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
          if (typeof errorJson.error === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
            setErrors(errorJson.error);
          } else {
            const sqlUniquenessError = !!(
              errorJson.error && // eslint-disable-line @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
              errorJson.error.errors &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any -- [TF-686] Make an effort to fix me
              errorJson.error.errors.some((err: any) => err.message === 'email must be unique')
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
            const dynamoUniquenessError =
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
              errorJson.error && errorJson.error.code && errorJson.error.code.httpCode === 400;

            if (sqlUniquenessError || dynamoUniquenessError) {
              setErrors({
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ form: string[]; }' is not assi... Remove this comment to see the full error message
                form: ['uniqueness'],
              });
            }
          }

          throw error;
        }

        if (!(error instanceof FetchError)) {
          throw error;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- [TF-686] Make an effort to fix me
        const { errors } = await error.extractErrorMessages();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- [TF-686] Make an effort to fix me
        setErrors(errors);
        throw error;
      } finally {
        setSubmitting(false);
      }
    })();
  },
})(CheckoutSignUpFormWithoutFormik);
