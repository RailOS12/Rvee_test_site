// Инициализация демо-пользователей (только если данных НЕТ вообще)
function initializeDemoUser() {
  const savedUsers = localStorage.getItem('users');
  const initialized = localStorage.getItem('demo_initialized');
  
  console.log('🔧 initializeDemoUser вызвана');
  console.log('   savedUsers:', savedUsers ? 'есть данные' : 'нет данных');
  console.log('   initialized:', initialized);
  
  // Создаем демо-данные ТОЛЬКО если их нет И инициализация не была выполнена
  if (!savedUsers && !initialized) {
    console.log('⚠️ СОЗДАНИЕ ДЕМО-ДАННЫХ');
    const demoUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@callanalytics.com',
        role: 'manager',
        status: 'active',
        managerId: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        username: 'ivanov',
        password: 'ivanov123',
        email: 'ivanov@callanalytics.com',
        role: 'employee',
        status: 'active',
        managerId: 1,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
    localStorage.setItem('demo_initialized', 'true');
    console.log('✅ Демо-данные созданы');
  } else if (savedUsers) {
    console.log('✅ Данные уже есть, пропускаем инициализацию');
  }
}

// Показать/скрыть пароль
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const icon = document.querySelector('.eye-icon');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    passwordInput.type = 'password';
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
}

// Показать сообщение об ошибке
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  
  setTimeout(() => {
    errorDiv.classList.remove('show');
  }, 4000);
}

// Обработка формы входа
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Получаем пользователей из localStorage
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Проверяем учетные данные
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    if (user.status === 'inactive') {
      showError('Учетная запись неактивна. Обратитесь к администратору.');
      return;
    }
    
    // Сохраняем сессию
    const sessionData = {
      id: user.id, // Исправлено: используем id вместо userId
      userId: user.id, // Оставляем для обратной совместимости
      username: user.username,
      role: user.role,
      email: user.email,
      managerId: user.managerId,
      loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', JSON.stringify(sessionData));
    }
    
    // Перенаправляем в зависимости от роли
    if (user.role === 'manager') {
      window.location.href = 'manager-dashboard.html';
    } else if (user.role === 'employee') {
      window.location.href = 'employee-dashboard.html';
    } else {
      window.location.href = 'admin-panel.html';
    }
  } else {
    showError('Неверный логин или пароль');
  }
});

// Проверка сохраненной сессии при загрузке
window.addEventListener('DOMContentLoaded', function() {
  initializeDemoUser();
  
  // Проверяем, есть ли активная сессия
  const currentUser = sessionStorage.getItem('currentUser');
  const rememberMe = localStorage.getItem('rememberMe');
  
  if (currentUser || rememberMe) {
    // Если пользователь уже залогинен, перенаправляем в зависимости от роли
    const userData = JSON.parse(currentUser || rememberMe);
    
    if (userData.role === 'manager') {
      window.location.href = 'manager-dashboard.html';
    } else if (userData.role === 'employee') {
      window.location.href = 'employee-dashboard.html';
    } else {
      window.location.href = 'admin-panel.html';
    }
    return; // Останавливаем дальнейшее выполнение
  }
  
  // Автозаполнение если включено "Запомнить меня"
  if (rememberMe) {
    const userData = JSON.parse(rememberMe);
    document.getElementById('username').value = userData.username;
    document.getElementById('rememberMe').checked = true;
  }
});

// Обработка Enter в полях ввода
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
  });
});
