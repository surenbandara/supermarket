// Core
import { Form, Formik, FormikHelpers } from 'formik';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Interface and Types
import { IQueryResult, IRestaurantForm } from '@/lib/utils/interfaces';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';
import CustomUploadImageComponent from '@/lib/ui/useable-components/upload/upload-image';

// Utilities and Constants
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

//Toast
import useToast from '@/lib/hooks/useToast';

import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';
import { useMutation } from '@apollo/client';
import CustomPhoneTextField from '@/lib/ui/useable-components/phone-input-field';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { RestaurantSchema } from '@/lib/utils/schema';
import { RestaurantErrors, SHOP_TYPE } from '@/lib/utils/constants';

export default function RestaurantAddForm({
  onHide,
  restaurant,
  position = 'right',
  isAddRestaurantVisible,
  setReload
}: any) {
  const initialValues: IRestaurantForm = restaurant ??{
    name: '',
    vendorName: '',
    vendorPhoneNumber: '',
    vendorEmai: '',
    timestamp: 0,
    category: null
  };

  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();

  // Form Submission
  const handleSubmit =  async (
    values: IRestaurantForm,
    { resetForm }: FormikHelpers<IRestaurantForm>
  ) => {
    if (values) {
      try {
        let response: any;
        const request: any = values;
        request.category = request.category.code;
        if (restaurant) {
          response = await api.put(`${SERVER_URL}/shop`, request, user?.jwtToken);
        } else {
          response= await api.post(`${SERVER_URL}/shop`, request, user?.jwtToken);
        }
        
        if (Object.keys(response).length != 0 && response.status != 400) {
          showToast({
          type: 'success',
          title: t('Success'),
          message: restaurant ? t('Restuarent updated') : t('Restuarent added'),
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
      visible={isAddRestaurantVisible}
      position={position}
      onHide={onHide}
      className="w-full sm:w-[450px]"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-lg">
                {restaurant ? t('Edit') : t('Add')} {'Restuarent'}
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={RestaurantSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={true} // Disable validation on change
                validateOnBlur={false} // Disable validation on blur
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting
                }) => {
                  console.log(errors);
                  return (
                    <Form onSubmit={handleSubmit}>
                    <div className="mb-2 space-y-3">
                      <div>
                        <CustomTextField
                          type="text"
                          name="name"
                          placeholder={'Restaurant Name'}
                          maxLength={35}
                          value={values.name}
                          onChange={handleChange}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'name',
                              errors?.name,
                              RestaurantErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>
                  
                      <div>
                        <CustomTextField
                          placeholder={'Vendor Name'}
                          name="vendorName"
                          type="text"
                          maxLength={50}
                          showLabel={true}
                          value={values.vendorName ?? ''}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'vendorName',
                              errors?.vendorName,
                              RestaurantErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>
                  
                      <div>
                        <CustomTextField
                          placeholder={'Vendor Email'}
                          name="vendorEmai"
                          type="email"
                          showLabel={true}
                          value={values.vendorEmai ?? ''}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'vendorEmai',
                              errors?.vendorEmai,
                              RestaurantErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>
                  
                      <div>
                        <CustomTextField
                          placeholder={'Vendor Phone Number'}
                          name="vendorPhoneNumber"
                          type="text"
                          showLabel={true}
                          value={values.vendorPhoneNumber ?? ''}
                          onChange={handleChange}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'vendorPhoneNumber',
                              errors?.vendorPhoneNumber,
                              RestaurantErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>
                  
                      <div>
                        <CustomDropdownComponent
                          name="category"
                          placeholder={'Shop Category'}
                          selectedItem={values.category}
                          setSelectedItem={setFieldValue}
                          options={SHOP_TYPE}
                          showLabel={true}
                          style={{
                            borderColor: onErrorMessageMatcher(
                              'category',
                              errors?.category,
                              RestaurantErrors
                            )
                              ? 'red'
                              : '',
                          }}
                        />
                      </div>
                  
                      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4">
                        <CustomUploadImageComponent
                            key="image"
                            name="image"
                            title={'Upload Image'}
                            onSetImageUrl={setFieldValue}
                            style={{
                              borderColor: 
                                errors?.image 
                                ? 'red'
                                : '',
                            }}
                            existingImageUrl={values.image}
                            showExistingImage={true}
                            fileTypes={['image/webp', 'image/jpg', 'image/jpeg']}
                            maxFileHeight={841}
                            maxFileWidth={1980}
                            orientation="LANDSCAPE" maxFileSize={0}                      />
                      </div>
                  
                      <div className="mt-4 flex justify-between">
                        <CustomButton
                          className="h-10 w-fit border-gray-300 bg-black px-8 text-white"
                          label={'Submit'}
                          type="submit"
                          loading={isSubmitting}
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
