import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams  } from 'expo-router';
import { images }  from "../constants";
import { StyleSheet, Text, Image, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

const Concert = () => {
    const { name, imageKey } = useLocalSearchParams ();

    const displayImage = images[imageKey];

    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                {displayImage ? (
                        <Image source={displayImage} style={styles.largeImage} />
                    ) : (
                        <Text style={styles.errorText}>Image not found</Text>
                    )}
                        <Text style={styles.name}>{name}</Text>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={22} color="#fff" />
                        <Text style={styles.infoText}>Where</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="clock-outline" size={22} color="#fff" />
                        <Text style={styles.infoText}>When</Text>
                    </View>
                </View>
            
                <View  className="text-2xl font-extrabold" style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>Description</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 100,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 70,
        marginLeft: 50
    },
    infoText: {
        color: '#fff',
        fontSize: 14,
        fontSize: 16, 
        marginLeft: 6
    },
    descriptionContainer: {
        marginTop: 1,
        padding:50,
        marginLeft: -220,
    },
    descriptionText: {
        color: '#fff',
        fontSize: 20,
    },
    largeImage: {
        width: '80%',
        height: '50%',
        borderRadius: 20,
        marginBottom: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginBottom: 20,
     },
     text: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginBottom: 20,
        paddingLeft: 1, 
        marginTop: 20
    }
    // errorText: {
    //     color: 'red',
    //     fontSize: 16,
    //     marginBottom: 20,
    // },
});

export default Concert