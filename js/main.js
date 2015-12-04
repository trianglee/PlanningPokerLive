"use strict";

var g_stage;
var g_selectedCardTitle = null;

var g_tshirtImage;

function init() {
    init1();
}

function init1() {
    g_tshirtImage = new Image();
    g_tshirtImage.src = "images/t-shirt.png";
    g_tshirtImage.onload = init2;
}

function init2() {
    g_stage = new createjs.Stage("canvas");
    window.addEventListener("resize", resize, false);
    resize();
}

function resize() {
    g_stage.canvas.width = window.innerWidth;
    g_stage.canvas.height = window.innerHeight;
    drawEverything();
}

function drawEverything() {
    g_stage.removeAllChildren();

    addCards();
    addSelectedCard();

    g_stage.update();
}

function updateStage() {
    g_stage.update();
}

function addCard(x, y, width, height, title, color, onClickEvent) {

    var cardRoundedRadius = width * 0.05;

    var rect = new createjs.Shape();
    rect.graphics
        .beginFill(color)
        .drawRoundRect(x, 
                       y, 
                       width, 
                       height, 
                       cardRoundedRadius);

    rect.on("click", onClickEvent, null, false, title);

    g_stage.addChild(rect);

    // Required scale from the t-shirt image to the required card 
    // width and height.
    var scaleX = width / g_tshirtImage.width;
    var scaleY = height / g_tshirtImage.height;

    // To preserve aspect ratio, choose the smaller scale.
    var scale = Math.min(scaleX, scaleY);

    // Calculate the actual width and height of the t-shirt image.
    var actualWidth = g_tshirtImage.width * scale;
    var actualHeight = g_tshirtImage.height * scale;

    // Based on the actual width and height, find the correct offset
    // such that the image is centered in the card.
    var xOffset = ( width - actualWidth ) / 2;
    var yOffset = ( height - actualHeight ) / 2;

    // Calculate the required font size, given a font size for a
    // certain width.
    var baselineWidth = 180;
    var fontSizeForBaselineWidth = 3;
    var actualFontSize = actualWidth / baselineWidth * fontSizeForBaselineWidth;

    var bitmap = new createjs.Bitmap(g_tshirtImage);
    bitmap.x = x + xOffset;
    bitmap.y = y + yOffset;
    bitmap.scaleX = scale;
    bitmap.scaleY = scale;
    g_stage.addChild(bitmap);

    var text = new createjs.Text(title, actualFontSize + "em Arial", "black");
    text.x = x + width / 2;
    text.y = y + height * 0.4;
    text.textBaseline = "top";
    text.textAlign = "center";
    g_stage.addChild(text);
}

function addCards() {

    // Hard-coded amount and layout of cards.
    var cardValues = [ "XS", "S", "M", "L", "XL" ];
    var cardsInRow = 2;
    var cardsInColumn = 3;

    var cardPaddingPercentage = 0.05;

    var cardRegionWidth = g_stage.canvas.width / cardsInRow;
    var cardRegionHeight = g_stage.canvas.height / cardsInColumn;

    var cardWidthPadding = cardRegionWidth * cardPaddingPercentage;
    var cardHeightPadding = cardRegionHeight * cardPaddingPercentage;

    var cardWidth = cardRegionWidth * ( 1 - cardPaddingPercentage*2 );
    var cardHeight = cardRegionHeight * ( 1 - cardPaddingPercentage*2 );

    var x = 0;
    var y = 0;

    cardValues.forEach(function(cardValue) {

        var cardTitle = cardValue;

        var cardX = cardRegionWidth*x + cardWidthPadding;
        var cardY = cardRegionHeight*y + cardHeightPadding;

        addCard(cardX, cardY, cardWidth, cardHeight, cardTitle, "blue", onCardClick);

        x++;
        if (x >= cardsInRow) {
            y++;
            x = 0;
        }
    });

}

function addSelectedCard() {

    if (g_selectedCardTitle === null) {
        return;
    }

    var cardPaddingPercentage = 0.1;

    var cardWidthPadding = g_stage.canvas.width * cardPaddingPercentage;
    var cardHeightPadding = g_stage.canvas.height * cardPaddingPercentage;

    var cardWidth = g_stage.canvas.width - ( cardWidthPadding * 2);
    var cardHeight = g_stage.canvas.height - ( cardHeightPadding * 2);

    var cardX = cardWidthPadding;
    var cardY = cardHeightPadding;

    addCard(cardX, cardY, cardWidth, cardHeight, g_selectedCardTitle, "green", onLargeCardClick);
}

function onCardClick(event, cardTitle) {

    g_selectedCardTitle = cardTitle;
    drawEverything();
}

function onLargeCardClick(event, cardTitle) {

    g_selectedCardTitle = null;
    drawEverything();
}
