let socket = io.connect('http://localhost:4000');

// Javascript doesn't have enums so...
let ObjectTypes = {
    WOOD: 0,
    STONE: 1,
    METAL: 2,
    RUBY: 3
};

let images = {
    'wood': null,
    'stone': null,
    'iron': null,
    'ruby': null,
    'woodIcon': null,
    'stoneIcon': null,
    'ironIcon': null,
    'rubyIcon': null
};

let resourceSizes = {
    'wood': 300,
    'stone': 150,
    'iron': 150,
    'ruby': 150
};

const SCREEN_WIDTH = innerWidth;
const SCREEN_HEIGHT = innerHeight;

// Create "Leave site? Changes you made may not be saved" prompt
window.onbeforeunload = function() {
    return true;
};

let inputs = {
    angle: 0,
    keyboard: []
};

let objects = [];

let players = {};

let player = {};

let chatTextbox;
let chatDisplay;

function isChatOpen() {
    return chatTextbox.elt === document.activeElement;
}

function chatAppend(text) {
    if (chatDisplay !== undefined) {
        chatDisplay.elt.innerHTML = '<span class="chat-line">' + text + '</span>' + chatDisplay.elt.innerHTML;
    } else {
        console.log('tried to add to chat but undefined ' + text);
    }
}

socket.on('objects', function (data) {
    // console.log('objects recieved');

    // let parsedData = JSON.parse(data);
    // console.log(parsedData);
    objects = data;
});

socket.on('player', function (data) {
    // Parse Server Data
    // let parsedData = JSON.parse(data);
    // console.log(parsedData);
    if (data.sid === socket.id) {
        // console.log('this player updated');
        player.x = data.x;
        player.y = data.y;
    } else {
        // console.log('other player updated with sid ' + parsedData.sid);
        players[data.sid] = {
            x: data.x,
            y: data.y,
            angle: data.angle
        }
    }
});

socket.on('join', function(data) {
   chatAppend('<strong>' + data + '</strong> joined');
});

socket.on('leave', function(data) {
    delete players[data];
    chatAppend('<strong>' + data + '</strong> left');
});

socket.on('chat', function(data) {
    console.log(data['sid'] + ' says ' + data['message']);
    // chat.elt.append(data['sid'] + ' says ' + data['message']);
    chatAppend('<span class="chat-line"><strong>' + data['sid'] + ': </strong>' + data['message'] + '</span>');
});

function keyPressed() {
    if (!isChatOpen()) {
        inputs['keyboard'].push(key);
    }
    // Chat
    if (key === 'Enter') {
        if (isChatOpen()) {
            let message = chatTextbox.value();
            if (message !== '') {
                socket.emit('chat', chatTextbox.value());
                chatTextbox.value('');
            }
            chatTextbox.elt.blur();
        } else {
            chatTextbox.elt.focus();
            inputs.keyboard = [];
        }
        // let message = prompt('Enter Message:');
        // socket.emit('chat', message);
    }
}

function keyReleased() {
    if (!isChatOpen()) {
        inputs['keyboard'] = inputs['keyboard'].filter(item => item !== key);
    }
}

function preload() {
    for (let key in images) {
        console.log('Loading image ' + key);
        images[key] = loadImage('assets/img/' + key + '.png');
    }
}

function setup() {
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    textFont('Roboto Mono');

    chatTextbox = createInput();
    chatTextbox.addClass('chat chat-textbox');
    chatTextbox.size(300, 30);
    chatTextbox.position(20, SCREEN_HEIGHT - 50);

    chatDisplay = createP();
    chatDisplay.addClass('chat chat-display');
    // chat.size(300, 400);
    chatDisplay.size(400, 400);
    chatDisplay.position(20, SCREEN_HEIGHT - 485);
}

