# jovery - 个人代理规则库

本仓库用于存放个人使用的 Surge/Quantumult X 模块、规则及脚本。

## 目录结构
- `modules/` : 存放 .sgmodule 模块文件
- `rules/` : 存放 .list 分流规则
- `scripts/` : 存放 JavaScript 脚本

## 资源索引

### 📱 模块 (Modules)
| 功能 | 资源链接 |
| :--- | :--- |
| **Busuu** | [点击获取](https://raw.githubusercontent.com/vplkos/jovery/main/modules/busuu.sgmodule) |
| **VPS 极客监控面板** | [点击获取](https://raw.githubusercontent.com/vplkos/jovery/main/modules/vps_monitor.sgmodule) |

### 🌐 规则 (Rules)
| 功能 | 资源链接 |
| :--- | :--- |
| **众安银行 (ZA Bank)** | [点击获取](https://raw.githubusercontent.com/vplkos/jovery/main/rules/za-bank.list) |
| **Homebrew** | [点击获取](https://raw.githubusercontent.com/vplkos/jovery/refs/heads/main/rules/homebrew.list) |

### 🛠 脚本 (Scripts)
| 功能 | 资源链接 |
| :--- | :--- |
| **Busuu脚本** | [点击获取](https://raw.githubusercontent.com/vplkos/jovery/main/scripts/busuu.js) |
| **VPS面板解析脚本** | [点击获取](https://raw.githubusercontent.com/vplkos/jovery/main/scripts/vps_panel.js) |

---

## ⚡ 进阶项目：VPS 极客监控面板部署指南

本仓库内置了一套基于 **Go 后端 + Docker + Surge Panel** 的轻量级原生服务器指标监控方案。无虚拟化网络开销，支持多用户图形化参数配置。

### 1. 服务端部署 (VPS)

在你的 Linux 服务器上新建一个目录（推荐 `/opt/1panel/apps/secure-monitor`），创建 `docker-compose.yml` 文件并写入以下配置：

> ```yaml
> services:
>   secure-monitor:
>     image: hk2fs/secure-monitor:v2.0
>     container_name: secure-monitor
>     restart: always
>
>     network_mode: host
>     read_only: true
>
>     security_opt:
>       - no-new-privileges:true
>
>     environment:
>       - API_KEY=你的超级安全暗号密钥
>       - PORT=40728
>
>     volumes:
>       - /proc:/host/proc:ro
>       - /sys:/host/sys:ro
> ```

**启动服务：**
> ```bash
> docker compose up -d
> ```

💡 *注：启动后请记得在云服务器控制台（安全组/防火墙）中放行对应的 TCP 端口。*

### 2. 客户端配置 (Surge)

本仓库的 `vps_monitor.sgmodule` 已完美适配 Surge 正式版的参数设置功能（像素级向 Sub-Store 规范看齐），支持纯图形化修改，拒绝隐私泄露。

#### 简易安装步骤：
1. 打开 Surge，进入 **“模块 (Modules)”** 页面。
2. 点击 **“安装新模块”**，粘贴以下本仓库的模块原始链接：
   `https://raw.githubusercontent.com/vplkos/jovery/main/modules/vps_monitor.sgmodule`
3. 安装完成后，在模块列表中**单击该模块后的三个点，选择编辑参数** Surge 将自动弹出交互式配置菜单：
   * 📥 **后端地址**：填写你的服务器公网 IP 与端口（例如 `http://127.0.0.1:40728`）。
   * 🔑 **鉴权密钥**：填写你在 Docker 中配置的 `API_KEY`。
   * 🏷️ **面板标题**：自定义你显示在 Surge 首页的服务器名称。
   * 🎨 **面板图标**：可自由更换 SF Symbols 图标（如 `party.popper` 或 `server.rack`）。
   * ⏱️ **刷新间隔**：建议保持默认的 `15` 秒或 `30` 秒，兼顾实时性与省电。

保存并重载配置后，Surge 首页即可完美呈现高性能的原生 VPS 指标卡片。

---

## 说明
- 此仓库内容仅供学习与交流使用。
- 若规则失效，请检查对应的链接是否已更新。
