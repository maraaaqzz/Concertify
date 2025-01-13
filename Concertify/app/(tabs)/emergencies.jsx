import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { FIRESTORE_DB } from '../../services/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useGlobalContext } from '../GlobalContext';

const Emergencies = () => {
    const { state } = useGlobalContext();
    const concertId = state.activeConcert?.id;

    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmergencies = () => {
            const emergenciesRef = query(
                collection(FIRESTORE_DB, 'concerts', concertId, 'emergencies'),
                orderBy('time', 'desc')
            );
    
            const unsubscribe = onSnapshot(emergenciesRef, (snapshot) => {
                const emergencyData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEmergencies(emergencyData);
                setLoading(false);
            });
    
            return unsubscribe;
        };
    
        if (concertId) {
            fetchEmergencies();
        }
    }, [concertId]);


    if (!state.activeConcert) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.noConcertText}>Concert didn't start. No emergencies yet!</Text>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A64D79" />
                <Text style={styles.loadingText}>Loading emergencies...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Emergencies</Text>
            </View>
            {emergencies.length == 0 ? (
                <Text style={styles.noDataText}>No emergencies reported for this concert.</Text>
            ) : (
                <FlatList
                    data={emergencies}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={styles.cardTitle}>{item.user || 'Unknown Emergency'}</Text>
                                <Text style={styles.cardTime}>
                                    {item.time ? new Date(item.time.toDate()).toLocaleString() : 'N/A'}
                                </Text>
                            </View>
                            <Text style={styles.cardDetails}>{item.type || 'No details available'}</Text>
                            
                        </View>
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131624',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#131624',
    },
    loadingText: {
        color: '#aaa',
        marginTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
      },
    noConcertText: {
        fontSize: 18,
        color: '#aaa',
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    noDataText: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#2C253A',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        marginHorizontal: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    cardDetails: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E1E0E4',
        marginVertical: 10,
        alignItems: 'center',
        width: '100%',
    },
    cardTime: {
        fontSize: 14,
        color: '#E1E0E4',
    },
});

export default Emergencies;
