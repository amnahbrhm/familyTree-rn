import { Modal, StyleSheet, Text, Button, View } from "react-native";
import { useState, useEffect } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Colors } from "../../constants/styles";

function BarCodeModal({ visible, change, barcodeText }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("لم يتم المسح الضوئي");

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(data);
    // console.log("Type: " + type + "\nData: " + data);
  };
  function setBarText() {
    barcodeText(text);
    change();
  }

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={change}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>طلب السماح للوصول للكاميرا</Text>
          </View>
        </View>
      </Modal>
    );
  }
  if (hasPermission === false) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={change}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ margin: 10 }}>No access to camera</Text>
            <Button
              title={"السماح للكاميرا"}
              onPress={() => askForCameraPermission}
            />
          </View>
        </View>
      </Modal>
    );
  }
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={change}
    >
      <View style={styles.centeredView}>
        {/* <View style={styles.modalView}> */}
        <View style={styles.barcodebox}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ height: 400, width: 400 }}
          />
        </View>
        <View style={styles.modalView}>
          <Text style={styles.maintext}>{text}</Text>
        </View>
        <View style={styles.buttonsView}>
          <Button title={"الغاء"} onPress={change} color="black" />

          {scanned && (
            <>
              <Button title={"مضبوط"} onPress={setBarText} size={12} color="black" />
              <Button
                title={"امسح مره اخرى"}
                onPress={() => setScanned(false)}
                color="black"
              />
            </>
          )}
        </View>
        {/* </View> */}
      </View>
      {/* <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Hello World!</Text>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={change}
          >
            <Text style={styles.textStyle}>Hide Modal</Text>
          </Pressable>
        </View>
      </View> */}
    </Modal>
  );
}

export default BarCodeModal;
const styles = StyleSheet.create({
  maintext: {
    fontSize: 16,
    color: "white",
    margin: 20,
  },
  barcodebox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    // borderRadius: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "tomato",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    height: 70,
    width: 300,
    // margin: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.Blush300,
    // borderBottomRightRadius: 20,
    // borderBottomLeftRadius: 20,
    // padding: 35,
    // alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
  },
  buttonsView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 300,
    // margin: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.Lavender100,
    borderColor: Colors.Blush300,
    borderWidth: 1,
    // borderStartEndWidth: 1,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
