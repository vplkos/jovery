/*
[rewrite_local]
^https:\/\/api\.busuu\.com\/users\/me url script-response-body https://raw.githubusercontent.com/vplkos/jovery/main/scripts/busuu.js

[mitm] 
hostname = api.busuu.com
*/

if ($response && $response.body) {
    let body = $response.body;

    // 100% 还原原版老脚本的替换规则与目标值（无任何魔改，保持原版的大力出奇迹逻辑）
    body = body
        .replace(/"tier":"\w+"/g, '"tier":"premium"')
        .replace(/"free_trial_eligible":\w+/g, '"free_trial_eligible":false')
        .replace(/"is_premium":\w+/g, '"is_premium":true')
        .replace(/"free_trial\":\w+/g, '"free_trial":false')
        .replace(/"expiration":\d+/g, '"expiration":4092599349')
        .replace(/"next_charge":\d+/g, '"next_charge":4092599349')
        .replace(/"name":".*?"/g, '"name":"Premium"'); // 原版其实改成了 Premium，你想改彭于晏可以自己换掉

    $done({ body: body });
} else {
    $done({});
}
