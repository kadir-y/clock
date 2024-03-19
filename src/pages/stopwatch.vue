<template>
  <v-container class="text-center">
    <v-row justify="center">
        <v-col col="11" md="6" lg="4" xlg="3">
          <div class="py-10">
            <div class="text-h3 pb-2">{{ displayOverallTime }}</div>
            <div class="text-medium-emphasis text-h4">{{ laps.length > 1 ? displayLapTime : '00 : 00 .00' }}</div>
          </div>
          <div class="d-flex justify-space-evenly pb-12">
            <template v-if="!stopped && !running">
              <v-btn class="me-2 rounded-pill" size="large" @click="startHandler" color="deep-purple-darken-3">Start</v-btn>
              <v-btn class="rounded-pill" size="large"  disabled>Lap</v-btn>
            </template>

            <template v-if="!stopped && running">
              <v-btn class="rounded-pill" size="large" color="red-accent-4" @click="stopHandler">Stop</v-btn>
              <v-btn class="rounded-pill" size="large" @click="lapHandler">Lap</v-btn>
            </template>

            <template v-if="stopped">
              <v-btn class="rounded-pill" size="large" @click="resumeHandler" color="blue-grey-darken-1">Resume</v-btn>
              <v-btn class="rounded-pill" size="large" @click="resetHandler" variant="outlined" color="red-darken-4">Reset</v-btn>
            </template>
          </div>
        </v-col>
        <v-col col="11" md="6" lg="4" xlg="3">
          <v-data-table-virtual
            :headers="table.headers"
            :items="displayLaps"
            no-data-text="No laps to show"
            :style="{
              height: 'calc(100vh - 20.25rem - 8rem)',
              minHeight: '15rem',
              maxHeight: '30rem'
            }"
            item-value="index"
            class="rounded-lg"
          >
            <template v-slot:item.index="{ item }">
              <span :class="'text-' + item.color + ' font-weight-bold'">{{ item.index }}</span>
            </template>
            <template v-slot:item.lapTime="{ item }">
              <span class="text-medium-emphasis">{{ item.lapTime }}</span>
            </template>
            <template v-slot:item.overallTime="{ item }">
              <span class="text-high-emphasis">{{ item.overallTime }}</span>
            </template>
          </v-data-table-virtual>
        </v-col>
    </v-row>
  </v-container>
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
          { title: "Lap", align: "center", key: "index" },
          { title: "Lap times", align: "center", key: "lapTime" },
          { title: "Overall time", align: "center", key: "overallTime" }
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
      return  (hours === 0 ? '' : (hours < 10 ? '0' + hours.toString() : hours.toString()) + ' : ') +
        (minutes < 10 ? '0' + minutes.toString() : minutes) +
        (' : ' + (seconds < 10 ? '0' + seconds.toString() : seconds)) +
        (' .' + (miliseconds < 100 ? '0' + miliseconds.toString().slice(0, 1) : miliseconds.toString().slice(0, 2)))
      
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
      this.overallTime = 0

      this.displayOverallTime = this.fitToTime(0)
      this.displayLapTime= this.fitToTime(0)
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
    saveLapsToHistory () {
      const stopwatchHistory = JSON.parse(localStorage.getItem("stopwatchHistory"))
      if (stopwatchHistory.length >= 50) stopwatchHistory.shift() 
      stopwatchHistory.push(this.laps)
      localStorage.setItem("stopwatchHistory", JSON.stringify(stopwatchHistory))
    }
  },
  computed: {
    displayLaps () {
      let lastLap;
      return this.laps
      .slice(0, -1)
      .map(lap => {
        const lapObj = {
          lapTime: this.fitToTime(lap.lapTime),
          overallTime: this.fitToTime(lap.overallTime),
          index: lap.index,
        }
        const difference = lastLap ? lap.lapTime - lastLap.lapTime : 0
        const toleranceValue = (lap.lapTime + (lastLap ? lastLap.lapTime : 0)) / 10
        if (Math.abs(difference) > toleranceValue)
        lapObj.color = difference < 0 ? "deep-purple-darken-3" : "deep-orange-accent-4" 
        lastLap = lap
        return lapObj
      })      
      .reverse()
    }
  },
  mounted () {
    // check history and create if not created 
    // const stopwatchHistory = localStorage.getItem("stopwatchHistory")
    // if (!stopwatchHistory) localStorage.setItem("stopwatchHistory", "[]")
  }
}
</script>

<style lang="scss">
</style>