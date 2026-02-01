const courses = [
    { name: "Electronique de Puissance 1", credit: 5, hasTD: true, hasTP: true },
    { name: "Gisement Energétiques Renouvelables", credit: 3, hasTD: false, hasTP: true },
    { name: "Logique combinatoire et séquentielle", credit: 4, hasTD: false, hasTP: true },
    { name: "Machines Electriques 1", credit: 4, hasTD: true, hasTP: true },
    { name: "Mécanique des fluides approfondis", credit: 5, hasTD: true, hasTP: false },
    { name: "Reverse engineering", credit: 1, hasTD: false, hasTP: false },
    { name: "English", credit: 1, hasTD: false, hasTP: false },
    { name: "Sciences des Matériaux", credit: 1, hasTD: false, hasTP: false },
    { name: "Thermodynamique appliquée", credit: 5, hasTD: true, hasTP: false }
];

const coursesContainer = document.getElementById('courses-container');
const calculateBtn = document.getElementById('calculate-btn');
const resultModal = document.getElementById('result-modal');
const averageValue = document.getElementById('average-value');
const averageMessage = document.getElementById('average-message');
const closeBtn = document.querySelector('.close-btn');

// Generate Course Inputs
function renderCourses() {
    coursesContainer.innerHTML = '';
    courses.forEach((course, index) => {
        const card = document.createElement('div');
        card.classList.add('course-card');

        let inputsHtml = `
            <div class="input-group">
                <label>Exam ( /20)</label>
                <input type="number" min="0" max="20" step="0.01" class="grade-input" data-type="exam" data-index="${index}" placeholder="0">
            </div>
        `;

        if (course.hasTD) {
            inputsHtml += `
            <div class="input-group">
                <label>TD ( /20)</label>
                <input type="number" min="0" max="20" step="0.01" class="grade-input" data-type="td" data-index="${index}" placeholder="0">
            </div>
            `;
        }

        if (course.hasTP) {
            inputsHtml += `
            <div class="input-group">
                <label>TP ( /20)</label>
                <input type="number" min="0" max="20" step="0.01" class="grade-input" data-type="tp" data-index="${index}" placeholder="0">
            </div>
            `;
        }

        card.innerHTML = `
            <div class="course-header">
                <span class="course-name">${course.name}</span>
                <span class="course-credit">Coef: ${course.credit}</span>
            </div>
            ${inputsHtml}
        `;
        coursesContainer.appendChild(card);
    });
}

function calculateAverage() {
    let totalPoints = 0;
    let totalCredits = 0;
    let allValid = true;
    let moduleAverages = [];

    courses.forEach((course, index) => {
        const inputs = document.querySelectorAll(`.grade-input[data-index="${index}"]`);
        let grades = { exam: 0, td: 0, tp: 0 };

        inputs.forEach(input => {
            const val = parseFloat(input.value);
            if (isNaN(val) || val < 0 || val > 20) {
                // Treat empty or invalid as 0, but maybe warn? 
                // For now, treat empty as 0.
                grades[input.dataset.type] = isNaN(val) ? 0 : Math.min(Math.max(val, 0), 20); // Clamp 0-20
            } else {
                grades[input.dataset.type] = val;
            }
        });

        let courseAverage = 0;

        if (course.hasTD && course.hasTP) {
            // Exam 60%, (TD+TP)/2 40%
            const others = (grades.td + grades.tp) / 2;
            courseAverage = (grades.exam * 0.6) + (others * 0.4);
        } else if (course.hasTD) {
            // Exam 60%, TD 40%
            courseAverage = (grades.exam * 0.6) + (grades.td * 0.4);
        } else if (course.name == "Gisement Energétiques Renouvelables" || course.name === "Logique combinatoire et séquentielle") {
            // Exam 50%, TD 50%
            courseAverage = (grades.exam * 0.5) + (grades.td * 0.5);
        }
        else {
            // Exam 100%
            courseAverage = grades.exam;
        }

        // Store module average
        moduleAverages.push({
            name: course.name,
            average: courseAverage,
            credit: course.credit
        });

        totalPoints += courseAverage * course.credit;
        totalCredits += course.credit;
    });

    const finalAverage = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    displayResult(finalAverage, moduleAverages);
}

function displayResult(average, moduleAverages) {
    averageValue.textContent = average.toFixed(2);

    if (average >= 10) {
        averageMessage.textContent = "Congratulations! You passed!";
        averageMessage.style.color = "#4ade80";
    } else {
        averageMessage.textContent = "Keep working hard, you can do it!";
        averageMessage.style.color = "#fb7185"; // soft red
    }

    // Display module averages
    let moduleAveragesHtml = '<div class="module-averages"><h3>Module Averages</h3>';
    moduleAverages.forEach(module => {
        const color = module.average >= 10 ? '#4ade80' : '#fb7185';
        moduleAveragesHtml += `
            <div class="module-average-item">
                <span class="module-name">${module.name}</span>
                <span class="module-score" style="color: ${color}">${module.average.toFixed(2)} / 20</span>
            </div>
        `;
    });
    moduleAveragesHtml += '</div>';

    // Insert module averages after message
    const modalContent = document.querySelector('.modal-content');
    const existingAverages = modalContent.querySelector('.module-averages');
    if (existingAverages) {
        existingAverages.remove();
    }

    const messageElement = document.getElementById('average-message');
    messageElement.insertAdjacentHTML('afterend', moduleAveragesHtml);

    resultModal.classList.remove('hidden');
}

// Event Listeners
calculateBtn.addEventListener('click', calculateAverage);

closeBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
});

resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        resultModal.classList.add('hidden');
    }
});

// Initialize
renderCourses();
