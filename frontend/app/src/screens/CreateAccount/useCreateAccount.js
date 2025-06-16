import { useEffect, useState, useContext } from 'react'
import { StatusBar, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import useEnvVars from '../../../environment'
import gql from 'graphql-tag'
import { login } from '../../apollo/mutations'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { useMutation } from '@apollo/client'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import analytics from '../../utils/analytics'
import AuthContext from '../../context/Auth'
import { useTranslation } from 'react-i18next'

import * as Google from 'expo-auth-session/providers/google'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import auth from '@react-native-firebase/auth';
import { restaurantsManager } from '../../ui/hooks'

const LOGIN = gql`
  ${login}
`

export const useCreateAccount = () => {
  const Analytics = analytics()


  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const [mutate] = useMutation(LOGIN, { onCompleted, onError })
  const [enableApple, setEnableApple] = useState(false)
  const [loginButton, loginButtonSetter] = useState(null)
  const [loading, setLoading] = useState(false)
  const { setTokenAsync } = useContext(AuthContext)
  const themeContext = useContext(ThemeContext)
  const [googleUser, setGoogleUser] = useState(null)
 // const [user, setUser] = useState('')
  const currentTheme = {isRTL : i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue]}
  const {
    IOS_CLIENT_ID_GOOGLE,
    ANDROID_CLIENT_ID_GOOGLE,
    TERMS_AND_CONDITIONS,
    PRIVACY_POLICY
  } = useEnvVars()

  // const configureGoogleSignin = () => {
  //   GoogleSignin.configure({
  //     iosClientId: IOS_CLIENT_ID_GOOGLE,
  //     androidClientId: ANDROID_CLIENT_ID_GOOGLE
  //   })
  // }

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID_GOOGLE,
    iosClientId: IOS_CLIENT_ID_GOOGLE
  })

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: restaurantsManager.fireBaseConfig.webClientId, 
      offlineAccess: true, 
    })
    
  }, [])

  const signIn = async () => {
    try {
      console.log("IIIIIIIIIIIIIII");
      loginButtonSetter('Google')
       console.log("OOOOOOOOOOOOOOOOO");
      await GoogleSignin.hasPlayServices() 
      console.log("PPPPPPPPPPPPPPPPPPPp");
      const userInfo = await GoogleSignin.signIn();
      console.log("ddddd",userInfo);
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      setGoogleUser(userInfo);
      await restaurantsManager.login(userInfo.data.user.email, firebaseIdToken);
      await restaurantsManager.fetchAll();
      navigation.navigate('Main');
    } catch (err) {
      console.log('Sign in with Google error', err)
    }
  }

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setGoogleUser(null);
      restaurantsManager.logout();
      console.log('User signed out successfully');
    } catch (err) {
      console.log('Sign in with Google error', err)
    }
  }



  //add it to a useEffect with response as a dependency
  useEffect(() => {
    //signInWithGoogle()
  }, [response])

  // const [googleRequest, googleResponse, googlePromptAsync] =
  //   Google.useAuthRequest({
  //     expoClientId: EXPO_CLIENT_ID,
  //     iosClientId: IOS_CLIENT_ID_GOOGLE,
  //     iosStandaloneAppClientId: IOS_CLIENT_ID_GOOGLE,
  //     androidClientId: ANDROID_CLIENT_ID_GOOGLE,
  //     androidStandaloneAppClientId: ANDROID_CLIENT_ID_GOOGLE,
  //     redirectUrl: `${AuthSession.OAuthRedirect}:/oauth2redirect/google`,
  //     scopes: ['profile', 'email']
  //   })

  const navigateToLogin = () => {
    navigation.navigate('Login')
  }
  const navigateToRegister = () => {
    navigation.navigate('Register')
  }
  const navigateToPhone = () => {
    navigation.navigate('PhoneNumber', {
      name: googleUser,
      phone: ''
    })
  }
  const navigateToMain = () => {
    navigation.navigate({
      name: 'Main',
      merge: true
    })
  }

  async function mutateLogin(user) {
    setLoading(true)
    let notificationToken = null
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      if (existingStatus === 'granted') {
        notificationToken = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId
          })
        ).data
      }
    }
    mutate({
      variables: {
        ...user,
        notificationToken: notificationToken
      }
    })
  }

  // const googleSignUp = () => {
  //   if (googleResponse?.type === 'success') {
  //     const { authentication } = googleResponse
  //     ;(async () => {
  //       const userInfoResponse = await fetch(
  //         'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
  //         {
  //           headers: { Authorization: `Bearer ${authentication.accessToken}` }
  //         }
  //       )
  //       const googleUser = await userInfoResponse.json()
  //       const user = {
  //         phone: '',
  //         email: googleUser.email,
  //         password: '',
  //         name: googleUser.name,
  //         picture: googleUser.picture,
  //         type: 'google'
  //       }
  //       mutateLogin(user)
  //     })()
  //   }
  // }

  // useEffect(() => {
  //   googleSignUp()
  // }, [googleResponse])

  useEffect(() => {
    checkIfSupportsAppleAuthentication()
  }, [])

  async function checkIfSupportsAppleAuthentication() {
    setEnableApple(await AppleAuthentication.isAvailableAsync())
  }

  async function onCompleted(data) {
    if (data.login.isActive == false) {
      FlashMessage({ message: t('accountDeactivated') })
      setLoading(false)
    } else {
      try {
        if (data.login.inNewUser) {
          await Analytics.identify(
            {
              userId: data.login.userId
            },
            data.login.userId
          )
          await Analytics.track(Analytics.events.USER_CREATED_ACCOUNT, {
            userId: data.login.userId,
            name: data.login.name,
            email: data.login.email
          })
        } else {
          await Analytics.identify(
            {
              userId: data.login.userId
            },
            data.login.userId
          )
          await Analytics.track(Analytics.events.USER_LOGGED_IN, {
            userId: data.login.userId,
            name: data.login.name,
            email: data.login.email
          })
        }
        setTokenAsync(data.login.token)
        FlashMessage({ message: 'Successfully logged in' })
        // eslint-disable-next-line no-unused-expressions
        data?.login?.phone === '' ? navigateToPhone() : navigateToMain()
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
  }

  function onError(error) {
    try {
      FlashMessage({
        message: error.message
      })
      loginButtonSetter(null)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.main)
    }
    StatusBar.setBarStyle(
      themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content'
    )
  })
  const openTerms = () => {
    Linking.openURL(TERMS_AND_CONDITIONS)
  }
  const openPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY)
  }
  return {
    enableApple,
    loginButton,
    loginButtonSetter,
    // googleRequest,
    // googlePromptAsync,
    loading,
    setLoading,
    themeContext,
    mutateLogin,
    currentTheme,
    navigateToLogin,
    navigateToRegister,
    openTerms,
    openPrivacyPolicy,
    navigateToMain,
    navigation,
    signIn,
    signOut,
    googleUser
    //user
  }
}
