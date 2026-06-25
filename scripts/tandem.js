let body = $response.body;
let url = $request.url;

try {
    let obj = JSON.parse(body);
    
    // ---- 1. 拦截 Iterable 广告包：精准斩草除根 ----
    if (url.includes("iterable.com") || obj.placements) {
        obj.placements = [];
        console.log("Tandem Pro: 成功抹除 Iterable 第三方牛皮癣广告");
    }
    
    // ---- 2. 拦截 Tandem 官方资产：注入 Pro 权益与无限翻译 ----
    if (url.includes("tandem.net")) {
        if (obj.data) {
            obj.data.is_pro = true;
            obj.data.pro_expiry_date = "2088-06-25T12:00:00Z";
            obj.data.translation_limit = 99999;
            obj.data.has_pro_badge = true;
            console.log("Tandem Pro: 官方核心资产注入成功");
        } else if (obj.profile) {
            obj.profile.is_pro = true;
            obj.profile.pro_expiry_date = "2088-06-25T12:00:00Z";
            console.log("Tandem Pro: Profile 资产注入成功");
        }
    }

    body = JSON.stringify(obj);
} catch (e) {
    console.log("Tandem 智能脚本执行崩溃: " + e);
}

$done({ body });
