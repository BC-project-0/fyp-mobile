import React from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import usePhoneStore from '../../store/store';

function fileUpload() {
    const setIP = usePhoneStore((state) => state.setIp);
    const ip = usePhoneStore((state) => state.ip);
    const logout = usePhoneStore((state) => state.logout);

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ width: "100%", margin: "auto", flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
                <TextInput
                    placeholder="Enter Server IP"
                    placeholderTextColor="black"
                    style={styles.inputCtn}
                    value={ip}
                    onChangeText={(value) => setIP(value)}
                />
            </View>
            <Pressable onPress={logout} style={styles.shareBtn}>
                <Text style={styles.text}>Logout</Text>
            </Pressable>
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
        backgroundColor: "#eaeaea",
    },
    shareBtn: {
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
    }
})

export default fileUpload