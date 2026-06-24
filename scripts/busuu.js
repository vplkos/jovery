/*
[rewrite_local]
^https:\/\/api\.busuu\.com\/users\/me url script-response-body https://raw.githubusercontent.com/vplkos/jovery/main/scripts/busuu.js

[mitm] 
hostname = api.busuu.com
*/

if ($response && $response.body) {
    try {
        let body = $response.body;

        // 使用符合现代规范的全局替换（添加了 \s* 允许键值对之间有任意空格，兼容性拉满）
        body = body
            .replace(/"tier"\s*:\s*"\w+"/g, '"tier":"premium"')                     // 修改会员等级
            .replace(/"is_premium"\s*:\s*\w+/g, '"is_premium":true')                // 激活会员状态
            .replace(/"free_trial_eligible"\s*:\s*\w+/g, '"free_trial_eligible":false') // 关闭试用资格提示
            .replace(/"free_trial"\s*:\s*\w+/g, '"free_trial":false')                // 关闭试用状态
            .replace(/"expiration"\s*:\s*\d+/g, '"expiration":4092599349')          // 过期时间（约2099年）
            .replace(/"next_charge"\s*:\s*\d+/g, '"next_charge":4092599349')        // 下次扣费时间
            .replace(/"name"\s*:\s*".*?"/g, '"name":"Marius"');          // 你的专属彩蛋昵称

        $done({ body: body });

    } catch (error) {
        console.log("Busuu 正则替换脚本执行失败: " + error);
        $done({});
    }
} else {
    $done({});
}
