import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/config/colors';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <AppNavigator />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
