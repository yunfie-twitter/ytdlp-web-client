import axios from 'axios'

// APIベースURL (環境変数から取得、デフォルトはlocalhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const api = {
  /**
   * 動画情報を取得
   */
  async getVideoInfo(url) {
    const response = await apiClient.get('/api/info', {
      params: { url }
    })
    return response.data
  },

  /**
   * ダウンロードタスクを作成
   */
  async createDownload(downloadRequest) {
    const response = await apiClient.post('/api/download', downloadRequest)
    return response.data
  },

  /**
   * タスクステータスを取得
   */
  async getTaskStatus(taskId) {
    const response = await apiClient.get(`/api/status/${taskId}`)
    return response.data
  },

  /**
   * ファイルをダウンロード
   */
  async downloadFile(taskId) {
    const response = await apiClient.get(`/api/download/${taskId}`, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * タスクをキャンセル
   */
  async cancelTask(taskId) {
    const response = await apiClient.post(`/api/cancel/${taskId}`)
    return response.data
  },

  /**
   * タスクを削除
   */
  async deleteTask(taskId) {
    const response = await apiClient.delete(`/api/task/${taskId}`)
    return response.data
  },

  /**
   * タスク一覧を取得
   */
  async listTasks(status = null, limit = 50) {
    const response = await apiClient.get('/api/tasks', {
      params: { status, limit }
    })
    return response.data
  },

  /**
   * サムネイルを取得
   */
  async getThumbnail(taskId) {
    const response = await apiClient.get(`/api/thumbnail/${taskId}`)
    return response.data
  },

  /**
   * 字幕を取得
   */
  async getSubtitles(url, lang = 'ja') {
    const response = await apiClient.get('/api/subtitles', {
      params: { url, lang }
    })
    return response.data
  },

  /**
   * キュー統計を取得
   */
  async getQueueStats() {
    const response = await apiClient.get('/api/queue/stats')
    return response.data
  }
}
