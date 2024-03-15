<template>
  <v-app>
    <v-main>
      <router-view />
      <v-bottom-navigation>
        <v-btn value="stopwatch">
          <v-icon>mdi-timer</v-icon>
          <span>Stopwatch</span>
        </v-btn>
      </v-bottom-navigation>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  mounted () {
    this.$router.push('/stopwatch')
  }
}
</script>
