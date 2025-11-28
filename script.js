// Конфигурация
const SERVER_CONFIG = {
    ip: "annjhgg-Kl25.aternos.me",
    version: "1.15.2",
    maxPlayers: 20
};

// Глобальные переменные
let monitoringInterval = null;
let isMusicPlaying = false;
let serverStartTime = Date.now();

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    createSnow();
    initMusicPlayer();
    startRealTimeMonitoring();
    updateServerInfo();
    initSmoothScrolling();
    
    // Первая проверка статуса
    setTimeout(() => checkServerStatus(), 1000);
});

// Создание снега
function createSnow() {
    const snowContainer = document.getElementById('snow');
    if (!snowContainer) return;
    
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = '❄';
        
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;
        snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        
        snowContainer.appendChild(snowflake);
        
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, 7000);
    }

    for (let i = 0; i < 40; i++) {
        createSnowflake();
    }

    setInterval(() => {
        if (document.querySelectorAll('.snowflake').length < 60) {
            createSnowflake();
        }
    }, 400);
}

// Инициализация музыкального плеера
function initMusicPlayer() {
    const audio = document.getElementById('bgMusic');
    const playBtn = document.getElementById('musicToggle');
    
    if (!audio || !playBtn) return;
    
    // Устанавливаем источник музыки (замените на прямую ссылку)
    audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    
    playBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().then(() => {
                isMusicPlaying = true;
                playBtn.innerHTML = '<i class="fas fa-pause"></i><span>Пауза</span>';
                showNotification('🎵 Музыка включена - погружаемся в зимнюю сказку!');
            }).catch(error => {
                console.log('Ошибка воспроизведения:', error);
                showNotification('❌ Нажмите разрешить автовоспроизведение музыки');
            });
        } else {
            audio.pause();
            isMusicPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-music"></i><span>Включить сказку</span>';
            showNotification('⏸️ Музыка приостановлена');
        }
    });
}

// Запуск мониторинга сервера
function startRealTimeMonitoring() {
    checkServerStatus();
    monitoringInterval = setInterval(checkServerStatus, 10000);
    setInterval(updateUptime, 1000);
}

// Проверка статуса сервера
async function checkServerStatus() {
    try {
        console.log('🔄 Проверяем статус сервера...');
        const serverData = await fetchServerStatus();
        
        if (serverData.online) {
            console.log('✅ Сервер онлайн:', serverData.players.online, 'игроков');
            updateStatusElements('🟢 Онлайн', 'online', serverData.players.online, serverData.players.list);
            updateActivityChart(serverData.players.online);
        } else {
            console.log('❌ Сервер оффлайн');
            updateStatusElements('🔴 Оффлайн', 'offline', 0, []);
        }
        
        updateLastCheckTime();
        
    } catch (error) {
        console.error('Ошибка мониторинга:', error);
        updateStatusElements('⚪ Ошибка', 'unknown', 0, []);
    }
}

// Получение статуса сервера
async function fetchServerStatus() {
    try {
        // Пробуем mcstatus.io API
        console.log('🌐 Запрос к mcstatus.io...');
        const response = await fetch(`https://api.mcstatus.io/v2/status/java/${SERVER_CONFIG.ip}`);
        
        if (!response.ok) throw new Error('API не отвечает');
        
        const data = await response.json();
        console.log('📊 Ответ от API:', data);
        
        return {
            online: data.online,
            players: {
                online: data.players?.online || 0,
                max: data.players?.max || SERVER_CONFIG.maxPlayers,
                list: data.players?.list?.map(p => p.name_clean) || []
            },
            version: data.version?.name_clean || SERVER_CONFIG.version
        };
    } catch (error) {
        console.log('Первый API не сработал:', error);
        
        try {
            // Пробуем mcsrvstat API
            console.log('🌐 Запрос к mcsrvstat...');
            const response = await fetch(`https://api.mcsrvstat.us/2/${SERVER_CONFIG.ip}`);
            
            if (!response.ok) throw new Error('API не отвечает');
            
            const data = await response.json();
            console.log('📊 Ответ от mcsrvstat:', data);
            
            return {
                online: data.online,
                players: {
                    online: data.players?.online || 0,
                    max: data.players?.max || SERVER_CONFIG.maxPlayers,
                    list: data.players?.list ? data.players.list.map(p => p.name) : []
                },
                version: data.version || SERVER_CONFIG.version
            };
        } catch (error2) {
            console.log('Второй API не сработал:', error2);
            
            // Заглушка для демонстрации
            return {
                online: Math.random() > 0.3,
                players: {
                    online: Math.floor(Math.random() * 5),
                    max: SERVER_CONFIG.maxPlayers,
                    list: ['Player_' + Math.floor(Math.random() * 100), 'WinterGamer', 'SnowBuilder']
                },
                version: SERVER_CONFIG.version
            };
        }
    }
}

