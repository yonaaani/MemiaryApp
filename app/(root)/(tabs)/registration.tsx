import React, { useState } from 'react';
import { Text, TextInput, View, Image, StyleSheet, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/(root)/prooperties/firebaseConfig";
import {Alert} from "react-native";

const Registration = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstname] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const screenWidth = Dimensions.get('window').width;
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !firstName || !surname) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Додаємо користувача у Firestore
            await setDoc(doc(db, "Users", user.uid), {
                firstName,
                surname,
                email
            });

            Alert.alert("Success", "Account created successfully");
            router.push('/home');
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }
            Alert.alert("Registration Failed", errorMessage);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <Image
                        source={require('../../../assets/images/logo-png.png')}
                        style={styles.image}
                    />
                    <View style={[styles.inputContainer, { width: screenWidth - 120 }]}>
                        <Image
                            source={require('../../../assets/images/email.png')}
                            style={styles.icon_email}
                        />
                        <TextInput
                            style={[styles.input, { width: screenWidth - 205 }]}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                    <View style={[styles.inputContainer, { width: screenWidth - 120 }]}>
                        <Image
                            source={require('../../../assets/images/firstname.png')}
                            style={styles.icon_email}
                        />
                        <TextInput
                            style={[styles.input, { width: screenWidth - 50 }]}
                            placeholder="Firstname"
                            value={firstName}
                            onChangeText={setFirstname}
                        />
                    </View>
                    <View style={[styles.inputContainer, { width: screenWidth - 120 }]}>
                        <Image
                            source={require('../../../assets/images/surname.png')}
                            style={styles.icon_email}
                        />
                        <TextInput
                            style={[styles.input, { width: screenWidth - 50 }]}
                            placeholder="Surname"
                            value={surname}
                            onChangeText={setSurname}
                        />
                    </View>
                    <View style={[styles.inputContainer, { width: screenWidth - 120 }]}>
                        <Image
                            source={require('../../../assets/images/password.png')}
                            style={styles.icon_email}
                        />
                        <TextInput
                            style={[styles.input, { width: screenWidth - 205 }]}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                    </View>
                    <TouchableOpacity style={[styles.button, { width: screenWidth - 120 }]} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFBF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 85,
    },
    image: {
        width: 170,
        height: 170,
        resizeMode: 'cover',
        marginBottom: 50,
    },
    input: {
        height: 55,
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 55,
        borderColor: '#C1BBBB',
        borderWidth: 0.5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginBottom: 10,
        backgroundColor: 'white',
    },
    icon_email: {
        width: 30,
        height: 30,
        marginRight: 15,
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#1A1A1C',
        padding: 15,
        borderRadius: 22,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default Registration;