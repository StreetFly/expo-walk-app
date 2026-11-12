import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

export default function WalkMaps() {
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [region, setRegion] = useState<Region | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isTracking) {
            return;
        }

        let isActive = true;
        let subscription: Location.LocationSubscription | null = null;

        async function trackLocation() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    if (isActive) {
                        setErrorMessage('Permission to access location was denied.');
                        setIsTracking(false);
                    }
                    return;
                }

                const initialLocation = await Location.getCurrentPositionAsync({});
                if (!isActive) {
                    return;
                }

                setErrorMessage(null);
                setRegion((currentRegion) => ({
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                    latitudeDelta: currentRegion?.latitudeDelta ?? 0.01,
                    longitudeDelta: currentRegion?.longitudeDelta ?? 0.01,
                }));

                subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 1000 },
                    (location) => {
                        setRegion((currentRegion) => ({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: currentRegion?.latitudeDelta ?? 0.01,
                            longitudeDelta: currentRegion?.longitudeDelta ?? 0.01,
                        }));
                    }
                );

                if (!isActive) {
                    subscription.remove();
                }
            } catch (error) {
                console.error('Unable to track location:', error);
                if (isActive) {
                    setErrorMessage('Unable to get your location. Please try again.');
                    setIsTracking(false);
                }
            }
        }

        void trackLocation();

        return () => {
            isActive = false;
            subscription?.remove();
        };
    }, [isTracking]);

    return (
        <ThemedView style={styles.container}>
            <Button
                title={isTracking ? 'Stop Walk' : 'Start Walk'}
                onPress={() => {
                    setErrorMessage(null);
                    setIsTracking((tracking) => !tracking);
                }}
            />
            {errorMessage && <ThemedText>{errorMessage}</ThemedText>}
            {region ? (
                <>
                    <ThemedText>Current Latitude: {region.latitude}</ThemedText>
                    <ThemedText>Current Longitude: {region.longitude}</ThemedText>
                    <MapView style={styles.map} region={region} />
                </>
            ) : (
                <ThemedText>
                    {isTracking ? 'Getting your location…' : 'Start a walk to track your location.'}
                </ThemedText>
            )}
        </ThemedView>
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
