if (typeof $response !== "undefined" && $response.body) {
    let url = $request.url;
    try {
        let obj = JSON.parse($response.body);
        // 只要包含了敏感的会员、用户、属性、配置字段，直接在日志里打印它的结构
        if (url.includes("user") || url.includes("profile") || url.includes("attributes") || url.includes("config")) {
            console.log("=== 🛰️ 捕获到可疑鉴权接口 ===");
            console.log("URL: " + url);
            console.log("JSON 键名: " + Object.keys(obj).join(", "));
            if (obj.data) console.log("data 内层键名: " + Object.keys(obj.data).join(", "));
        }
    } catch (e) {
        // 忽略非 JSON 响应
    }
}
$done({});
