import { ActivityIndicator, View } from 'react-native';

const ThemedLoader = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size='large' color='#2196F3' />
    </View>
  );
};

export default ThemedLoader;
