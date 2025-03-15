'use client';

// Core imports
import { useContext, useRef } from 'react';

// PrimeReact components
import { Sidebar } from 'primereact/sidebar';

// Context
import { FoodsContext } from '@/lib/context/restaurant/foods.context';

// Interfaces
import { IFoodAddFormComponentProps } from '@/lib/utils/interfaces';

// Components
import FoodDetails from './food.index';

const FoodForm = ({ position = 'right' }: IFoodAddFormComponentProps) => {

  // Ref
  const stepperRef = useRef(null);

  // Context
  const {
    activeIndex,
    isFoodFormVisible,
    onClearFoodData,
    onActiveStepChange,
  } = useContext(FoodsContext);

  // Handlers
  const onHandleStepChange = (order: number) => {
    onActiveStepChange(order);
  };

  const onSidebarHideHandler = () => {
    onClearFoodData();
  };

  return (
    <Sidebar
      visible={isFoodFormVisible}
      position={position}
      onHide={onSidebarHideHandler}
      className="w-full sm:w-[600px]"
    >
      <div ref={stepperRef}>
          <FoodDetails
                stepperProps={{
                  onStepChange: onHandleStepChange,
                  order: activeIndex,
                }}
                isFoodFormVisible={isFoodFormVisible}
              />
      </div>
    </Sidebar>
  );
};

export default FoodForm;
