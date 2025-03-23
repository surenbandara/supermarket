'use client';

// Core
import { Form, Formik } from 'formik';
import { useContext, useMemo } from 'react';

// Interface and Types
import {
  ICreateRestaurant,
  ICreateRestaurantResponse,
  IDropdownSelectItem,
  IQueryResult,
  IRestaurantsResponseGraphQL,
} from '@/lib/utils/interfaces';

// Component
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomMultiSelectComponent from '@/lib/ui/useable-components/custom-multi-select';
import CustomTextField from '@/lib/ui/useable-components/input-field';

// Constants
import { MAX_LANSDCAPE_FILE_SIZE, MAX_SQUARE_FILE_SIZE, RestaurantErrors, SHOP_TYPE } from '@/lib/utils/constants';

// Interface
import { IRestaurantForm } from '@/lib/utils/interfaces';

// Methods
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

// Schemas
import {
  CREATE_RESTAURANT,
  GET_CUISINES,
  GET_RESTAURANTS,
} from '@/lib/api/graphql';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';
import { ToastContext } from '@/lib/context/global/toast.context';
import { api, useQueryGQL } from '@/lib/hooks/useQueryQL';
import CustomNumberField from '@/lib/ui/useable-components/number-input-field';
import CustomUploadImageComponent from '@/lib/ui/useable-components/upload/upload-image';
import {
  ICuisine,
  IGetCuisinesData,
} from '@/lib/utils/interfaces/cuisine.interface';
import { IRestaurantsAddRestaurantComponentProps } from '@/lib/utils/interfaces/restaurants.interface';
import { toTextCase } from '@/lib/utils/methods';
import { RestaurantSchema } from '@/lib/utils/schema/restaurant';
import { ApolloCache, ApolloError, useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';

const initialValues: IRestaurantForm = {
  name: '',
  vendorName: '',
  vendorPhoneNumber: '',
  vendorEmai: '',
  timestamp: 0,
  category: null
};

export default function RestaurantDetailsForm({
  stepperProps,
}: IRestaurantsAddRestaurantComponentProps) {
  // Hooks
  const t = useTranslations();

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  
  // Context
  const { showToast } = useContext(ToastContext);
  const { restaurantsContextData, onRestaurantsFormVisible, onActiveStepChange, activeIndex } =
    useContext(RestaurantsContext);

  // Handlers
  const onCreateRestaurant = async (data: IRestaurantForm) => {
    try {
      onRestaurantsFormVisible(false);
      const payload: any = {...data}
      payload.timestamp = Date.now();
      payload.email = data.vendorEmai;
      payload.category = data.category?.code;
      await api.post(`${SERVER_URL}/shop`, payload, user?.jwtToken);
      onActiveStepChange(activeIndex+1);
      showToast({
        type: 'success',
        title: t('New Store'),
        message: t(`Store Creation Sucess`),
        duration: 2500,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: t('New Store'),
        message: t(`Store Creation Failed`),
        duration: 2500,
      });
    }
  };

  function onError({ graphQLErrors, networkError }: ApolloError) {
    showToast({
      type: 'error',
      title: t('New Store'),
      message:
        graphQLErrors[0]?.message ??
        networkError?.message ??
        t('Store Creation  Failed'),
      duration: 2500,
    });
  }
  function update(
    cache: ApolloCache<unknown>,
    data: ICreateRestaurantResponse
  ): void {
    if (!data) return;

    const restaurantId = restaurantsContextData?.restaurant?._id?.code;

    const cachedData: IRestaurantsResponseGraphQL | null = cache.readQuery({
      query: GET_RESTAURANTS,
    });

    const cachedRestaurants = cachedData?.restaurants ?? [];

    cache.writeQuery({
      query: GET_RESTAURANTS,
      variables: { id: restaurantId },
      data: {
        restaurants: [...(cachedRestaurants ?? [])],
      },
    });
  }

  return (
    <div className="flex h-full w-full items-center justify-start">
      <div className="h-full w-full">
        <div className="flex flex-col gap-2">
          {/* <div className="flex flex-col mb-2">
            <span className="text-lg">Add Restaurant</span>
          </div>
 */}
          <div>
            <Formik
              initialValues={initialValues}
              validationSchema={RestaurantSchema}
              onSubmit={async (values) => {
                await onCreateRestaurant(values);
              }}
              validateOnChange={false}
            >
              {({
                values,
                errors,
                handleChange,
                handleSubmit,
                isSubmitting,
                setFieldValue,
              }) => {
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
  );
}
