<?php

header("Content-Type: application/json");

// ======================================================
// KONEKSI DATABASE
// ======================================================

require_once "config.php";


// ======================================================
// HANYA MENERIMA METHOD POST
// ======================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed. Use POST."
    ]);

    exit;
}


// ======================================================
// MEMBACA JSON DARI REQUEST
// ======================================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);


// ======================================================
// VALIDASI JSON
// ======================================================

if ($input === null) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON."
    ]);

    exit;
}


// ======================================================
// MENGAMBIL DATA
// ======================================================

$device_id  = $input["device_id"] ?? null;
$status     = $input["status"] ?? null;
$confidence = $input["confidence"] ?? null;
$timestamp  = $input["timestamp"] ?? null;


// ======================================================
// VALIDASI FIELD WAJIB
// ======================================================

if (
    empty($device_id) ||
    empty($status) ||
    $confidence === null ||
    empty($timestamp)
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Missing required fields.",
        "required" => [
            "device_id",
            "status",
            "confidence",
            "timestamp"
        ]
    ]);

    exit;
}


// ======================================================
// VALIDASI STATUS
// ======================================================

$allowed_status = [
    "pakan_ada",
    "pakan_habis"
];

if (!in_array($status, $allowed_status)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid status.",
        "allowed_status" => $allowed_status
    ]);

    exit;
}


// ======================================================
// VALIDASI CONFIDENCE
// ======================================================

if (
    !is_numeric($confidence) ||
    $confidence < 0 ||
    $confidence > 1
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Confidence must be between 0 and 1."
    ]);

    exit;
}


// ======================================================
// SIMPAN DATA KE DATABASE
// ======================================================

$sql = "
    INSERT INTO ai_detections
    (
        device_id,
        status,
        confidence,
        detected_at
    )
    VALUES (?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "ssds",
    $device_id,
    $status,
    $confidence,
    $timestamp
);


// ======================================================
// EKSEKUSI QUERY
// ======================================================

if ($stmt->execute()) {

    http_response_code(201);

    echo json_encode([
        "success" => true,
        "message" => "Detection received successfully.",
        "data" => [
            "id" => $stmt->insert_id,
            "device_id" => $device_id,
            "status" => $status,
            "confidence" => (float)$confidence,
            "detected_at" => $timestamp
        ]
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to save detection."
    ]);
}


// ======================================================
// TUTUP
// ======================================================

$stmt->close();
$conn->close();
