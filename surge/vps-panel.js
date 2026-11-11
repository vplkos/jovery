// VPS Monitor Panel — Surge panel script
// 拉两台服务器的 /metrics (vps-agent, :9100)，显示 CPU/内存/磁盘/上下行/累计流量/运行时间。
// 全部走模块参数 $argument：标题、节点名、地址、端口、Token 都能在模块设置里改，任何人填自己的服务器就能用。
// Surge $httpClient 只支持回调，不支持 await，所以两台顺序拉。

function arg(key, def) {
  var v = ($argument && $argument[key]) ? String($argument[key]).trim() : "";
  return v ? v : def;
}

var TITLE = arg("TITLE", "小鸡监控");
var ICON = arg("ICON", "server.rack");
var ICON_COLOR = arg("ICON_COLOR", "#58A6FF");
var TOKEN = arg("TOKEN", "");

// 地址和端口合在一起填，格式 IP:端口，例如 152.70.85.214:9100
function parseAddr(s, defHost, defPort) {
  var parts = String(s || "").split(":");
  var host = (parts[0] || "").trim() || defHost;
  var port = parseInt(parts[1], 10);
  if (!port || port < 1 || port > 65535) port = defPort;
  return { host: host, port: port };
}

var n1 = parseAddr(arg("NODE1", "152.70.85.214:9100"), "152.70.85.214", 9100);
var n2 = parseAddr(arg("NODE2", "161.33.41.236:9100"), "161.33.41.236", 9100);

var NODES = [
  { name: arg("NODE1_NAME", "Oracle-01"), host: n1.host, port: n1.port },
  { name: arg("NODE2_NAME", "Oracle-02"), host: n2.host, port: n2.port }
];

function fmtRate(bps) {
  if (bps >= 1048576) return (bps / 1048576).toFixed(1) + " MB/s";
  if (bps >= 1024) return (bps / 1024).toFixed(1) + " KB/s";
  return bps + " B/s";
}

function fmtBytes(n) {
  if (n >= 1073741824) return (n / 1073741824).toFixed(1) + " GB";
  if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
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
      lines.push("↓ " + fmtRate(m.net_rx_bps) + " ↑ " + fmtRate(m.net_tx_bps) + " | 累计 ↓ " + fmtBytes(m.net_rx_bytes) + " ↑ " + fmtBytes(m.net_tx_bytes) + " | 运行 " + fmtUptime(m.uptime_seconds));
    });
    // 注意：$done 里传了 style 就不能自定义图标，所以这里不传 style，
    // 改传 icon + icon-color（官网手册 More Customization 一节）。
    // 有节点离线时图标变红提示。
    $done({
      title: TITLE,
      content: lines.join("\n"),
      icon: ICON,
      "icon-color": allOk ? ICON_COLOR : "#FF453A"
    });
  });
});
