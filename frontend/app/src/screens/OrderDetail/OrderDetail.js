import { View, ScrollView, Dimensions } from 'react-native'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import styles from './styles'
import React, { useContext, useEffect, useState, useRef } from 'react'
import Spinner from '../../components/Spinner/Spinner'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import TextError from '../../components/Text/TextError/TextError'
import ConfigurationContext from '../../context/Configuration'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
// import analytics from '../../utils/analytics'
import Detail from '../../components/OrderDetail/Detail/Detail'
import RestaurantMarker from '../../assets/SVG/restaurant-marker'
import CustomerMarker from '../../assets/SVG/customer-marker'
import TrackingRider from '../../components/OrderDetail/TrackingRider/TrackingRider'
import OrdersContext from '../../context/Orders'
import { mapStyle } from '../../utils/mapStyle'
import { useTranslation } from 'react-i18next'
import { HelpButton } from '../../components/Header/HeaderIcons/HeaderIcons'

import {
  ProgressBar,
  checkStatus,
  getOrderStatusMessage
} from '../../components/Main/ActiveOrders/ProgressBar'
import { useNavigation } from '@react-navigation/native'
import { PriceRow } from '../../components/OrderDetail/PriceRow'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { CancelModal } from '../../components/OrderDetail/CancelModal'
import Button from '../../components/Button/Button'
import { gql, useMutation } from '@apollo/client'
import { cancelOrder as cancelOrderMutation } from '../../apollo/mutations'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { calulateRemainingTime } from '../../utils/customFunctions'
import { Instructions } from '../../components/Checkout/Instructions'

import MapViewDirections from 'react-native-maps-directions'
import useEnvVars from '../../../environment'
import LottieView from 'lottie-react-native'
import { clearLogEntriesAsync } from 'expo-updates'
import Taxes from './Taxes'
import { restaurantsManager } from '../../ui/hooks'
import { err } from 'react-native-svg'
const { height: HEIGHT, width: WIDTH } = Dimensions.get('screen')

const CANCEL_ORDER = gql`
  ${cancelOrderMutation}
`

function OrderDetail(props) {
  // console.log("propsdata",props?.route.params)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  //const Analytics = analytics()
  const { t, i18n } = useTranslation()
  const id = props?.route.params ? props?.route.params?._id : null
  const orderData = props?.route.params ? props?.route.params?.order : null
  // console.log('orderData',orderData)
  const loadingOrders = restaurantsManager.getLoading();
  const errorOrders = restaurantsManager.getError();
  const orders = restaurantsManager.getOrders();
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = {isRTL : i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue]}
  const navigation = useNavigation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const mapView = useRef(null);
  // useEffect(() => {
  //   /* async function Track() {
  //     await Analytics.track(Analytics.events.NAVIGATE_TO_ORDER_DETAIL, {
  //       orderId: id
  //     })
  //   }
  //   Track() */
  // }, [])

  const cancelModalToggle = () => {
    setCancelModalVisible(!cancelModalVisible)
  }
  function onError(error) {
    FlashMessage({
      message: error.message
    })
  }
let order=orders?.find((o)=>
{
  return o?.id === id
})

if(!order)
{
  order=orderData
}

