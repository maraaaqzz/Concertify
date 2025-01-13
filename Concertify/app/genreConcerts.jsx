import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../services/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router'; 
import CategorySectionContainer from "../components/CategorySectionContainer";
import { onAuthStateChanged } from 'firebase/auth'; 

const GenresConcerts = () => {
    const { genre } = useLocalSearchParams(); 
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchConcertsByGenre = async () => {
        try {
        setLoading(true);
        const concertsRef = collection(FIRESTORE_DB, "concerts");
        const q = query(concertsRef, where("genre", "==", genre));
        const snapshot = await getDocs(q);
        
        const fetchedConcerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        
        setConcerts(fetchedConcerts);
        } catch (error) {
            console.error("Error fetching concerts by genre: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (genre) fetchConcertsByGenre();
    }, [genre]);

    
    const handleNavigation = async (concertId) => {
        onAuthStateChanged(FIREBASE_AUTH, async (user) => {
        if (user) {
            const userDocRef = doc(FIRESTORE_DB, "users", user.uid);
            try {
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const userConcerts = userSnap.data()?.concerts || [];
                console.log("User's checked-in concerts:", userConcerts);
    
                if (userConcerts.includes(concertId)) {
                router.push({
                    pathname: "/concertPage",
                    params: { concertId },
                });
                } else {
                router.push({
                    pathname: "/concert",
                    params: { concertId },
                });
                }
            } else {
                console.error("User document not found!");
            }
            } catch (error) {
                console.error("Error checking check-in status:", error);
            }
        } else {
            router.replace("/login");
        }
        });
    };

    const RenderConcertItem = ({ item }) => (
        <TouchableOpacity
            style={styles.concertCard}
            onPress={() => handleNavigation(item.id)}
            >
            <Image
                source={{ uri: item.photoUrl }}
                style={styles.concertImage}
                resizeMode="cover"
            />
            <View style={styles.concertDetails}>
                <Text style={styles.concertArtist}>{item.artist}</Text>
                <Text style={styles.concertName}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
        colors={["#131324", "#252950", "#040306"]}
        style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                <Text style={styles.categoryText}>{genre.toUpperCase()}</Text>
                {loading ? (
                <ActivityIndicator size="large" color="#cd548d" style={styles.loading} />
                ) : concerts.length === 0 ? (
                    <Text style={styles.noResultsText}>
                        No concerts found for this genre.
                    </Text>
                ) : (
                    <CategorySectionContainer
                        data={concerts}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <RenderConcertItem item={item} />}
                    />
                )}
            </SafeAreaView>
        </LinearGradient>
    );
    };

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    container: {
        flex: 1,
    },
    headerText: {
        fontSize: 26,
        color: "#FFFFFF",
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    categoryText: {
        fontSize: 18,
        color: "#D9EAFD",
        marginBottom: 16,
        textAlign: "center",
        fontStyle: "bold",
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    concertCard: {
        flexDirection: "row",
        backgroundColor: "#1C1C1E",
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    concertImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        margin: 8,
    },
    concertDetails: {
        flex: 1,
        padding: 12,
    },
    concertArtist: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    concertName: {
        fontSize: 14,
        color: "#CCCCCC",
        marginTop: 4,
    },
    noResultsText: {
        fontSize: 16,
        color: "#FFFFFF",
        textAlign: "center",
    },
});

export default GenresConcerts;