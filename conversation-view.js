// Получить ID разговора из URL
function getConversationId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

// Получить ID аудиозаписи из URL
function getAudioId() {
  const params = new URLSearchParams(window.location.search);
  const audioId = params.get('audioId');
  return audioId ? parseInt(audioId) : null;
}

// Загрузить данные разговора (моковые)
function loadConversation() {
  const id = getConversationId();
  const mockData = JSON.parse(localStorage.getItem('mockConversations') || '[]');
  return mockData.find(conv => conv.id === id);
}

// Загрузить аудиозапись
async function loadAudioRecord(audioId) {
  if (typeof window.AudioDB === 'undefined') {
    console.error('AudioDB не загружен');
    return null;
  }
  
  return await window.AudioDB.get(audioId);
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
function renderTranscript(transcriptData) {
  const container = document.getElementById('transcriptList');
  
  // Если транскрибации нет
  if (!transcriptData || !transcriptData.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 20px; opacity: 0.3;">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
        <h3 style="margin-bottom: 12px; font-size: 20px; color: var(--text-primary);">Транскрибация пока не загружена</h3>
        <p style="font-size: 14px; max-width: 400px; margin: 0 auto; line-height: 1.6;">
          Этот файл еще обрабатывается. Транскрибация разговора появится здесь автоматически после завершения обработки.
        </p>
        <div style="margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">
          <p style="font-size: 13px; margin: 0; color: var(--text-secondary);">
            💡 <strong>Обычно обработка занимает:</strong> 5-15 минут для разговора длительностью до 10 минут
          </p>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = transcriptData.map((item, index) => {
    const isEmployee = item.speaker === 'employee' || item.speaker === 'Рекрутер';
    const hasScore = item.score !== null && item.score !== undefined;
    
    // Преобразовать время из формата "[MM:SS]" в секунды
    let timestamp = 0;
    if (item.t_str) {
      // Новый формат: "[00:00]"
      const match = item.t_str.match(/\[(\d+):(\d+)\]/);
      if (match) {
        timestamp = parseInt(match[1]) * 60 + parseInt(match[2]);
      }
    } else if (item.timestamp !== undefined) {
      // Старый формат: timestamp в секундах
      timestamp = item.timestamp;
    }
    
    const timestampStr = formatDuration(timestamp);
    
    let scoreClass = '';
    if (hasScore) {
      scoreClass = item.score >= 8 ? 'success' : item.score >= 6 ? 'warning' : 'danger';
    }
    
    return `
      <div class="transcript-item ${isEmployee ? 'employee' : 'candidate'}">
        <div class="transcript-meta">
          <button class="timestamp-button" onclick="jumpToTime(${timestamp})" title="Перейти к моменту">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            ${timestampStr}
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

// Переменные для аудио
let audioElement = null;
let isPlaying = false;
let currentTimeSeconds = 0;
let currentAudioRecord = null;

// Переключить воспроизведение
function togglePlay() {
  if (!audioElement) {
    showNotification('Аудио-файл недоступен', 'warning');
    return;
  }
  
  isPlaying = !isPlaying;
  const playIcon = document.querySelector('.play-icon');
  const pauseIcon = document.querySelector('.pause-icon');
  
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    audioElement.play();
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    audioElement.pause();
  }
}

// Обновить прогресс
function updateProgress() {
  if (!audioElement || !currentAudioRecord) return;
  
  const percentage = (currentTimeSeconds / currentAudioRecord.duration) * 100;
  
  document.getElementById('currentTime').textContent = formatDuration(currentTimeSeconds);
  document.getElementById('progressFill').style.width = percentage + '%';
  document.getElementById('progressInput').value = percentage;
}

// Перемотать аудио
function seekAudio(percentage) {
  if (!audioElement || !currentAudioRecord) return;
  
  const newTime = (percentage / 100) * currentAudioRecord.duration;
  audioElement.currentTime = newTime;
  currentTimeSeconds = newTime;
  updateProgress();
}

// Перейти к моменту
function jumpToTime(seconds) {
  if (!audioElement || !currentAudioRecord) {
    showNotification('Аудио-файл недоступен', 'warning');
    return;
  }
  
  audioElement.currentTime = seconds;
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
window.addEventListener('DOMContentLoaded', async function() {
  const audioId = getAudioId();
  
  // Если это аудиозапись
  if (audioId) {
    const audioRecord = await loadAudioRecord(audioId);
    
    if (!audioRecord) {
      alert('Аудиозапись не найдена');
      goBack();
      return;
    }
    
    // Заполнить заголовок
    document.getElementById('conversationTitle').textContent = audioRecord.fileName;
    document.getElementById('conversationDate').textContent = formatDate(audioRecord.uploadDate);
    document.getElementById('conversationDuration').textContent = formatDuration(audioRecord.duration);
    
    // Скрыть оценку для аудио без транскрибации
    const scoreContainer = document.querySelector('.conversation-header-meta div:last-child');
    if (audioRecord.transcription && audioRecord.transcription.utterances) {
      // Есть транскрибация - вычислить среднюю оценку
      const utterances = audioRecord.transcription.utterances;
      const scores = utterances.filter(u => u.score !== null && u.score !== undefined).map(u => u.score);
      
      if (scores.length > 0) {
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        document.getElementById('conversationScore').textContent = avgScore.toFixed(1);
        
        const scoreElement = document.getElementById('conversationScore');
        if (avgScore >= 8) {
          scoreElement.style.color = 'var(--success)';
        } else if (avgScore >= 6) {
          scoreElement.style.color = 'var(--warning)';
        } else {
          scoreElement.style.color = 'var(--danger)';
        }
      } else {
        scoreContainer.style.display = 'none';
      }
    } else {
      scoreContainer.style.display = 'none';
    }
    
    // Установить общее время
    document.getElementById('totalTime').textContent = formatDuration(audioRecord.duration);
    
    // Создать аудио элемент, если есть данные
    if (audioRecord.audioData) {
      try {
        audioElement = new Audio(audioRecord.audioData);
        currentAudioRecord = audioRecord;
        
        // Настроить обработчики событий аудио
        audioElement.addEventListener('timeupdate', () => {
          currentTimeSeconds = audioElement.currentTime;
          updateProgress();
        });
        
        audioElement.addEventListener('ended', () => {
          isPlaying = false;
          const playIcon = document.querySelector('.play-icon');
          const pauseIcon = document.querySelector('.pause-icon');
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
          currentTimeSeconds = 0;
          updateProgress();
        });
        
        audioElement.addEventListener('error', (e) => {
          console.error('❌ Ошибка воспроизведения аудио:', e);
          showNotification('Ошибка воспроизведения аудио', 'error');
          // Показать уведомление
          const notice = document.getElementById('audioNotice');
          if (notice) {
            notice.style.display = 'flex';
            document.getElementById('audioNoticeText').textContent = 'Ошибка загрузки аудио';
          }
        });
        
        console.log('✅ Аудио элемент создан успешно');
      } catch (error) {
        console.error('❌ Ошибка создания аудио элемента:', error);
        const notice = document.getElementById('audioNotice');
        if (notice) {
          notice.style.display = 'flex';
          document.getElementById('audioNoticeText').textContent = 'Аудио-файл поврежден';
        }
      }
    } else {
      console.warn('⚠️ Нет данных аудио в записи');
      const notice = document.getElementById('audioNotice');
      if (notice) {
        notice.style.display = 'flex';
        document.getElementById('audioNoticeText').textContent = 'Аудио-файл отсутствует';
      }
    }
    
    // Отрисовать транскрибацию (или заглушку)
    const transcriptData = audioRecord.transcription?.utterances || null;
    renderTranscript(transcriptData);
    
    return;
  }
  
  // Иначе это моковые данные
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
  renderTranscript(conversation.transcript);
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
