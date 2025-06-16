// Core
import { Form, Formik, FormikHelpers } from 'formik';

// Prime React
import { Sidebar } from 'primereact/sidebar';

// Components
import CustomButton from '@/lib/ui/useable-components/button';
import CustomDropdownComponent from '@/lib/ui/useable-components/custom-dropdown';
import CustomTextField from '@/lib/ui/useable-components/input-field';
import CustomPasswordTextField from '@/lib/ui/useable-components/password-input-field';

// Utilities and Constants
import { MAX_SQUARE_FILE_SIZE, ProductErrors } from '@/lib/utils/constants';
import { onErrorMessageMatcher } from '@/lib/utils/methods/error';

//Toast
import useToast from '@/lib/hooks/useToast';


import { api } from '@/lib/hooks/useQueryQL';
import { useTranslations } from 'next-intl';
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useUserContext } from '@/lib/hooks/useUser';
import { IProductResponse } from '@/lib/utils/interfaces/product.interface';
import { IProductForm } from '@/lib/utils/interfaces/forms/product.form.interface';
import { ProductSchema } from '@/lib/utils/schema/product';

import CustomUploadImageComponent from '@/lib/ui/useable-components/upload/upload-image';
import { useCusineContext } from '@/lib/hooks/useCuisine';
import { IDropdownSelectItem } from '@/lib/utils/interfaces';
import { SelectItem } from 'primereact/selectitem';
import TagSelectorComponent from '@/lib/ui/useable-components/tag-selector';
import { useEffect, useState } from 'react';

export default function ProductAddForm({
  onHide,
  product,
  position = 'right',
  isAddProductVisible,
  setReload
}: any) {
  const initialValues: any =  product ?? {
    id: 0,
    name: '',
    price: 0,
    quantity: 0,
    cusine: [],
    brand: '',
    shop: '',
    timestamp: 0
  };

  // Hooks
  const t = useTranslations();
  const { showToast } = useToast();

  const {SERVER_URL} = useConfiguration();
  const {user} = useUserContext();
  const {cusines} = useCusineContext();
  const [cusineList, setCusineList] = useState<string[]>(product?.cusine ?? []); 
  const [imageUri, setImageUri] = useState<string>(product?.image ?? null);

  console.log('Cusineeee  ', cusines);
  console.log('initialValues  ', initialValues);

  useEffect(() => {
      setImageUri(product?.image ?? null)
      setCusineList(product?.cusine ?? [])
    }, [product]);

    
  // Form Submission
  const handleSubmit =  async (
    values: IProductForm,
    { resetForm }: FormikHelpers<IProductForm>
  ) => 
    {
    if (values) {
      let message = '';
      try {
        let payload: any = values;
        // payload.cusine = cusineList
        if (imageUri != null){
          payload.image = imageUri;
        }
        let response: any; 
        if (product) {
          response = await api.put(`${SERVER_URL}/product`, payload, user?.jwtToken);
        } else {
          response= await api.post(`${SERVER_URL}/product`, values, user?.jwtToken);
        }
        
        if (Object.keys(response).length != 0 && response.status != 400) {
          showToast({
            type: 'success',
            title: t('Success'),
            message: product ? t('Product updated') : t('Product added'),
            duration: 3000,
          });
          setReload(Date.now()) 
        } else {
          message = t('ActionFailedTryAgain');
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
      visible={isAddProductVisible}
      position={position}
      onHide={onHide}
      className="w-full sm:w-[450px]"
    >
      <div className="flex h-full w-full items-center justify-start">
        <div className="h-full w-full">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex flex-col">
              <span className="text-lg">
                {product ? t('Edit') : t('Add')} {t('Product')}
              </span>
            </div>

            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={ProductSchema}
                onSubmit={handleSubmit}
                enableReinitialize
                validateOnChange={true} 
                validateOnBlur={false} 
              >
                {({
                  values,
                  errors,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  setFieldValue
                }) => {
                  console.log(errors);
                  return (
                    <Form onSubmit={handleSubmit}>
                     <div className="space-y-4">
        <CustomTextField
          type="text"
          name="name"
          placeholder={'Name'}
          maxLength={100}
          value={values.name}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: onErrorMessageMatcher(
              'name',
              errors?.name,
              ProductErrors
            )
              ? 'red'
              : '',
          }}
        />

        <CustomTextField
          type="number"
          name="price"
          placeholder={'Price'}
          value={String(values.price)}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: onErrorMessageMatcher(
              'price',
              errors?.price,
              ProductErrors
            )
              ? 'red'
              : '',
          }}
        />

        <CustomTextField
          type="number"
          name="quantity"
          placeholder={'Quantity'}
          value={String(values.quantity)}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: onErrorMessageMatcher(
              'quantity',
              errors?.quantity,
              ProductErrors
            )
              ? 'red'
              : '',
          }}
        />

        {/* <div>
          <TagSelectorComponent
            name="cusine"
            placeholder={'Cuisine Category'}
            selectedItems={cusineList}
            setSelectedItems={setCusineList}
            options={cusines?.map((cusine) => {return {code: cusine.name, label: cusine.name}}) as IDropdownSelectItem[]}
            showLabel={true}
            style={{
              borderColor: onErrorMessageMatcher(
                'cusine',
                errors?.cusine,
                ProductErrors
              )
                ? 'red'
                : '',
            }}
          />
        </div> */}

        <CustomTextField
          type="text"
          name="brand"
          placeholder={'Brand'}
          maxLength={50}
          value={values.brand}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: onErrorMessageMatcher(
              'brand',
              errors?.brand,
              ProductErrors
            )
              ? 'red'
              : '',
          }}
        />

        <CustomTextField
          type="text"
          name="shop"
          placeholder={'Shop'}
          maxLength={50}
          value={values.shop}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: onErrorMessageMatcher(
              'shop',
              errors?.shop,
              ProductErrors
            )
              ? 'red'
              : '',
          }}
        />

        <CustomTextField
          type="number"
          name="discount"
          placeholder={'Discount (Optional)'}
          value={String(values.discount || '')}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: ''
          }}
        />

         <CustomTextField
          type="text"
          name="additionalData.description"
          placeholder={'Description'}
          value={String(values.additionalData?.description || '')}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: ''
          }}
        />

         <CustomTextField
          type="text"
          name="additionalData.size"
          placeholder={'Size'}
          value={String(values.additionalData?.size || '')}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: ''
          }}
        />


        <CustomTextField
          type="text"
          name="additionalData.color"
          placeholder={'Color'}
          value={String(values.additionalData?.color || '')}
          onChange={handleChange}
          showLabel={true}
          style={{
            borderColor: ''
          }}
        />

      <CustomUploadImageComponent
          name="image"
          error=''
          onSetImageUrl={setImageUri}
          title={t('Upload Image')}
          existingImageUrl={
            product ? product.image : ''
          }
          showExistingImage={
            product ? true : false
          }
          fileTypes={['image/jpeg', 'image/jpg', 'image/webp']}
          maxFileHeight={1080}
          maxFileWidth={1080}
          maxFileSize={MAX_SQUARE_FILE_SIZE}
          orientation="SQUARE"
        />


      <div className="mt-4 flex justify-end">
        <CustomButton
          className="h-10 w-fit border-gray-300 bg-black px-8 text-white"
          label={product ? t('Update') : t('Add')}
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
