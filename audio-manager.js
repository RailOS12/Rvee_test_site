// Проверка авторизации
function checkAuth() {
  const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('rememberMe');
  
  if (!currentUser) {
    window.location.href = 'admin-login.html';
    return null;
  }
  
  const user = JSON.parse(currentUser);
  
  // Проверка роли (админ или менеджер)
  if (user.role !== 'admin' && user.role !== 'manager') {
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

// Загрузить все аудиозаписи (async)
async function loadAudioRecords() {
  return await window.AudioDB.load();
}

// Сохранить аудиозаписи (async)
async function saveAudioRecords(records) {
  await window.AudioDB.save(records);
}

// Получить сотрудников
function getEmployees() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.filter(u => u.role === 'employee' && u.status === 'active');
}

// Получить имя пользователя
function getUserName(userId) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.id === userId);
  return user ? user.username : 'Неизвестен';
}

// Обновить статистику
async function updateStats() {
  const records = await loadAudioRecords();
  
  const totalAudio = records.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayUploads = records.filter(r => r.uploadDate.startsWith(today)).length;
  
  const totalSize = records.reduce((sum, r) => sum + (r.size || 0), 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  document.getElementById('totalAudio').textContent = totalAudio;
  document.getElementById('todayUploads').textContent = todayUploads;
  document.getElementById('totalSize').textContent = totalSizeMB + ' MB';
}

// Отрисовать таблицу
async function renderAudioTable() {
  const currentUser = checkAuth(); // Получаем текущего пользователя
  const records = await loadAudioRecords();
  const tbody = document.getElementById('audioTableBody');
  
  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.3;">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <div style="font-size: 18px; margin-bottom: 8px;">Нет аудиозаписей</div>
          <div style="font-size: 14px;">Загрузите первую запись разговора</div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Сортировка по дате (новые сверху)
  const sorted = [...records].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  
  tbody.innerHTML = sorted.map(record => {
    const employeeName = getUserName(record.employeeId);
    const uploadedBy = getUserName(record.uploadedBy);
    const size = (record.size / 1024 / 1024).toFixed(2);
    
    return `
      <tr>
        <td><span class="user-id">#${record.id}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span>${escapeHtml(record.fileName)}</span>
          </div>
          ${record.description ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(record.description)}</div>` : ''}
        </td>
        <td>${employeeName}</td>
        <td><span class="user-date">${formatDate(record.uploadDate)}</span></td>
        <td>${formatDuration(record.duration || 0)}</td>
        <td>${size} MB</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action" onclick="viewAudioTranscript(${record.id})" title="Просмотр">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            ${currentUser && currentUser.role === 'admin' ? `
            <button class="btn-action" onclick="editTranscription(${record.id})" title="Транскрибация">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            ` : ''}
            <button class="btn-action" onclick="downloadAudio(${record.id})" title="Скачать">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button class="btn-action delete" onclick="deleteAudio(${record.id})" title="Удалить">Удалить</button>
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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(seconds) {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Модальное окно
function openUploadAudioModal() {
  document.getElementById('uploadAudioModal').classList.add('show');
  populateEmployeeSelect();
  document.getElementById('uploadAudioForm').reset();
  document.getElementById('uploadProgress').style.display = 'none';
}

function closeUploadAudioModal() {
  document.getElementById('uploadAudioModal').classList.remove('show');
}

// Заполнить список сотрудников
function populateEmployeeSelect() {
  const employees = getEmployees();
  const select = document.getElementById('audioEmployee');
  
  select.innerHTML = '<option value="">Выберите сотрудника</option>';
  
  employees.forEach(emp => {
    const option = document.createElement('option');
    option.value = emp.id;
    option.textContent = `${emp.username} (${emp.email})`;
    select.appendChild(option);
  });
}

// Обработка загрузки
document.getElementById('uploadAudioForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const employeeId = parseInt(document.getElementById('audioEmployee').value);
  const fileInput = document.getElementById('audioFile');
  const description = document.getElementById('audioDescription').value.trim();
  const currentUser = checkAuth();
  
  if (!fileInput.files.length) {
    alert('Выберите файл!');
    return;
  }
  
  const file = fileInput.files[0];
  
  // Проверка размера (макс 10 МБ)
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    alert('Файл слишком большой! Максимальный размер: 10 МБ');
    return;
  }
  
  // Показать прогресс
  const progressDiv = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('uploadProgressBar');
  const progressText = document.getElementById('uploadProgressText');
  const uploadButton = document.getElementById('uploadButton');
  
  progressDiv.style.display = 'block';
  uploadButton.disabled = true;
  progressText.textContent = '0%';
  progressBar.style.width = '0%';
  
  try {
    // Читаем файл
    const audioData = await readFileAsDataURL(file, (progress) => {
      progressText.textContent = progress + '%';
      progressBar.style.width = progress + '%';
    });
    
    // Получаем длительность
    const duration = await getAudioDuration(audioData);
    
    // Создаем запись (без ID - будет автоинкремент)
    const newRecord = {
      employeeId: employeeId,
      fileName: file.name,
      description: description,
      uploadDate: new Date().toISOString(),
      uploadedBy: currentUser.id, // Исправлено: используем currentUser.id
      duration: Math.floor(duration),
      size: file.size,
      audioData: audioData
    };
    
    console.log('💾 Сохранение аудиозаписи:', {
      employeeId: newRecord.employeeId,
      fileName: newRecord.fileName,
      uploadedBy: newRecord.uploadedBy,
      currentUserId: currentUser.id,
      duration: newRecord.duration
    });
    
    // Добавляем в IndexedDB
    const savedRecord = await window.AudioDB.add(newRecord);
    console.log('✅ Аудиозапись сохранена с ID:', savedRecord.id);
    
    // Обновить интерфейс
    await updateStats();
    await renderAudioTable();
    closeUploadAudioModal();
    
    showNotification('Аудиозапись успешно загружена!', 'success');
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    alert('Ошибка при загрузке файла: ' + error.message);
  } finally {
    uploadButton.disabled = false;
    progressDiv.style.display = 'none';
  }
});

// Чтение файла как Data URL
function readFileAsDataURL(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    };
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Получить длительность аудио
function getAudioDuration(dataURL) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = dataURL;
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      reject(new Error('Не удалось загрузить аудио'));
    });
  });
}

// Воспроизвести аудио
async function playAudio(id) {
  const record = await window.AudioDB.get(id);
  
  if (!record) {
    alert('Запись не найдена!');
    return;
  }
  
  // Создаем аудио элемент
  const audio = new Audio(record.audioData);
  audio.controls = true;
  
  // Показываем модальное окно с плеером
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <div class="modal-header">
        <h2>${escapeHtml(record.fileName)}</h2>
        <button class="modal-close" onclick="this.closest('.modal').remove()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div style="padding: 24px;">
        <div style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px;">
          Сотрудник: ${getUserName(record.employeeId)}<br>
          Дата загрузки: ${formatDate(record.uploadDate)}<br>
          Длительность: ${formatDuration(record.duration)}
          ${record.description ? '<br>Описание: ' + escapeHtml(record.description) : ''}
        </div>
        <div id="audioPlayerContainer"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.getElementById('audioPlayerContainer').appendChild(audio);
  audio.play();
  
  // Закрыть по клику вне окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      audio.pause();
      modal.remove();
    }
  });
}

// Скачать аудио
async function downloadAudio(id) {
  const record = await window.AudioDB.get(id);
  
  if (!record) {
    alert('Запись не найдена!');
    return;
  }
  
  const a = document.createElement('a');
  a.href = record.audioData;
  a.download = record.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  showNotification('Файл загружен', 'success');
}

// Удалить аудио
async function deleteAudio(id) {
  const record = await window.AudioDB.get(id);
  
  if (!record) return;
  
  if (confirm(`Удалить запись "${record.fileName}"?`)) {
    await window.AudioDB.delete(id);
    await updateStats();
    await renderAudioTable();
    showNotification('Запись удалена', 'warning');
  }
}

// Просмотр транскрибации
function viewAudioTranscript(id) {
  window.location.href = `conversation-view.html?audioId=${id}`;
}

// Редактировать транскрибацию
function editTranscription(id) {
  window.location.href = `upload-transcript.html?audioId=${id}`;
}

// Фильтрация
function filterAudio(filter) {
  // TODO: Реализовать фильтрацию
  console.log('Filter:', filter);
}

// Показать уведомление
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--warning)'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px var(--shadow);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    font-size: 14px;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Инициализация
window.addEventListener('DOMContentLoaded', function() {
  const currentUser = checkAuth();
  if (currentUser) {
    document.getElementById('currentUserName').textContent = currentUser.username;
    updateStats();
    renderAudioTable();
  }
});
