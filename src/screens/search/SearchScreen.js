import PrimaryButton from "../../components/UI/PrimaryButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, StyleSheet } from "react-native";
import { GeneralStyle, Padding } from "../../constants/styles";
import { useLayoutEffect } from "react";
function SearchScreen({ navigation }) {
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => {
  //       return (
  //         <PrimaryButton onPress={openFormModal} style={{width: 60}}>
  //           <View style={styles.buttonTitleContiner}>
  //             {/* <Text style={styles.buttonTitleText}>منتج جديد</Text> */}
  //             <Ionicons name="add-circle-outline" size={22} color="#7B1941" />
  //           </View>
  //         </PrimaryButton>
  //       );
  //     },
  //   });
  // }, []);
  // function openFormModal() {
  //   navigation.navigate('HomeRoutes', { screen: 'AddItemScreen' })
  //   // console.log("open modal");
  // }
  return (
    <>
      <View style={styles.headerContiner}>
        <Text style={GeneralStyle.title}>البحث  </Text>
      </View>
      <View style={styles.contentContiner}>
        <Text> البحث هنا :) </Text>
      </View>
    </>
  );
}

export default SearchScreen;

const styles = StyleSheet.create({
  // contentContiner: {
  //   flex: 6
  // },
  headerContiner: {
    alignItems: "center",
    justifyContent: "center",
    // padding: Padding.md,
  },
  buttonTitleContiner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // padding: 3
  },
  buttonTitleText: {
    fontSize: 22,
    color: "white",
    // paddingHorizontal: Padding.sm
  },
});
