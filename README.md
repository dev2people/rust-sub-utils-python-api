# rust-sub-utils-python-api

基于 `rust-sub-utils` 自定义订阅转换 HTTP API 的客户端工具与 GitHub Actions 自动更新工作流。

## 目录结构

```text
.
├── .github/workflows/
│   └── sub-convert.yml      # GitHub Actions 自动化定时转换并提交工作流
├── docker-compose.yaml       # 本地/CI 运行转换后端与测速服务的编排文件
├── input/
│   ├── sub-source/           # 订阅来源文件 (*.url, *.txt, *.yaml)
│   ├── sub-js/               # 后处理 JS 脚本 (按文件名升序执行)
│   └── sub-service/          # 后处理 HTTP 服务配置 (JSON 格式)
├── output/
│   ├── clash-out/
│   │   └── all-node.yaml     # 生成的 Clash 完整配置
│   └── v2rayn-out/
│       ├── all-node.txt      # 生成的 V2RayN Base64 订阅文本
│       └── all-node.v2rayn   # V2RayN 订阅别名
├── py-run-script.py          # 核心执行脚本：加载 input、请求 API、保存 output
├── test_convert_api.py       # 自动化测试脚本
└── requirements.txt          # Python 依赖
```

---

## 本地运行

1. 安装依赖：
```bash
pip install -r requirements.txt
```

2. 运行脚本：
```bash
# 默认连接本地服务 (http://127.0.0.1:18189/sub-api/custom/convert)
python py-run-script.py

# 或指定远程服务端与密钥
python py-run-script.py --url https://your-server.com/sub-api/custom/convert --key your-api-key --target all
```

---

## GitHub Actions 自动化与定时任务

工作流文件位于 [`.github/workflows/sub-convert.yml`](.github/workflows/sub-convert.yml)。

### 1. 触发方式
- **定时调度 (`schedule`)**：默认每 6 小时自动运行一次（对应北京时间 8:00、14:00、20:00、2:00）。可在 yml 中按需修改 cron 表达式。
- **手动触发 (`workflow_dispatch`)**：在 GitHub 仓库页面 Actions -> 选择工作流 -> 点击 "Run workflow"，支持选择转换格式（all / clash / v2rayn）及是否强制提交。
- **自动触发 (`push`)**：当修改 `input/` 目录中的节点源、JS 脚本或服务配置并推送至仓库时，将自动重新生成订阅。

### 2. 服务运行模式
工作流内置智能适配：
- **完全自动化模式（零外部依赖，默认）**：
  - 如果未配置任何外部服务器 Secret，GitHub Actions 将直接在 Runner 中利用 `docker compose up -d` 启动打包好的轻量后端与测速服务，完成转换并写入 `output/`。
- **外部服务器模式**：
  - 若在 GitHub 仓库 **Settings -> Secrets and variables -> Actions** 中配置了：
    - `SUB_API_URL`：例如 `https://your-domain.com/sub-api/custom/convert`
    - `SUB_API_KEY`：例如 `your-secret-key`
  - GitHub Actions 将直接向您的外部服务端发起转换请求，无需在 Action 中启动 Docker 容器。

### 3. 自动提交与权限设置
GitHub Actions 需要推送代码到仓库的写权限：
- 请确保仓库 **Settings -> Actions -> General -> Workflow permissions** 勾选为 **"Read and write permissions"**。
