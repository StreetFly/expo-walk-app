import React, { useEffect, useState } from "react";
import { Button, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Note = {
    id: string;
    text: string;
    createdAt: string;
    syncStatus: "pending" | "synced";
};

export default function WalkNotesScreen() {
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState<Note[]>([]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const loadNotes = async () => {
            try {
                const savedNotes = await AsyncStorage.getItem('walkNotes');

                if (savedNotes !== null) {
                    setNotes(JSON.parse(savedNotes));
                }
            } catch (error) {
                setStatus("Saved notes could not be loaded.");
            }
        };

        loadNotes();
    }, []);

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

        const newNote: Note = {
            id: Date.now().toString(),
            text: trimmedNote,
            createdAt: new Date().toISOString(),
            syncStatus: "pending",
        };

        const updatedNotes = [...notes, newNote];

        try {
            await AsyncStorage.setItem('walkNotes', JSON.stringify(updatedNotes));
            setNotes(updatedNotes);
            setNote("");
        } catch (error) {
            setStatus("Unable to save the note. Please try again.");
        }


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