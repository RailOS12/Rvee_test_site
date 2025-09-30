// Глобальные переменные
let users = [];
let currentFilter = 'all';

// Проверка авторизации
function checkAuth() {
  const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('rememberMe');
  
  if (!currentUser) {
    window.location.href = 'admin-login.html';
    return null;
  }
  
  return JSON.parse(currentUser);
}

// Загрузка пользователей
function loadUsers() {
  const savedUsers = localStorage.getItem('users');
  users = savedUsers ? JSON.parse(savedUsers) : [];
  console.log('📂 Загружено пользователей:', users.length, users);
  updateStats();
  renderUsers();
}

// Сохранение пользователей
function saveUsers() {
  console.log('💾 Сохранение пользователей:', users);
  try {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✅ Пользователи сохранены успешно');
    
    // Проверяем, что сохранилось
    const saved = localStorage.getItem('users');
    console.log('🔍 Проверка сохранения:', JSON.parse(saved));
  } catch (error) {
    console.error('❌ Ошибка сохранения:', error);
    alert('Ошибка сохранения данных! Проверьте консоль (F12)');
  }
  updateStats();
  renderUsers();
}

// Обновление статистики
function updateStats() {
  const total = users.length;
  const active = users.filter(u => u.status === 'active').length;
  const inactive = users.filter(u => u.status === 'inactive').length;
  
  document.getElementById('totalUsers').textContent = total;
  document.getElementById('activeUsers').textContent = active;
  document.getElementById('inactiveUsers').textContent = inactive;
}