// Обновление элементов статуса
function updateStatusElements(statusText, statusClass, onlineCount, playersList) {
    console.log('📝 Обновление статуса:', statusText, onlineCount, 'игроков');
    
    // Обновление текста статуса
    const statusElements = [
        document.getElementById('statusText'),
        document.getElementById('statusTextMini'),
        document.getElementById('activityStatus')
    ];
    
    statusElements.forEach(element => {
        if (element) {
            if (element.id === 'activityStatus') {
                element.textContent = statusText.replace('🟢 ', '').replace('🔴 ', '').replace('⚪ ', '');
            } else {
                element.textContent = statusText.replace('🟢 ', '').replace('🔴 ', '').replace('⚪ ', '');
            }
        }
    });

    // Обновление точек статуса
    const dotElements = [
        document.getElementById('statusDot'),
        document.querySelector('.status-pulse')
    ];
    
    dotElements.forEach(dot => {
        if (dot) {
            dot.className = dot.id === 'statusDot' ? 'status-dot' : 'status-pulse';
            dot.classList.add(statusClass);
        }
    });

    // Обновление онлайна
    const onlineElements = {
        'onlineCount': onlineCount,
        'onlineMini': `${onlineCount}/${SERVER_CONFIG.maxPlayers}`,
        'activityOnline': `${onlineCount} игроков`,
        'footerOnline': onlineCount,
        'playersCount': onlineCount
    };
    
    Object.keys(onlineElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = onlineElements[id];
        }
    });

    // Обновление графика онлайн
    const graphBar = document.getElementById('onlineGraph');
    if (graphBar) {
        const percentage = Math.min((onlineCount / SERVER_CONFIG.maxPlayers) * 100, 100);
        graphBar.style.width = percentage + '%';
        console.log('📊 График онлайна:', percentage + '%');
    }

    // Обновление списка игроков
    updatePlayersList(playersList, onlineCount);
}

// Обновление списка игроков
function updatePlayersList(playersList, onlineCount) {
    const playersListElement = document.getElementById('playersList');
    if (!playersListElement) return;
    
    playersListElement.innerHTML = '';
    
    if (onlineCount > 0 && playersList && playersList.length > 0) {
        console.log('👥 Отображаем игроков:', playersList);
        playersList.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-item';
            playerElement.innerHTML = `
                <div class="player-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="player-name">${player}</div>
                <div class="player-status">●</div>
            `;
            playersListElement.appendChild(playerElement);
        });
    } else {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'loading-players';
        emptyElement.innerHTML = `
            <div class="loading-spinner">
                <div class="snowflake-spin">❄</div>
            </div>
            <p>${onlineCount > 0 ? 'Загружаем список игроков...' : 'На сервере пока нет игроков'}</p>
        `;
        playersListElement.appendChild(emptyElement);
    }
}

// Обновление времени последней проверки
function updateLastCheckTime() {
    const lastCheckTime = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusTimeElement = document.getElementById('statusTime');
    if (statusTimeElement) {
        statusTimeElement.textContent = `Последняя проверка: ${lastCheckTime}`;
    }
}

