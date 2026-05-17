// Create style dynamically
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
