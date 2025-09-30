// Получить ID разговора из URL
function getConversationId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

// Загрузить данные разговора
function loadConversation() {
  const id = getConversationId();
  const mockData = JSON.parse(localStorage.getItem('mockConversations') || '[]');
  return mockData.find(conv => conv.id === id);
}

// Форматировать длительность
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Форматировать дату
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

// Отрисовать транскрибацию
function renderTranscript(conversation) {
  const container = document.getElementById('transcriptList');
  
  container.innerHTML = conversation.transcript.map((item, index) => {
    const isEmployee = item.speaker === 'employee';
    const hasScore = item.score !== null;
    const timestamp = formatDuration(item.timestamp);
    
    let scoreClass = '';
    if (hasScore) {
      scoreClass = item.score >= 8 ? 'success' : item.score >= 6 ? 'warning' : 'danger';
    }
    
    return `
      <div class="transcript-item ${isEmployee ? 'employee' : 'candidate'}">
        <div class="transcript-meta">
          <button class="timestamp-button" onclick="jumpToTime(${item.timestamp})" title="Перейти к моменту">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            ${timestamp}
          </button>
          <span class="speaker-name">${isEmployee ? 'Вы' : 'Кандидат'}</span>
        </div>
        
        <div class="transcript-text">${item.text}</div>
        
        ${hasScore ? `
          <div class="transcript-evaluation">
            <div class="evaluation-score score-${scoreClass}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              ${item.score.toFixed(1)}
            </div>
            <div class="evaluation-comment">${item.comment}</div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Переключить воспроизведение
let isPlaying = false;
let currentTimeSeconds = 0;

function togglePlay() {
  isPlaying = !isPlaying;
  const playIcon = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    // Здесь была бы логика воспроизведения аудио
    simulatePlayback();
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    // Остановка воспроизведения
  }
}

// Симуляция воспроизведения (демо)
function simulatePlayback() {
  if (!isPlaying) return;
  
  const conversation = loadConversation();
  if (!conversation) return;
  
  const totalDuration = conversation.duration;
  
  if (currentTimeSeconds < totalDuration) {
    currentTimeSeconds += 1;
    updateProgress();
    setTimeout(simulatePlayback, 1000);
  } else {
    isPlaying = false;
    togglePlay();
    currentTimeSeconds = 0;
    updateProgress();
  }
}

// Обновить прогресс
function updateProgress() {
  const conversation = loadConversation();
  if (!conversation) return;
  
  const percentage = (currentTimeSeconds / conversation.duration) * 100;
  
  document.getElementById('currentTime').textContent = formatDuration(currentTimeSeconds);
  document.getElementById('progressFill').style.width = percentage + '%';
  document.getElementById('progressInput').value = percentage;
}

// Перемотать аудио
function seekAudio(percentage) {
  const conversation = loadConversation();
  if (!conversation) return;
  
  currentTimeSeconds = Math.floor((percentage / 100) * conversation.duration);
  updateProgress();
}

// Перейти к моменту
function jumpToTime(seconds) {
  currentTimeSeconds = seconds;
  updateProgress();
  
  // Автоматически начать воспроизведение
  if (!isPlaying) {
    togglePlay();
  }
  
  // Показать уведомление
  showNotification(`Переход к моменту ${formatDuration(seconds)}`);
}

// Изменить скорость
function changeSpeed(speed) {
  showNotification(`Скорость воспроизведения: ${speed}x`);
}

// Скачать транскрибацию
function downloadTranscript() {
  const conversation = loadConversation();
  if (!conversation) return;
  
  let text = `Разговор с: ${conversation.candidateName}\n`;
  text += `Дата: ${formatDate(conversation.date)}\n`;
  text += `Длительность: ${formatDuration(conversation.duration)}\n`;
  text += `Общий балл: ${conversation.score.toFixed(1)}\n\n`;
  text += '='.repeat(60) + '\n\n';
  
  conversation.transcript.forEach(item => {
    const speaker = item.speaker === 'employee' ? 'РЕКРУТЕР' : 'КАНДИДАТ';
    text += `[${formatDuration(item.timestamp)}] ${speaker}:\n`;
    text += `${item.text}\n`;
    
    if (item.score !== null) {
      text += `\nОЦЕНКА: ${item.score.toFixed(1)}/10\n`;
      text += `КОММЕНТАРИЙ: ${item.comment}\n`;
    }
    
    text += '\n' + '-'.repeat(60) + '\n\n';
  });
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcript_${conversation.candidateName}_${conversation.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('Транскрибация скачана');
}

// Показать уведомление
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    background: var(--primary);
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
  }, 2000);
}

// Вернуться назад
function goBack() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('rememberMe'));
  
  if (currentUser) {
    if (currentUser.role === 'employee') {
      window.location.href = 'employee-dashboard.html';
    } else if (currentUser.role === 'manager') {
      window.location.href = 'manager-dashboard.html';
    } else {
      window.history.back();
    }
  } else {
    window.history.back();
  }
}

// Инициализация
window.addEventListener('DOMContentLoaded', function() {
  const conversation = loadConversation();
  
  if (!conversation) {
    alert('Разговор не найден');
    goBack();
    return;
  }
  
  // Заполнить заголовок
  document.getElementById('conversationTitle').textContent = conversation.candidateName;
  document.getElementById('conversationDate').textContent = formatDate(conversation.date);
  document.getElementById('conversationDuration').textContent = formatDuration(conversation.duration);
  document.getElementById('conversationScore').textContent = conversation.score.toFixed(1);
  
  // Установить цвет оценки
  const scoreElement = document.getElementById('conversationScore');
  if (conversation.score >= 8) {
    scoreElement.style.color = 'var(--success)';
  } else if (conversation.score >= 6) {
    scoreElement.style.color = 'var(--warning)';
  } else {
    scoreElement.style.color = 'var(--danger)';
  }
  
  // Установить общее время
  document.getElementById('totalTime').textContent = formatDuration(conversation.duration);
  
  // Отрисовать транскрибацию
  renderTranscript(conversation);
});

// Добавить стили анимаций
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);
