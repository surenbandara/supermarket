import React, { useContext, useEffect, useState } from 'react'
import { View, TouchableOpacity, Image, FlatList } from 'react-native'
import { useSubscription } from '@apollo/client'
import gql from 'graphql-tag'
import { subscriptionOrder } from '../../apollo/subscriptions'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import TextDefault from '../Text/TextDefault/TextDefault'
import TextError from '../Text/TextError/TextError'
import { alignment } from '../../utils/alignment'
import styles from './styles'
import { scale } from '../../utils/scaling'
import { useTranslation } from 'react-i18next'
import ConfigurationContext from '../../context/Configuration'
import { ProgressBar, getOrderStatusMessage } from '../Main/ActiveOrders/ProgressBar'
import { calulateRemainingTime } from '../../utils/customFunctions'
import Spinner from '../Spinner/Spinner'
import EmptyView from '../EmptyView/EmptyView'
import { restaurantsManager } from '../../ui/hooks'
import { order } from '../../apollo/queries'
import { formatTimestamp } from '../../screens/MyOrders/MyOrders'

const ActiveOrders = ({ navigation, loading, error, activeOrders }) => {
  const { i18n } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = {isRTL : i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue]}
  const configuration = useContext(ConfigurationContext)

  const [version, setVersion] = useState(0);
    
    
  useEffect(() => {
    const unsubscribe = restaurantsManager.subscribe(() => {
      setVersion( version + 1);
    });

    return unsubscribe;
  }, []);

  const emptyView = () => {
    return (
      <EmptyView
        title={'titleEmptyActiveOrders'}
        description={'emptyActiveOrdersDesc'}
        buttonText={'emptyActiveOrdersBtn'}
      />
    )
  }

  const renderItem = ({ item }) => (
    <Item
      item={item}
      navigation={navigation}
      currentTheme={currentTheme}
      configuration={configuration}
    />
  )

  if (loading) {
    return (
      <Spinner
        size={'small'}
        backColor={currentTheme.themeBackground}
        spinnerColor={currentTheme.main}
      />
    )
  }
  if (error) return <TextError text={error.message} />

  return (
    <FlatList
      data={activeOrders}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      ListEmptyComponent={emptyView}
    />
  )
}

const getItems = items => {
  return items
    ?.map(
      item => {
        return `${item.quantity} x ${item.product?.name}`
      }
    )
    .join('\n')
}

const Item = ({ item, navigation, currentTheme, configuration }) => {

  
  const { t } = useTranslation()
  const remainingTime = calulateRemainingTime(item)
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('OrderDetail', { _id: item?.id, order: item })}>
      <View style={{ flex: 1 }}>
        <View style={styles(currentTheme).subContainer}>
          <View style={styles().orderDescriptionContainer}>
            <TextDefault Regular textColor={currentTheme.gray900} H2 bolder isRTL>
            {item.shop?.name}
            </TextDefault>
            <TextDefault h3 bold textColor={currentTheme.secondaryText} isRTL>
            #{item?.id}
            </TextDefault>
          </View>
          <View style={{ flex: 1 }}>
            <ProgressBar
              configuration={configuration}
              currentTheme={currentTheme}
              item={item}
              navigation={navigation}
              customWidth={scale(40)}
              isPicked={item?.isPickedUp}
            />
          </View>
          <View
            style={{
              ...styles().orderDescriptionContainer,
              ...alignment.PTxSmall
            }}>
            <TextDefault h5 bold textColor={currentTheme.secondaryText} isRTL>
              {getOrderStatusMessage(item.status) }
            </TextDefault>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: currentTheme?.isRTL ? 'row-reverse' : 'row',
              //alignItems: 'center',
              justifyContent: 'center',
              ...alignment.Mmedium,
              ...alignment.MTlarge,
              ...alignment.PLmedium
            }}>
            <Image
              style={styles(currentTheme).restaurantImage1}
              resizeMode="cover"
              source={{ uri: item.shop?.image }}
            />
            <View style={styles(currentTheme).textContainer2}>
              <View style={styles().subContainerLeft}>
                <TextDefault
                  textColor={currentTheme.fontMainColor}
                  uppercase
                  bolder
                  numberOfLines={2}
                  style={styles(currentTheme).orderInfo}
                isRTL>
                  {item?.restaurant?.name}
                </TextDefault>
                <TextDefault
                  numberOfLines={2}
                  // style={{ ...alignment.MTxSmall }}
                  style={styles(currentTheme).orderInfo}
                  textColor={currentTheme.fontMainColor}
                  bolder
                  small
                isRTL>
                  {getItems(item.bill)}
                </TextDefault>
              </View>
            </View>
            <View style={styles(currentTheme).subContainerRight}>
              <TextDefault
                //numberOfLines={1}
                textColor={currentTheme.fontMainColor}
                bolder
              isRTL>
                {` Total cost ${configuration.currencySymbol} ${parseFloat(item.totalPrice.totalCost).toFixed(2)}`}
              </TextDefault>
            </View>
          </View>
           <TextDefault
            h5
            textColor={currentTheme.secondaryText}
            small
            isRTL
          >
            {`Updated on ${formatTimestamp(item.timestamp)}`}
          </TextDefault>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ActiveOrders
