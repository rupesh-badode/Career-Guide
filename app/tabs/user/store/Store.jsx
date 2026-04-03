import React from 'react';
import {  StyleSheet } from 'react-native';
import PromoBanner from "./PromoBanner";
import ServicesGrid from "./ServiceGrid";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Store() {
  return (
    // SafeAreaView yahan hona chahiye taaki iPhone notch/Android status bar se bache
    <SafeAreaView style={styles.container}>
      {/* PromoBanner ko as a Header pass kiya taaki wo grid ke sath scroll ho */}
      <ServicesGrid ListHeaderComponent={<PromoBanner />} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  }
});