// Отрисовка таблицы пользователей
function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  let filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm);
    
    const matchesFilter = 
      currentFilter === 'all' ||
      user.status === currentFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.3;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style="font-size: 18px; margin-bottom: 8px;">Пользователи не найдены</div>
          <div style="font-size: 14px;">Попробуйте изменить параметры поиска или создайте нового пользователя</div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredUsers.map(user => {
    const managerInfo = user.role === 'employee' && user.managerId 
      ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Менеджер: ${getManagerName(user.managerId)}</div>`
      : '';
    
    return `
      <tr>
        <td><span class="user-id">#${user.id}</span></td>
        <td>
          <span class="user-name">${escapeHtml(user.username)}</span>
          ${managerInfo}
        </td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge ${user.role}">${getRoleLabel(user.role)}</span></td>
        <td><span class="badge ${user.status}">${getStatusLabel(user.status)}</span></td>
        <td><span class="user-date">${formatDate(user.createdAt)}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-action" onclick="openEditUserModal(${user.id})">Изменить</button>
            <button class="btn-action delete" onclick="deleteUser(${user.id})">Удалить</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Вспомогательные функции
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getRoleLabel(role) {
  const labels = {
    'employee': 'Сотрудник',
    'manager': 'Менеджер'
  };
  return labels[role] || role;
}

// Получить имя менеджера по ID
function getManagerName(managerId) {
  if (!managerId) return '-';
  const manager = users.find(u => u.id === managerId);
  return manager ? manager.username : 'Не найден';
}

function getStatusLabel(status) {
  const labels = {
    'active': 'Активный',
    'inactive': 'Неактивный'
  };
  return labels[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Поиск пользователей
function searchUsers() {
  renderUsers();
}

// Фильтрация пользователей
function filterUsers(filter) {
  currentFilter = filter;
  
  // Обновляем активные кнопки фильтров
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
  
  renderUsers();
}

// Заполнить список менеджеров
function populateManagerSelect(selectId, excludeUserId = null) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Не назначен</option>';
  
  const managers = users.filter(u => u.role === 'manager' && u.id !== excludeUserId);
  managers.forEach(manager => {
    const option = document.createElement('option');
    option.value = manager.id;
    option.textContent = manager.username;
    select.appendChild(option);
  });
}

// Показать/скрыть поле выбора менеджера при создании
function toggleManagerSelect() {
  const role = document.getElementById('userRole').value;
  const managerGroup = document.getElementById('managerSelectGroup');
  
  if (role === 'employee') {
    managerGroup.style.display = 'block';
    populateManagerSelect('userManager');
  } else {
    managerGroup.style.display = 'none';
  }
}

// Показать/скрыть поле выбора менеджера при редактировании
function toggleEditManagerSelect() {
  const role = document.getElementById('editRole').value;
  const managerGroup = document.getElementById('editManagerSelectGroup');
  
  if (role === 'employee') {
    managerGroup.style.display = 'block';
    const userId = parseInt(document.getElementById('editUserId').value);
    populateManagerSelect('editManager', userId);
  } else {
    managerGroup.style.display = 'none';
  }
}

// Открытие модального окна создания пользователя
function openCreateUserModal() {
  document.getElementById('createUserModal').classList.add('show');
  document.getElementById('createUserForm').reset();
  toggleManagerSelect(); // Обновить видимость поля менеджера
}

// Закрытие модального окна создания
function closeCreateUserModal() {
  document.getElementById('createUserModal').classList.remove('show');
}

// Создание пользователя
document.getElementById('createUserForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('newUsername').value.trim();
  const email = document.getElementById('newEmail').value.trim();
  const password = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const role = document.getElementById('userRole').value;
  const status = document.getElementById('userStatus').value;
  
  // Валидация
  if (password !== confirmPassword) {
    alert('Пароли не совпадают!');
    return;
  }
  
  if (users.some(u => u.username === username)) {
    alert('Пользователь с таким логином уже существует!');
    return;
  }
  
  if (users.some(u => u.email === email)) {
    alert('Пользователь с таким email уже существует!');
    return;
  }
  
  // Получаем менеджера (если сотрудник)
  const managerId = role === 'employee' ? document.getElementById('userManager').value : null;
  
  // Создаем нового пользователя
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    email,
    password,
    role,
    status,
    managerId: managerId ? parseInt(managerId) : null,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers();
  closeCreateUserModal();
  
  // Показываем уведомление
  showNotification('Пользователь успешно создан!', 'success');
});

// Открытие модального окна редактирования
function openEditUserModal(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  document.getElementById('editUserId').value = user.id;
  document.getElementById('editUsername').value = user.username;
  document.getElementById('editEmail').value = user.email;
  document.getElementById('editPassword').value = '';
  document.getElementById('editRole').value = user.role;
  document.getElementById('editStatus').value = user.status;
  
  // Настроить поле менеджера
  toggleEditManagerSelect();
  
  if (user.role === 'employee' && user.managerId) {
    document.getElementById('editManager').value = user.managerId;
  }
  
  document.getElementById('editUserModal').classList.add('show');
}

// Закрытие модального окна редактирования
function closeEditUserModal() {
  document.getElementById('editUserModal').classList.remove('show');
}

// Редактирование пользователя
document.getElementById('editUserForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const userId = parseInt(document.getElementById('editUserId').value);
  const username = document.getElementById('editUsername').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value;
  const role = document.getElementById('editRole').value;
  const status = document.getElementById('editStatus').value;
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return;
  
  // Проверяем уникальность логина и email (кроме текущего пользователя)
  if (users.some(u => u.id !== userId && u.username === username)) {
    alert('Пользователь с таким логином уже существует!');
    return;
  }
  
  if (users.some(u => u.id !== userId && u.email === email)) {
    alert('Пользователь с таким email уже существует!');
    return;
  }
  
  // Получаем менеджера (если сотрудник)
  const managerId = role === 'employee' ? document.getElementById('editManager').value : null;
  
  // Обновляем данные
  users[userIndex].username = username;
  users[userIndex].email = email;
  users[userIndex].role = role;
  users[userIndex].status = status;
  users[userIndex].managerId = managerId ? parseInt(managerId) : null;
  
  // Обновляем пароль только если он введен
  if (password) {
    users[userIndex].password = password;
  }
  
  saveUsers();
  closeEditUserModal();
  showNotification('Данные пользователя обновлены!', 'success');
});

// Удаление пользователя
function deleteUser(userId) {
  const user = users.find(u => u.id === userId);
  if (!user) return;
  
  const currentUser = checkAuth();
  if (currentUser && currentUser.userId === userId) {
    alert('Вы не можете удалить свою учетную запись!');
    return;
  }
  
  if (confirm(`Вы уверены, что хотите удалить пользователя "${user.username}"?`)) {
    users = users.filter(u => u.id !== userId);
    saveUsers();
    showNotification('Пользователь удален!', 'warning');
  }
}

// Выход из системы
function logout() {
  if (confirm('Вы уверены, что хотите выйти?')) {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    window.location.href = 'admin-login.html';
  }
}

// Перезагрузить пользователей
function reloadUsers() {
  console.log('🔄 Принудительная перезагрузка пользователей');
  loadUsers();
  showNotification('Данные обновлены из localStorage', 'success');
}

// Показать уведомление
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--warning)'};
    color: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px var(--shadow);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Закрытие модальных окон по клику вне их
window.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', function() {
  const currentUser = checkAuth();
  if (currentUser) {
    document.getElementById('currentUserName').textContent = currentUser.username;
    
    // Найти полные данные пользователя
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const fullUser = users.find(u => u.id === currentUser.userId);
      if (fullUser) {
        document.getElementById('currentUserRole').textContent = getRoleLabel(fullUser.role);
      }
    }
    
    loadUsers();
  }
});

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
