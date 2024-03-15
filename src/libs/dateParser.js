class dateParser {
  hours (time) {
    return Math.floor(time / (1000 * 60 * 60))
  }
  minutes (time) {
    return Math.floor(time / (1000 * 60))
  }
  seconds (time) {
    return Math.floor(time / (1000))
  }
  mixed (time) {
    const hours = Math.floor(time / (1000 * 60 * 60))
    const minutes = Math.floor((time - (hours * (1000 * 60 * 60))) / (1000 * 60))
    const seconds = Math.floor((time - (hours * (1000 * 60 * 60)) - (minutes * (1000 * 60))) / (1000))
    const miliseconds = Math.floor((time - (hours * (1000 * 60 * 60)) - (minutes * (1000 * 60)) - (seconds * 1000)))
    const string = `${hours}:${minutes}:${seconds}:${miliseconds}`

    return { string, hours, minutes, seconds, miliseconds }
  }
}

export default dateParser
