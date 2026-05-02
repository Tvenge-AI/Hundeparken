import * as Sentry from "@sentry/react-native"
import React, { useEffect } from 'react'
import { registerForPushNotifications } from './services/pushNotifications'
import { NavigationContainer } from '@react-navigation/native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, ActivityIndicator, View, StyleSheet } from 'react-native'
import { supabase } from './src/lib/supabase'
import { useAuthStore } from './src/store/authStore'
import { Colors } from './src/lib/theme'
import LoginScreen from './src/app/LoginScreen'
import OnboardingScreen from './src/app/OnboardingScreen'
import HomeScreen from './src/app/HomeScreen'
import ProfileScreen from './src/app/ProfileScreen'
import MapScreen from './src/app/MapScreen'
import AddDogScreen from './src/app/AddDogScreen'
import CheckinScreen from './src/app/CheckinScreen'
import ReviewScreen from './src/app/ReviewScreen'
import ParkDetailScreen from './src/app/ParkDetailScreen'
import MeetupScreen from './src/app/MeetupScreen'
import SuggestParkScreen from './src/app/SuggestParkScreen'

const Tab = createMaterialTopTabNavigator()
const Stack = createNativeStackNavigator()

function MainTabs() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = { Hjem: '🏠', Park: "📍", Treff: '📅', Anmeld: '⭐', Profil: '🐶', Kart: '🗺️' }
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>
        },
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: { backgroundColor: Colors.white, height: 64 },
        tabBarIndicatorStyle: { backgroundColor: Colors.green, height: 2, bottom: 64 },
        swipeEnabled: true,
      })}
    >
      <Tab.Screen name="Hjem" component={HomeScreen} />
      <Tab.Screen name="Park" component={CheckinScreen} />
      <Tab.Screen name="Treff" component={MeetupScreen} />
      <Tab.Screen name="Anmeld" component={ReviewScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
      <Tab.Screen name="Kart" component={MapScreen} options={{ swipeEnabled: false }} />
    </Tab.Navigator>
  )
}

function AppNavigator() {
  const { session, loading } = useAuthStore()
  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🐾</Text>
        <ActivityIndicator color={Colors.green} />
      </View>
    )
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session == null ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="AddDog" component={AddDogScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="ParkDetail" component={ParkDetailScreen} />
          <Stack.Screen name="SuggestPark" component={SuggestParkScreen} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default Sentry.wrap(function App() {
  const { setSession, fetchProfile, fetchDogs } = useAuthStore()
  useEffect(() => { registerForPushNotifications().then(token => { if (token) console.log("Push token:", token) }) }, [])
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) { fetchProfile(); fetchDogs() }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) { fetchProfile(); fetchDogs() }
    })
    return () => subscription.unsubscribe()
  }, [])
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
});

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream },
})
