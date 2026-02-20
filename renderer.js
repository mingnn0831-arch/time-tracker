let currentEditingHour = null;
let currentEditingDot = null; // null means editing the whole hour
let dotColors = {}; // Stores "h-m" -> color

const PALETTE_COLORS = [
    '#000000', '#8e8e93', '#636366', '#ff3b30', '#ff9500', '#ffcc00',
    '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55', '#a2845e',
    '#ff6961', '#ffb340', '#ffdb58', '#81d683', '#66b2ff', '#9a98e6',
    '#cd93e9', '#ff85a2', '#c4a484', '#3a3a3c', '#004080', '#006400'
];

function init() {
    loadColors();
    setupPalette();
    setupConfirmModal();
    setupThemeToggle();

    const col1 = document.getElementById('col-1');
    const col2 = document.getElementById('col-2');
    const col3 = document.getElementById('col-3');
    const col4 = document.getElementById('col-4');

    col1.innerHTML = '<div class="column-title">새벽</div>';
    col2.innerHTML = '<div class="column-title">오전</div>';
    col3.innerHTML = '<div class="column-title">오후</div>';
    col4.innerHTML = '<div class="column-title">저녁</div>';

    for (let h = 0; h < 24; h++) {
        const row = document.createElement('div');
        row.className = 'hour-row';

        const label = document.createElement('div');
        label.className = 'hour-label';
        label.id = `label-${h}`;
        label.textContent = h.toString().padStart(2, '0');
        label.title = 'Click to change color for entire hour';
        label.onclick = () => openPalette(h, null);
        row.appendChild(label);

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-container';

        for (let m = 0; m < 6; m++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.id = `dot-${h}-${m}`;
            dot.title = 'Click to change color for this segment';
            dot.onclick = () => openPalette(h, m);
            dotsContainer.appendChild(dot);
        }

        row.appendChild(dotsContainer);

        if (h < 6) col1.appendChild(row);
        else if (h < 12) col2.appendChild(row);
        else if (h < 18) col3.appendChild(row);
        else col4.appendChild(row);
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function loadColors() {
    const savedDots = localStorage.getItem('dotColors');
    const savedHours = localStorage.getItem('hourColors');

    if (savedDots) {
        dotColors = JSON.parse(savedDots);
    } else if (savedHours) {
        // Migrate from hourColors
        const hourColors = JSON.parse(savedHours);
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 6; m++) {
                dotColors[`${h}-${m}`] = hourColors[h] || '#000000';
            }
        }
        saveColors();
    } else {
        // Default color: Black
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 6; m++) {
                dotColors[`${h}-${m}`] = '#000000';
            }
        }
        saveColors();
    }
}

function saveColors() {
    localStorage.setItem('dotColors', JSON.stringify(dotColors));
}

function setupPalette() {
    const grid = document.getElementById('color-grid');
    const closeBtn = document.getElementById('palette-close');
    const overlay = document.getElementById('palette-overlay');

    PALETTE_COLORS.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.onclick = () => selectColor(color);
        grid.appendChild(swatch);
    });

    if (closeBtn) closeBtn.onclick = closePalette;
    if (overlay) overlay.onclick = (e) => { if (e.target === overlay) closePalette(); };
}

function setupConfirmModal() {
    const resetBtn = document.getElementById('reset-colors-btn');
    const modal = document.getElementById('confirm-modal');
    const cancelBtn = document.getElementById('confirm-cancel');
    const confirmResetBtn = document.getElementById('confirm-reset');

    if (!resetBtn || !modal) return;

    resetBtn.onclick = () => modal.classList.add('active');
    cancelBtn.onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    confirmResetBtn.onclick = () => {
        resetAllColors();
        modal.classList.remove('active');
    };
}

function setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };

    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
}

function resetAllColors() {
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 6; m++) {
            dotColors[`${h}-${m}`] = '#000000';
        }
    }
    saveColors();
    updateClock();
}

function openPalette(hour, dotIndex) {
    currentEditingHour = hour;
    currentEditingDot = dotIndex;
    const overlay = document.getElementById('palette-overlay');
    const title = document.getElementById('palette-title');

    if (title) {
        if (dotIndex !== null) {
            title.textContent = `${hour}시 ${dotIndex * 10}분 색상 선택`;
        } else {
            title.textContent = `${hour}시 전체 색상 선택`;
        }
    }

    const currentColor = dotIndex !== null ? dotColors[`${hour}-${dotIndex}`] : dotColors[`${hour}-0`];

    document.querySelectorAll('.color-swatch').forEach(swatch => {
        const isCurrent = swatch.style.backgroundColor === hexToRgb(currentColor);
        swatch.classList.toggle('active', isCurrent);
    });

    if (overlay) overlay.classList.add('active');
}

function closePalette() {
    const overlay = document.getElementById('palette-overlay');
    if (overlay) overlay.classList.remove('active');
    currentEditingHour = null;
    currentEditingDot = null;
}

function selectColor(color) {
    if (currentEditingHour !== null) {
        if (currentEditingDot !== null) {
            dotColors[`${currentEditingHour}-${currentEditingDot}`] = color;
        } else {
            for (let m = 0; m < 6; m++) {
                dotColors[`${currentEditingHour}-${m}`] = color;
            }
        }
        saveColors();
        updateClock();
        closePalette();
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

function updateClock() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDotIndex = Math.floor(currentMinute / 10);

    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        dateDisplay.textContent = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}/${weekDays[now.getDay()]}`;
    }

    const progressFill = document.getElementById('daily-progress');
    const progressText = document.getElementById('progress-info');
    if (progressFill) {
        const progressPercent = (((now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds()) / 86400) * 100;
        progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
        if (progressText) progressText.innerHTML = `오늘이 <b>${progressPercent.toFixed(1)}%</b> 진행되었습니다.`;
    }

    for (let h = 0; h < 24; h++) {
        const label = document.getElementById(`label-${h}`);
        if (label) label.classList.toggle('current-hour', h === currentHour);

        for (let m = 0; m < 6; m++) {
            const dot = document.getElementById(`dot-${h}-${m}`);
            if (!dot) continue;

            const color = dotColors[`${h}-${m}`] || '#000000';
            dot.classList.remove('filled', 'current');
            dot.style.backgroundColor = '';

            if (h < currentHour || (h === currentHour && m < currentDotIndex)) {
                dot.classList.add('filled');
                if (color !== '#000000') dot.style.backgroundColor = color;
            } else if (h === currentHour && m === currentDotIndex) {
                dot.classList.add('current');
                if (color !== '#000000') dot.style.backgroundColor = color;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
