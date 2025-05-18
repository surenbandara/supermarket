// Icons
import {
  faMotorcycle,
  faStore,
  faUsers,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

// Interfaces
import {
  ICategory,
  IConfiguration,
  IConfigurationResponse,
  IDropdownSelectItem,
  IFoodNew,
  IRestaurantResponse,
  IStatsCardProps,
  IUserResponse,
  IVendorStoreDetails,
  IZoneResponse,
} from '../interfaces';
import { IRiderResponse } from '../interfaces/rider.interface';
import { ICuisine } from '../interfaces/cuisine.interface';
import { IWithDrawRequest } from '../interfaces/withdraw-request.interface';
import { IActiveOrders } from '../interfaces/dispatch.interface';
import { IProductResponse } from '../interfaces/product.interface';

export const dummyStatsData: IStatsCardProps[] = [
  {
    label: 'Total User',
    total: 40987,
    description: '8.5% up from yesterday',
    icon: faUsers,
    route: '/general/users',
  },
  {
    label: 'Total Vendors',
    total: 7689,
    description: '2.4% up from yesterday',
    icon: faStore,
    route: '/general/vendors',
  },
  {
    label: 'Total Restaurants',
    total: 20689,
    description: '6.1% down from yesterday',
    icon: faUtensils,
    route: '/general/stores',
  },
  {
    label: 'Total Riders',
    total: 12689,
    description: '1.9% up from yesterday',
    icon: faMotorcycle,
    route: '/general/riders',
  },
];

export const dummyOrderStatsData: IStatsCardProps[] = [
  {
    label: 'Total Orders',
    total: 40987,
    description: '8.5% up from yesterday',

    route: '/general/users',
  },
  {
    label: 'Total Sales',
    total: 20689,
    description: '6.1% down from yesterday',

    route: '#',
  },
  {
    label: 'COD Orders',
    total: 7689,
    description: '2.4% up from yesterday',
    route: '#',
  },

  {
    label: 'Card Orders',
    total: 12689,
    description: '1.9% up from yesterday',

    route: '#',
  },
];

export const dummyCountriesData: any[] = [
  { label: 'Australia', code: 'AU' },
  { label: 'Brazil', code: 'BR' },
  { label: 'China', code: 'CN' },
  { label: 'Egypt', code: 'EG' },
  { label: 'France', code: 'FR' },
  { label: 'Germany', code: 'DE' },
  { label: 'India', code: 'IN' },
  { label: 'Japan', code: 'JP' },
  { label: 'Spain', code: 'ES' },
  { label: 'United States', code: 'US' },
];

export const generateRandomUserCounts = () => {
  const randomNumbers = new Set();

  while (randomNumbers.size < 12) {
    randomNumbers.add(Math.floor(Math.random() * 101)); // Generates random integer between 0 and 100
  }

  return Array.from(randomNumbers);
};

export const generateDummyUsers = (
  count: number = 10
): IUserResponse[] => {
  const restaurants: IUserResponse[] = [];
  for (let i = 0; i < count; i++) {
    restaurants.push({
      name: '',
      phoneNumber: '',
      role: '',
      email: ''
    });
  }

  return restaurants;
};

export const generateDummyCusines = (
  count: number = 10
): ICuisine[] => {
  const restaurants: ICuisine[] = [];
  for (let i = 0; i < count; i++) {
    restaurants.push({
      _id: `${i}`,
      name: '',
      __typename: ''
    });
  }

  return restaurants;
};

export const generateDummyRiders = (
  count: number = 10
): IRiderResponse[] => {
  const restaurants: IRiderResponse[] = [];
  for (let i = 0; i < count; i++) {
    restaurants.push({
      _id: `${i}`,
      name: '',
      email: '',
      phoneNumber: '',
      vehicle: '',
      available: false
    });
  }

  return restaurants;
};


export const generateDummyProducts = (
  count: number = 10
): IProductResponse[] => {
  const restaurants: any[] = [];
  for (let i = 0; i < count; i++) {
    restaurants.push({
      _id: `${i}`,
      id: 0,
      name: '',
      price: 0,
      quantity: 0,
      cuisine: [],
      brand: '',
      shop: '',
      timestamp: 0,
      image: '',
      discount: 0
    });
  }

  return restaurants;
};

export const generateDummyConfiguration = (
  count: number = 10
): IConfiguration[] => {
  const restaurants: IConfiguration[] = [];
  for (let i = 0; i < count; i++) {
    restaurants.push({
      _id: `${i}`,
      deliveryRate: 0,
      googleMapLibraries: '',
      twilioEnabled: false,
      name: ''
    });
  }

  return restaurants;
};


export const generateDummyRestaurants = (
  count: number = 10
): IRestaurantResponse[] => {
  const restaurants: IRestaurantResponse[] = [];
  for (let i = 0; i < count; i++) {
    restaurants.push({
      unique_restaurant_id: `restaurant_${i + 1}`,
      _id: `restaurant_${i + 1}`,
      name: `Restaurant ${i + 1}`,
      username: `restaurant${i + 1}example`,
      owner: {
        _id: '',
        email: `vendor${i + 1}-something`,
        isActive: false,
        __typename: '',
      },
      address: `${i + 1} Main Street, City`,
      isActive: Math.random() > 0.5,
      image: `/images/restaurant${i + 1}.jpg`,
      orderPrefix: '',
      slug: '',
      deliveryTime: 0,
      minimumOrder: 0,
      tax: 0,
      shopType: '',
      __typename: '',
      available: false
    });
  }

  return restaurants;
};

export const generateDummyOrderVendor = (
  count: number = 10
): IRestaurantResponse[] => {
  const dummyOrderVendor: IRestaurantResponse[] = [];

  for (let i = 0; i < count; i++) {
    dummyOrderVendor.push({
      _id: `restaurant_${i + 1}`,
      unique_restaurant_id: `restaurant_${i + 1}`,
      name: `Restaurant ${i + 1}`,
      isActive: Math.random() > 0.2, // 80% chance of being active
      __typename: 'Restaurant',
      image: '',
      orderPrefix: '',
      slug: '',
      address: '',
      deliveryTime: Math.floor(Math.random() * 60) + 15, // Random delivery time between 15 and 75 minutes
      minimumOrder: Math.floor(Math.random() * 20) + 5, // Random minimum order between $5 and $25
      tax: Math.floor(Math.random() * 10) + 5, // Random tax between 5% and 15%
      username: `restaurant${i + 1}`,
      owner: {
        _id: `owner_${i + 1}`,
        email: `owner${i + 1}@example.com`,
        isActive: true,
        __typename: 'Owner',
      },
      shopType: ['Fast Food', 'Casual Dining', 'Fine Dining'][Math.floor(Math.random() * 3)],
      available: false
    });
  }

  return dummyOrderVendor;
};

export const generateDummyCategories = (count: number = 10): ICategory[] => {
  const categories: ICategory[] = [];

  for (let i = 0; i < count; i++) {
    categories.push({
      _id: `category_${i + 1}`,
      title: `Category ${i + 1}`,
    });
  }

  return categories;
};


export const generateDummyZones = (count: number = 10): IZoneResponse[] => {
  const zones: IZoneResponse[] = [];

  for (let i = 0; i < count; i++) {
    zones.push({
      _id: `zone_${i + 1}`,
      title: `Zone ${i + 1}`,
      description: `Description for Zone ${i + 1}`,
      location: {
        coordinates: [[[0, 0]]], // Placeholder coordinates
      },
      isActive: Math.random() > 0.5,
      __typename: 'Zone',
    });
  }

  return zones;
};

export const generateDummyCuisines = (count: number = 10) => {
  const cuisines: ICuisine[] = [];
  for (let i = 0; i < count; i++) {
    cuisines.push({
      _id: `cuisine_${i + 1}`,
      __typename: `cuisine_${i + 1}`,
      description: `cuisine_${i + 1}`,
      name: `cuisine_${i + 1}`,
    });
  }
  return cuisines;
};

export const generateDummyWithdrawRequests = (count: number = 10) => {
  const withdrawRequests: IWithDrawRequest[] = [];
  for (let i = 0; i < count; i++) {
    withdrawRequests.push({
      _id: `withdraw_request_${i + 1}`,
      requestAmount: i + 1,
      requestId: `withdraw_request_${i + 1}`,
      status: 'TRANSFERRED',
      requestTime: new Date().toDateString(),
      rider: {
        _id: `rider_${i + 1}`,
        currentWalletAmount: i + 1,
        name: `rider_${i + 1}`,
      },
    });
  }
  return withdrawRequests;
};

export const generateDummyDispatchOrders = (count: number = 10) => {
  const dispatchActiveOrders: IActiveOrders[] = [];
  for (let i = 0; i < count; i++) {
    dispatchActiveOrders.push({
      _id: `active_order_${i + 1}`,
      status: 'TRANSFERRED',
      rider: {
        _id: `rider_${i + 1}`,
        name: `rider_${i + 1}`,
        username: `rider_${i + 1}`,
        available: true,
        assigned: [''],
      },
      createdAt: new Date().toDateString(),
      deliveryAddress: {
        deliveryAddress: `active_order_${i + 1}`,
        details: '',
        label: 'Delivery Address',
        location: {
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
      },
      isActive: true,
      orderId: `active_order_${i + 1}`,
      orderStatus: 'DELIVERED',
      paymentMethod: 'COD',
      zone: {
        _id: `active_order_${i + 1}`,
      },
    });
  }
  return dispatchActiveOrders;
};

export const generateDummyFoods = (count: number = 10): any[] => {
  const foods: any[] = [];

  for (let i = 0; i < count; i++) {
    foods.push({
      _id: `food_${i + 1}`,
      title: `Food ${i + 1}`,
      description: `Description for Food ${i + 1}`,
      image: '',
      category: { label: `food_category_${i + 1}`, code: `${i + 1}` },
      __typename: 'Food',
      isActive: true,
      isOutOfStock: false,
      subCategory: {
        code: `sub-category-${i + 1}`,
        label: `sub-category-${i + 2}`,
      },
      variations: [
        {
          _id: `food_${i + 1}`,
          discounted: 0,
          isOutOfStock: false,
          price: i + 23,
          title: `food_${i + 1}`,
          __typename: 'Food',
        },
      ],
    });
  }

  return foods;
};

export const generateVendorStoreDetails = (
  count: number = 10
): IVendorStoreDetails[] => {
  const details: IVendorStoreDetails[] = [];

  for (let i = 0; i < count; i++) {
    details.push({
      _id: `vendor_store_${i + 1}`,
      totalOrders: Math.floor(Math.random() * 100),
      restaurantName: `Restaurant ${i + 1}`,
      totalSales: Math.floor(Math.random() * 1000),
      pickUpCount: Math.floor(Math.random() * 50),
      deliveryCount: Math.floor(Math.random() * 50),
    });
  }

  return details;
};
