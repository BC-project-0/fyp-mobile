import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, SafeAreaView, View, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticateAsync } from "expo-local-authentication"
import * as SecureStore from "expo-secure-store"
import usePhoneStore from "../../store/store"
import { pem, pubKey } from "../../utils/temp";
import { comput_commitment, generate_initial_signature } from "../../utils/crypto";
import axios from "axios";

const register = () => {

    const router = useRouter()
    const login = usePhoneStore((state) => state.login)

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [ip, setIP] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const save = async () => {

        setIsLoading(true);
        const { success, _error } = await authenticateAsync({
            disableDeviceFallback: false,
            promptMessage: "Enable biometrics login",
            cancelLabel: "Not now",
            fallbackLabel: "Use Passcode"
        })

        if (success) {
            AsyncStorage.setItem("BioLogin", "true")
        } else {
            AsyncStorage.setItem("BioLogin", "false")
        }

        const keys = { private: pem, public: pubKey }

        // SecureStore.setItemAsync(
        //     "privateKey",
        //     keys.private
        // )
        // SecureStore.setItemAsync(
        //     "publicKey",
        //     keys.public,
        // )

        // Register in the blockchain
        // Add IP checking
        if (ip === "") {
            Alert.alert("Wrong IP");
            return
        }

        const commitmentValue = comput_commitment(name, 1, password, keys.private)
        const signature = generate_initial_signature(keys.private, name, commitmentValue)

        axios.post(`http://${ip}/register`, {
            id: name,
            commitment_value: commitmentValue,
            public_key: keys.public,
            signature: signature
        }).then((data) => {
            if (data.data["message"] === "User Registered") {
                SecureStore.setItemAsync("counter", "1");
                SecureStore.setItemAsync("password", password)
                AsyncStorage.setItem("user", name)
                AsyncStorage.setItem("isAccAvailable", "true");
                setIsLoading(false);
                Alert.alert("Succes", "Registered");
                login()
            }
        }).catch(err => {
            console.log(err);
        })
        setIsLoading(false);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#eaeaea' }}>
            <Stack.Screen
                options={{
                    headerShadowVisible: false,
                    headerBackVisible: false,
                    headerTitle: "Register"
                }}
            />
            <View style={styles.container}>
                <TextInput
                    placeholder="Name"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={name}
                    onChangeText={(value) => setName(value)}
                />
                <TextInput
                    secureTextEntry
                    placeholder="Password"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={password}
                    onChangeText={(value) => setPassword(value)}

                />
                <TextInput
                    secureTextEntry
                    placeholder="Confirm Password"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={confirmPassword}
                    onChangeText={(value) => setConfirmPassword(value)}
                />
                <TextInput
                    placeholder="Server IP"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={ip}
                    onChangeText={(value) => setIP(value)}
                />
                <View
                    style={{ display: "flex", flexDirection: "row", gap: 2 }}
                >
                    {isLoading
                        ? (<ActivityIndicator color={"#000000"} size={"small"} />)
                        : (<>
                            <Pressable onPress={() => router.back()} style={styles.btn}>
                                <Text style={styles.text}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={save} style={styles.btn}>
                                <Text style={styles.text}>Save</Text>
                            </Pressable>
                        </>)
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 5
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
    btn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: 'black',
        minWidth: 140
    },
    text: {
        fontSize: 16,
        letterSpacing: 0.25,
        color: 'white',
    }
})

export default register;