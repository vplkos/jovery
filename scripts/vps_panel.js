/*
 * Surge 模块专用通用监控脚本 (vps_panel.js)
 */

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor((seconds % (3600*24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}天${h}时${m}分`;
}

// 核心改动：优先读取模块自带的图形化配置参数 $arguments
let args = {};
if (typeof $arguments !== 'undefined') {
    args = $arguments;
} else if (typeof $argument !== 'undefined') {
    // 兼容老版本的文本参数形式
    $argument.split('&').forEach(item => {
        const pair = item.split('=');
        args[pair[0]] = pair[1];
    });
}

// 设置默认兜底值
const targetUrl = args.url || "http://127.0.0.1:40728";
const targetKey = args.key || "your_super_secret_key";
const panelName = args.name || "Server Info";
const panelIcon = args.icon || "party.popper";

const requestOpts = {
    url: targetUrl,
    headers: { 'X-Api-Key': targetKey }
};

$httpClient.get(requestOpts, function(error, response, data) {
    if (error || response.status !== 200) {
        $done({
            title: panelName,
            content: "❌ 连接失败: 请检查网络、端口或密钥",
            icon: "exclamationmark.triangle",
            "icon-color": "#FF3B30"
        });
        return;
    }

    try {
        const stats = JSON.parse(data);
        const content = 
            `CPU: ${stats.cpu_usage}%  |  内存: ${stats.mem_usage}%\n` +
            `流量: ↓${formatBytes(stats.bytes_recv)}  ↑${formatBytes(stats.bytes_sent)}\n` +
            `在线: ${formatUptime(stats.uptime)}`;

        $done({
            title: panelName,
            content: content,
            icon: panelIcon,
            "icon-color": "#34C759"
        });
    } catch (e) {
        $done({ title: "数据解析错误", content: "返回的不是标准JSON" });
    }
});
