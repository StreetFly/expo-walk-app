import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';



export default function WalkMaps() {
    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        async function getCurrentLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const location = await Location.getCurrentPositionAsync({});
            setRegion({
                ...region,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        }

        getCurrentLocation();
    }, []);

    useEffect(() => {
        async function trackLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 1000 },
                (location) => {
                    setRegion({
                        ...region,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );

            return () => subscription.remove();
        }

        trackLocation();
    }, []);

    return (
        <View style={styles.container}>
            <ThemedText>Current Latitude: {region.latitude}</ThemedText>
            <ThemedText>Current Longitude: {region.longitude}</ThemedText>
            <MapView
                style={styles.map}
                region={region}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 240,
        marginBottom: 100,
    },
    map: {
        flex: 1,
    },
});
