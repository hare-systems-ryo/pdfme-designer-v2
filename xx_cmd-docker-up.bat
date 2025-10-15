@echo off
docker compose --env-file .env down
@REM detach > デタッチモード（コンテナをバックグラウンドで起動）
docker compose --env-file .env up -d --build
docker compose --env-file .env logs -f
cmd /k
