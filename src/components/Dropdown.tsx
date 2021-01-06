import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

type Props = {
  options: string[],
  defaultOption: string,
  priority: number,
  onChange: (e: any) => void,
}

const Dropdown = ({ options, defaultOption, priority, onChange }: Props) => {

  type item = {
    label: string, value: string
  }

  let items: item[] = []

  for (let option of options) {
    // Debug helper code
    // if (option === undefined)
    //   console.log("\nUNDEFINED FOUND!!!\n")

    items.push({
      label: option,
      value: option,
    })
  }

  const handleChange = (dropdownOption: item) => {
    onChange(dropdownOption.value)
  }

  // Debug help
  // console.log("defaultValue in Dropdown.tsx: " + defaultOption + " " + typeof defaultOption)
  // console.log("items in Dropdown.tsx: " + JSON.stringify(items))

  return (
    <DropDownPicker
      items={items}
      defaultValue={defaultOption}
      containerStyle={{height: 40, marginTop: 5}}
      zIndex={priority}
      style={{backgroundColor: '#fafafa'}}
      itemStyle={{
          justifyContent: 'flex-start'
      }}
      dropDownStyle={{backgroundColor: '#fafafa'}}
      onChangeItem={handleChange}
      />
  );
}

export default Dropdown
