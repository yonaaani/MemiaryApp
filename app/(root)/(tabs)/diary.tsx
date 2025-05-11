import { useLocalSearchParams } from 'expo-router';
import {View, Text, StyleSheet, TouchableOpacity, Image, StyleProp, ImageStyle, Dimensions} from 'react-native';
import React from "react";
import CalendarStrip from "@/app/(root)/(tabs)/components/CalendarStrip";

const { height } = Dimensions.get('window');

const Diary = () => {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity style={styles.leftButton}>
                    <Image source={require('../../../assets/images/button-store.png')} style={styles.buttonImage as StyleProp<ImageStyle>} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rightButton}>
                    <Image source={require('../../../assets/images/button-settings.png')} style={styles.buttonImage as StyleProp<ImageStyle>} />
                </TouchableOpacity>
            </View>
            <View style={styles.bottomContainer}>
                <CalendarStrip />
                <Text>Закінчений календар</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFBF6',
        justifyContent: 'center',
    },
    topContainer: {
        height: '8%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    leftButton: {
        position: 'absolute',
        left: 30,
        top: 20,
    },
    rightButton: {
        position: 'absolute',
        right: 30,
        top: 20,
    },
    buttonImage: {
        width: 40,
        height: 40,
    },
    bottomContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
});

export default Diary;
