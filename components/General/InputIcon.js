import { StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "../../constants/styles";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function InputIcon({ label, invalid, style, textInputConfig, onPress, icon }) {
  const searchSectionStyles = [styles.searchSection];
  if (invalid) {
    searchSectionStyles.push(styles.invalidInput);
  }

  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>
        {label}
      </Text>
      <View style={searchSectionStyles}>
          <Icon
        name={icon}
        size={20}
        color="black"
        onPress={onPress}
      />
        <TextInput style={styles.input} {...textInputConfig} />
      </View>
    </View>
  );
}

export default InputIcon;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8,
    justifyContent: "flex-end",
  },
  label: {
    fontSize: 12,
    color: Colors.Murrey600,
    marginBottom: 4,
    textAlign: "right",
  },
  invalidLabel: {
    color: Colors.Danger,
  },
  invalidInput: {
    borderColor: Colors.Danger,
    borderWidth: 0.8,
  },
  
  searchSection: {
    flexDirection: "row",
    backgroundColor: Colors.LightGray,
    borderRadius: 6,
    alignItems: 'center',
    paddingLeft: 6,
  },
  searchIcon: {
    padding: 6,
    position: "absolute",
    left: 0,
  },
  input: {
    padding: 6,
    color: Colors.PennBlue600,
    fontSize: 18,
  },
});
