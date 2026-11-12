import React from "react";
import { View, Text, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function WalkNotesScreen() {
    return (
        <View>
            <Text>Walk Notes</Text>
            <TextInput
                placeholder="Enter a note about your walk"
                maxLength={200}
            />
        </View>
    );
}