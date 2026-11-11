// VPS Monitor Panel — Surge panel script
// 拉两台服务器的 /metrics (vps-agent)，按指定版式显示 CPU/内存/磁盘/流量/在线时间。
// 参数由模块的 argument= 传入（见 .sgmodule），标题、图标、颜色、节点名、地址、Token 都可自定义。
// Surge $httpClient 只支持回调，不支持 await，所以两台顺序拉。

function arg(key, def) {
  var v = ($argument && $argument[key]) ? String($argument[key]).trim() : "";
  return v ? v : def;
}

// argument= 传入小写 key；同时兼容模块 #!arguments 的大写 key
function getArg(lower, upper, def) {
  var v = arg(lower, "");
  if (v) return v;
  return arg(upper, def);
}

var TITLE = getArg("title", "TITLE", "甲骨文服务器监控");
var ICON = getArg("icon", "ICON", "server.rack");
var ICON_COLOR = getArg("color", "ICON_COLOR", "#58A6FF");
var TOKEN = getArg("token", "TOKEN", "");

// 地址和端口合在一起填，格式 IP:端口，例如 152.70.85.214:9100
function parseAddr(s, defHost, defPort) {
  var parts = String(s || "").split(":");
  var host = (parts[0] || "").trim() || defHost;
  var port = parseInt(parts[1], 10);
  if (!port || port < 1 || port > 65535) port = defPort;
  return { host: host, port: port };
}

var n1 = parseAddr(getArg("node1", "NODE1", "152.70.85.214:9100"), "152.70.85.214", 9100);
var n2 = parseAddr(getArg("node2", "NODE2", "161.33.41.236:9100"), "161.33.41.236", 9100);

var NODES = [
  { name: getArg("node1_name", "NODE1_NAME", "Osaka01"), host: n1.host, port: n1.port },
  { name: getArg("node2_name", "NODE2_NAME", "Osaka02"), host: n2.host, port: n2.port }
];

function fmtBytes(n) {
  if (n >= 1073741824) return (n / 1073741824).toFixed(2) + " GB";
  if (n >= 1048576) return (n / 1048576).toFixed(2) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(2) + " KB";
  return n + " B";
}

function fmtTime(ts) {
  var d = new Date(ts * 1000);
  var h = d.getHours();
  var m = d.getMinutes();
  return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
}

function fmtUptime(sec) {
  var d = Math.floor(sec / 86400);
  var h = Math.floor((sec % 86400) / 3600);
  var m = Math.floor((sec % 3600) / 60);
  if (d > 0) return d + "天" + h + "小时" + m + "分";
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
      lines.push(node.name + " ｜ CPU " + m.cpu_percent + "% | 内存 " + m.mem_percent + "%");
      lines.push("流量： ↑ " + fmtBytes(m.net_tx_bytes) + " ↓ " + fmtBytes(m.net_rx_bytes) + " | 磁盘 " + m.disk_percent + "%");
      lines.push("在线：" + fmtUptime(m.uptime_seconds));
    });
    // 注意：$done 里传了 style 就不能自定义图标，所以这里不传 style，
    // 改传 icon + icon-color（官网手册 More Customization 一节）。
    // 有节点离线时图标变红提示。
    $done({
      title: TITLE + " | 时间 " + fmtTime(Math.floor(Date.now() / 1000)),
      content: lines.join("\n"),
      icon: ICON,
      "icon-color": allOk ? ICON_COLOR : "#FF453A"
    });
  });
});
