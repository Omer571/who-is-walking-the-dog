export type Route = {
  params: {
    dogName: string,
    dog: DogObject,
    user: UserData,
  },
};

export type Navigation = {
  navigate: (scene: string) => void;
};

export type UserData = {
  id: string,
  email: string,
  name: string,
};

export type DogFamilyMember = {
  dataKey: string,
  phoneNumber: string,
  name: string,
}


export type TypeDay = {
  walkDay: boolean,
  restDay: boolean,
  parkDay: boolean,
}

export type DayInfo = {
  walkerName: string,
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

export type DogObject = {
  firstName: string,
  middleName: string,
  lastName: string,
  members: Array<DogFamilyMember>,
  schedule: DogSchedule,
  key: string,
}
