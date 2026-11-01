#!/usr/bin/env python3
"""生成桶内插件首页索引：loonlab/Plugin/index.json

只读每个 .lpx 文件的头部元数据（#!name / #!desc / #!icon / #!tag），
不读、不下载插件正文里的脚本文件。生成后 Worker 首页一次请求
就能拿到全部 89 个插件的图标和描述，不用每次 89 次并行拉头。

用法（和搬库同一套写桶密钥，走环境变量）：
  OCI_S3_ACCESS_KEY=... OCI_S3_SECRET_KEY=... python3 make-loonlab-index.py
也可以放进搬库的 GitHub Actions 里，同步完插件后顺手跑一次。
"""
import json
import os
from botocore.config import Config
import re

BUCKET = "bucket-20261027-2259"
NAMESPACE = "ax4ipoedc7nq"
ENDPOINT = f"https://{NAMESPACE}.compat.objectstorage.ap-osaka-1.oraclecloud.com"
PREFIX = "loonlab/Plugin/"


def main():
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
    keys = []
    token = None
    while True:
        kw = {"Bucket": BUCKET, "Prefix": PREFIX}
        if token:
            kw["ContinuationToken"] = token
        resp = s3.list_objects_v2(**kw)
        keys += [o["Key"] for o in resp.get("Contents", []) if o["Key"].lower().endswith(".lpx")]
        token = resp.get("NextContinuationToken")
        if not token:
            break
    items = []
    for key in sorted(keys):
        file = key.rsplit("/", 1)[-1]
        head = s3.get_object(Bucket=BUCKET, Key=key)["Body"].read(8192).decode("utf-8", "ignore")
        def get(k):
            m = re.search(rf"^#!{k}\s*=\s*(.+)$", head, re.M)
            return m.group(1).strip() if m else ""
        items.append({
            "file": file,
            "name": get("name") or file[:-4],
            "desc": get("desc").replace("\\n", " "),
            "icon": get("icon"),
            "tag": get("tag"),
        })
    s3.put_object(
        Bucket=BUCKET, Key=f"{PREFIX}index.json",
        Body=json.dumps(items, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json; charset=utf-8",
    )
    print(f"完成：{len(items)} 个插件写入 {PREFIX}index.json")


if __name__ == "__main__":
    main()
