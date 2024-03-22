import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import usePhoneStore from '../../store/store';

function fileUpload() {

    const ip = usePhoneStore((state) => state.ip);
    const [file, setFile] = useState()
    const [name, setFilename] = useState("")
    async function selectFile() {
        const result = await DocumentPicker.getDocumentAsync();
        if (result.canceled) {
            return
        }
        if (result.assets[0].size > 2000000) {
            Alert.alert("Failure", "Max. File size is 2MB")
            return
        }
        setFilename(result.assets[0].name)
        setFile(result.assets[0])
    }

    async function uploadFile() {

        if (!file) {
            return
        }

        try {
            const id = await AsyncStorage.getItem('user');
            let formData = new FormData();
            formData.append("id", id);

            var data = {
                name: file.name,
                size: file.size,
                uri: file.uri,
                type: file.mimeType
            }
            formData.append("file", data);
            const result = await axios.post(`http://${ip}/upload`, formData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (result.status === 200) {
                Alert.alert("Success", "File uploaded")
                setFile()
                setFilename("")
            }
        } catch (err) {
            console.log(err)
        }

    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ width: "100%", margin: "auto", flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
                <Pressable onPress={selectFile} style={styles.shareBtn}>
                    <Text style={styles.text}>Select File</Text>
                </Pressable>
                {file && <Text>{name}</Text>}
                <Pressable onPress={uploadFile} style={styles.shareBtn}>
                    <Text style={styles.text}>Upload File</Text>
                </Pressable>
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