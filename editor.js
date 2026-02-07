// Глобальное состояние
let currentLevel = 1;
let gameData = {
    levels: {}
};

// Инициализация
function init() {
    // Настройка слайдеров
    setupSlider('lives-count', 'lives-value');
    setupSlider('timer-duration', 'timer-value', ' сек');
    setupSlider('levels-count', 'levels-value', '', updateLevelsTabs);
    setupSlider('answer-font-size', 'answer-font-value', ' px');
    setupSlider('hero-size', 'hero-size-value', '%');
    setupSlider('hero-vertical', 'hero-vertical-value', '%');
    setupSlider('global-particle-size', 'global-particle-size-value', '%');
    setupSlider('global-particle-speed', 'global-particle-speed-value', '%');
    setupSlider('global-particle-count', 'global-particle-count-value', '%');
    
    // Настройка цветовых пикеров
    setupColorPicker('color-question-border');
    setupColorPicker('color-glow');
    setupColorPicker('color-timer');
    setupColorPicker('color-text');
    
    // Настройка показа/скрытия пользовательских настроек эффекта
    const effectSelect = document.getElementById('victory-effect');
    const customSettings = document.getElementById('custom-effect-settings');
    
    if (effectSelect && customSettings) {
        effectSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customSettings.style.display = 'block';
            } else {
                customSettings.style.display = 'none';
            }
        });
    }
    
    // Настройка показа/скрытия графики для уровней
    const enableLevelGraphics = document.getElementById('enable-level-graphics');
    const commonGraphics = document.getElementById('common-graphics');
    const levelGraphics = document.getElementById('level-graphics');
    
    if (enableLevelGraphics) {
        enableLevelGraphics.addEventListener('change', (e) => {
            if (e.target.checked) {
                levelGraphics.style.display = 'block';
                updateLevelGraphicsUI();
            } else {
                levelGraphics.style.display = 'none';
            }
        });
    }
    
    // Настройка файловых инпутов
    setupFileInput('img-hero', 'hero');
    setupFileInput('img-platform', 'platform');
    setupFileInput('img-bg', 'bg');
    setupFileInput('img-life', 'life');
    
    setupFileInput('audio-start', 'sound-start');
    setupFileInput('audio-jump', 'sound-jump');
    setupFileInput('audio-shock', 'sound-shock');
    setupFileInput('audio-lose', 'sound-lose');
    setupFileInput('audio-win', 'sound-win');
    setupFileInput('audio-level', 'sound-level');
    setupFileInput('audio-countdown', 'sound-countdown');
    
    setupFileInput('custom-particle-image', 'custom-particle');
    
    setupFileInput('img-victory-hero', 'victory-hero');
    
    // Инициализация уровней
    updateLevelsTabs();
    switchLevel(1);
    
    // Настройка автоматического обновления предпросмотра
    setupAutoPreview();
    
    // Первое обновление предпросмотра с увеличенной задержкой
    setTimeout(() => {
        console.log('Initializing first preview...');
        updatePreview();
    }, 500);
}

// Автоматическое обновление предпросмотра
function setupAutoPreview() {
    const allInputs = document.querySelectorAll('input, select, textarea');
    
    allInputs.forEach(input => {
        if (!input) return;
        
        if (input.type === 'file') {
            input.addEventListener('change', () => {
                setTimeout(updatePreview, 300);
            });
        } else if (input.type === 'text' || input.tagName === 'TEXTAREA') {
            input.addEventListener('input', debounce(updatePreview, 500));
        } else {
            input.addEventListener('input', updatePreview);
            input.addEventListener('change', updatePreview);
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupSlider(sliderId, valueId, suffix = '', callback = null) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(valueId);
    
    if (!slider || !valueSpan) return;
    
    slider.addEventListener('input', (e) => {
        valueSpan.textContent = e.target.value + suffix;
        if (callback) callback();
    });
}

function setupColorPicker(baseId) {
    const colorInput = document.getElementById(baseId);
    const hexInput = document.getElementById(baseId + '-hex');
    
    if (!colorInput || !hexInput) return;
    
    colorInput.addEventListener('input', (e) => {
        hexInput.value = e.target.value;
    });
    
    hexInput.addEventListener('input', (e) => {
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            colorInput.value = e.target.value;
        }
    });
}

function setupFileInput(inputId, storageKey) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    gameData[storageKey] = event.target.result;
                    
                    console.log(`File loaded: ${storageKey}`);
                    
                    // Немедленно обновляем предпросмотр после загрузки файла
                    setTimeout(() => {
                        updatePreview();
                    }, 100);
                } catch (error) {
                    console.error(`Error loading file ${storageKey}:`, error);
                }
            };
            reader.onerror = (error) => {
                console.error(`FileReader error for ${storageKey}:`, error);
                alert(`Ошибка загрузки файла: ${file.name}`);
            };
            reader.readAsDataURL(file);
        }
    });
}

function updateLevelGraphicsUI() {
    const count = parseInt(document.getElementById('levels-count').value);
    const container = document.getElementById('level-graphics-container');
    
    if (!container) {
        console.warn('level-graphics-container not found');
        return;
    }
    
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const levelDiv = document.createElement('div');
        levelDiv.style.cssText = 'background: var(--panel); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border);';
        levelDiv.innerHTML = `
            <div style="color: var(--accent); font-weight: bold; margin-bottom: 10px;">Уровень ${i}</div>
            <label style="font-size: 10px;">Персонаж</label>
            <input type="file" id="img-hero-${i}" accept="image/*" style="font-size: 10px; padding: 6px;">
            <label style="font-size: 10px;">Платформа</label>
            <input type="file" id="img-platform-${i}" accept="image/*" style="font-size: 10px; padding: 6px;">
            <label style="font-size: 10px;">Фон</label>
            <input type="file" id="img-bg-${i}" accept="image/*" style="font-size: 10px; padding: 6px;">
            <label style="font-size: 10px;">Жизнь</label>
            <input type="file" id="img-life-${i}" accept="image/*" style="font-size: 10px; padding: 6px;">
        `;
        container.appendChild(levelDiv);
        
        // Настраиваем обработчики для файлов уровня
        setupFileInput(`img-hero-${i}`, `hero-${i}`);
        setupFileInput(`img-platform-${i}`, `platform-${i}`);
        setupFileInput(`img-bg-${i}`, `bg-${i}`);
        setupFileInput(`img-life-${i}`, `life-${i}`);
    }
    
    // Обновляем превью после добавления полей
    setTimeout(updatePreview, 100);
}

function updateLevelsTabs() {
    const count = parseInt(document.getElementById('levels-count').value);
    const container = document.getElementById('levels-tabs');
    container.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        if (!gameData.levels[i]) {
            gameData.levels[i] = [];
        }
        
        const tab = document.createElement('div');
        tab.className = 'level-tab' + (i === currentLevel ? ' active' : '');
        tab.textContent = `Уровень ${i}`;
        tab.onclick = () => switchLevel(i);
        container.appendChild(tab);
    }
    
    // Обновляем UI для графики уровней если она включена
    const enableLevelGraphics = document.getElementById('enable-level-graphics');
    if (enableLevelGraphics && enableLevelGraphics.checked) {
        updateLevelGraphicsUI();
    }
}

