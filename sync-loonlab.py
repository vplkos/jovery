#!/usr/bin/env python3
"""线上自动搬库：上游 LoonLab -> OCI 桶，直接覆盖同名文件。

用法（GitHub Actions 里跑，密钥全部走环境变量，不写进代码）：
  OCI_S3_ACCESS_KEY=... OCI_S3_SECRET_KEY=... python3 sync-loonlab.py

规则（用户 2026-11-01 定）：
- 同一个桶 bucket-20261027-2259，前缀 loonlab/Plugin/，不建新桶；
- 新增的加进来，更新的直接覆盖同名文件，地址不变；
- 上游删了的，桶里先留着不删；
- 上游来源：GitHub sooyaaabo/LoonLab 仓库的 .lpx 文件，及其 .lpx 里
  script(...) 引用的 .js 文件（按桶里既有结构存为 JS/https:/<host>/<path>）。

上传走 OCI S3 兼容地址，需要 boto3（Actions 里 pip install boto3）。
本脚本不输出任何密钥，只打印新增 / 覆盖 / 跳过（内容相同）的数量。
"""
import hashlib
import json
import os
from botocore.config import Config
import re
import subprocess
import sys
import urllib.request

UPSTREAM_OWNER = "sooyaaabo"
UPSTREAM_REPO = "LoonLab"
BUCKET = "bucket-20261027-2259"
NAMESPACE = "ax4ipoedc7nq"
ENDPOINT = f"https://{NAMESPACE}.compat.objectstorage.ap-osaka-1.oraclecloud.com"
PREFIX = "loonlab/Plugin/"


def gh_api(path):
    req = urllib.request.Request(
        f"https://api.github.com/{path}",
        headers={"Accept": "application/vnd.github+json", "User-Agent": "loonlab-sync"},
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def download(url):
    req = urllib.request.Request(url, headers={"User-Agent": "loonlab-sync"})
    with urllib.request.urlopen(req) as r:
        return r.read()


def main():
    # 1. 列上游仓库所有 .lpx（GitHub API 递归树，公开仓库无需 token）
    tree = gh_api(f"repos/{UPSTREAM_OWNER}/{UPSTREAM_REPO}/git/trees/HEAD?recursive=1")
    lpx_paths = [t["path"] for t in tree.get("tree", []) if t["path"].lower().endswith(".lpx")]
    print(f"上游 .lpx：{len(lpx_paths)} 个")

    # 2. 收集待上传文件：.lpx 本身 + 它引用的 .js
    jobs = []  # (bucket_key, bytes, content_type)
    for path in lpx_paths:
        name = path.rsplit("/", 1)[-1]
        data = download(f"https://raw.githubusercontent.com/{UPSTREAM_OWNER}/{UPSTREAM_REPO}/HEAD/{path}")
        jobs.append((f"{PREFIX}{name}", data, "text/plain; charset=utf-8"))
        text = data.decode("utf-8", "ignore")
        for scheme, rest in re.findall(r'(https?):\/\/([^\s"\'\)]+?\.js)', text):
            if "workers.dev" in rest or "jovery.site" in rest:
                continue
            js_url = f"{scheme}://{rest}"
            try:
                js_data = download(js_url)
            except Exception as e:
                print(f"跳过 JS 下载失败：{js_url} ({e})")
                continue
            jobs.append((f"{PREFIX}JS/{scheme}:/{rest}", js_data, "application/javascript; charset=utf-8"))

    # 3. 用 S3 兼容接口上传，直接覆盖同名对象
    import boto3
    s3 = boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        aws_access_key_id=os.environ["OCI_S3_ACCESS_KEY"],
        aws_secret_access_key=os.environ["OCI_S3_SECRET_KEY"],
        region_name="ap-osaka-1",
        # OCI S3 不支持 AWS chunked encoding：关掉灵活校验和，
        # 否则新版 botocore 发 STREAMING-AWS4-HMAC-SHA256-PAYLOAD 会被 OCI 以 NotImplemented 拒绝。
        config=Config(signature_version="s3v4", request_checksum_calculation="when_required", response_checksum_validation="when_required"),
    )
    added = overwritten = 0
    for key, data, ctype in jobs:
        try:
            old = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()
            if hashlib.sha256(old).hexdigest() == hashlib.sha256(data).hexdigest():
                continue
            overwritten += 1
        except Exception:
            added += 1
        s3.put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=ctype)
    print(f"完成：新增 {added} 个，覆盖更新 {overwritten} 个，其余内容相同跳过")


if __name__ == "__main__":
    main()
