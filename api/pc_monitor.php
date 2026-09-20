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
// GET: Ambil data pc_monitor terakhir
// ======================================================

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $device_id = $_GET["device_id"] ?? null;

    $sql = "
        SELECT
            id,
            device_id,
            cpu_usage,
            ram_usage,
            cpu_temp,
            created_at
        FROM pc_monitor
    ";

    $params = [];
    $types = "";

    if (!empty($device_id)) {
        $sql .= " WHERE device_id = ?";
        $params[] = $device_id;
        $types .= "s";
    }

    $sql .= " ORDER BY id DESC LIMIT 1";

    $stmt = $conn->prepare($sql);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "No pc_monitor data found."
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }

    $data = $result->fetch_assoc();

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "data" => [
            "id" => (int)$data["id"],
            "device_id" => $data["device_id"],
            "cpu_usage" => $data["cpu_usage"] !== null ? (float)$data["cpu_usage"] : null,
            "ram_usage" => $data["ram_usage"] !== null ? (float)$data["ram_usage"] : null,
            "cpu_temp" => $data["cpu_temp"] !== null ? (float)$data["cpu_temp"] : null,
            "created_at" => $data["created_at"]
        ]
    ]);

    $stmt->close();
    $conn->close();
    exit;
}


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

$input = json_decode(file_get_contents("php://input"), true);

if ($input === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON."]);
    exit;
}

$device_id = $input["device_id"] ?? null;
$cpu_usage = $input["cpu_usage"] ?? null;
$ram_usage = $input["ram_usage"] ?? null;
$cpu_temp  = $input["cpu_temp"] ?? null;

if (empty($device_id) || $cpu_usage === null || $ram_usage === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields.",
        "required" => ["device_id", "cpu_usage", "ram_usage"]
    ]);
    exit;
}

// Query Insert ke database (Pastikan tabel pc_monitor sudah dibuat)
$sql = "
    INSERT INTO pc_monitor (device_id, cpu_usage, ram_usage, cpu_temp, created_at)
    VALUES (?, ?, ?, ?, NOW())
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sdds", $device_id, $cpu_usage, $ram_usage, $cpu_temp);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "PC monitor data recorded successfully.",
        "data" => [
            "id" => $stmt->insert_id,
            "device_id" => $device_id,
            "cpu_usage" => $cpu_usage,
            "ram_usage" => $ram_usage,
            "cpu_temp" => $cpu_temp
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save data to database."]);
}

$stmt->close();
$conn->close();
