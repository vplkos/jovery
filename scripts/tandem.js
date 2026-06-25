let body = $response.body;
let url = $request.url;

try {
    let obj = JSON.parse(body);
    
    // ---- 1. 拦截 Iterable 弹窗广告（斩草除根） ----
    if (url.includes("iterable.com") || obj.placements) {
        obj.placements = [];
        console.log("Tandem Pro: 已物理抹除 Iterable 第三方牛皮癣广告");
    }
    
    // ---- 2. 拦截 Matcha 社区精选流（干掉社区顶部的 Pro 推广轮播） ----
    if (url.includes("highlighted_profiles") && obj.items) {
        obj.items = []; // 直接清空精选推荐，消灭原生信息流广告
        console.log("Tandem Pro: 已清空社区顶部精选推荐会员横幅");
    }
    
    // ---- 3. 拦截 Tandem 官方资产（注入 Pro 会员特权与无限翻译） ----
    if (url.includes("api.tandem.net")) {
        if (obj.data) {
            obj.data.is_pro = true;
            obj.data.pro_expiry_date = "2088-06-25T12:00:00Z";
            obj.data.translation_limit = 99999;
            obj.data.has_pro_badge = true;
            console.log("Tandem Pro: 核心资产 Pro 权益注入成功");
        } else if (obj.profile) {
            obj.profile.is_pro = true;
            obj.profile.pro_expiry_date = "2088-06-25T12:00:00Z";
            console.log("Tandem Pro: Profile 资产 Pro 权益注入成功");
        }
    }

    body = JSON.stringify(obj);
} catch (e) {
    console.log("Tandem 智能脚本执行跳过或崩溃: " + e);
}

$done({ body });
