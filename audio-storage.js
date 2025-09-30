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
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка доступа к IndexedDB:', error);
    return [];
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
        resolve(record);
      };
      
      request.onerror = () => {
        console.error('❌ Ошибка добавления в IndexedDB:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ Ошибка добавления записи:', error);
    throw error;
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
    const allRecords = await loadAudioRecordsDB();
    return allRecords.filter(r => r.employeeId === employeeId);
  } catch (error) {
    console.error('❌ Ошибка получения записей сотрудника:', error);
    return [];
  }
}

// Экспортируем функции
window.AudioDB = {
  save: saveAudioRecordsDB,
  load: loadAudioRecordsDB,
  add: addAudioRecordDB,
  delete: deleteAudioRecordDB,
  get: getAudioRecordDB,
  getByEmployee: getEmployeeAudioRecordsDB
};
