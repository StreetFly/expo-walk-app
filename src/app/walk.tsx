import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import PermissionsButton from '../components/permissions-button';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function schedulePauseNotification() {
  await Notifications.scheduleNotificationAsync({
    identifier: 'pause-notification',
    content: {
      title: "Walk Paused",
      body: 'Your walk is still paused. Open the app when you are ready to continue.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });
}

async function scheduleGoalNotification() {
  await Notifications.scheduleNotificationAsync({
    identifier: 'goal-notification',
    content: {
      title: "Goal Reached!",
      body: 'Great job! You completed your walking goal.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

export default function WalkScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const goalSeconds = 60;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && seconds < goalSeconds) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (seconds >= goalSeconds) {
      setIsActive(false);
      scheduleGoalNotification();
      alert('Walking goal reached!');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  useEffect(() => {
    async function getCurrentLocation() {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location);
      const { latitude, longitude } = location.coords;
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    }

    async function setUpNotification() {
      registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

      if (Platform.OS === 'android') {
        Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
      }
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }

    async function registerForPushNotificationsAsync() {
      let token;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myNotificationChannel', {
          name: 'A channel is needed for the permissions prompt to appear',
          importance: AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }

      return token;
    }

    getCurrentLocation();
    setUpNotification();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>The app collects latitude, longitude, date, and time.
        Location data is collected only while a walk is being tracked.
        Location records are stored locally on the user&apos;s device.</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Your expo push token: {expoPushToken}</Text>
        <Text>{`Channels: ${JSON.stringify(
          channels.map(c => c.id),
          null,
          2
        )}`}</Text>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        <Button
          title="Press to schedule a notification"
          onPress={async () => {
            await schedulePushNotification();
          }}
        />
      </View>
      <Button
        title="Pause Walk"
        onPress={async () => {
          await schedulePauseNotification();
          setIsActive(false);
          alert('Pause reminder scheduled.');
        }}
      />
      <Button
        title="Resume Walk"
        onPress={async () => {
          await Notifications.cancelScheduledNotificationAsync('pause-notification');
          setIsActive(true);
          alert('Pause reminder canceled.')
        }}
      />
      <Button
        title="Stop Walk"
        onPress={async () => {
          await Notifications.cancelScheduledNotificationAsync('pause-notification');
          setIsActive(false);
          setSeconds(0);
          alert('Pause reminder canceled.');
        }}
      />
      <Button
        title="Test Start Walk"
        onPress={async () => {
          setIsActive(true);
        }}
      />
      <Text style={{ color: 'white' }}>
        Goal: {goalSeconds} seconds | Progress: {seconds} seconds
      </Text>
      <PermissionsButton title="Start Walk" onPermissionGranted={() => setIsActive(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  }
});
