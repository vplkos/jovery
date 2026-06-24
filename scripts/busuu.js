/*
[rewrite_local]
^https:\/\/api\.busuu\.com\/users\/me url script-response-body https://raw.githubusercontent.com/vplkos/jovery/main/scripts/busuu.js

[mitm] 
hostname = api.busuu.com
*/

if ($response && $response.body) {
    let body = $response.body;

    body = body
      .replace(/"tier":"\w+"/g, '"tier":"premium"')
      .replace(/"free_trial_eligible":\w+/g, '"free_trial_eligible":false')
      .replace(/"is_premium":\w+/g, '"is_premium":true')
      .replace(/"free_trial":\w+/g, '"free_trial":false')
      .replace(/"expiration":\d+/g, '"expiration":9999999999')
      .replace(/"next_charge":\d+/g, '"next_charge":0')
      .replace(/"name":".*?"/g, '"name":"premium"'); // 想换回彭于晏可以在这里改

    $done({ body });
} else {
    $done({});
}
