const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ضبط حجم اللوحة
canvas.width = 800;
canvas.height = 600;

// تحميل الأصوات
const sounds = {
    shoot: new Audio('audio/shoot.mp3'),
    enemyShoot: new Audio('audio/enemyShoot.mp3'),
    playerDeath: new Audio('audio/playerDeath.mp3'),
    enemyDeath: new Audio('audio/enemyDeath.mp3')
};

// التحقق من تحميل الأصوات بنجاح
Object.keys(sounds).forEach(key => {
    sounds[key].addEventListener('error', () => {
        console.error(`خطأ في تحميل الصوت: ${key}`);
    });
});

// اللاعبون
let player1, player2, enemies, killCountPlayer1, killCountPlayer2;
const enemySize = 50;
const enemySpeed = 2;
const bulletSpeed = 7;
const enemyBulletSpeed = 3;

// إدخال المستخدم (المفاتيح)
const keys = {};
let isPaused = false;

// إعادة ضبط حالة اللعبة
function resetGame() {
    player1 = {
        x: canvas.width / 4 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        color: 'blue',
        speed: 5,
        bullets: []
    };
    
    player2 = {
        x: (canvas.width * 3) / 4 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        color: 'green',
        speed: 5,
        bullets: []
    };

    enemies = [];
    killCountPlayer1 = 0;
    killCountPlayer2 = 0;
    updateKillCounts(); // إعادة ضبط عدادات القتل
}

// إضافة حدث الاستماع للوحة المفاتيح
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// تحديث عدادات القتل
function updateKillCounts() {
    const killCountPlayer1Element = document.getElementById('killCountPlayer1');
    const killCountPlayer2Element = document.getElementById('killCountPlayer2');
    if (killCountPlayer1Element) {
        killCountPlayer1Element.innerText = `قتلات اللاعب 1: ${killCountPlayer1}`;
    } else {
        console.warn('لا يوجد عنصر لعداد القتل للاعب 1');
    }
    if (killCountPlayer2Element) {
        killCountPlayer2Element.innerText = `قتلات اللاعب 2: ${killCountPlayer2}`;
    } else {
        console.warn('لا يوجد عنصر لعداد القتل للاعب 2');
    }
}

// توليد الأعداء
function spawnEnemy() {
    const x = Math.random() * (canvas.width - enemySize);
    enemies.push({
        x,
        y: 0,
        width: enemySize,
        height: enemySize,
        color: 'red',
        bullets: [],
        fireCooldown: Math.random() * 200 + 100 // توقيت إطلاق النار العشوائي
    });
}

// تحريك الرصاص
function moveBullets(bullets, speed, isPlayer = true) {
    bullets.forEach((bullet, index) => {
        bullet.y += isPlayer ? -speed : speed;
        if (bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1); // حذف الرصاص الخارج من الشاشة
        }
    });
}

// إطلاق النار من الأعداء
function enemyFire(enemy) {
    enemy.bullets.push({
        x: enemy.x + enemy.width / 2 - 2.5,
        y: enemy.y + enemy.height,
        width: 5,
        height: 10,
        color: 'orange'
    });
    if (sounds.enemyShoot) sounds.enemyShoot.play(); // تشغيل صوت إطلاق النار للعدو
}

// التحقق من التصادم بين كائنين
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.height + obj1.y > obj2.y
    );
}

// إعادة تشغيل اللعبة
function restartGame() {
    alert("لقد خسرت! سيتم إعادة اللعبة...");
    if (sounds.playerDeath) sounds.playerDeath.play(); // تشغيل صوت موت اللاعب
    resetGame(); // إعادة ضبط حالة اللعبة
}

