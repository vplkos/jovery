// VPS Monitor Panel — Surge panel script
// 拉两台 Oracle 小鸡的 /metrics (vps-agent, :9100)，显示 CPU/内存/磁盘/上下行/负载/运行时间。
// Token 不写在脚本里，走模块参数 $argument.TOKEN (与 vps-agent 的 VPS_MONITOR_TOKEN 一致)。
// Surge $httpClient 只支持回调，不支持 await，所以两台顺序拉。

var NODES = [
  { name: "Oracle-01", host: "152.70.85.214", port: 9100 },
  { name: "Oracle-02", host: "161.33.41.236", port: 9100 }
];

var TOKEN = ($argument && $argument.TOKEN) ? $argument.TOKEN : "";

function fmtRate(bps) {
  if (bps >= 1048576) return (bps / 1048576).toFixed(1) + " MB/s";
  if (bps >= 1024) return (bps / 1024).toFixed(1) + " KB/s";
  return bps + " B/s";
}

function fmtUptime(sec) {
  var d = Math.floor(sec / 86400);
  var h = Math.floor((sec % 86400) / 3600);
  var m = Math.floor((sec % 3600) / 60);
  if (d > 0) return d + "天" + h + "小时";
  if (h > 0) return h + "小时" + m + "分";
  return m + "分";
}

function fetchNode(node, cb) {
  $httpClient.get({
    url: "http://" + node.host + ":" + node.port + "/metrics",
    headers: { "X-Monitor-Token": TOKEN }
  }, function (error, response, data) {
    if (error) { cb(null); return; }
    try {
      cb(JSON.parse(data));
    } catch (e) {
      cb(null);
    }
  });
}

fetchNode(NODES[0], function (m1) {
  fetchNode(NODES[1], function (m2) {
    var lines = [];
    var allOk = true;
    [[NODES[0], m1], [NODES[1], m2]].forEach(function (pair) {
      var node = pair[0], m = pair[1];
      if (!m) {
        allOk = false;
        lines.push(node.name + " 离线");
        return;
      }
      lines.push(node.name + " CPU " + m.cpu_percent + "% | 内存 " + m.mem_percent + "% | 磁盘 " + m.disk_percent + "%");
      lines.push("↓ " + fmtRate(m.net_rx_bps) + " ↑ " + fmtRate(m.net_tx_bps) + " | 负载 " + m.load1.toFixed(2) + " | 运行 " + fmtUptime(m.uptime_seconds));
    });
    $done({
      title: "小鸡监控",
      content: lines.join("\n"),
      style: allOk ? "good" : "error"
    });
  });
});
