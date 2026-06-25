let url = $request.url;
let body = $response.body;

try {
    // ---- 1. 强力攻破 Amplitude（强制激活所有 AI & Plus 特权开关） ----
    if (url.indexOf("amplitude") !== -1 || url.indexOf("vardata") !== -1) {
        let obj = JSON.parse(body);
        
        for (let key in obj) {
            // 针对所有包含高级、AI、教练、错题本相关的核心特权，直接下发最高指令
            if (key.includes("coach") || key.includes("ai") || key.includes("mistakes") || key.includes("premium") || key.includes("paywall")) {
                obj[key].key = "on";
                obj[key].value = "on";
                if (obj[key].metadata) {
                    obj[key].metadata.segmentName = "Premium users";
                }
            }
            
            // 把所有处于对照组(control)的实验，全部强制推向生效组(treatment)
            if (obj[key].key === "control") obj[key].key = "treatment";
            if (obj[key].value === "control") obj[key].value = "treatment";
            
            // 洗脑用户标签
            if (obj[key].metadata && obj[key].metadata.segmentName === "Free users") {
                obj[key].metadata.segmentName = "Premium users";
            }
        }
        body = JSON.stringify(obj);
        console.log("Busuu Plus: Amplitude 特性开关已全部强开");
    } 
    
    // ---- 2. 稳固解密 Busuu 官方资产（恢复标准高级会员基础） ----
    else if (url.indexOf("users/me") !== -1) {
        let obj = JSON.parse(body);
        if (obj.data) {
            // 开启核心高级会员
            obj.data.is_premium = true;
            
            // 使用合法的标准层级名，确保 App 认账
            if (obj.data.access) {
                obj.data.access.tier = "premium_plus";
            }
            
            // 规范化注入年费订阅数据
            if (obj.data.premium_data) {
                obj.data.premium_data.subscription_status = "active";
                obj.data.premium_data.product = "premium_plus";
                obj.data.premium_data.type = "premium_plus";
                obj.data.premium_data.subscriptionType = "premium_plus";
                obj.data.premium_data.expiration = 3745855150; // 2088年
                obj.data.premium_data.next_charge = 3745855150;
            }
            
            // 填满所有语言的专属特权课程数组
            if (obj.data.course_access) {
                obj.data.course_access.travel = true;
                let allLangs = ["en", "de", "fr", "es", "it", "pt", "ru", "tr", "ar", "ja", "ko"];
                obj.data.course_access.business = allLangs;
                obj.data.course_access.mobile = allLangs;
            }
        }
        body = JSON.stringify(obj);
        console.log("Busuu Plus: 官方高级会员资产已成功注入");
    }

} catch (e) {
    console.log("Busuu 深度解锁脚本执行崩溃: " + e);
}

$done({ body });
