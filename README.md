# Marius — 个人代理规则库

本仓库用于存放个人使用的 **Surge 模块、Loon 规则及脚本**。

> 本仓库内容仅供学习与交流使用。若规则、脚本或模块失效，请检查仓库是否已有更新。

## 📦 资源索引

### 📱 模块（Modules）

| 功能 | 资源链接 |
| :--- | :--- |
| Busuu | https://raw.githubusercontent.com/vplkos/jovery/main/modules/busuu.sgmodule |
| VPS 监控面板 | https://raw.githubusercontent.com/vplkos/jovery/main/modules/vps_monitor.sgmodule |

### 🌐 规则（Rules）

规则文件本身不带策略列，引用时在 Loon / Surge 里指定策略组；Loon 远程规则更新后需下拉刷新才生效，GitHub raw 缓存可能延迟几分钟。

| 功能 | 资源链接 | 说明 |
| :--- | :--- | :--- |
| Muse | https://raw.githubusercontent.com/vplkos/jovery/main/rules/muse.list | muse.ai、meta.ai、metaaivm.com、meta.com、metaaiusercontent.com，5 条 |
| Busuu | https://raw.githubusercontent.com/vplkos/jovery/main/rules/busuu.list | busuu.com、purchasely.io、amplitude.com，3 条 |
| 众安银行 | https://raw.githubusercontent.com/vplkos/jovery/main/rules/za-bank.list | 5 条，直连用 |
| Homebrew | https://raw.githubusercontent.com/vplkos/jovery/main/rules/homebrew.list | brew.sh、formulae.brew.sh、ghcr.io、github.com 等 |
| 189 降温 | https://raw.githubusercontent.com/vplkos/jovery/main/rules/189_drop.list | jpush 等高频域名；**在 Surge 引入时策略必须手动选 REJECT-DROP** |

### 🛠 脚本（Scripts）

| 功能 | 资源链接 |
| :--- | :--- |
| Busuu 脚本 | https://raw.githubusercontent.com/vplkos/jovery/main/scripts/busuu.js |
| VPS 面板解析脚本 | https://raw.githubusercontent.com/vplkos/jovery/main/scripts/vps_panel.js |

## 📊 监控面板

轻量级原生服务器指标监控，基于 Go + Docker + Surge Panel。

详细说明见：[监控面板文档](MONITORING.md)
