document.addEventListener("DOMContentLoaded", function () {

  // STYLE
  const style = document.createElement("style");
  style.innerHTML = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }

    body {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(-45deg, #0f172a, #1e293b, #0f172a);
      background-size: 400% 400%;
      animation: bgMove 10s ease infinite;
      color: white;
    }

    @keyframes bgMove {
      0% {background-position: 0% 50%;}
      50% {background-position: 100% 50%;}
      100% {background-position: 0% 50%;}
    }

    .card {
      text-align: center;
      padding: 40px;
      border-radius: 20px;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      max-width: 500px;
    }

    h1 {
      font-size: 30px;
      margin-bottom: 10px;
    }

    p {
      opacity: 0.8;
      margin-bottom: 20px;
    }

    .timer {
      font-size: 22px;
      font-weight: bold;
      color: #22c55e;
    }

    .badge {
      margin-top: 15px;
      display: inline-block;
      padding: 6px 12px;
      background: #22c55e;
      border-radius: 50px;
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);

  // SET 2 DAYS TIMER
  const launchTime = new Date();
  launchTime.setDate(launchTime.getDate() + 2);

  // CREATE UI
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h1>🚀 Website Coming Soon</h1>
    <p>We will be live within 2 days</p>
    <div class="timer" id="timer">Loading...</div>
    <div class="badge">Under Development</div>
  `;

  document.body.appendChild(card);

  // TIMER
  function updateTimer() {
    const now = new Date().getTime();
    const distance = launchTime - now;

    if (distance <= 0) {
      document.getElementById("timer").innerText = "WE ARE LIVE!";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    document.getElementById("timer").innerText =
      `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);

});    animation: fadeIn 1s ease;
  }

  @keyframes fadeIn {
    from {opacity: 0; transform: scale(0.9);}
    to {opacity: 1; transform: scale(1);}
  }

  h1 {
    font-size: 32px;
    margin-bottom: 10px;
  }

  p {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 20px;
  }

  .timer {
    font-size: 22px;
    font-weight: bold;
    margin-top: 10px;
    color: #22c55e;
  }

  .badge {
    margin-top: 20px;
    display: inline-block;
    padding: 6px 12px;
    background: #22c55e;
    border-radius: 50px;
    font-size: 12px;
  }
`;
document.head.appendChild(style);

// Set launch time (2 days from now)
const now = new Date();
const launchTime = new Date();
launchTime.setDate(now.getDate() + 2);

// Create UI
const card = document.createElement("div");
card.className = "card";

card.innerHTML = `
  <h1>🚀 Coming Soon</h1>
  <p>Our website will be live within 2 days.</p>
  <div class="timer" id="timer">Loading countdown...</div>
  <div class="badge">Stay Tuned</div>
`;

document.body.appendChild(card);

// Countdown logic
function updateTimer() {
  const now = new Date().getTime();
  const distance = launchTime - now;

  if (distance <= 0) {
    document.getElementById("timer").innerText = "We are LIVE NOW!";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("timer").innerText =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateTimer, 1000);
updateTimer();    animation: fadeIn 1s ease;
  }

  @keyframes fadeIn {
    from {opacity: 0; transform: scale(0.9);}
    to {opacity: 1; transform: scale(1);}
  }

  /* LOGO ANIMATION */
  .logo {
    width: 90px;
    height: 90px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background: linear-gradient(45deg, #22c55e, #06b6d4, #3b82f6);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 28px;
    color: white;
    box-shadow: 0 0 25px rgba(34,197,94,0.6);
    animation: float 3s ease-in-out infinite, glow 2s infinite alternate;
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  @keyframes glow {
    from { box-shadow: 0 0 15px rgba(34,197,94,0.4); }
    to { box-shadow: 0 0 35px rgba(59,130,246,0.8); }
  }

  h1 {
    font-size: 28px;
    margin-bottom: 15px;
    letter-spacing: 1px;
  }

  p {
    font-size: 16px;
    opacity: 0.8;
    line-height: 1.5;
  }

  .dot::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0% {content: '';}
    25% {content: '.';}
    50% {content: '..';}
    75% {content: '...';}
  }

  .badge {
    margin-top: 20px;
    display: inline-block;
    padding: 6px 12px;
    background: #22c55e;
    border-radius: 50px;
    font-size: 12px;
  }
`;

document.head.appendChild(style);

// Create UI
const card = document.createElement("div");
card.className = "card";

// LOGO (animated)
const logo = document.createElement("div");
logo.className = "logo";
logo.innerText = "A"; // change to your brand letter/logo

card.appendChild(logo);

// CONTENT
card.innerHTML += `
  <h1>Website Under Development <span class="dot"></span></h1>
  <p>
    We are building something amazing for you.<br>
    Please check back soon!
  </p>
  <div class="badge">Coming Soon</div>
`;

document.body.appendChild(card);    animation: fadeIn 1s ease;
  }

  @keyframes fadeIn {
    from {opacity: 0; transform: scale(0.9);}
    to {opacity: 1; transform: scale(1);}
  }

  h1 {
    font-size: 32px;
    margin-bottom: 15px;
    letter-spacing: 1px;
  }

  p {
    font-size: 16px;
    opacity: 0.8;
    line-height: 1.5;
  }

  .dot::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0% {content: '';}
    25% {content: '.';}
    50% {content: '..';}
    75% {content: '...';}
  }

  .badge {
    margin-top: 20px;
    display: inline-block;
    padding: 6px 12px;
    background: #22c55e;
    border-radius: 50px;
    font-size: 12px;
  }
`;
document.head.appendChild(style);

// Create content
const card = document.createElement("div");
card.className = "card";

card.innerHTML = `
  <h1>Website Under Development <span class="dot"></span></h1>
  <p>
    We are building something amazing for you.<br>
    Please check back soon!
  </p>
  <div class="badge">Coming Soon</div>
`;

document.body.appendChild(card);
