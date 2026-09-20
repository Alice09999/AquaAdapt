<?php

header("Content-Type: application/json");

require_once "config.php";


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
// AMBIL DATA DETEKSI TERAKHIR
// ======================================================

$sql = "
    SELECT
        id,
        device_id,
        status,
        confidence,
        detected_at,
        created_at
    FROM ai_detections
    ORDER BY id DESC
    LIMIT 1
";

$result = $conn->query($sql);


// ======================================================
// CEK QUERY
// ======================================================

if (!$result) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve AI status."
    ]);

    exit;
}


// ======================================================
// CEK DATA
// ======================================================

if ($result->num_rows === 0) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "No AI detection data found."
    ]);

    exit;
}


// ======================================================
// AMBIL DATA
// ======================================================

$data = $result->fetch_assoc();


// ======================================================
// RESPONSE
// ======================================================

http_response_code(200);

echo json_encode([
    "success" => true,
    "message" => "Latest AI status retrieved successfully.",
    "data" => [
        "id" => (int)$data["id"],
        "device_id" => $data["device_id"],
        "status" => $data["status"],
        "confidence" => (float)$data["confidence"],
        "detected_at" => $data["detected_at"],
        "created_at" => $data["created_at"]
    ]
]);


$conn->close();
