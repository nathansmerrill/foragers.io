let socket = io.connect('http://localhost:4000');

const SCREEN_WIDTH = innerWidth;
const SCREEN_HEIGHT = innerHeight;

const PLAYER_SPEED = 5;
const FRAME_RATE_ESTIMATE = 60;

let inputs = [];

let objects = [];

// Javascript doesn't have enums so...
let ObjectTypes = {
    WOOD: 0,
    STONE: 1,
    METAL: 2,
    RUBY: 3
};

let objectCache = [
    {
        name: 'WOOD-RESOURCE',
        url: 'assets/img/TreeResource.png',
        resource: ObjectTypes.WOOD,
        img: null,
        object_size: 300
    },
    {
        name: 'STONE-RESOURCE',
        url: 'assets/img/StoneResource.png',
        resource: ObjectTypes.STONE,
        img: null,
        object_size: 150
    },
    {
        name: 'METAL-RESOURCE',
        url: 'assets/img/MetalResource.png',
        resource: ObjectTypes.METAL,
        img: null,
        object_size: 150
    },
    {
        name: 'RUBY-RESOURCE',
        url: 'assets/img/RubyResource.png',
        resource: ObjectTypes.RUBY,
        img: null,
        object_size: 150
    }
];

let deltaTime;
let lagModifier;

let player = {
    x: 0,
    y: 0,
    name: "Red",
    view: 0
};

socket.on('ping', function (data) {
    console.log(data)
});

socket.on('objects', function (data) {
    console.log('objects recieved');

    let parsedData = JSON.parse(data);
    console.log(parsedData);
    objects = parsedData;
});

function keyPressed() {
    inputs.push(key);
    console.log(inputs);
}

function keyReleased() {
    inputs = inputs.filter(item => item !== key);
}

function preload() {
    for (let i = 0; i < objectCache.length; i++) {
        objectCache[i].img = loadImage(objectCache[i].url);
        console.log('Loading Object :' + objectCache[i].name);
    }
}

function setup() {
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
}

function update() {
    deltaTime = 1 / frameRate();
    lagModifier = deltaTime * FRAME_RATE_ESTIMATE;
    // Move Player
    if (inputs.includes('w')) {
        player.y -= PLAYER_SPEED * lagModifier;
    }
    if (inputs.includes('s')) {
        player.y += PLAYER_SPEED * lagModifier;
    }
    if (inputs.includes('a')) {
        player.x -= PLAYER_SPEED * lagModifier;
    }
    if (inputs.includes('d')) {
        player.x += PLAYER_SPEED * lagModifier;
    }
}

function draw() {
    update();

    // for (object in objects) {
    //     circle(object.x, object.y, 30);
    // }

    strokeWeight(4);
    background(120, 150, 70);

    // Grid
    stroke(110, 140, 60);

    let gridOffsetX = 100 - player.x % 100;
    let gridOffsetY = 100 - player.y % 100;

    for (let i = -1; i < SCREEN_WIDTH / 100 + 1; i++) {
        line(i * 100 + gridOffsetX, 0, i * 100 + gridOffsetX, SCREEN_HEIGHT);
    }
    for (let i = -1; i < SCREEN_HEIGHT / 80 + 1; i++) {
        line(0, i * 100 + gridOffsetY, SCREEN_WIDTH, i * 100 + gridOffsetY);
    }

    // Player
    fill(230, 220, 170);
    stroke(40);
    // Hands
    let angle = atan2(mouseY - height / 2, mouseX - width / 2);
    push();

    translate(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    rotate(angle);

    ellipse(26, 26, 24, 24);
    ellipse(26, -26, 24, 24);

    pop();

    // Body
    ellipse(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 70, 70);

    push();
    translate(-player.x, -player.y);
    text('0', 0, 0);
    text('200', 200, 0);
    text('400', 400, 0);

    // Culling Boundaries
    let cullingX = player.x - SCREEN_WIDTH * (8/5);
    let cullingY = player.y - SCREEN_HEIGHT * (8/5);
    let cullingW = player.x + SCREEN_WIDTH * (8/5);
    let cullingH = player.y + SCREEN_HEIGHT * (8/5);

    // Object Rendering
    for (let i = 0; i < objects.length; i++) {
        // Render with Culling
        if (objects[i].x >= cullingX && objects[i].y >= cullingY && objects[i].x <= cullingW && objects[i].y <= cullingH) {
            // Get Loaded Object
            let objectLoaded;
            switch (objects[i].type) {
                case 'tree':
                    objectLoaded = objectCache [0];
                    break;
                case 'stone':
                    objectLoaded = objectCache [1];
                    break;
                case 'iron':
                    objectLoaded = objectCache [2];
                    break;
                case 'ruby':
                    objectLoaded = objectCache [3];
                    break;
                default:
                    alert('Error: Unknown Object');
                    break;
            }

            // Render
            let ox = objects[i].x;
            let oy = objects[i].y;
            let img = objectLoaded.img;
            let size = objectLoaded.object_size;

            image (img, ox - size / 2, oy - size / 2, size, size);

        }
    }

    // World Borders
    fill(0,100);
    noStroke();
    rect(-1000, -1000, 40000 + 2000,1000);
    rect(-1000, 0, 1000, 40000);
    rect(-1000, 40000,40000 + 2000,1000);
    rect(40000, 40000, 1000, 40000 + 1000);
    pop();
    textSize(32);
    fill(255);
    stroke(21);
    strokeWeight(10);
    text(round(player.x), 2, 35);
    text(round(player.y), 2, 70);
}
