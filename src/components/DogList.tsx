import React, { useState, useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { List } from 'react-native-paper'
import { getDogs, getDogWithKeyFromArray } from '../helpers/SettingsHelpers'
import { DogObject, UserData, Navigation } from '../types'


type listProps = {
	user: UserData,
	navigation: Navigation,
}


const DogList = ({ user }: listProps) => {

	const [dogs, setDogs] = useState<DogObject[]>([])

	const navigation = useNavigation()

	const handleListItemPress = (dogKey: string) => {
		console.log("Dog with key: " + dogKey + " pressed")
		navigation.navigate("IndividualDogSettingScreen", { dog: getDogWithKeyFromArray(dogKey, dogs), user: user })
	}

	useEffect(() => {
		getDogs(user.id).then((returnedDogs) => {
			setDogs(returnedDogs)
		})
	}, [])

  return (
    <List.Section title="Your Dogs">
      <List.Accordion
        title="Your Dogs"
        left={props => <List.Icon {...props} icon="folder" />}>
				{(dogs) ? dogs.map((dog) => {
					return (
						<TouchableOpacity key={dog.key} onPress={() => handleListItemPress((dog.key) ? dog.key.toString() : "")} >
							 <List.Item key={dog.key} title={dog.firstName} />
						</TouchableOpacity>
					)
				}) : <List.Item key="-999" title="No Dogs" /> }
      </List.Accordion>
    </List.Section>
  )
}

export default DogList
