let body = $response.body;
try {
    let obj = JSON.parse(body);
    
    // ---- 1. 拦截用户资料包：注入 Pro 会员特权与无限翻译 ----
    if (obj.data && (obj.data.is_pro !== undefined || obj.data.translation_limit !== undefined)) {
        obj.data.is_pro = true;
        obj.data.pro_expiry_date = "2088-06-25T12:00:00Z";
        obj.data.translation_limit = 99999;
        obj.data.has_pro_badge = true;
        console.log("Tandem Pro: 成功注入高级会员身份与无限翻译");
    } else if (obj.profile) {
        obj.profile.is_pro = true;
        obj.profile.pro_expiry_date = "2088-06-25T12:00:00Z";
        console.log("Tandem Pro: 成功注入 Profile 会员状态");
    }
    
    // ---- 2. 拦截广告投放包（就是你刚刚发我的这段 JSON）：直接将广告强行清空 ----
    if (obj.placements) {
        // 直接清空所有的投放位置，让所有 Pro 促销、横幅、弹窗彻底消失
        obj.placements = [];
        console.log("Tandem Pro: 成功拦截广告投放，已执行斩草除根清空");
    }

    body = JSON.stringify(obj);
} catch (e) {
    console.log("Tandem 智能脚本执行崩溃: " + e);
}
$done({ body });
