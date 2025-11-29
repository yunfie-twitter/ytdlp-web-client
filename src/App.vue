<template>
  <v-app>
    <v-app-bar color="primary" dark elevation="2">
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-youtube</v-icon>
        YouTube Downloader
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <DownloadForm @download-created="addTask" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <TaskList :tasks="tasks" @delete-task="deleteTask" @download-file="downloadFile" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import DownloadForm from './components/DownloadForm.vue'
import TaskList from './components/TaskList.vue'

const theme = ref('light')
const vuetifyTheme = useTheme()
const tasks = ref([])
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  vuetifyTheme.global.name.value = theme.value
}

const addTask = (task) => {
  tasks.value.unshift(task)
  showSnackbar('ダウンロードタスクを作成しました', 'success')
}

const deleteTask = (taskId) => {
  tasks.value = tasks.value.filter(t => t.task_id !== taskId)
  showSnackbar('タスクを削除しました', 'info')
}

const downloadFile = (task) => {
  showSnackbar(`${task.title || 'ファイル'}のダウンロードを開始します`, 'success')
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

onMounted(() => {
  // テーマをローカルストレージから復元
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
    vuetifyTheme.global.name.value = savedTheme
  }
})

// テーマの変更を監視してローカルストレージに保存
const saveTheme = () => {
  localStorage.setItem('theme', theme.value)
}
</script>
