<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: Phishing.html');
    exit();
}
$username = $_SESSION['user_id'];
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>پنل مدیریت</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: Tahoma; }
        body { background: #f5f5f5; }
        .header { background: #2980b9; color: white; padding: 20px; display: flex; justify-content: space-between; }
        .logout-btn { background: red; color: white; border: none; padding: 10px; cursor: pointer; }
        .container { max-width: 1200px; margin: 20px auto; padding: 20px; }
        .welcome-box { background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .stat-item { background: white; padding: 20px; text-align: center; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>پنل مدیریت</h1>
        <div class="user-info">
            <span>کاربر: <strong><?php echo htmlspecialchars($username); ?></strong></span>
            <button class="logout-btn" onclick="window.location.href='logout.php'">خروج</button>
        </div>
    </div>
    
    <div class="container">
        <div class="welcome-box">
            <h2>خوش آمدید!</h2>
            <p>به پنل مدیریت خود خوش آمدید.</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">۱۲۵</div>
                <div class="stat-label">کاربران فعال</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">۴۸</div>
                <div class="stat-label">درخواست جدید</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">۹۵%</div>
                <div class="stat-label">رضایت کاربران</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">۲۳</div>
                <div class="stat-label">پیام جدید</div>
            </div>
        </div>
        
        <div class="footer">
            <p>© ۱۴۰۳ - تمامی حقوق محفوظ است.</p>
        </div>
    </div>
</body>
</html>