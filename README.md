# Three.js Usagi コンテンツ

Three.js を使用したウサギの 3D モデル表示アプリケーション。

## 機能

- **ポストプロセッシング**: Bloom エフェクトで美しいグロー表現
- **パーティクルシステム**: 1000 個のカラフルな光の粒子
- **アニメーション**: モデルの自動回転と浮遊
- **GUI コントローラー**: 各種パラメータを簡単に調整
- **ブラウン管テレビ風デザイン**: レトロポップな UI

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# ビルドのプレビュー
npm run preview
```

## GitHub Pages へのデプロイ

### 初回セットアップ

1. GitHub リポジトリを作成
2. リポジトリの Settings > Pages に移動
3. Source を "GitHub Actions" に設定
4. コードを push

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 自動デプロイ

main ブランチに push すると、GitHub Actions が自動的にビルドとデプロイを実行します。

デプロイ後、以下の URL でアクセスできます：

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

## 技術スタック

- **Three.js**: 3D グラフィックス
- **Vite**: ビルドツール
- **lil-gui**: GUI コントローラー
- **postprocessing**: ポストプロセッシングエフェクト