function update() {
    inputs.angle = atan2(mouseY - SCREEN_HEIGHT / 2, mouseX - SCREEN_WIDTH / 2);
    socket.emit('inputs', inputs);
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

    // Body
    ellipse(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 70, 70);

    // Hands

    push();

    translate(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    rotate(inputs.angle);

    ellipse(26, 26, 24, 24);
    ellipse(26, -26, 24, 24);

    pop();

    push();
    translate(-player.x + SCREEN_WIDTH / 2, -player.y + SCREEN_HEIGHT / 2);

    // Draw other players
    for (let sid in players) {
        // Player To Draw
        drawPlayer = players[sid];

        // console.log('Drawing player ' + sid + ' with x ' + drawPlayer.x + ' and y ' + drawPlayer.y);

        // Body
        ellipse(drawPlayer.x, drawPlayer.y, 70, 70);

        // Hands
        push();

        translate(drawPlayer.x, drawPlayer.y);
        rotate(drawPlayer.angle);

        ellipse(26, 26, 24, 24);
        ellipse(26, -26, 24, 24);

        pop();
    }

    // Culling Boundaries
    let cullingX = player.x - SCREEN_WIDTH * (3/5);
    let cullingY = player.y - SCREEN_HEIGHT * (5/5);
    let cullingW = player.x + SCREEN_WIDTH * (3/5);
    let cullingH = player.y + SCREEN_HEIGHT * (5/5);

    // Object Rendering
    for (let i = 0; i < objects.length; i++) {
        // Render with Culling
        if (objects[i].x >= cullingX && objects[i].y >= cullingY && objects[i].x <= cullingW && objects[i].y <= cullingH) {
            let object = objects[i];

            // Render
            let ox = object.x;
            let oy = object.y;
            let img = images[object.type];
            let size = resourceSizes[object.type];

            image(img, ox - size / 2, oy - size / 2, size, size);

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

    textSize(16);

    fill(255);
    noStroke();
    text(round(player.x*10)/10, 2, 35);
    text(round(player.y*10)/10, 2, 70);

    // Resource UI
    fill(0,100);

    // New smaller resources
    rect(SCREEN_WIDTH - 120, SCREEN_HEIGHT - 200, 110, 40, 5);
    rect(SCREEN_WIDTH - 120, SCREEN_HEIGHT - 150, 110, 40, 5);
    rect(SCREEN_WIDTH - 120, SCREEN_HEIGHT - 100, 110, 40, 5);
    rect(SCREEN_WIDTH - 120, SCREEN_HEIGHT - 50, 110, 40, 5);

    // Old big resources
    // rect(SCREEN_WIDTH - 160, SCREEN_HEIGHT - 200, 150, 40, 5);
    // rect(SCREEN_WIDTH - 160, SCREEN_HEIGHT - 150, 150, 40, 5);
    // rect(SCREEN_WIDTH - 160, SCREEN_HEIGHT - 100, 150, 40, 5);
    // rect(SCREEN_WIDTH - 160, SCREEN_HEIGHT - 50, 150, 40, 5);

    image (images['woodIcon'], SCREEN_WIDTH - 45, SCREEN_HEIGHT - 200 + 5, 30, 30);
    image (images['stoneIcon'], SCREEN_WIDTH - 45, SCREEN_HEIGHT - 150 + 5, 30, 30);
    image (images['ironIcon'], SCREEN_WIDTH - 45, SCREEN_HEIGHT - 100 + 5, 30, 30);
    image (images['rubyIcon'], SCREEN_WIDTH - 45, SCREEN_HEIGHT - 50 + 5, 30, 30);

    textAlign(RIGHT, TOP);
    textSize(24);
    fill(255);
    text(0, SCREEN_WIDTH - 50, SCREEN_HEIGHT - 50 + 10);
    text(0, SCREEN_WIDTH - 50, SCREEN_HEIGHT - 100 + 10);
    text(0, SCREEN_WIDTH - 50, SCREEN_HEIGHT - 150 + 10);
    text(0, SCREEN_WIDTH - 50, SCREEN_HEIGHT - 200 + 10);
}
