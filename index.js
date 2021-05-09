const BUG_LEFT = 190;
const BUG_RIGHT = 600;

const fpsInterval = 1000 / 20;
let then = Date.now();
let now = Date.now();

let bugImage;
let wingImage;
let treeImage;
let context;
let canvas;

let bugs = [];

window.onload = () => {
  init();
};

function Bug({ x, y }) {
  const flipped = Math.random() < 0.5;
  // let direction = Math.random() * Math.PI * 2;

  this.x = x;
  this.y = y;
  this.contains = ({ tx, ty }) => {
    if (this.x < tx && this.x + 150 > tx && this.y < ty && this.y + 150 > ty) {
      return true;
    }
    return false;
  };
  this.draw = () => {
    const speed = Math.random() * 1;
    // this.x += speed;
    this.y -= speed;

    context.save();
    context.setTransform(
      flipped ? -1 : 1,
      0,
      0,
      1,
      this.x + (flipped ? bugImage.width : 0),
      this.y
    );

    context.translate(Math.random() * 3 - 3, Math.random() * 3 - 3);
    // context.rotate(direction);
    context.drawImage(bugImage, 0, 0, 150, 150);
    if (this.flailing) {
      context.translate(Math.random() * 3 - 3, Math.random() * 3 - 3);
      // context.drawImage(wingImage, 0, 0, 150, 150);
    }
    context.drawImage(wingImage, 0, 0, 150, 150);
    context.restore();

    return this.y + 150 > 0;
  };

  this.flail = () => {
    this.flailing = true;
  };
}

const makeBug = ({ x, y }) => {};

const update = (dt) => {
  context.clearRect(0, 0, 800, 800);
  context.drawImage(treeImage, 0, 0);
  bugs = bugs.filter((bug) => {
    return bug.draw();
  });
  const leftX = BUG_LEFT; // + canvas.clientLeft;
  const rightX = BUG_RIGHT; // + canvas.clientLeft;
  while (bugs.length < 10) {
    bugs.push(
      new Bug({
        x: leftX + Math.random() * (rightX - leftX),
        y: 800
      })
    );
  }
};

const tick = () => {
  requestAnimationFrame(tick);

  now = Date.now();
  elapsed = now - then;
  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    update(elapsed);
  }
};

const init = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  bugImage = document.getElementById("bug");
  wingImage = document.getElementById("wing");
  treeImage = document.getElementById("tree");
  // makeBug({ x: 300, y: 300 });

  const leftX = BUG_LEFT; // + canvas.clientLeft;
  const rightX = BUG_RIGHT; // + canvas.clientLeft;
  Array.from(Array(10).keys()).forEach((i) => {
    bugs.push(
      new Bug({
        x: leftX + Math.random() * (rightX - leftX),
        y: Math.random() * 800
      })
    );
  });

  let draggedBug;
  let playing = false;
  const startClick = (e) => {
    if (!playing) {
      playing = true;
      audio.play();
    }
    const clickX = e.offsetX;
    const clickY = e.offsetY;
    const clickedBugs = bugs.filter((bug) => {
      return bug.contains({ tx: clickX, ty: clickY });
    });
    if (clickedBugs.length) {
      draggedBug = clickedBugs[0];
      canvas.style.cursor = "grabbing";
      draggedBug.flailing = true;
      draggedBug.clickX = clickX - draggedBug.x;
      draggedBug.clickY = clickY - draggedBug.y;
    } else {
      return;
    }
  };

  const moveClick = (e) => {
    if (draggedBug) {
      draggedBug.x = e.pageX - draggedBug.clickX;
      draggedBug.y = e.pageY - draggedBug.clickY;
    }
    let touchingABug = false;
    bugs.forEach((bug) => {
      if (bug.contains({ tx: e.pageX, ty: e.pageY })) {
        touchingABug = true;
        bug.flailing = true;
      } else {
        bug.flailing = false;
      }
    });
    if (touchingABug && !draggedBug) {
      canvas.style.cursor = "grab";
    }
  };

  const endClick = () => {
    draggedBug && (draggedBug.flailing = false);
    canvas.style.cursor = "default";
    draggedBug = null;
  };
  canvas.addEventListener("touchstart", (e) => {
    const touch = e.changedTouches[0];
    startClick(touch);
  });
  canvas.addEventListener("mousedown", (e) => {
    startClick(e);
  });
  canvas.addEventListener("touchmove", (e) => {
    const touch = e.changedTouches[0];
    moveClick(e);
  });

  canvas.addEventListener("mousemove", (e) => {
    moveClick(e);
  });

  canvas.addEventListener("touchend", (e) => {
    endClick();
  });
  canvas.addEventListener("mouseup", (e) => {
    endClick();
  });

  requestAnimationFrame(tick);

  var audio = new Audio(
    "https://www.cicadamania.com/cicadas/wp-content/uploads/2020/04/M-tredecula-chorus-2014.mp3"
  );
  audio.loop = true;
};
