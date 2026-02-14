// Telegram init (не критично, но красиво)
const tg = window.Telegram?.WebApp;
const tgstatus = document.getElementById("tgstatus");
if (!tg) {
  tgstatus.textContent = "Не Telegram";
} else {
  tgstatus.textContent = "Telegram";
  tg.ready();
  tg.expand();
}

// Wheel setup
const values = [2,4,6,8,10,12,14,16]; // 8 секций
const segCount = values.length;
const segAngle = 360 / segCount;

const wheelEl = document.getElementById("wheel");
const labelsEl = document.getElementById("labels");
const spinBtn = document.getElementById("spin");

// Modal
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("close");
const winN = document.getElementById("winN");
const winText = document.getElementById("winText");

// Render labels around wheel (визуально)
(function renderLabels(){
  // ставим цифры по центру каждого сектора, радиусом внутрь
  const r = 112; // радиус текста от центра
  values.forEach((v, i) => {
    const angle = (i * segAngle) + segAngle/2; // центр сектора (в градусах от 0)
    const rad = (angle - 90) * Math.PI / 180;  // -90 чтобы 0° был сверху
    const x = Math.cos(rad) * r;
    const y = Math.sin(rad) * r;

    const d = document.createElement("div");
    d.className = "label";
    d.textContent = String(v);

    // Переносим к центру и смещаем на (x,y)
    d.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    labelsEl.appendChild(d);
  });
})();

let isSpinning = false;
let currentRotation = 0; // накопленная ротация (чтобы каждый раз крутилось дальше)

function pickRandomStopRotation() {
  // Чтобы выглядело реалистично: 4–7 полных оборотов + случайный угол
  const fullTurns = 4 + Math.floor(Math.random() * 4); // 4..7
  const randomAngle = Math.random() * 360;             // 0..359.999
  return fullTurns * 360 + randomAngle;
}

function getWinnerValue(finalRotationDeg) {
  // Указатель сверху (0°). Колесо крутится по часовой стрелке.
  // Нужно понять, какой сектор оказался под указателем.
  // Итоговый угол колеса: rotation (по часовой).
  // Сектор под указателем соответствует углу (360 - (rotation % 360)) относительно исходной разметки.
  const rot = ((finalRotationDeg % 360) + 360) % 360;
  const pointerAngle = (360 - rot) % 360;

  const index = Math.floor(pointerAngle / segAngle); // 0..7
  return values[index];
}

function openModal(n) {
  winN.textContent = String(n);
  winText.textContent = `Забери свои ${n} поцелуев у своего принца 👑💋`;
  overlay.classList.add("show");
}

function closeModal() {
  overlay.classList.remove("show");
}

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

spinBtn.addEventListener("click", () => {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;

  const addRot = pickRandomStopRotation();
  currentRotation += addRot;

  // Запускаем анимацию (CSS transition уже задан)
  wheelEl.style.transform = `rotate(${currentRotation}deg)`;

  // Время должно совпадать с transition в CSS (4.2s)
  const durationMs = 4200;

  setTimeout(() => {
    const n = getWinnerValue(currentRotation);
    openModal(n);

    isSpinning = false;
    spinBtn.disabled = false;
  }, durationMs + 40);
});
