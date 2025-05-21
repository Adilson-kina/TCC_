import { useRouter } from 'expo-router';
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
function heightPercent(percentage:number){
  return windowHeight * (percentage / 100);
}

function widthPercent(percentage:number){
  return windowWidth * (percentage / 100);
}

function gotoLogin(){
  const router = useRouter();
  router.navigate("/login");
}

export default function Index() {

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={gotoLogin}>
        <Text> Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button:{
    backgroundColor: "#007912",
    width: widthPercent(12),
    height: heightPercent(4),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 50,
  }
})
