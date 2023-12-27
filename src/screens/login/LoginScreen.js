import PrimaryButton from "../../components/UI/PrimaryButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Colors, GeneralStyle, Padding } from "../../constants/styles";
import { useLayoutEffect, useState } from "react";
import Dropdown from "../../components/UI/Dropdown";
import { getOtp } from "../../../util/http";

function LoginScreen({ navigation }) {
  const [phone, onChangePhone] = useState("");
  const [pref, onChangePref] = useState("");
  const [errorMsg, onChangeErrorMsg] = useState("");
  const [inputStyles, onChangeinputStyles] = useState([styles.input]);
  // const inputStyles = [styles.input];

  const placeholder = {
    label: "مفتاح الدولة",
    value: null,
  };
  const options = [
    { label: "+966", value: "966" },
    { label: "+965", value: "965" },
  ];
  
  async function login() {
    if (phone.length !== 9) {
      onChangeinputStyles([...inputStyles, styles.invalidInput]);
      onChangeErrorMsg("رقم الجوال ناقص");
      return;
    }
    onChangeinputStyles([styles.input])
    onChangeErrorMsg('')
    const res = await getOtp(pref + phone);
    console.log(res);
    if (res.success) {
    //TODO add navigaion to otp screen
    navigation.navigate('OTPScreen', {phone, pref})
    } else {
      onChangeinputStyles([...inputStyles, styles.invalidInput]);
      onChangeErrorMsg(res.message);
    }
  }
  return (
    <>
      <View style={styles.logo}>
        <Text style={styles.logoText}>Logo</Text>
      </View>
      <View style={styles.headerContiner}>
        <View style={styles.headerBG}>
          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.subTitle}>ادخل رقم هاتفك الجوال</Text>
          <View style={styles.inputContiner}>
            <Dropdown
              onChangeText={onChangePref}
              value={pref}
              placeholder={placeholder}
              options={options}
            />
            <View style={styles.inputWithErrorMSGContiner}>
              <TextInput
                style={[...inputStyles]}
                onChangeText={onChangePhone}
                value={phone}
                placeholder="55xxxxxxxx"
                keyboardType="numeric"
                maxLength={9}
              />
              <Text style={styles.errorMSG}>{errorMsg}</Text>
            </View>
          </View>
          <PrimaryButton onPress={login}>
            <View style={styles.buttonContiner}>
              <Text style={styles.buttonText}> تسجيل الدخول</Text>
            </View>
          </PrimaryButton>
        </View>
      </View>
    </>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  contentContiner: {
    // backgroundColor: "#fff",
  },
  logo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 90,
  },
  logoText: {
    fontSize: 24,
  },
  headerContiner: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary100,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
  },
  title: {
    fontSize: 36,
    marginTop: 20,
    // paddingBottom: 7,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 20,
    marginTop: 20,
    textAlign: "center",
  },
  inputContiner: {
    flexDirection: "row",
    marginTop: 20,

    // alignItems: "center",
    justifyContent: "center",
  },
  input: {
    textAlign: "center",
    height: 40,
    margin: 6,
    // borderWidth: 1,
    padding: 8,
    // paddingTop: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 140,
    fontSize: 20,
  },
  buttonContiner: {
    backgroundColor: Colors.primary500,
    height: 50,
    marginTop: 30,
    width: 300,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  invalidInput: {
    borderColor: "red",
    borderWidth: 0.8,
  },
  inputWithErrorMSGContiner: {
    alignItems: 'flex-end'
  },
  errorMSG: {
    fontSize: 10,
    color: 'red',
    paddingHorizontal: 10,
    paddingTop: 0,
    marginTop: 0
  }
});
