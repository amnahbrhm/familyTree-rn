import React, { useState } from "react";
import RNPickerSelect from "react-native-picker-select";
import { View, Text, StyleSheet } from "react-native";

const Dropdown = ({ value, onChangeText, placeholder, options}) => {
//   const [selectedValue, setSelectedValue] = useState(null);

  return (
    <View style={styles.inputContiner}>
      {/* <Text>Select an option:</Text> */}
      <RNPickerSelect
        placeholder={placeholder}
        items={options}
        style={pickerSelectStyles}
        onValueChange={(value) => onChangeText(value)}
        value={value}
      />
      {/* {selectedValue && <Text>Selected: {selectedValue}</Text>} */}
    </View>
  );
};
export default Dropdown;
const styles = StyleSheet.create({
  inputContiner: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    margin: 6,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 12
  },
  input: {
    textAlign: "center",
    fontSize: 20,
    color: 'red'
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 20,
    width: 60,
    textAlign: 'center'

  },
  inputAndroid: {
    fontSize: 20,
    width: 60,
    textAlign: 'center'

  },
});