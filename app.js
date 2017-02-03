var Game = {};
Game.init = function () {
  Game.background = null;
  Game.focused = false;
  Game.gravity = 0.3;
  Game.splatters = [];
  Game.canvas = document.getElementById('canvas');
  Game.loadBasePhoto()
    .then(Game.setBackground)
    .catch(alert);
};
Game.loadBasePhoto = function () {
  return new Promise(function(resolve, reject) {
    var photoSources = [
      '/img/trump-baseball.png',
      '/img/bad-hair-flappy.png',
      '/img/double-chin-microphone.png',
      '/img/smarm-central.png'
    ];

    var image = new Image();
    image.onload = function() { resolve(image); };
    image.src = photoSources[randomIntBetween(0, 4)];
    return image;
  });
};
Game.setBackground = function (newBackground) {
  Game.background = newBackground;
  Game.repaint();
  return Promise.resolve();
};
Game.addSplatter = function(center) {
  Game.splatters.push(new Splatter(center));
};
Game.tick = function () {
  Game.splatters.forEach(function (splatter) {
    splatter.tick();
  });
};
Game.repaint = function () {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(Game.background, 0, 0, canvas.width, canvas.height);
  Game.splatters.forEach(function(splatter) {
    splatter.splats.forEach(function(splat) {
      ctx.beginPath();
      ctx.fillStyle = splat.color;
      ctx.arc(splat.cx, 600 - splat.cy, splat.r, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
    });
  });
};
Game.loop = function () {
  if (Game.focused) {
    requestAnimationFrame(Game.loop);
  }
  Game.tick();
  Game.repaint();
};
Game.focus = function() {
  Game.focused = true;
  Game.loop();
};
Game.blur = function() {
  Game.focused = false;
};

function Splatter (center) {
  this.cx = center.x;
  this.cy = center.y;
  this.r = randomIntBetween(9, 18);
  this.color = "rgb(" + [randomIntBetween(130, 245),randomIntBetween(70, 90),0].join(',') + ")";
  this.splats = constructSplatsFor(this);
  this.count = randomIntBetween(35, 60);
}
Splatter.prototype.tick = function () {
  if (this.count <= 0) { return; }
  this.splats.forEach(function(splat) { splat.tick(); });
  this.count--;
};

function Splat (properties) {
  this.cx = properties['cx'];
  this.cy = properties['cy'];
  this.r = properties['r'];
  this.color = properties['color'];
  this.vx = properties['vx'];
  this.vy = properties['vy'];
}
Splat.prototype.tick = function () {
  this.vy -= Game.gravity / 2;
  this.cx += this.vx / 2;
  this.cy += this.vy / 2;
}

function constructSplatsFor (splatter) {
  var splatCount = randomIntBetween(5, 13);
  var result = [];
  for (let x = 0; x < splatCount; x++) {
    result.push(new Splat({
      cx: splatter.cx,
      cy: splatter.cy,
      r: splatter.r + randomIntBetween(-9, -1),
      color: splatter.color,
      vx: randomIntBetween(-3, 3),
      vy: randomIntBetween(-2, 5) 
    }));
  }
  return result;
}

function randomIntBetween (min, max) {
  var range = max - min;
  return min + (Math.random() * range | 0);
}

function getPosition (el) {
  var xPosition = 0;
  var yPosition = 0;

  xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft)
  yPosition += (el.offsetTop - el.scrollTop + el.clientTop)

  return {
    x: xPosition,
    y: yPosition
  }
}

$(document).ready(function() {
  Game.init();
  window.onblur = Game.blur;
  Game.canvas.onclick = function(event) {
    var canvasPosition = getPosition(event.target.parentElement)

    Game.addSplatter({
      x: Math.floor(event.clientX - canvasPosition.x),
      y: Math.floor(600 - (event.clientY - canvasPosition.y))
    });

    if (!Game.focused) {
      Game.focus();
    }
  }
});
