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
  StatusBar,
  Platform,
  ScrollView,
  FlatList,
  Image,
  RefreshControl
} from 'react-native'
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import { useMutation, useQuery, gql } from '@apollo/client'
import { useLocation } from '../../ui/hooks'
import UserContext from '../../context/User'
import {
  getBanners,
  getCuisines,
  restaurantListPreview
} from '../../apollo/queries'
import { selectAddress } from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import styles from './styles'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import navigationOptions from './navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import MainRestaurantCard from '../../components/Main/MainRestaurantCard/MainRestaurantCard'
import { TopBrands } from '../../components/Main/TopBrands'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import useHomeRestaurants from '../../ui/hooks/useRestaurantOrderInfo'
import ErrorView from '../../components/ErrorView/ErrorView'
import ActiveOrders from '../../components/Main/ActiveOrders/ActiveOrders'
import MainLoadingUI from '../../components/Main/LoadingUI/MainLoadingUI'
import TopBrandsLoadingUI from '../../components/Main/LoadingUI/TopBrandsLoadingUI'
import Banner from '../../components/Main/Banner/Banner'
import Spinner from '../../components/Spinner/Spinner'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import CollectionCard from '../../components/CollectionCard/CollectionCard'
import { sortRestaurantsByOpenStatus } from '../../utils/customFunctions'
import { IMAGE_LINK } from '../../utils/constants'
import useGeocoding from '../../ui/hooks/useGeocoding'
import ForceUpdate from '../../components/Update/ForceUpdate'
import { restaurantsManager } from '../../ui/hooks'



const GET_CUISINES = gql`
  ${getCuisines}
`

