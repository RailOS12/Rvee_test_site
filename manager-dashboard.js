// Проверка авторизации
function checkAuth() {
  const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('rememberMe');
  
  if (!currentUser) {
    window.location.href = 'admin-login.html';
    return null;
  }
  
  const user = JSON.parse(currentUser);
  
  // Проверка роли
  if (user.role !== 'manager') {
    window.location.href = 'admin-login.html';
    return null;
  }
  
  return user;
}

// Выход
function logout() {
  if (confirm('Вы уверены, что хотите выйти?')) {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    window.location.href = 'admin-login.html';
  }
}

// Получить всех сотрудников менеджера
function getMyEmployees() {
  const currentUser = checkAuth();
  if (!currentUser) return [];
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.filter(u => u.role === 'employee' && u.managerId === currentUser.userId);
}

// Получить все разговоры сотрудников
function getAllConversations() {
  const employees = getMyEmployees();
  const employeeIds = employees.map(e => e.id);
  
  const mockData = JSON.parse(localStorage.getItem('mockConversations') || '[]');
  return mockData.filter(conv => employeeIds.includes(conv.employeeId));
}

// Обновить статистику
function updateStats() {
  const employees = getMyEmployees();
  const conversations = getAllConversations();
  
  const teamSize = employees.length;
  const totalCalls = conversations.length;
  const teamAvgScore = conversations.length > 0
    ? (conversations.reduce((sum, conv) => sum + conv.score, 0) / conversations.length).toFixed(1)
    : 0;
  
  document.getElementById('teamSize').textContent = teamSize;
  document.getElementById('totalCalls').textContent = totalCalls;
  document.getElementById('teamAvgScore').textContent = teamAvgScore;
}

// Отрисовать таблицу сотрудников
function renderEmployees() {
  const employees = getMyEmployees();
  const conversations = getAllConversations();
  const tbody = document.getElementById('employeesTableBody');
  
  if (employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          У вас пока нет сотрудников. <a href="admin-panel.html" style="color: var(--primary);">Добавить сотрудника</a>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = employees.map(emp => {
    const empConversations = conversations.filter(c => c.employeeId === emp.id);
    const callsCount = empConversations.length;
    const avgScore = callsCount > 0
      ? (empConversations.reduce((sum, c) => sum + c.score, 0) / callsCount).toFixed(1)
      : '-';
    
    const scoreClass = avgScore >= 8 ? 'success' : avgScore >= 6 ? 'warning' : avgScore === '-' ? '' : 'danger';
    
    return `
      <tr>
        <td><span class="user-name">${emp.username}</span></td>
        <td>${emp.email}</td>
        <td>${callsCount}</td>
        <td><span class="badge ${scoreClass}">${avgScore}</span></td>
        <td><span class="badge ${emp.status}">${emp.status === 'active' ? 'Активный' : 'Неактивный'}</span></td>
        <td>
          <button class="btn-action" onclick="viewEmployeeDetails(${emp.id})">Просмотр</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Отрисовать разговоры
function renderConversations() {
  const conversations = getAllConversations();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const container = document.getElementById('conversationsList');
  
  if (conversations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.3;">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <div style="font-size: 18px; margin-bottom: 8px;">Пока нет разговоров</div>
        <div style="font-size: 14px;">Разговоры появятся, когда сотрудники загрузят транскрибации</div>
      </div>
    `;
    return;
  }
  
  // Сортировка по дате (новые сверху)
  const sorted = [...conversations].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  container.innerHTML = sorted.slice(0, 10).map(conv => {
    const employee = users.find(u => u.id === conv.employeeId);
    const employeeName = employee ? employee.username : 'Неизвестен';
    const scoreClass = conv.score >= 8 ? 'success' : conv.score >= 6 ? 'warning' : 'danger';
    
    return `
      <div class="conversation-item" onclick="viewConversation(${conv.id})">
        <div class="conversation-info">
          <div class="conversation-title">${conv.candidateName}</div>
          <div class="conversation-meta">
            <span>Сотрудник: ${employeeName}</span>
            <span>•</span>
            <span>${formatDate(conv.date)}</span>
            <span>•</span>
            <span>${formatDuration(conv.duration)}</span>
          </div>
        </div>
        <div class="conversation-score score-${scoreClass}">
          ${conv.score.toFixed(1)}
        </div>
        <div class="conversation-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    `;
  }).join('');
}

// Форматировать дату
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера, ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleString('ru-RU', { 
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Форматировать длительность
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Просмотр разговора
function viewConversation(id) {
  window.location.href = `conversation-view.html?id=${id}`;
}

// Просмотр деталей сотрудника
function viewEmployeeDetails(employeeId) {
  // В будущем можно сделать отдельную страницу с детальной статистикой сотрудника
  alert('Детальная статистика сотрудника будет доступна в следующей версии');
}

// Фильтр разговоров
function filterConversations(filter) {
  // TODO: Реализовать фильтрацию
  console.log('Filter:', filter);
}

// Фильтр по датам
function filterByDateRange() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  console.log('Filter by date range:', startDate, endDate);
  // TODO: Реализовать фильтрацию
}

// Инициализация
window.addEventListener('DOMContentLoaded', function() {
  const currentUser = checkAuth();
  if (currentUser) {
    document.getElementById('currentUserName').textContent = currentUser.username;
    
    // Загрузка данных
    updateStats();
    renderEmployees();
    renderConversations();
    
    // Установка дат
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    document.getElementById('endDate').valueAsDate = endDate;
    document.getElementById('startDate').valueAsDate = startDate;
  }
});
