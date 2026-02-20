let currentEditingHour = null;
let hourColors = {};

function init() {
    loadColors();
    setupColorPicker();

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
        label.onclick = () => openColorPicker(h);
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
        // Force reset to black as requested
        for (let h = 0; h < 24; h++) {
            hourColors[h] = '#000000';
        }
        saveColors();
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

function setupColorPicker() {
    const picker = document.getElementById('hour-color-picker');
    picker.addEventListener('input', (e) => {
        if (currentEditingHour !== null) {
            hourColors[currentEditingHour] = e.target.value;
            applyColorsToHour(currentEditingHour);
        }
    });

    picker.addEventListener('change', () => {
        saveColors();
    });
}

function openColorPicker(hour) {
    currentEditingHour = hour;
    const picker = document.getElementById('hour-color-picker');
    picker.value = hourColors[hour];
    picker.click();
}

function applyColorsToHour(h) {
    const color = hourColors[h];
    for (let m = 0; m < 6; m++) {
        const dot = document.getElementById(`dot-${h}-${m}`);
        if (dot && (dot.classList.contains('filled') || dot.classList.contains('current'))) {
            dot.style.backgroundColor = color;
        } else if (dot) {
            dot.style.backgroundColor = ''; // Reset to CSS default for inactive
        }
    }
}

function updateClock() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDotIndex = Math.floor(currentMinute / 10);

    // Update date display (Korean format: 2026, 2, 20, 금)
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const dateStr = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. (${weekDays[now.getDay()]})`;
        dateDisplay.textContent = dateStr;
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
