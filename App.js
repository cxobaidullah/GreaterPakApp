import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/config/colors';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LanguageProvider>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <AppNavigator />
          </View>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
};

export default App;
