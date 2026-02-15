# Aurora DSQL クラスターの作成とエンドポイントの用意

このドキュメントでは、AWS で Aurora DSQL クラスターを作成し、API から接続するためのエンドポイントを用意する手順を説明します。

---

## 前提条件

- AWS アカウント
- クラスターの作成と接続ができる IAM 権限（例: **AmazonAuroraDSQLConsoleFullAccess** マネージドポリシーが付いたユーザー／ロール）

---

## Step 1: Aurora DSQL クラスターを作成する

### 1. コンソールを開く

1. [AWS マネジメントコンソール](https://console.aws.amazon.com/) にサインインする
2. **Aurora DSQL** コンソールを開く:  
   [https://console.aws.amazon.com/dsql](https://console.aws.amazon.com/dsql)  
   （検索窓で「Aurora DSQL」や「DSQL」で検索しても可）

### 2. シングルリージョンクラスターを作成

1. **Create cluster**（クラスターを作成）をクリック
2. **Single-Region**（シングルリージョン）を選択
3. （任意）**Name** タグでクラスターの表示名を変更
4. （任意）**Cluster settings** で以下を変更可能:
   - **Customize encryption settings** … KMS キー
   - **Enable deletion protection** … 削除保護（デフォルトでオン）
   - **Resource-based policy** … アクセス制御
5. **Create cluster** をクリック

数分でクラスターが作成され、ステータスが **Active** になります。

---

## Step 2: エンドポイント（ホスト名）を確認する

### コンソールで確認

1. Aurora DSQL の **Clusters** 一覧で、作成したクラスターの **Cluster ID** をクリック
2. **Cluster details**（クラスターの詳細）を開く
3. **Endpoint** または **Host** に表示されているホスト名を控える

### エンドポイントの形式

多くの場合、次の形式です:

```
{クラスター識別子}.dsql.{リージョン}.on.aws
```

例（東京リージョン）:

```
abc0def1baz2quux3quuux4.dsql.ap-northeast-1.on.aws
```

- **クラスター識別子**: クラスター作成時に自動付与される一意の ID（Cluster ID）
- **リージョン**: クラスターを作成したリージョン（例: `ap-northeast-1`）

### AWS CLI で確認する場合

クラスター一覧と識別子の取得例:

```bash
aws dsql list-clusters --region ap-northeast-1
```

特定クラスターの情報（エンドポイントなど）を取得する場合は、利用可能な API に応じて `get-cluster` 等を参照してください。

---

## Step 3: API から接続するために必要な設定

### 1. IAM で接続を許可する

アプリケーション（API サーバー）が使う IAM ユーザーまたはロールに、Aurora DSQL への接続に必要な権限を付与します。

- 公式ドキュメント: [Authentication and authorization - Amazon Aurora DSQL](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/authentication-authorization.html)
- 典型的には **DbConnect** 系の権限や、Aurora DSQL 用のマネージドポリシーが必要です

### 2. 環境変数を設定する

API の `api/.env`（または実行環境の環境変数）に、Step 2 で控えたエンドポイントを設定します。

```env
AURORA_DSQL_HOST=あなたのクラスターID.dsql.ap-northeast-1.on.aws
AURORA_DSQL_USER=admin
AURORA_DSQL_DATABASE=postgres
```

- **AURORA_DSQL_HOST**: クラスターのエンドポイント（ホスト名のみ、`https://` やポートは付けない）
- **AURORA_DSQL_USER**: 通常は `admin`（IAM 認証で接続）
- **AURORA_DSQL_DATABASE**: 接続先データベース（既定は `postgres`）

### 3. AWS 認証を用意する

API を動かす環境で、次のいずれかが設定されている必要があります。

- **IAM ロール**（EC2 / ECS / Lambda などで API を動かす場合）
- **環境変数**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`（必要に応じて `AWS_SESSION_TOKEN`）
- **~/.aws/credentials**（ローカル開発時など）

この認証を使って、Aurora DSQL 用の IAM トークンが自動で発行され、`@aws/aurora-dsql-node-postgres-connector` が接続します。

---

## 接続の確認

1. 上記のとおり `api/.env` と AWS 認証を設定する
2. `cd api && npm run dev` で API を起動する
3. ログに「Aurora DSQL に接続し、items テーブルを準備しました。」と出れば、エンドポイントと認証の設定は問題ありません

---

## 参考リンク

- [Getting started with Aurora DSQL](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/getting-started.html)（英語）
- [Accessing Aurora DSQL with PostgreSQL-compatible clients](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/accessing.html)
- [Aurora DSQL の認証（トークン）](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/SECTION_authentication-token.html)
