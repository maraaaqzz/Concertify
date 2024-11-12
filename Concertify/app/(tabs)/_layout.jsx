import { View, Text, Image } from 'react-native'
import React from 'react'
import { Tabs, Redirect} from 'expo-router'
import { icons } from '../../constants'

const TabIcon = ({ icon, color, name, focused }) => {
    return(
        <View className="items-center justify-center gap-1">
            <Image
                source={icon}
                resizeMode="contain"
                tintColor={color}
                className="w-6 h-6"
            />
            <Text className={`${focused ? 'font-semibold' : 'font-normal'} text-xs`}>
                {name}
            </Text>
        </View>
    )
}

const TabsLayout = () => {
  return (
    <>
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#A64D79',
                tabBarInactiveTintColor: "#CDCDE0",
                tabBarStyle: {
                    backgroundColor: "#131624",
                    borderTopWidth: 1,
                    borderTopColor: "#232533",
                    height: 84,
                  },
            }}
        >
            <Tabs.Screen 
                name="concertPage"
                options={{
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <TabIcon 
                            icon={icons.home}
                            color={color}
                            focused={focused}
                        />
                    )
                }}
            />

            <Tabs.Screen 
                name="threads"
                options={{
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <TabIcon 
                            icon={icons.chat}
                            color={color}
                            focused={focused}
                        />
                    )
                }}
            />

            <Tabs.Screen 
                name="songBubble"
                options={{
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <TabIcon 
                            icon={icons.songBubble}
                            color={color}
                            focused={focused}
                        />
                    )
                }}
            />

        </Tabs>
    </>
  )
}

export default TabsLayout