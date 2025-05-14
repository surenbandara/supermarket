// Core
import { Form, Formik, FormikHelpers } from 'formik';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Interface and Types
import { IConfigurationAddFormComponentProps, IQueryResult } from '@/lib/utils/interfaces';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';

// Utilities and Constants
import { ConfigurationErrors } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

//Toast
import useToast from '@/lib/hooks/useToast';


import { api } from '@/lib/hooks/useQueryQL';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { IConfigurationForm } from '@/lib/utils/interfaces/forms/configuration.form.interface';
import { ConfigurationSchema } from '@/lib/utils/schema';
import { useState } from 'react';

export default function ConfigurationAddForm({
  onHide,
  configuration,
  position = 'right',
  isAddConfigurationVisible,
  setReload
}: any) {
  const initialValues: any = configuration ?? {
    name: '',
    value: ''
  };

  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  const [loading, setLoading] = useState<boolean>(false);

  // Form Submission
  const handleSubmit =  async (
    values: any,
    { resetForm }: FormikHelpers<IConfigurationForm>
  ) => {
    if (values) {
      try {
        setLoading(true);
        let response: any;
        if (configuration) {
          response = await api.put(`${SERVER_URL}/system-parameters`, values, user?.jwtToken);
        } else {
          response= await api.post(`${SERVER_URL}/system-parameters`, values, user?.jwtToken);
        }
        if (Object.keys(response).length != 0 && response.status != 400) {
          showToast({
            type: 'success',
            title: t('Success'),
            message: configuration ? t('Configuration updated') : t('Configuration added'),
            duration: 3000,
          });
          setReload(Date.now()) 
        } else {
          const message = t('ActionFailedTryAgain');
          showToast({
            type: 'error',
            title: t('Error'),
            message,
            duration: 3000,
          });
        } 
        setLoading(false);
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
      visible={isAddConfigurationVisible}
      position={position}
      onHide={onHide}
      className="w-full sm:w-[450px]"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-lg">
                {configuration ? t('Edit') : t('Add')} {t('Configuration')}
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={ConfigurationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={true} 
                validateOnBlur={false} 
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
                              ConfigurationErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <CustomTextField
                          type="text"
                          name="value"
                          placeholder={'Value'}
                          maxLength={35}
                          value={values.value}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'value',
                              errors?.value,
                              ConfigurationErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />

                        <div className="mt-4 flex justify-end">
                          <CustomButton
                            className="h-10 w-fit border-gray-300 bg-black px-8 text-white"
                            label={configuration ? t('Update') : t('Add')}
                            type="submit"
                            loading={loading}
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
