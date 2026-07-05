"use strict";

/* =========================
   画像パス
========================= */

const IMG = {
  catKnight: "img/cat/cat_knight.png",
  mouseFighter: "img/mouse/mouse_fighter.png",
};

/* =========================
   ゲーム状態
========================= */

const state = {
  kingdomLevel: 1,

  resources: {
    food: 0,
    wood: 0,
    stone: 0,
  },

  villagers: 3,
  warriors: 3,

  farmUnlocked: false,
};

/* =========================
   画面切り替え
========================= */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
}

/* =========================
   表示更新
========================= */

function renderHome() {
  document.getElementById("foodText").textContent = state.resources.food;
  document.getElementById("woodText").textContent = state.resources.wood;
  document.getElementById("stoneText").textContent = state.resources.stone;

  document.getElementById("villagerText").textContent = state.villagers;
  document.getElementById("warriorText").textContent = state.warriors;

  document.getElementById("farmStatusText").textContent =
    state.farmUnlocked ? "奪還済み" : "未奪還";
}

/* =========================
   戦闘
========================= */

let battle = null;

function startFarmBattle() {
  battle = {
    playerSent: 0,
    enemyHp: 12,
    enemyAlive: true,
    victory: false,
  };

  document.getElementById("catUnits").innerHTML = "";
  document.getElementById("mouseUnits").innerHTML = "";

  document.getElementById("battleMessage").textContent =
    "戦士ネコを出撃させよう！";

  document.getElementById("sendWarriorBtn").disabled = false;

  spawnMouse();

  showScreen("battleScreen");
}

function spawnMouse() {
  const mouse = document.createElement("img");
  mouse.src = IMG.mouseFighter;
  mouse.className = "unit mouseUnit";
  mouse.style.right = "260px";
  mouse.style.bottom = "0px";
  mouse.dataset.hp = "12";

  document.getElementById("mouseUnits").appendChild(mouse);
}

function sendWarrior() {
  if (!battle || battle.victory) return;

  if (state.warriors <= 0) {
    document.getElementById("battleMessage").textContent =
      "出撃できる戦士ネコがいません！";
    return;
  }

  state.warriors--;
  battle.playerSent++;

  renderHome();

  const cat = document.createElement("img");
  cat.src = IMG.catKnight;
  cat.className = "unit catUnit";
  cat.style.left = "220px";
  cat.style.bottom = `${battle.playerSent * 8}px`;
  cat.dataset.attack = "4";

  document.getElementById("catUnits").appendChild(cat);

  moveCat(cat);
}

function moveCat(cat) {
  let x = 220;

  const timer = setInterval(() => {
    if (!battle || battle.victory) {
      clearInterval(timer);
      return;
    }

    x += 6;
    cat.style.left = `${x}px`;

    const mouse = document.querySelector(".mouseUnit");

    if (!mouse) {
      clearInterval(timer);
      return;
    }

    const catRect = cat.getBoundingClientRect();
    const mouseRect = mouse.getBoundingClientRect();

    if (catRect.right >= mouseRect.left + 20) {
      clearInterval(timer);
      attackMouse(cat, mouse);
    }
  }, 30);
}

function attackMouse(cat, mouse) {
  const damage = Number(cat.dataset.attack);
  let hp = Number(mouse.dataset.hp);

  hp -= damage;
  mouse.dataset.hp = String(hp);

  document.getElementById("battleMessage").textContent =
    `戦士ネコの攻撃！ ネズミ残りHP ${Math.max(hp, 0)}`;

  cat.style.transform = "translateX(12px)";

  setTimeout(() => {
    cat.style.transform = "translateX(0)";
  }, 120);

  if (hp <= 0) {
    defeatMouse(mouse);
  } else {
    setTimeout(() => {
      moveCat(cat);
    }, 350);
  }
}

function defeatMouse(mouse) {
  battle.enemyAlive = false;
  battle.victory = true;

  mouse.style.opacity = "0.3";
  mouse.style.transform = "rotate(90deg)";

  document.getElementById("battleMessage").textContent =
    "見張ネズミを撃破！ カリカリ農園を奪還！";

  document.getElementById("sendWarriorBtn").disabled = true;

  setTimeout(() => {
    clearBattleAndWin();
  }, 1200);
}

function clearBattleAndWin() {
  state.farmUnlocked = true;

  showScreen("resultScreen");
}

/* =========================
   結果処理
========================= */

function claimFarmReward() {
  if (state.farmUnlocked && state.resources.food === 0) {
    state.resources.food += 50;
  }

  renderHome();
  showScreen("homeScreen");
}

/* =========================
   イベント登録
========================= */

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", () => {
    renderHome();
    showScreen("homeScreen");
  });

  document.getElementById("mapBtn").addEventListener("click", () => {
    showScreen("mapScreen");
  });

  document.getElementById("backHomeBtn").addEventListener("click", () => {
    renderHome();
    showScreen("homeScreen");
  });

  document.getElementById("farmBattleBtn").addEventListener("click", () => {
    if (state.farmUnlocked) {
      alert("カリカリ農園はすでに奪還済みです！");
      return;
    }

    startFarmBattle();
  });

  document.getElementById("sendWarriorBtn").addEventListener("click", () => {
    sendWarrior();
  });

  document.getElementById("resultHomeBtn").addEventListener("click", () => {
    claimFarmReward();
  });

  renderHome();
});
