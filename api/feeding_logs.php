<?php

require_once "config.php";

// ======================================================
// HANDLE OPTIONS PREFLIGHT
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json");


// ======================================================
// GET: Ambil data riwayat pakan
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $device_id = $_GET["device_id"] ?? null;
    $limit = isset($_GET["limit"]) ? (int)$_GET["limit"] : 50;
    $offset = isset($_GET["offset"]) ? (int)$_GET["offset"] : 0;
    $date_from = $_GET["date_from"] ?? null;
    $date_to = $_GET["date_to"] ?? null;

    if ($limit > 200) $limit = 200;

    $sql = "
        SELECT
            fl.id,
            fl.device_id,
            ai.device_name,
            fl.ai_decision,
            fl.motor_status,
            fl.started_at,
            fl.completed_at,
            fl.duration_seconds,
            fl.created_at
        FROM feeding_logs fl
        LEFT JOIN ai_devices ai ON fl.device_id = ai.device_id
    ";

    $params = [];
    $types = "";
    $where_conditions = [];

    if (!empty($device_id)) {
        $where_conditions[] = "fl.device_id = ?";
        $params[] = $device_id;
        $types .= "s";
    }

    if (!empty($date_from)) {
        $where_conditions[] = "DATE(fl.started_at) >= ?";
        $params[] = $date_from;
        $types .= "s";
    }

    if (!empty($date_to)) {
        $where_conditions[] = "DATE(fl.started_at) <= ?";
        $params[] = $date_to;
        $types .= "s";
    }

    if (!empty($where_conditions)) {
        $sql .= " WHERE " . implode(" AND ", $where_conditions);
    }

    $sql .= " ORDER BY fl.id DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = [
            "id" => (int)$row["id"],
            "device_id" => $row["device_id"],
            "device_name" => $row["device_name"],
            "ai_decision" => $row["ai_decision"],
            "motor_status" => $row["motor_status"],
            "started_at" => $row["started_at"],
            "completed_at" => $row["completed_at"],
            "duration_seconds" => $row["duration_seconds"] !== null ? (int)$row["duration_seconds"] : null,
            "created_at" => $row["created_at"],
        ];
    }

    // Hitung total
    $count_sql = "SELECT COUNT(*) as total FROM feeding_logs fl";
    $count_params = [];
    $count_types = "";
    $count_where = [];

    if (!empty($device_id)) {
        $count_where[] = "fl.device_id = ?";
        $count_params[] = $device_id;
        $count_types .= "s";
    }
    if (!empty($date_from)) {
        $count_where[] = "DATE(fl.started_at) >= ?";
        $count_params[] = $date_from;
        $count_types .= "s";
    }
    if (!empty($date_to)) {
        $count_where[] = "DATE(fl.started_at) <= ?";
        $count_params[] = $date_to;
        $count_types .= "s";
    }
    if (!empty($count_where)) {
        $count_sql .= " WHERE " . implode(" AND ", $count_where);
    }

    $count_stmt = $conn->prepare($count_sql);
    if (!empty($count_params)) {
        $count_stmt->bind_param($count_types, ...$count_params);
    }
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total = $count_result->fetch_assoc()["total"];
    $count_stmt->close();

    // Hitung average confidence dari ai_detections untuk periode yang sama
    $avg_confidence = null;
    $confidence_sql = "
        SELECT AVG(confidence) as avg_confidence
        FROM ai_detections
        WHERE 1=1
    ";
    $confidence_params = [];
    $confidence_types = "";

    if (!empty($device_id)) {
        $confidence_sql .= " AND device_id = ?";
        $confidence_params[] = $device_id;
        $confidence_types .= "s";
    }
    if (!empty($date_from)) {
        $confidence_sql .= " AND DATE(detected_at) >= ?";
        $confidence_params[] = $date_from;
        $confidence_types .= "s";
    }
    if (!empty($date_to)) {
        $confidence_sql .= " AND DATE(detected_at) <= ?";
        $confidence_params[] = $date_to;
        $confidence_types .= "s";
    }

    $confidence_stmt = $conn->prepare($confidence_sql);
    if (!empty($confidence_params)) {
        $confidence_stmt->bind_param($confidence_types, ...$confidence_params);
    }
    $confidence_stmt->execute();
    $confidence_result = $confidence_stmt->get_result();
    $confidence_row = $confidence_result->fetch_assoc();
    if ($confidence_row && $confidence_row["avg_confidence"] !== null) {
        $avg_confidence = round((float)$confidence_row["avg_confidence"] * 100, 1);
    }
    $confidence_stmt->close();

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "data" => $logs,
        "pagination" => [
            "total" => (int)$total,
            "limit" => $limit,
            "offset" => $offset,
        ],
        "average_confidence" => $avg_confidence
    ]);

    $stmt->close();
    $conn->close();
    exit;
}


// ======================================================
// POST: Catat event pakan baru
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON."]);
        exit;
    }

    $device_id = $input["device_id"] ?? null;
    $ai_decision = $input["ai_decision"] ?? null;
    $motor_status = $input["motor_status"] ?? null;
    $started_at = $input["started_at"] ?? null;
    $completed_at = $input["completed_at"] ?? null;
    $duration_seconds = $input["duration_seconds"] ?? null;

    if (empty($device_id) || empty($ai_decision) || empty($motor_status) || empty($started_at)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields.",
            "required" => ["device_id", "ai_decision", "motor_status", "started_at"]
        ]);
        exit;
    }

    $allowed_decision = ["Hungry", "FULL"];
    if (!in_array($ai_decision, $allowed_decision)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid ai_decision.",
            "allowed" => $allowed_decision
        ]);
        exit;
    }

    $allowed_status = ["ON", "OFF"];
    if (!in_array($motor_status, $allowed_status)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid motor_status.",
            "allowed" => $allowed_status
        ]);
        exit;
    }

    $sql = "
        INSERT INTO feeding_logs
        (device_id, ai_decision, motor_status, started_at, completed_at, duration_seconds)
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssi",
        $device_id,
        $ai_decision,
        $motor_status,
        $started_at,
        $completed_at,
        $duration_seconds
    );

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Feeding log recorded.",
            "data" => [
                "id" => $stmt->insert_id,
                "device_id" => $device_id,
                "ai_decision" => $ai_decision,
                "motor_status" => $motor_status,
                "started_at" => $started_at,
                "completed_at" => $completed_at,
                "duration_seconds" => $duration_seconds,
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save feeding log."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}


// ======================================================
// Method tidak dikenal
// ======================================================

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed. Use GET or POST."]);
