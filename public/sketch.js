let socket = io.connect('http://localhost:4000');

let images = {
    'wood': [null, 'resources'],
    'stone': [null, 'resources'],
    'iron': [null, 'resources'],
    'ruby': [null, 'resources'],

    'woodIcon': [null, 'resourceIcons'],
    'stoneIcon': [null, 'resourceIcons'],
    'ironIcon': [null, 'resourceIcons'],
    'rubyIcon': [null, 'resourceIcons'],

    'woodAxe1': [null, 'tools/axe'],
    'woodAxe2': [null, 'tools/axe'],
    'woodAxe3': [null, 'tools/axe'],
    'stoneAxe1': [null, 'tools/axe'],
    'stoneAxe2': [null, 'tools/axe'],
    'stoneAxe3': [null, 'tools/axe'],
    'ironAxe1': [null, 'tools/axe'],
    'ironAxe2': [null, 'tools/axe'],
    'ironAxe3': [null, 'tools/axe'],
    'rubyAxe1': [null, 'tools/axe'],
    'rubyAxe2': [null, 'tools/axe'],
    'rubyAxe3': [null, 'tools/axe'],

    'woodPick1': [null, 'tools/pick'],
    'woodPick2': [null, 'tools/pick'],
    'woodPick3': [null, 'tools/pick'],
    'stonePick1': [null, 'tools/pick'],
    'stonePick2': [null, 'tools/pick'],
    'stonePick3': [null, 'tools/pick'],
    'ironPick1': [null, 'tools/pick'],
    'ironPick2': [null, 'tools/pick'],
    'ironPick3': [null, 'tools/pick'],
    'rubyPick1': [null, 'tools/pick'],
    'rubyPick2': [null, 'tools/pick'],
    'rubyPick3': [null, 'tools/pick'],

    'woodSword1': [null, 'tools/sword'],
    'woodSword2': [null, 'tools/sword'],
    'woodSword3': [null, 'tools/sword'],
    'stoneSword1': [null, 'tools/sword'],
    'stoneSword2': [null, 'tools/sword'],
    'stoneSword3': [null, 'tools/sword'],
    'ironSword1': [null, 'tools/sword'],
    'ironSword2': [null, 'tools/sword'],
    'ironSword3': [null, 'tools/sword'],
    'rubySword1': [null, 'tools/sword'],
    'rubySword2': [null, 'tools/sword'],
    'rubySword3': [null, 'tools/sword']
};

let resourceSizes = {
    'wood': 15,
    'stone': 8,
    'iron': 8,
    'ruby': 8
};

let tuning = {};

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

let font;

let mapWidth = IGUToPixels(2000);
let mapHeight = IGUToPixels(2000);

function windowResized() {
    resizeCanvas(innerWidth, innerHeight);

    resizePlayers();
    resizeBorder();
    resizeResourceDisplay();
    resizeChat();
}

function resizePlayers() {
    tuning['playerSize'] = IGUToPixels(3.9);
    tuning['playerStroke'] = IGUToPixels(0.24);

    tuning['handSize'] = IGUToPixels(1.4);
    tuning['handPosition'] = IGUToPixels(1.5);

    tuning['toolScale'] = IGUToPixels(0.023);
    tuning['toolX'] = IGUToPixels(-5.73);
    tuning['toolY'] = IGUToPixels(-10);
}

function resizeBorder() {
    tuning['borderThickness'] = IGUToPixels(50);

    tuning['borderTopX'] = -tuning['borderThickness'];
    tuning['borderTopY'] = -tuning['borderThickness'];
    tuning['borderTopWidth'] = mapWidth + (tuning['borderThickness'] * 2);
    tuning['borderTopHeight'] = tuning['borderThickness'];

    tuning['borderBottomX'] = -tuning['borderThickness'];
    tuning['borderBottomY'] = mapHeight;
    tuning['borderBottomWidth'] = mapWidth + (tuning['borderThickness'] * 2);
    tuning['borderBottomHeight'] = tuning['borderThickness'];

    tuning['borderLeftX'] = -tuning['borderThickness'];
    tuning['borderLeftY'] = 0;
    tuning['borderLeftWidth'] = tuning['borderThickness'];
    tuning['borderLeftHeight'] = mapHeight;

    tuning['borderRightX'] = mapWidth;
    tuning['borderRightY'] = 0;
    tuning['borderRightWidth'] = tuning['borderThickness'];
    tuning['borderRightHeight'] = mapHeight;
}

