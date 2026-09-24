<?php

header("Content-Type: application/json");

require_once "config.php";


// ======================================================
// GET: Check device status and update offline devices (Dashboard polling)
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $timeout_minutes = isset($_GET['timeout']) ? (int)$_GET['timeout'] : 5;
    $timeout_minutes = max(1, min($timeout_minutes, 60));

    $offline_threshold = date("Y-m-d H:i:s", strtotime("-{$timeout_minutes} minutes"));

    $update_sql = "
        UPDATE ai_devices
        SET status = 'offline'
        WHERE status = 'online' AND last_seen < ?
    ";

    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param("s", $offline_threshold);
    $update_stmt->execute();
    $affected_rows = $update_stmt->affected_rows;
    $update_stmt->close();

    $select_sql = "
        SELECT device_id, device_name, status, last_seen
        FROM ai_devices
        ORDER BY device_id
    ";

    $result = $conn->query($select_sql);
    $devices = [];
    while ($row = $result->fetch_assoc()) {
        $devices[] = $row;
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Device status checked.",
        "timeout_minutes" => $timeout_minutes,
        "updated_offline" => $affected_rows,
        "devices" => $devices
    ]);

    $conn->close();
    exit;
}


// ======================================================
// HANYA MENERIMA POST (Jetson Nano mengirim heartbeat)
// ======================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Method not allowed. Use GET or POST."
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
