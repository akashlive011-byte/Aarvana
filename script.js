// Inject CSS
const style = document.createElement("style");
style.innerHTML = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', sans-serif;
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
    overflow: hidden;
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
    animation: fadeIn 1s ease;
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
