'use client';

// Core
import { useContext, useState } from 'react';

// Formik
import { Form, Formik } from 'formik';

// Prime React
import { Card } from 'primereact/card';

// Interface
import {
  IUserLoginDataResponse,
  ISignInForm,
} from '@/lib/utils/interfaces/forms';

// Component
import CustomButton from '@/lib/ui/useable-components/button';
import CustomIconTextField from '@/lib/ui/useable-components/input-icon-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';

// Constants
import {
  APP_NAME,
  SELECTED_RESTAURANT,
  SELECTED_VENDOR,
  SELECTED_VENDOR_EMAIL,
  SignInErrors,
} from '@/lib/utils/constants';

// Methods
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

// Icons
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

// GraphQL
import { OWNER_LOGIN } from '@/lib/api/graphql';
import { ToastContext } from '@/lib/context/global/toast.context';
import { ApolloError, useMutation } from '@apollo/client';

// Schema
import { onUseLocalStorage } from '@/lib/utils/methods';
import { SignInSchema } from '@/lib/utils/schema';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/lib/hooks/useUser';
import { DEFAULT_ROUTES } from '@/lib/utils/constants/routes';

const initialValues: ISignInForm = {
  email: 'systemAdmin@gmail.com',
  password: 'admin@123',
};

export default function LoginEmailPasswordMain() {
  // Context
  const { showToast } = useContext(ToastContext);
  const [loading, setLoading] = useState<boolean>(false);
  

  // Hooks
  const router = useRouter();
  const { setUser, onLogin } = useUserContext();


  // API Handlers
  function onCompleted(ownerLogin: IUserLoginDataResponse) {
    setUser(ownerLogin);
    let redirect_url = DEFAULT_ROUTES[ownerLogin.basicUserDetails.role as keyof typeof DEFAULT_ROUTES];
    router.replace(redirect_url);

    showToast({
      type: 'success',
      title: 'Login',
      message: 'User has been logged in successfully.',
    });
  }

  // Handler
  const onSubmitHandler = async (data: ISignInForm) => {
    try {
      setLoading(false);
      const user = await onLogin(data.email, data.password);
      onCompleted(user)
    } catch (err) {
      setLoading(false);
      showToast({
        type: 'error',
        title: 'Login',
        message: 'Login Failed',
      });
    }
  };

  return (
    <div className="flex h-full w-screen items-center justify-center">
      <div className="w-full md:w-1/2 lg:w-[30%]">
        <Card>
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col items-center gap-y-[0.5rem] p-2">
              <span className="font-inter text-center text-3xl font-semibold">
                Login to your account
              </span>
              <span className="font-inter text-center text-base font-normal text-[#667085]">
                Welcome back! Please enter your details.
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={SignInSchema}
                onSubmit={onSubmitHandler}
                validateOnChange={false}
              >
                {({ values, errors, handleChange }) => {
                  return (
                    <Form>
                      <div className="mb-2">
                        <CustomIconTextField
                          placeholder="Email"
                          name="email"
                          type="email"
                          maxLength={35}
                          value={values.email}
                          iconProperties={{
                            icon: faEnvelope,
                            position: 'right',
                            style: {
                              marginTop: '-10px',
                            },
                          }}
                          showLabel={false}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'email',
                              errors?.email,
                              SignInErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>

                      <div className="mb-2">
                        <CustomPasswordTextField
                          className="h-[2.4rem] w-full"
                          placeholder="Password"
                          name="password"
                          maxLength={20}
                          showLabel={false}
                          value={values.password}
                          onChange={handleChange}
                          feedback={false}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'password',
                              errors?.password,
                              SignInErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>

                      <CustomButton
                        className="hover-border-black h-10 w-full border border-black bg-[#18181B] px-32 text-white hover:bg-white hover:text-black"
                        label="Login"
                        type="submit"
                        loading={loading}
                      />
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
