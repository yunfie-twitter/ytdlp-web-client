# YouTube Downloader - Vue 3 + Vuetify 3 PWA

Vue 3とVuetify 3を使用したYouTube動画/音声ダウンローダーのPWAクライアントです。

## 機能

- 📹 YouTube動画のダウンロード (MP4, WEBM)
- 🎵 音声のみダウンロード (MP3, M4A)
- 🖼️ サムネイル表示とプレビュー
- 📊 ダウンロード進行状況のリアルタイム表示
- 🎨 ダーク/ライトテーマ切り替え
- 📱 PWA対応 (オフラインでも動作)
- 🔄 自動更新機能

## 技術スタック

- **フレームワーク**: Vue 3 (Composition API)
- **UIライブラリ**: Vuetify 3 (Material Design)
- **ビルドツール**: Vite
- **PWA**: vite-plugin-pwa
- **APIクライアント**: Axios
- **アイコン**: Material Design Icons

## セットアップ

### 前提条件

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# 依存関係のインストール
npm install
# または
pnpm install
```

### 環境変数の設定

`.env`ファイルを作成し、APIのベースURLを設定します:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 開発サーバーの起動

```bash
npm run dev
# または
pnpm dev
```

ブラウザで `http://localhost:3000` を開きます。

### プロダクションビルド

```bash
npm run build
# または
pnpm build
```

ビルドされたファイルは`dist`ディレクトリに出力されます。

### プレビュー

```bash
npm run preview
# または
pnpm preview
```

## PWA機能

このアプリケーションはPWA (Progressive Web App)として動作します:

- **インストール可能**: ホーム画面に追加してネイティブアプリのように使用可能
- **オフライン対応**: Service Workerによりオフラインでも基本機能が動作
- **自動更新**: 新しいバージョンが利用可能になると自動的に更新

## API仕様

このクライアントは、`openapi.json`で定義されたyt-dlp Download APIと連携します。

主なエンドポイント:

- `GET /api/info` - 動画情報の取得
- `POST /api/download` - ダウンロードタスクの作成
- `GET /api/status/{task_id}` - タスクステータスの取得
- `GET /api/download/{task_id}` - ファイルのダウンロード
- `POST /api/cancel/{task_id}` - タスクのキャンセル
- `DELETE /api/task/{task_id}` - タスクの削除

## ディレクトリ構造

```
.
├── src/
│   ├── api/              # API通信ロジック
│   │   └── index.js
│   ├── components/       # Vueコンポーネント
│   │   ├── DownloadForm.vue
│   │   └── TaskList.vue
│   ├── plugins/          # Vuetifyプラグイン設定
│   │   └── vuetify.js
│   ├── App.vue           # ルートコンポーネント
│   └── main.js           # エントリーポイント
├── public/               # 静的ファイル
├── index.html
├── vite.config.js        # Vite設定
└── package.json
```

## 使い方

1. YouTube動画のURLを入力
2. 動画情報が自動的に取得されプレビュー表示
3. ダウンロード形式(MP4/MP3など)を選択
4. 品質を選択(動画の場合)
5. 「ダウンロード開始」ボタンをクリック
6. タスク一覧でダウンロード進行状況を確認
7. 完了後、「ダウンロード」ボタンでファイルを保存

## ライセンス

MIT License

## 作者

ゆんふぃ (@yunfie_misskey)
