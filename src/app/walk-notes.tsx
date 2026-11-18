import React, { useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

type Note = {
    id: string;
    text: string;
    createdAt: string;
    syncStatus: "pending" | "synced";
};

export default function WalkNotesScreen() {
    const theme = useTheme();
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
            return;
        }

        setStatus("Note saved on this device.");
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled">
                    <ThemedText type="subtitle">Walk Notes</ThemedText>
                    <TextInput
                        placeholder="Enter a note about your walk"
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        maxLength={200}
                        value={note}
                        onChangeText={setNote}
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.backgroundElement,
                                color: theme.text,
                                borderColor: theme.textSecondary,
                            },
                        ]}
                    />
                    <ThemedText style={styles.status}>{status}</ThemedText>
                    <Button title="Save Note" onPress={saveNote} />
                    <Button title="Sync Note" onPress={async () => {
                        try {
                            const note = await AsyncStorage.getItem('walkNote');
                        } catch (error) {
                            console.error('Error fetching walk note:', error);
                        }
                    }} />
                    <ThemedText type="subtitle">Saved Notes</ThemedText>
                    {notes.length === 0 ? (
                        <ThemedText>No walk notes have been saved.</ThemedText>
                    ) : (
                        notes.map((savedNote) => (
                            <ThemedView
                                key={savedNote.id}
                                type="backgroundElement"
                                style={styles.savedNote}>
                                <ThemedText>{savedNote.text}</ThemedText>
                                <ThemedText>
                                    Created: {new Date(savedNote.createdAt).toLocaleString()}
                                </ThemedText>
                                <ThemedText>
                                    {savedNote.syncStatus === "pending" ? "Pending Sync" : "Synced"}
                                </ThemedText>
                            </ThemedView>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    input: {
        minHeight: 120,
        maxHeight: 180,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
    },
    status: {
        minHeight: 24,
    },
    savedNote: {
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
})