import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { theme } from '../core/theme';

type Props = React.ComponentProps<typeof PaperButton>;

const CircleButton = ({ mode, style, children, ...props }: Props) => (
  <PaperButton
    style={[
      styles.addButton,
      mode === 'outlined' && { backgroundColor: theme.colors.surface },
      mode === 'contained' && { backgroundColor: theme.colors.secondary },
      style,
    ]}
    labelStyle={styles.text}
    mode={mode}
    {...props}
  >
    {children}
  </PaperButton>
);

const styles = StyleSheet.create({
  addButton: {
    padding: 5,
    height: 60,
    margin: 10,
    width: 30,  //The Width must be the same as the height
    borderRadius: 50, //Then Make the Border Radius twice the size of width or Height
    backgroundColor:'rgb(195, 125, 198)',
  },
  text: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 35,
    lineHeight: 26,
  },
});

export default memo(CircleButton);
