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

$device_id = $_GET["device_id"] ?? 'AI-001';


// ======================================================
// AMBIL DATA DEVICE
// ======================================================

$device_sql = "
    SELECT
        id,
        device_id,
        device_name,
        status,
        last_seen,
        created_at,
        updated_at
    FROM ai_devices
    WHERE device_id = ?
    LIMIT 1
";

$device_stmt = $conn->prepare($device_sql);
$device_stmt->bind_param("s", $device_id);
$device_stmt->execute();
$device_result = $device_stmt->get_result();

if ($device_result->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Device not found."
    ]);
    $device_stmt->close();
    $conn->close();
    exit;
}

$device = $device_result->fetch_assoc();
$device_stmt->close();


// ======================================================
// AMBIL DATA DETEKSI TERAKHIR
// ======================================================

$detection_sql = "
    SELECT
        id,
        device_id,
        status,
        confidence,
        image_path,
        detected_at,
        created_at
    FROM ai_detections
    WHERE device_id = ?
    ORDER BY id DESC
    LIMIT 1
";

$detection_stmt = $conn->prepare($detection_sql);
$detection_stmt->bind_param("s", $device_id);
$detection_stmt->execute();
$detection_result = $detection_stmt->get_result();

$detection = null;
if ($detection_result->num_rows > 0) {
    $detection = $detection_result->fetch_assoc();
}
$detection_stmt->close();


// ======================================================
// AMBIL DATA PC_MONITOR TERAKHIR
// ======================================================

$monitor_sql = "
    SELECT
        id,
        device_id,
        cpu_usage,
        ram_usage,
        cpu_temp,
        gpu_temp,
        created_at
    FROM pc_monitor
    WHERE device_id = ?
    ORDER BY id DESC
    LIMIT 1
";

$monitor_stmt = $conn->prepare($monitor_sql);
$monitor_stmt->bind_param("s", $device_id);
$monitor_stmt->execute();
$monitor_result = $monitor_stmt->get_result();

$pc_monitor = null;
if ($monitor_result->num_rows > 0) {
    $pc_monitor = $monitor_result->fetch_assoc();
}
$monitor_stmt->close();


// ======================================================
// RESPONSE
// ======================================================

http_response_code(200);

echo json_encode([
    "success" => true,
    "message" => "Device status retrieved successfully.",
    "data" => [
        "device" => [
            "id" => (int)$device["id"],
            "device_id" => $device["device_id"],
            "device_name" => $device["device_name"],
            "status" => $device["status"],
            "last_seen" => $device["last_seen"],
            "created_at" => $device["created_at"],
            "updated_at" => $device["updated_at"]
        ],
        "detection" => $detection ? [
            "id" => (int)$detection["id"],
            "device_id" => $detection["device_id"],
            "status" => $detection["status"],
            "confidence" => (float)$detection["confidence"],
            "image_path" => $detection["image_path"],
            "detected_at" => $detection["detected_at"],
            "created_at" => $detection["created_at"]
        ] : null,
        "pc_monitor" => $pc_monitor ? [
            "id" => (int)$pc_monitor["id"],
            "device_id" => $pc_monitor["device_id"],
            "cpu_usage" => $pc_monitor["cpu_usage"] !== null ? (float)$pc_monitor["cpu_usage"] : null,
            "ram_usage" => $pc_monitor["ram_usage"] !== null ? (float)$pc_monitor["ram_usage"] : null,
            "cpu_temp" => $pc_monitor["cpu_temp"] !== null ? (float)$pc_monitor["cpu_temp"] : null,
            "gpu_temp" => $pc_monitor["gpu_temp"] !== null ? (float)$pc_monitor["gpu_temp"] : null,
            "created_at" => $pc_monitor["created_at"]
        ] : null
    ]
]);


$conn->close();
