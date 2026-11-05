import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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

    if (!walk) {
        return (
            <View style={styles.container}>
                <Text>Walk not found. ID: {id ?? 'undefined'}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text>Walk Details</Text>
            <Text>ID: {walk.id}</Text>
            <Text>Date: {walk.dateTime}</Text>
            <Text>Latitude: {walk.startLatitude}</Text>
            <Text>Longitude: {walk.startLongitude}</Text>
            <Text>Status: {walk.status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    }
});
