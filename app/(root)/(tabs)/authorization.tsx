import React, { useState } from 'react';
import { Text, TextInput, View, Image, StyleSheet, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";

const Authorization = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const screenWidth = Dimensions.get('window').width;
    const router = useRouter();

    const handleLogin = () => {
        router.push('/home');
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
                    <Text style={styles.underlineText}>Forgot password?</Text>
                    <TouchableOpacity style={[styles.button, { width: screenWidth - 120 }]} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Log In</Text>
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
        fontFamily: 'Gautami',
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
    underlineText: {
        fontSize: 14,
        fontFamily: 'Gautami',
        textDecorationLine: 'underline',
        marginTop: 20,
        color: '#C1BBBB',
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
        fontFamily: 'Gautami',
    },
});

export default Authorization;