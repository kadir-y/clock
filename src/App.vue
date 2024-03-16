<template>
  <v-app :theme="theme">
    <v-app-bar :collapse="!drawer">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" :width="200" class="pt-6">
      <v-radio-group v-model="userThemePreference" label="Theme" size="small">
        <v-radio label="Dark" value="dark">
          <template v-slot:label>
            <span class="me-2">Dark</span>
            <v-icon>mdi-weather-night</v-icon>
          </template>
        </v-radio>
        <v-radio label="Light" value="light">
          <template v-slot:label>
            <span class="me-2">Light</span>
            <v-icon>mdi-white-balance-sunny</v-icon>
          </template>
        </v-radio>
        <v-radio label="System" value="system">
          <template v-slot:label>
            <span class="me-2">System</span>
            <v-icon>mdi-desktop-classic</v-icon>
          </template>
        </v-radio>
      </v-radio-group>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
    <v-bottom-navigation>
      <v-btn value="stopwatch">
        <v-icon>mdi-timer</v-icon>
        <span>Stopwatch</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import { useTheme } from "vuetify"

export default {
  name: "App",
  data () {
    return {
      drawer: false,
      theme: "",
      userThemePreference: ""
    }
  },
  methods: {
    applyTheme (theme) {
      if (!theme || theme === "system") {
        this.userThemePreference = "system"
        this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        this.userThemePreference = theme
        this.theme = theme
      }
    }
  },
  mounted () {
    this.$router.push("/stopwatch")
    const theme = localStorage.getItem("user-theme-preference")
    this.applyTheme(theme)
  },
  toggleTheme () {
  },
  watch: {
    userThemePreference (newVal) {
      localStorage.setItem("user-theme-preference", newVal)
      this.applyTheme(newVal)
    }
  }
}
</script>
