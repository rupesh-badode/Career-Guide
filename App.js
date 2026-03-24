import { StatusBar } from 'expo-status-bar';
import MainLayout from './app/_layout';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

export default function App() {
  return (
    <>
    <SafeAreaProvider>
      <MainLayout/>
      <StatusBar />
    </SafeAreaProvider>
    </>
  );
}