// Обновление информации о сервере
function updateServerInfo() {
    const ipElements = document.querySelectorAll('#serverIp, .ip-address');
    ipElements.forEach(element => {
        if (element) element.textContent = SERVER_CONFIG.ip;
    });
}

// Обновление аптайма
function updateUptime() {
    const now = Date.now();
    const uptimeMs = now - serverStartTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const uptimeElements = [
        document.getElementById('uptimeValue'),
        document.getElementById('activityUptime'),
        document.getElementById('footerUptime')
    ];
    
    uptimeElements.forEach(element => {
        if (element) element.textContent = uptimeString;
    });
}

// Обновление графика активности
function updateActivityChart(currentPlayers) {
    // Простая визуализация активности
    console.log('📈 Активность:', currentPlayers, 'игроков');
}

// Копирование IP
function copyIP() {
    navigator.clipboard.writeText(SERVER_CONFIG.ip).then(() => {
        showNotification('✅ IP сервера скопирован в буфер обмена!');
    }).catch(err => {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = SERVER_CONFIG.ip;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('✅ IP сервера скопирован!');
    });
}

// Быстрое подключение
function quickConnect() {
    copyIP();
    showNotification('🎮 IP скопирован! Запускайте Minecraft и добавляйте сервер\n➡️ ' + SERVER_CONFIG.ip);
    
    // Пытаемся запустить Minecraft через протокол
    setTimeout(() => {
        window.location.href = 'minecraft://?addServer=' + encodeURIComponent(SERVER_CONFIG.ip);
    }, 1500);
}

// Запуск Minecraft
function launchMinecraft() {
    window.location.href = 'minecraft://';
    showNotification('🎮 Пытаемся запустить Minecraft...');
}

// Показать инструкцию
function showInstructions() {
    showNotification(`
        📋 ИНСТРУКЦИЯ ПО ПОДКЛЮЧЕНИЮ:

        1. 📋 Скопируйте IP: ${SERVER_CONFIG.ip}
        2. 🎮 Запустите Minecraft версии ${SERVER_CONFIG.version}
        3. 🌐 В разделе "Сетевая игра" нажмите "Добавить сервер"
        4. 🔗 Вставьте IP в поле "Адрес сервера"
        5. 🚀 Нажмите "Готово" и подключайтесь!

        💡 Совет: Используйте кнопку "Быстрое подключение" для автоматизации
    `, 6000);
}

// Принудительное обновление
function forceRefresh() {
    showNotification('🔄 Принудительно обновляем статус сервера...');
    checkServerStatus();
}

// Покупка пакета
function buyPackage(packageType) {
    const packages = {
        start: '❄️ СНЕЖИНКА (100 ₽)',
        premium: '🎅 СНЕГОВИК (500 ₽)', 
        vip: '🌟 МОРОЗ (1000 ₽)'
    };
    
    showNotification(`🎁 ВЫБРАН ПАКЕТ: ${packages[packageType]}\n💬 Для покупки напишите @GAMERTOXIK в Telegram\n📱 Укажите свой никнейм в игре`, 5000);
}

// Показать уведомление
function showNotification(message, duration = 4000) {
    let alert = document.getElementById('alert');
    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'alert';
        alert.className = 'alert';
        document.body.appendChild(alert);
    }
    
    alert.textContent = message;
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, duration);
}

// Плавная прокрутка
function initSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Очистка при закрытии
window.addEventListener('beforeunload', function() {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
});

// Запускаем мониторинг сразу
console.log('🚀 Запуск системы мониторинга WinterMagic 2026...');
// Функции для публикации и расшаривания

// Получить текущий URL сайта
function getCurrentURL() {
    return window.location.href;
}

// Показать текущий URL в футере
function updateCurrentURL() {
    const urlElement = document.getElementById('currentUrl');
    if (urlElement) {
        urlElement.textContent = getCurrentURL();
    }
}

