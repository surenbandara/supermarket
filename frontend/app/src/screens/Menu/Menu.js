/* eslint-disable react/display-name */
import React, {
  useRef,
  useContext,
  useLayoutEffect,
  useState,
  useEffect
} from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  RefreshControl,
  FlatList,
  Image,
  ScrollView,
  Dimensions
} from 'react-native'
import { SimpleLineIcons, AntDesign } from '@expo/vector-icons'
import { useMutation } from '@apollo/client'
import { useCollapsibleSubHeader } from 'react-navigation-collapsible'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import gql from 'graphql-tag'
import { useLocation } from '../../ui/hooks'
import UserContext from '../../context/User'
import { getCuisines } from '../../apollo/queries'
import { selectAddress } from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import styles from './styles'
import {
  useNavigation,
  useFocusEffect,
  useRoute
} from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import navigationOptions from './navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import { ActiveOrdersAndSections } from '../../components/Main/ActiveOrdersAndSections'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import { FILTER_TYPE } from '../../utils/enums'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import ErrorView from '../../components/ErrorView/ErrorView'
import Spinner from '../../components/Spinner/Spinner'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import { useMemo } from 'react'
import NewRestaurantCard from '../../components/Main/RestaurantCard/NewRestaurantCard'
import { Modalize } from 'react-native-modalize'
import Filters from '../../components/Filter/FilterSlider'
import NetInfo from "@react-native-community/netinfo";
import {
  isOpen,
  sortRestaurantsByOpenStatus
} from '../../utils/customFunctions'
import Ripple from 'react-native-material-ripple'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { useRestApi, API_ENDPOINTS } from '../../ui/hooks'
import { restaurantsManager } from '../../ui/hooks'


