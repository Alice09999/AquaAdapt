<?php

header("Content-Type: application/json");

require_once "../../config/database.php";


// ======================================================
// HANYA MENERIMA POST
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
// BACA JSON
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
// DEVICE ID
// ======================================================

$device_id = $input["device_id"] ?? null;


if (empty($device_id)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "device_id is required."
    ]);

    exit;
}


// ======================================================
// CEK DEVICE
// ======================================================

$sql = "
    SELECT id, device_id, device_name
    FROM ai_devices
    WHERE device_id = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "s",
    $device_id
);

$stmt->execute();

$result = $stmt->get_result();


// ======================================================
// DEVICE TIDAK DITEMUKAN
// ======================================================

if ($result->num_rows === 0) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "AI device not registered."
    ]);

    exit;
}


$device = $result->fetch_assoc();


// ======================================================
// UPDATE STATUS
// ======================================================

$update_sql = "
    UPDATE ai_devices
    SET
        status = 'online',
        last_seen = NOW()
    WHERE device_id = ?
";

$update_stmt = $conn->prepare($update_sql);

$update_stmt->bind_param(
    "s",
    $device_id
);


if (!$update_stmt->execute()) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to update AI device status."
    ]);

    exit;
}


// ======================================================
// RESPONSE
// ======================================================

http_response_code(200);

echo json_encode([
    "success" => true,
    "message" => "Heartbeat received.",
    "data" => [
        "device_id" => $device["device_id"],
        "device_name" => $device["device_name"],
        "status" => "online",
        "last_seen" => date("Y-m-d H:i:s")
    ]
]);


$stmt->close();
$update_stmt->close();
$conn->close();
