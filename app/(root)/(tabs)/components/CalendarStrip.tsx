import React, { useEffect, useRef, useState } from 'react';
import {View, Image, Text, TouchableOpacity, ScrollView, StyleSheet, StyleProp, ImageStyle} from 'react-native';

const CalendarStrip = () => {
    const scrollRef = useRef<ScrollView>(null);

    const today = new Date();
    const [selectedDate, setSelectedDate] = useState(today.toDateString());

    // Створюємо діапазон: -30 днів до +30 днів від сьогодні
    const getDateOffset = (offset: number) => {
        const date = new Date();
        date.setDate(today.getDate() + offset);
        return date;
    };

    const dateRange = Array.from({ length: 61 }, (_, i) => getDateOffset(i - 30));

    // Вираховуємо індекс вчорашнього дня
    const yesterdayIndex = 29;

    // Після рендеру — скролимо точно до вчора
    useEffect(() => {
        setTimeout(() => {
            const scrollX = yesterdayIndex * 75; // ширина одного елементу
            scrollRef.current?.scrollTo({ x: scrollX, animated: false });
        }, 100);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.todayText}>Today</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Image source={require('../../../../assets/images/icon-plus.png')} style={styles.iconImage as StyleProp<ImageStyle>} />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.monthButton}>
                        <Text style={styles.monthButtonText}>All month</Text>
                    </TouchableOpacity>
                </View>

            </View>

            <View style={styles.scrollWrapper}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {dateRange.map((date, index) => {
                    const isSelected = selectedDate === date.toDateString();
                    const day = date.getDate();
                    const month = date.toLocaleString('default', { month: 'long' });

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayButton,
                                isSelected && styles.selectedDayButton,
                                !isSelected && { marginRight: 4 }, // менший відступ
                            ]}
                            onPress={() => setSelectedDate(date.toDateString())}
                        >
                            <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                                {isSelected ? `${month} ${day}` : `${day}`}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

            </ScrollView>
            </View>
            <View style={styles.bottomLine} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FEFBF6',
        paddingHorizontal: 16,
        paddingVertical: 0,
        marginTop: -405,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    todayText: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Bropella',
        marginBottom: 7,
        marginLeft: 15,
    },
    monthButton: {
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: 8,
        paddingHorizontal: 15,
        shadowColor: '#1A1A1C',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        marginBottom: 15,
        marginRight: 15,
    },
    monthButtonText: {
        fontSize: 14,
        color: '#1A1A1C',
    },
    scrollContent: {
        paddingHorizontal: 4,
        paddingVertical: 0,
    },
    scrollView: {
        height: 50,
        flexShrink: 1,
    },
    dayButton: {
        marginRight: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: 'transparent',
        minWidth: 70,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    selectedDayButton: {
        backgroundColor: '#1A1A1C',
    },
    dayText: {
        color: '#AAA',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    selectedDayText: {
        color: '#fff',
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // або використовуй marginRight у кнопках для підтримки React Native <0.71
    },
    iconButton: {
        padding: 6,
        marginRight: 125,
        marginBottom: 12,
    },
    iconImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    bottomLine: {
        height: 1,
        backgroundColor: '#E2E2E2',
        marginTop: 12,

        // Тінь для iOS
        shadowColor: '#C1BBBB',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1.5,

        // Тінь для Android
        elevation: 2,
    },
    scrollWrapper: {
        height: 50,
        justifyContent: 'center',
    },
});

export default CalendarStrip;
