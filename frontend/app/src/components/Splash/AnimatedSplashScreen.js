import 'expo-dev-client'
import * as SplashScreen from 'expo-splash-screen'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import SplashVideo from './SplashVideo'
import { restaurantsManager } from '../../ui/hooks';
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import auth from '@react-native-firebase/auth';

export default function AnimatedSplashScreen({ children }) {
  const opacityAnimation = useSharedValue(1) // Shared value for opacity
  const scaleAnimation = useSharedValue(1) // Shared value for scale
  const [isAppReady, setAppReady] = useState(false)
  const [isSplashVideoComplete, setSplashVideoComplete] = useState(false)
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: restaurantsManager.fireBaseConfig.webClientId, 
      offlineAccess: true, 
    })
    
  }, [])
  
  const initializeApp = async () => {
    try {

      let userInfo = await GoogleSignin.signInSilently();
      if (userInfo) {
        const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
        const userCredential = await auth().signInWithCredential(googleCredential);
        const firebaseIdToken = await userCredential.user.getIdToken();
        await restaurantsManager.login(userInfo.data.user.email, firebaseIdToken);
        await restaurantsManager.fetchAll();
      }
    } catch (e) {
      console.error(e)
    } 
  }

  useEffect(() => {
    if (isAppReady && isSplashVideoComplete ) {
      // Start fade out and scale down animation when the app is ready and video has completed
      opacityAnimation.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.exp)
      })

      scaleAnimation.value = withTiming(
        2,
        {
          duration: 300,
          easing: Easing.out(Easing.exp)
        },
        () => {
          runOnJS(setAnimationComplete)(true) // Update the animation completion state
        }
      )
    }
  }, [isAppReady, isSplashVideoComplete])

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync()
      // Load stuff
      await Promise.all([initializeApp()])
    } catch (e) {
      // Handle errors
    } finally {
      setAppReady(true)
    }
  }, [])

  const videoElement = useMemo(() => {
    return (
      <SplashVideo
        onLoaded={onImageLoaded}
        onFinish={() => {
          setSplashVideoComplete(true) // Mark video as complete
        }}
      />
    )
  }, [onImageLoaded])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnimation.value, // Use shared value for opacity
      transform: [{ scale: scaleAnimation.value }] // Use shared value for scale
    }
  })

  return (
    <View style={{ flex: 1 }}>
      {isSplashAnimationComplete ? children : null}
      <Animated.View
        pointerEvents='none'
        style={[
          StyleSheet.absoluteFill,
          animatedStyle,
          { backgroundColor: 'black' }
        ]}
      >
        {videoElement}
      </Animated.View>
    </View>
  )
}
