import React, { useContext } from 'react'
import { View, TouchableOpacity } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { LocationContext } from '../../../context/Location'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import { EvilIcons, Feather } from '@expo/vector-icons'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import { restaurantsManager } from '../../../ui/hooks'

function Location({
  navigation,
  addresses,
  locationIconGray,
  modalOn,
  location: locationParam,
  locationLabel,
  forwardIcon = false,
  screenName }) {
  const { t, i18n } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = {isRTL : i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue]}
  const { location } = useContext(LocationContext)

  let translatedLabel
  if (location?.label === 'Current Location') {
    translatedLabel = t('currentLocation')
  } else {
    translatedLabel = t('currentLocation')
  }

  const onLocationPress = (event) => {
     const locationParameter = restaurantsManager.getSystemParameterFromKey('Location').value;
    const [latOrigin, lonOrigin] = locationParameter.split(',').map(coord => parseFloat(coord));

    navigation.navigate('AddNewAddress', {
            prevScreen: 'Checkout',
            latitude: location?.latitude ?? latOrigin,
            longitude: location?.longitude ?? lonOrigin
          })
    // if (screenName === 'checkout') {
    //   if (addresses && !addresses.length) {
    //     navigation.navigate('AddNewAddress', {
    //       prevScreen: 'Checkout',
    //       latitude: location.latitude,
    //       longitude: location.longitude
    //     })
    //   } else {
    //     navigation.navigate('CartAddress', {
    //       address: location
    //     })
    //   }
    // }
    // else
    //   modalOn()
  }
  return (
    <TouchableOpacity onPress={onLocationPress} >
      <View style={styles(currentTheme).headerTitleContainer}>
        <View style={{ flexDirection: currentTheme?.isRTL ? 'row-reverse' : 'row' , alignItems: 'center', justifyContent: 'center', marginHorizontal: scale(10), gap: 5 }}>
          <View style={[styles().locationIcon, locationIconGray]}>
            <EvilIcons
              name="location"
              size={scale(20)}
              color={currentTheme.secondaryText}
            />
          </View>
          <View style={styles(currentTheme).headerContainer}>
            <View>
             
            </View>
            <TextDefault textColor={locationLabel} left isRTL>
              {''}
              {t(translatedLabel)}
            </TextDefault>
          </View>
          {forwardIcon && <Feather
            name= {currentTheme?.isRTL ? 'chevron-left' : 'chevron-right'}
            size={20}
            color={currentTheme.secondaryText}
          />}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Location