const cancelOrder = async () => {
  try {
    order.status = ORDER_STATUS_ENUM.CANCELLED;
    await restaurantsManager.cacelOrder(order);
    
  } catch (error) {
     console.log(error);
     
  }  finally {
    props?.navigation.navigate('MyOrders');
  }
};

  useEffect(() => {
    props?.navigation.setOptions({
      headerRight: () => HelpButton({ iconBackground: currentTheme.main, navigation, t }),
      headerTitle: `${order ? order?.id.toString()?.substr(0, 15) : ""}...`,
      headerTitleStyle: { color: currentTheme.newFontcolor },
      headerStyle: { backgroundColor: currentTheme.newheaderBG }
    })
  }, [orders])

  if (loadingOrders) {
    return (
      <Spinner
        backColor={currentTheme.themeBackground}
        spinnerColor={currentTheme.main}
      />
    )
  }
  // if (errorOrders) {
  //   console.log({errorOrders})
  //   return <TextError text={JSON.stringify(errorOrders)} />}

  const remainingTime = calulateRemainingTime(order)
  const {
    shop,
    userLocation,
    bill,
    totalPrice
  } = order
  

  const subTotal = totalPrice.payableAmount
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: currentTheme.themeBackground,
          paddingBottom: scale(150)
        }}
        showsVerticalScrollIndicator={false}
        overScrollMode='never'
      >
          {/* <MapView
            ref={(c) => (mapView.current = c)}
            style={{ flex: 1, height: HEIGHT * 0.6 }}
            showsUserLocation={false}
            initialRegion={{
              latitude: 0,
              longitude: 0,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
            zoomEnabled={true}
            zoomControlEnabled={true}
            rotateEnabled={false}
            customMapStyle={mapStyle}
            provider={PROVIDER_GOOGLE}
          >
            <Marker
              coordinate={{
                longitude: 0,
                latitude: 0
              }}
            >
              <RestaurantMarker />
            </Marker>
            <Marker
              coordinate={{
                latitude: 0,
                longitude: 0
              }}
            >
              <CustomerMarker />
            </Marker>
            <MapViewDirections
              origin={{
                longitude: 0,
                latitude: 0
              }}
              destination={{
                latitude: 0,
                longitude: 0
              }}
              apikey={GOOGLE_MAPS_KEY}
              strokeWidth={6}
              strokeColor={currentTheme.main}
              optimizeWaypoints={true}
              onReady={(result) => {
                //result.distance} km
                //Duration: ${result.duration} min.

                mapView?.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: WIDTH / 20,
                    bottom: HEIGHT / 20,
                    left: WIDTH / 20,
                    top: HEIGHT / 20
                  }
                })
              }}
              onError={(error) => {
                console.log('onerror', error)
              }}
            />
          </MapView> */}
    
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            ...alignment.Pmedium
          }}
        >
          <OrderStatusImage status={order?.status} />
            <View
              style={{
                ...alignment.MTxSmall,
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
             
              <TextDefault
                H5
                style={{ ...alignment.Mmedium, textAlign: 'center' }}
                textColor={currentTheme.gray600}
                bold
              >
                {' '}
                {getOrderStatusMessage(order?.status)}
              </TextDefault>
            </View>

        </View>
        <Instructions title={'Instructions'} theme={currentTheme} message={order?.additionalNote} />
        <Detail
          navigation={props?.navigation}
          currencySymbol={configuration.currencySymbol}
          items={bill}
          from={shop?.name}
          orderNo={order?.id}
          deliveryAddress={userLocation}
          subTotal={subTotal}
          tip={0}
          tax={0}
          deliveryCharges={totalPrice.deliveryCost}
          total={subTotal}
          theme={currentTheme}
          id={id}
          rider={order?.rider}
          orderStatus={order?.status}
        />
     <Taxes tax={0} discount={totalPrice.discount} loyaltyPoints={totalPrice.loyaltyPoints} deliveryCharges={totalPrice.deliveryCost} currency={configuration.currencySymbol}/>
      </ScrollView>
      <View style={styles().bottomContainer(currentTheme)}>
        <PriceRow
          theme={currentTheme}
          title={t('total')}
          currency={configuration.currencySymbol}
          price={subTotal.toFixed(2)}
        />
          <View style={{ margin: scale(20) }}>
            <Button
              text={t('cancelOrder')}
              buttonProps={{ onPress: cancelModalToggle }}
              buttonStyles={styles().cancelButtonContainer(currentTheme)}
              textProps={{ textColor: currentTheme.red600 }}
              textStyles={{ ...alignment.Pmedium }}
            />
          </View>
      </View>
      <CancelModal
        theme={currentTheme}
        modalVisible={cancelModalVisible}
        setModalVisible={cancelModalToggle}
        cancelOrder={cancelOrder}
        orderStatus={order?.orderStatus}
      />
    </View>
  )
}

export const OrderStatusImage = ({ status }) => {
  let imagePath = null;
  switch (status) {
    case ORDER_STATUS_ENUM.INITIATED:
    case ORDER_STATUS_ENUM.CONFIRMED:
      imagePath = require('../../assets/SVG/order-placed.json')
      break
    case ORDER_STATUS_ENUM.PROCESSING:
      imagePath = require('../../assets/SVG/order-tracking-preparing.json')
      break
    case ORDER_STATUS_ENUM.SHIPPED:
      imagePath = require('../../assets/SVG/food-picked.json')
      break
    case ORDER_STATUS_ENUM.COMPLETED:
      imagePath = require('../../assets/SVG/place-order.json')
      break
    case ORDER_STATUS_ENUM.DELIVERED:
      imagePath = require('../../assets/SVG/place-order.json')
      break
  }
  console.log("imagePath",imagePath)

  if (!imagePath) return null

  return <LottieView
    style={{
      width: 250,
      height: 250
    }}
    source={imagePath}
    autoPlay
    loop
  />
}

export default OrderDetail
