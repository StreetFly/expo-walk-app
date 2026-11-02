# Walk App
This is a walking tracker app built in expo that allows you to start, pause, resume, and stop a walk.

## Get started
1. Download or clone this repo in an IDE
   
2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

4. Open in Expo Go and press start walk on an android device or test start walk on an ios device (Background permissions don't work on ios expo go)

## Notification tests completed
Pausing a walk sends a notification after 10 seconds, resuming or stopping the walk cancels the notification.
Completing a walk goal sends a notification and can only be repeated if a new walk is started.
Notifications work while app is minimized

## Problems encountered
App was built on a laptop that does not support hardware virtualization and tested on an iphone using expo go so there were limitations in what I could test ie not being able to use background location permissions, to solve this I added the test start walk button that doesnt use location permissions.
