import { SafeAreaView, StyleSheet, Text, View, TextInput, Pressable, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { authenticateAsync, hasHardwareAsync } from "expo-local-authentication"
import * as SecureStore from "expo-secure-store"
import usePhoneStore from "../../store/store";

const login = () => {
    const router = useRouter();
    const login = usePhoneStore(state => state.login);
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('isAccAvailable');
            if (value === null) {
                router.push("/register")
            }
        } catch (err) {
            console.log(err)
        }
    }

    const [id, setID] = useState("");
    const [password, setPassword] = useState("");

    const loginManual = async () => {

        const user = await AsyncStorage.getItem('user');
        if (user === null && user === id) {
            Alert.alert("No User found", "Register before logging in")
            return
        }

        const userPasswrod = SecureStore.getItem("password")
        if (userPasswrod !== password) {
            setPassword()
            Alert.alert("Wrong Password", "Enter right password")
            return
        }

        login();
    }

    useEffect(() => {

        const loginWithBiometrics = async () => {
            await getData()
            if (await hasHardwareAsync() === false) {
                return
            }
            const isBioLogin = await AsyncStorage.getItem("BioLogin");
            if (isBioLogin === "false" || isBioLogin === null) {
                return
            }
            const { success, error } = await authenticateAsync({
                disableDeviceFallback: false,
                promptMessage: "Login",
                cancelLabel: "Not now",
                fallbackLabel: "Use Passcode"
            })

            if (success) {
                login();
            }
        }


        loginWithBiometrics()
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShadowVisible: false,
                    headerBackVisible: false,
                    headerTitle: "Login"
                }}
            />
            <View style={{ width: "100%", margin: "auto", flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={styles.textLogin} >Login</Text>
                <TextInput
                    placeholder="ID"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={id}
                    onChangeText={(value) => { setID(value) }}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={password}
                    onChangeText={(value) => { setPassword(value) }}
                    secureTextEntry
                />
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Pressable onPress={loginManual} style={styles.btn}>
                        <Text style={styles.text}>Login</Text>
                    </Pressable>
                    <Pressable onPress={() => { router.push('/register') }} style={styles.btn}>
                        <Text style={styles.text}>Register</Text>
                    </Pressable>
                </View>
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
    textLogin: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center"
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

export default login;