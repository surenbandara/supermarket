// import { gql, useQuery } from '@apollo/client'
// import { useState } from 'react'
// import {
//   mostOrderedRestaurantsQuery,
//   recentOrderRestaurantsQuery,
//   restaurantListPreview,
//   topRatedVendorsInfo
// } from '../../apollo/queries'

// const RESTAURANTS = gql`
//   ${restaurantListPreview}
// `

// const TOP_BRANDS = gql`
//   ${topRatedVendorsInfo}
// `

// const getQuery = (queryType) => {
//   switch (queryType) {
//     case 'orderAgain':
//       return recentOrderRestaurantsQuery
//     case 'topPicks':
//       return mostOrderedRestaurantsQuery
//     case 'topBrands':
//       return TOP_BRANDS
//     default:
//       return RESTAURANTS
//   }
// }

// const getResult = (queryType, data, setRestaurantData, setAllData, selectedType) => {
//   switch (queryType) {
//     case 'orderAgain':
//       setRestaurantData(data?.recentOrderRestaurantsPreview)
//       setAllData(data?.recentOrderRestaurantsPreview)
//       break
//     case 'topPicks':
//       setRestaurantData(data?.mostOrderedRestaurantsPreview)
//       setAllData(data?.mostOrderedRestaurantsPreview)
//       break
//     case 'topBrands':
//       if (selectedType === 'restaurant') {
//         const restaurantBrands = data?.topRatedVendorsPreview?.filter(
//           (item) => item.shopType === 'restaurant'
//         )
//         setRestaurantData(restaurantBrands)
//         setAllData(restaurantBrands)
//       } else if (selectedType === 'grocery') {
//         const groceryBrands = data?.topRatedVendorsPreview?.filter(
//           (item) => item.shopType === 'grocery'
//         )
//         setRestaurantData(groceryBrands)
//         setAllData(groceryBrands)
//       } else {
//         setRestaurantData(data?.topRatedVendorsPreview)
//         setAllData(data?.topRatedVendorsPreview)
//       }
//       break
//     default:
//       setRestaurantData(data?.nearByRestaurantsPreview?.restaurants)
//       setAllData(data?.nearByRestaurantsPreview?.restaurants)
//   }
// }

// const HEADING = {
//   orderAgain: 'Order Again',
//   topPicks: 'Top Picks',
//   topBrands: 'Top Brands',
//   grocery: 'All Grocery',
//   restaurant: 'All Restaurant'
// }

// const SUB_HEADING = {
//   orderAgain: 'From your previous orders',
//   topPicks: 'Top picked restaurants for you',
//   topBrands: 'Top brands in your area',
//   grocery: 'Most ordered grocery stores',
//   restaurant: 'Most ordered restaurants'
// }

// export const useRestaurantQueries = (queryType, location, selectedType) => {
//   const [restaurantData, setRestaurantData] = useState(null)
//   const [allData, setAllData] = useState(null)
//   const query = getQuery(queryType)

//   const queryVariables = {
//     longitude: location.longitude || null,
//     latitude: location.latitude || null
//   }

//   if (['grocery', 'restaurant'].includes(queryType)) {
//     queryVariables.shopType = selectedType || null
//     queryVariables.ip = null
//   }

//   const { data, refetch, networkStatus, loading, error } = useQuery(query, {
//     variables: queryVariables,
//     onCompleted: (data) => {
//       getResult(queryType, data, setRestaurantData, setAllData, selectedType)
//     },
//     fetchPolicy: 'network-only'
//   })

//   const handleRefresh = () => {
//     if (networkStatus === 7) {
//       refetch().then((result) => {
//         if (result.data) {
//           const data = result.data
//           getResult(queryType, data, setRestaurantData, setAllData, selectedType)
//         } else {
//           console.log('Refetch returned no data')
//         }
//       }).catch((error) => {
//         console.error('Refetch error:', error)
//       })
//     } else {
//       console.log('Network status is not 7, current status:', networkStatus)
//     }
//   }

//   return {
//     restaurantData,
//     loading,
//     error,
//     refetch: handleRefresh,
//     data,
//     networkStatus,
//     setRestaurantData,
//     allData,
//     heading: HEADING[queryType],
//     subHeading: SUB_HEADING[queryType]
//   }
// }

import { useState, useEffect } from 'react'

const SAMPLE_DATA = {
  orderAgain: [
    { id: 1, name: 'Pizza Hut', rating: 4.5 },
    { id: 2, name: 'McDonalds', rating: 4.3 }
  ],
  topPicks: [
    { id: 3, name: 'Subway', rating: 4.6 },
    { id: 4, name: 'KFC', rating: 4.4 }
  ],
  topBrands: [
    { id: 5, name: 'Burger King', shopType: 'restaurant', rating: 4.7 },
    { id: 6, name: 'Walmart', shopType: 'grocery', rating: 4.2 }
  ],
  nearByRestaurants: {
    restaurants: [
      { id: 7, name: 'Local Diner', rating: 4.1, image: undefined },
      { id: 8, name: 'Food Express', rating: 4.0, image: undefined }
    ]
  }
}

const getResult = (queryType, setRestaurantData, setAllData, selectedType) => {
  let data = SAMPLE_DATA[queryType] || SAMPLE_DATA.nearByRestaurants.restaurants

  if (queryType === 'topBrands') {
    if (selectedType) {
      data = data.filter((item) => item.shopType === selectedType)
    }
  }
  console.log(data);
  setRestaurantData(data)
  setAllData(data)
}

const HEADING = {
  orderAgain: 'Order Again',
  topPicks: 'Top Picks',
  topBrands: 'Top Brands',
  grocery: 'All Shops',
  restaurant: 'All Restaurant'
}

const SUB_HEADING = {
  orderAgain: 'From your previous orders',
  topPicks: 'Top picked restaurants for you',
  topBrands: 'Top brands in your area',
  grocery: 'Most ordered stores',
  restaurant: 'Most ordered restaurants'
}

export const useRestaurantQueries = (queryType, location, selectedType) => {
  const [restaurantData, setRestaurantData] = useState(null)
  const [allData, setAllData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      try {
        getResult(queryType, setRestaurantData, setAllData, selectedType)
        setLoading(false)
      } catch (err) {
        setError(err)
        setLoading(false)
      }
    }, 1000)
  }, [queryType, selectedType])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      getResult(queryType, setRestaurantData, setAllData, selectedType)
      setLoading(false)
    }, 1000)
  }

  return {
    restaurantData,
    loading,
    error,
    refetch: handleRefresh,
    allData,
    heading: HEADING[queryType],
    subHeading: SUB_HEADING[queryType]
  }
}
