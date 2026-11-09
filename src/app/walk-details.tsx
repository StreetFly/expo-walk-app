import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Button } from 'react-native';
import * as Linking from 'expo-linking';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const myWalks = [
    {
        id: "101",
        dateTime: "October 1, 2026 at 10:00 AM",
        startLatitude: 47.2529,
        startLongitude: -122.4443,
        status: "Completed"
    },
    {
        id: "102",
        dateTime: "October 2, 2026 at 11:00 AM",
        startLatitude: 47.2530,
        startLongitude: -122.4444,
        status: "Completed"
    },
    {
        id: "103",
        dateTime: "October 3, 2026 at 12:00 PM",
        startLatitude: 47.2531,
        startLongitude: -122.4445,
        status: "Completed"
    }
];

export default function WalkDetailsScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const walk = myWalks.find((walk) => walk.id === id);
    const [linkError, setLinkError] = useState<string | null>(null);
    const [appStatus, setAppStatus] = useState<string | null>(null);

    if (!walk) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Walk not found. Please check the walk ID.</ThemedText>
            </ThemedView>
        );
    }

    const viewLocationOnWeb = async () => {
        const url = `https://www.openstreetmap.org/?mlat=${walk.startLatitude}&mlon=${walk.startLongitude}#map=19/${walk.startLatitude}/${walk.startLongitude}`;

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                setLinkError('Unable to open the location in a web browser.');
                return;
            }

            setLinkError(null);
            await Linking.openURL(url);
            setAppStatus('Opening the starting location in your browser.');
        } catch (error) {
            setLinkError('Unable to open the location in a web browser.');
        }
    };

    const openStartingLocation = async () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${walk.startLatitude},${walk.startLongitude}`;

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                setLinkError('Unable to open the maps app. Please try again on a device with a compatible maps app.');
                return;
            }

            setLinkError(null);
            await Linking.openURL(url);
            setAppStatus('Opening the starting location in Maps.');
        } catch (error) {
            setLinkError('Unable to open the maps app. Please try again on a device with a compatible maps app..');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Walk Details</ThemedText>
            <ThemedText type="subtitle">
                App Status: {appStatus ?? `Walk ${walk.id} loaded successfully.`}
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.details}>
                <ThemedText>ID: {walk.id}</ThemedText>
                <ThemedText>Date: {walk.dateTime}</ThemedText>
                <ThemedText>Latitude: {walk.startLatitude}</ThemedText>
                <ThemedText>Longitude: {walk.startLongitude}</ThemedText>
                <ThemedText>Status: {walk.status}</ThemedText>
                <Button
                    title="Open Starting Location in Maps"
                    onPress={openStartingLocation}
                />
                <Button
                    title="View Location on Web"
                    onPress={viewLocationOnWeb}
                />
                {linkError && <ThemedText>{linkError}</ThemedText>}
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 24,
    },
    details: {
        padding: 20,
        borderRadius: 16,
        gap: 8,
    }
});
