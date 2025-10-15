# 📄 pdf-me-editor

**pdf-me-editor** は、[pdfme](https://pdfme.com/) のテンプレートエディタをベースに、  
**リスト構造の編集をより直感的に行えるよう拡張したアプリケーション**です。

このアプリは **Docker Compose** を用いてローカル環境で手軽に起動できます。

---

## 🚀 特徴

* pdfme 公式エディタを拡張し、複数要素のリスト編集をサポート  
* Node.js + Docker 環境でローカル動作  

---

## 🧰 セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. Docker コンテナ起動

```bash
docker compose up -d --build
```

### 4. 起動後、ブラウザで以下へアクセスします：

👉 http://localhost:3000

（docker-compose.yml の設定により、ポート番号が異なる場合があります）
