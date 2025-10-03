// Управление транскрибациями
let currentAudioId = null;
let currentFilter = 'all';
let audioRecords = [];
let users = [];

// Проверка доступа
function checkAccess() {
  const sessionData = sessionStorage.getItem('currentUser');
  if (!sessionData) {
    window.location.href = 'admin-login.html';
    return null;
  }

  const currentUser = JSON.parse(sessionData);
  
  // Доступ только для админов
  if (currentUser.role !== 'admin') {
    alert('Доступ запрещен. Эта страница доступна только администраторам.');
    window.location.href = currentUser.role === 'manager' ? 'manager-dashboard.html' : 'employee-dashboard.html';
    return null;
  }

  return currentUser;
}

// Выход
function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'admin-login.html';
}

// Загрузка пользователей
function loadUsers() {
  const usersData = localStorage.getItem('users');
  users = usersData ? JSON.parse(usersData) : [];
  console.log('👥 Загружено пользователей:', users.length);
}

// Получить имя сотрудника
function getEmployeeName(employeeId) {
  const employee = users.find(u => u.id == employeeId);
  return employee ? employee.username : `ID ${employeeId}`;
}

// Загрузка данных
async function loadData() {
  try {
    audioRecords = await AudioDB.load();
    console.log('📼 Загружено аудиозаписей:', audioRecords.length);
    
    updateStats();
    renderAudioTable();
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    alert('Ошибка загрузки данных: ' + error.message);
  }
}

// Обновление статистики
function updateStats() {
  const total = audioRecords.length;
  const level1 = audioRecords.filter(r => r.transcription_level1).length;
  const level2 = audioRecords.filter(r => r.transcription_level2).length;

  document.getElementById('totalAudio').textContent = total;
  document.getElementById('level1Count').textContent = level1;
  document.getElementById('level2Count').textContent = level2;
}

// Фильтрация
function filterAudio(filter) {
  currentFilter = filter;
  
  // Обновляем активную кнопку
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
  
  renderAudioTable();
}

// Отрисовка таблицы
function renderAudioTable() {
  const tbody = document.getElementById('audioTableBody');
  
  // Фильтруем записи
  let filtered = [...audioRecords];
  
  if (currentFilter === 'missing') {
    filtered = filtered.filter(r => !r.transcription_level1 && !r.transcription_level2);
  } else if (currentFilter === 'partial') {
    filtered = filtered.filter(r => 
      (r.transcription_level1 && !r.transcription_level2) || 
      (!r.transcription_level1 && r.transcription_level2)
    );
  } else if (currentFilter === 'complete') {
    filtered = filtered.filter(r => r.transcription_level1 && r.transcription_level2);
  }
  
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-secondary);">
          ${currentFilter === 'all' ? 'Нет аудиозаписей' : 'Нет записей, соответствующих фильтру'}
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filtered.map(record => {
    const hasLevel1 = !!record.transcription_level1;
    const hasLevel2 = !!record.transcription_level2;
    
    return `
      <tr>
        <td>${record.id}</td>
        <td>
          <div style="font-weight: 500;">${record.fileName}</div>
          ${record.description ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${record.description}</div>` : ''}
        </td>
        <td>${getEmployeeName(record.employeeId)}</td>
        <td>
          <div class="transcription-status">
            <div class="level-badge ${hasLevel1 ? 'uploaded' : 'missing'}">
              ${hasLevel1 ? '✓' : '✗'} Уровень 1
            </div>
            <div class="level-badge ${hasLevel2 ? 'uploaded' : 'missing'}">
              ${hasLevel2 ? '✓' : '✗'} Уровень 2
            </div>
          </div>
        </td>
        <td>
          <button class="btn-action" onclick="openUploadTranscriptionModal(${record.id})" title="Загрузить транскрибацию">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </button>
          ${hasLevel1 || hasLevel2 ? `
            <button class="btn-action" onclick="viewTranscriptions(${record.id})" title="Просмотр">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// Открыть модальное окно загрузки
function openUploadTranscriptionModal(audioId) {
  const record = audioRecords.find(r => r.id === audioId);
  if (!record) {
    alert('Аудиозапись не найдена');
    return;
  }
  
  currentAudioId = audioId;
  document.getElementById('modalAudioName').textContent = record.fileName;
  document.getElementById('modalEmployeeName').textContent = getEmployeeName(record.employeeId);
  
  // Очищаем формы
  document.getElementById('jsonFile1').value = '';
  document.getElementById('jsonFile2').value = '';
  document.getElementById('jsonText1').value = '';
  document.getElementById('jsonText2').value = '';
  document.getElementById('jsonPreview1').style.display = 'none';
  document.getElementById('jsonPreview2').style.display = 'none';
  
  // Если есть существующие транскрибации - показываем их
  if (record.transcription_level1) {
    document.getElementById('jsonText1').value = JSON.stringify(record.transcription_level1, null, 2);
  }
  if (record.transcription_level2) {
    document.getElementById('jsonText2').value = JSON.stringify(record.transcription_level2, null, 2);
  }
  
  switchLevel(1);
  document.getElementById('uploadTranscriptionModal').style.display = 'flex';
}

// Закрыть модальное окно
function closeUploadTranscriptionModal() {
  document.getElementById('uploadTranscriptionModal').style.display = 'none';
  currentAudioId = null;
}

// Переключение уровня
function switchLevel(level) {
  document.querySelectorAll('.json-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-level="${level}"]`).classList.add('active');
  
  document.getElementById('level1Content').style.display = level === 1 ? 'block' : 'none';
  document.getElementById('level2Content').style.display = level === 2 ? 'block' : 'none';
}

