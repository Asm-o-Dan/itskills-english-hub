// ITSkills English Hub Application Logic
let coursesData = null;
let currentCourseId = 'app-inventor';
let currentLessonNum = 4; // Default to Lesson 4 as requested

async function init() {
  try {
    const res = await fetch('data/courses.json');
    coursesData = await res.json();
    renderCourseNav();
    renderLessonNav();
    renderCards(currentLessonNum);
  } catch (err) {
    console.error('Failed to load courses data:', err);
    document.getElementById('cardsContainer').innerHTML = 
      '<div style="color: #EF4444; text-align: center; padding: 2rem;">Ошибка загрузки словаря. Проверьте соединение.</div>';
  }
}

function renderCourseNav() {
  const container = document.getElementById('courseSelector');
  if (!container || !coursesData) return;
  
  container.innerHTML = coursesData.courses.map(course => `
    <button class="course-btn ${course.id === currentCourseId ? 'active' : ''}" onclick="selectCourse('${course.id}')">
      <span>${course.icon}</span> ${course.title}
    </button>
  `).join('');
}

function selectCourse(courseId) {
  currentCourseId = courseId;
  currentLessonNum = 1;
  renderCourseNav();
  renderLessonNav();
  renderCards(currentLessonNum);
}

function renderLessonNav() {
  const container = document.getElementById('lessonNav');
  if (!container || !coursesData) return;

  const course = coursesData.courses.find(c => c.id === currentCourseId);
  if (!course) return;

  container.innerHTML = course.lessons.map(l => `
    <button class="lesson-pill ${l.number === currentLessonNum ? 'active' : ''}" onclick="selectLesson(${l.number})">
      <span>Урок ${l.number}</span> • ${l.title}
    </button>
  `).join('');
}

function selectLesson(num) {
  currentLessonNum = num;
  renderLessonNav();
  renderCards(num);
  // Auto scroll to cards on mobile
  document.getElementById('activeLessonHeader').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCards(lessonNum) {
  const course = coursesData.courses.find(c => c.id === currentCourseId);
  if (!course) return;

  const lesson = course.lessons.find(l => l.number === lessonNum);
  if (!lesson) return;

  // Update header
  document.getElementById('lessonTitle').textContent = `Урок ${lesson.number}: ${lesson.title}`;
  document.getElementById('lessonSubtitle').textContent = lesson.subtitle;
  document.getElementById('lessonWordCount').textContent = `${lesson.words.length} IT-слов`;

  const container = document.getElementById('cardsContainer');
  container.innerHTML = lesson.words.map((w, index) => `
    <div class="card-container" onclick="toggleCard(this)" id="card-${index}">
      <div class="card-inner">
        <!-- FRONT -->
        <div class="card-front">
          <div class="card-badge">Слово ${index + 1}</div>
          <div class="card-main-word">
            <h4 class="term-title">${w.term}</h4>
            <div class="transcription">${w.transcription}</div>
            <button class="audio-btn" title="Послушать произношение" onclick="speakWord(event, '${w.term}')">
              🔊
            </button>
          </div>
          <div class="card-hint">Нажми, чтобы перевернуть ↷</div>
        </div>

        <!-- BACK -->
        <div class="card-back">
          <div class="card-badge" style="background:#065F46; color:#A7F3D0;">Перевод</div>
          <div class="translation-title">${w.translation}</div>
          <div class="definition-box">${w.definition}</div>
          <div class="block-box">
            <span>В блоках App Inventor:</span>
            <div class="block-code">${w.block}</div>
          </div>
          <div class="card-hint" style="text-align: right; margin-top: 8px;">Нажми, чтобы вернуть ↶</div>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleCard(el) {
  el.classList.toggle('is-flipped');
}

function speakWord(e, word) {
  e.stopPropagation(); // Don't flip card on audio button click
  if (!('speechSynthesis' in window)) {
    alert('Синтез речи не поддерживается данным браузером.');
    return;
  }
  window.speechSynthesis.cancel(); // Stop ongoing speech
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.85; // Slightly slower for kids 9-10 yo to hear clear phonetics
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

document.addEventListener('DOMContentLoaded', init);
