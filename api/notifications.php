<?php

require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use GET."]);
    exit;
}

$device_id = $_GET["device_id"] ?? null;
$limit = isset($_GET["limit"]) ? (int)$_GET["limit"] : 20;
$offset = isset($_GET["offset"]) ? (int)$_GET["offset"] : 0;

if ($limit > 100) $limit = 100;

$notifications = [];

// 1. Feeding Log Events - Completed feedings (motor_status OFF with completed_at)
$feeding_sql = "
    SELECT
        fl.id,
        fl.device_id,
        ai.device_name,
        fl.ai_decision,
        fl.motor_status,
        fl.started_at,
        fl.completed_at,
        fl.duration_seconds
    FROM feeding_logs fl
    LEFT JOIN ai_devices ai ON fl.device_id = ai.device_id
    WHERE fl.motor_status = 'OFF' AND fl.completed_at IS NOT NULL
";

$params = [];
$types = "";
$where_conditions = [];

if (!empty($device_id)) {
    $where_conditions[] = "fl.device_id = ?";
    $params[] = $device_id;
    $types .= "s";
}

if (!empty($where_conditions)) {
    $feeding_sql .= " AND " . implode(" AND ", $where_conditions);
}

$feeding_sql .= " ORDER BY fl.completed_at DESC LIMIT ?";
$params[] = $limit;
$types .= "i";

$stmt = $conn->prepare($feeding_sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $notifications[] = [
        "id" => "feeding-" . $row["id"],
        "type" => "success",
        "title" => "Siklus Pakan Selesai",
        "description" => "Pemberian pakan pada " . date("H:i", strtotime($row["started_at"])) . " WIB selesai. Durasi: " . ($row["duration_seconds"] ?? 0) . " detik.",
        "timestamp" => $row["completed_at"],
        "source_table" => "feeding_logs",
        "source_id" => (int)$row["id"]
    ];
}
$stmt->close();

// 2. AI Detection Events - Pakan habis
$detection_sql = "
    SELECT
        id,
        device_id,
        status,
        confidence,
        detected_at
    FROM ai_detections
    WHERE status = 'pakan_habis'
";

$params = [];
$types = "";
$where_conditions = [];

if (!empty($device_id)) {
    $where_conditions[] = "device_id = ?";
    $params[] = $device_id;
    $types .= "s";
}

if (!empty($where_conditions)) {
    $detection_sql .= " AND " . implode(" AND ", $where_conditions);
}

$detection_sql .= " ORDER BY detected_at DESC LIMIT ?";
$params[] = $limit;
$types .= "i";

$stmt = $conn->prepare($detection_sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $notifications[] = [
        "id" => "detection-" . $row["id"],
        "type" => "warning",
        "title" => "Pakan Habis Terdeteksi",
        "description" => "AI mendeteksi pakan habis dengan kepercayaan " . round((float)$row["confidence"] * 100, 1) . "%.",
        "timestamp" => $row["detected_at"],
        "source_table" => "ai_detections",
        "source_id" => (int)$row["id"]
    ];
}
$stmt->close();

// 3. AI Detection Events - Pakan tersedia
$detection_sql2 = "
    SELECT
        id,
        device_id,
        status,
        confidence,
        detected_at
    FROM ai_detections
    WHERE status = 'pakan_ada'
";

$params = [];
$types = "";
$where_conditions = [];

if (!empty($device_id)) {
    $where_conditions[] = "device_id = ?";
    $params[] = $device_id;
    $types .= "s";
}

if (!empty($where_conditions)) {
    $detection_sql2 .= " AND " . implode(" AND ", $where_conditions);
}

$detection_sql2 .= " ORDER BY detected_at DESC LIMIT ?";
$params[] = $limit;
$types .= "i";

$stmt = $conn->prepare($detection_sql2);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $notifications[] = [
        "id" => "detection-" . $row["id"],
        "type" => "info",
        "title" => "Pakan Tersedia",
        "description" => "AI mendeteksi pakan masih tersedia dengan kepercayaan " . round((float)$row["confidence"] * 100, 1) . "%.",
        "timestamp" => $row["detected_at"],
        "source_table" => "ai_detections",
        "source_id" => (int)$row["id"]
    ];
}
$stmt->close();

// 4. Device Offline Events
$device_sql = "
    SELECT
        device_id,
        device_name,
        status,
        last_seen
    FROM ai_devices
    WHERE status = 'offline' AND last_seen IS NOT NULL
";

$params = [];
$types = "";
$where_conditions = [];

if (!empty($device_id)) {
    $where_conditions[] = "device_id = ?";
    $params[] = $device_id;
    $types .= "s";
}

if (!empty($where_conditions)) {
    $device_sql .= " AND " . implode(" AND ", $where_conditions);
}

$device_sql .= " ORDER BY last_seen DESC LIMIT ?";
$params[] = $limit;
$types .= "i";

$stmt = $conn->prepare($device_sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $notifications[] = [
        "id" => "device-" . $row["device_id"] . "-" . str_replace([" ", ":", "-"], "", $row["last_seen"]),
        "type" => "warning",
        "title" => "Perangkat Offline",
        "description" => "Perangkat " . $row["device_name"] . " (" . $row["device_id"] . ") terakhir online pada " . date("d/m/Y H:i", strtotime($row["last_seen"])) . " WIB.",
        "timestamp" => $row["last_seen"],
        "source_table" => "ai_devices",
        "source_id" => $row["device_id"]
    ];
}
$stmt->close();

// Sort all notifications by timestamp DESC (newest first)
usort($notifications, function ($a, $b) {
    return strtotime($b["timestamp"]) - strtotime($a["timestamp"]);
});

// Apply pagination
$total = count($notifications);
$paginated = array_slice($notifications, $offset, $limit);

// Calculate unread count (for simplicity, all are "unread" since no persistence)
$unread_count = $total;

http_response_code(200);
echo json_encode([
    "success" => true,
    "data" => $paginated,
    "pagination" => [
        "total" => $total,
        "limit" => $limit,
        "offset" => $offset,
    ],
    "unread_count" => $unread_count
]);

$conn->close();