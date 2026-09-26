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
// FIXED SCHEDULE: feeding_time bebas 00:00 - 23:59 (HH:MM)
// Scheduler hanya mengelola feeding_time + active_days
// ======================================================

function normalizeTime($time) {
    return substr(trim((string)$time), 0, 5);
}


// ======================================================
// GET: Ambil semua jadwal (id, feeding_time, active_days)
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $sql = "SELECT id, feeding_time, active_days FROM feeding_schedules ORDER BY feeding_time ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $schedules = [];
    while ($row = $result->fetch_assoc()) {
        $active_days = json_decode($row["active_days"], true);
        if (is_string($active_days)) {
            $active_days = $active_days === "" ? [] : array_map("trim", explode(",", $active_days));
        } elseif (!is_array($active_days)) {
            $active_days = [];
        }
        $schedules[] = [
            "id" => (int)$row["id"],
            "feeding_time" => $row["feeding_time"],
            "active_days" => $active_days,
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
// Wajib: feeding_time (07:00/17:00), active_days
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON."]);
        exit;
    }

    $feeding_time = $input["feeding_time"] ?? null;
    $active_days = $input["active_days"] ?? null;

    if (empty($feeding_time) || empty($active_days)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields.",
            "required" => ["feeding_time", "active_days"]
        ]);
        exit;
    }

    $normalized = normalizeTime($feeding_time);
    if (!preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9]$/', $normalized)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid feeding_time. Use HH:MM format between 00:00 and 23:59."
        ]);
        exit;
    }

    if (is_array($active_days)) {
        $active_days_value = array_values($active_days);
    } else {
        $active_days_value = $active_days;
    }

    $feeding_time_db = $normalized;
    $active_days_json = json_encode($active_days_value);

    $sql = "INSERT INTO feeding_schedules (feeding_time, active_days) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $feeding_time_db, $active_days_json);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Schedule created.",
            "data" => [
                "id" => $stmt->insert_id,
                "feeding_time" => $feeding_time_db,
                "active_days" => $active_days_value,
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
// PUT: Update jadwal berdasarkan id
// Bisa update feeding_time dan/atau active_days
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "PUT") {

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON."]);
        exit;
    }

    $id = $input["id"] ?? null;

    if (empty($id)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required field: id"
        ]);
        exit;
    }

    $feeding_time = $input["feeding_time"] ?? null;
    $active_days = $input["active_days"] ?? null;

    $updates = [];
    $params = [];
    $types = "";

    if ($feeding_time !== null && $feeding_time !== "") {
        $normalized = normalizeTime($feeding_time);
        if (!preg_match('/^([01][0-9]|2[0-3]):[0-5][0-9]$/', $normalized)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Invalid feeding_time. Use HH:MM format between 00:00 and 23:59."
            ]);
            exit;
        }
        $updates[] = "feeding_time = ?";
        $params[] = $normalized;
        $types .= "s";
    }

    if ($active_days !== null && $active_days !== "") {
        $active_days_value = is_array($active_days) ? array_values($active_days) : $active_days;
        $updates[] = "active_days = ?";
        $params[] = json_encode($active_days_value);
        $types .= "s";
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No fields to update."]);
        exit;
    }

    $params[] = $id;
    $types .= "i";

    $sql = "UPDATE feeding_schedules SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

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
// DELETE: Hapus jadwal berdasarkan id
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
echo json_encode(["success" => false, "message" => "Method not allowed. Use GET, POST, PUT, or DELETE."]);