function switchLevel(level) {
    currentLevel = level;
    
    document.querySelectorAll('.level-tab').forEach((tab, idx) => {
        tab.classList.toggle('active', idx + 1 === level);
    });
    
    // Отображаем вопросы текущего уровня в textarea
    const textarea = document.getElementById('questions-input');
    const questions = gameData.levels[currentLevel] || [];
    
    textarea.value = questions.map(q => 
        `${q.question}|${q.options[q.correct]}|${q.options.filter((_, i) => i !== q.correct).join('|')}|`
    ).join('\n');
    
    updateQuestionsPreview();
}

function parseQuestions() {
    const textarea = document.getElementById('questions-input');
    const lines = textarea.value.split('\n').filter(line => line.trim() && line.includes('|'));
    
    gameData.levels[currentLevel] = lines.map(line => {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        
        if (parts.length < 3) {
            return null; // Недостаточно данных
        }
        
        const question = parts[0];
        const correctAnswer = parts[1];
        const wrongAnswers = parts.slice(2);
        
        // Создаём массив из правильного и двух неправильных ответов
        const options = [correctAnswer];
        
        // Добавляем неправильные ответы (минимум 2)
        if (wrongAnswers.length >= 2) {
            options.push(wrongAnswers[0], wrongAnswers[1]);
        } else if (wrongAnswers.length === 1) {
            options.push(wrongAnswers[0], '???');
        } else {
            options.push('???', '???');
        }
        
        return {
            question: question,
            options: options,
            correct: 0 // Правильный ответ всегда первый, потом перемешаем
        };
    }).filter(q => q !== null);
    
    updateQuestionsPreview();
    updatePreview();
}

