// ====== ПРЕЛОАДЕР ======
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1000);
});

// ====== БАННЕР ======
document.addEventListener('DOMContentLoaded', function() {
    const closeBanner = document.querySelector('.close-banner');
    const banner = document.querySelector('.banner');
    
    if (closeBanner && banner) {
        closeBanner.addEventListener('click', function() {
            banner.style.transform = 'translateY(-100%)';
            banner.style.opacity = '0';
            banner.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                banner.style.display = 'none';
            }, 500);
        });
    }
});

// ====== ПЛАВНАЯ ПРОКРУТКА ======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ====== КНОПКА НАВЕРХ ======
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ====== АНИМАЦИЯ ПРИ СКРОЛЛЕ ======
const animateOnScroll = function() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animated');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// ====== АНИМИРОВАННЫЙ СЧЕТЧИК ======
const startCounterAnimation = function() {
    const counters = document.querySelectorAll('.countup');
    
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-count');
            const count = +counter.innerText;
            const speed = 2000; // 2 секунды
            const increment = target / (speed / 16); // 60fps
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 16);
            } else {
                counter.innerText = target;
            }
        };
        
        updateCount();
    });
};

// Запуск счетчика при появлении в поле зрения
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startCounterAnimation();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    observer.observe(statsSection);
}

// ====== ФОРМА ОБРАТНОЙ СВЯЗИ ======
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedbackForm');
    
    if (!feedbackForm) return;
    
    // Маска для телефона
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] : x[1] + ' (' + x[2] + ') ' + x[3] + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
        });
    }
    
    // Валидация в реальном времени
    const validateField = function(field) {
        const value = field.value.trim();
        const validation = field.getAttribute('data-validation');
        const messageElement = field.closest('.form-group').querySelector('.validation-message');
        
        if (!messageElement) return true;
        
        let isValid = true;
        let message = '';
        
        if (field.required && !value) {
            isValid = false;
            message = 'Это поле обязательно для заполнения';
        } else if (value) {
            switch(validation) {
                case 'name':
                    if (value.length < 2) {
                        isValid = false;
                        message = 'Имя должно содержать минимум 2 символа';
                    }
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        message = 'Введите корректный email';
                    }
                    break;
                case 'phone':
                    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        message = 'Введите корректный номер телефона';
                    }
                    break;
            }
        }
        
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            messageElement.textContent = '';
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            messageElement.textContent = message;
        }
        
        return isValid;
    };
    
    // Валидация при вводе
    feedbackForm.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', function() {
            validateField(this);
        });
        
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Отправка формы
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Валидация всех полей
        let isValid = true;
        feedbackForm.querySelectorAll('input[required], textarea[required]').forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            // Показываем ошибку
            const errorElement = document.getElementById('formError');
            const successElement = document.getElementById('formSuccess');
            
            if (errorElement && successElement) {
                errorElement.classList.add('show');
                successElement.classList.remove('show');
                
                setTimeout(() => {
                    errorElement.classList.remove('show');
                }, 5000);
            }
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = feedbackForm.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.classList.add('loading');
        }
        
        // Собираем данные формы
        const formData = new FormData(feedbackForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Отправляем данные на сервер (заглушка)
        setTimeout(() => {
            // В реальном проекте здесь будет fetch запрос к db.php
            
            // Скрываем индикатор загрузки
            if (submitBtn) {
                submitBtn.classList.remove('loading');
            }
            
            // Показываем сообщение об успехе
            const errorElement = document.getElementById('formError');
            const successElement = document.getElementById('formSuccess');
            
            if (successElement && errorElement) {
                successElement.classList.add('show');
                errorElement.classList.remove('show');
                
                // Очищаем форму
                feedbackForm.reset();
                
                // Сбрасываем классы валидации
                feedbackForm.querySelectorAll('input, textarea').forEach(field => {
                    field.classList.remove('valid', 'invalid');
                    const messageElement = field.closest('.form-group').querySelector('.validation-message');
                    if (messageElement) {
                        messageElement.textContent = '';
                    }
                });
                
                // Скрываем сообщение через 5 секунд
                setTimeout(() => {
                    successElement.classList.remove('show');
                }, 5000);
            }
            
            console.log('Данные для БД:', data);
            // Здесь данные будут отправлены в db.php
            
        }, 2000);
    });
});

// ====== МОБИЛЬНОЕ МЕНЮ ======
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
});

// ====== АНИМАЦИЯ КАРТОЧЕК ТОВАРОВ ======
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        });
    });
});

// ====== ПАРАЛЛАКС ЭФФЕКТ ======
window.addEventListener('scroll', function() {
    const parallaxElements = document.querySelectorAll('.parallax-section');
    
    parallaxElements.forEach(element => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        element.style.transform = `translateY(${rate}px)`;
    });
});

// ====== РАНДОМНЫЕ АНИМАЦИИ ДЛЯ ФОНА ======
function createParticles() {
    const bgAnimation = document.querySelector('.bg-animation');
    if (!bgAnimation) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 5 + 2}px;
            height: ${Math.random() * 5 + 2}px;
            background: ${Math.random() > 0.5 ? '#450516' : '#FF4D4D'};
            border-radius: 50%;
            opacity: ${Math.random() * 0.3 + 0.1};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        bgAnimation.appendChild(particle);
    }
}

// Создаем частицы после загрузки
setTimeout(createParticles, 1000);

// ====== ИНТЕРАКТИВНЫЕ ЭФФЕКТЫ ПРИ НАВЕДЕНИИ ======
document.addEventListener('DOMContentLoaded', function() {
    // Эффект при наведении на кнопки
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function(e) {
            const x = e.pageX - this.offsetLeft;
            const y = e.pageY - this.offsetTop;
            
            this.style.setProperty('--x', x + 'px');
            this.style.setProperty('--y', y + 'px');
        });
    });
    
    // Эффект при наведении на карточки услуг
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.setProperty('--mouse-x', x + 'px');
            this.style.setProperty('--mouse-y', y + 'px');
        });
    });
});

// ====== ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ДЛЯ ФОРМЫ ======
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;
    
    // Сохраняем данные формы при вводе
    const saveFormData = function() {
        const formData = {};
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.name) {
                formData[field.name] = field.value;
            }
        });
        localStorage.setItem('feedbackFormData', JSON.stringify(formData));
    };
    
    // Восстанавливаем данные при загрузке
    const savedData = localStorage.getItem('feedbackFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = formData[key];
            }
        });
    }
    
    // Сохраняем при изменении
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', saveFormData);
        field.addEventListener('change', saveFormData);
    });
    
    // Очищаем при успешной отправке
    form.addEventListener('submit', function() {
        localStorage.removeItem('feedbackFormData');
    });
});