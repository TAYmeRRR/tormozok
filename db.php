<?php
// Конфигурация БД (замените на свои данные)
define('DB_HOST', 'localhost');
define('DB_NAME', 'tormozok_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Подключение к БД
function connectDB() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        die("Ошибка подключения к БД: " . $e->getMessage());
    }
}

// Создание таблицы (выполнить один раз)
function createTable($pdo) {
    $sql = "CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        service VARCHAR(50),
        message TEXT,
        agreement TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('new', 'processed', 'completed') DEFAULT 'new',
        ip_address VARCHAR(45),
        user_agent TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    try {
        $pdo->exec($sql);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

// Обработка POST запроса
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=utf-8');
    
    // Валидация данных
    $errors = [];
    $data = [];
    
    // Проверка имени
    if (!empty($_POST['name']) && preg_match('/^[а-яА-ЯёЁa-zA-Z\s]{2,50}$/u', $_POST['name'])) {
        $data['name'] = htmlspecialchars(trim($_POST['name']));
    } else {
        $errors['name'] = 'Неверное имя (2-50 символов, только буквы)';
    }
    
    // Проверка телефона
    if (!empty($_POST['phone']) && preg_match('/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/', $_POST['phone'])) {
        $data['phone'] = htmlspecialchars(trim($_POST['phone']));
    } else {
        $errors['phone'] = 'Неверный формат телефона';
    }
    
    // Проверка email
    if (!empty($_POST['email']) && filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        $data['email'] = htmlspecialchars(trim($_POST['email']));
    } else {
        $errors['email'] = 'Неверный формат email';
    }
    
    // Остальные поля (необязательные)
    $data['service'] = !empty($_POST['service']) ? htmlspecialchars(trim($_POST['service'])) : null;
    $data['message'] = !empty($_POST['message']) ? htmlspecialchars(trim($_POST['message'])) : null;
    $data['agreement'] = isset($_POST['agreement']) ? 1 : 0;
    
    // Дополнительная информация
    $data['ip_address'] = $_SERVER['REMOTE_ADDR'];
    $data['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
    
    // Если есть ошибки
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors,
            'message' => 'Ошибка валидации данных'
        ]);
        exit;
    }
    
    try {
        // Подключаемся к БД
        $pdo = connectDB();
        
        // Создаем таблицу если её нет
        createTable($pdo);
        
        // Подготавливаем SQL запрос
        $sql = "INSERT INTO feedback 
                (name, phone, email, service, message, agreement, ip_address, user_agent) 
                VALUES (:name, :phone, :email, :service, :message, :agreement, :ip_address, :user_agent)";
        
        $stmt = $pdo->prepare($sql);
        
        // Выполняем запрос
        $stmt->execute([
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':email' => $data['email'],
            ':service' => $data['service'],
            ':message' => $data['message'],
            ':agreement' => $data['agreement'],
            ':ip_address' => $data['ip_address'],
            ':user_agent' => $data['user_agent']
        ]);
        
        // Получаем ID новой записи
        $id = $pdo->lastInsertId();
        
        // Отправляем уведомление (заглушка для реальной реализации)
        sendNotification($data);
        
        // Успешный ответ
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Заявка успешно сохранена!',
            'id' => $id,
            'data' => $data
        ]);
        
    } catch (PDOException $e) {
        // Ошибка БД
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Ошибка базы данных: ' . $e->getMessage(),
            'debug' => $data
        ]);
    }
    
} else {
    // Если не POST запрос
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Метод не поддерживается'
    ]);
}

// Функция отправки уведомления (заглушка)
function sendNotification($data) {
    // Здесь можно реализовать отправку email, Telegram, СМС и т.д.
    
    // Пример отправки email
    /*
    $to = "admin@tormozok.ru";
    $subject = "Новая заявка с сайта TormozOk";
    $message = "
        Новая заявка от " . $data['name'] . "
        Телефон: " . $data['phone'] . "
        Email: " . $data['email'] . "
        Услуга: " . ($data['service'] ?? 'Не указана') . "
        Сообщение: " . ($data['message'] ?? 'Нет') . "
        Время: " . date('Y-m-d H:i:s') . "
        IP: " . $data['ip_address'] . "
    ";
    $headers = "From: no-reply@tormozok.ru\r\n";
    mail($to, $subject, $message, $headers);
    */
    
    // Логируем в файл (для отладки)
    $logMessage = date('Y-m-d H:i:s') . " - Новая заявка от {$data['name']} ({$data['phone']})\n";
    file_put_contents('feedback.log', $logMessage, FILE_APPEND);
    
    return true;
}

// Функция для получения всех заявок (для админки)
function getAllFeedback($pdo) {
    $stmt = $pdo->query("SELECT * FROM feedback ORDER BY created_at DESC");
    return $stmt->fetchAll();
}

// Функция для получения статистики
function getStats($pdo) {
    $stats = [];
    
    // Общее количество заявок
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM feedback");
    $stats['total'] = $stmt->fetch()['total'];
    
    // Заявки по статусам
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM feedback GROUP BY status");
    $stats['by_status'] = $stmt->fetchAll();
    
    // Заявки по услугам
    $stmt = $pdo->query("SELECT service, COUNT(*) as count FROM feedback WHERE service IS NOT NULL GROUP BY service");
    $stats['by_service'] = $stmt->fetchAll();
    
    return $stats;
}
?>