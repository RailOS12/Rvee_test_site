# 📤 Инструкция по публикации в репозиторий Rvee_test_site

## Вариант 1: Копирование файлов в существующий репозиторий

### Шаг 1: Клонируйте ваш репозиторий

```bash
cd C:\Users\salim\
git clone https://github.com/RailOS12/Rvee_test_site.git
cd Rvee_test_site
```

### Шаг 2: Скопируйте файлы

Скопируйте все файлы из `C:\Users\salim\T-one\docs\` в папку `C:\Users\salim\Rvee_test_site\`

Или через PowerShell:

```powershell
# Копируем файлы админ-панели
Copy-Item "C:\Users\salim\T-one\docs\admin-login.html" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\admin-panel.html" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\admin-login.js" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\admin-panel.js" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\admin-styles.css" "C:\Users\salim\Rvee_test_site\"

# Копируем презентационный сайт (опционально)
Copy-Item "C:\Users\salim\T-one\docs\index.html" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\styles.css" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\script.js" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\logo.png" "C:\Users\salim\Rvee_test_site\"

# Копируем документацию
Copy-Item "C:\Users\salim\T-one\docs\README.md" "C:\Users\salim\Rvee_test_site\"
Copy-Item "C:\Users\salim\T-one\docs\DEPLOY.md" "C:\Users\salim\Rvee_test_site\"
```

### Шаг 3: Добавьте файлы в git

```bash
cd C:\Users\salim\Rvee_test_site
git add .
git commit -m "Add admin panel and presentation site"
git push origin main
```

### Шаг 4: Настройте GitHub Pages

1. Откройте https://github.com/RailOS12/Rvee_test_site/settings/pages
2. В разделе **Source** выберите:
   - Branch: `main`
   - Folder: `/ (root)`
3. Нажмите **Save**

### Шаг 5: Готово!

Ваш сайт будет доступен по адресу:
- **Главная:** https://railos12.github.io/Rvee_test_site/
- **Админ-панель:** https://railos12.github.io/Rvee_test_site/admin-login.html

---

## Вариант 2: Быстрое копирование (все файлы сразу)

### PowerShell команда (скопируйте и выполните):

```powershell
# Перейдите в домашнюю папку
cd C:\Users\salim\

# Клонируйте репозиторий (если еще не клонирован)
if (!(Test-Path "Rvee_test_site")) {
    git clone https://github.com/RailOS12/Rvee_test_site.git
}

cd Rvee_test_site

# Копируем все файлы из docs
Copy-Item "C:\Users\salim\T-one\docs\admin-*.html" .
Copy-Item "C:\Users\salim\T-one\docs\admin-*.js" .
Copy-Item "C:\Users\salim\T-one\docs\admin-*.css" .
Copy-Item "C:\Users\salim\T-one\docs\index.html" .
Copy-Item "C:\Users\salim\T-one\docs\script.js" .
Copy-Item "C:\Users\salim\T-one\docs\styles.css" .
Copy-Item "C:\Users\salim\T-one\docs\logo.png" .
Copy-Item "C:\Users\salim\T-one\docs\*.md" .

# Добавляем в git
git add .
git commit -m "Add admin panel and presentation site"
git push origin main

Write-Host "`n✅ Готово! Файлы загружены в репозиторий." -ForegroundColor Green
Write-Host "🌐 Настройте GitHub Pages на https://github.com/RailOS12/Rvee_test_site/settings/pages" -ForegroundColor Cyan
```

---

## ⚙️ Настройка GitHub Pages

1. Перейдите: https://github.com/RailOS12/Rvee_test_site/settings/pages

2. В разделе **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`

3. Нажмите **Save**

4. Подождите 1-2 минуты

5. Откройте: https://railos12.github.io/Rvee_test_site/

---

## 🎯 Структура файлов в репозитории

После копирования ваш репозиторий должен выглядеть так:

```
Rvee_test_site/
├── index.html              # Главная страница (презентация T-one)
├── styles.css              # Стили для главной страницы
├── script.js               # Скрипты для главной страницы
├── logo.png                # Логотип
├── admin-login.html        # Страница входа в админ-панель
├── admin-panel.html        # Админ-панель
├── admin-login.js          # Логика авторизации
├── admin-panel.js          # Логика управления пользователями
├── admin-styles.css        # Стили для админ-панели
├── README.md               # Описание проекта
└── DEPLOY.md               # Инструкция по развертыванию
```

---

## 🔗 Ссылки после публикации

- 🌐 **Главная страница:** https://railos12.github.io/Rvee_test_site/
- 🔐 **Вход в админ-панель:** https://railos12.github.io/Rvee_test_site/admin-login.html
- 🎛️ **Админ-панель:** https://railos12.github.io/Rvee_test_site/admin-panel.html

**Демо-доступ:**
- Логин: `admin`
- Пароль: `admin123`

---

## 🆘 Помощь

Если что-то не получается:

1. Проверьте, что файлы скопированы в правильную папку
2. Убедитесь, что вы выполнили `git push`
3. Проверьте настройки GitHub Pages
4. Подождите 2-3 минуты после первой публикации

**Удачи! 🚀**
