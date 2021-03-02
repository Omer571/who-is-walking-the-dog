export type Route = {
  params: {
    dogName: string,
    dog: DogData,
    user: UserData,
  },
}

export type DropdownStateType = {
    monday: string,
    tuesday: string,
    wednesday: string,
    thursday: string,
    friday: string,
    saturday: string,
    sunday: string,
  }

export type Navigation = {
  navigate: (scene: string) => void;
}

export type UserData = {
  id: string,
  email: string,
  name: string,
  phoneNumber: string,
  dogIds: string[],
  push_token: string,
  notificationsOn: boolean,
}

// export type UserMemberData = {
//   id: string,
//   email: string,
//   name: string,
//   phoneNumber: string,
//   dogs: string[],
//   push_token: string,
//   todayPushNotificationIdentifier: string,
//   todayFinalPushNotificationIdentifier: string,
//   tomorrowPushNotificationIdentifier: string,
// }

export type PotentialDogFamilyMember = {
  dataKey: string,
  phoneNumber: string,
  name: string,
}

export type DayInfo = {
  walkerId: string,
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

export type DogData = {
  firstName: string,
  middleName: string,
  lastName: string,
  userIds: string[],
  schedule: DogSchedule,
  id: string,
  weeklyNeeds: WeeklyNeeds,
  thisWeeksNeeds: WeeklyNeeds,
}

export type TempDogObject = {
  firstName: string,
  middleName: string,
  lastName: string,
  members: Array<PotentialDogFamilyMember>,
  id: string,
  weeklyNeeds: WeeklyNeeds,
}
