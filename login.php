<?php
session_start();

// اطلاعات کاربران (موقت - بعداً با دیتابیس جایگزین کنید)
$users = [
    'admin' => password_hash('123456', PASSWORD_DEFAULT),
    'user1' => password_hash('password1', PASSWORD_DEFAULT),
    'user2' => password_hash('password2', PASSWORD_DEFAULT)
];

// دریافت داده‌ها از فرم
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$remember = $_POST['remember'] ?? false;

// بررسی اطلاعات
if (empty($username) || empty($password)) {
    die(json_encode(['success' => false, 'error' => 'نام کاربری و رمز عبور الزامی است']));
}

// بررسی وجود کاربر
if (!isset($users[$username])) {
    die(json_encode(['success' => false, 'error' => 'نام کاربری یا رمز عبور اشتباه است']));
}

// بررسی رمز عبور
if (password_verify($password, $users[$username])) {
    // ذخیره اطلاعات در session
    $_SESSION['user_id'] = $username;
    $_SESSION['login_time'] = time();
    
    // اگر کاربر خواست "مرا به خاطر بسپار"
    if ($remember) {
        setcookie('remember_user', $username, time() + (30 * 24 * 60 * 60), '/'); // 30 روز
    }
    
    // پاسخ موفقیت‌آمیز
    echo json_encode([
        'success' => true,
        'message' => 'ورود موفقیت‌آمیز بود',
        'redirect' => 'dashboard.php',
        'user' => $username
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'نام کاربری یا رمز عبور اشتباه است']);
}
?>