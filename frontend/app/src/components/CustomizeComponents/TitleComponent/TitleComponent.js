import React, { useContext } from 'react'
import { View } from 'react-native'
import styles from './styles'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'

function TitleComponent(props) {
  const { i18n } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = {isRTL: i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue]}


  return (
    <>
    <View style={styles(currentTheme).mainContainer}>
      <View>
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontMainColor}
          H6
          bolder
          isRTL>
          {props?.description}
        </TextDefault>
      </View>
      <View style={styles(currentTheme).rightContainer}>
        <TextDefault
          textColor={
            currentTheme.fontMainColor
          }
          H6
          center>
          {props?.descriptionDetails}
        </TextDefault>
      </View>
    </View>
    {(props?.sizeDetails || props?.sizeDetails == "" ) ?
    <View style={styles(currentTheme).mainContainer}>
      <View>
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontMainColor}
          H6
          bolder
          isRTL>
          {props?.size}
        </TextDefault>
      </View>
      <View style={styles(currentTheme).rightContainer}>
        <TextDefault
          textColor={
            currentTheme.fontMainColor
          }
          H6
          center>
          {props?.sizeDetails}
        </TextDefault>
      </View>
    </View> : <></>
    }
    {(props?.colorDetails || props?.colorDetails == "" ) ?
    <View style={styles(currentTheme).mainContainer}>
      <View>
        <TextDefault
          numberOfLines={1}
          textColor={currentTheme.fontMainColor}
          H6
          bolder
          isRTL>
          {props?.color}
        </TextDefault>
      </View>
      <View style={styles(currentTheme).rightContainer}>
        <TextDefault
          textColor={
            currentTheme.fontMainColor
          }
          H6
          center>
          {props?.colorDetails}
        </TextDefault>
      </View>
    </View> : <></>
    }
    </>
  )
}

export default TitleComponent
