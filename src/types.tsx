export type Route = {
  params: {
    dogName: string,
    dog: DogObject,
    user: UserData,
  },
}

export type Navigation = {
  navigate: (scene: string) => void;
}

export type UserData = {
  id: string,
  email: string,
  name: string,
  phoneNumber: string,
  dogs: DogObject[],
  push_token: string,
}

export type UserMemberData = {
  id: string,
  email: string,
  name: string,
  phoneNumber: string,
  dogs: DogObject[],
  push_token: string,
  todayPushNotificationIdentifier: string,
  todayFinalPushNotificationIdentifier: string,
  tomorrowPushNotificationIdentifier: string,
}

export type DogFamilyMember = {
  dataKey: string,
  phoneNumber: string,
  name: string,
}

export type DayInfo = {
  walker: UserData,
  time: string,
  dayType: string,
}

export type DogSchedule = {
  monday: DayInfo,
  tuesday: DayInfo,
  wednesday: DayInfo,
  thursday: DayInfo,
  friday: DayInfo,
  saturday: DayInfo,
  sunday: DayInfo,
}

export type WeeklyNeeds = {
  walks: number,
  outings: number,
  rest: number,
}

export type DogObject = {
  firstName: string,
  middleName: string,
  lastName: string,
  members: Array<UserMemberData>,
  schedule: DogSchedule,
  key: string,
  weeklyNeeds: WeeklyNeeds,
}

export type TempDogObject = {
  firstName: string,
  middleName: string,
  lastName: string,
  members: Array<DogFamilyMember>,
  schedule: DogSchedule,
  key: string,
  weeklyNeeds: WeeklyNeeds,
}
