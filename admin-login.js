// Инициализация демо-пользователя
function initializeDemoUser() {
  const savedUsers = localStorage.getItem('users');
  if (!savedUsers) {
    const demoUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
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
      userId: user.id,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', JSON.stringify(sessionData));
    }
    
    // Перенаправляем на админ-панель
    window.location.href = 'admin-panel.html';
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
    // Если пользователь уже залогинен, перенаправляем на админ-панель
    window.location.href = 'admin-panel.html';
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
