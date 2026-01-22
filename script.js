// Global variables to store calculated time so we can pass it between tabs
let calculatedHours = 0;
let calculatedMinutes = 0;

window.onload = function () {
    // Set current time automatically on load
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('start-time').value = `${hours}:${minutes}`;
};

// --- TAB LOGIC ---
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab and activate button
    document.getElementById(tabId).classList.add('active');

    // Highlight the button that was clicked (finding it by the onclick attribute is a quick hack, 
    // but here we just loop through buttons to find the matching one)
    const buttons = document.querySelectorAll('.tab-btn');
    if (tabId === 'ttc-tab') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

// --- LOGIC 1: TTC Calculator (Battery % -> Time) ---
function calculateTTC() {
    const batteryPercent = parseInt(document.getElementById('battery-percent').value);

    if (isNaN(batteryPercent) || batteryPercent < 0 || batteryPercent > 100) {
        alert("Please enter a valid battery percentage (0-100).");
        return;
    }

    // FORMULA: 
    // 100% charge takes 6 hours (360 minutes).
    // Therefore, 1% takes 3.6 minutes.
    const remainingPercent = 100 - batteryPercent;
    const totalMinutesNeeded = remainingPercent * 3.6;

    // Convert total minutes to Hours and Minutes
    calculatedHours = Math.floor(totalMinutesNeeded / 60);
    calculatedMinutes = Math.round(totalMinutesNeeded % 60);

    // Display result
    const resultDiv = document.getElementById('ttc-result');
    const display = document.getElementById('calculated-ttc');

    resultDiv.classList.remove('hidden');
    display.innerText = `${calculatedHours} hr ${calculatedMinutes} min`;
}

// Helper: Move the calculated time to the Alarm tab
function copyToAlarm() {
    document.getElementById('ttc-hours').value = calculatedHours;
    document.getElementById('ttc-minutes').value = calculatedMinutes;

    // Switch to alarm tab automatically
    switchTab('alarm-tab');
}

// --- LOGIC 2: Alarm Calculator (Time -> Unplug Clock) ---
function calculateAlarm() {
    const ttcHours = parseInt(document.getElementById('ttc-hours').value) || 0;
    const ttcMinutes = parseInt(document.getElementById('ttc-minutes').value) || 0;
    const startTimeInput = document.getElementById('start-time').value;

    if (!startTimeInput) {
        alert("Please set the plug-in time.");
        return;
    }

    const [startHours, startMins] = startTimeInput.split(':').map(Number);
    const alarmDate = new Date();
    alarmDate.setHours(startHours);
    alarmDate.setMinutes(startMins);

    // Add TTC to Start Time
    alarmDate.setHours(alarmDate.getHours() + ttcHours);
    alarmDate.setMinutes(alarmDate.getMinutes() + ttcMinutes);

    // Format output
    let endHours = alarmDate.getHours();
    const endMinutes = String(alarmDate.getMinutes()).padStart(2, '0');
    const ampm = endHours >= 12 ? 'PM' : 'AM';

    endHours = endHours % 12;
    endHours = endHours ? endHours : 12;

    // Show result
    const resultDiv = document.getElementById('alarm-result');
    const alarmDisplay = document.getElementById('alarm-time');
    const dateNote = document.getElementById('date-note');

    resultDiv.classList.remove('hidden');
    alarmDisplay.innerText = `${endHours}:${endMinutes} ${ampm}`;

    // Check if tomorrow
    const now = new Date();
    now.setHours(startHours, startMins);
    if (alarmDate.getDate() !== now.getDate()) {
        dateNote.innerText = "(Tomorrow)";
    } else {
        dateNote.innerText = "(Today)";
    }
}