export const FILTER_VALUES = {
  Sort: {
    type: FILTER_TYPE.CHECKBOX,
    values: ['Relevance (Default)', 'Fast Delivery', 'Distance'],
    selected: []
  },
  Offers: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['Free Delivery', 'Accept Vouchers', 'Deal']
  },
  Rating: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['3+ Rating', '4+ Rating', '5 star Rating']
  }
}
const { height: HEIGHT } = Dimensions.get('window')
function Menu({ route, props }) {
  const Analytics = analytics()
  const selectedType = route.params?.selectedType
  const queryType = route.params?.queryType
  const collection = route.params?.collection
  const { t, i18n } = useTranslation()
  const { getAddress } = useGeocoding();
  const [busy, setBusy] = useState(false)
  const { loadingOrders, isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [filters, setFilters] = useState(FILTER_VALUES)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isConnected, setIsConnected] = useState(false);
  const modalRef = useRef(null)
  const filtersModalRef = useRef()
  const flatListRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0); 
  const navigation = useNavigation()
  const routeData = useRoute()
  const themeContext = useContext(ThemeContext);
  const { useQuery } = useRestApi();
  const [allCuisines, setAllCuisines] = useState([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
      }
    });

    return () => unsubscribe();
  }, []);

  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }
  const { getCurrentLocation } = useLocation()
  
  const locationData = location



  const {
    onScroll /* Event handler */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */
  } = useCollapsibleSubHeader()

  const emptyViewDesc =
    selectedType === 'restaurant' ? t('noRestaurant') : t('noGrocery')

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.newheaderColor)
    }
    StatusBar.setBarStyle('dark-content') 
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MAIN)
    }
    Track()
  }, [])
  // useLayoutEffect(() => {
  //   navigation.setOptions(
  //     navigationOptions({
  //       headerMenuBackground: currentTheme.themeBackground,
  //       horizontalLine: currentTheme.headerColor,
  //       fontMainColor: currentTheme.darkBgFont,
  //       iconColorPink: currentTheme.iconColor,
  //       open: onOpen,
  //       icon: 'back',
  //       haveBackBtn: routeData?.name === 'Menu',
  //       onPressFilter: () => filtersModalRef.current.open(),
  //       onPressMap: () =>
  //         navigation.navigate('MapSection', {
  //           location,
  //           restaurants: restaurantsManager.getShopData()
  //         }),
  //       onPressBack: () => navigation.goBack()
  //     })
  //   )
  // }, [navigation, currentTheme])

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      Cuisines: {
        selected: [],
        type: FILTER_TYPE.CHECKBOX,
        values: allCuisines?.cuisines?.map((item) => item.name)
      }
    }))
  }, [allCuisines])



  const onOpen = () => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }

  function onError(error) {
    console.log(error)
  }

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const setAddressLocation = async (address) => {
    setLocation({
      _id: address._id,
      label: address.label,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0]),
      deliveryAddress: address.deliveryAddress,
      details: address.details
    })
    mutate({ variables: { id: address._id } })
    modalRef.current.close()
  }
 
  const cus = new Set()


  const setCurrentLocation = async () => {
    setBusy(true);
    
    const { error, coords } = await getCurrentLocation();

    if (!coords || !coords.latitude || !coords.longitude) {
      setBusy(false);
      return;
    }

    
     // Get the address function from the hook

    try {
      // Fetch the address using the geocoding hook
      const { formattedAddress, city } = await getAddress(coords.latitude, coords.longitude);
      
      let address = formattedAddress || 'Unknown Address';

      if (address.length > 21) {
        address = address.substring(0, 21) + '...';
      }

      if (error) {
        navigation.navigate('SelectLocation');
      } else {
        modalRef.current?.close();
        setLocation({
          label: 'currentLocation',
          latitude: coords.latitude,
          longitude: coords.longitude,
          deliveryAddress: address
        });
        setBusy(false);
      }
    } catch (fetchError) {
      console.error('Error fetching address using Google Maps API:', fetchError.message);
    }
  };
 
  const modalHeader = () => (
    <></>
  )

  const emptyView = () => {
    if (restaurantsManager.getLoading()) return loadingScreen()
  }

  const modalFooter = () => (
    <View style={styles().addNewAddressbtn}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles(currentTheme).addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddress', { ...locationData })
            } else {
              const modal = modalRef.current
              modal?.close()
              navigation.navigate({ name: 'CreateAccount' })
            }
          }}
        >
          <View style={styles(currentTheme).addressSubContainer}>
            <AntDesign
              name='pluscircleo'
              size={scale(20)}
              color={currentTheme.black}
            />
            <View style={styles().mL5p} />
            <TextDefault bold textColor={currentTheme.black}>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles().addressTick}></View>
    </View>
  )


  function loadingScreen() {
    return (
      <View style={styles(currentTheme).screenBackground}>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
      </View>
    )
  }

  // if (!isConnected) return <ErrorView />
  // if (error ) return <ErrorView />
 

  if (restaurantsManager.getLoading()) return loadingScreen()

  const extractRating = (ratingString) => parseInt(ratingString)


 
  const applyFilters = () => {
    let filteredData =
      queryType === 'orderAgain'
        ? [...data?.recentOrderRestaurantsPreview]
        : queryType === 'topPicks'
          ? [...data?.mostOrderedRestaurantsPreview]
          : queryType === 'topBrands'
            ? [...data?.topRatedVendorsPreview]
            : [...data?.nearByRestaurantsPreview?.restaurants]

    const ratings = filters.Rating
    const sort = filters.Sort
    const offers = filters.Offers
    const cuisines = filters.Cuisines

    // Apply filters incrementally
    // Ratings filter
    if (ratings?.selected?.length > 0) {
      const numericRatings = ratings.selected?.map(extractRating)
      filteredData = filteredData.filter(
        (item) => item?.reviewAverage >= Math.min(...numericRatings)
      )
    }

    // Sort filter
    if (sort?.selected?.length > 0) {
      if (sort.selected[0] === 'Fast Delivery') {
        filteredData.sort((a, b) => a.deliveryTime - b.deliveryTime)
      } else if (sort.selected[0] === 'Distance') {
        filteredData.sort(
          (a, b) =>
            a.distanceWithCurrentLocation - b.distanceWithCurrentLocation
        )
      }
    }

    // Offers filter
    if (offers?.selected?.length > 0) {
      if (offers.selected.includes('Free Delivery')) {
        filteredData = filteredData.filter((item) => item?.freeDelivery)
      }
      if (offers.selected.includes('Accept Vouchers')) {
        filteredData = filteredData.filter((item) => item?.acceptVouchers)
      }
    }

    // Cuisine filter
    if (cuisines?.selected?.length > 0) {
      filteredData = filteredData.filter((item) =>
        item.cuisines.some((cuisine) => cuisines?.selected?.includes(cuisine))
      )
    }

    filtersModalRef.current.close()

    // **Check if any filters are applied**
  const anyFilterSelected =
  ratings?.selected?.length > 0 ||
  sort?.selected?.length > 0 ||
  offers?.selected?.length > 0 ||
  cuisines?.selected?.length > 0

    setfilterApplied(anyFilterSelected);
    
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles().flex, { backgroundColor: currentTheme.themeBackground }]}
    >
      <View style={[styles(currentTheme).container]}>
      {/* <View style={[styles(currentTheme).header,{padding: 10}]}>
                <View>
                  <TextDefault bolder H2 isRTL>
                    {t(
                      routeData?.name === 'Restaurants'
                        ? 'Restaurants'
                        : 'Stors'
                    )}
                  </TextDefault>
        
                </View>
              </View> */}
              
          <Animated.FlatList
            contentInset={{ top: containerPaddingTop }}
            contentContainerStyle={{
            paddingTop: Platform.OS === 'ios' ? 0 : containerPaddingTop,
            padding: 15,
            gap: 16
          }}
          contentOffset={{ y: -containerPaddingTop }}
          onScroll={onScroll}
          scrollIndicatorInsets={{ top: scrollIndicatorInsetTop }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {restaurantsManager.getShopData()?.length === 0 ? null : (
                <ActiveOrdersAndSections
                  menuPageHeading={
                    'All Stores'
                  }
                  subHeading={'Most ordered stores'}
                />
              )}
            </>
          )}
          ListEmptyComponent={emptyView()}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              progressViewOffset={containerPaddingTop}
              colors={[currentTheme.iconColorPink]}
              refreshing={restaurantsManager.getNetworkStatus() === 4}
              onRefresh={() => {
                if (restaurantsManager.getNetworkStatus() === 7) {
                  restaurantsManager.refetchShop()
                }
              }}
            />
          }
          data={restaurantsManager.getShopData()}
          renderItem={({ item }) => {
            if (item && item?.image && item?.name) {
              const restaurantOpen = true
              return (
                <NewRestaurantCard
                  {...item}
                  fullWidth
                  isOpen={restaurantOpen}
                />
              )
            }
          }}
        />
      </View>
      <MainModalize
        modalRef={modalRef}
        currentTheme={currentTheme}
        isLoggedIn={isLoggedIn}
        addressIcons={addressIcons}
        modalHeader={modalHeader}
        modalFooter={modalFooter}
        setAddressLocation={setAddressLocation}
        profile={profile}
        location={location}
      />
      <Modalize
        ref={filtersModalRef}
        modalStyle={styles(currentTheme).modal}
        modalHeight={HEIGHT * 0.72}
        overlayStyle={styles(currentTheme).overlay}
        handleStyle={styles(currentTheme).handle}
        handlePosition='inside'
        openAnimationConfig={{
          timing: { duration: 400 },
          spring: { speed: 20, bounciness: 10 }
        }}
        closeAnimationConfig={{
          timing: { duration: 400 },
          spring: { speed: 20, bounciness: 10 }
        }}
      >
        <Filters
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          onClose={() => filtersModalRef.current.close()}
        />
      </Modalize>
    </SafeAreaView>
  )
}

export default Menu
