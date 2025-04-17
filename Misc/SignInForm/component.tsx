import { Formik } from 'formik';
import React, { type FC } from 'react';
import Yup from 'yup';

import { Button } from 'app/bit-migration/react-components/button/button';
import { Link } from 'app/bit-migration/react-components/link/link';
import Field from 'app/components/Field-Old-New';
import { useSignIn } from 'app/hooks/auth/signIn';
import { useSnowplowSiteInteraction } from 'app/hooks/snowplow/useSnowplowSiteInteraction';
import { useSiteWideText } from 'app/hooks/useRegionalData';
import FetchError from 'app/lib/fetchJSON/FetchError';
import { formikIsRequiredField } from 'app/lib/formikIsRequiredField';
import { isEmpty } from 'app/lib/siteHelpers';

import FieldError from '../FieldError';

import s from './styles.module.css';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('formatting').required('presence'),
  password: Yup.string().required('presence'),
});

export interface SignUpFormValues {
  email: string;
  password: string;
}

export interface SignInFormProps {
  signInSuccess?: () => void;
}

export const SignInForm: FC<SignInFormProps> = ({ signInSuccess }) => {
  const { signIn } = useSignIn();
  const submitText = useSiteWideText('continue-to-delivery', { defaultValue: 'Continue to delivery' });
  const emailLabel = useSiteWideText('email', { defaultValue: 'Email' });
  const passwordLabel = useSiteWideText('password', { defaultValue: 'Password' });
  const forgotPassword = useSiteWideText('forgot-password', { defaultValue: 'Forgot Password?' });
  const snowplowSiteInteraction = useSnowplowSiteInteraction();

  return (
    <Formik<SignUpFormValues>
      initialValues={{
        email: '',
        password: '',
      }}
      onSubmit={async (payload, { setErrors, setSubmitting }) => {
        try {
          await signIn(payload);
          signInSuccess?.();
        } catch (error) {
          if (error instanceof FetchError) {
            await error.extractErrorMessages();
            setErrors({
              // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ form: { message: any; }; }' is... Remove this comment to see the full error message
              form: {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- [TF-686] Make an effort to fix me
                message: error.json.message,
              },
            });
            throw error;
          }

          setErrors({
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ form: { message: string; }; }'... Remove this comment to see the full error message
            form: {
              message: 'Unknown error',
            },
          });
          throw error;
        } finally {
          setSubmitting(false);
        }
      }}
      validationSchema={validationSchema}
      validateOnChange
    >
      {({ values, touched, errors, handleChange, handleBlur, handleSubmit }) => {
        const formTouched = {
          form: touched.email && touched.password,
        };

        return (
          <form className={s.form} onSubmit={handleSubmit} action="#">
            {/* @ts-expect-error -- Property 'form' does not exist on type 'FormikErrors<SignUpFormValues>'. */}
            {errors && errors.form && (
              <div>
                {/* @ts-expect-error -- Property 'form' does not exist on type 'FormikErrors<SignUpFormValues>'. */}
                <FieldError errors={errors} property="form" touched={formTouched} className={s.error} />
              </div>
            )}
            <div className={s.row}>
              <Field
                name="email"
                placeholderText="Enter your email address"
                label={emailLabel}
                maxLength="40"
                className={s.field}
                type="text"
                testId="test-sign-in-email"
                value={values.email}
                onChange={handleChange}
                handleBlur={handleBlur}
                touched={touched}
                errors={errors || {}}
                showRequiredAsterisk={formikIsRequiredField(
                  {
                    validationSchema,
                  },
                  'email',
                )}
              />
            </div>
            <div className={s.row}>
              <Field
                name="password"
                placeholderText="Enter your password"
                label={passwordLabel}
                maxLength="40"
                className={s.field}
                type="password"
                testId="test-sign-in-password"
                value={values.password}
                onChange={handleChange}
                handleBlur={handleBlur}
                touched={touched}
                errors={errors || {}}
                showRequiredAsterisk={formikIsRequiredField(
                  {
                    validationSchema,
                  },
                  'password',
                )}
              />
            </div>

            <div className={s.forgottenPasswordContainer}>
              <Link href="/forgot-password">{forgotPassword}</Link>
            </div>

            <Button
              type="submit"
              size="small"
              mt="20px"
              colorScheme="darkGrey"
              disabled={!isEmpty(errors)}
              dataTestId="continue-to-delivery"
              onClick={() => snowplowSiteInteraction('Continue to delivery', 'Checkout options ')}
            >
              {submitText}
            </Button>
          </form>
        );
      }}
    </Formik>
  );
};
