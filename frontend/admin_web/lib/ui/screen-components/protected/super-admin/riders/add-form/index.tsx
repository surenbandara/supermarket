// Core
import { Form, Formik, FormikHelpers } from 'formik';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Interface and Types
import { IQueryResult } from '@/lib/utils/interfaces';
import { IRiderForm } from '@/lib/utils/interfaces/forms';
import {
  IRidersAddFormComponentProps,
  IRiderZonesResponse,
} from '@/lib/utils/interfaces';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';

// Utilities and Constants
import { RiderErrors } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';
import { RiderSchema } from '@/lib/utils/schema/rider';

//Toast
import useToast from '@/lib/hooks/useToast';

//GraphQL
import {
  CREATE_RIDER,
  EDIT_RIDER,
  GET_RIDERS,
  GET_ZONES,
} from '@/lib/api/graphql';
import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useMutation } from '@apollo/client';
import CustomPhoneTextField from '@/lib/ui/useable-components/phone-input-field';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';

export default function RiderAddForm({
  onHide,
  rider,
  position = 'right',
  isAddRiderVisible,
  setReload
}: IRidersAddFormComponentProps) {
  const initialValues: IRiderForm = {
    name: '',
    email: '',
    phoneNumber: '',
    vehicle: '',
    available: false
  };

  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  // Query
  const { data } = useQueryGQL(GET_ZONES, {
    fetchPolicy: 'cache-and-network',
  }) as IQueryResult<IRiderZonesResponse | undefined, undefined>;

  // Mutation
  const mutation = rider ? EDIT_RIDER : CREATE_RIDER;
  const [mutate, { loading: mutationLoading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_RIDERS }],
  });

  // Form Submission
  const handleSubmit =  async (
    values: IRiderForm,
    { resetForm }: FormikHelpers<IRiderForm>
  ) => {
    if (values) {
      try {
        console.log(values)
        await api.post(`${SERVER_URL}/rider`, values, user?.jwtToken);
        showToast({
          type: 'success',
          title: t('Success'),
          message: rider ? t('Rider updated') : t('Rider added'),
          duration: 3000,
        });
        setReload(Date.now())
        resetForm();
        onHide();
      }  catch (error: any) {
        let message = '';
        try {
          message = error;
        } catch (err) {
          message = t('ActionFailedTryAgain');
        }
        showToast({
          type: 'error',
          title: t('Error'),
          message,
          duration: 3000,
        });
      }
      
    }
  };

  return (
    <Sidebar
      visible={isAddRiderVisible}
      position={position}
      onHide={onHide}
      className="w-full sm:w-[450px]"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-lg">
                {rider ? t('Edit') : t('Add')} {t('Rider')}
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={RiderSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={true} // Disable validation on change
                validateOnBlur={false} // Disable validation on blur
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit
                }) => {
                  console.log(errors);
                  return (
                    <Form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <CustomTextField
                          type="text"
                          name="name"
                          placeholder={'Name'}
                          maxLength={35}
                          value={values.name}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'name',
                              errors?.name,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomTextField
                          type="email"
                          name="email"
                          placeholder={'Email'}
                          maxLength={35}
                          value={values.email}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'email',
                              errors?.email,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                        <CustomTextField
                          type="text"
                          name="phoneNumber"
                          placeholder={'Phone Number'}
                          maxLength={35}
                          value={values.phoneNumber}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'phoneNumber',
                              errors?.phoneNumber,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />


                        <CustomTextField
                          type="text"
                          name="vehicle"
                          placeholder={'Vehicle'}
                          maxLength={35}
                          value={values.vehicle}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'vehicle',
                              errors?.vehicle,
                              RiderErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <div className="mt-4 flex justify-end">
                          <CustomButton
                            className="h-10 w-fit border-gray-300 bg-black px-8 text-white"
                            label={rider ? t('Update') : t('Add')}
                            type="submit"
                            loading={mutationLoading}
                          />
                        </div>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
