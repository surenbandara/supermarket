// Core
import { useState } from 'react';

// Components
import RestaurantAddForm from '@/lib/ui/screen-components/protected/super-admin/restaurants/add-form';
import RestaurantHeader from '@/lib/ui/screen-components/protected/super-admin/restaurants/view/header/screen-header';
import RestaurantsMain from '@/lib/ui/screen-components/protected/super-admin/restaurants/view/main';

// Interfaces and Types

import { IRestaurantResponse } from '@/lib/utils/interfaces/restaurant.interface';

export default function RestaurantsScreen() {
  // State
  const [isAddRestaurantVisible, setIsAddRestaurantVisible] = useState(false);
  const [restaurant, setRestaurant] = useState<null | IRestaurantResponse>(null);
  const [reload, setReaload] = useState<number>(0);

  return (
    <div className="screen-container">
      <RestaurantHeader setIsAddRestaurantVisible={setIsAddRestaurantVisible} 
       setRestaurant={setRestaurant}/>

      <RestaurantsMain
        setIsAddRestaurantVisible={setIsAddRestaurantVisible}
        setRestaurant={setRestaurant}
        reload={reload}
      />

      <RestaurantAddForm
        restaurant={restaurant}
        onHide={() => {
          setIsAddRestaurantVisible(false);
          setRestaurant(null);
        }}
        isAddRestaurantVisible={isAddRestaurantVisible}
        setReload={setReaload}
      />
    </div>
  );
}
