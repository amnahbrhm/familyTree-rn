import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Input from "./Input";
import BarCodeModal from "./BarCodeModal";
import InputIcon from "./InputIcon";
import Button from "../UI/Button";
import { Colors } from "../../constants/styles";
// import { GlobalStyles } from "../../constants/styles";

function ItemForm({ onSubmit, submitButtonLabel, onCancel, defaultValues }) {
  const [modalVisible, setModalVisible] = useState(false);

  const [inputs, setInputs] = useState({
    name: {
      value: defaultValues ? defaultValues.name.toString() : "",
      isValid: true,
    },
    barcode: {
      value: defaultValues ?  defaultValues.barcode : "",
      isValid: true,
    },
    dateStart: {
      value: defaultValues ? getFormattedDate(defaultValues.dateStart) : "",
      isValid: true,
    },
    dateEnd: {
      value: defaultValues ? getFormattedDate(defaultValues.dateEnd) : "",
      isValid: true,
    },
  });

  function inputChangedHandler(inputIdentifier, enteredValue) {
    setInputs((curInputs) => {
      return {
        ...curInputs,
        [inputIdentifier]: { value: enteredValue, isValid: true },
      };
    });
  }

  function submitHandler() {
    const formData = {
      name: inputs.name.value,
      dateStart: new Date(inputs.dateStart.value),
      dateEnd: new Date(inputs.dateEnd.value),
      barcode: inputs.barcode.value,
    };

    const dateStartIsValid = formData.dateStart.toString() !== "Invalid Date";
    const dateEndIsValid = formData.dateEnd.toString() !== "Invalid Date";
    const namesIsValid = formData.name.trim().length > 0;
    const barcodeIsValid = formData.barcode.trim().length > 0;
    console.log(barcodeIsValid, 'barcodeIsValid')

    if (
      !dateStartIsValid ||
      !dateEndIsValid ||
      !namesIsValid ||
      !barcodeIsValid
    ) {
      // Alert.alert('Invalid input', 'Please check your input values');
      setInputs((curInputs) => {
        return {
          name: { value: curInputs.name.value, isValid: namesIsValid },
          dateStart: {
            value: curInputs.dateStart.value,
            isValid: dateStartIsValid,
          },
          dateEnd: { value: curInputs.dateEnd.value, isValid: dateEndIsValid },
          barcode: {
            value: curInputs.barcode.value,
            isValid: barcodeIsValid,
          },
        };
      });
      return;
    }

    onSubmit(formData);
  }

  const formIsInvalid =
    !inputs.name.isValid ||
    !inputs.dateStart.isValid ||
    !inputs.dateEnd.isValid ||
    !inputs.barcode.isValid;

  function scanBarcode() {
    console.log("barc");
    setModalVisible(true);
    // navigation.navigate('HomeRoutes', { screen: 'ScanScreen' })
  }
  function handleText(inputIdentifier, enteredValue) {
    console.log("text", inputIdentifier, enteredValue);
  }
  return (
    <>
      <View style={styles.form}>
        <Text style={styles.title}>إضافة منتج جديد</Text>
        <View style={styles.inputsRow}>
          <InputIcon
            style={styles.rowInput}
            label="الباركود"
            icon="barcode-scan"
            invalid={!inputs.barcode.isValid}
            textInputConfig={{
              keyboardType: "decimal-pad",
              onChangeText: inputChangedHandler.bind(this, "barcode"),
              value: inputs.barcode.value,
            }}
            onPress={scanBarcode}
          />
          <Input
            style={styles.rowInput}
            label=" الاسم"
            invalid={!inputs.name.isValid}
            textInputConfig={{
              keyboardType: "decimal-pad",
              onChangeText: inputChangedHandler.bind(this, "name"),
              value: inputs.name.value,
            }}
          />
        </View>
        <View style={styles.inputsRow}>
          <Input
            style={styles.rowInput}
            label="تاريخ الفتح"
            invalid={!inputs.dateStart.isValid}
            textInputConfig={{
              placeholder: "YYYY-MM-DD",
              maxLength: 10,
              onChangeText: inputChangedHandler.bind(this, "dateStart"),
              value: inputs.dateStart.value,
            }}
          />
          <Input
            style={styles.rowInput}
            label="تاريخ الانتهاء"
            invalid={!inputs.dateEnd.isValid}
            textInputConfig={{
              placeholder: "YYYY-MM-DD",
              maxLength: 10,
              onChangeText: inputChangedHandler.bind(this, "dateEnd"),
              value: inputs.dateEnd.value,
            }}
          />
        </View>
        {formIsInvalid && (
          <Text style={styles.errorText}>يرجى التأكد من البيانات المدخلة</Text>
        )}
        <View style={styles.buttons}>
          <Button style={styles.button} mode="flat" onPress={onCancel}>
            الغاء
          </Button>
          <Button style={styles.button} onPress={submitHandler}>
            {submitButtonLabel}
            {/* حفظ */}
          </Button>
        </View>
      </View>
      <BarCodeModal
        barcodeText={(text) => inputChangedHandler("barcode", text)}
        visible={modalVisible}
        change={() => {
          setModalVisible(!modalVisible);
        }}
      />
    </>
  );
}

export default ItemForm;

const styles = StyleSheet.create({
  form: {
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.Murrey600,
    marginVertical: 24,
    textAlign: "center",
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowInput: {
    flex: 1,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    margin: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 18,
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8,
  },
});