function Main(props) {

  const Analytics = analytics()

  const { t, i18n } = useTranslation()
  const [busy, setBusy] = useState(false)
  const { isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const modalRef = useRef(null)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }
  const { getCurrentLocation } = useLocation()
  const { getAddress } = useGeocoding();
  const locationData = location
  const [hasActiveOrders, setHasActiveOrders] = useState(false);

  const { orderLoading, orderError, orderData } = useHomeRestaurants()


  const recentOrderRestaurantsVar = orderData?.recentOrderRestaurants
  const mostOrderedRestaurantsVar = orderData?.mostOrderedRestaurants
  const initDataStructure = new Map();
  initDataStructure.set("super-market", []);
  initDataStructure.set("restaurants", []);
  initDataStructure.set("super-market-data", []);
  initDataStructure.set("restaurants-data", []);
  const [dataStructure, setDataStructure] = useState(initDataStructure);

  const handleActiveOrdersChange = (activeOrdersExist) => {
    setHasActiveOrders(activeOrdersExist)
  }
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsRefreshing(false)
  }

  const [loading, setLoading] = useState(true);
  
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
  useLayoutEffect(() => {
    navigation.setOptions(
      navigationOptions({
        headerMenuBackground: currentTheme.themeBackground,
        fontMainColor: currentTheme.darkBgFont,
        iconColorPink: currentTheme.iconColor,
        open: onOpen,
        navigation
      })
    )
  }, [navigation, currentTheme])


  useEffect(() => {
    if (restaurantsManager.getProductData().length != 0 && restaurantsManager.getShopData().length != 0) {
      setData();
    }
  }, [restaurantsManager.shopData, restaurantsManager.productData]);


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

  const setData = () => {
    const map = new Map();
    map.set('super-market', []);
    map.set('restaurants', []);
    map.set('super-market-data', []);
    map.set('restaurants-data', []);
    setLoading(true);


    const restaurant = []
    const shop = []
    for(chunk of restaurantsManager.getShopData() ) {
      console.log('44444 ', chunk);
      map.set(chunk.category, [...map.get(chunk.category), chunk])
      if (chunk.category == 'restaurants') {
        restaurant.push(chunk.name);
      } else {
        shop.push(chunk.name);
      }
    }

    for(product of restaurantsManager.getProductData() ) {
      let key 
      if (restaurant.includes(product.shop)) {
        key = 'restaurants-data'
      } else if(shop.includes(product.shop)) {
        key = 'super-market-data'
      }
      if (key != null) {
      map.set(key, [...map.get(key), product])
      }
    }
    console.log('00000000',map)
    console.log(dataStructure);
    console.log('999999999999',map.get('super-market-data') )
    setDataStructure(map);
    setLoading(false);
  }

  // const setCurrentLocation = async () => {
  //   onsole.log("Fetching current location...");
  //   setBusy(true)
  //   const { error, coords } = await getCurrentLocation()
  //   console.log("getCurrentLocation result:", { error, coords });
  //   console.log("coords",coords)
  //   console.log("coords",coords.latitude)
  //   console.log("coords",coords.longitude)
  //   if (!coords || !coords.latitude || !coords.longitude) {
  //     console.error("Invalid coordinates:", coords);
  //     setBusy(false);
  //     return;
  //   }
  //   console.log(`Coordinates received: Lat: ${coords.latitude}, Lon: ${coords.longitude}`);
  //   // const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}&language=en`

  //   const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
  //   fetch(apiUrl)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.error) {
  //         console.log('Reverse geocoding request failed:', data.error)
  //       } else {
  //         console.log('data->>>>',data)
  //         setBusy(false)
  //         let address = data.display_name
  //         console.log('address=>>', address)
  //         if (address.length > 21) {
  //           address = address.substring(0, 21) + '...'
  //         }

  //         if (error) navigation.navigate('SelectLocation')
  //         else {
  //           modalRef.current.close()
  //           setLocation({
  //             label: 'currentLocation',
  //             latitude: coords.latitude,
  //             longitude: coords.longitude,
  //             deliveryAddress: address
  //           })
  //           setBusy(false)
  //         }
  //         console.log(address)
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching reverse geocoding data:', error)
  //     })
  // }
  const setCurrentLocation = async () => {
      console.log("Fetching current location...");
      setBusy(true);
      
      const { error, coords } = await getCurrentLocation();
      console.log("getCurrentLocation result:", { error, coords });
      console.log("coords", coords);
      console.log("coords", coords.latitude);
      console.log("coords", coords.longitude);
  
      if (!coords || !coords.latitude || !coords.longitude) {
        console.error("Invalid coordinates:", coords);
        setBusy(false);
        return;
      }
  
      console.log(`Coordinates received: Lat: ${coords.latitude}, Lon: ${coords.longitude}`);
      
       // Get the address function from the hook
  
      try {
        // Fetch the address using the geocoding hook
        const { formattedAddress, city } = await getAddress(coords.latitude, coords.longitude);
  
        console.log('Formatted address:', formattedAddress);
        console.log('City:', city);
  
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
    <View style={[styles().addNewAddressbtn]}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          style={[styles(currentTheme).addButton]}
          activeOpacity={0.7}
          onPress={setCurrentLocation}
          disabled={busy}
        >
          <View style={styles(currentTheme).addressSubContainer}>
            {busy ? (
              <Spinner size='small' />
            ) : (
              <>
                <SimpleLineIcons
                  name='target'
                  size={scale(18)}
                  color={currentTheme.black}
                />
                <View style={styles().mL5p} />
                <TextDefault bold textColor={currentTheme.black}>
                  {t('currentLocation')}
                </TextDefault>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  const modalFooter = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={[styles(currentTheme).addressContainer]}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles(currentTheme).addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddress', {
                prevScreen: 'Main',
                ...locationData
              })
            } else {
              const modal = modalRef.current
              modal?.close()
              props?.navigation.navigate({
                name: 'CreateAccount'
              })
            }
          }}
        >
          <View style={styles(currentTheme).addressSubContainer}>
            <AntDesign
              name='pluscircleo'
              size={scale(20)}
              color={currentTheme.black}
            />
            <View style={styles().mL5p} textColor={currentTheme.black} />
            <TextDefault bold textColor={currentTheme.black}>
              {t('addAddress')}
            </TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles().addressTick}></View>
    </View>
  )

  // if (error) return <ErrorView />
  return (
    <>
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles().flex}>
        <View style={[styles().flex, styles(currentTheme).screenBackground]}>
          <View style={styles().flex}>
            <View style={styles().mainContentContainer}>
              <View style={[styles().flex, styles().subContainer]}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                    />
                  }
                >
                  <View style={{ gap: 16 }}>
                    <View style={{ padding: 15, gap: scale(8) }}>
                      <TextDefault bolder H4 isRTL>
                        {t('I feel like eating...')}
                      </TextDefault>
                      {loading ? (
                        <MainLoadingUI />
                      ) : (
                      <FlatList
                        data={dataStructure.get('restaurants-data')}
                        renderItem={({ item }) => {
                          return (
                            <CollectionCard
                              onPress={() => {
                                navigation.navigate('Restaurant', {...dataStructure.get('restaurants').
                                  find((e) =>  e.name == item.shop)})
                              }}
                              image={item?.image ? item?.image : IMAGE_LINK}
                              name={item.name}
                            />
                          )
                        }}
                        keyExtractor={(item) => item?.id}
                        contentContainerStyle={{
                          flexGrow: 1,
                          gap: 8,
                          paddingBottom: 5
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        inverted={currentTheme?.isRTL ? true : false}
                        maintainVisibleContentPosition={{
                          minIndexForVisible: 0,
                        }}
                      />)
                      }
                    </View>
                    <View>
                      {loading ? (
                        <MainLoadingUI />
                      ) : (
                        <MainRestaurantCard
                          orders={
                            dataStructure.get('restaurants')
                        }
                          loading={false}
                          error={false}
                          title={t('Restaurants near you')}
                          queryType='restaurant'
                          icon='restaurant'
                        />
                      )}
                    </View>
                    <View style={{ padding: 15, gap: scale(8) }}>
                      <TextDefault bolder H4 isRTL>
                        {t('Fresh finds await...')}
                      </TextDefault>
                      <FlatList
                        data={dataStructure.get('super-market-data')}
                        renderItem={({ item }) => {
                          return (
                            <CollectionCard
                              onPress={() => {
                                navigation.navigate('Restaurant', {...dataStructure.get('super-market').
                                find((e) =>  e.name == item.shop)})
                              }}
                              image={item?.image}
                              name={item.name}
                            />
                          )
                        }}
                        keyExtractor={(item) => item?.id}
                        contentContainerStyle={{
                          flexGrow: 1,
                          gap: 8,
                          paddingBottom: 5
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        inverted={currentTheme?.isRTL ? true : false}
                        
                      />
                    </View>
                    <View>
                      {loading ? (
                        <MainLoadingUI />
                      ) : (
                        <MainRestaurantCard
                          orders={dataStructure.get('super-market')}
                          loading={loading}
                          error={false}
                          title={t('Top grocery picks')}
                          queryType='grocery'
                          icon='store'
                          selectedType='grocery'
                        />
                      )}
                    </View>
                  </View>
                  {/* <View
                    style={
                      styles(currentTheme, hasActiveOrders).topBrandsMargin
                    }
                  >
                    {loading ? <TopBrandsLoadingUI /> : <TopBrands />}
                  </View> */}
                </ScrollView>
              </View>
        <ForceUpdate />

            </View>
          </View>
          <ActiveOrders onActiveOrdersChange={handleActiveOrdersChange} />

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
        </View>
      </SafeAreaView>
    </>
  )
}

export default Main
