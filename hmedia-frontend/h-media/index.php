<?php
$request_uri = $_SERVER['REQUEST_URI'];
// Forward the request to the FastAPI backend to get the SEO-populated HTML
$api_url = "https://hmedia-api.channelhmedia.in" . $request_uri;

// Append or merge proxied=true query parameter
if (strpos($api_url, '?') !== false) {
    $api_url .= "&proxied=true";
} else {
    $api_url .= "?proxied=true";
}

// Use curl to fetch the HTML from the FastAPI backend in the background
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL/TLS issues if any
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    echo $response;
} else {
    // Fallback to static index.html if the API is down
    echo file_get_contents(__DIR__ . "/index.html");
}
?>