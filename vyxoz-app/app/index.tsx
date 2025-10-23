import React from 'react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect to the portfolio tab as the default home page
  return <Redirect href="/(tabs)/portfolio" />;
}