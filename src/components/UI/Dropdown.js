import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";

const Dropdown = ({ value, onChangeText, placeholder, options }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.inputContiner}>
      {/* <RNPickerSelect
        placeholder={placeholder}
        items={options}
        style={pickerSelectStyles}
        onValueChange={(value) => onChangeText(value)}
        value={value}
      /> */}
      {/* <DropDownPicker
        open={open}
        value={value}
        items={options}
        setOpen={setOpen}
        setValue={onChangeText}
        style={styles.dropdown}
        placeholder={placeholder}
        rtl={true}
      /> */}
      {/* <Picker selectedValue={value} onValueChange={onChangeText}  style={styles.dropdown}>
        {options.map((item, index) => (
          <Picker.Item key={index} label={item.label} value={item.value} />
        ))}
      </Picker> */}
      <DropDownPicker
        open={open}
        value={value}
        items={options}
        setOpen={setOpen}
        setValue={onChangeText}
        containerStyle={{ height: 40 }}
        style={{ backgroundColor: "#fff", borderWidth: 0, width: 110 }}
        itemStyle={{
          // justifyContent: "flex-start",
          borderWidth: 0,
          width: 90,
        }}
        // rtl={true}
        placeholder={placeholder}
        dropDownStyle={{ backgroundColor: '#fafafa', borderWidth: 0, width: 90 }}
        onChangeItem={(item) => setSelectedValue(item.value)}
      />
    </View>
  );
};
export default Dropdown;
const styles = StyleSheet.create({
  inputContiner: {
    flex: 0.6,
    // alignItems: "center",
    // justifyContent: "center",
    // height: 40,
    width: 110,
    margin: 6,
    // padding: 8,
    // backgroundColor: "#fff",
    // borderRadius: 12,
  },
  input: {
    textAlign: "center",
    fontSize: 20,
    color: "red",
  },
  dropdown: {
    textAlign: "center",
    height: 30,
    margin: 6,
    // borderWidth: 1,
    // padding: 8,
    // paddingTop: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 110,
    fontSize: 20,
    borderWidth: 0,
  },
});

// const pickerSelectStyles = StyleSheet.create({
//   inputIOS: {
//     fontSize: 20,
//     width: 60,
//     textAlign: "center",
//   },
//   inputAndroid: {
//     fontSize: 20,
//     width:200,
//     textAlign: "center",

//   },
// });
