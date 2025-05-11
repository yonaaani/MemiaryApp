import { View, Text, TextInput, ActivityIndicator, Image, ImageStyle, TouchableOpacity, StyleProp, StyleSheet, FlatList, Dimensions, Animated, Easing } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { useUser } from "@/app/(root)/prooperties/UserContext";
import { collection, query, where, getDocs, Timestamp, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from "@/app/(root)/prooperties/firebaseConfig";
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

interface Diary {
    id: string;
    coverPhoto: string;
    createdAt: string;
    lastUpdated: string;
    pageCount: number;
    title: string;
    userId: string;
}
const Home = () => {
    const { user } = useUser()
    const router = useRouter();

    const [diaries, setDiaries] = useState<Diary[]>([]);

    const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(null); // Зберігаємо id вибраного щоденника

    const [isEditing, setIsEditing] = useState(false);
    const editPanelAnim = useRef(new Animated.Value(height)).current;
    const [editedTitle, setEditedTitle] = useState<string>('');

    const [isSearching, setIsSearching] = useState(false);
    const searchPanelAnim = useRef(new Animated.Value(height)).current;

    const [searchText, setSearchText] = useState('');
    const [filteredJournals, setFilteredJournals] = useState<Diary[]>([]);

    const [fontsLoaded] = useFonts({
        Bropella: require('../../../assets/fonts/Bropella.ttf'),
    });

    useEffect(() => {
        const loadFonts = async () => {
            try {
                if (fontsLoaded) {
                    await SplashScreen.hideAsync();
                } else {
                    await SplashScreen.preventAutoHideAsync();
                }
            } catch (error) {
                console.error("Error hiding splash screen:", error);
            }
        };

        loadFonts();
    }, [fontsLoaded]);



    console.log("Diaries:", diaries);

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.id) {
                console.log('User is not authenticated or id is missing');
                return;
            }
            await fetchDiaries();
        };
        fetchData();
    }, [user]);

    // Встановлюємо дефолтний вибраний щоденник
    useEffect(() => {
        if (diaries && diaries.length > 0 && selectedDiaryId === null) {
            setSelectedDiaryId(diaries[0].id);
        }
    }, [diaries]);

    // ПЕРЕВІРКА ЩОДЕННИКІВ ПО КОРИСТУВАЧУ
    const fetchDiaries = async () => {
        if (!user?.id) {
            console.log('User is not authenticated');
            return;
        }

        const diariesRef = collection(db, 'journals');
        const q = query(diariesRef, where('userId', '==', user.id));

        try {
            const querySnapshot = await getDocs(q);
            console.log('Query Snapshot:', querySnapshot); // Додаємо лог для перевірки

            const diaries: Diary[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const createdAt: string = data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toLocaleString()
                    : '';

                return {
                    id: doc.id,
                    coverPhoto: data.coverPhoto || '',
                    createdAt: createdAt,
                    pageCount: data.pageCount,
                    title: data.title,
                    userId: data.userId,
                } as Diary;
            });

            console.log('Diaries fetched:', diaries); // Перевірте, чи повертаються щоденники

            const validDiaries = diaries.filter(diary => diary.id);
            setDiaries(validDiaries);  // Оновлюємо стан
        } catch (error) {
            console.error('Error getting diaries: ', error);
        }
    };

    // ДОДАТИ ЩОДЕННИК
    const addDiary = async () => {
        if (!user || !user.id) {
            console.log('User is not authenticated');
            return;
        }

        const newDiary = {
            coverPhoto: 'https://res.cloudinary.com/dgr5xbssw/image/upload/v1744041900/diary-cover_hajbkl.png',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            pageCount: 0,
            title: `Diary ${diaries.length + 1}`,
            userId: user.id,
        };

        try {
            const docRef = await addDoc(collection(db, 'journals'), newDiary);
            console.log('New diary added with ID: ', docRef.id);

            setDiaries(prevDiaries => [
                ...prevDiaries,
                { ...newDiary, id: docRef.id }
            ]);
        } catch (error) {
            console.error('Error adding diary: ', error);
        }
    };

    // ЗМІНИТИ НАЗВУ ЩОДЕННИКА
    const updateDiaryTitle = async (id: string, newTitle: string) => {
        const diaryRef = doc(db, 'journals', id);

        try {
            await updateDoc(diaryRef, {
                title: newTitle,
                lastUpdated: new Date().toISOString()
            });

            setDiaries(prev =>
                prev.map(d =>
                    d.id === id ? { ...d, title: newTitle, lastUpdated: new Date().toISOString() } : d
                )
            );

            console.log('Diary title updated!');
        } catch (error) {
            console.error('Failed to update diary title:', error);
        }
    };


    // ДОДАВАННЯ ДУМКИ (опісля оновлення стану, коли останній раз користувач робив запис в щоденнику)
    /*const addNote = async (journalId: string, title: string, content: string) => {
        console.log("Adding note to Journal ID:", journalId);

        const journalRef = doc(db, 'journals', journalId);
        const thoughtsRef = collection(db, 'thoughts');

        try {
            // Додаємо запис до колекції `thoughts`
            const newNote = {
                title: title,
                content: content,
                createdAt: Timestamp.now(),
                journalId: journalId
            };

            const noteDocRef = await addDoc(thoughtsRef, newNote);
            console.log("Note added with ID:", noteDocRef.id);

            // Оновлюємо поле `lastUpdated` у відповідному щоденнику
            await updateDoc(journalRef, {
                lastUpdated: Timestamp.now()
            });

            // Оновлюємо стан для локального рендерингу
            setDiaries(prevDiaries =>
                prevDiaries.map(diary =>
                    diary.id === journalId
                        ? { ...diary, lastUpdated: new Date().toISOString() }
                        : diary
                )
            );

        } catch (error) {
            console.error("Error adding note or updating lastUpdated:", error);
        }
    };*/

    const editDiary = (id: string) => {
        console.log("Editing diary with id:", id);
        setSelectedDiaryId(id);
        // Додайте вашу логіку редагування
    };

    // ВИДАЛЕННЯ ЩОДЕННИКА
    const deleteDiary = async () => {
        if (!selectedDiaryId) {
            alert('Будь ласка, виберіть щоденник для видалення');
            return;
        }

        try {
            // Видаляємо щоденник з Firebase
            await deleteDoc(doc(db, 'journals', selectedDiaryId));

            // Оновлюємо список щоденників локально, видаляючи вибраний
            const updatedDiaries = diaries.filter(diary => diary.id !== selectedDiaryId);
            setDiaries(updatedDiaries);

            // Скидаємо вибір щоденника
            setSelectedDiaryId(null);

            // Повідомлення про успіх
            console.log('Успіх', 'Щоденник успішно видалено');
        } catch (error) {
            console.error('Error deleting diary: ', error);
            console.log('Помилка', 'Не вдалося видалити щоденник');
        }
    };

    const uploadDiary = () => {
        console.log("Uploading diary...");
        // Додайте вашу логіку завантаження
    };

    const otherAction = () => {
        console.log("Other action triggered...");
        // Додайте вашу логіку для іншої кнопки
    };

    const openEditPanel = (id: string) => {
        const diary = diaries.find(d => d.id === id);
        setEditedTitle(diary?.title || '');
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
        if (selectedDiaryId) {
            const currentDiary = diaries.find(d => d.id === selectedDiaryId);
            if (currentDiary && editedTitle !== currentDiary.title) {
                updateDiaryTitle(selectedDiaryId, editedTitle);
            }
        }

        Animated.timing(editPanelAnim, {
            toValue: height,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            setIsEditing(false);
            setEditedTitle('');
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

    const handleSearchTextChange = (text: string) => {
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

    // Прорахування часу, як за давно user останній раз додавав запис в щоденник
    const timeAgo = (timestamp: string | number | Date | null | undefined): string => {
        if (!timestamp) return "Never"; // Якщо немає дати

        const now: Date = new Date();
        const past: Date = new Date(timestamp);

        if (isNaN(past.getTime())) return "Invalid date"; // Перевірка на коректність дати

        let diff: number = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diff < 0) {
            return "Just now"; // Якщо дата в майбутньому
        }

        const timeIntervals: { label: string; seconds: number }[] = [
            { label: "year", seconds: 31536000 },
            { label: "month", seconds: 2592000 },
            { label: "week", seconds: 604800 },
            { label: "day", seconds: 86400 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 },
            { label: "second", seconds: 1 }
        ];

        for (let interval of timeIntervals) {
            const count: number = Math.floor(diff / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return "Just now";
    };

    const goToDiaryPage = (id: string) => {
        router.push(`/diary?id=${id}`);


    };



    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity style={styles.leftButton}>
                    <Image source={require('../../../assets/images/button-store.png')} style={styles.buttonImage as StyleProp<ImageStyle>} />
                </TouchableOpacity>
                {diaries.length != 0 && (
                    <TouchableOpacity style={styles.searchButton} onPress={openSearchPanel}>
                        <Image source={require('../../../assets/images/button-search.png')} style={styles.buttonImage as StyleProp<ImageStyle>} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.rightButton}>
                    <Image source={require('../../../assets/images/button-settings.png')} style={styles.buttonImage as StyleProp<ImageStyle>} />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
                {diaries.length === 0 ? (
                    <>
                        <Text style={styles.text}>Hi there,             let’s start!</Text>
                        <TouchableOpacity style={styles.bottomAdd} onPress={addDiary}>
                            <Image source={require('../../../assets/images/button-add.png')} style={styles.buttonImageAdd as StyleProp<ImageStyle>} />
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
                                    activeOpacity={1} // Вибір елемента для відображення кнопок
                                >
                                    <View style={styles.diaryItemText}>
                                        {isEditing && selectedDiaryId === item.id ? (
                                            // Режим редагування: заміняємо Text на TextInput
                                            <View style={styles.editInputContainer}>
                                            <TextInput
                                                style={styles.editTitleInput}
                                                value={editedTitle}
                                                onChangeText={(text) => setEditedTitle(text)}
                                            />
                                                <TouchableOpacity onPress={closeEditPanel} style={styles.closeInputIcon}>
                                                    <Image source={require('../../../assets/images/close-edit.png')} style={styles.closeIcon as StyleProp<ImageStyle>} />
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                        <Text style={styles.diaryTitle}>{item.title}</Text>
                                        )}
                                        {/* Не показуємо diaryPagesContainer, коли ми редагуємо */}
                                        {!isEditing && (
                                            <View style={styles.diaryPagesContainer}>
                                                <Image source={require('../../../assets/images/check-image.png')} style={styles.diaryIcon as StyleProp<ImageStyle>} />
                                                <Text style={styles.diaryPages}>{item.pageCount}</Text>
                                                <Text style={styles.diaryPagesText}> notes</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.diaryCoverContainer}>
                                        <TouchableOpacity onPress={() => goToDiaryPage(item.id)}>
                                            <Image
                                            source={{ uri: item.coverPhoto }}
                                            style={styles.coverImage1 as StyleProp<ImageStyle>}
                                            />
                                        </TouchableOpacity>
                                        {selectedDiaryId === item.id && (
                                            <TouchableOpacity
                                                style={styles.editButtonCover}
                                                onPress={() => openEditPanel(item.id)}
                                            >
                                                <Image source={require('../../../assets/images/edit-icon.png')} style={styles.editDiaryIcon as StyleProp<ImageStyle>} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                </TouchableOpacity>
                            )}
                            onMomentumScrollEnd={(event) => {
                                const offsetX = event.nativeEvent.contentOffset.x;
                                const index = Math.round(offsetX / width);
                                const currentDiary = diaries[index];
                                if (currentDiary) {
                                    setSelectedDiaryId(currentDiary.id);
                                }
                            }}
                        />

                        {/* Нижня панель з кнопками */}
                        {selectedDiaryId !== null && (
                            <View style={styles.editButtonsContainer}>
                                <TouchableOpacity onPress={otherAction} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-other.png')} style={styles.editIcon as StyleProp<ImageStyle>} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={uploadDiary} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-upload.png')} style={styles.editIcon as StyleProp<ImageStyle>} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={deleteDiary} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-delete.png')} style={styles.editIcon as StyleProp<ImageStyle>} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={addDiary} style={styles.editButton}>
                                    <Image source={require('../../../assets/images/button-edit.png')} style={styles.editIcon as StyleProp<ImageStyle>} />
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
                                            style={styles.closeIcon as StyleProp<ImageStyle>}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Перша опція - Change cover */}
                                <TouchableOpacity style={styles.optionButton} onPress={() => console.log('Change cover pressed')}>
                                    <Image
                                        source={require('../../../assets/images/change-cover.png')}
                                        style={styles.optionIcon as StyleProp<ImageStyle>}
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
                                            style={styles.closeIcon as StyleProp<ImageStyle>}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Інпут для пошуку */}
                                <View style={styles.searchInputContainer}>
                                    <Image
                                        source={require('../../../assets/images/search-icon.png')}
                                        style={styles.searchIcon as StyleProp<ImageStyle>}
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
                                            <Image
                                                source={{ uri: item.coverPhoto }}
                                                style={styles.coverImage as StyleProp<ImageStyle>}
                                            />

                                            <View style={styles.textContainer}>
                                                <Text style={styles.titleText}>{item.title}</Text>
                                                <Text style={styles.pagesText}>{item.pageCount} pages / {timeAgo(item.lastUpdated)} </Text>
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
        paddingVertical: 0,
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
        right: 30,
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
        alignItems: 'flex-start',
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 10
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
        marginTop: 12,

    },
    coverImage: {
        width: 30,
        height: 45,
        marginRight: 20,
        marginLeft: 7,
    },
    coverImage1: {
        width: 200,
        height: 300,
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
