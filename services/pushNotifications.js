import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push-varsler krever fysisk enhet');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Ingen tillatelse til push-varsler');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);
  return token;
}

export async function sendApprovalNotification(issueTitle, fixSummary, prUrl) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🤖 AI-fix klar for godkjenning',
      body: `${issueTitle}\n\n${fixSummary}`,
      data: { prUrl },
    },
    trigger: null,
  });
}
