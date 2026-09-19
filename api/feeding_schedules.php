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
// GET: Ambil semua jadwal pakan
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $device_id = $_GET["device_id"] ?? null;

    $sql = "
        SELECT
            fs.id,
            fs.device_id,
            ai.device_name,
            fs.schedule_code,
            fs.schedule_type,
            fs.feeding_time,
            fs.active_days,
            fs.duration_seconds,
            fs.intensity_percent,
            fs.is_active,
            fs.created_at,
            fs.updated_at
        FROM feeding_schedules fs
        LEFT JOIN ai_devices ai ON fs.device_id = ai.device_id
    ";

    $params = [];
    $types = "";

    if (!empty($device_id)) {
        $sql .= " WHERE fs.device_id = ?";
        $params[] = $device_id;
        $types .= "s";
    }

    $sql .= " ORDER BY fs.feeding_time ASC";

    $stmt = $conn->prepare($sql);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $schedules = [];
    while ($row = $result->fetch_assoc()) {
        $schedules[] = [
            "id" => (int)$row["id"],
            "device_id" => $row["device_id"],
            "device_name" => $row["device_name"],
            "schedule_code" => $row["schedule_code"],
            "schedule_type" => $row["schedule_type"],
            "feeding_time" => $row["feeding_time"],
            "active_days" => json_decode($row["active_days"], true),
            "duration_seconds" => (int)$row["duration_seconds"],
            "intensity_percent" => (int)$row["intensity_percent"],
            "is_active" => (bool)$row["is_active"],
            "created_at" => $row["created_at"],
            "updated_at" => $row["updated_at"],
        ];
    }

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $schedules]);

    $stmt->close();
    $conn->close();
    exit;
}


// ======================================================
// POST: Tambah jadwal baru
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON."]);
        exit;
    }

    $device_id = $input["device_id"] ?? null;
    $schedule_type = $input["schedule_type"] ?? null;
    $feeding_time = $input["feeding_time"] ?? null;
    $active_days = $input["active_days"] ?? null;
    $duration_seconds = $input["duration_seconds"] ?? 45;
    $intensity_percent = $input["intensity_percent"] ?? 80;

    if (empty($device_id) || empty($schedule_type) || empty($feeding_time) || empty($active_days)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields.",
            "required" => ["device_id", "schedule_type", "feeding_time", "active_days"]
        ]);
        exit;
    }

    $allowed_type = ["Interval Tetap", "Berbasis AI"];
    if (!in_array($schedule_type, $allowed_type)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid schedule_type.",
            "allowed" => $allowed_type
        ]);
        exit;
    }

    // Generate schedule code
    $prefix = $schedule_type === "Interval Tetap" ? "F" : "A";
    $code_num = rand(100, 999);
    $schedule_code = "#" . $prefix . "-" . $code_num;

    $active_days_json = json_encode($active_days);

    $sql = "
        INSERT INTO feeding_schedules
        (device_id, schedule_code, schedule_type, feeding_time, active_days, duration_seconds, intensity_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "sssssii",
        $device_id,
        $schedule_code,
        $schedule_type,
        $feeding_time,
        $active_days_json,
        $duration_seconds,
        $intensity_percent
    );

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Schedule created.",
            "data" => [
                "id" => $stmt->insert_id,
                "device_id" => $device_id,
                "schedule_code" => $schedule_code,
                "schedule_type" => $schedule_type,
                "feeding_time" => $feeding_time,
                "active_days" => $active_days,
                "duration_seconds" => $duration_seconds,
                "intensity_percent" => $intensity_percent,
                "is_active" => true,
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create schedule."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}


// ======================================================
// PUT: Update jadwal (toggle aktif/nonaktif)
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON."]);
        exit;
    }

    $id = $input["id"] ?? null;
    $is_active = $input["is_active"] ?? null;

    if (empty($id) || $is_active === null) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields.",
            "required" => ["id", "is_active"]
        ]);
        exit;
    }

    $active_val = $is_active ? 1 : 0;

    $sql = "UPDATE feeding_schedules SET is_active = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $active_val, $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Schedule updated."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update schedule."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}


// ======================================================
// DELETE: Hapus jadwal
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "DELETE") {

    $id = $_GET["id"] ?? null;

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Schedule id is required."]);
        exit;
    }

    $sql = "DELETE FROM feeding_schedules WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Schedule deleted."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete schedule."]);
    }

    $stmt->close();
    $conn->close();
    exit;
}


// ======================================================
// Method tidak dikenal
// ======================================================

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);
