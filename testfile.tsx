// var now = new Date()
// let millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 43, 0, 0).getTime()
// console.log(millisTill10)
//
// if (millisTill10 < 0) {
//      millisTill10 += 86400000 // it's after 10am, try 10am tomorrow.
// }
// setTimeout(function() { console.log("It's 10am!") }, millisTill10)

setInterval(function() { // Set interval for checking
    var date = new Date() // Create a Date object to find out what time it is
    if (date.getHours() === 8 && date.getMinutes() === 51){ // Check the time
        console.log("Its 8:51")
    } else {
      console.log("Its not 8:51")
    }
}, 60000)
