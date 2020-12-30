import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { theme } from '../core/theme';

type Props = {
  children: React.ReactNode;
};

const UnderlinedHeader = ({ children }: Props) => (
  <Text style={styles.header}>{children}</Text>
);

const styles = StyleSheet.create({
  header: {
    textDecorationLine: "underline",
    fontSize: 26,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingVertical: 14,
  },
});

export default memo(UnderlinedHeader);
