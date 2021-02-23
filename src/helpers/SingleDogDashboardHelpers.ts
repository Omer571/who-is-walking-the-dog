
function ensureTwelveHourFormat(time: string): boolean  {
  let validTimeFormat = true
  let charPlace = 0
  let numberPlaces = [0, 1, 3, 4, 6, 7]
  let colonPlaces = [2, 5]

  for (let i = 0; i < time.length; i++) {

    let char = time.charAt(charPlace)

    if (numberPlaces.includes(charPlace)) {
      // console.log(char + " @" + charPlace)
      if (!isDigit(char)) {
        validTimeFormat = false
        break
      }
    } else if (colonPlaces.includes(charPlace)) {
      // console.log(char + " @" + charPlace)
      if (char !== ":") {
        validTimeFormat = false
        break
      }
    }

    charPlace++
  }

  if (validTimeFormat) {
    let timeEnding = time.slice(-2)
    // console.log(timeEnding)
    if (timeEnding !== "PM" && timeEnding !== "AM") {
      validTimeFormat = false
    }
  }

  return validTimeFormat
}

const isDigit = (char: string) => {
  if (char >= '0' && char <= '9')
    return true

  return false
}

// console.log("Test 1 should be true: " + ensureTwelveHourFormat("11:16:00 PM"))
// console.log("Test 2 should be true: " + ensureTwelveHourFormat("11:16:00 AM"))
// console.log("Test 3 should be false: " + ensureTwelveHourFormat("1:16:00 AM")) // false case

export { ensureTwelveHourFormat }
