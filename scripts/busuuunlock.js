let body = JSON.parse($response.body);

if (body.data) {
    body.data.is_premium = true;
    if (body.data.access) body.data.access.tier = "premium";
}

$done({body: JSON.stringify(body)});
