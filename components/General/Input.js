import { StyleSheet, Text, TextInput, View } from 'react-native';

// import { GlobalStyles } from '../../constants/styles';
import {Colors} from '../../constants/styles'

function Input({ label, invalid, style, textInputConfig }) {

  const inputStyles = [styles.input];

  if (textInputConfig && textInputConfig.multiline) {
    inputStyles.push(styles.inputMultiline)
  }

  if (invalid) {
    inputStyles.push(styles.invalidInput);
  }

  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>{label}</Text>
      <TextInput style={inputStyles} {...textInputConfig} />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8
  },
  label: {
    fontSize: 12,
    color: Colors.Murrey600,
    marginBottom: 4,
    textAlign: 'right'
  },
  input: {
    backgroundColor:  Colors.LightGray,
    color: Colors.PennBlue600,
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  invalidLabel: {
    color: Colors.Danger
  },
  invalidInput: {
    borderColor: Colors.Danger,
    borderWidth: 0.8,
  }
});
