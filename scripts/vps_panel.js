/*
 * Surge 模块通用监控脚本 (vps_panel.js)
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

// 严格遵循常规脚本解析逻辑，读取外部拼接好的 $argument
const args = {};
if (typeof $argument !== 'undefined') {
    $argument.split('&').forEach(item => {
        const pair = item.split('=');
        if (pair[0]) args[pair[0]] = pair[1];
    });
}

const requestOpts = {
    url: args.url,
    headers: { 'X-Api-Key': args.key }
};

$httpClient.get(requestOpts, function(error, response, data) {
    if (error || response.status !== 200) {
        $done({
            title: args.name || "服务器监控",
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
            title: args.name || "服务器监控",
            content: content,
            icon: args.icon || "server.rack",
            "icon-color": "#34C759"
        });
    } catch (e) {
        $done({ title: "数据解析错误", content: "返回的不是标准JSON" });
    }
});
