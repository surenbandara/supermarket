/* eslint-disable indent */
import React, { useState, useEffect, useContext, useRef } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Dimensions
} from 'react-native'
import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  AntDesign,
  EvilIcons,
  Feather,
  FontAwesome,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import { Modalize } from 'react-native-modalize'
import { getTipping, orderFragment } from '../../apollo/queries'
import { getCoupon, placeOrder } from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import { stripeCurrencies, paypalCurrencies } from '../../utils/currencies'
import { theme } from '../../utils/themeColors'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../../context/Configuration'
import UserContext from '../../context/User'

import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { useRestaurant } from '../../ui/hooks'
import { LocationContext } from '../../context/Location'
import { useFocusEffect } from '@react-navigation/native'
import { textStyles } from '../../utils/textStyles'
import { calculateAmount, calculateDistance } from '../../utils/customFunctions'
import analytics from '../../utils/analytics'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { useTranslation } from 'react-i18next'
import styles from './styles'
import OrderTracking from './OrderTracking';
import Location from '../../components/Main/Location/Location'
import { customMapStyle } from '../../utils/customMapStyles'
import Spinner from '../../components/Spinner/Spinner'
import RestaurantMarker from '../../assets/SVG/restaurant-marker'
import { FulfillmentMode } from '../../components/Checkout/FulfillmentMode'
import { Instructions } from '../../components/Checkout/Instructions'
import PickUp from '../../components/Pickup'
import { PaymentModeOption } from '../../components/Checkout/PaymentOption'
import { isOpen } from '../../utils/customFunctions'
import { WrongAddressModal } from '../../components/Checkout/WrongAddressModal'
import { useCallback } from "react";
import { restaurantsManager } from '../../ui/hooks'

const { height: HEIGHT } = Dimensions.get('window')

