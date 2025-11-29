<template>
  <v-card elevation="2">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-download</v-icon>
      新規ダウンロード
    </v-card-title>
    <v-card-text class="pt-4">
      <v-form ref="formRef" @submit.prevent="submitDownload">
        <!-- URL入力 -->
        <v-text-field
          v-model="form.url"
          label="動画URL"
          placeholder="https://www.youtube.com/watch?v=..."
          :rules="urlRules"
          prepend-icon="mdi-link"
          variant="outlined"
          clearable
          @blur="fetchVideoInfo"
        ></v-text-field>

        <!-- 動画情報プレビュー -->
        <v-card v-if="videoInfo" class="mb-4" variant="outlined">
          <v-row no-gutters>
            <v-col cols="12" md="4">
              <v-img
                :src="videoInfo.thumbnail"
                height="200"
                cover
              ></v-img>
            </v-col>
            <v-col cols="12" md="8">
              <v-card-text>
                <div class="text-h6">{{ videoInfo.title }}</div>
                <div class="text-caption mt-2">
                  <v-chip size="small" class="mr-2">
                    <v-icon start size="small">mdi-account</v-icon>
                    {{ videoInfo.uploader }}
                  </v-chip>
                  <v-chip size="small" class="mr-2">
                    <v-icon start size="small">mdi-eye</v-icon>
                    {{ formatNumber(videoInfo.view_count) }}
                  </v-chip>
                  <v-chip size="small">
                    <v-icon start size="small">mdi-clock-outline</v-icon>
                    {{ formatDuration(videoInfo.duration) }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>

        <!-- フォーマット選択 -->
        <v-select
          v-model="form.format"
          :items="formatOptions"
          label="フォーマット"
          prepend-icon="mdi-video"
          variant="outlined"
        ></v-select>

        <!-- 品質選択 (動画の場合) -->
        <v-select
          v-if="form.format === 'mp4' && videoInfo"
          v-model="form.quality"
          :items="videoInfo.available_qualities"
          label="品質"
          prepend-icon="mdi-quality-high"
          variant="outlined"
        ></v-select>

        <!-- MP3タイトル (音声の場合) -->
        <v-text-field
          v-if="form.format === 'mp3'"
          v-model="form.mp3_title"
          label="MP3タイトル (オプション)"
          prepend-icon="mdi-music"
          variant="outlined"
          clearable
        ></v-text-field>

        <!-- サムネイル埋め込み -->
        <v-checkbox
          v-if="form.format === 'mp3'"
          v-model="form.embed_thumbnail"
          label="サムネイルを埋め込む"
          color="primary"
        ></v-checkbox>

        <!-- ダウンロードボタン -->
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="loading"
          :disabled="!form.url"
        >
          <v-icon start>mdi-download</v-icon>
          ダウンロード開始
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { api } from '../api'

const emit = defineEmits(['download-created'])

const formRef = ref(null)
const loading = ref(false)
const videoInfo = ref(null)

const form = reactive({
  url: '',
  format: 'mp4',
  quality: null,
  mp3_title: '',
  embed_thumbnail: false
})

const formatOptions = [
  { title: 'MP4 (動画)', value: 'mp4' },
  { title: 'MP3 (音声)', value: 'mp3' },
  { title: 'WEBM', value: 'webm' },
  { title: 'M4A (音声)', value: 'm4a' }
]

const urlRules = [
  v => !!v || 'URLは必須です',
  v => /^https?:\/\/.+/.test(v) || '有効なURLを入力してください'
]

const fetchVideoInfo = async () => {
  if (!form.url || !form.url.match(/^https?:\/\/.+/)) return

  try {
    loading.value = true
    const info = await api.getVideoInfo(form.url)
    videoInfo.value = info
    
    // デフォルトの品質を設定
    if (info.available_qualities && info.available_qualities.length > 0) {
      form.quality = info.available_qualities[0]
    }
  } catch (error) {
    console.error('動画情報の取得に失敗:', error)
  } finally {
    loading.value = false
  }
}

const submitDownload = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    const task = await api.createDownload({
      url: form.url,
      format: form.format,
      quality: form.quality,
      mp3_title: form.mp3_title || null,
      embed_thumbnail: form.embed_thumbnail
    })

    emit('download-created', {
      ...task,
      title: videoInfo.value?.title,
      thumbnail_url: videoInfo.value?.thumbnail
    })

    // フォームをリセット
    form.url = ''
    form.format = 'mp4'
    form.quality = null
    form.mp3_title = ''
    form.embed_thumbnail = false
    videoInfo.value = null
    formRef.value.reset()
  } catch (error) {
    console.error('ダウンロードの作成に失敗:', error)
    alert('ダウンロードの作成に失敗しました。URLを確認してください。')
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('ja-JP').format(num)
}

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>
