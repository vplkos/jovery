if ($response && $response.body) {
    try {
        var body = $response.body;
        // 现代兼容正则，确保远程运行时不破坏其余数据，同时完成精准手术
        body = body
            .replace(/"tier"\s*:\s*"\w+"/g, '"tier":"premium"')                     
            .replace(/"free_trial_eligible"\s*:\s*\w+/g, '"free_trial_eligible":false') 
            .replace(/"is_premium"\s*:\s*\w+/g, '"is_premium":true')                
            .replace(/"free_trial"\s*:\s*\w+/g, '"free_trial":false')                
            .replace(/"expiration"\s*:\s*\d+/g, '"expiration":4092599349')          
            .replace(/"next_charge"\s*:\s*\d+/g, '"next_charge":0')                 
            .replace(/"name"\s*:\s*".*?"/g, '"name":"好牛的滑子"');                  

        $done({ body: body });
    } catch (error) {
        $done({});
    }
} else {
    $done({});
}
