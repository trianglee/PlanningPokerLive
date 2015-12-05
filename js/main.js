"use strict";

// EaselJS stage.
var g_stage;

// Card which is currently selected.
var g_selectedCard = null;

// T-shirt image, loaded once and cached.
var g_tshirtImage;

// A lis of all the cards, at no particular order.
var g_cards = [];

// True if clicking on cards is currently allowed.
var g_cardClickAllowed = true;

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
    
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", g_stage);
}

function resize() {
    g_stage.canvas.width = window.innerWidth;
    g_stage.canvas.height = window.innerHeight;
    drawEverything();
}

function drawEverything() {
    g_stage.removeAllChildren();
    addCards();
}

function updateStage() {
    g_stage.update();
}

function addCard(x, y, width, height, title, color, onClickEvent) {

    var cardContainer = new createjs.Container();
    
    var cardRoundedRadius = width * 0.05;

    var rect = new createjs.Shape();
    rect.graphics
        .beginFill(color)
        .drawRoundRect(0, 
                       0, 
                       width, 
                       height, 
                       cardRoundedRadius);

    var cardData = {
        width: width,
        height: height,
        title: title,
    };
    cardContainer.cardData = cardData;

    rect.on("click", onClickEvent, cardContainer);

    cardContainer.addChild(rect);

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
    bitmap.x = xOffset;
    bitmap.y = yOffset;
    bitmap.scaleX = scale;
    bitmap.scaleY = scale;
    cardContainer.addChild(bitmap);
    
    var text = new createjs.Text(title, actualFontSize + "em Arial", "black");
    text.x = width / 2;
    text.y = height * 0.4;
    text.textBaseline = "top";
    text.textAlign = "center";
    cardContainer.addChild(text);

    // Set the registration point to the middle of the card.
    cardContainer.regX = width/2;
    cardContainer.regY = height/2;

    cardContainer.x = x + cardContainer.regX;
    cardContainer.y = y + cardContainer.regY;
    
    cardData.deckX = cardContainer.x;
    cardData.deckY = cardContainer.y;
    
    g_stage.addChild(cardContainer);
    
    return cardContainer;
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

        var card = addCard(cardX, cardY, cardWidth, cardHeight, cardTitle, "blue", onCardClick);
        g_cards.push(card);

        x++;
        if (x >= cardsInRow) {
            y++;
            x = 0;
        }
    });

}

function selectCard(selectedCard) {

    g_selectedCard = selectedCard;

    var cardPaddingPercentage = 0.1;

    var cardWidthPadding = g_stage.canvas.width * cardPaddingPercentage;
    var cardHeightPadding = g_stage.canvas.height * cardPaddingPercentage;

    var cardWidth = g_stage.canvas.width - ( cardWidthPadding * 2);
    var cardHeight = g_stage.canvas.height - ( cardHeightPadding * 2);

    // Card's registartion point is at its center. Calculte new X,Y in accordance.
    var cardX = cardWidthPadding + cardWidth/2;
    var cardY = cardHeightPadding + cardHeight/2;
    
    var scaleX = cardWidth / selectedCard.cardData.width;
    var scaleY = cardHeight / selectedCard.cardData.height;
    
    // Brings the card to the front.
    g_stage.setChildIndex(selectedCard, g_stage.numChildren-1);
    
    // Animate the card to the center.
    createjs.Tween.get(selectedCard)
        .call(disableCardClicks)
        .to({x: cardX, y: cardY, scaleX: scaleX, scaleY: scaleY}, 1500, createjs.Ease.getPowOut(3))
        .call(enableCardClicks);
    // Add some rotation.
    //createjs.Tween.get(selectedCard)
    //    .to({rotation: 360}, 1300, createjs.Ease.backOut);

    // Dim all other cards.
    g_cards.forEach(function(card) {
        if (card == selectedCard) {
            return;
        }
        
        createjs.Tween.get(card)
            .to({alpha: 0.2}, 500, createjs.Ease.linear);
    });
}

function unselectCard(selectedCard) {

    g_selectedCard = null;

    // Animate the card back to the deck.
    createjs.Tween.get(selectedCard)
        .call(disableCardClicks)
        .to({x: selectedCard.cardData.deckX, 
             y: selectedCard.cardData.deckY, 
             scaleX: 1, 
             scaleY: 1}, 1500, createjs.Ease.getPowOut(3))
        .call(enableCardClicks);
    // With rotation.
    //createjs.Tween.get(selectedCard)
    //    .to({rotation: 0}, 1300, createjs.Ease.backOut);

    // Undim all other cards.
    g_cards.forEach(function(card) {
        if (card == selectedCard) {
            return;
        }
        
        createjs.Tween.get(card)
            .wait(1000)
            .to({alpha: 1}, 500, createjs.Ease.linear);
    });
}

function disableCardClicks() {
    g_cardClickAllowed = false;
}

function enableCardClicks() {
    g_cardClickAllowed = true;
}

function onCardClick(event, cardData2) {

    if (!g_cardClickAllowed) {
        return;
    }
    
    if (g_selectedCard == null) {
        selectCard(this);
    } else if (g_selectedCard == this) {
        unselectCard(this);
    }
}
