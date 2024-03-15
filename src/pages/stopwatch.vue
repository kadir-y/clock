<template>
  <div class="stopwatch">
    <div class="overallTime">{{ displayOverallTime }}</div>
    <div class="lapTime">{{ displayLapTime }}</div>
    <div class="buttons">
      <template v-if="!stopped">
        <v-btn v-if="!running" size="large" @click="startHandler">Start</v-btn>
        <v-btn v-if="running" size="large" @click="stopHandler">Stop</v-btn>
      </template>
      <v-btn v-else size="large" @click="resumeHandler">Resume</v-btn>

      <v-btn v-if="!stopped" size="large" @click="lapHandler" :disabled="!running">Lap</v-btn>
      <v-btn v-if="stopped" size="large" @click="resetHandler">Reset</v-btn>
    </div>

    <v-data-table-virtual
      v-if="laps.length > 1"
      :headers="table.headers"
      :items="displayLaps"
      height="22rem"
      item-value="index"
    ></v-data-table-virtual>
  </div>
</template>

<script>
import dateParser from '../libs/dateParser'
export default {
  name: "Stopwatch",
  data () {
    return {
      displayOverallTime: '00 : 00 .00',
      displayLapTime: '00 : 00 .00',
      overallTime: 0,
      running: false,
      stopped: false,
      table: {
        headers: [
          { title: "Lap", align: "start", key: "index" },
          { title: "Lap times", align: "end", key: "lapTime" },
          { title: "Overall time", align: "end", key: "overallTime" }
        ]
      },
      laps: [
      /*
        {
          index: ...,
          lapTime: ...,
          overallTime: ...,
          logs: [
            {
              startingTime: ...,
              endingTime: ...,
            }
          ]
        }
      */
      ]
    }
  },
  methods: {
    fitToTime (time) {
      const parser = new dateParser()
      const { hours, minutes, seconds, miliseconds } = parser.mixed(time)
      return `
        ${hours === 0 ? '' : hours.toString() + ':'}
        ${minutes < 10 ? '0' + minutes.toString() : minutes}
         : ${seconds < 10 ? '0' + seconds.toString() : seconds}
         .${miliseconds < 100 ? '0' + miliseconds.toString().slice(0, 1) : miliseconds.toString().slice(0, 2)}
      `
    },
    runStopwatachInterval () {
      this.stopwatchInterval = setInterval(() => {
        const lastLap = this.laps.at(-1)
        const lastLog = lastLap.logs.at(-1)
        const lastLogElapsedTime = Date.now() - lastLog.startTime
        this.displayLapTime = this.fitToTime(lastLap.lapTime + lastLogElapsedTime)
        this.displayOverallTime = this.fitToTime(this.overallTime + lastLogElapsedTime)
      }, 50)
    },
    pauseStopwatachInterval () {
      clearInterval(this.stopwatchInterval)
    },
    // handlers
    startHandler () {
      this.addLap()
      this.runStopwatachInterval()
      this.running = true
    },
    stopHandler () {
      this.stopped = true

      this.endTheLog()
      this.pauseStopwatachInterval()
    },
    resetHandler () {
      this.stopped = false
      this.running = false

      // this.saveLapsToHistory()
      // when you use saveLapsToHistory function finishToLap function will necessary
      // this.finishToLap()

      this.laps = []
      this.overAllTime = 0
    },
    resumeHandler () {
      this.stopped = false

      this.addLog()
      this.runStopwatachInterval()
    },
    lapHandler () {
      this.endTheLog()
      this.finishToLap()
      this.addLap()
    },   
    addLap () {
      const index = this.laps.length + 1 
      this.laps.push({ 
        index: index >= 10 ? index : `0${index}`,  
        logs: [{ startTime: Date.now() }],
        lapTime: 0
      }) 
    },
    finishToLap () {
      this.laps.at(-1).overallTime = this.overallTime
    },
    addLog () {
      this.laps.at(-1).logs.push({ 
        startTime: Date.now(),
      })
    },
    endTheLog () { 
      this.laps.at(-1).logs.at(-1).endTime = Date.now()

      // calculating elapsed time
      const lastLap = this.laps.at(-1)
      const lastLog = lastLap.logs.at(-1)
      lastLap.lapTime += lastLog.endTime - lastLog.startTime
      this.overallTime += lastLog.endTime - lastLog.startTime
    },
    runStopwatchInterval () {
    },
    saveLapsToHistory () {
      const stopwatchHistory = JSON.parse(localStorage.getItem("stopwatchHistory"))
      if (stopwatchHistory.length >= 50) stopwatchHistory.shift() 
      stopwatchHistory.push(this.laps)
      localStorage.setItem("stopwatchHistory", JSON.stringify(stopwatchHistory))
    }
  },
  computed: {
    displayLaps () {
      return this.laps
      .slice(0, -1)
      .map(lap => {
        return {
          lapTime: this.fitToTime(lap.lapTime),
          overallTime: this.fitToTime(lap.overallTime),
          index: lap.index
        }
      })      
      .reverse()
    }
  },
  beforeCreate () {
    // check history and create if not created 
    // const stopwatchHistory = localStorage.getItem("stopwatchHistory")
    // if (!stopwatchHistory) localStorage.setItem("stopwatchHistory", "[]")
  }
}
</script>

<style lang="scss">
  .stopwatch {
    max-width: 25rem;
    margin-top: 3rem;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 1rem;
  } 
  .buttons {
    width: 100%;
    height: 5rem;
    display: flex;
    justify-content: space-evenly;  
    align-items: center;
  }
  .overallTime {
    text-align: center;
    width: 100%;
    font-size: 2rem;
  }
  .lapTime {
    height: 3rem;
    line-height: 1.25rem;
    padding-bottom: 1.75rem;
    font-size: 1.25rem;
    width: 100%;
    text-align: center;
  }
</style>