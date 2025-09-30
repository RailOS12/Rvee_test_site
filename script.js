// Функция копирования кода
function copyCode(button) {
  const code = button.getAttribute('data-code');
  
  // Создаем временный элемент для копирования
  const textarea = document.createElement('textarea');
  textarea.value = code.replace(/&#10;/g, '\n');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  
  // Копируем текст
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  
  // Показываем индикатор успеха
  const originalText = button.textContent;
  button.textContent = 'Скопировано!';
  button.classList.add('copied');
  
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 2000);
}

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Пропускаем пустые якоря
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      const offset = 80; // Отступ для фиксированной навигации
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Анимация появления элементов при скролле
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Применяем анимацию к карточкам
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.feature-card, .quickstart-card, .perf-card, .resource-card, .arch-step'
  );
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Эффект параллакса для hero секции
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  
  if (hero && scrolled < hero.offsetHeight) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    hero.style.opacity = 1 - (scrolled / hero.offsetHeight);
  }
});

// Подсветка активной секции в навигации
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

function highlightNavigation() {
  const scrollPosition = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.style.color = 'var(--primary)';
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNavigation);

// Добавляем обработчик для мобильного меню (если нужно)
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

if (burger) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('active');
  });
}

console.log('%c🚀 T-one Website', 'color: #4cc9f0; font-size: 20px; font-weight: bold;');
console.log('%cПотоковый ASR-пайплайн для русского языка', 'color: #a0a8b8; font-size: 14px;');
