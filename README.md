# ロック (Unlock Guild版)

Unlock Guildのチームが使う、AIチャットキャラクター「ロック」です。
`public/index.html` が画面、`api/chat.js` がAnthropic APIを安全に呼び出すサーバー側の窓口です。
APIキーはブラウザ側には一切書かれず、Vercelのサーバー環境変数としてのみ保存されます。

## デプロイ手順(初回)

### 1. Anthropic APIキーを取得
1. https://console.anthropic.com にログイン(なければ作成)
2. 「API Keys」からキーを新規発行(`sk-ant-...` という文字列)
3. 使った分だけ課金されます。チームで使う場合は利用量の上限設定もおすすめです。

### 2. このフォルダをGitHubリポジトリにする
```
cd rock-chatbot-vercel
git init
git add .
git commit -m "ロック 初回コミット"
```
GitHub上で新規リポジトリを作り、そこにpushしてください。

### 3. Vercelでプロジェクトを作成
1. https://vercel.com にログイン(GitHubアカウントで可)
2. 「Add New... → Project」で、上記のGitHubリポジトリを選択してImport
3. フレームワーク設定は特に触らず「Deploy」でOK(このプロジェクトはNode.jsのServerless Functionsのみ使用)

### 4. 環境変数を設定
Vercelのプロジェクト → Settings → Environment Variables で以下を追加:

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | 手順1で発行したキー |

追加したら、Deployments タブから「Redeploy」して反映してください。

### 5. 完成
発行されたURL(例: `https://rock-chatbot.vercel.app`)が、そのままチーム全員が使えるページになります。
このURLをUnlock Guildのホームページからリンクするなりiframeで埋め込むなりできます。

## 更新したいとき
- キャラクターの口調や設定: `api/chat.js` の `SYSTEM_PROMPT` を編集
- 見た目・イラスト: `public/index.html` を編集
編集してGitHubにpushすれば、Vercelが自動で再デプロイします。

## 注意
- `ANTHROPIC_API_KEY` は絶対に `public/` 以下のファイルや `index.html` には書かないでください(誰でも見える場所です)。
- チーム全員が使う想定なので、Anthropicコンソール側で利用上限(spend limit)を設定しておくと安心です。
