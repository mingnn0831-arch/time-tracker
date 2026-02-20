let currentEditingHour = null;
let hourColors = {};

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

    const col1 = document.getElementById('col-1');
    const col2 = document.getElementById('col-2');
    col1.innerHTML = '';
    col2.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        const row = document.createElement('div');
        row.className = 'hour-row';

        const label = document.createElement('div');
        label.className = 'hour-label';
        label.id = `label-${h}`;
        label.textContent = h.toString().padStart(2, '0');
        label.title = 'Click to change color';
        label.onclick = (e) => {
            e.stopPropagation();
            openPalette(h);
        };
        row.appendChild(label);

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-container';

        for (let m = 0; m < 6; m++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.id = `dot-${h}-${m}`;
            dotsContainer.appendChild(dot);
        }

        row.appendChild(dotsContainer);

        if (h < 12) {
            col1.appendChild(row);
        } else {
            col2.appendChild(row);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function loadColors() {
    const saved = localStorage.getItem('hourColors');
    if (saved) {
        hourColors = JSON.parse(saved);
    } else {
        // Default color: Black
        for (let h = 0; h < 24; h++) {
            hourColors[h] = '#000000';
        }
        saveColors();
    }
}

function saveColors() {
    localStorage.setItem('hourColors', JSON.stringify(hourColors));
}

function setupPalette() {
    const grid = document.getElementById('color-grid');
    const closeBtn = document.getElementById('palette-close');
    const overlay = document.getElementById('palette-overlay');

    // Populate colors
    PALETTE_COLORS.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.onclick = () => selectColor(color);
        grid.appendChild(swatch);
    });

    closeBtn.onclick = closePalette;
    overlay.onclick = (e) => {
        if (e.target === overlay) closePalette();
    };
}

function setupConfirmModal() {
    const resetBtn = document.getElementById('reset-colors-btn');
    const modal = document.getElementById('confirm-modal');
    const cancelBtn = document.getElementById('confirm-cancel');
    const confirmResetBtn = document.getElementById('confirm-reset');

    resetBtn.onclick = () => {
        modal.classList.add('active');
    };

    cancelBtn.onclick = () => {
        modal.classList.remove('active');
    };

    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };

    confirmResetBtn.onclick = () => {
        resetAllColors();
        modal.classList.remove('active');
    };
}

function resetAllColors() {
    for (let h = 0; h < 24; h++) {
        hourColors[h] = '#000000';
    }
    saveColors();
    updateClock();
}

function openPalette(hour) {
    currentEditingHour = hour;
    const overlay = document.getElementById('palette-overlay');
    const title = document.getElementById('palette-title');
    title.textContent = `${hour}시 색상 선택`;

    // Highlight current color
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        const isCurrent = swatch.style.backgroundColor === hexToRgb(hourColors[hour]);
        swatch.classList.toggle('active', isCurrent);
    });

    overlay.classList.add('active');
}

function closePalette() {
    const overlay = document.getElementById('palette-overlay');
    overlay.classList.remove('active');
    currentEditingHour = null;
}

function selectColor(color) {
    if (currentEditingHour !== null) {
        hourColors[currentEditingHour] = color;
        saveColors();
        updateClock(); // Refresh UI
        closePalette();
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

function updateClock() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDotIndex = Math.floor(currentMinute / 10);

    // Update date display (Korean format: 2026. 2. 20. (금))
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${weekDays[now.getDay()]}`;
        dateDisplay.textContent = dateStr;
    }

    // Update daily progress bar
    const progressFill = document.getElementById('daily-progress');
    const progressText = document.getElementById('progress-info');
    if (progressFill) {
        const totalSecondsInDay = 24 * 60 * 60;
        const elapsedSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        const progressPercent = (elapsedSeconds / totalSecondsInDay) * 100;
        progressFill.style.width = `${Math.min(progressPercent, 100)}%`;

        if (progressText) {
            progressText.textContent = `오늘이 ${progressPercent.toFixed(1)}% 진행되었습니다.`;
        }
    }

    for (let h = 0; h < 24; h++) {
        const label = document.getElementById(`label-${h}`);
        if (label) {
            label.classList.toggle('current-hour', h === currentHour);
        }

        const color = hourColors[h];
        for (let m = 0; m < 6; m++) {
            const dot = document.getElementById(`dot-${h}-${m}`);
            if (!dot) continue;

            dot.classList.remove('filled', 'current');
            dot.style.backgroundColor = '';

            if (h < currentHour) {
                dot.classList.add('filled');
                dot.style.backgroundColor = color;
            } else if (h === currentHour) {
                if (m < currentDotIndex) {
                    dot.classList.add('filled');
                    dot.style.backgroundColor = color;
                } else if (m === currentDotIndex) {
                    dot.classList.add('current');
                    dot.style.backgroundColor = color;
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
