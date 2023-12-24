import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/styles';
// import { GlobalStyles } from '../../constants/styles';

function Button({ children, onPress, mode, style }) {
  return (
    <View style={style}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={[styles.button, mode === 'flat' && styles.flat]}>
          <Text style={[styles.buttonText, mode === 'flat' && styles.flatText]}>
            {children}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 4,
    padding: 8,
    backgroundColor: Colors.Iris300,
    borderWidth: 1,
    borderColor: Colors.Iris300
  },
  flat: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor:Colors.Danger
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  flatText: {
    color: Colors.Danger,
  },
  pressed: {
    opacity: 0.75,
    // backgroundColor: 'green',
    borderRadius: 4,
  },
});
