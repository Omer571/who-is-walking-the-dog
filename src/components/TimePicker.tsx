import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

type Props = {
  onChange: (e) => void,
  value: Date,
}

const TimePicker = ({ value, onChange }: Props) => {
  const [date, setDate] = useState(value)
  const [mode, setMode] = useState('time')

  const handleChange = (event: any, selectedDate: any) => {
    // console.log("selected Date: " + selectedDate)

    onChange(selectedDate)
    const currentDate = selectedDate || date
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
        onChange={handleChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  timePicker: {
    marginVertical: 15,
  },
})

export default TimePicker