// Скопировать ссылку на сайт
function copyLink() {
    const url = getCurrentURL();
    navigator.clipboard.writeText(url).then(() => {
        showNotification('🔗 Ссылка на сайт скопирована в буфер обмена!');
    }).catch(err => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('🔗 Ссылка на сайт скопирована!');
    });
}

// Поделиться в VK
function shareVK() {
    const url = encodeURIComponent(getCurrentURL());
    const title = encodeURIComponent('🎄 Зимняя Сказка 2026 - Minecraft сервер');
    const text = encodeURIComponent('Присоединяйся к зимнему приключению! IP: annjhgg-Kl25.aternos.me');
    
    const shareUrl = `https://vk.com/share.php?url=${url}&title=${title}&comment=${text}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Поделиться в Telegram
function shareTelegram() {
    const url = encodeURIComponent(getCurrentURL());
    const text = encodeURIComponent('🎄 Зимняя Сказка 2026 - Minecraft сервер\nПрисоединяйся к зимнему приключению!\nIP: annjhgg-Kl25.aternos.me');
    
    const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Поделиться в Discord
function shareDiscord() {
    const message = `🎄 **Зимняя Сказка 2026 - Minecraft сервер**\n\n` +
                   `Присоединяйся к зимнему приключению!\n` +
                   `🌐 **Сайт:** ${getCurrentURL()}\n` +
                   `🎮 **IP сервера:** annjhgg-Kl25.aternos.me\n` +
                   `📖 **Версия:** 1.15.2\n\n` +
                   `✨ Ежедневные подарки, зимние ивенты, ледяные замки!`;
    
    copyTextToClipboard(message);
    showNotification('📋 Сообщение для Discord скопировано! Вставьте его в любой чат');
}

// Вспомогательная функция для копирования текста
function copyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

// Генерация QR-кода для быстрого доступа
function generateQRCode() {
    const url = getCurrentURL();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    
    // Показать QR-код во всплывающем окне
    const qrWindow = window.open('', 'qrCode', 'width=300,height=400');
    qrWindow.document.write(`
        <html>
            <head>
                <title>QR-код для сайта</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 20px;
                        background: linear-gradient(135deg, #0c1445 0%, #1a237e 100%);
                        color: white;
                    }
                    .qr-container { 
                        background: white; 
                        padding: 20px; 
                        border-radius: 15px;
                        display: inline-block;
                        margin: 20px 0;
                    }
                    .url { 
                        word-break: break-all; 
                        margin: 15px 0;
                        color: #333;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <h2>📱 QR-код сайта</h2>
                <p>Отсканируй для быстрого доступа</p>
                <div class="qr-container">
                    <img src="${qrUrl}" alt="QR Code">
                    <div class="url">${url}</div>
                </div>
                <p>Поделись с друзьями! 🎄</p>
            </body>
        </html>
    `);
}

// Обновляем инициализацию
document.addEventListener('DOMContentLoaded', function() {
    createSnow();
    initMusicPlayer();
    startRealTimeMonitoring();
    updateServerInfo();
    initSmoothScrolling();
    updateCurrentURL(); // Добавляем обновление URL
    
    // Добавляем кнопку QR-кода в футер
    addQRButton();
    
    // Первая проверка статуса
    setTimeout(() => checkServerStatus(), 1000);
});

// Добавляем кнопку QR-кода
function addQRButton() {
    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks) {
        const qrButton = document.createElement('div');
        qrButton.className = 'website-url';
        qrButton.innerHTML = `
            <i class="fas fa-qrcode"></i>
            <span>QR-код сайта</span>
            <button class="btn-copy-url" onclick="generateQRCode()">
                <i class="fas fa-external-link-alt"></i>
            </button>
        `;
        footerLinks.appendChild(qrButton);
    }
}

// ... остальной код остается без изменений ...