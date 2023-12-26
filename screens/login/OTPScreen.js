import PrimaryButton from "../../components/UI/PrimaryButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Colors, GeneralStyle, Padding } from "../../constants/styles";
import { useLayoutEffect, useState } from "react";
import Dropdown from "../../components/UI/Dropdown";
import { validateOtp } from "../../util/http";

function OTPScreen({route, navigation }) {
  const [code, onChangeCode] = useState("");
  const { phone , pref} = route.params;
  const [errorMsg, onChangeErrorMsg] = useState("");
  const [inputStyles, onChangeinputStyles] = useState([styles.input]);
  function goBack() {
    navigation.goBack();
  }
  async function login() {
    if (code.length !== 5) {
      onChangeinputStyles([...inputStyles, styles.invalidInput]);
      onChangeErrorMsg("الكود يجب ان يتكون من ٥ خانات");
      return;
    }
    onChangeinputStyles([styles.input]);
    onChangeErrorMsg("");
    const res = await validateOtp(pref+phone, code);
    console.log(res);
    if (res.success) {
      //TODO -> user, token in lical storage and nav to home page
    } else {
      onChangeinputStyles([...inputStyles, styles.invalidInput]);
      onChangeErrorMsg(res.message);
    }
  }
  return (
    <>
      <View style={styles.backIcon}>
        <Ionicons
          onPress={goBack}
          name="chevron-back-outline"
          size={24}
          color="black"
        />
      </View>
      <View style={styles.logo}>
        <Text style={styles.logoText}>Logo</Text>
      </View>
      <View style={styles.headerContiner}>
        <View style={styles.headerBG}>
          {/* <Text style={styles.title}>رمز التحقق</Text> */}
          <Text style={styles.subTitle}>ادخل رمز التحقق</Text>
          <Text style={styles.subTitle}>المرسل على {phone}</Text>
          <View style={styles.inputContiner}>
            {/* <Dropdown
              onChangeText={onChangePref}
              value={pref}
              placeholder={placeholder}
              options={options}
            /> */}
            <View style={styles.inputWithErrorMSGContiner}>
              <TextInput
                style={[...inputStyles]}
                onChangeText={onChangeCode}
                value={code}
                placeholder="xxxxx"
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={styles.errorMSG}>{errorMsg}</Text>
            </View>
          </View>
          <PrimaryButton onPress={login}>
            <View style={styles.buttonContiner}>
              <Text style={styles.buttonText}> تفعيل </Text>
            </View>
          </PrimaryButton>
        </View>
      </View>
    </>
  );
}

export default OTPScreen;

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
    // marginTop: 20,
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
    alignItems: "flex-end",
  },
  errorMSG: {
    fontSize: 10,
    color: "red",
    paddingHorizontal: 10,
    paddingTop: 0,
    marginTop: 0,
  },
  backIcon: {
    margin: 20,
    marginTop: 55
  },
});
