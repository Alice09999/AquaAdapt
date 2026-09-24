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
// KONSEP FIXED SCHEDULE
// ======================================================
// Sistem hanya memiliki 2 waktu FIXED untuk memulai sesi feeding:
// - 07:00 (Sesi Pagi)
// - 17:00 (Sesi Sore)
//
// AI menentukan kapan feeding BERHENTI (Hungry/FULL)
// Schedule hanya menentukan KAPAN feeding DIMULAI
// ======================================================

$FIXED_SCHEDULES = [
    [
        "id" => 1,
        "device_id" => "AI-001",
        "device_name" => "AI Kamera Kolam 1",
        "schedule_code" => "#F-001",
        "schedule_type" => "Interval Tetap",
        "feeding_time" => "07:00:00",
        "active_days" => ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
        "duration_seconds" => 45,
        "intensity_percent" => 80,
        "is_active" => true,
        "created_at" => date("Y-m-d H:i:s"),
        "updated_at" => date("Y-m-d H:i:s"),
        "is_fixed" => true,
        "session_name" => "Sesi Pagi"
    ],
    [
        "id" => 2,
        "device_id" => "AI-001",
        "device_name" => "AI Kamera Kolam 1",
        "schedule_code" => "#F-002",
        "schedule_type" => "Interval Tetap",
        "feeding_time" => "17:00:00",
        "active_days" => ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
        "duration_seconds" => 45,
        "intensity_percent" => 80,
        "is_active" => true,
        "created_at" => date("Y-m-d H:i:s"),
        "updated_at" => date("Y-m-d H:i:s"),
        "is_fixed" => true,
        "session_name" => "Sesi Sore"
    ]
];


// ======================================================
// GET: Ambil jadwal pakan (Fixed Schedule: 07:00 & 17:00)
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $device_id = $_GET["device_id"] ?? null;

    // Query database untuk jadwal yang sudah disimpan
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

    $db_schedules = [];
    while ($row = $result->fetch_assoc()) {
        $db_schedules[] = [
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

    $stmt->close();

    // Jika database kosong, kembalikan fixed schedule default
    // Jika database ada data, gabungkan dengan fixed schedule (prioritaskan fixed schedule)
    $schedules = [];

    // Tambahkan fixed schedule dulu (07:00 dan 17:00)
    foreach ($FIXED_SCHEDULES as $fixed) {
        // Cek apakah sudah ada di database dengan waktu yang sama
        $exists = false;
        foreach ($db_schedules as $db_sched) {
            if (strtotime($db_sched["feeding_time"]) === strtotime($fixed["feeding_time"])) {
                $exists = true;
                // Gunakan data database tapi tambahkan flag fixed
                $schedules[] = array_merge($db_sched, ["is_fixed" => true, "session_name" => $fixed["session_name"]]);
                break;
            }
        }
        if (!$exists) {
            $schedules[] = $fixed;
        }
    }

    // Tambahkan jadwal lain dari database yang bukan fixed schedule
    foreach ($db_schedules as $db_sched) {
        $is_fixed_time = false;
        foreach ($FIXED_SCHEDULES as $fixed) {
            if (strtotime($db_sched["feeding_time"]) === strtotime($fixed["feeding_time"])) {
                $is_fixed_time = true;
                break;
            }
        }
        if (!$is_fixed_time) {
            $schedules[] = $db_sched;
        }
    }

    // Sort by feeding_time
    usort($schedules, function($a, $b) {
        return strtotime($a["feeding_time"]) - strtotime($b["feeding_time"]);
    });

    http_response_code(200);
    echo json_encode(["success" => true, "data" => $schedules]);

    $conn->close();
    exit;
}


// ======================================================
// POST: Tambah jadwal baru (Dashboard membuat jadwal)
// Fokus pada active_days dan feeding_time, field lain pakai default
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON."]);
        exit;
    }

    $device_id = $input["device_id"] ?? null;
    $feeding_time = $input["feeding_time"] ?? null;
    $active_days = $input["active_days"] ?? null;
    $schedule_type = $input["schedule_type"] ?? "Interval Tetap";
    $duration_seconds = $input["duration_seconds"] ?? 45;
    $intensity_percent = $input["intensity_percent"] ?? 80;

    if (empty($device_id) || empty($feeding_time) || empty($active_days)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields.",
            "required" => ["device_id", "feeding_time", "active_days"]
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

    // Generate schedule code based on schedule_type
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
// PUT: Update jadwal (Dashboard mengubah jadwal)
// Fokus pada active_days dan feeding_time, field lain opsional
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

    $schedule_type = $input["schedule_type"] ?? null;
    $feeding_time = $input["feeding_time"] ?? null;
    $active_days = $input["active_days"] ?? null;
    $duration_seconds = $input["duration_seconds"] ?? null;
    $intensity_percent = $input["intensity_percent"] ?? null;
    $is_active = $input["is_active"] ?? null;

    $updates = [];
    $params = [];
    $types = "";

    if ($schedule_type !== null) {
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
        $updates[] = "schedule_type = ?";
        $params[] = $schedule_type;
        $types .= "s";
    }

    if ($feeding_time !== null) {
        $updates[] = "feeding_time = ?";
        $params[] = $feeding_time;
        $types .= "s";
    }

    if ($active_days !== null) {
        $updates[] = "active_days = ?";
        $params[] = json_encode($active_days);
        $types .= "s";
    }

    if ($duration_seconds !== null) {
        $updates[] = "duration_seconds = ?";
        $params[] = (int)$duration_seconds;
        $types .= "i";
    }

    if ($intensity_percent !== null) {
        $updates[] = "intensity_percent = ?";
        $params[] = (int)$intensity_percent;
        $types .= "i";
    }

    if ($is_active !== null) {
        $updates[] = "is_active = ?";
        $params[] = $is_active ? 1 : 0;
        $types .= "i";
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
// DELETE: Hapus jadwal (Dashboard menghapus jadwal)
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
