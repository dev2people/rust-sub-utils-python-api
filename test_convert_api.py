#!/usr/bin/env python3
"""
自定义订阅转换 API 自动化测试脚本
测试覆盖：
1. 凭证校验测试：无密钥、错误密钥预期 401 认证拒绝
2. 鉴权通过测试：Header / Query / Body 各渠道密钥通过
3. 转换功能测试：多来源节点、多 JS 脚本链式处理
4. 端到端客户端工具测试：调用 py-run-script.py 并校验 output 输出文件
"""

import os
import subprocess
import sys
import unittest
from pathlib import Path
import requests

BASE_DIR = Path(__file__).resolve().parent
API_URL = os.environ.get("TEST_API_URL", "http://127.0.0.1:8189/sub-api/custom/convert")
API_KEY = os.environ.get("TEST_API_KEY", "epYeobK02c6ee9ELuCkPAplZYyqAjOJN")


class TestCustomConvertApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 简单检查服务是否可达
        try:
            requests.get(API_URL.replace("/sub-api/custom/convert", "/sub-api/login"), timeout=3)
        except Exception:
            print(f"[提示] 未能连上 {API_URL}，如未启动请先以 API_AUTH_KEY={API_KEY} 启动 backend 服务")

    def test_01_auth_rejected_without_key(self):
        """测试无密钥调用被拒绝"""
        payload = {"sources": [], "target": "all"}
        resp = requests.post(API_URL, json=payload, timeout=5)
        self.assertEqual(resp.status_code, 401, f"预期 401，实际收到 {resp.status_code}: {resp.text}")
        data = resp.json()
        msg = data.get("message") or data.get("msg") or ""
        self.assertIn("认证", msg)

    def test_02_auth_rejected_with_invalid_key(self):
        """测试错误密钥调用被拒绝"""
        payload = {"sources": [], "target": "all"}
        headers = {"X-API-Key": "wrong-key-value"}
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=5)
        self.assertEqual(resp.status_code, 401, f"预期 401，实际收到 {resp.status_code}: {resp.text}")

    def test_03_auth_success_with_header(self):
        """测试通过 X-API-Key 认证成功"""
        payload = {
            "sources": [
                {
                    "node_type": "YAML",
                    "content": "proxies:\n  - name: node-auth-test\n    type: ss\n    server: 1.2.3.4\n    port: 8388\n    cipher: aes-128-gcm\n    password: pwd",
                }
            ],
            "target": "clash",
        }
        headers = {"X-API-Key": API_KEY}
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=10)
        self.assertEqual(resp.status_code, 200, f"预期 200，实际收到 {resp.status_code}: {resp.text}")
        data = resp.json()
        self.assertEqual(str(data.get("code")), "200")
        res_data = data.get("result") or data.get("data") or {}
        self.assertEqual(res_data.get("proxies_count"), 1)
        self.assertIn("node-auth-test", res_data.get("clash", ""))

    def test_04_multi_source_and_js_pipeline(self):
        """测试多来源与 JS 脚本处理链"""
        yaml_source = """
proxies:
  - name: "HK-01"
    type: ss
    server: 1.1.1.1
    port: 8388
    cipher: aes-128-gcm
    password: pass
"""
        js_script = """
function main(cfgStr) {
    let cfg = JSON.parse(cfgStr);
    cfg.proxies.push({
        name: "US-JS-Node",
        type: "ss",
        server: "2.2.2.2",
        port: 8388,
        cipher: "aes-128-gcm",
        password: "pass"
    });
    return JSON.stringify(cfg);
}
"""
        payload = {
            "sources": [
                {"node_type": "YAML", "content": yaml_source},
            ],
            "scripts": [
                {"name": "add-node", "content": js_script}
            ],
            "target": "all",
        }
        headers = {"Authorization": f"Bearer {API_KEY}"}
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=10)
        self.assertEqual(resp.status_code, 200)
        res_data = resp.json().get("result") or resp.json().get("data") or {}
        self.assertEqual(res_data.get("proxies_count"), 2)
        clash_yaml = res_data.get("clash", "")
        self.assertIn("HK-01", clash_yaml)
        self.assertIn("US-JS-Node", clash_yaml)
        # 验证同时生成了 V2RayN 输出
        v2rayn = res_data.get("v2rayn", "")
        self.assertTrue(len(v2rayn) > 0)

    def test_05_py_run_script_cli_execution(self):
        """测试运行 py-run-script.py 命令行工具并验证输出文件"""
        script_path = BASE_DIR / "py-run-script.py"
        cmd = [
            sys.executable,
            str(script_path),
            "--url",
            API_URL,
            "--key",
            API_KEY,
            "--timeout",
            "30",
        ]
        result = subprocess.run(cmd, cwd=str(BASE_DIR), capture_output=True, text=True)
        print("\n--- py-run-script.py STDOUT ---")
        print(result.stdout)
        if result.stderr:
            print("--- py-run-script.py STDERR ---")
            print(result.stderr)

        self.assertEqual(result.returncode, 0, f"py-run-script.py 执行失败，退出码: {result.returncode}")

        # 检查输出文件是否存在
        clash_file = BASE_DIR / "output" / "clash-out" / "all-node.yaml"
        v2rayn_file = BASE_DIR / "output" / "v2rayn-out" / "all-node.txt"
        self.assertTrue(clash_file.exists(), f"未生成 {clash_file}")
        self.assertTrue(v2rayn_file.exists(), f"未生成 {v2rayn_file}")


if __name__ == "__main__":
    unittest.main()
