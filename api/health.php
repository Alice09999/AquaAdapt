<?php

header("Content-Type: application/json");


// ======================================================
// HANYA MENERIMA GET
// ======================================================

if ($_SERVER["REQUEST_METHOD"] !== "GET") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed. Use GET."
    ]);

    exit;
}


// ======================================================
// KONEKSI DATABASE
// ======================================================

require_once "config.php";


// ======================================================
// CEK DATABASE
// ======================================================

$db_status = "connected";

if ($conn->ping()) {

    $db_status = "connected";

} else {

    $db_status = "disconnected";
}


// ======================================================
// RESPONSE
// ======================================================

if ($db_status === "connected") {

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "server" => "online",
        "database" => $db_status,
        "timestamp" => date("Y-m-d H:i:s")
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "server" => "online",
        "database" => $db_status,
        "timestamp" => date("Y-m-d H:i:s")
    ]);
}


$conn->close();
