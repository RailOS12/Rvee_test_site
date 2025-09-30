// Проверка авторизации
function checkAuth() {
  const currentUser = sessionStorage.getItem('currentUser') || localStorage.getItem('rememberMe');
  
  if (!currentUser) {
    window.location.href = 'admin-login.html';
    return null;
  }
  
  const user = JSON.parse(currentUser);
  
  // Проверка роли
  if (user.role !== 'employee') {
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

// Инициализация моковых данных
function initMockData() {
  const mockKey = 'mockConversations';
  const existingData = localStorage.getItem(mockKey);
  
  if (!existingData) {
    const mockConversations = [
      {
        id: 1,
        employeeId: 2, // ivanov
        date: '2025-09-30T10:30:00',
        candidateName: 'Петров Иван Сергеевич',
        duration: 185,
        score: 8.5,
        transcript: [
          {
            timestamp: 0,
            speaker: 'employee',
            text: 'Здравствуйте! Меня зовут Иван, я представляю компанию МегаСтройКорп. Правильно ли я понимаю, что вы откликнулись на вакансию менеджера по продажам?',
            score: 9.0,
            comment: 'Отличное приветствие. Четкое представление и уточнение цели звонка.'
          },
          {
            timestamp: 12,
            speaker: 'candidate',
            text: 'Да, здравствуйте. Именно так, я отправлял резюме на эту позицию.',
            score: null,
            comment: null
          },
          {
            timestamp: 18,
            speaker: 'employee',
            text: 'Отлично! Расскажите, пожалуйста, кратко о вашем опыте работы в продажах. Что вы продавали ранее?',
            score: 8.5,
            comment: 'Хороший открытый вопрос для начала диалога.'
          },
          {
            timestamp: 25,
            speaker: 'candidate',
            text: 'Я работал менеджером по продажам строительных материалов в компании СтройДом около трех лет. Продавал оптовым клиентам.',
            score: null,
            comment: null
          },
          {
            timestamp: 37,
            speaker: 'employee',
            text: 'Понятно. А какие были ваши основные достижения на этой позиции?',
            score: 7.5,
            comment: 'Хороший вопрос, но можно было добавить конкретики (цифры, результаты).'
          },
          {
            timestamp: 44,
            speaker: 'candidate',
            text: 'Я увеличил базу клиентов на 40% за два года и перевыполнял план продаж в среднем на 25%.',
            score: null,
            comment: null
          },
          {
            timestamp: 55,
            speaker: 'employee',
            text: 'Отличные результаты! У нас сейчас открыта позиция с окладом от 80 тысяч плюс процент от продаж. График работы с 9 до 18. Вас интересуют такие условия?',
            score: 9.5,
            comment: 'Превосходно! Сразу озвучены ключевые условия, что экономит время.'
          },
          {
            timestamp: 70,
            speaker: 'candidate',
            text: 'Да, звучит интересно. А какой примерно процент от продаж?',
            score: null,
            comment: null
          },
          {
            timestamp: 75,
            speaker: 'employee',
            text: 'Процент составляет от 3% до 7% в зависимости от объема. В среднем наши менеджеры зарабатывают 120-150 тысяч рублей.',
            score: 8.0,
            comment: 'Хорошо, но стоило уточнить критерии достижения максимального процента.'
          },
          {
            timestamp: 90,
            speaker: 'candidate',
            text: 'Понятно. А можно узнать про испытательный срок?',
            score: null,
            comment: null
          },
          {
            timestamp: 95,
            speaker: 'employee',
            text: 'Испытательный срок три месяца, в это время оклад стандартный 80 тысяч, процент начинает действовать со второго месяца.',
            score: 9.0,
            comment: 'Четкий и честный ответ, хорошая практика.'
          },
          {
            timestamp: 108,
            speaker: 'candidate',
            text: 'Хорошо. Когда можно пройти собеседование?',
            score: null,
            comment: null
          },
          {
            timestamp: 113,
            speaker: 'employee',
            text: 'Давайте назначим встречу на завтра в 15:00, вам удобно? Офис находится на Ленина 45.',
            score: 8.5,
            comment: 'Хорошо, но лучше предложить несколько вариантов времени.'
          },
          {
            timestamp: 125,
            speaker: 'candidate',
            text: 'Да, завтра в 15:00 подходит. Записал адрес.',
            score: null,
            comment: null
          },
          {
            timestamp: 132,
            speaker: 'employee',
            text: 'Отлично! Жду вас завтра. С собой возьмите паспорт и оригинал диплома. Если будут вопросы, звоните. До встречи!',
            score: 9.0,
            comment: 'Прекрасное завершение: четкие инструкции и открытость к вопросам.'
          },
          {
            timestamp: 145,
            speaker: 'candidate',
            text: 'Спасибо, до встречи!',
            score: null,
            comment: null
          }
        ]
      },
      {
        id: 2,
        employeeId: 2,
        date: '2025-09-29T14:15:00',
        candidateName: 'Сидорова Мария Александровна',
        duration: 95,
        score: 6.5,
        transcript: [
          {
            timestamp: 0,
            speaker: 'employee',
            text: 'Алло, здравствуйте, это Мария?',
            score: 6.0,
            comment: 'Слабое начало. Отсутствует представление и компания.'
          },
          {
            timestamp: 3,
            speaker: 'candidate',
            text: 'Да, здравствуйте.',
            score: null,
            comment: null
          },
          {
            timestamp: 5,
            speaker: 'employee',
            text: 'Вы откликались на нашу вакансию продавца-консультанта?',
            score: 5.5,
            comment: 'Нет представления себя и компании. Нарушение скрипта!'
          },
          {
            timestamp: 10,
            speaker: 'candidate',
            text: 'На какую именно? Я откликалась на несколько.',
            score: null,
            comment: null
          },
          {
            timestamp: 14,
            speaker: 'employee',
            text: 'Ээ, продавец в магазин стройматериалов.',
            score: 4.0,
            comment: 'Неуверенность в голосе ("ээ"). Нужно знать точное название вакансии.'
          },
          {
            timestamp: 18,
            speaker: 'candidate',
            text: 'А, да, помню.',
            score: null,
            comment: null
          },
          {
            timestamp: 20,
            speaker: 'employee',
            text: 'У вас есть опыт работы продавцом?',
            score: 7.0,
            comment: 'Нормальный вопрос, но диалог уже испорчен плохим началом.'
          },
          {
            timestamp: 24,
            speaker: 'candidate',
            text: 'Да, я два года работала в магазине одежды.',
            score: null,
            comment: null
          },
          {
            timestamp: 28,
            speaker: 'employee',
            text: 'Хорошо. Зарплата 50 тысяч. Приходите завтра на собеседование в 10 утра.',
            score: 5.0,
            comment: 'Слишком быстро и сухо. Не уточнены условия, график, не спросили об удобстве времени.'
          },
          {
            timestamp: 38,
            speaker: 'candidate',
            text: 'Эм, а где офис находится?',
            score: null,
            comment: null
          },
          {
            timestamp: 41,
            speaker: 'employee',
            text: 'На Ленина 45, второй этаж.',
            score: 8.0,
            comment: 'Информация предоставлена, но надо было сообщить сразу.'
          },
          {
            timestamp: 46,
            speaker: 'candidate',
            text: 'А во сколько заканчивается рабочий день?',
            score: null,
            comment: null
          },
          {
            timestamp: 50,
            speaker: 'employee',
            text: 'С 9 до 18.',
            score: 6.5,
            comment: 'Односложный ответ. Нужно было проявить больше заинтересованности.'
          },
          {
            timestamp: 54,
            speaker: 'candidate',
            text: 'Ладно, попробую прийти.',
            score: null,
            comment: null
          },
          {
            timestamp: 57,
            speaker: 'employee',
            text: 'Хорошо, до встречи.',
            score: 7.0,
            comment: 'Нейтральное завершение. Не уточнил контакты и не дал дополнительных инструкций.'
          }
        ]
      },
      {
        id: 3,
        employeeId: 2,
        date: '2025-09-28T11:45:00',
        candidateName: 'Козлов Дмитрий Петрович',
        duration: 240,
        score: 9.2,
        transcript: [
          {
            timestamp: 0,
            speaker: 'employee',
            text: 'Добрый день! Меня зовут Иван, я рекрутер компании МегаСтройКорп. Я звоню по поводу вашего отклика на вакансию старшего менеджера по продажам. Вам удобно сейчас разговаривать?',
            score: 10.0,
            comment: 'Идеальное начало! Представление, компания, причина звонка, вопрос об удобстве.'
          },
          {
            timestamp: 12,
            speaker: 'candidate',
            text: 'Да, здравствуйте! Да, удобно.',
            score: null,
            comment: null
          },
          {
            timestamp: 16,
            speaker: 'employee',
            text: 'Отлично! Я изучил ваше резюме, у вас впечатляющий опыт в B2B продажах. Расскажите, пожалуйста, подробнее о ваших достижениях на последнем месте работы?',
            score: 9.5,
            comment: 'Комплимент + конкретный вопрос. Отличная техника!'
          },
          {
            timestamp: 28,
            speaker: 'candidate',
            text: 'Спасибо! На последнем месте я руководил отделом из 8 человек. За год мы увеличили продажи на 65% и привлекли 30 новых корпоративных клиентов.',
            score: null,
            comment: null
          },
          {
            timestamp: 42,
            speaker: 'employee',
            text: 'Впечатляет! Расскажите, какие методы вы использовали для достижения таких результатов?',
            score: 9.0,
            comment: 'Развивает тему, показывает интерес к опыту кандидата.'
          },
          {
            timestamp: 50,
            speaker: 'candidate',
            text: 'Мы внедрили CRM-систему, оптимизировали воронку продаж и провели обучение команды по техникам холодных звонков.',
            score: null,
            comment: null
          },
          {
            timestamp: 63,
            speaker: 'employee',
            text: 'Понял. У нас как раз сейчас стоит задача масштабирования отдела продаж. Мы ищем человека, который сможет построить систему с нуля и вырастить команду. Судя по вашему опыту, это как раз ваши сильные стороны.',
            score: 9.5,
            comment: 'Связал опыт кандидата с потребностями компании. Профессионально!'
          },
          {
            timestamp: 80,
            speaker: 'candidate',
            text: 'Да, это именно то, что мне интересно. Расскажите подробнее о компании и позиции.',
            score: null,
            comment: null
          },
          {
            timestamp: 88,
            speaker: 'employee',
            text: 'Конечно! МегаСтройКорп работает на рынке 12 лет, мы поставщик строительных материалов для корпоративных клиентов. Сейчас в компании 200+ сотрудников. Вам предстоит создать отдел продаж из 15-20 человек. Оклад 150 тысяч плюс бонусы от прибыли отдела, что может составить еще 100-200 тысяч в месяц.',
            score: 10.0,
            comment: 'Структурированная информация с конкретными цифрами. Превосходно!'
          },
          {
            timestamp: 120,
            speaker: 'candidate',
            text: 'Звучит очень интересно! А какой бюджет на найм команды?',
            score: null,
            comment: null
          },
          {
            timestamp: 125,
            speaker: 'employee',
            text: 'Бюджет согласуется с вами после назначения, но ориентировочно это 3-4 миллиона рублей на зарплатный фонд. Также есть бюджет на обучение и инструменты - CRM, телефония и так далее.',
            score: 9.0,
            comment: 'Честный ответ с деталями, показывает серьезность позиции.'
          },
          {
            timestamp: 145,
            speaker: 'candidate',
            text: 'Отлично. А какие первые задачи на испытательном сроке?',
            score: null,
            comment: null
          },
          {
            timestamp: 151,
            speaker: 'employee',
            text: 'Первые три месяца - это построение стратегии, найм ключевых менеджеров и запуск первых продаж. Но детали обсудим на встрече с директором. Давайте я организую вам встречу с нашим генеральным директором на этой неделе. Какие дни вам удобны?',
            score: 9.5,
            comment: 'Хорошая тактика: создание интриги + предложение следующего шага.'
          },
          {
            timestamp: 175,
            speaker: 'candidate',
            text: 'Четверг или пятница после 16:00.',
            score: null,
            comment: null
          },
          {
            timestamp: 180,
            speaker: 'employee',
            text: 'Отлично! Запишу вас на четверг в 17:00. Встреча будет в нашем офисе на Ленина 45, конференц-зал на 3 этаже. Я вышлю вам на почту приглашение с картой проезда и контактами. С собой просьба взять паспорт и примеры ваших проектов, если есть презентации.',
            score: 10.0,
            comment: 'Идеальное завершение! Конкретика, следующие шаги, что взять с собой.'
          },
          {
            timestamp: 208,
            speaker: 'candidate',
            text: 'Прекрасно, спасибо! Жду письмо.',
            score: null,
            comment: null
          },
          {
            timestamp: 213,
            speaker: 'employee',
            text: 'Отправлю в течение часа. Если возникнут вопросы до встречи - звоните или пишите, контакты будут в письме. Рад был пообщаться, до четверга!',
            score: 9.5,
            comment: 'Профессионализм и внимание к деталям. Отличная работа!'
          },
          {
            timestamp: 228,
            speaker: 'candidate',
            text: 'Спасибо, до встречи!',
            score: null,
            comment: null
          }
        ]
      }
    ];
    
    localStorage.setItem(mockKey, JSON.stringify(mockConversations));
  }
}

// Загрузить разговоры
function loadConversations() {
  const currentUser = checkAuth();
  if (!currentUser) return;
  
  const mockData = JSON.parse(localStorage.getItem('mockConversations') || '[]');
  return mockData.filter(conv => conv.employeeId === currentUser.userId);
}

// Обновить статистику
function updateStats() {
  const conversations = loadConversations();
  
  const totalCalls = conversations.length;
  const avgScore = conversations.length > 0 
    ? (conversations.reduce((sum, conv) => sum + conv.score, 0) / conversations.length).toFixed(1)
    : 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayCalls = conversations.filter(conv => 
    conv.date.startsWith(today)
  ).length;
  
  document.getElementById('totalCalls').textContent = totalCalls;
  document.getElementById('avgScore').textContent = avgScore;
  document.getElementById('todayCalls').textContent = todayCalls;
}

// Отрисовать список разговоров
function renderConversations(filter = 'all') {
  let conversations = loadConversations();
  
  // Фильтрация
  const now = new Date();
  if (filter === 'today') {
    const today = now.toISOString().split('T')[0];
    conversations = conversations.filter(conv => conv.date.startsWith(today));
  } else if (filter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    conversations = conversations.filter(conv => new Date(conv.date) >= weekAgo);
  }
  
  // Сортировка по дате (новые сверху)
  conversations.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const container = document.getElementById('conversationsList');
  
  if (conversations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 16px; opacity: 0.3;">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <div style="font-size: 18px; margin-bottom: 8px;">Разговоры не найдены</div>
        <div style="font-size: 14px;">Загрузите транскрибацию вашего первого звонка</div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = conversations.map(conv => {
    const date = new Date(conv.date);
    const scoreClass = conv.score >= 8 ? 'success' : conv.score >= 6 ? 'warning' : 'danger';
    
    return `
      <div class="conversation-item" onclick="viewConversation(${conv.id})">
        <div class="conversation-info">
          <div class="conversation-title">${conv.candidateName}</div>
          <div class="conversation-meta">
            <span>${formatDate(conv.date)}</span>
            <span>•</span>
            <span>${formatDuration(conv.duration)}</span>
            <span>•</span>
            <span>${conv.transcript.length} реплик</span>
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

// Фильтр разговоров
function filterCalls(filter) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
  renderConversations(filter);
}

// Просмотр разговора
function viewConversation(id) {
  window.location.href = `conversation-view.html?id=${id}`;
}

// Модальное окно загрузки
function openUploadModal() {
  document.getElementById('uploadModal').classList.add('show');
}

function closeUploadModal() {
  document.getElementById('uploadModal').classList.remove('show');
}

// Инициализация
window.addEventListener('DOMContentLoaded', function() {
  const currentUser = checkAuth();
  if (currentUser) {
    document.getElementById('currentUserName').textContent = currentUser.username;
    
    // Инициализация моковых данных
    initMockData();
    
    // Загрузка данных
    updateStats();
    renderConversations();
    
    // Установка дат
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    document.getElementById('endDate').valueAsDate = endDate;
    document.getElementById('startDate').valueAsDate = startDate;
  }
});
