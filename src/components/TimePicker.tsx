import React, { useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function TimePicker() {
  const [date, setDate] = useState(new Date(1598051730000))
  const [mode, setMode] = useState('time')

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate)
  }

  return (
    <View>
      <DateTimePicker
        style={styles.timePicker}
        testID="dateTimePicker"
        value={date}
        mode="time"
        is24Hour={true}
        display="default"
        onChange={onChange}
        textColor="red"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  timePicker: {
    marginVertical: 15,
  },
})
