/* =========================================
   GLOBAL VARIABLES
   Store calculated time here to pass between tabs
   ========================================= */
let calculatedHours = 0;
let calculatedMinutes = 0;

/* =========================================
   INITIALIZATION
   Runs automatically when the page loads
   ========================================= */
window.onload = function() {
    // Set the "Plugged In At" input to the current real time
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // Finds the input with ID 'start-time' and sets value
    const timeInput = document.getElementById('start-time');
    if (timeInput) {
        timeInput.value = `${hours}:${minutes}`;
    }
};

/* =========================================
   TAB SWITCHING LOGIC
   Handles switching between "TTC Calc" and "Alarm"
   ========================================= */
function switchTab(tabId) {
    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 2. Remove 'active' style from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show the selected tab content
    document.getElementById(tabId).classList.add('active');
    
    // 4. Highlight the correct button
    // (Simple logic: if tabId is 'ttc-tab', highlight the first button, else the second)
    const buttons = document.querySelectorAll('.tab-btn');
    if(tabId === 'ttc-tab') {
        buttons[0].classList.add('active');
    } else {
        buttons[1].classList.add('active');
    }
}

/* =========================================
   FEATURE 1: TTC CALCULATOR
   Logic: Battery % -> Time Remaining
   Updated Base: 0-100% takes 5 Hours
   ========================================= */
function calculateTTC() {
    const batteryPercent = parseInt(document.getElementById('battery-percent').value);

    // Validation: Ensure user entered a real number between 0 and 100
    if (isNaN(batteryPercent) || batteryPercent < 0 || batteryPercent > 100) {
        alert("Please enter a valid battery percentage (0-100).");
        return;
    }

    // --- NEW LOGIC (5 HOURS) ---
    // Full charge (0% to 100%) = 5 Hours = 300 Minutes.
    // Therefore: 1% charge = 3 minutes.
    
    const remainingPercent = 100 - batteryPercent;
    const totalMinutesNeeded = remainingPercent * 3; 

    // Convert total minutes into Hours and Minutes
    calculatedHours = Math.floor(totalMinutesNeeded / 60);
    calculatedMinutes = Math.round(totalMinutesNeeded % 60);

    // Display the result
    const resultDiv = document.getElementById('ttc-result');
    const display = document.getElementById('calculated-ttc');
    
    resultDiv.classList.remove('hidden');
    display.innerText = `${calculatedHours} hr ${calculatedMinutes} min`;
}

/* =========================================
   HELPER: COPY TO ALARM
   Moves the result from TTC Calc to the Alarm inputs
   ========================================= */
function copyToAlarm() {
    // Take the global calculated values and put them into the alarm inputs
    document.getElementById('ttc-hours').value = calculatedHours;
    document.getElementById('ttc-minutes').value = calculatedMinutes;
    
    // Automatically switch to the Alarm tab so the user can see it
    switchTab('alarm-tab');
}

/* =========================================
   FEATURE 2: ALARM CALCULATOR
   Logic: Start Time + Duration = End Time
   ========================================= */
function calculateAlarm() {
    // Get values from inputs (default to 0 if empty)
    const ttcHours = parseInt(document.getElementById('ttc-hours').value) || 0;
    const ttcMinutes = parseInt(document.getElementById('ttc-minutes').value) || 0;
    const startTimeInput = document.getElementById('start-time').value;

    if (!startTimeInput) {
        alert("Please ensure the 'Plugged In At' time is set.");
        return;
    }

    // Create a Date object starting at the user's selected time
    const [startHours, startMins] = startTimeInput.split(':').map(Number);
    const alarmDate = new Date();
    alarmDate.setHours(startHours);
    alarmDate.setMinutes(startMins);

    // Add the TTC duration to that time
    alarmDate.setHours(alarmDate.getHours() + ttcHours);
    alarmDate.setMinutes(alarmDate.getMinutes() + ttcMinutes);

    // Format the output for display (12-hour AM/PM format)
    let endHours = alarmDate.getHours();
    const endMinutes = String(alarmDate.getMinutes()).padStart(2, '0');
    const ampm = endHours >= 12 ? 'PM' : 'AM';
    
    // Convert 24h to 12h clock
    endHours = endHours % 12;
    endHours = endHours ? endHours : 12; // Handle midnight/noon (0 becomes 12)

    // Show the result
    const resultDiv = document.getElementById('alarm-result');
    const alarmDisplay = document.getElementById('alarm-time');
    const dateNote = document.getElementById('date-note');

    resultDiv.classList.remove('hidden');
    alarmDisplay.innerText = `${endHours}:${endMinutes} ${ampm}`;

    // Smart Date Check: Is the alarm for today or tomorrow?
    const now = new Date();
    now.setHours(startHours, startMins);
    
    if (alarmDate.getDate() !== now.getDate()) {
        dateNote.innerText = "(Note: This is tomorrow)";
    } else {
        dateNote.innerText = "(Today)";
    }
}