function Checkout(props) {
  const Analytics = analytics()

  const configuration = useContext(ConfigurationContext)
  const {
    isLoggedIn,
    profile,
    clearCart,
    restaurant: cartRestaurant,
    cart,
    cartCount,
    updateCart,
    isPickup,
    setIsPickup,
    instructions
  } = useContext(UserContext)

  const themeContext = useContext(ThemeContext)
  const { location } = useContext(LocationContext)
  const { t, i18n } = useTranslation()
  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }
  const voucherModalRef = useRef(null)
  const tipModalRef = useRef(null)
  const [loadingData, setLoadingData] = useState(false)
  const [minimumOrder, setMinimumOrder] = useState('')
  const [orderDate, setOrderDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState({})
  const [tax, setTax] = useState(0)
  const [deliveryCharges, setDeliveryCharges] = useState(0)
  const [restaurantName, setrestaurantName] = useState('...')
  const [voucherCode, setVoucherCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [tip, setTip] = useState(null)
  const [tipAmount, setTipAmount] = useState('')
  const modalRef = useRef(null)
  const [paymentMode, setPaymentMode] = useState('CASH')

  const [loadingOrder, setLoadingOrder] = useState(false)
  const [initialRegion, setInitialRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.4,
    longitudeDelta: 0.5
  });
 
  const [isModalVisible, setisModalVisible] = useState(false)
  const [loading, setLoading] = useState(restaurantsManager.loading);
  const [data, setData] = useState(restaurantsManager.getShopDataFromName(cartRestaurant));
  const [inRange, setInRange] = useState(false);
  const [orderStep, setOrderStep] = useState(-1);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  const onModalOpen = (modalRef) => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }



  const onModalClose = (modalRef) => {
    const modal = modalRef.current
    if (modal) {
      modal.close()
    }
  }


  const handleCartNavigation = async() => {
    setisModalVisible(false)
    props?.navigation.navigate('CartAddress')
  }



  const COD_PAYMENT = {
    payment: 'COD',
    label: t('cod'),
    index: 2,
    icon: 'dollar'
  }


  console.log('323323223232', props?.route.params);
  const order = props?.route.params?.order;
  const paymentMethod =
    props?.route.params && props?.route.params.paymentMethod
      ? props?.route.params.paymentMethod
      : COD_PAYMENT

  const [selectedTip, setSelectedTip] = useState()
  const inset = useSafeAreaInsets()

  function onTipping() {
    if (isNaN(tipAmount)) FlashMessage({ message: t('invalidAmount') })
    else if (Number(tipAmount) <= 0) {
      FlashMessage({ message: t('amountMustBe') })
    } else {
      setTip(tipAmount)
      setTipAmount(null)
      onModalClose(tipModalRef)
    }
  }

  useEffect(() => {
    if (tip) {
      setSelectedTip(null)
    }
  }, [tip, data])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: Number(location?.latitude ?? 0),
          longitude: Number(location?.longitude  ?? 0),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      )
    }
    let isSubscribed = true
    ;(async () => {
      if (data) {
        const locationParameter = restaurantsManager.getSystemParameterFromKey('Location').value;
        const [latOrigin, lonOrigin] = locationParameter.split(',').map(coord => parseFloat(coord));
        const latDest = Number(location.latitude)
        const longDest = Number(location.longitude)
        const distance = calculateDistance(
          latOrigin,
          lonOrigin,
          latDest,
          longDest
        )

        console.log("ffdffdfdfdfdfd ", distance , "  ", parseFloat(restaurantsManager.getSystemParameterFromKey('Range').value))
        if (distance > parseFloat(restaurantsManager.getSystemParameterFromKey('Range').value)) {
          showOutOfRangeMessage();
          setInRange(false);
        } else {
          setInRange(true);
        }

        let costType = configuration.costType
        let amount = calculateAmount(
          costType,
          configuration.deliveryRate,
          distance
        )

        if (isSubscribed) {
          setDeliveryCharges(parseFloat(restaurantsManager.getSystemParameterFromKey('DeliveryCost').value))
        }
      }
    })()
    return () => {
      isSubscribed = false
    }
  }, [data, location])


  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.menuBar)
    }
    StatusBar.setBarStyle(
      themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'
    )
  })

  useEffect(() => {
    props?.navigation.setOptions({
      headerTitle: () => (
        <View style={{ alignItems: 'center', gap: scale(2) }}>
          <TextDefault
            style={{
              color: currentTheme.newFontcolor,
              ...textStyles.H4,
              ...textStyles.Bolder
            }}
          >
            {t('titleCheckout')}
          </TextDefault>
          <TextDefault
            style={{ color: currentTheme.newFontcolor, ...textStyles.H5 }}
          >
            {data && data?.name && data?.address && (
              <>
                {data?.name} {' - '} {data?.address}
              </>
            )}
          </TextDefault>
        </View>
      ),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        ...textStyles.H4,
        ...textStyles.Bolder
      },

      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={{ ...alignment.PLxSmall, width: scale(30) }}>
              <AntDesign
                name='arrowleft'
                size={22}
                color={currentTheme.fontFourthColor}
              />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props?.navigation, data])

  useEffect(() => {
    if (!data) return
    didFocus()
    setrestaurantName(`${data?.name} - ${data?.address}`)
  }, [data])
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_CART)
    }
    Track()
  }, [])

  useEffect(() => {}, [orderStep]);

  useEffect(() => {
    if (cart && cartCount > 0) {
      if (
        data &&
        (!data?.isAvailable)
      ) {
        showAvailablityMessage()
      }
    }
  }, [data])

  const showOutOfRangeMessage = () => {
    Alert.alert(
      '',
      `Your address is out of range`,
      [
        {
          text: 'close',
          onPress: () => {},
          style: 'cancel'
        }
      ],
      { cancelable: true }
    )
  }


  const showAvailablityMessage = () => {
    Alert.alert(
      '',
      `${data?.name} closed at the moment`,
      [
        {
          text: 'Go back to restaurants',
          onPress: () => {
            props?.navigation.navigate({
              name: 'Main',
              merge: true
            })
          },
          style: 'cancel'
        },
        {
          text: 'close',
          onPress: () => {},
          style: 'cancel'
        }
      ],
      { cancelable: true }
    )
  }

  function update(cache, { data: { placeOrder } }) {
    try {
      if (placeOrder && placeOrder.paymentMethod === 'COD') {
        cache.modify({
          fields: {
            orders(existingOrders = []) {
              const newOrder = cache.writeFragment({
                data: placeOrder,
                fragment: gql`
                  ${orderFragment}
                `
              })
              return [newOrder, ...existingOrders]
            }
          }
        })
      }
    } catch (error) {
      console.log('update error', error)
    }
  }

  async function onCompleted(data) {
    await Analytics.track(Analytics.events.ORDER_PLACED, {
      userId: data?.placeOrder.user._id,
      orderId: data?.placeOrder.orderId,
      name: data?.placeOrder.user.name,
      email: data?.placeOrder.user.email,
      restaurantName: data?.placeOrder.restaurant.name,
      restaurantAddress: data?.placeOrder.restaurant.address,
      orderPaymentMethod: data?.placeOrder.paymentMethod,
      orderItems: data?.placeOrder.items,
      orderAmount: data?.placeOrder.orderAmount,
      orderPaidAmount: data?.placeOrder.paidAmount,
      tipping: data?.placeOrder.tipping,
      orderStatus: data?.placeOrder.orderStatus,
      orderDate: data?.placeOrder.orderDate
    })
    if (paymentMode === 'COD') {
      props.navigation.reset({
        routes: [
          { name: 'Main' },
          {
            name: 'OrderDetail',
            params: {
              _id: data?.placeOrder?._id,
              order: data?.placeOrder
            }
          }
        ]
      })
      clearCart()
    } else if (paymentMode === 'PAYPAL') {
      props?.navigation.replace('Paypal', {
        _id: data?.placeOrder.orderId,
        currency: configuration.currency
      })
    } else if (paymentMode === 'STRIPE') {
      props?.navigation.replace('StripeCheckout', {
        _id: data?.placeOrder.orderId,
        amount: data?.placeOrder.orderAmount,
        email: data?.placeOrder.user.email,
        currency: configuration.currency
      })
    }
    // else if (paymentMode === 'HYP') {
    //   // const items = transformOrder(cart)

    //   // await AsyncStorage.setItem(
    //   //   'hyp-session-id',
    //   //   Math.random().toString(36).substring(2, 15) +
    //   //     Math.random().toString(36).substring(2, 15)
    //   // )

    //   // props?.navigation.replace('HypCheckout', {
    //   //   _id: data.placeOrder.orderId,
    //   //   restaurantId: cartRestaurant,
    //   //   orderInput: items,
    //   //   amount: data.placeOrder.orderAmount,
    //   //   email: data.placeOrder.user.email,
    //   //   currency: configuration.currency
    //   // })
    // }
  }
  function onError(error) {
    setLoadingOrder(false)
    if (error.graphQLErrors.length) {
      if (error.graphQLErrors[0].message === "Sorry! we can't deliver to your address.") {
        setisModalVisible(true);
      }
    } else {
      FlashMessage({
        message: error.message
      })
    }
    if (error?.networkError) {
      console.log(`Network Error: ${networkError.message}`);
      if (error?.networkError.statusCode === 502) {
        FlashMessage({
          message: "Server is currently unavailable. Please try again later."
        })
        
      }
    }
  }

  function calculateTip() {
    // if (paymentMode !== 'HYP') {
    //   return 0 // Return 0 if payment mode is not 'COD'
    // }
    if (tip) {
      return tip
    } else if (selectedTip) {
      return selectedTip
    } else {
      return 0
    }
  }

  function taxCalculation() {
    return 0;
  }

  function calculatePrice(delivery = 0, withDiscount) {
    // let itemTotal = 0
    // cart.forEach((cartItem) => {
    //   itemTotal += cartItem.price * cartItem.quantity
    // })
    // if (withDiscount && coupon && coupon.discount) {
    //   itemTotal = itemTotal - (coupon.discount / 100) * itemTotal
    // }
    // const deliveryAmount = delivery > 0 ? deliveryCharges : 0
    // return (itemTotal + deliveryAmount).toFixed(2)
    return order.totalPrice.totalCost
  }

  function calculateTotal() {
    let total = 0
    const delivery = isPickup ? 0 : deliveryCharges
    total += +calculatePrice(delivery, true)
    total += +taxCalculation()
    total += +calculateTip()
    return parseFloat(total).toFixed(2)
  }

  function validateOrder() {
    // if (!data?.isAvailable ) {
    //   showAvailablityMessage()
    //   return
    // }
    // if (!cart.length) {
    //   FlashMessage({
    //     message: t('validateItems')
    //   })
    //   return false
    // }
    // if (calculatePrice(deliveryCharges, true) < minimumOrder) {
    //   FlashMessage({
    //     message: `The minimum amount of (${configuration.currencySymbol} ${minimumOrder}) for your order has not been reached.`
    //     // message: `(${t(minAmount)}) (${configuration.currencySymbol
    //     //   } ${minimumOrder}) (${t(forYourOrder)})`
    //   })
    //   return false
    // }
    // if (!isPickup && !location._id) {
    //   props?.navigation.navigate('CartAddress')
    //   return false
    // }
    // if (!paymentMode) {
    //   FlashMessage({
    //     message: t('setPaymentMethod')
    //   })
    //   return false
    // }
    // if (profile.phone.length < 1) {
    //   props?.navigation.navigate('PhoneNumber', { name: profile?.name })
    //   return false
    // }
    // if (profile.phone.length > 0 && !profile.phoneIsVerified) {
    //   FlashMessage({
    //     message: t('numberVerificationAlert')
    //   })
    //   props?.navigation.navigate('PhoneNumber', { name: profile?.name })
    //   return false
    // }
    return true
  }

  function checkPaymentMethod(currency) {
    if (paymentMode === 'STRIPE') {
      return stripeCurrencies.find((val) => val.currency === currency)
    }
    if (paymentMode === 'PAYPAL') {
      return paypalCurrencies.find((val) => val.currency === currency)
    }
    return true
  }

  function transformOrder(cartData) {
    return cartData?.map((food) => {
      return {
        food: food?._id,
        quantity: food?.quantity,
        variation: food?.variation._id,
        addons: food?.addons
          ? food?.addons.map(({ _id, options }) => ({
              _id,
              options: options.map(({ _id }) => _id)
            }))
          : [],
        specialInstructions: food?.specialInstructions
      }
    })
  }
  async function buttonOnPress() {
    if (orderStep === 0) {
      setOrderSubmitting(true);
      const date = Date.now();
      order.paymentMethod = paymentMode;
      order.timestamp = date;
      order.userLocation = `${location.latitude},${location.longitude}`;
      order.status = "CONFIRMED";

      const resposne = await restaurantsManager.editOrder(order);
      setOrderSubmitting(false);
      await clearCart();

      if (resposne.status) {
        props?.navigation.replace('MyOrders')
      }
      console.log('Order submitted')
    }
    setOrderStep(orderStep + 1);
  }

  async function didFocus() {
    const { restaurant } = data
    setSelectedRestaurant(restaurant)
    setMinimumOrder(restaurant.minimumOrder)
    const foods = restaurant.categories.map((c) => c.foods.flat()).flat()
    const { addons, options } = restaurant
    try {
      if (cartCount && cart) {
        const transformCart = cart.map((cartItem) => {
          const food = foods.find((food) => food?._id === cartItem._id)
          if (!food) return null
          const variation = food?.variations.find(
            (variation) => variation._id === cartItem.variation._id
          )
          if (!variation) return null

          const title = `${food?.title}${
            variation.title ? `(${variation.title})` : ''
          }`
          let price = variation.price
          const optionsTitle = []
          if (cartItem.addons) {
            cartItem.addons.forEach((addon) => {
              const cartAddon = addons.find((add) => add._id === addon._id)
              if (!cartAddon) return null
              addon.options.forEach((option) => {
                const cartOption = options.find((opt) => opt._id === option._id)
                if (!cartOption) return null
                price += cartOption.price
                optionsTitle.push(cartOption.title)
              })
            })
          }
          return {
            ...cartItem,
            optionsTitle,
            title: title,
            price: price.toFixed(2)
          }
        })

        if (props?.navigation.isFocused()) {
          const updatedItems = transformCart.filter((item) => item)
          if (updatedItems.length === 0) await clearCart()
          await updateCart(updatedItems)
          setLoadingData(false)
          if (transformCart.length !== updatedItems.length) {
            FlashMessage({
              message: t('itemNotAvailable')
            })
          }
        }
      } else {
        if (props?.navigation.isFocused()) {
          setLoadingData(false)
        }
      }
    } catch (e) {
      FlashMessage({
        message: e.message
      })
    }
  }

  function loadginScreen() {
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
          <PlaceholderLine />
          <PlaceholderLine />
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
          <PlaceholderLine style={styles().height60} />
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
          <PlaceholderLine style={styles().height100} />
          <PlaceholderLine />
          <PlaceholderLine />
          <View
            style={[
              styles(currentTheme).horizontalLine,
              styles().width100,
              styles().mB10
            ]}
          />
          <PlaceholderLine />
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
          <PlaceholderLine style={styles().height100} />
          <PlaceholderLine />
          <PlaceholderLine />
          <View
            style={[
              styles(currentTheme).horizontalLine,
              styles().width100,
              styles().mB10
            ]}
          />
          <PlaceholderLine />
          <PlaceholderLine />
        </Placeholder>
      </View>
    )
  }
  const mapRef = useRef(null) 
  let deliveryTime = Math.floor((orderDate - Date.now()) / 1000 / 60)
  if (deliveryTime < 1) deliveryTime += data?.deliveryTime
  if (
    loading ||
    loadingData ||
    loadingOrder
  )
    return loadginScreen()
  return (
    <>
      <View style={styles(currentTheme).mainContainer}>
        {!!cart.length && (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={[styles().flex]}
            >
              <View>
                <View style={[styles(currentTheme).headerContainer]}>
                  <View style={styles().mapView}>
                    <MapView
                      style={styles().flex}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      zoomControlEnabled={false}
                      rotateEnabled={false}
                      cacheEnabled={false}
                      customMapStyle={customMapStyle}
                      provider={PROVIDER_GOOGLE}
                      initialRegion={initialRegion}
                      ref={mapRef}
                    >
                    </MapView>
                    <View style={styles().marker}>
                      <RestaurantMarker />
                    </View>
                  </View>
                 
                </View>
                <OrderTracking currentStage={orderStep} />
                {orderStep == -1 ? 
                (
                
                
                <View>
                    
                <View style={[styles(currentTheme).headerContainer]}>
                    <View style={alignment.PLsmall}>
                      <Location
                        locationIcon={currentTheme.newIconColor}
                        locationLabel={currentTheme.newFontcolor}
                        location={currentTheme.newFontcolor}
                        navigation={props?.navigation}
                        addresses={profile?.addresses}
                        forwardIcon={true}
                        screenName={'checkout'}
                      />
                    </View>
                

                  <View
                    style={[
                      styles(currentTheme).horizontalLine,
                      styles().width100
                    ]}
                  />
                
                </View>
                <View>
                  <Instructions
                    theme={currentTheme}
                    title={'Instruction for the courier'}
                    message={instructions}
                  />
                </View>

                
                <View
                  style={[
                    styles(currentTheme).horizontalLine2,
                    { width: '92%', alignSelf: 'center' }
                  ]}
                />
                  {/* <View style={styles().voucherSec}>
                    {!coupon ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles(currentTheme).voucherSecInner}
                        onPress={() => onModalOpen(voucherModalRef)}
                      >
                        <MaterialCommunityIcons
                          name='ticket-confirmation-outline'
                          size={24}
                          color={currentTheme.lightBlue}
                        />
                        <TextDefault
                          H4
                          bolder
                          textColor={currentTheme.lightBlue}
                          center
                        >
                          {t('applyVoucher')}
                        </TextDefault>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TextDefault
                          numberOfLines={1}
                          H5
                          bolder
                          textColor={currentTheme.fontNewColor}
                        >
                          Voucher
                        </TextDefault>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingTop: scale(8),
                              gap: scale(5)
                            }}
                          >
                            <AntDesign
                              name='tags'
                              size={24}
                              color={currentTheme.main}
                            />
                            <View>
                              <TextDefault
                                numberOfLines={1}
                                tnormal
                                bold
                                textColor={currentTheme.fontFourthColor}
                              >
                                {coupon ? coupon.title : null} applied
                              </TextDefault>
                              <TextDefault
                                small
                                bold
                                textColor={currentTheme.fontFourthColor}
                              >
                                -{configuration.currencySymbol}
                                {parseFloat(
                                  calculatePrice(0, false) -
                                    calculatePrice(0, true)
                                ).toFixed(2)}
                              </TextDefault>
                            </View>
                          </View>
                          <View style={styles(currentTheme).changeBtn}>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => setCoupon(null)}
                            >
                              <TextDefault
                                small
                                bold
                                textColor={currentTheme.darkBgFont}
                                center
                              >
                                {coupon ? t('remove') : null}
                              </TextDefault>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    )}
                  </View> */}

                  <View style={[styles(currentTheme).priceContainer]}>
                    <TextDefault
                      numberOfLines={1}
                      H5
                      bolder
                      textColor={currentTheme.fontNewColor}
                      style={{ ...alignment.MBmedium }}
                      isRTL
                    >
                      {t('paymentSummary')}
                    </TextDefault>
                    <View style={styles(currentTheme).billsec}>
                      <TextDefault
                        numberOfLines={1}
                        normal
                        bold
                        textColor={currentTheme.fontFourthColor}
                      >
                        {t('subTotal')}
                      </TextDefault>
                      <TextDefault
                        numberOfLines={1}
                        textColor={currentTheme.fontFourthColor}
                        normal
                        bold
                      >
                        {configuration.currencySymbol}
                        {order.totalPrice.totalCost.toFixed(2)}
                      </TextDefault>
                    </View>
                    <View style={styles(currentTheme).horizontalLine2} />

                    {!isPickup && (
                      <>
                        <View style={styles(currentTheme).billsec}>
                          <TextDefault
                            numberOfLines={1}
                            textColor={currentTheme.fontFourthColor}
                            normal
                            bold
                          >
                            {t('deliveryFee')}
                          </TextDefault>
                          <TextDefault
                            numberOfLines={1}
                            textColor={currentTheme.fontFourthColor}
                            normal
                            bold
                          >
                            {configuration.currencySymbol}
                            {order.totalPrice.deliveryCost.toFixed(2)}
                          </TextDefault>
                        </View>
                        <View style={styles(currentTheme).horizontalLine2} />
                      </>
                    )}

<>
                    <View style={styles(currentTheme).billsec}>
                      <TextDefault
                        numberOfLines={1}
                        textColor={currentTheme.fontFourthColor}
                        normal
                        bold
                      >
                        {"Discount + Loayalty Points"}
                      </TextDefault>
                      <TextDefault
                        numberOfLines={1}
                        textColor={currentTheme.fontFourthColor}
                        normal
                        bold
                      >
                        {configuration.currencySymbol}
                        {`${order.totalPrice.discount.toFixed(2)} + ${order.totalPrice.loyaltyPoints.toFixed(2)}`}
                      </TextDefault>
                    </View>
</>
                 
                    <View style={styles(currentTheme).horizontalLine2} />
                    {/* {paymentMode === 'HYP' && (
                      <View style={styles(currentTheme).billsec}>
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          {t('tip')}
                        </TextDefault>
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontFourthColor}
                          normal
                          bold
                        >
                          {configuration.currencySymbol}
                          {parseFloat(calculateTip()).toFixed(2)}
                        </TextDefault>
                      </View>
                    )} */}

                    {coupon && (
                      <View>
                        <View style={styles(currentTheme).horizontalLine2} />
                        <View style={styles(currentTheme).billsec}>
                          <TextDefault
                            numberOfLines={1}
                            textColor={currentTheme.fontFourthColor}
                            normal
                            bold
                          >
                            {t('voucherDiscount')}
                          </TextDefault>
                          <TextDefault
                            numberOfLines={1}
                            textColor={currentTheme.fontFourthColor}
                            normal
                            bold
                          >
                            -{configuration.currencySymbol}
                            {parseFloat(
                              calculatePrice(0, false) - calculatePrice(0, true)
                            ).toFixed(2)}
                          </TextDefault>
                        </View>
                      </View>
                    )}
                    <View style={styles(currentTheme).horizontalLine2} />
                    <View style={styles(currentTheme).billsec}>
                      <TextDefault
                        numberOfLines={1}
                        textColor={currentTheme.fontFourthColor}
                        H4
                        bolder
                      >
                        {t('total')}
                      </TextDefault>
                      <TextDefault
                        numberOfLines={1}
                        textColor={currentTheme.fontFourthColor}
                        normal
                        bold
                      >
                        {configuration.currencySymbol}
                        {order.totalPrice.payableAmount.toFixed(2)}
                      </TextDefault>
                    </View>
                  </View>

                  <View
                    style={[
                      styles(currentTheme).termsContainer,
                      styles().pT10,
                      styles().mB10
                    ]}
                  >
                    <TextDefault
                      textColor={currentTheme.fontMainColor}
                      style={alignment.MBsmall}
                      small
                      isRTL
                    >
                      {t('condition1')}
                    </TextDefault>
                    <TextDefault
                      textColor={currentTheme.fontSecondColor}
                      style={alignment.MBsmall}
                      small
                      bold
                      isRTL
                    >
                      {t('condition2')}
                    </TextDefault>
                  </View>
                </View>)
                :
                (
                  <>
                   <View
                    style={[
                      styles(currentTheme).horizontalLine,
                      styles().width100
                    ]}
                  />
                    <View style={styles().paymentSec}>
                      <TextDefault
                        numberOfLines={1}
                        H5
                        bolder
                        textColor={currentTheme.fontNewColor}
                        isRTL
                      >
                        {t('titlePayment')}
                      </TextDefault>
                      <View>
                      <PaymentModeOption
                        title={t('cod')}
                        icon={'shekel'}
                        selected={paymentMode === 'CASH'}
                        theme={currentTheme}
                        onSelect={() => {
                          if (!orderSubmitting){setPaymentMode('CASH')}
                        }}
                        />
                        <PaymentModeOption
                        title={'Card'}
                        icon={'credit-card'}
                        selected={paymentMode === 'CARD'}
                        theme={currentTheme}
                        onSelect={() => {
                          if (!orderSubmitting){setPaymentMode('CARD')}
                        }}
                        />
                        <PaymentModeOption
                        title={'Online Banking'}
                        icon={'bank'}
                        selected={paymentMode === 'ONLINE'}
                        theme={currentTheme}
                        onSelect={() => {
                          if (!orderSubmitting){setPaymentMode('ONLINE')}
                        }}
                        />
                      </View>
                    </View>
                  </>
                )
                }
                
              </View>
            </ScrollView>
            {!isModalOpen && (
              <View style={styles(currentTheme).buttonContainer}>
                <TouchableOpacity
                  disabled={loadingOrder || !inRange}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (validateOrder()) {
                      buttonOnPress()
                    }
                  }}
                  style={[
                    styles(currentTheme).button,
                    { opacity: !inRange ? 0.5 : loadingOrder ? 0.5 : 1 }
                  ]}
                >
                  {!loadingOrder && inRange &&  !orderSubmitting && (
                    <TextDefault
                      textColor={currentTheme.color4}
                      style={styles().checkoutBtn}
                      bold
                      H4
                    >
                      {orderStep === -1 ? t('placeOrder') : orderStep === 0 ? 'Select Payment' : ''}
                    </TextDefault>
                  )}
                  {!inRange && (
                    <TextDefault
                      textColor={currentTheme.color4}
                      style={styles().checkoutBtn}
                      bold
                      H4
                    >
                      {'Out of range'}
                    </TextDefault>
                  )}
                  {loadingOrder && <Spinner backColor={'transparent'} />}
                  {orderSubmitting && <Spinner backColor={'transparent'} />}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Tip Modal */}
        <Modalize
          ref={tipModalRef}
          modalStyle={[styles(currentTheme).modal]}
          overlayStyle={styles(currentTheme).overlay}
          handleStyle={styles(currentTheme).handle}
          modalHeight={550}
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
          <View style={styles().modalContainer}>
            <View style={styles(currentTheme).modalHeader}>
              <View
                activeOpacity={0.7}
                style={styles(currentTheme).modalheading}
              >
                <FontAwesome
                  name={paymentMethod?.icon}
                  size={20}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  H4
                  bolder
                  textColor={currentTheme.newFontcolor}
                  center
                >
                  {t('AddTip')}
                </TextDefault>
              </View>
              <Feather
                name='x-circle'
                size={24}
                color={currentTheme.newIconColor}
                onPress={() => onModalClose(tipModalRef)}
              />
            </View>
            <View style={{ gap: 8 }}>
              <TextDefault
                uppercase
                bold
                textColor={currentTheme.gray500}
                isRTL
              >
                {t('enterCode')}
              </TextDefault>
              <TextInput
                keyboardType='numeric'
                placeholder={t('enterAmount')}
                value={tipAmount}
                onChangeText={(text) => setTipAmount(text)}
                style={styles(currentTheme).modalInput}
              />
            </View>
            <TouchableOpacity
              disabled={!tipAmount}
              activeOpacity={0.7}
              onPress={onTipping}
              style={[styles(currentTheme).button, { height: scale(40) }]}
            >
              <TextDefault
                textColor={currentTheme.black}
                style={styles().checkoutBtn}
                bold
                H4
              >
                {t('apply')}
              </TextDefault>
            </TouchableOpacity>
          </View>
        </Modalize>
        {/* Voucher Modal */}
        <Modalize
          ref={voucherModalRef}
          modalStyle={[styles(currentTheme).modal]}
          overlayStyle={styles(currentTheme).overlay}
          handleStyle={styles(currentTheme).handle}
          modalHeight={550}
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
          <View style={styles().modalContainer}>
            <View style={styles(currentTheme).modalHeader}>
              <View
                activeOpacity={0.7}
                style={styles(currentTheme).modalheading}
              >
                <MaterialCommunityIcons
                  name='ticket-confirmation-outline'
                  size={24}
                  color={currentTheme.newIconColor}
                />
                <TextDefault
                  H4
                  bolder
                  textColor={currentTheme.newFontcolor}
                  center
                >
                  {t('applyVoucher')}
                </TextDefault>
              </View>
              <Feather
                name='x-circle'
                size={24}
                color={currentTheme.newIconColor}
                onPress={() => onModalClose(voucherModalRef)}
              />
            </View>
            <View style={{ gap: 8 }}>
              <TextDefault
                uppercase
                bold
                textColor={currentTheme.gray500}
                isRTL
              >
                {t('enterCode')}
              </TextDefault>
              <TextInput
                label={t('inputCode')}
                placeholder={t('inputCode')}
                value={voucherCode}
                onChangeText={(text) => setVoucherCode(text)}
                style={styles(currentTheme).modalInput}
              />
            </View>
            {/* <TouchableOpacity
              disabled={!voucherCode }
              activeOpacity={0.7}
              onPress={() => {
                mutateCoupon({ variables: { coupon: voucherCode } })
              }}
              style={[
                styles(currentTheme).button,
                !voucherCode && styles(currentTheme).buttonDisabled,
                { height: scale(40) },
                { opacity: couponLoading ? 0.5 : 1 }
              ]}
            >
              {!couponLoading && (
                <TextDefault
                  textColor={currentTheme.black}
                  style={styles().checkoutBtn}
                  bold
                  H4
                >
                  {t('apply')}
                </TextDefault>
              )}
              {couponLoading && <Spinner backColor={'transparent'} />}
            </TouchableOpacity> */}
          </View>
        </Modalize>
      </View>
      <View
        style={{
          paddingBottom: inset.bottom,
          backgroundColor: currentTheme.themeBackground
        }}
      />
      <Modalize
        ref={modalRef}
        modalStyle={styles(currentTheme).modal}
        modalHeight={HEIGHT / 2}
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
        {/* <PickUp
          minimumTime={data?.deliveryTime}
          setOrderDate={setOrderDate}
          isPickedUp={isPickup}
          setIsPickedUp={setIsPickup}
          orderDate={orderDate}
          pickupTextColor={currentTheme.newFontcolor}
        /> */}
        <TouchableOpacity
          onPress={() => {
            modalRef.current.close()
          }}
          style={styles(currentTheme).pickupButton}
        >
          <TextDefault
            textColor={currentTheme.fontMainColor}
            style={styles().checkoutBtn}
            bold
            H4
          >
            {t('apply')}
          </TextDefault>
        </TouchableOpacity>
      </Modalize>
      <WrongAddressModal
        theme={currentTheme}
        modalVisible={isModalVisible}
        setModalVisible={()=> setisModalVisible(!isModalVisible)}
        handleNavigation={handleCartNavigation}
      />
    </>
  )
}

export default Checkout
