if (typeof $response !== "undefined" && $response.body) {
    let body = $response.body;
    let url = $request.url;
    try {
        let obj = JSON.parse(body);
        
        // 1. 爆破 Iterable 弹窗广告
        if (url.includes("iterable.com") || obj.placements) {
            obj.placements = [];
            console.log("Tandem本地拦截: 成功抹除 Iterable 弹窗");
        }
        
        // 2. 爆破 Matcha 社区精选流推荐
        if (url.includes("highlighted_profiles") || url.includes("matcha") || obj.items) {
            obj.items = [];
            console.log("Tandem本地拦截: 成功清空 Matcha 精选流");
        }
        
        // 3. 智能判定 Pro 权益注入（不再绑定死域名，只要结构包含 data 且有会员倾向就注入）
        if (obj.data && (obj.data.is_pro !== undefined || obj.data.translation_limit !== undefined)) {
            obj.data.is_pro = true;
            obj.data.pro_expiry_date = "2088-06-25T12:00:00Z";
            obj.data.translation_limit = 99999;
            obj.data.has_pro_badge = true;
            console.log("Tandem本地拦截: data 层核心资产解锁成功");
        } else if (obj.profile) {
            obj.profile.is_pro = true;
            obj.profile.pro_expiry_date = "2088-06-25T12:00:00Z";
            console.log("Tandem本地拦截: profile 层资产解锁成功");
        }
        
        body = JSON.stringify(obj);
    } catch (e) {
        console.log("Tandem本地拦截: JSON 解析跳过或报错 -> " + e);
    }
    $done({ body });
} else {
    $done({});
}
