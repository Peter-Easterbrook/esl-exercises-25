import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev) => {
        if (Constants.executionEnvironment === 'storeClient') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Virtual_Key,
          ).catch(() => {});
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
