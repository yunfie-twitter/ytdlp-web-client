<template>
  <v-card elevation="2">
    <v-card-title class="bg-secondary">
      <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
      ダウンロードタスク
    </v-card-title>
    <v-card-text class="pa-0">
      <v-list v-if="tasks.length > 0">
        <v-list-item
          v-for="task in tasks"
          :key="task.task_id"
          class="border-b"
        >
          <template v-slot:prepend>
            <v-avatar size="80" rounded>
              <v-img
                v-if="task.thumbnail_url"
                :src="task.thumbnail_url"
                cover
              ></v-img>
              <v-icon v-else size="40">mdi-video</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="text-wrap">
            {{ task.title || 'ダウンロード中...' }}
          </v-list-item-title>
          
          <v-list-item-subtitle>
            <v-chip
              :color="getStatusColor(task.status)"
              size="small"
              class="mt-2"
            >
              {{ getStatusText(task.status) }}
            </v-chip>
            <span v-if="task.file_size" class="ml-2">
              {{ formatFileSize(task.file_size) }}
            </span>
          </v-list-item-subtitle>

          <!-- 進行状況バー -->
          <v-progress-linear
            v-if="task.status === 'downloading' || task.status === 'queued'"
            :model-value="task.progress"
            color="primary"
            height="8"
            rounded
            class="mt-2"
          ></v-progress-linear>

          <!-- エラーメッセージ -->
          <v-alert
            v-if="task.status === 'failed' && task.error_message"
            type="error"
            density="compact"
            class="mt-2"
          >
            {{ task.error_message }}
          </v-alert>

          <template v-slot:append>
            <div class="d-flex flex-column ga-2">
              <!-- ダウンロードボタン -->
              <v-btn
                v-if="task.status === 'completed'"
                color="primary"
                variant="tonal"
                size="small"
                @click="handleDownload(task)"
              >
                <v-icon start>mdi-download</v-icon>
                ダウンロード
              </v-btn>

              <!-- キャンセルボタン -->
              <v-btn
                v-if="task.status === 'downloading' || task.status === 'queued'"
                color="warning"
                variant="tonal"
                size="small"
                @click="handleCancel(task.task_id)"
              >
                <v-icon start>mdi-cancel</v-icon>
                キャンセル
              </v-btn>

              <!-- 削除ボタン -->
              <v-btn
                color="error"
                variant="tonal"
                size="small"
                @click="handleDelete(task.task_id)"
              >
                <v-icon start>mdi-delete</v-icon>
                削除
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <v-card-text v-else class="text-center py-8">
        <v-icon size="64" color="grey">mdi-download-off</v-icon>
        <div class="text-h6 mt-4 text-grey">ダウンロードタスクがありません</div>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { api } from '../api'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['delete-task', 'download-file'])

let pollInterval = null

const getStatusColor = (status) => {
  const colors = {
    queued: 'info',
    downloading: 'primary',
    completed: 'success',
    failed: 'error',
    cancelled: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    queued: '待機中',
    downloading: 'ダウンロード中',
    completed: '完了',
    failed: '失敗',
    cancelled: 'キャンセル済み'
  }
  return texts[status] || status
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const handleDownload = async (task) => {
  try {
    const blob = await api.downloadFile(task.task_id)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = task.filename || `download_${task.task_id}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    emit('download-file', task)
  } catch (error) {
    console.error('ダウンロードに失敗:', error)
    alert('ファイルのダウンロードに失敗しました')
  }
}

const handleCancel = async (taskId) => {
  try {
    await api.cancelTask(taskId)
    await pollTaskStatus(taskId)
  } catch (error) {
    console.error('キャンセルに失敗:', error)
  }
}

const handleDelete = async (taskId) => {
  if (!confirm('このタスクを削除しますか?')) return
  
  try {
    await api.deleteTask(taskId)
    emit('delete-task', taskId)
  } catch (error) {
    console.error('削除に失敗:', error)
  }
}

const pollTaskStatus = async (taskId) => {
  try {
    const status = await api.getTaskStatus(taskId)
    const task = props.tasks.find(t => t.task_id === taskId)
    if (task) {
      Object.assign(task, status)
    }
  } catch (error) {
    console.error('ステータスの取得に失敗:', error)
  }
}

const pollAllTasks = () => {
  props.tasks.forEach(task => {
    if (task.status === 'downloading' || task.status === 'queued') {
      pollTaskStatus(task.task_id)
    }
  })
}

onMounted(() => {
  // 2秒ごとにタスクのステータスを更新
  pollInterval = setInterval(pollAllTasks, 2000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>
