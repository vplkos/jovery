/*
[rewrite_local]
^https:\/\/api\.busuu\.com\/users\/me url script-response-body https://raw.githubusercontent.com/vplkos/jovery/main/scripts/busuu.js

[mitm] 
hostname = api.busuu.com
*/

if ($response && $response.body) {
    try {
        let obj = JSON.parse($response.body);
        let user = obj.data || obj.user || obj;

        // 【新增安全补丁】如果 data 是个数组，自动解包获取第一个用户对象
        if (Array.isArray(user)) {
            user = user[0];
        }

        if (user) {
            user.tier = "premium";               
            user.is_premium = true;              
            user.free_trial_eligible = false;    
            user.free_trial = false;             
            user.expiration = 4092599349;        
            user.next_charge = 4092599349;       
            user.name = "Marius"; 
        }

        $done({ body: JSON.stringify(obj) });

    } catch (error) {
        console.log("Busuu 脚本解析 JSON 失败: " + error);
        $done({});
    }
} else {
    $done({});
}
