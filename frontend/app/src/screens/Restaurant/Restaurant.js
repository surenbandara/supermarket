// Hooks
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import React, { useState, useContext, useEffect, useRef } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  Extrapolation,
  interpolate,
  Easing as EasingNode,
  withTiming,
} from 'react-native-reanimated'
import { restaurantsManager } from '../../ui/hooks'
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'

// React Native
import {
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  SectionList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native-gesture-handler'

// Placeholder
import { PlaceholderMedia } from 'rn-placeholder'

// Contexts
import UserContext from '../../context/User'
import ConfigurationContext from '../../context/Configuration'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'

// Components
import ImageHeader from '../../components/Restaurant/ImageHeader'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import TextError from '../../components/Text/TextError/TextError'
// import ItemCard from '../../components/ItemCards/ItemCards'

// Styles
import styles from './styles'

// Utils
import { scale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import analytics from '../../utils/analytics'
import { popularItems, food, GET_SUB_CATEGORIES } from '../../apollo/queries'
import { escapeRegExp } from '../../utils/regex'
import { isOpen } from '../../utils/customFunctions'

// Icons
import { MaterialIcons } from '@expo/vector-icons'
import RestaurantProductsScreenLoader from '../../components/RestaurantProductsScreenLoader'

// screen dimensions
const { height } = Dimensions.get('screen')

// Animated Section List component
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)
const TOP_BAR_HEIGHT = height * 0.05
const HEADER_MAX_HEIGHT =
  Platform.OS === 'android' ? height * 0.65 : height * 0.61
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

// Queries
const POPULAR_ITEMS = gql`
  ${popularItems}
`
const FOOD = gql`
  ${food}
`


function Restaurant(props) {
  // Params & Analytics
  const { name: restaurantId } = props?.route.params
  const Analytics = analytics()
 
  const scrollRef = useRef(null)
  const flatListRef = useRef(null)

  // Hooks
  const client = useApolloClient()
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute()
  const propsData = route.params
  const translationY = useSharedValue(0)
  const circle = useSharedValue(0)

  // States
  const [selectedLabel, selectedLabelSetter] = useState(0)
  const [buttonClicked, buttonClickedSetter] = useState(false)
  const [relatedSubCategories, setRelatedSubCategories] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterData, setFilterData] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedSubCtg, setSelectedSubCtg] = useState('')
  const [selectedPrntCtg, setSelectedPrntCtg] = useState('')

  // Queries
  const fetchFoodDetails = (itemId) => {
    return client.readFragment({ id: `Food:${itemId}`, fragment: FOOD })
  }
  

  // Contexts
  const themeContext = useContext(ThemeContext)
  const currentTheme = {
    isRTL: i18n.dir() === 'rtl',
    ...theme[themeContext.ThemeValue]
  }
  const configuration = useContext(ConfigurationContext)
  const {
    restaurant: restaurantCart,
    cartCount,
    clearCart,
    checkItemCart
  } = useContext(UserContext)

  // Handlers
  const searchHandler = () => {
    setSearchOpen(!searchOpen)
    setShowSearchResults(!showSearchResults)
  }

  const searchPopupHandler = () => {
    setSearchOpen(!searchOpen)
    setSearch('')
    translationY.value = 0
  }

  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationY.value = event.contentOffset.y
  })

  const zIndexAnimation = useAnimatedStyle(() => {
    return {
      zIndex: interpolate(
        translationY.value,
        [0, TOP_BAR_HEIGHT, SCROLL_RANGE / 2],
        [-1, 1, 99],
        Extrapolation.CLAMP
      )
    }
  })

  const onPressItem = async (food) => {
    if (!propsData.isAvailable) {
      Alert.alert(
        '',
        t('restaurantClosed'),
        [
          {
            text: t('backToRestaurants'),
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          },
          {
            text: t('seeMenu'),
            onPress: () => console.log('see menu')
          }
        ],
        { cancelable: false }
      )
      return
    }
    if (!restaurantCart || food.restaurant === restaurantCart) {
      await addToCart(food, food.restaurant !== restaurantCart)
    } else if (food.restaurant !== restaurantCart) {
      Alert.alert(
        '',
        t('clearCartText'),
        [
          {
            text: t('Cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: t('okText'),
            onPress: async () => {
              await addToCart(food, true)
            }
          }
        ],
        { cancelable: false }
      )
    }
  }

  function wrapContentAfterWords(content, numWords) {
    const words = content.split(' ')
    const wrappedContent = []

    for (let i = 0; i < words.length; i += numWords) {
      wrappedContent.push(words.slice(i, i + numWords).join(' '))
    }

    return wrappedContent.join('\n')
  }

  // navigate every item to itemDetails screen
  const addToCart = async (food, clearFlag) => {
    if (clearFlag) await clearCart()

    navigation.navigate('ItemDetail', {
      food,
      addons:  [],
      options:  [],
      restaurant: propsData?.name,
    })
  }

  function tagCart(itemId) {
    if (checkItemCart) {
      const cartValue = checkItemCart(itemId)
      if (cartValue.exist) {
        return (
          <>
            <View style={styles(currentTheme).triangleCorner} />
            <TextDefault
              style={styles(currentTheme).tagText}
              numberOfLines={1}
              textColor={currentTheme.fontWhite}
              bold
              small
              center
            >
              {cartValue.quantity}
            </TextDefault>
          </>
        )
      }
    }
    return null
  }

  const scaleValue = useSharedValue(1)
  const scaleStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }))

  // Modify existing navigation logic to use these indices
  const onViewableItemsChanged = ({ viewableItems }) => {
    buttonClickedSetter(false)
    if (viewableItems.length === 0) return;
    const current_item = viewableItems[0].item.title;
    if (current_item.parentCategoryTitle) {
      setSelectedPrntCtg(current_item.parentCategoryTitle)
    }
    if (current_item.subCategoryTitle) {
      setSelectedSubCtg(current_item.subCategoryTitle)
    }
  }

  const iconColor = currentTheme.white

  const iconBackColor = currentTheme.white

  const iconRadius = scale(15)

  const iconSize = scale(20)

  const iconTouchHeight = scale(30)

  const iconTouchWidth = scale(30)

  const circleSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [scale(18), scale(24), scale(18)],
    Extrapolation.CLAMP
  )
  const radiusSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [scale(9), scale(12), scale(9)],
    Extrapolation.CLAMP
  )

  const fontStyles = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(
        circle.value,
        [0, 0.5, 1],
        [8, 12, 8],
        Extrapolation.CLAMP
      )
    }
  })



  // UseFocusEffects
  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.menuBar)
    }
    StatusBar.setBarStyle(
      themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'
    )
  })

  
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_RESTAURANTS)
    }
    Track();
  }, [])

  useEffect(() => {
    setFilterData(
      restaurantsManager.getProductDataForStore(propsData.name).filter((value) => value.name?.toLowerCase().includes(search.toLowerCase())) ?? []
    );
  }, [search, restaurantsManager.productData]);
  

  useEffect(() => {
    if (
      (!propsData.isAvailable)
    ) {
      Alert.alert(
        '',
        t('Restaurant Closed at the moment'),
        [
          {
            text: t('Go back to restaurants'),
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          },
          {
            text: t('See Menu'),
            onPress: () => console.log('see menu')
          }
        ],
        { cancelable: false }
      )
    }
  }, [])

  //Need for to insider

  const sortedDeals = []
  const updatedDeals = []
  const scrollElementById = (title, type = 'subCategory') => {}
  
  return (
    <SafeAreaView style={[styles(currentTheme).flex]}>
      <Animated.View style={[styles(currentTheme).flex]}>
        <ImageHeader
          ref={flatListRef}
          iconColor={iconColor}
          iconSize={iconSize}
          iconBackColor={iconBackColor}
          iconRadius={iconRadius}
          iconTouchWidth={iconTouchWidth}
          iconTouchHeight={iconTouchHeight}
          sortedDeals={sortedDeals}
          restaurantName={propsData?.name ?? props?.name}
          restaurantId={propsData?.name}
          restaurantImage={propsData?.image ?? props?.image}
          restaurant={props}
          topBarData={updatedDeals.filter(_item => _item?.foods?.some((_food) => !_food?.isOutOfStock))} // filtering deals based on is the foods inside them are in stock
          selectedLabel={selectedLabel}
          minimumOrder={
            propsData?.minimumOrder ?? props?.minimumOrder
          }
          tax={propsData?.tax ?? props?.tax}
          selectedLabelSetter={selectedLabelSetter}
          updatedDeals={updatedDeals}
          searchOpen={searchOpen}
          showSearchResults={showSearchResults}
          setSearch={setSearch}
          search={search}
          searchHandler={searchHandler}
          searchPopupHandler={searchPopupHandler}
          translationY={translationY}
          scrollElementById={scrollElementById}
          selectedSubCtg={selectedSubCtg}
          setSelectedSubCtg={setSelectedSubCtg}
          selectedPrntCtg={selectedPrntCtg}
          setSelectedPrntCtg={setSelectedPrntCtg}
          buttonClickedSetter={buttonClickedSetter}
          relatedSubCategories={relatedSubCategories}
          setRelatedSubCategories={setRelatedSubCategories}
        />

      <ScrollView
        style={{
          flexGrow: 1,
          marginTop: TOP_BAR_HEIGHT,
          backgroundColor: currentTheme.themeBackground
        }}
      >
        {filterData.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              style={styles(currentTheme).searchDealSection}
              activeOpacity={0.7}
              onPress={() => {
                onPressItem({
                  ...item,
                  restaurant: propsData?.name,
                  restaurantName: propsData?.name
                })
              }}
            >
              <View
                style={{
                  flexDirection: currentTheme?.isRTL
                    ? 'row-reverse'
                    : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <View style={styles(currentTheme).deal}>
                  {item?.image ? (
                    <Image
                      style={{
                        height: scale(60),
                        width: scale(60),
                        borderRadius: 30
                      }}
                      source={{ uri: item?.image }}
                    />
                  ) : null}
                  <View style={styles(currentTheme).flex}>
                    <View style={styles(currentTheme).dealDescription}>
                      <TextDefault
                        textColor={currentTheme.fontMainColor}
                        style={styles(currentTheme).headerText}
                        numberOfLines={1}
                        bolder
                        isRTL
                      >
                        {item?.name}
                      </TextDefault>
                      <TextDefault
                        style={styles(currentTheme).priceText}
                        small
                        isRTL
                      >
                        {wrapContentAfterWords(item?.description, 5)}
                      </TextDefault>
                      <View style={styles(currentTheme).dealPrice}>
                        <TextDefault
                          numberOfLines={1}
                          textColor={currentTheme.fontMainColor}
                          style={styles(currentTheme).priceText}
                          bolder
                          small
                          isRTL
                        >
                          {configuration.currencySymbol}
                          {parseFloat(item?.price).toFixed(2)}
                        </TextDefault>
                          <TextDefault
                            numberOfLines={1}
                            textColor={currentTheme.fontSecondColor}
                            style={styles(currentTheme).priceText}
                            small
                            isRTL
                          >
                           {' Quantity : '}
                            {parseInt(item?.quantity)}
                          </TextDefault>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles(currentTheme).addToCart}>
                  <MaterialIcons
                    name='add'
                    size={scale(20)}
                    color={currentTheme.themeBackground}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
    </ScrollView>


    {cartCount > 0 && (
    <View style={styles(currentTheme).buttonContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles(currentTheme).button}
        onPress={() => navigation.navigate('Cart')}
      >
        <View style={styles().buttontLeft}>
          <Animated.View
            style={[
              styles(currentTheme).buttonLeftCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: radiusSize
              },
              scaleStyles
            ]}
          >
            <Animated.Text
              style={[styles(currentTheme).buttonTextLeft, fontStyles]}
            >
              {cartCount}
            </Animated.Text>
          </Animated.View>
        </View>
        <TextDefault
          style={styles().buttonText}
          textColor={currentTheme.buttonTextPink}
          uppercase
          center
          bolder
          small
        >
          {t('viewCart')}
        </TextDefault>
        <View style={styles().buttonTextRight} />
      </TouchableOpacity>
    </View>
  )}
      </Animated.View>
    </SafeAreaView>
  )
}

export default Restaurant