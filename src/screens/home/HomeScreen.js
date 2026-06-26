import PrimaryButton from "../../components/UI/PrimaryButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  Button,
  FlatList,
  Dimensions,
} from "react-native";
import { GeneralStyle, Padding } from "../../constants/styles";
import {
  useLayoutEffect,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";
import AuthContextProvider, { AuthContext } from "../../store/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

function HomeScreen({ navigation }) {
  const authCtx = useContext(AuthContext)
  const [user, setUser] = useState("");
  const _carousel = useRef();

  const data = [
    {
      id: 1,
      title: "حصول الشيخ  محمد محمد المحمد على درجة الدكتوراة ",
      description:
        "لأول كل ملفوظ مفهوم المعنى من الكتاب والسنة سواء كان ظاهرا أو نصا أو مفسرا حقيقة أو مجازا عاما أو خاصا اعتبارا منهم للغالب، لأن عامة ما ورد من صاحب الشرع نصوص، وهذا المعنى هو المراد بالنصوص.",
    },
    {
      id: 2,
      title: "حصول الشيخ  محمد محمد المحمد على درجة الدكتوراة ",
      description:
        "لأول كل ملفوظ مفهوم المعنى من الكتاب والسنة سواء كان ظاهرا أو نصا أو مفسرا حقيقة أو مجازا عاما أو خاصا اعتبارا منهم للغالب، لأن عامة ما ورد من صاحب الشرع نصوص، وهذا المعنى هو المراد بالنصوص.",
    },
    {
      id: 3,
      title: "حصول الشيخ  محمد محمد المحمد على درجة الدكتوراة ",
      description:
        "لأول كل ملفوظ مفهوم المعنى من الكتاب والسنة سواء كان ظاهرا أو نصا أو مفسرا حقيقة أو مجازا عاما أو خاصا اعتبارا منهم للغالب، لأن عامة ما ورد من صاحب الشرع نصوص، وهذا المعنى هو المراد بالنصوص.",
    },
    {
      id: 4,
      title: "حصول الشيخ  محمد محمد المحمد على درجة الدكتوراة ",
      description:
        "لأول كل ملفوظ مفهوم المعنى من الكتاب والسنة سواء كان ظاهرا أو نصا أو مفسرا حقيقة أو مجازا عاما أو خاصا اعتبارا منهم للغالب، لأن عامة ما ورد من صاحب الشرع نصوص، وهذا المعنى هو المراد بالنصوص.",
    },
    {
      id: 5,
      title: "حصول الشيخ  محمد محمد المحمد على درجة الدكتوراة ",
      description:
        "لأول كل ملفوظ مفهوم المعنى من الكتاب والسنة سواء كان ظاهرا أو نصا أو مفسرا حقيقة أو مجازا عاما أو خاصا اعتبارا منهم للغالب، لأن عامة ما ورد من صاحب الشرع نصوص، وهذا المعنى هو المراد بالنصوص.",
    },
  ];
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const windowWidth = Dimensions.get("window").width;
  const itemWidth = windowWidth / 2;
  useEffect(() => {
    async function fetchUser() {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser !== "") setUser(JSON.parse(storedUser));
    }
    fetchUser();
  }, []);
  const _renderItem = ({ item, index }) => {
    return (
      <View style={[styles.newsContiner, { width: itemWidth - 12, marginHorizontal: 6 }]}>
        <View style={{ padding: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{item.title}</Text>
          <Text style={{ marginTop: 20, fontSize: 16 }}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <>
      <View style={styles.headerContiner}>
        <Text style={GeneralStyle.title}></Text>
      </View>
      <View style={styles.contentContiner}>
        <Text>مرحبا {user?.name}</Text>
        <Text>هلا فيك في تطبيق اسرة الدغيشم</Text>
      </View>
      <View
        style={{
          flex: 0.5,
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
        }}
      >
        <FlatList
          ref={_carousel}
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={_renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={itemWidth}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: windowWidth / 4 }}
          onMomentumScrollEnd={(e) =>
            setActiveDotIndex(
              Math.round(e.nativeEvent.contentOffset.x / itemWidth)
            )
          }
        />
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          {data.map((_, i) => (
            <View
              key={i}
              style={{
                width: activeDotIndex === i ? 15 : 10,
                height: 10,
                borderRadius: 5,
                marginHorizontal: 4,
                backgroundColor: activeDotIndex === i ? "#EDCDA8" : "gray",
              }}
            />
          ))}
        </View>
      </View>
      <Button
        title="logut"
        onPress={() => {
          authCtx.logout();
        }}
      ></Button>
    </>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  newsContiner: {
    backgroundColor: "#BA8C7A",
    borderRadius: 20,
  },
});
