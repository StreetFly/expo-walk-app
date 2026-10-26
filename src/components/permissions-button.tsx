import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import React from 'react';
import { Button, Platform, StyleSheet, View } from 'react-native';


const LOCATION_TASK_NAME = 'background-location-task';

const requestPermissions = async (onPermissionGranted?: () => void) => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  console.log('foregroundStatus', foregroundStatus);

  if (foregroundStatus !== 'granted') {
    return;
  }

  //browsers
  console.log("current platform:", Platform.OS);
  if (Platform.OS === 'web') {
    await Location.watchPositionAsync({
      accuracy: Location.Accuracy.Balanced
    },
    (location) => {
      console.log('foreground location update:', location);
    }
  );

  onPermissionGranted?.();
  return;
  } else { 
    if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    console.log('backgroundStatus', backgroundStatus);

    if (backgroundStatus === 'granted') {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
      });
    }
    }
  }
  onPermissionGranted?.();
};

const PermissionsButton = ({
  title,
  onPermissionGranted,
}: {
  title: string | null;
  onPermissionGranted?: () => void;
}) => (
  <View style={styles.container}>
    <Button onPress={() => requestPermissions(onPermissionGranted)}
     title={
      title !== null && title !== undefined
      ? title
      : `Enable ${Platform.OS === 'web' ? 'foreground location' : 'background location'}`} />
  </View>
);

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    // do something with the locations captured in the background
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PermissionsButton;