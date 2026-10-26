docker compose up -d
sleep 3
# 如果使用本地 Docker，后台启动日志跟踪并添加 [DOCKER] 前缀，退出时自动终止
####################################
(docker compose logs -f 2>&1 | sed 's/^/[DOCKER] /') &
LOGS_PID=$!
trap "kill $LOGS_PID 2>/dev/null || true" EXIT
####################################
python3 -u py-run-script.py \
    --url "http://127.0.0.1:18189/sub-api/custom/convert" \
    --key "epYeobK02c6ee9ELuCkPAplZYyqAjOJN" \
    --target "all" \
    --iterations 2 \
    --timeout 60000

docker compose down