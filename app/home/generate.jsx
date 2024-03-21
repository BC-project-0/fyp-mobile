import { useEffect, useState } from "react"
import usePhoneStore from "../../store/store"
import { useRouter } from "expo-router"
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as SecureStore from "expo-secure-store"
import * as FileSystem from "expo-file-system"
import * as Sharing from 'expo-sharing'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { comput_commitment, generate_signature } from "../../utils/crypto"
import { pem, pubKey } from "../../utils/temp";
import axios from "axios";
import { Picker } from "@react-native-picker/picker"

const Home = () => {

    const router = useRouter();
    const isLoggedIn = usePhoneStore((state) => state.isLoggedIn);
    const ip = usePhoneStore((state) => state.ip)
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState("")

    const [isOTPGenerated, setIsOTPGenerated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [id, setID] = useState(0)

    useEffect(() => {
        if (isLoggedIn === false) {
            router.replace("/(auth)/login")
        }
    }, [])

    useEffect(() => {
        const loadFiles = async () => {
            const unique_id = await AsyncStorage.getItem("user")
            axios.get(`http://${ip}/${unique_id}/files`)
                .then((data) => {
                    setFiles(data.data)
                })
                .catch((err) => {
                    console.log(err);
                    setFiles([])
                })
        }
        loadFiles();
    }, [ip])

    async function generateOTP() {

        setIsOTPGenerated(false);
        setIsLoading(true);

        const id = await AsyncStorage.getItem("user");
        const i = await SecureStore.getItemAsync("counter");
        const password = await SecureStore.getItemAsync("password");
        // const sk = SecureStore.getItemAsync("privateKey");
        // const pk = SecureStore.getItemAsync("publicKey");

        if (!id || !i || !password || !selectedFile) {
            Alert.alert("Failure", "Failed to load values");
            isLoading(false);
            return;
        }

        const index = parseInt(i);
        const commitment1 = comput_commitment(id, index, password, pem);
        const commitment2 = comput_commitment(id, index + 1, password, pem);
        const signature = generate_signature(id, commitment1, commitment2, i, pem);


        let json = {}
        json["id"] = id;
        json["xi"] = commitment1;
        json["yi"] = commitment2;
        json["i"] = index;
        json["signature"] = signature;
        json["pk"] = pubKey;
        json["file"] = selectedFile

        console.log(selectedFile)

        const jsonString = JSON.stringify(json);

        const newIndex = index + 1;
        await SecureStore.setItemAsync("counter", newIndex.toString())

        // Save to a temporary file
        const tempFilePath = FileSystem.documentDirectory + "FYP.txt";
        await FileSystem.writeAsStringAsync(tempFilePath, jsonString, { encoding: FileSystem.EncodingType.UTF8 });

        setID(index)
        setIsLoading(false);
        setIsOTPGenerated(true);
    }

    async function share() {
        if (isOTPGenerated === false) {
            return
        }

        const result = await Sharing.isAvailableAsync()
        if (result === false) {
            Alert.alert("Failure", "Cannot Share");
        }

        const tempFilePath = FileSystem.documentDirectory + "FYP.txt";
        Sharing.shareAsync(tempFilePath)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ width: "100%", margin: "auto", flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
                <Pressable onPress={generateOTP} style={styles.generateBtn} disabled={isLoading}>
                    {!isLoading
                        ? (<Text style={styles.text}>Generate OTP</Text>)
                        : (<ActivityIndicator color={"#FFFFFF"} size={"small"} />)
                    }
                </Pressable>
                <Picker
                    selectedValue={selectedFile}
                    onValueChange={(itemValue, index) => setSelectedFile(itemValue)}
                    style={styles.select}
                >
                    {files.map((data, index) => (
                        <Picker.Item label={data} value={data} key={index} />
                    ))}
                </Picker>
                {isOTPGenerated && !isLoading && (
                    <View >
                        <Text>New OTP Generated. ID - {id}</Text>
                        <Pressable onPress={share} style={styles.shareBtn}>
                            <Text style={styles.text}>Share OTP</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({
    container: {
        fontSize: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: 24,
        backgroundColor: "#eaeaea"
    },
    viewContainer: {

    },
    generateBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: '#3586cf',
        minWidth: 150
    }
    , shareBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'black',
        minWidth: 150
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    inputCtn: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderColor: "black",
        margin: "auto",
        height: 50,
        width: "75%",
        borderWidth: 2,
        marginVertical: 5,
        borderRadius: 5
    },
    select: {
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderColor: "black",
        margin: "auto",
        height: 50,
        width: "75%",
        borderWidth: 2,
        marginVertical: 5,
        borderRadius: 5
    }
})

export default Home