import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { Colors } from '../lib/theme'

export default function MapScreen({ navigation }: any) {
  const [parks, setParks] = useState<any[]>([])
  const [region, setRegion] = useState({
    latitude: 60.3913, longitude: 5.3221,
    latitudeDelta: 0.1, longitudeDelta: 0.1,
  })

  useEffect(() => {
    getLocation()
    fetchParks()
  }, [])

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({})
      setRegion({
        latitude: loc.coords.latitude, longitude: loc.coords.longitude,
        latitudeDelta: 0.08, longitudeDelta: 0.08,
      })
    }
  }

  const fetchParks = async () => {
    const { data } = await supabase
      .from('parks')
      .select('*')
      .in('status', ['active', 'pending'])
    if (data) setParks(data)
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation>
        {parks.map(park => (
          <Marker
            key={park.id}
            coordinate={{ latitude: park.lat, longitude: park.lng }}
            onPress={() => navigation.navigate('ParkDetail', { park })}
          >
            <View style={[styles.pin, park.status === 'pending' && styles.pinPending]}>
              <Text style={styles.pinText}>{park.status === 'pending' ? '🆕' : '🐾'}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Legg til park-knapp */}
      <TouchableOpacity
        style={styles.addParkBtn}
        onPress={() => navigation.navigate('SuggestPark')}
      >
        <Text style={styles.addParkBtnText}>+ Legg til park</Text>
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>🐾 {parks.filter(p => p.status === 'active').length} parker</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  pin: { backgroundColor: Colors.white, borderRadius: 20, padding: 6, borderWidth: 2, borderColor: Colors.green },
  pinPending: { borderColor: Colors.amber },
  pinText: { fontSize: 16 },
  addParkBtn: {
    position: 'absolute', top: 56, right: 16,
    backgroundColor: Colors.green, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  addParkBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  badge: { position: 'absolute', bottom: 30, left: 16, backgroundColor: Colors.green, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  badgeText: { color: Colors.white, fontWeight: '700' },
})