// تحديث حالة اللعبة
function update() {
    if (isPaused) return;

    // تحريك اللاعب 1
    if (keys['ArrowLeft'] && player1.x > 0) {
        player1.x -= player1.speed;
    }
    if (keys['ArrowRight'] && player1.x < canvas.width - player1.width) {
        player1.x += player1.speed;
    }

    // إطلاق الرصاص من اللاعب 1
    if (keys['Space']) {
        player1.bullets.push({
            x: player1.x + player1.width / 2 - 2.5,
            y: player1.y,
            width: 5,
            height: 10,
            color: 'yellow'
        });
        if (sounds.shoot) sounds.shoot.play(); // تشغيل صوت إطلاق النار للاعب 1
        keys['Space'] = false; // لمنع إطلاق مستمر
    }

    // تحريك اللاعب 2
    if (keys['KeyA'] && player2.x > 0) {
        player2.x -= player2.speed;
    }
    if (keys['KeyD'] && player2.x < canvas.width - player2.width) {
        player2.x += player2.speed;
    }

    // إطلاق الرصاص من اللاعب 2
    if (keys['KeyW']) {
        player2.bullets.push({
            x: player2.x + player2.width / 2 - 2.5,
            y: player2.y,
            width: 5,
            height: 10,
            color: 'purple'
        });
        if (sounds.shoot) sounds.shoot.play(); // تشغيل صوت إطلاق النار للاعب 2
        keys['KeyW'] = false; // لمنع إطلاق مستمر
    }

    // تحريك الرصاص
    moveBullets(player1.bullets, bulletSpeed);
    moveBullets(player2.bullets, bulletSpeed);

    // تحريك الأعداء
    enemies.forEach((enemy, index) => {
        enemy.y += enemySpeed;

        // العدو يطلق النار بشكل عشوائي
        if (enemy.fireCooldown <= 0) {
            enemyFire(enemy);
            enemy.fireCooldown = Math.random() * 200 + 100; // ضبط التوقيت مرة أخرى
        } else {
            enemy.fireCooldown--;
        }

        moveBullets(enemy.bullets, enemyBulletSpeed, false);

        // التحقق من الاصطدام بالرصاص
        player1.bullets.forEach((bullet, bulletIndex) => {
            if (checkCollision(bullet, enemy)) {
                enemies.splice(index, 1); // حذف العدو
                player1.bullets.splice(bulletIndex, 1); // حذف الرصاصة
                killCountPlayer1++; // زيادة عداد القتل للاعب 1
                updateKillCounts();
                if (sounds.enemyDeath) sounds.enemyDeath.play(); // تشغيل صوت موت العدو
            }
        });

        player2.bullets.forEach((bullet, bulletIndex) => {
            if (checkCollision(bullet, enemy)) {
                enemies.splice(index, 1); // حذف العدو
                player2.bullets.splice(bulletIndex, 1); // حذف الرصاصة
                killCountPlayer2++; // زيادة عداد القتل للاعب 2
                updateKillCounts();
                if (sounds.enemyDeath) sounds.enemyDeath.play(); // تشغيل صوت موت العدو
            }
        });

        // التحقق إذا العدو تخطى اللاعبين (خسارة)
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1); // حذف العدو
        }

        // التحقق من اصطدام الرصاص الخاص بالعدو باللاعبين
        enemy.bullets.forEach((bullet, bulletIndex) => {
            if (checkCollision(bullet, player1) || checkCollision(bullet, player2)) {
                restartGame(); // إعادة تشغيل اللعبة
            }
        });

        // التحقق من اصطدام الأعداء باللاعبين
        if (checkCollision(enemy, player1) || checkCollision(enemy, player2)) {
            restartGame(); // إعادة تشغيل اللعبة
        }
    });
}

// رسم العناصر
function draw() {
    // مسح اللوحة
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // رسم اللاعب 1
    ctx.fillStyle = player1.color;
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);

    // رسم الرصاص من اللاعب 1
    player1.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // رسم اللاعب 2
    ctx.fillStyle = player2.color;
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

    // رسم الرصاص من اللاعب 2
    player2.bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // رسم الأعداء والرصاص الخاص بهم
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        enemy.bullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    });
}

// تحديث وإعادة رسم اللعبة في حلقة مستمرة
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// استدعاء العدو كل ثانيتين
setInterval(spawnEnemy, 2000);

// بدء اللعبة
resetGame();
gameLoop();

// إضافة حدث الاستماع لزر الإيقاف/الاستئناف
const pauseButton = document.getElementById('togglePause');
if (pauseButton) {
    pauseButton.addEventListener('click', () => {
        isPaused = !isPaused;
    });
} else {
    console.warn('لا يوجد عنصر لزر الإيقاف/الاستئناف');
}