// Загрузка файла уровня 1
document.addEventListener('DOMContentLoaded', () => {
  const jsonFile1 = document.getElementById('jsonFile1');
  if (jsonFile1) {
    jsonFile1.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        document.getElementById('jsonText1').value = text;
        validateAndPreviewJSON(text, 1);
      } catch (error) {
        alert('Ошибка чтения файла: ' + error.message);
      }
    });
  }
  
  // Загрузка файла уровня 2
  const jsonFile2 = document.getElementById('jsonFile2');
  if (jsonFile2) {
    jsonFile2.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        document.getElementById('jsonText2').value = text;
        validateAndPreviewJSON(text, 2);
      } catch (error) {
        alert('Ошибка чтения файла: ' + error.message);
      }
    });
  }
  
  // Drag & drop для уровня 1
  const dropZone1 = document.getElementById('dropZone1');
  if (dropZone1) {
    dropZone1.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone1.classList.add('dragover');
    });
    
    dropZone1.addEventListener('dragleave', () => {
      dropZone1.classList.remove('dragover');
    });
    
    dropZone1.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone1.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        document.getElementById('jsonText1').value = text;
        validateAndPreviewJSON(text, 1);
      } catch (error) {
        alert('Ошибка чтения файла: ' + error.message);
      }
    });
  }
  
  // Drag & drop для уровня 2
  const dropZone2 = document.getElementById('dropZone2');
  if (dropZone2) {
    dropZone2.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone2.classList.add('dragover');
    });
    
    dropZone2.addEventListener('dragleave', () => {
      dropZone2.classList.remove('dragover');
    });
    
    dropZone2.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone2.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        document.getElementById('jsonText2').value = text;
        validateAndPreviewJSON(text, 2);
      } catch (error) {
        alert('Ошибка чтения файла: ' + error.message);
      }
    });
  }
});

// Валидация и предпросмотр JSON
function validateAndPreviewJSON(text, level) {
  const previewElement = document.getElementById(`jsonPreview${level}`);
  
  try {
    const json = JSON.parse(text);
    
    // Валидация структуры
    if (level === 1) {
      if (!Array.isArray(json)) {
        throw new Error('Уровень 1 должен быть массивом');
      }
      if (json.length === 0) {
        throw new Error('Массив не может быть пустым');
      }
      // Проверяем первый элемент
      const first = json[0];
      if (!first.text || typeof first.start_time !== 'number' || typeof first.end_time !== 'number') {
        throw new Error('Каждый элемент должен содержать text (string), start_time (number), end_time (number)');
      }
    } else if (level === 2) {
      if (typeof json !== 'object' || Array.isArray(json)) {
        throw new Error('Уровень 2 должен быть объектом');
      }
      if (!json.utterances || !Array.isArray(json.utterances)) {
        throw new Error('Объект должен содержать массив utterances');
      }
      if (json.utterances.length === 0) {
        throw new Error('Массив utterances не может быть пустым');
      }
      // Проверяем первый элемент
      const first = json.utterances[0];
      if (typeof first.idx !== 'number' || !first.t_str || !first.speaker || !first.text) {
        throw new Error('Каждый utterance должен содержать idx (number), t_str (string), speaker (string), text (string)');
      }
    }
    
    // Показываем предпросмотр
    previewElement.textContent = JSON.stringify(json, null, 2);
    previewElement.style.display = 'block';
    
    return json;
  } catch (error) {
    previewElement.textContent = '❌ Ошибка: ' + error.message;
    previewElement.style.display = 'block';
    throw error;
  }
}

// Загрузка транскрибации уровня 1
async function uploadTranscriptionLevel1() {
  if (!currentAudioId) return;
  
  const jsonText = document.getElementById('jsonText1').value.trim();
  if (!jsonText) {
    alert('Вставьте JSON транскрибации');
    return;
  }
  
  try {
    const json = validateAndPreviewJSON(jsonText, 1);
    
    // Сохраняем в IndexedDB
    await AudioDB.update(currentAudioId, {
      transcription_level1: json,
      transcription_level1_uploaded: new Date().toISOString()
    });
    
    console.log('✅ Транскрибация уровня 1 сохранена для аудио ID:', currentAudioId);
    alert('Транскрибация уровня 1 успешно загружена!');
    
    closeUploadTranscriptionModal();
    await loadData();
  } catch (error) {
    console.error('❌ Ошибка загрузки транскрибации:', error);
    alert('Ошибка: ' + error.message);
  }
}

// Загрузка транскрибации уровня 2
async function uploadTranscriptionLevel2() {
  if (!currentAudioId) return;
  
  const jsonText = document.getElementById('jsonText2').value.trim();
  if (!jsonText) {
    alert('Вставьте JSON транскрибации');
    return;
  }
  
  try {
    const json = validateAndPreviewJSON(jsonText, 2);
    
    // Сохраняем в IndexedDB
    await AudioDB.update(currentAudioId, {
      transcription_level2: json,
      transcription_level2_uploaded: new Date().toISOString()
    });
    
    console.log('✅ Транскрибация уровня 2 сохранена для аудио ID:', currentAudioId);
    alert('Транскрибация уровня 2 успешно загружена!');
    
    closeUploadTranscriptionModal();
    await loadData();
  } catch (error) {
    console.error('❌ Ошибка загрузки транскрибации:', error);
    alert('Ошибка: ' + error.message);
  }
}

// Просмотр транскрибаций
function viewTranscriptions(audioId) {
  // Переход на страницу просмотра разговора
  window.location.href = `conversation-view.html?audioId=${audioId}`;
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = checkAccess();
  if (!currentUser) return;
  
  document.getElementById('currentUserName').textContent = currentUser.username;
  
  loadUsers();
  await loadData();
});