function updateQuestionsPreview() {
    const container = document.getElementById('questions-preview');
    const questions = gameData.levels[currentLevel] || [];
    
    if (questions.length === 0) {
        container.innerHTML = '<p class="hint">Вопросов пока нет. Введите их в формате выше.</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="background: var(--panel); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="color: var(--accent); font-weight: bold; margin-bottom: 8px;">
                📊 Загружено вопросов: ${questions.length}
            </div>
            <div class="hint">
                • Игра использует по 6 вопросов за раунд<br>
                • Если вопросов больше 6 - они выбираются случайно<br>
                • Порядок вопросов и ответов перемешивается каждый раз
            </div>
        </div>
    `;
}

function buildGameHTML() {
    // Функция для безопасного экранирования текста в JavaScript строках
    const escapeText = (text) => {
        if (!text) return '';
        return text.replace(/\\/g, '\\\\')
                   .replace(/"/g, '\\"')
                   .replace(/\n/g, '\\n')
                   .replace(/\r/g, '\\r')
                   .replace(/\t/g, '\\t');
    };
    
    // Функция для безопасного экранирования HTML
    const escapeHTML = (text) => {
        if (!text) return '';
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;')
                   .replace(/'/g, '&#039;');
    };
    
    const title = document.getElementById('game-title')?.value || 'GAME';
    const welcomeText = document.getElementById('welcome-text')?.value || 'Ready to play?';
    const enableCountdown = document.getElementById('enable-countdown')?.checked ?? true;
    const lives = document.getElementById('lives-count')?.value || 5;
    const enableTimer = document.getElementById('enable-timer')?.checked ?? true;
    const timerDuration = document.getElementById('timer-duration')?.value || 15;
    const colorBorder = document.getElementById('color-question-border')?.value || '#6ab04c';
    const colorGlow = document.getElementById('color-glow')?.value || '#ffffff';
    const colorTimer = document.getElementById('color-timer')?.value || '#eb4d4b';
    const victoryText = document.getElementById('victory-text')?.value || 'VICTORY!';
    const gameoverText = document.getElementById('gameover-text')?.value || 'GAME OVER';
    const victoryEffect = document.getElementById('victory-effect')?.value || 'fireworks';
    const gameLanguage = document.getElementById('game-language')?.value || 'en';
    const answerFontSize = document.getElementById('answer-font-size')?.value || 22;
    const heroSize = document.getElementById('hero-size')?.value || 100;
    const heroVertical = document.getElementById('hero-vertical')?.value || 70;
    const startButtonText = document.getElementById('start-button-text')?.value || 'START!';
    const retryButtonText = document.getElementById('retry-button-text')?.value || 'Try Again';
    const colorText = document.getElementById('color-text')?.value || '#ffffff';
    const victoryMessage = document.getElementById('victory-message')?.value || 'Отличная работа!';
    
    const particleDirection = document.getElementById('particle-direction')?.value || 'down';
    const globalParticleSize = document.getElementById('global-particle-size')?.value || 100;
    const globalParticleSpeed = document.getElementById('global-particle-speed')?.value || 100;
    const globalParticleCount = document.getElementById('global-particle-count')?.value || 100;
    
    const translations = {
        ru: { tryAgain: 'Попробовать снова' },
        en: { tryAgain: 'Try Again' },
        de: { tryAgain: 'Nochmal versuchen' }
    };
    
    const levelsBank = {};
    Object.keys(gameData.levels).forEach(lvl => {
        levelsBank[lvl] = gameData.levels[lvl].map(q => ({
            q: q.question,
            options: q.options,
            correct: q.correct
        }));
    });
    
    // Собираем графику для уровней
    const enableLevelGraphics = document.getElementById('enable-level-graphics')?.checked || false;
    const levelGraphics = {};
    
    if (enableLevelGraphics) {
        for (let i = 1; i <= 5; i++) {
            levelGraphics[i] = {
                hero: gameData[`hero-${i}`] || gameData.hero || '',
                platform: gameData[`platform-${i}`] || gameData.platform || '',
                bg: gameData[`bg-${i}`] || gameData.bg || '',
                life: gameData[`life-${i}`] || gameData.life || ''
            };
        }
    } else {
        // Используем общую графику для всех уровней
        for (let i = 1; i <= 5; i++) {
            levelGraphics[i] = {
                hero: gameData.hero || '',
                platform: gameData.platform || '',
                bg: gameData.bg || '',
                life: gameData.life || ''
            };
        }
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(title)}</title>
<style>
:root {
    --water1: #2bbcd6;
    --water2: #168ea0;
    --ui-bg: ${colorBorder};
    --glow-color: ${colorGlow};
    --timer-color: ${colorTimer};
    --text-color: ${colorText};
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: Arial, sans-serif;
    background: #2bbcd6; /* Фон по умолчанию, будет заменён через JS */
    background-size: cover;
    background-position: center center;
    background-attachment: fixed;
    background-repeat: no-repeat;
}

#start-screen {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 3000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--text-color);
    text-align: center;
    padding: 20px;
}

#start-screen h1 {
    font-size: 3em;
    margin-bottom: 20px;
    text-shadow: 0 0 20px rgba(0,0,0,0.8);
    color: var(--text-color);
}

#start-screen p {
    font-size: 1.5em;
    margin-bottom: 30px;
    text-shadow: 0 0 10px rgba(0,0,0,0.8);
    color: var(--text-color);
}

#start-button {
    padding: 20px 60px;
    font-size: 24px;
    font-weight: bold;
    background: var(--ui-bg);
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    text-transform: uppercase;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    transition: all 0.3s;
}

#start-button:hover {
    transform: scale(1.1) translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.7);
}

#ui-layer {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1000;
    pointer-events: none;
}

#header {
    background: var(--ui-bg);
    color: white;
    padding: 10px;
    text-align: center;
    font-weight: bold;
    pointer-events: auto;
}

#lives-container {
    position: absolute;
    top: 50px;
    left: 20px;
    display: flex;
    gap: 8px;
    pointer-events: auto;
}

.life-icon {
    width: 52px;
    height: 52px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
    transition: transform 0.2s;
}

.life-icon:last-child {
    animation: pulse-life 0.8s ease-in-out infinite alternate;
}

@keyframes pulse-life {
    from { transform: scale(1); }
    to { transform: scale(1.15); }
}

#question-box {
    background: white;
    width: 85%;
    max-width: 500px;
    margin: 10px auto;
    padding: 12px;
    border-radius: 18px;
    text-align: center;
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
    pointer-events: auto;
}

.timer-bar {
    width: 100%;
    height: 8px;
    background: #dfe6e9;
    border-radius: 5px;
    margin-top: 8px;
    overflow: hidden;
    ${enableTimer ? '' : 'display: none;'}
}

#timer-fill {
    width: 100%;
    height: 100%;
    background: var(--timer-color);
    transition: width 0.1s linear;
}

#world {
    position: absolute;
    inset: 0;
    padding-top: 60px;
    overflow: hidden;
}

#pond {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
}

.leaf {
    position: absolute;
    width: 20vw;
    height: 16vw;
    max-width: 180px;
    max-height: 150px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transform: scale(0.85);
    transition: transform 0.4s, opacity 0.4s;
    padding: 15px;
    box-sizing: border-box;
    text-align: center;
    font-size: ${answerFontSize}px;
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8), -1px -1px 3px rgba(0,0,0,0.8);
}

.leaf.active {
    opacity: 1;
    transform: scale(1.1);
    z-index: 10;
    cursor: pointer;
    filter: drop-shadow(0 0 15px var(--glow-color));
}

.leaf.active::after {
    content: attr(data-letter);
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: #f1c40f;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-shadow: none;
    color: black;
}

@keyframes leaf-bounce {
    0% { transform: scale(1.1) translateY(0); }
    30% { transform: scale(1.05) translateY(8px); }
    60% { transform: scale(1.12) translateY(-3px); }
    100% { transform: scale(1.1) translateY(0); }
}

.leaf-landed {
    animation: leaf-bounce 0.5s ease-out;
}

#frog {
    opacity: 0;
    position: absolute;
    width: calc(10vw * ${heroSize} / 100);
    height: calc(10vw * ${heroSize} / 100);
    max-width: calc(90px * ${heroSize} / 100);
    max-height: calc(90px * ${heroSize} / 100);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    transform: translate(-50%, -${heroVertical}%) scale(1.15);
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.4));
    z-index: 999 !important;
    transition: left 0.6s cubic-bezier(.47,1.21,.58,1), 
                top 0.6s cubic-bezier(.47,1.21,.58,1), 
                transform 0.3s ease-out;
    pointer-events: none;
}

.shock {
    animation: electric-shock 0.1s infinite;
    z-index: 10 !important;
}

@keyframes electric-shock {
    0% { transform: scale(1.1) translate(2px, 2px); filter: brightness(1.5) hue-rotate(180deg); }
    25% { transform: scale(1.1) translate(-2px, -2px); }
    50% { transform: scale(1.1) translate(2px, -2px); }
    75% { transform: scale(1.1) translate(-2px, 2px); }
    100% { transform: scale(1.1) translate(0, 0); filter: brightness(1); }
}

.sink {
    transform: translate(-50%, -50%) scale(0) !important;
    opacity: 0 !important;
}

#overlay {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 2000;
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--text-color);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

#msg {
    font-size: 3em;
    animation: bounceIn 1s ease-out;
}

@keyframes bounceIn {
    0%, 20%, 40%, 60%, 80%, 100% {
        transition-timing-function: cubic-bezier(0.215, .61, .355, 1);
    }
    0% {
        opacity: 0;
        transform: scale3d(.3, .3, .3);
    }
    20% {
        transform: scale3d(1.1, 1.1, 1.1);
    }
    40% {
        transform: scale3d(.9, .9, .9);
    }
    60% {
        opacity: 1;
        transform: scale3d(1.03, 1.03, 1.03);
    }
    80% {
        transform: scale3d(.97, .97, .97);
    }
    100% {
        opacity: 1;
        transform: scale3d(1, 1, 1);
    }
}

button {
    padding: 15px 45px;
    border-radius: 30px;
    border: none;
    background: var(--ui-bg);
    color: white;
    font-size: 18px;
    cursor: pointer;
    margin-top: 20px;
}

.leaf.active:not([data-letter])::after {
    display: none;
}

.jumping-frog {
    filter: drop-shadow(0 30px 20px rgba(0,0,0,0.3)) !important;
    transform: translate(-50%, calc(-${heroVertical}% - 20%)) scale(1.4) !important;
}

@keyframes count-pulse {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
}

.count-animate {
    animation: count-pulse 1s ease-out forwards;
}

.super-jump {
    top: -200px !important;
    transform: translate(-50%, -50%) scale(2) rotate(360deg) !important;
    transition: top 0.8s cubic-bezier(.47,1.21,.58,1), transform 0.8s !important;
}

@keyframes pond-slide {
    0% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(100vh); opacity: 0; }
    51% { transform: translateY(-100vh); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

.pond-transition {
    animation: pond-slide 1.2s ease-in-out;
}

.splash {
    position: absolute;
    border: 4px solid rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: splash-ani 0.6s ease-out forwards;
    z-index: 5;
}

@keyframes splash-ani {
    0% { width: 0; height: 0; opacity: 1; border-width: 4px; }
    100% { width: 150px; height: 80px; opacity: 0; border-width: 1px; }
}

#fireworksCanvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2001;
    pointer-events: none;
}

#volume-control {
    position: absolute;
    top: 50px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 15px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 2000;
    pointer-events: auto;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    border: 2px solid var(--ui-bg);
}

#volume-slider {
    cursor: pointer;
    accent-color: var(--ui-bg);
    width: 80px;
}

#speaker-icon {
    font-size: 20px;
    transition: filter 0.3s, opacity 0.3s;
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
    display: inline-block;
    position: relative;
}

.muted-icon {
    filter: grayscale(1) !important;
    opacity: 0.6;
}

.muted-icon::after {
    content: "";
    position: absolute;
    top: 50%;
    left: -2px;
    width: 110%;
    height: 3px;
    background-color: #eb4d4b;
    transform: rotate(-45deg);
    border-radius: 2px;
}

.speaker-body {
    fill: var(--ui-bg);
    transition: fill 0.3s;
}

.speaker-waves {
    transition: opacity 0.3s, stroke 0.3s;
}

.muted-icon .speaker-body {
    fill: #95a5a6;
}

.muted-icon .speaker-waves {
    opacity: 0;
}

/* ЭКРАН ЗАГРУЗКИ */
#loader-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, #1a2a6c, #b21f1f, #fdbb2d);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 10000;
    opacity: 1;
    transition: opacity 0.8s ease-out, visibility 0.8s;
}

#loader-wrapper.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.portal-loader {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 8px solid transparent;
    border-top-color: #00ffc8;
    border-bottom-color: #e030e0;
    animation: spin-loader 1.5s linear infinite, pulse-loader 2s ease-in-out infinite alternate;
    box-shadow: 0 0 30px rgba(0, 255, 200, 0.6);
    margin-bottom: 30px;
}

.loading-text {
    font-family: Arial, sans-serif;
    color: white;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 3px;
    animation: flicker-loader 1s infinite alternate;
    text-shadow: 0 0 10px rgba(255,255,255,0.8);
}

.loading-subtext {
    font-family: Arial, sans-serif;
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    margin-top: 10px;
    animation: flicker-loader 1.5s infinite alternate;
}

@keyframes spin-loader {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse-loader {
    0% { transform: scale(0.95); filter: hue-rotate(0deg); }
    100% { transform: scale(1.1); filter: hue-rotate(90deg); }
}

@keyframes flicker-loader {
    from { opacity: 1; }
    to { opacity: 0.4; }
}
</style>
</head>
<body>

<!-- ЭКРАН ЗАГРУЗКИ -->
<div id="loader-wrapper">
    <div class="portal-loader"></div>
    <div class="loading-text">ЗАГРУЗКА...</div>
    <div class="loading-subtext">Подготовка приключения</div>
</div>

<div id="start-screen">
    <h1>${escapeHTML(title)}</h1>
    <p>${escapeHTML(welcomeText)}</p>
    <button id="start-button" onclick="hideStartScreen()">${startButtonText}</button>
</div>

${enableCountdown ? `<div id="countdown-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 3000; justify-content: center; align-items: center; pointer-events: auto;">
    <div id="countdown-text" style="font-size: 150px; color: var(--text-color); font-weight: bold; text-shadow: 0 0 20px rgba(0,0,0,0.5); font-family: Arial, sans-serif;"></div>
</div>` : ''}

<div id="ui-layer">
    <div id="header">${escapeHTML(title)}</div>
    <div id="lives-container"></div>
    <div id="question-box">
        <div id="q-text"><b>${escapeHTML(welcomeText)}</b></div>
        <div class="timer-bar"><div id="timer-fill"></div></div>
    </div>
</div>

<div id="volume-control">
    <div id="speaker-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="speaker-body" d="M11 5L6 9H2V15H6L11 19V5Z" fill="var(--ui-bg)" stroke="#2d3436" stroke-width="1.5"/>
            <path class="speaker-waves" d="M15.54 8.46C16.5 9.42 17.04 10.72 17.04 12C17.04 13.28 16.5 14.58 15.54 15.54" stroke="#2bbcd6" stroke-width="2" stroke-linecap="round"/>
            <path class="speaker-waves" d="M19.07 4.93C21.02 6.88 22.12 9.44 22.12 12C22.12 14.56 21.02 17.12 19.07 19.07" stroke="#2bbcd6" stroke-width="2" stroke-linecap="round"/>
        </svg>
    </div>
    <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="0.5">
</div>

<div id="world">
    <div id="pond">
        <div id="frog"></div>
    </div>
</div>

<div id="overlay">
    <div id="victory-modal" style="display: none; background: rgba(255,255,255,0.95); padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        <img id="victory-hero-img" src="" style="max-width: 200px; max-height: 200px; display: none; margin: 0 auto 20px;">
        <h1 id="victory-title" style="color: #22c55e; margin: 0 0 15px; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);"></h1>
        <p id="victory-msg" style="color: #333; font-size: 1.2em; margin: 0 0 25px; line-height: 1.6;"></p>
        <button onclick="initGame()" style="padding: 15px 40px; font-size: 18px; background: #22c55e; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">${retryButtonText}</button>
    </div>
    <h1 id="msg" style="display: none;">Game Over</h1>
    <canvas id="fireworksCanvas"></canvas>
    <button id="retry-btn" onclick="initGame()" style="display: none;">${retryButtonText}</button>
</div>

<script>
const levelsBank = ${JSON.stringify(levelsBank)};
const LEVEL_GRAPHICS = ${JSON.stringify(levelGraphics)};
const TIMER_DURATION = ${timerDuration};
const ENABLE_TIMER = ${enableTimer};
const ENABLE_COUNTDOWN = ${enableCountdown};
const VICTORY_TEXT = "${escapeText(victoryText)}";
const VICTORY_MESSAGE = "${escapeText(victoryMessage)}";
const VICTORY_HERO_IMAGE = "${gameData['victory-hero'] || ''}";
const GAMEOVER_TEXT = "${escapeText(gameoverText)}";
const VICTORY_EFFECT = "${victoryEffect}";
const GAME_LANGUAGE = "${gameLanguage}";
const PARTICLE_DIRECTION = "${particleDirection}";
const CUSTOM_PARTICLE_IMAGE = "${gameData['custom-particle'] || ''}";
const GLOBAL_SIZE_MULTIPLIER = ${globalParticleSize} / 100;
const GLOBAL_SPEED_MULTIPLIER = ${globalParticleSpeed} / 100;
const GLOBAL_COUNT_MULTIPLIER = ${globalParticleCount} / 100;

const translations = {
    ru: {
        level: 'УРОВЕНЬ',
        question: 'Вопрос',
        tryAgain: 'Попробовать снова',
        outOfTime: 'Время вышло!',
        go: 'ВПЕРЁД!'
    },
    en: {
        level: 'LEVEL',
        question: 'Question',
        tryAgain: 'Try Again',
        outOfTime: 'Out of time!',
        go: 'GO!'
    },
    de: {
        level: 'STUFE',
        question: 'Frage',
        tryAgain: 'Nochmal versuchen',
        outOfTime: 'Zeit ist abgelaufen!',
        go: 'LOS!'
    }
};

const t = translations[GAME_LANGUAGE];

let currentLevel = 1;
let step = 0;
let lives = ${lives};
let questions = [];
let timer;
let lastCorrectLeaf;
let globalVolume = 0.5;
let isJumping = false;

function hideStartScreen() {
    document.getElementById('start-screen').style.display = 'none';
    initGame();
}

const sounds = {
    splash: new Audio('${gameData['sound-jump'] || ''}'),
    shock: new Audio('${gameData['sound-shock'] || ''}'),
    victory: new Audio('${gameData['sound-win'] || ''}'),
    gameOver: new Audio('${gameData['sound-lose'] || ''}'),
    start: new Audio('${gameData['sound-start'] || ''}'),
    levelUp: new Audio('${gameData['sound-level'] || ''}'),
    count: new Audio('${gameData['sound-countdown'] || ''}')
};

function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = globalVolume;
    audio.play().catch(e => console.log("Audio blocked"));
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('volume-slider');
    const speaker = document.getElementById('speaker-icon');
    
    slider.value = globalVolume;

    slider.addEventListener('input', (e) => {
        globalVolume = parseFloat(e.target.value);
        if (globalVolume === 0) {
            speaker.classList.add('muted-icon');
        } else {
            speaker.classList.remove('muted-icon');
        }
    });
});

const pond = document.getElementById('pond');
const frog = document.getElementById('frog');

function createPond() {
    const leaves = pond.querySelectorAll('.leaf');
    leaves.forEach(l => l.remove());
    const rows = 7;
    const cols = 5;
    
    const horizontalSpread = 1.2;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (c > 0 && c < 4) {
                const leaf = document.createElement('div');
                leaf.className = 'leaf';
                
                const columnWidth = 100 / (cols - 1);
                const rowOffset = (r % 2 === 0) ? 0 : (columnWidth / 2);
                
                let leftPos = (c * columnWidth + rowOffset);
                leftPos = 50 + (leftPos - 62.5) * horizontalSpread;

                leaf.style.left = leftPos + '%';
                
                const verticalPosition = (r / (rows - 1)) * 68 + 12;
                leaf.style.top = verticalPosition + '%';

                leaf.id = \`leaf-\${r}-\${c}\`;
                pond.appendChild(leaf);
            }
        }
    }
}

function initGame() {
    pond.classList.remove('pond-transition');
    ${enableCountdown ? `const overlay = document.getElementById('countdown-overlay');
    const countText = document.getElementById('countdown-text');
    document.getElementById('overlay').style.display = 'none';

    sounds.count.pause();
    sounds.count.currentTime = 0;

    currentLevel = 1;
    step = 0;
    lives = ${lives};
    updateLives();
    createPond();

    overlay.style.display = 'flex';

    const steps = ['3', '2', '1', t.go];
    let i = 0;

    countText.textContent = steps[i];
    countText.classList.remove('count-animate');
    void countText.offsetWidth;
    countText.classList.add('count-animate');

    playSound(sounds.count);
    i++;

    const timerInterval = setInterval(() => {
        if (i < steps.length) {
            countText.textContent = steps[i];
            countText.classList.remove('count-animate');
            void countText.offsetWidth;
            countText.classList.add('count-animate');
            i++;
        } else {
            clearInterval(timerInterval);
            overlay.style.display = 'none';
            frog.style.opacity = 1;
            startGameLogic();
        }
    }, 1000);` : `
    currentLevel = 1;
    step = 0;
    lives = ${lives};
    updateLives();
    createPond();
    document.getElementById('overlay').style.display = 'none';
    frog.style.opacity = 1;
    startGameLogic();
    `}
}

function applyLevelGraphics(level) {
    const graphics = LEVEL_GRAPHICS[level];
    if (!graphics) return;
    
    // Применяем фон
    if (graphics.bg) {
        document.body.style.backgroundImage = \`url('\${graphics.bg}')\`;
    }
    
    // Применяем персонажа
    if (graphics.hero) {
        const frog = document.getElementById('frog');
        if (frog) {
            frog.style.backgroundImage = \`url('\${graphics.hero}')\`;
        }
    }
    
    // Применяем платформы
    if (graphics.platform) {
        document.querySelectorAll('.leaf').forEach(leaf => {
            leaf.style.backgroundImage = \`url('\${graphics.platform}')\`;
        });
    }
    
    // Применяем иконки жизни
    if (graphics.life) {
        document.querySelectorAll('.life-icon').forEach(icon => {
            icon.style.backgroundImage = \`url('\${graphics.life}')\`;
        });
    }
}

function startGameLogic() {
    playSound(sounds.start);
    document.getElementById('header').textContent = \`${title} - \${t.level} \${currentLevel}\`;
    
    // Применяем графику для текущего уровня
    applyLevelGraphics(currentLevel);
    
    // Берём случайные вопросы из банка (максимум 6)
    const allQuestions = [...levelsBank[currentLevel]];
    const selectedQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    
    // Перемешиваем ответы в каждом вопросе
    questions = selectedQuestions.map(q => {
        const shuffledOptions = [...q.options];
        const correctAnswer = shuffledOptions[q.correct];
        
        // Перемешиваем массив ответов
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        // Находим новый индекс правильного ответа после перемешивания
        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
        
        return {
            q: q.q,
            options: shuffledOptions,
            correct: newCorrectIndex
        };
    });
    
    frog.classList.remove('sink', 'super-jump', 'shock');
    lastCorrectLeaf = document.getElementById('leaf-6-2');
    
    document.querySelectorAll('.leaf').forEach(l => l.classList.remove('active', 'leaf-landed', 'shock'));
    lastCorrectLeaf.classList.add('active');

    frog.style.transition = "none";
    updateFrog(lastCorrectLeaf);
    
    setTimeout(() => {
        frog.style.transition = "left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        loadLevel();
    }, 50);
}

function updateLives() {
    const c = document.getElementById('lives-container');
    c.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const l = document.createElement('div');
        l.className = 'life-icon';
        c.appendChild(l);
    }
    
    // Применяем графику жизней для текущего уровня
    const graphics = LEVEL_GRAPHICS[currentLevel];
    if (graphics && graphics.life) {
        document.querySelectorAll('.life-icon').forEach(icon => {
            icon.style.backgroundImage = `url('${graphics.life}')`;
        });
    }
}

function loadLevel() {
    isJumping = false;
    
    if (step >= questions.length) {
        const nextLevel = currentLevel + 1;
        if (levelsBank[nextLevel] && levelsBank[nextLevel].length > 0) {
            frog.classList.add('super-jump');
            playSound(sounds.levelUp);
            setTimeout(() => {
                pond.classList.add('pond-transition');
                setTimeout(() => {
                    currentLevel++;
                    step = 0;
                    
                    // Применяем графику для нового уровня
                    applyLevelGraphics(currentLevel);
                    
                    // Берём случайные вопросы и перемешиваем ответы
                    const allQuestions = [...levelsBank[currentLevel]];
                    const selectedQuestions = allQuestions
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 6);
                    
                    questions = selectedQuestions.map(q => {
                        const shuffledOptions = [...q.options];
                        const correctAnswer = shuffledOptions[q.correct];
                        
                        for (let i = shuffledOptions.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                        }
                        
                        const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
                        
                        return {
                            q: q.q,
                            options: shuffledOptions,
                            correct: newCorrectIndex
                        };
                    });
                    
                    document.getElementById('header').textContent = \`${title} - \${t.level} \${currentLevel}\`;
                    frog.classList.remove('super-jump');
                    frog.style.transition = "none";
                    lastCorrectLeaf = document.getElementById('leaf-6-2');
                    updateFrog(lastCorrectLeaf);
                    setTimeout(() => {
                        pond.classList.remove('pond-transition');
                        frog.style.transition = "left 0.6s cubic-bezier(.47,1.21,.58,1), top 0.6s cubic-bezier(.47,1.21,.58,1), transform 0.3s ease-out";
                        loadLevel();
                    }, 50);
                }, 600);
            }, 400);
            return;
        } else {
            showEnd(VICTORY_TEXT);
            return;
        }
    }

    document.querySelectorAll('.leaf.active').forEach(l => {
        l.classList.remove('active', 'leaf-landed');
        l.textContent = '';
        l.onclick = null;
        delete l.dataset.letter;
    });

    if (lastCorrectLeaf) {
        lastCorrectLeaf.classList.add('active');
    }

    const q = questions[step];
    document.getElementById('q-text').innerHTML = \`<b>\${t.question} \${step+1}:</b> \${q.q}\`;

    const row = 5 - step;
    [1,2,3].forEach((c,i) => {
        const leaf = document.getElementById(\`leaf-\${row}-\${c}\`);
        if(leaf) {
            leaf.classList.add('active');
            leaf.dataset.letter = String.fromCharCode(65+i);
            leaf.textContent = q.options[i];
            leaf.onclick = () => handleJump(i, leaf);
        }
    });

    if (ENABLE_TIMER) {
        startTimer();
    }
}

function handleJump(i, leaf) {
    if (isJumping) return;
    
    isJumping = true;
    clearInterval(timer);
    updateFrog(leaf);

    if (i === questions[step].correct) {
        lastCorrectLeaf = leaf;
        leaf.classList.add('leaf-landed');
        playSound(sounds.splash);

        setTimeout(() => {
            const x = leaf.offsetLeft + leaf.offsetWidth / 2;
            const y = leaf.offsetTop + leaf.offsetHeight / 2;
            createSplash(x, y);
        }, 300);

        setTimeout(() => {
            step++;
            isJumping = false;
            loadLevel();
        }, 700);
    } else {
        playSound(sounds.shock);
        leaf.classList.add('shock');
        frog.classList.add('shock');
        
        lives--;
        updateLives();

        setTimeout(() => {
            updateFrog(lastCorrectLeaf);
            
            setTimeout(() => {
                leaf.classList.remove('shock');
                frog.classList.remove('shock');
            }, 300);

            if (lives <= 0) {
                showEnd(GAMEOVER_TEXT);
            } else {
                setTimeout(() => {
                    isJumping = false;
                    loadLevel();
                }, 400);
            }
        }, 150);
    }
}

function createSplash(x, y) {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = x + 'px';
    splash.style.top = y + 'px';
    pond.appendChild(splash);
    setTimeout(() => splash.remove(), 600);
}

function updateFrog(leaf) {
    if (frog.classList.contains('super-jump')) return;
    
    const targetX = leaf.offsetLeft + (leaf.offsetWidth / 2);
    const targetY = leaf.offsetTop + (leaf.offsetHeight / 2);
    
    frog.style.zIndex = "999";
    
    frog.classList.add('jumping-frog');
    
    frog.style.left = targetX + 'px';
    frog.style.top = targetY + 'px';
    
    setTimeout(() => {
        frog.classList.remove('jumping-frog');
    }, 600);
}

function startTimer() {
    let t = 100;
    clearInterval(timer);

    timer = setInterval(() => {
        t -= (100 / (TIMER_DURATION * 10));
        document.getElementById('timer-fill').style.width = t + '%';
        if (t <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 100);
}

function handleTimeout() {
    playSound(sounds.shock);
    frog.classList.add('shock');
    
    lives--;
    updateLives();
    
    setTimeout(() => {
        frog.classList.remove('shock');
        
        if (lives <= 0) {
            showEnd(GAMEOVER_TEXT);
        } else {
            loadLevel();
        }
    }, 800);
}

const fireworksCanvas = document.getElementById('fireworksCanvas');
const ctx = fireworksCanvas.getContext('2d');
let particles = [];
let animationFrameId;

function setCanvasSize() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}
window.addEventListener('resize', setCanvasSize);
setCanvasSize();

class Particle {
    constructor(x, y, color, speed) {
        this.x = x; this.y = y; this.color = color; this.speed = speed;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = { x: Math.cos(this.angle) * this.speed, y: Math.sin(this.angle) * this.speed };
        this.friction = 0.99; this.gravity = 0.05; this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.01;
    }
    draw() {
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fillStyle = this.color;
        ctx.fill(); ctx.restore();
    }
    update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.velocity.y += this.gravity; this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

class ConfettiPiece {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * 10 + 5) * GLOBAL_SIZE_MULTIPLIER;
        this.speedX = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.speedY = (Math.random() * -10 - 5) * GLOBAL_SPEED_MULTIPLIER;
        this.gravity = 0.3 * GLOBAL_SPEED_MULTIPLIER;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 10 - 5) * GLOBAL_SPEED_MULTIPLIER;
        this.color = \`hsl(\${Math.random() * 360}, 100%, 50%)\`;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > fireworksCanvas.height) this.alpha -= 0.02;
    }
}

class Bubble {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * 30 + 10) * GLOBAL_SIZE_MULTIPLIER;
        this.speedX = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.speedY = (Math.random() * -2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.wobble = Math.random() * Math.PI * 2;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const gradient = ctx.createRadialGradient(
            this.x - this.size / 4, this.y - this.size / 4, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(173, 216, 230, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 149, 237, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - this.size / 3, this.y - this.size / 3, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.wobble += 0.1;
        this.x += this.speedX + Math.sin(this.wobble) * 0.5;
        this.y += this.speedY;
        if (this.y < -this.size) this.alpha -= 0.02;
    }
}

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * 3 + 2) * GLOBAL_SIZE_MULTIPLIER;
        this.speedY = (Math.random() * 3 + 2) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = 1;
        this.twinkle = Math.random() * Math.PI * 2;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha * (Math.sin(this.twinkle) * 0.3 + 0.7);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = this.x + Math.cos(angle) * this.size;
            const y = this.y + Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.y += this.speedY;
        this.twinkle += 0.1;
        if (this.y > fireworksCanvas.height) this.alpha -= 0.02;
    }
}

class Heart {
    constructor(x, y) {
        this.x = x || Math.random() * fireworksCanvas.width;
        this.y = y || Math.random() * fireworksCanvas.height;
        this.size = (Math.random() * 30 + 20) * GLOBAL_SIZE_MULTIPLIER;
        this.speedX = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.speedY = (Math.random() * -3 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.gravity = 0.15 * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = Math.random() * 0.4 + 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = \`hsl(\${Math.random() * 60 + 320}, 100%, 60%)\`;
        ctx.beginPath();
        ctx.moveTo(0, this.size / 4);
        ctx.bezierCurveTo(-this.size / 2, -this.size / 4, -this.size, this.size / 4, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size / 4, this.size / 2, -this.size / 4, 0, this.size / 4);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > fireworksCanvas.height + 50 || this.y < -50) this.alpha -= 0.01;
    }
}

class Sparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * 4 + 2) * GLOBAL_SIZE_MULTIPLIER;
        this.speedX = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.speedY = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.brightness = Math.random();
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, \`hsl(50, 100%, \${50 + this.brightness * 50}%)\`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = \`rgba(255, 255, 200, \${this.alpha})\`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size * 2, this.y);
        ctx.lineTo(this.x + this.size * 2, this.y);
        ctx.moveTo(this.x, this.y - this.size * 2);
        ctx.lineTo(this.x, this.y + this.size * 2);
        ctx.stroke();
        ctx.restore();
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        this.brightness = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
    }
}

class SunRay {
    constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.length = 0;
        this.maxLength = Math.random() * 300 + 200;
        this.speed = Math.random() * 5 + 3;
        this.alpha = Math.random() * 0.3 + 0.2;
    }
    draw() {
        const centerX = fireworksCanvas.width / 2;
        const centerY = fireworksCanvas.height / 2;
        const endX = centerX + Math.cos(this.angle) * this.length;
        const endY = centerY + Math.sin(this.angle) * this.length;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();
    }
    update() {
        if (this.length < this.maxLength) {
            this.length += this.speed;
        }
    }
}

class RainbowArc {
    constructor() {
        this.progress = 0;
        this.maxProgress = 1;
        this.speed = 0.02;
        this.centerX = fireworksCanvas.width / 2;
        this.centerY = fireworksCanvas.height;
        this.radius = Math.min(fireworksCanvas.width, fireworksCanvas.height) * 0.8;
    }
    draw() {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        ctx.save();
        for (let i = 0; i < colors.length; i++) {
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.arc(
                this.centerX, 
                this.centerY, 
                this.radius - i * 20, 
                Math.PI, 
                Math.PI + Math.PI * this.progress
            );
            ctx.stroke();
        }
        ctx.restore();
    }
    update() {
        if (this.progress < this.maxProgress) {
            this.progress += this.speed;
        }
    }
}

class GoldCoin {
    constructor(x, y) {
        this.x = x || Math.random() * fireworksCanvas.width;
        this.y = y || -20;
        this.size = (Math.random() * 20 + 15) * GLOBAL_SIZE_MULTIPLIER;
        this.speedY = (Math.random() * 3 + 2) * GLOBAL_SPEED_MULTIPLIER;
        this.speedX = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() * 3 + 1) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = 1;
        this.flip = 0;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        this.flip += this.rotationSpeed * 0.05;
        const scale = Math.abs(Math.cos(this.flip));
        ctx.scale(scale, 1);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(2, 2, this.size, this.size, 0, 0, Math.PI * 2);
        ctx.fill();
        const gradient = ctx.createRadialGradient(
            -this.size * 0.3, -this.size * 0.3, 0,
            0, 0, this.size
        );
        gradient.addColorStop(0, '#FFF9C4');
        gradient.addColorStop(0.3, '#FFD700');
        gradient.addColorStop(0.6, '#FFA500');
        gradient.addColorStop(0.8, '#FF8C00');
        gradient.addColorStop(1, '#B8860B');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#B8860B';
        ctx.font = \`bold \${this.size}px Arial\`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        ctx.restore();
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > fireworksCanvas.height) this.alpha -= 0.02;
    }
}

class Diamond {
    constructor(x, y) {
        this.x = x || Math.random() * fireworksCanvas.width;
        this.y = y || -20;
        this.size = (Math.random() * 25 + 20) * GLOBAL_SIZE_MULTIPLIER;
        this.speedY = (Math.random() * 4 + 2) * GLOBAL_SPEED_MULTIPLIER;
        this.speedX = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 8 - 4) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = 1;
        this.sparkle = Math.random() * Math.PI * 2;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        const gradient = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
        gradient.addColorStop(0, '#E3F2FD');
        gradient.addColorStop(0.3, '#BBDEFB');
        gradient.addColorStop(0.5, '#64B5F6');
        gradient.addColorStop(0.7, '#42A5F5');
        gradient.addColorStop(1, '#2196F3');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.6, -this.size * 0.4);
        ctx.lineTo(this.size * 0.8, this.size * 0.3);
        ctx.lineTo(0, this.size * 0.8);
        ctx.lineTo(-this.size * 0.8, this.size * 0.3);
        ctx.lineTo(-this.size * 0.6, -this.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(25, 118, 210, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.sparkle += 0.1;
        if (this.y > fireworksCanvas.height) this.alpha -= 0.02;
    }
}

class MagicParticle {
    constructor(x, y) {
        this.x = x || Math.random() * fireworksCanvas.width;
        this.y = y || Math.random() * fireworksCanvas.height;
        this.size = (Math.random() * 8 + 4) * GLOBAL_SIZE_MULTIPLIER;
        this.speedX = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.speedY = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.color = \`hsl(\${Math.random() * 360}, 100%, 70%)\`;
        this.trail = [];
    }
    draw() {
        this.trail.forEach((pos, i) => {
            ctx.save();
            ctx.globalAlpha = (i / this.trail.length) * this.alpha * 0.3;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 10) this.trail.shift();
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.01;
    }
}

class Snowflake {
    constructor(x, y) {
        this.x = x || Math.random() * fireworksCanvas.width;
        this.y = y || -20;
        this.size = (Math.random() * 4 + 2) * GLOBAL_SIZE_MULTIPLIER;
        this.speedY = (Math.random() * 2 + 1) * GLOBAL_SPEED_MULTIPLIER;
        this.speedX = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * i) / 6);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, this.size);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > fireworksCanvas.height) this.alpha -= 0.01;
    }
}

class Flower {
    constructor(x, y) {
        this.x = x || Math.random() * fireworksCanvas.width;
        this.y = y || -20;
        this.size = (Math.random() * 15 + 10) * GLOBAL_SIZE_MULTIPLIER;
        this.speedY = (Math.random() * 2 + 1) * GLOBAL_SPEED_MULTIPLIER;
        this.speedX = (Math.random() * 2 - 1) * GLOBAL_SPEED_MULTIPLIER;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.alpha = Math.random() * 0.6 + 0.4;
        this.petalColor = \`hsl(\${Math.random() * 60 + 300}, 100%, 70%)\`;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * i) / 5);
            ctx.fillStyle = this.petalColor;
            ctx.beginPath();
            ctx.ellipse(0, -this.size * 0.5, this.size * 0.4, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        if (this.y > fireworksCanvas.height) this.alpha -= 0.01;
    }
}

class CustomParticle {
    constructor() {
        this.size = 40 * GLOBAL_SIZE_MULTIPLIER;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() * 4 - 2) * GLOBAL_SPEED_MULTIPLIER;
        this.time = 0;
        const baseSpeed = 5 * GLOBAL_SPEED_MULTIPLIER;
        switch(PARTICLE_DIRECTION) {
            case 'down':
                this.x = Math.random() * fireworksCanvas.width;
                this.y = -this.size;
                this.speedX = (Math.random() * 2 - 1) * baseSpeed;
                this.speedY = baseSpeed;
                break;
            case 'up':
                this.x = Math.random() * fireworksCanvas.width;
                this.y = fireworksCanvas.height + this.size;
                this.speedX = (Math.random() * 2 - 1) * baseSpeed;
                this.speedY = -baseSpeed;
                break;
            case 'left':
                this.x = fireworksCanvas.width + this.size;
                this.y = Math.random() * fireworksCanvas.height;
                this.speedX = -baseSpeed;
                this.speedY = (Math.random() * 2 - 1) * baseSpeed;
                break;
            case 'right':
                this.x = -this.size;
                this.y = Math.random() * fireworksCanvas.height;
                this.speedX = baseSpeed;
                this.speedY = (Math.random() * 2 - 1) * baseSpeed;
                break;
            case 'explode':
                this.x = fireworksCanvas.width / 2;
                this.y = fireworksCanvas.height / 2;
                const angle = Math.random() * Math.PI * 2;
                this.speedX = Math.cos(angle) * baseSpeed;
                this.speedY = Math.sin(angle) * baseSpeed;
                break;
            case 'spiral':
                this.x = fireworksCanvas.width / 2;
                this.y = fireworksCanvas.height / 2;
                this.angle = Math.random() * Math.PI * 2;
                this.radius = 0;
                break;
            case 'random':
            default:
                this.x = Math.random() * fireworksCanvas.width;
                this.y = Math.random() * fireworksCanvas.height;
                this.speedX = (Math.random() - 0.5) * baseSpeed * 2;
                this.speedY = (Math.random() - 0.5) * baseSpeed * 2;
                break;
        }
    }
    draw() {
        if (!customParticleImg || !customParticleImg.complete) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(customParticleImg, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
    update() {
        const baseSpeed = 5 * GLOBAL_SPEED_MULTIPLIER;
        if (PARTICLE_DIRECTION === 'spiral') {
            this.time += 0.05;
            this.radius += baseSpeed * 0.5;
            this.angle += 0.1;
            this.x = fireworksCanvas.width / 2 + Math.cos(this.angle) * this.radius;
            this.y = fireworksCanvas.height / 2 + Math.sin(this.angle) * this.radius;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
        }
        this.rotation += this.rotationSpeed;
        if (this.x < -this.size || this.x > fireworksCanvas.width + this.size ||
            this.y < -this.size || this.y > fireworksCanvas.height + this.size) {
            this.alpha -= 0.02;
        }
    }
}

let customParticleImg = null;
if (CUSTOM_PARTICLE_IMAGE) {
    customParticleImg = new Image();
    customParticleImg.src = CUSTOM_PARTICLE_IMAGE;
}

function createFireworks(x, y) {
    const hue = Math.random() * 360;
    const color = \`hsl(\${hue}, 100%, 50%)\`;
    const count = Math.round(50 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) { 
        particles.push(new Particle(x, y, color, Math.random() * 5 + 2)); 
    }
}

function createConfetti() {
    const count = Math.round(10 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new ConfettiPiece(
            Math.random() * fireworksCanvas.width,
            -20
        ));
    }
}

function createBubbles() {
    const count = Math.round(5 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Bubble(
            Math.random() * fireworksCanvas.width,
            fireworksCanvas.height + 20
        ));
    }
}

function createStars() {
    const count = Math.round(5 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Star(
            Math.random() * fireworksCanvas.width,
            -20
        ));
    }
}

function createHearts() {
    const count = Math.round(5 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Heart());
    }
}

function createSparkles() {
    const count = Math.round(8 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Sparkle(
            Math.random() * fireworksCanvas.width,
            Math.random() * fireworksCanvas.height
        ));
    }
}

function createSunshine() {
    const maxParticles = Math.round(30 * GLOBAL_COUNT_MULTIPLIER);
    if (particles.length < maxParticles) {
        particles.push(new SunRay());
    }
}

function createRainbow() {
    if (particles.length === 0) {
        particles.push(new RainbowArc());
    }
}

function createGold() {
    const count = Math.round(8 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new GoldCoin());
    }
}

function createDiamonds() {
    const count = Math.round(6 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Diamond());
    }
}

function createCoins() {
    const count = Math.round(10 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new GoldCoin());
    }
}

function createMagic() {
    const count = Math.round(12 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new MagicParticle());
    }
}

function createSnow() {
    const count = Math.round(8 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Snowflake());
    }
}

function createFlowers() {
    const count = Math.round(4 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new Flower());
    }
}

function createCustomParticles() {
    const count = Math.round(8 * GLOBAL_COUNT_MULTIPLIER);
    for (let i = 0; i < count; i++) {
        particles.push(new CustomParticle());
    }
}

function animateEffect() {
    animationFrameId = requestAnimationFrame(animateEffect);
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.alpha <= 0 || (p.alpha <= p.decay && p.decay)) {
            particles.splice(i, 1);
        }
    });
    
    const maxParticles = Math.round(300 * GLOBAL_COUNT_MULTIPLIER);
    
    // Генерация эффектов в зависимости от выбранного типа
    if (VICTORY_EFFECT === 'fireworks' && Math.random() < 0.05 && particles.length < maxParticles) {
        createFireworks(Math.random() * fireworksCanvas.width, Math.random() * fireworksCanvas.height * 0.7);
    } else if (VICTORY_EFFECT === 'confetti' && Math.random() < 0.3) {
        createConfetti();
    } else if (VICTORY_EFFECT === 'bubbles' && Math.random() < 0.2) {
        createBubbles();
    } else if (VICTORY_EFFECT === 'stars' && Math.random() < 0.2) {
        createStars();
    } else if (VICTORY_EFFECT === 'hearts' && Math.random() < 0.2) {
        createHearts();
    } else if (VICTORY_EFFECT === 'sparkles' && Math.random() < 0.2) {
        createSparkles();
    } else if (VICTORY_EFFECT === 'sunshine') {
        createSunshine();
    } else if (VICTORY_EFFECT === 'rainbow') {
        createRainbow();
    } else if (VICTORY_EFFECT === 'gold' && Math.random() < 0.25) {
        createGold();
    } else if (VICTORY_EFFECT === 'diamonds' && Math.random() < 0.2) {
        createDiamonds();
    } else if (VICTORY_EFFECT === 'coins' && Math.random() < 0.3) {
        createCoins();
    } else if (VICTORY_EFFECT === 'magic' && Math.random() < 0.25) {
        createMagic();
    } else if (VICTORY_EFFECT === 'snow' && Math.random() < 0.25) {
        createSnow();
    } else if (VICTORY_EFFECT === 'flowers' && Math.random() < 0.15) {
        createFlowers();
    } else if (VICTORY_EFFECT === 'custom' && Math.random() < 0.3) {
        createCustomParticles();
    }
}

function stopEffect() {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    particles = [];
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
}

function showEnd(text) {
    document.getElementById('overlay').style.display = 'flex';
    
    if (text === VICTORY_TEXT) {
        // Показываем модальное окно победы
        const modal = document.getElementById('victory-modal');
        const msgElement = document.getElementById('msg');
        const retryBtn = document.getElementById('retry-btn');
        
        modal.style.display = 'block';
        msgElement.style.display = 'none';
        retryBtn.style.display = 'none';
        
        // Устанавливаем текст
        document.getElementById('victory-title').textContent = VICTORY_TEXT;
        document.getElementById('victory-msg').textContent = VICTORY_MESSAGE;
        
        // Показываем изображение персонажа если есть
        const victoryImg = document.getElementById('victory-hero-img');
        if (VICTORY_HERO_IMAGE) {
            victoryImg.src = VICTORY_HERO_IMAGE;
            victoryImg.style.display = 'block';
        } else {
            victoryImg.style.display = 'none';
        }
        
        playSound(sounds.victory);
        if (VICTORY_EFFECT !== 'none') {
            fireworksCanvas.style.display = 'block';
            animateEffect();
            setTimeout(() => stopEffect(), 5000);
        }
    } else {
        // Показываем обычный экран проигрыша
        const modal = document.getElementById('victory-modal');
        const msgElement = document.getElementById('msg');
        const retryBtn = document.getElementById('retry-btn');
        
        modal.style.display = 'none';
        msgElement.style.display = 'block';
        retryBtn.style.display = 'block';
        msgElement.textContent = text;
        
        playSound(sounds.gameOver);
        stopEffect();
        fireworksCanvas.style.display = 'none';
    }
}

window.onload = function() {
    // Применяем графику для уровня 1 сразу при загрузке
    applyLevelGraphics(1);
    
    // Скрываем экран загрузки после загрузки всех ресурсов
    setTimeout(function() {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 1500); // 1.5 секунды задержки для красоты
};
<\/script>
</body>
</html>`;
}

function updatePreview() {
    try {
        const html = buildGameHTML();
        const iframe = document.getElementById('preview-frame');
        
        if (!iframe) {
            console.error('Preview iframe not found!');
            return;
        }
        
        // Используем srcdoc вместо src для надёжной работы
        // srcdoc не имеет ограничений на длину и работает везде
        iframe.srcdoc = html;
        
        console.log('Preview updated successfully');
    } catch (error) {
        console.error('Error in updatePreview:', error);
        alert('Ошибка обновления предпросмотра: ' + error.message);
    }
}

function copyCode() {
    const html = buildGameHTML();
    const escaped = html
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    const iframeCode = `<iframe srcdoc="${escaped}" width="100%" height="600" frameborder="0" allowfullscreen style="border: none;"></iframe>`;
    
    navigator.clipboard.writeText(iframeCode).then(() => {
        alert('✅ Код скопирован! Теперь вставьте его в Genially через HTML embed.');
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('❌ Не удалось скопировать. Попробуйте снова.');
    });
}

function downloadGame() {
    const html = buildGameHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'froggy-quest-game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Инициализация при загрузке
window.onload = init;
