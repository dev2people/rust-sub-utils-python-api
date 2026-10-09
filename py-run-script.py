#!/usr/bin/env python3
"""
负责调用自定义订阅转换 API 的工具
订阅来源： input/sub-source
订阅脚本: input/sub-js
订阅处理服务: input/sub-service
订阅输出clash： output/clash-out/all-node.yaml
订阅输出v2rayn： output/v2rayn-out/all-node.txt (同时写入 all-node.v2rayn)
api服务: http://localhost:18189 (默认)
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("[错误] 未找到 requests 模块，请运行 pip install requests")
    sys.exit(1)

# 基础目录配置（以脚本所在目录为准）
BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

SUB_SOURCE_DIR = INPUT_DIR / "sub-source"
SUB_JS_DIR = INPUT_DIR / "sub-js"
SUB_SERVICE_DIR = INPUT_DIR / "sub-service"

CLASH_OUT_FILE = OUTPUT_DIR / "clash-out" / "all-node.yaml"
V2RAYN_OUT_TXT = OUTPUT_DIR / "v2rayn-out" / "all-node.txt"
V2RAYN_OUT_V2RAYN = OUTPUT_DIR / "v2rayn-out" / "all-node.v2rayn"

# 默认配置
DEFAULT_API_BASE = os.environ.get("API_BASE_URL", "http://localhost:18189")
DEFAULT_API_KEY = os.environ.get("API_AUTH_KEY", "epYeobK02c6ee9ELuCkPAplZYyqAjOJN")


def parse_relaxed_json(text: str) -> dict:
    """解析宽松的 JSON / JS 对象字符串（支持无引号键名和末尾逗号）"""
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    # 1. 去除尾随逗号 (例如 , } -> })
    clean = re.sub(r',\s*([}\]])', r'\1', text)
    # 2. 补齐无双引号的 key (例如 name: "abc" -> "name": "abc")
    clean = re.sub(r'([{,\s])(\w+)\s*:', r'\1"\2":', clean)
    try:
        return json.loads(clean)
    except Exception:
        pass

    # 3. 兜底正则提取字段
    name_m = re.search(r'name\s*:\s*["\']([^"\']+)["\']', text)
    url_m = re.search(r'url\s*:\s*["\']([^"\']+)["\']', text)
    token_m = re.search(r'token\s*:\s*["\']([^"\']+)["\']', text)
    type_m = re.search(r'type\s*:\s*["\']([^"\']+)["\']', text)
    return {
        "name": name_m.group(1) if name_m else "",
        "url": url_m.group(1) if url_m else "",
        "token": token_m.group(1) if token_m else "",
        "type": type_m.group(1) if type_m else "sub-service",
    }


def load_sources() -> list:
    """加载 input/sub-source 中的所有节点来源"""
    sources = []
    if not SUB_SOURCE_DIR.exists():
        print(f"[警告] 目录不存在: {SUB_SOURCE_DIR}")
        return sources

    for file_path in sorted(SUB_SOURCE_DIR.iterdir()):
        if file_path.is_file() and not file_path.name.startswith("."):
            fname = file_path.name.lower()
            content = file_path.read_text(encoding="utf-8").strip()
            if not content:
                continue

            if fname.endswith(".yaml") or fname.endswith(".yml"):
                sources.append({
                    "name": file_path.stem,
                    "sub_node_type": "YAML",
                    "content": content,
                })
            else:
                # 默认按行解析 URL
                lines = [
                    line.strip()
                    for line in content.splitlines()
                    if line.strip() and not line.strip().startswith("#")
                ]
                url_type = "AUTO"
                if "v2ray" in fname:
                    url_type = "V2RAY_N"
                elif "clash" in fname:
                    url_type = "CLASH"

                for u in lines:
                    sources.append({
                        "name": file_path.stem,
                        "sub_node_type": "URL",
                        "url": u,
                        "url_type": url_type,
                    })

    print(f"[信息] 成功加载 {len(sources)} 个节点来源")
    return sources


def load_scripts() -> list:
    """加载 input/sub-js 中的所有后处理 JS 脚本（按文件名升序）"""
    scripts = []
    if not SUB_JS_DIR.exists():
        print(f"[警告] 目录不存在: {SUB_JS_DIR}")
        return scripts

    for file_path in sorted(SUB_JS_DIR.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() == ".js":
            content = file_path.read_text(encoding="utf-8").strip()
            if content:
                scripts.append({
                    "name": file_path.stem,
                    "content": content,
                })

    print(f"[信息] 成功加载 {len(scripts)} 个后处理 JS 脚本: {[s['name'] for s in scripts]}")
    return scripts


def load_services() -> list:
    """加载 input/sub-service 中的所有后处理服务（按文件名升序）"""
    services = []
    if not SUB_SERVICE_DIR.exists():
        print(f"[警告] 目录不存在: {SUB_SERVICE_DIR}")
        return services

    for file_path in sorted(SUB_SERVICE_DIR.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() == ".json":
            raw_text = file_path.read_text(encoding="utf-8")
            data = parse_relaxed_json(raw_text)
            if data and data.get("url"):
                services.append(data)

    print(f"[信息] 成功加载 {len(services)} 个后处理服务: {[s.get('name', s.get('url')) for s in services]}")
    return services


def run_convert(api_base: str, api_key: str, target: str = "all", timeout: int = 500):
    """组装请求调用后台转换 API 并保存结果"""
    # 构造 API URL（支持传入基础地址或完整路径）
    if api_base.endswith("/sub-api/custom/convert") or api_base.endswith("/api/custom/convert"):
        api_url = api_base
    else:
        api_url = api_base.rstrip("/") + "/sub-api/custom/convert"

    sources = load_sources()
    scripts = load_scripts()
    services = load_services()

    payload = {
        "sources": sources,
        "scripts": scripts,
        "services": services,
        "target": target,
    }

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    }

    print(f"\n[请求] 发送自定义转换请求至: {api_url}")
    print(f"       节点源数量: {len(sources)}, 脚本数量: {len(scripts)}, 服务数量: {len(services)}")

    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        print(f"[错误] 请求发送失败: {e}")
        sys.exit(1)

    if response.status_code != 200:
        print(f"[错误] 服务端返回 HTTP {response.status_code}: {response.text}")
        sys.exit(1)

    try:
        res_json = response.json()
    except Exception as e:
        print(f"[错误] 解析响应 JSON 失败: {e}, 原始内容:\n{response.text[:300]}")
        sys.exit(1)

    code = res_json.get("code")
    if code != "200" and code != 200:
        err_msg = res_json.get("message") or res_json.get("msg") or "未知错误"
        print(f"[错误] 业务处理失败: {err_msg}")
        sys.exit(1)

    data = res_json.get("result") or res_json.get("data") or {}
    proxies_count = data.get("proxies_count", 0)
    clash_content = data.get("clash")
    v2rayn_content = data.get("v2rayn")

    print(f"\n[响应] 转换完成！解析到代理节点总数: {proxies_count}")

    # 写入 Clash 输出
    if clash_content is not None:
        CLASH_OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        CLASH_OUT_FILE.write_text(clash_content, encoding="utf-8")
        print(f"[成功] Clash 配置已写入: {CLASH_OUT_FILE} (大小: {len(clash_content)} 字节)")

    # 写入 V2RayN 输出
    if v2rayn_content is not None:
        V2RAYN_OUT_TXT.parent.mkdir(parents=True, exist_ok=True)
        V2RAYN_OUT_TXT.write_text(v2rayn_content, encoding="utf-8")
        V2RAYN_OUT_V2RAYN.write_text(v2rayn_content, encoding="utf-8")
        print(f"[成功] V2RayN 配置已写入: {V2RAYN_OUT_TXT} 和 {V2RAYN_OUT_V2RAYN} (大小: {len(v2rayn_content)} 字节)")


def main():
    parser = argparse.ArgumentParser(description="自定义订阅转换 API 客户端工具")
    parser.add_argument(
        "--url",
        default=DEFAULT_API_BASE,
        help=f"API 服务基础地址 (默认: {DEFAULT_API_BASE})",
    )
    parser.add_argument(
        "--key",
        default=DEFAULT_API_KEY,
        help="API 认证密钥 (默认使用 API_AUTH_KEY 环境变量或预设密钥)",
    )
    parser.add_argument(
        "--target",
        default="all",
        choices=["all", "clash", "v2rayn"],
        help="转换目标格式: all | clash | v2rayn (默认: all)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=500,
        help="请求超时时间秒数 (默认: 500)",
    )
    args = parser.parse_args()

    run_convert(api_base=args.url, api_key=args.key, target=args.target, timeout=args.timeout)


if __name__ == "__main__":
    main()
