import React, { useState } from "react";
import { Button, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";


export default function WalkNotesScreen() {
    const [note, setNote] = useState("");
    const [status, setStatus] = useState("");

    const saveNote = async () => {
        const trimmedNote = note.trim();
        if (trimmedNote.length === 0) {
            setStatus("Please enter a note before saving.");
            return;
        }

        if (trimmedNote.length > 200) {
            setStatus("Your note must be 200 characters or fewer.")
            return;
        }

        setNote("");
        setStatus("Note saved on this device.");
    }

    return (
        <ThemedView>
            <ThemedText type="title">Walk Notes</ThemedText>
            <TextInput
                placeholder="Enter a note about your walk"
                multiline={true}
                maxLength={200}
                value={note}
                onChangeText={setNote}
            />
            <ThemedText>{status}</ThemedText>
            <Button title="Save Note" onPress={saveNote} />
            <Button title="Sync Note" onPress={async () => {
                try {
                    const note = await AsyncStorage.getItem('walkNote');
                } catch (error) {
                    console.error('Error fetching walk note:', error);
                }
            }} />
        </ThemedView>
    );
}