function resizeResourceDisplay() {
    tuning['resourceDisplayTextSize'] = IGUToPixels(0.8);
    tuning['resourceDisplayOffset'] = 2.6;

    tuning['resourceDisplayBackgroundWidth'] = IGUToPixels(6);
    tuning['resourceDisplayBackgroundHeight'] = IGUToPixels(2);
    tuning['resourceDisplayBackgroundX'] = IGUToPixels(0.6, innerWidth, tuning['resourceDisplayBackgroundWidth']);
    tuning['resourceDisplayBackgroundWoodY'] = IGUToPixels(tuning['resourceDisplayOffset']*4, innerHeight);
    tuning['resourceDisplayBackgroundStoneY'] = IGUToPixels(tuning['resourceDisplayOffset']*3, innerHeight);
    tuning['resourceDisplayBackgroundIronY'] = IGUToPixels(tuning['resourceDisplayOffset']*2, innerHeight);
    tuning['resourceDisplayBackgroundRubyY'] = IGUToPixels(tuning['resourceDisplayOffset'], innerHeight);
    tuning['resourceDisplayBackgroundRounding'] = IGUToPixels(0.26);

    tuning['resourceDisplayIconSize'] = IGUToPixels(1.5);
    tuning['resourceDisplayIconX'] = IGUToPixels(1, innerWidth, tuning['resourceDisplayIconSize']);
    tuning['resourceDisplayIconYOffset'] = -((tuning['resourceDisplayBackgroundHeight'] - tuning['resourceDisplayIconSize']) / 2);
    tuning['resourceDisplayIconWoodY'] = IGUToPixels(tuning['resourceDisplayOffset']*4, innerHeight, tuning['resourceDisplayIconYOffset']);
    tuning['resourceDisplayIconStoneY'] = IGUToPixels(tuning['resourceDisplayOffset']*3, innerHeight, tuning['resourceDisplayIconYOffset']);
    tuning['resourceDisplayIconIronY'] = IGUToPixels(tuning['resourceDisplayOffset']*2, innerHeight, tuning['resourceDisplayIconYOffset']);
    tuning['resourceDisplayIconRubyY'] = IGUToPixels(tuning['resourceDisplayOffset'], innerHeight, tuning['resourceDisplayIconYOffset']);

    tuning['resourceDisplayTextSize'] = IGUToPixels(1.2);
    tuning['resourceDisplayTextX'] = IGUToPixels(2.8, innerWidth);
    tuning['resourceDisplayTextYOffset'] = -((tuning['resourceDisplayBackgroundHeight'] - tuning['resourceDisplayTextSize']) / 3.2);
    tuning['resourceDisplayTextWoodY'] = IGUToPixels(tuning['resourceDisplayOffset']*4, innerHeight, tuning['resourceDisplayTextYOffset']);
    tuning['resourceDisplayTextStoneY'] = IGUToPixels(tuning['resourceDisplayOffset']*3, innerHeight, tuning['resourceDisplayTextYOffset']);
    tuning['resourceDisplayTextIronY'] = IGUToPixels(tuning['resourceDisplayOffset']*2, innerHeight, tuning['resourceDisplayTextYOffset']);
    tuning['resourceDisplayTextRubyY'] = IGUToPixels(tuning['resourceDisplayOffset'], innerHeight, tuning['resourceDisplayTextYOffset']);
}

function resizeChat() {
    tuning['chatTextboxWidth'] = IGUToPixels(15);
    tuning['chatTextboxHeight'] = IGUToPixels(1.5);
    tuning['chatTextboxX'] = IGUToPixels(1);
    tuning['chatTextboxY'] = IGUToPixels(1.3, innerHeight, tuning['chatTextboxHeight']);

    tuning['chatDisplayWidth'] = IGUToPixels(22);
    tuning['chatDisplayHeight'] = IGUToPixels(22);
    tuning['chatDisplayX'] = IGUToPixels(1);
    tuning['chatDisplayY'] = IGUToPixels(4.25, innerHeight, tuning['chatDisplayHeight']);

    tuning['chatFontSize'] = IGUToPixels(0.8);
    tuning['chatTextboxBorderRadius'] = IGUToPixels(1);

    if (chatTextbox !== undefined) {
        chatTextbox.size(tuning['chatTextboxWidth'], tuning['chatTextboxHeight']);
        chatTextbox.position(tuning['chatTextboxX'], tuning['chatTextboxY']);
        chatTextbox.style('font-size', tuning['chatFontSize'] + 'px');
        chatTextbox.style('border-radius', tuning['chatTextboxBorderRadius'] + 'px');
    }

    if (chatDisplay !== undefined) {
        chatDisplay.size(tuning['chatDisplayWidth'], tuning['chatDisplayHeight']);
        chatDisplay.position(tuning['chatDisplayX'], tuning['chatDisplayY']);
        chatDisplay.style('font-size', tuning['chatFontSize'] + 'px');
    }
}

