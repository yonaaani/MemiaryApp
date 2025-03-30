import { View, Text, TextInput, ActivityIndicator, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, Animated, Easing } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter  } from "expo-router";
import { useUser } from "@/app/(root)/prooperties/UserContext";
import { collection, query, where, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { auth, db } from "@/app/(root)/prooperties/firebaseConfig";

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

interface Diary {
    coverPhoto: string;
    createdAt: string;
    pageCount: number;
    title: string;
    userId: string;
}
const Home = () => {
    const router = useRouter();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);


    const [diaries, setDiaries] = useState<Diary[]>([]);


    const [selectedDiaryId, setSelectedDiaryId] = useState(null);  // Зберігаємо id вибраного щоденника

    const [isEditing, setIsEditing] = useState(false);
    const editPanelAnim = useRef(new Animated.Value(height)).current;

    const [isSearching, setIsSearching] = useState(false);
    const searchPanelAnim = useRef(new Animated.Value(height)).current;

    const [searchText, setSearchText] = useState('');
    const [filteredJournals, setFilteredJournals] = useState([]);

    const [fontsLoaded] = useFonts({
        'Bropella': require('../../../assets/fonts/Bropella.ttf'),
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    if (loading) {
        return (
            <View>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // ПЕРЕВІРКА ЩОДЕННИКІВ ПО КОРИСТУВАЧУ
    const fetchDiaries = async () => {
        if (!user || !user.id) {
            console.log('User is not authenticated');
            return;
        }

        const diariesRef = collection(db, 'journals');
        const q = query(diariesRef, where('userId', '==', user.id));

        try {
            const querySnapshot = await getDocs(q);
            const diaries: Diary[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                // Перетворюємо Timestamp на строку
                const createdAt: string = data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toLocaleString()
                    : '';
                return {
                    coverPhoto: data.coverPhoto || '',
                    createdAt: createdAt,
                    pageCount: data.pageCount,
                    title: data.title,
                    userId: data.userId,
                } as Diary;
            });
            setDiaries(diaries);
        } catch (error) {
            console.error('Error getting diaries: ', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // Очікуємо на завершення запитів до Firebase
            await fetchDiaries();
            setLoading(false); // Після цього завершуємо завантаження
        };

        fetchData();
    }, [user]); // Перезапускати, коли змінюється користувач


    // ДОДАТИ ЩОДЕННИК
    const addDiary = async () => {
        // Перевірка на наявність користувача
        if (!user || !user.id) {
            console.log('User is not authenticated');
            return;
        }

        const newDiary = {
            coverPhoto: '../../../assets/images/diary-cover.png', // Шлях до зображення обкладинки
            createdAt: new Date().toISOString(), // Поточна дата у форматі ISO
            pageCount: 0, // Початкова кількість сторінок
            title: `Diary ${diaries.length + 1}`, // Назва щоденника
            userId: user.id, // Ідентифікатор користувача
        };

        try {
            const docRef = await addDoc(collection(db, 'journals'), newDiary); // Додаємо щоденник в Firestore
            console.log('New diary added with ID: ', docRef.id);

            // Оновлюємо локальний state, додаючи новий щоденник з ID, який генерується Firestore
            setDiaries(prevDiaries => [
                ...prevDiaries,
                { ...newDiary, id: docRef.id } // Додаємо новий щоденник з генерованим ID
            ]);
        } catch (error) {
            console.error('Error adding diary: ', error);
        }
    };



    const addNote = (id) => {
        console.log("Editing note with Diary id:", id);
        setSelectedDiaryId(id);
        // Додайте вашу логіку редагування
    };

    const editDiary = (id) => {
        console.log("Editing diary with id:", id);
        setSelectedDiaryId(id);
        // Додайте вашу логіку редагування
    };

    const deleteDiary = (id) => {
        console.log("Deleting diary with id:", id);
        setDiaries(diaries.filter(diary => diary.id !== id));
        setSelectedDiaryId(null); // Скидаємо вибір після видалення
    };

    const uploadDiary = () => {
        console.log("Uploading diary...");
        // Додайте вашу логіку завантаження
    };

    const otherAction = () => {
        console.log("Other action triggered...");
        // Додайте вашу логіку для іншої кнопки
    };

    const openEditPanel = (id) => {
        setSelectedDiaryId(id);
        setIsEditing(true);
        Animated.timing(editPanelAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeEditPanel = () => {
        Animated.timing(editPanelAnim, {
            toValue: height, // Опускаємо панель вниз
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsEditing(false);
        });
    };

    const openSearchPanel = () => {
        setIsSearching(true);
        Animated.timing(searchPanelAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const closeSearchPanel = () => {
        Animated.timing(searchPanelAnim, {
            toValue: height,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsSearching(false);
        });
    };

    const handleSearchTextChange = (text) => {
        setSearchText(text);
        if (text.trim() === '') {
            // Якщо текст порожній, показуємо всі журнали
            setFilteredJournals([]); // Виводити всі елементи без фільтрації
        } else {
            // Фільтруємо журнали за назвою
            setFilteredJournals(diaries.filter(diary =>
                diary.title.toLowerCase().includes(text.toLowerCase())
            ));
        }
    };

    const timeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date); // Різниця між поточним часом і датою
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const years = Math.floor(days / 365);

        if (years > 0) {
            return `${years}yr ago`;
        } else if (weeks > 0) {
            return `${weeks}wk ago`;
        } else if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return `${seconds}s ago`;
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity style={styles.leftButton}>
                    <Image source={require('../../../assets/images/button-store.png')} style={styles.buttonImage} />
                </TouchableOpacity>
                {diaries.length != 0 && (
                    <TouchableOpacity style={styles.searchButton} onPress={openSearchPanel}>
                        <Image source={require('../../../assets/images/button-search.png')} style={styles.buttonImage} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.rightButton}>
                    <Image source={require('../../../assets/images/button-settings.png')} style={styles.buttonImage} />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
                {diaries.length === 0 ? (
                    <>
                        <Text style={styles.text}>Hi there,             let’s start!</Text>
                        <TouchableOpacity style={styles.bottomAdd} onPress={addDiary}>
                            <Image source={require('../../../assets/images/button-add.png')} style={styles.buttonImageAdd} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <FlatList
                            data={diaries}
                            keyExtractor={(item) => item.id}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContainer}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.diaryItem}
                                    onPress={() => setSelectedDiaryId(item.id)} // Вибір елемента для відображення кнопок
                                >
                                    <View style={styles.diaryItemText}>
                                        {isEditing && selectedDiaryId === item.id ? (
                                            // Режим редагування: заміняємо Text на TextInput
                                            <View style={styles.editInputContainer}>
                                            <TextInput
                                                style={styles.editTitleInput}
                                                value={item.title}
                                                onChangeText={(text) => {
                                                    const updatedDiaries = diaries.map((diary) =>
                                                        diary.id === item.id ? { ...diary, title: text } : diary
                                                    );
                                                    setDiaries(updatedDiaries);
                                                }}
                                            />
                                                <TouchableOpacity onPress={closeEditPanel} style={styles.closeInputIcon}>
                                                    <Image source={require('../../../assets/images/close-edit.png')} style={styles.closeIcon} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                        <Text style={styles.diaryTitle}>{item.title}</Text>
                                        )}
                                        {/* Не показуємо diaryPagesContainer, коли ми редагуємо */}
                                        {!isEditing && (
                                            <View style={styles.diaryPagesContainer}>
                                                <Image source={require('../../../assets/images/check-image.png')} style={styles.diaryIcon} />
                                                <Text style={styles.diaryPages}>{item.pages}</Text>
                                                <Text style={styles.diaryPagesText}> pages</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.diaryCoverContainer}>
                                        <Image source={item.cover} style={styles.diaryCover} />
                                        {selectedDiaryId === item.id && (
                                            <TouchableOpacity
                                                style={styles.editButtonCover}
                                                onPress={() => openEditPanel(item.id)}
                                            >
                                                <Image source={require('../../../assets/images/edit-icon.png')} style={styles.editDiaryIcon} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                </TouchableOpacity>
                            )}
                        />

                        {selectedDiaryId !== null && (
                            <View style={styles.editButtonsContainer}>
                                <TouchableOpacity onPress={otherAction} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-other.png')} style={styles.editIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={uploadDiary} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-upload.png')} style={styles.editIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteDiary(selectedDiaryId)} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-delete.png')} style={styles.editIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => addNote(selectedDiaryId)} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-edit.png')} style={styles.editIcon} />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Анімована панель редагування */}
                        {isEditing && (
                            <Animated.View style={[styles.editPanel, { transform: [{ translateY: editPanelAnim }] }]}>
                                <View style={styles.header}>
                                    <Text style={styles.panelText}>Customize journal</Text>
                                    <TouchableOpacity onPress={closeEditPanel}>
                                        <Image
                                            source={require('../../../assets/images/close-edit.png')} // Замініть шлях на ваш
                                            style={styles.closeIcon}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Перша опція - Change cover */}
                                <TouchableOpacity style={styles.optionButton} onPress={() => console.log('Change cover pressed')}>
                                    <Image
                                        source={require('../../../assets/images/change-cover.png')}
                                        style={styles.optionIcon}
                                    />
                                    <Text style={styles.optionText}>Change cover</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Анімована панель перегляду всіх щоденників */}
                        {isSearching && (
                            <Animated.View style={[styles.searchPanel, { transform: [{ translateY: searchPanelAnim }] }]}>
                                <View style={styles.header}>
                                    <Text style={styles.panelTextSearch}>Your Journals</Text>
                                    <TouchableOpacity onPress={closeSearchPanel}>
                                        <Image
                                            source={require('../../../assets/images/close-edit.png')}
                                            style={styles.closeIcon}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Інпут для пошуку */}
                                <View style={styles.searchInputContainer}>
                                    <Image
                                        source={require('../../../assets/images/search-icon.png')}
                                        style={styles.searchIcon}
                                    />
                                    <TextInput
                                        style={styles.searchInput}
                                        value={searchText}
                                        onChangeText={handleSearchTextChange}
                                    />
                                </View>

                                <View style={styles.allListContainer}>
                                    <Text style={styles.allListText}>ALL LIST</Text>
                                    <View style={styles.separatorLine} />
                                </View>

                                {/* Ліст з щоденниками */}
                                <FlatList
                                    data={filteredJournals.length > 0 || searchText === '' ? filteredJournals.length > 0 ? filteredJournals : diaries : []}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => setSelectedDiaryId(item.id)} style={styles.itemContainer}>
                                            <Image source={item.cover} style={styles.coverImage} />
                                            <View style={styles.textContainer}>
                                                <Text style={styles.titleText}>{item.title}</Text>
                                                <Text style={styles.pagesText}>{item.pages} pages / {timeAgo(item.lastVisited)} </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </Animated.View>
                        )}


                    </>
                )}
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
    searchButton: {
        position: 'absolute',
        top: 20,
        right: 80,
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
    text: {
        fontFamily: 'Bropella',
        fontSize: 45,
        color: "#1A1A1C",
        textAlign: 'center',
    },
    bottomAdd: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonImageAdd: {
        width: 85,
        height: 85,
    },
    carouselContainer: {
        paddingVertical: 20,
    },
    diaryItem: {
        width: width * 1,
        height: '91%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#1A1A1C',
        shadowOpacity: 0.35,
        shadowOffset: { width: 10, height: 15 },
        shadowRadius: 20,
        elevation: 5,
        marginTop: 20,
    },
    diaryItemText: {
        marginBottom: 35,
    },
    diaryCover: {
        width: 222,
        height: 332,
        marginBottom: 10,
    },
    diaryTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1C',
        fontFamily: 'Bropella',
        justifyContent: 'center',
        alignItems: 'center',
    },
    diaryPagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'center',
    },
    diaryIcon: {
        width: 15,
        height: 15,
        marginRight: 7,
    },
    diaryPages: {
        fontSize: 14,
        color: '#C1BBBB',
        fontFamily: 'Bropella',
        marginTop: 5,
    },
    diaryPagesText: {
        color: '#C1BBBB',
        fontSize: 14,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 110,
    },
    editButton: {
        marginHorizontal: 7,
    },
    editIcon: {
        width: 40,
        height: 40,
    },
    editDiaryIcon: {
        width: 35,
        height: 35,
    },
    diaryCoverContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonCover: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    editDiaryIcon: {
        width: 35,
        height: 35,
    },
    editPanel: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '45%',
        backgroundColor: '#1A1A1C',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#E74C3C',
        padding: 10,
        borderRadius: 10,
    },
    panelText: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 85,
        color: 'white',
    },
    panelTextSearch: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 105,
        color: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    closeIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginTop: 20,
    },
    optionIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#fff',
    },
    editInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1C',
        borderRadius: 15,
        width: '60%',
        paddingTop: 12,
    },
    editTitleInput: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'Bropella',
        justifyContent: 'center',
        padding: 5,
        width: '100%',
        textAlign: 'center',
        paddingRight: 25,

    },
    closeInputIcon: {
        position: 'absolute',
        right: 13,
        top: 18,
        marginLeft: 10,
    },
    closeIcon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    },
    searchPanel: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: height * 0.85,
        backgroundColor: '#1A1A1C',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    journalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    journalImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    journalTitle: {
        fontSize: 16,
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#FEFBF6',
    },
    searchResultText: {
        fontSize: 16,
    },
    allListContainer: {
        marginTop: 30,
        alignItems: 'left',
        marginLeft: 5,
        marginRight: 5,
    },
    allListText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#C1BBBB',
    },
    separatorLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#ccc',
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#FEFBF6',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#C1BBBB',
        alignItems: 'center',
        marginTop: 25,

    },
    coverImage: {
        width: 40,
        height: 60,
        marginRight: 20,
        marginLeft: 10,
    },
    textContainer: {
        flexDirection: 'column',
    },
    titleText: {
        fontSize: 20,
        fontFamily: 'Bropella',
        marginTop: 2,
    },
    pagesText: {
        fontSize: 14,
        color: '#777',
    },
    timeText: {
        fontSize: 14,
        color: '#777',
    },
});

export default Home;
