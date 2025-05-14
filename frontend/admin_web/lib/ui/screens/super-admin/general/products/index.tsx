// Components
import ProductAddForm from '@/lib/ui/screen-components/protected/super-admin/products/add-form';
import ProductHeader from '@/lib/ui/screen-components/protected/super-admin/products/view/header/screen-header';
import ProductsMain from '@/lib/ui/screen-components/protected/super-admin/products/view/main';

// Interfaces and Types
import { IProductResponse } from '@/lib/utils/interfaces/product.interface';
import { useState } from 'react';

export default function ProductsPage() {
  // State
  const [isAddProductVisible, setIsAddProductVisible] = useState(false);
  const [product, setProduct] = useState<null | IProductResponse>(null);
  const [reload, setReload] = useState<number>(0);

  return (
    <div className="screen-container">
      <ProductHeader setIsAddProductVisible={setIsAddProductVisible} />

      <ProductsMain
        setIsAddProductVisible={setIsAddProductVisible}
        setProduct={setProduct}
        reload={reload}
      />

      <ProductAddForm
        product={product}
        onHide={() => {
          setIsAddProductVisible(false);
          setProduct(null);
        }}
        isAddProductVisible={isAddProductVisible}
        setReload={setReload}
      />
    </div>
  );
}