function waitUntil(boolFn, callback, delay) {
    "use strict";
    // if delay is undefined or is not an integer
    delay = (typeof (delay) === 'undefined' || isNaN(parseInt(delay, 10))) ? 100 : delay;
    setTimeout(function () {
        (boolFn()) ? callback() : waitUntil(boolFn, callback, delay);
    }, delay);
}

function waitForChat(callback) {
    waitUntil(() => {return chatDisplay !== undefined}, callback);
}

function isChatOpen() {
    // waitForChat(() => {return chatTextbox.elt === document.activeElement});
    return chatTextbox.elt === document.activeElement;
}

function chatAppend(text) {
    waitForChat(() => {chatDisplay.elt.innerHTML = '<span class="chat-line">' + text + '</span>' + chatDisplay.elt.innerHTML});
}

function IGUToPixels(igu, oppositeEdge = 0, offset = 0) {
    let biggerSide = innerWidth;
    // if (innerHeight > biggerSide) {
    //     biggerSide = innerHeight
    // }
    let basePixels = igu * (biggerSide / 100);
    if (oppositeEdge === 0) {
        return basePixels + offset;
    } else {
        return oppositeEdge - basePixels - offset;
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

socket.on('display', function(data) {
    console.log('Displaying ' + data);
    chatAppend(data);
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
        let url = '';
        let extension = '.png';
        if (images[key].length === 3) {
            extension = images[key][2];
        }
        if (images[key].length === 2) {
            url = 'assets/img/' + images[key][1] + '/' + key + extension;
        } else {
            url = 'assets/img/' + key + extension;
        }
        images[key][0] = loadImage(url);
    }
    font = loadFont('fonts/Roboto_Mono/RobotoMono-Regular.ttf');
}

function setup() {
    createCanvas(innerWidth, innerHeight);
    textFont(font);

    chatTextbox = createInput();
    chatTextbox.addClass('chat chat-textbox');

    chatDisplay = createP();
    chatDisplay.addClass('chat chat-display');

    windowResized();
}

function update() {
    inputs.angle = atan2(mouseY - innerHeight / 2, mouseX - innerWidth / 2);
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

    let gridOffsetX = 100 - IGUToPixels(player.x) % 100;
    let gridOffsetY = 100 - IGUToPixels(player.y) % 100;

    for (let i = -1; i < innerWidth / 100 + 1; i++) {
        line(i * 100 + gridOffsetX, 0, i * 100 + gridOffsetX, innerHeight);
    }
    for (let i = -1; i < innerHeight / 80 + 1; i++) {
        line(0, i * 100 + gridOffsetY, innerWidth, i * 100 + gridOffsetY);
    }

    // Player
    fill(230, 220, 170);
    stroke(21, 21, 21);
    strokeWeight(tuning['playerStroke']);

    // Body
    ellipse(innerWidth / 2, innerHeight / 2, tuning['playerSize'], tuning['playerSize']);

    // Hands

    push();

    translate(innerWidth / 2, innerHeight / 2);
    rotate(inputs.angle + (Math.PI / 2));

    // ellipse(tuning['handPosition'], tuning['handPosition'], tuning['handSize'], tuning['handSize']);
    // ellipse(tuning['handPosition'], -tuning['handPosition'], tuning['handSize'], tuning['handSize']);

    scale(-tuning['toolScale'], tuning['toolScale']);
    image(images['rubyPick3'][0], -110, -190);

    pop();

    push();
    translate(-IGUToPixels(player.x) + innerWidth / 2, -IGUToPixels(player.y) + innerHeight / 2);

    // Draw other players
    for (let sid in players) {
        // Player To Draw
        drawPlayer = players[sid];

        // console.log('Drawing player ' + sid + ' with x ' + drawPlayer.x + ' and y ' + drawPlayer.y);

        // Body
        ellipse(IGUToPixels(drawPlayer.x), IGUToPixels(drawPlayer.y), tuning['playerSize'], tuning['playerSize']);

        // Hands
        push();

        translate(IGUToPixels(drawPlayer.x), IGUToPixels(drawPlayer.y));
        rotate(drawPlayer.angle);

        ellipse(tuning['handPosition'], tuning['handPosition'], tuning['handSize'], tuning['handSize']);
        ellipse(tuning['handPosition'], -tuning['handPosition'], tuning['handSize'], tuning['handSize']);

        pop();
    }

    // Culling Boundaries
    let cullingX = player.x - 60;
    let cullingY = player.y - 60;
    let cullingW = player.x + 60;
    let cullingH = player.y + 60;

    // Object Rendering
    for (let i = 0; i < objects.length; i++) {
        // Render with Culling
        if (objects[i].x >= cullingX && objects[i].y >= cullingY && objects[i].x <= cullingW && objects[i].y <= cullingH) {
            let object = objects[i];

            // Render
            let ox = IGUToPixels(object.x);
            let oy = IGUToPixels(object.y);
            let img = images[object.type][0];
            let size = IGUToPixels(resourceSizes[object.type]);

            image(img, ox - size / 2, oy - size / 2, size, size);

        }
    }

    // World Borders
    fill(0,100);
    noStroke();
    rect(tuning['borderTopX'], tuning['borderTopY'], tuning['borderTopWidth'], tuning['borderTopHeight']);
    rect(tuning['borderBottomX'], tuning['borderBottomY'], tuning['borderBottomWidth'], tuning['borderBottomHeight']);
    rect(tuning['borderLeftX'], tuning['borderLeftY'], tuning['borderLeftWidth'], tuning['borderLeftHeight']);
    rect(tuning['borderRightX'], tuning['borderRightY'], tuning['borderRightWidth'], tuning['borderRightHeight']);

    pop();

    textSize(16);

    fill(255);
    noStroke();
    // text(round(player.x*10)/10, 2, 35);
    // text(round(player.y*10)/10, 2, 70);

    // Resource UI
    fill(0,100);

    // New smaller resources
    rect(tuning['resourceDisplayBackgroundX'], tuning['resourceDisplayBackgroundWoodY'], tuning['resourceDisplayBackgroundWidth'], tuning['resourceDisplayBackgroundHeight'], tuning['resourceDisplayBackgroundRounding']);
    rect(tuning['resourceDisplayBackgroundX'], tuning['resourceDisplayBackgroundStoneY'], tuning['resourceDisplayBackgroundWidth'], tuning['resourceDisplayBackgroundHeight'], tuning['resourceDisplayBackgroundRounding']);
    rect(tuning['resourceDisplayBackgroundX'], tuning['resourceDisplayBackgroundIronY'], tuning['resourceDisplayBackgroundWidth'], tuning['resourceDisplayBackgroundHeight'], tuning['resourceDisplayBackgroundRounding']);
    rect(tuning['resourceDisplayBackgroundX'], tuning['resourceDisplayBackgroundRubyY'], tuning['resourceDisplayBackgroundWidth'], tuning['resourceDisplayBackgroundHeight'], tuning['resourceDisplayBackgroundRounding']);

    image(images['woodIcon'][0], tuning['resourceDisplayIconX'], tuning['resourceDisplayIconWoodY'], tuning['resourceDisplayIconSize'], tuning['resourceDisplayIconSize']);
    image(images['stoneIcon'][0], tuning['resourceDisplayIconX'], tuning['resourceDisplayIconStoneY'], tuning['resourceDisplayIconSize'], tuning['resourceDisplayIconSize']);
    image(images['ironIcon'][0], tuning['resourceDisplayIconX'], tuning['resourceDisplayIconIronY'], tuning['resourceDisplayIconSize'], tuning['resourceDisplayIconSize']);
    image(images['rubyIcon'][0], tuning['resourceDisplayIconX'], tuning['resourceDisplayIconRubyY'], tuning['resourceDisplayIconSize'], tuning['resourceDisplayIconSize']);

    textAlign(RIGHT, TOP);
    textSize(tuning['resourceDisplayTextSize']);
    fill(255);
    text('100', tuning['resourceDisplayTextX'], tuning['resourceDisplayTextWoodY']);
    text('100', tuning['resourceDisplayTextX'], tuning['resourceDisplayTextStoneY']);
    text('50', tuning['resourceDisplayTextX'], tuning['resourceDisplayTextIronY']);
    text('10', tuning['resourceDisplayTextX'], tuning['resourceDisplayTextRubyY']);

}
