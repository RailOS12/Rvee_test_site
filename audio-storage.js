// IndexedDB для хранения аудиофайлов
// Использует IndexedDB вместо localStorage для больших файлов

const DB_NAME = 'CallAnalyticsDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioRecords';

// Открыть/создать базу данных
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Ошибка открытия IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Создаем хранилище, если его нет
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('employeeId', 'employeeId', { unique: false });
        objectStore.createIndex('uploadDate', 'uploadDate', { unique: false });
        console.log('✅ Создано хранилище IndexedDB');
      }
      
      // Добавляем поддержку транскрибаций (версионирование при необходимости)
      // Структура записи теперь включает:
      // - transcription_level1: массив с текстом и таймингами (без ролей)
      // - transcription_level2: объект с utterances (с ролями)
      // - transcription_status: { level1: bool, level2: bool }
    };
  });
}

// Сохранить все записи
async function saveAudioRecordsDB(records) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    // Очищаем хранилище
    await new Promise((resolve, reject) => {
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
    
    // Добавляем все записи
    for (const record of records) {
      await new Promise((resolve, reject) => {
        const addRequest = objectStore.add(record);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }
    
    console.log('💾 Сохранено в IndexedDB:', records.length, 'записей');
    return true;
  } catch (error) {
    console.error('❌ Ошибка сохранения в IndexedDB:', error);
    throw error;
  }
}

// Загрузить все записи
async function loadAudioRecordsDB() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.getAll();
      
      request.onsuccess = () => {
        console.log('📂 Загружено из IndexedDB:', request.result.length, 'записей');
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('❌ Ошибка загрузки из IndexedDB:', request.error);
        // Fallback на localStorage
        console.log('🔄 Fallback на localStorage...');
        const fallback = localStorage.getItem('audioRecords_fallback');
        resolve(fallback ? JSON.parse(fallback) : []);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка доступа к IndexedDB:', error);
    // Fallback на localStorage
    console.log('🔄 Fallback на localStorage...');
    const fallback = localStorage.getItem('audioRecords_fallback');
    return fallback ? JSON.parse(fallback) : [];
  }
}

// Добавить одну запись
async function addAudioRecordDB(record) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.add(record);
      
      request.onsuccess = () => {
        console.log('✅ Запись добавлена в IndexedDB, ID:', request.result);
        record.id = request.result; // Обновляем ID автоинкремента
        
        // Также сохраняем метаданные в localStorage как backup (БЕЗ audioData)
        try {
          const existing = JSON.parse(localStorage.getItem('audioRecords_meta') || '[]');
          const meta = {
            id: record.id,
            employeeId: record.employeeId,
            fileName: record.fileName,
            description: record.description,
            uploadDate: record.uploadDate,
            uploadedBy: record.uploadedBy,
            duration: record.duration,
            size: record.size,
            hasAudio: true
          };
          existing.push(meta);
          localStorage.setItem('audioRecords_meta', JSON.stringify(existing));
          console.log('💾 Метаданные сохранены в localStorage');
        } catch (e) {
          console.warn('⚠️ Не удалось сохранить метаданные в localStorage:', e);
        }
        
        resolve(record);
      };
      
      request.onerror = () => {
        console.error('❌ Ошибка добавления в IndexedDB:', request.error);
        // Fallback на localStorage
        console.log('🔄 Fallback на localStorage...');
        const existing = JSON.parse(localStorage.getItem('audioRecords_fallback') || '[]');
        record.id = existing.length > 0 ? Math.max(...existing.map(r => r.id)) + 1 : 1;
        existing.push(record);
        localStorage.setItem('audioRecords_fallback', JSON.stringify(existing));
        resolve(record);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка добавления записи:', error);
    // Fallback на localStorage
    console.log('🔄 Fallback на localStorage...');
    const existing = JSON.parse(localStorage.getItem('audioRecords_fallback') || '[]');
    record.id = existing.length > 0 ? Math.max(...existing.map(r => r.id)) + 1 : 1;
    existing.push(record);
    localStorage.setItem('audioRecords_fallback', JSON.stringify(existing));
    return record;
  }
}

// Удалить запись
async function deleteAudioRecordDB(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.delete(id);
      
      request.onsuccess = () => {
        console.log('🗑️ Запись удалена из IndexedDB, ID:', id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ Ошибка удаления из IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка удаления записи:', error);
    throw error;
  }
}

// Получить одну запись по ID
async function getAudioRecordDB(id) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('❌ Ошибка получения записи:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка получения записи:', error);
    return null;
  }
}

// Получить записи сотрудника
async function getEmployeeAudioRecordsDB(employeeId) {
  try {
    console.log('🔍 Запрос записей для employeeId:', employeeId, 'тип:', typeof employeeId);
    const allRecords = await loadAudioRecordsDB();
    console.log('📂 Всего записей в базе:', allRecords.length);
    
    if (allRecords.length > 0) {
      console.log('🔎 Пример записей:', allRecords.map(r => ({
        id: r.id,
        employeeId: r.employeeId,
        employeeIdType: typeof r.employeeId,
        fileName: r.fileName
      })));
    }
    
    const filtered = allRecords.filter(r => {
      const match = r.employeeId == employeeId; // Используем == для нестрогого сравнения
      if (match) {
        console.log('✅ Найдено совпадение:', r.fileName, 'employeeId:', r.employeeId);
      }
      return match;
    });
    
    console.log('📼 Отфильтровано записей для сотрудника:', filtered.length);
    return filtered;
  } catch (error) {
    console.error('❌ Ошибка получения записей сотрудника:', error);
    return [];
  }
}

// Обновить запись
async function updateAudioRecordDB(id, updates) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    // Получаем существующую запись
    const getRequest = objectStore.get(id);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        
        if (!record) {
          reject(new Error('Запись не найдена'));
          return;
        }
        
        // Обновляем поля
        const updatedRecord = { ...record, ...updates };
        
        const putRequest = objectStore.put(updatedRecord);
        
        putRequest.onsuccess = () => {
          console.log('✅ Запись обновлена в IndexedDB, ID:', id);
          resolve(updatedRecord);
        };
        
        putRequest.onerror = () => {
          console.error('❌ Ошибка обновления в IndexedDB:', putRequest.error);
          reject(putRequest.error);
        };
      };
      
      getRequest.onerror = () => {
        console.error('❌ Ошибка получения записи:', getRequest.error);
        reject(getRequest.error);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка обновления записи:', error);
    throw error;
  }
}

// Экспортируем функции
window.AudioDB = {
  save: saveAudioRecordsDB,
  load: loadAudioRecordsDB,
  add: addAudioRecordDB,
  delete: deleteAudioRecordDB,
  get: getAudioRecordDB,
  getByEmployee: getEmployeeAudioRecordsDB,
  update: updateAudioRecordDB
};
