import React from 'react';
import { StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '@/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  edges = ['top', 'left', 'right'],
}) => {
  const isFocused = useIsFocused();

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {isFocused && (
        <StatusBar
          animated={true}
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
          translucent={false}
        />
      )}
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});