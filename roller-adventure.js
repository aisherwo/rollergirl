/*
	PLEASE NOTE:
	- This demo HTML5 game was created by Orion Atkinson for Interactive Design and development 2 in the Interactive Media program at Confederaion College
    - Graphic Design and Illustration by Callen Retter
    - Sounds from freesounds.org
    - All images found via creative commons licencing
*/

           
var KEYCODE_ENTER = 13;		//usefull keycode
var KEYCODE_SPACE = 32;		//usefull keycode
var KEYCODE_UP = 38;		//usefull keycode
var KEYCODE_LEFT = 37;		//usefull keycode
var KEYCODE_RIGHT = 39;		//usefull keycode  
var KEYCODE_W = 87;			//usefull keycode
var KEYCODE_A = 65;			//usefull keycode
var KEYCODE_D = 68;			//usefull keycode

//ROOT VARIABLES
//Note: you MUST declare main objects in the root "namespace" (i.e. outside of the functions) so you can refer to them from with any of the functions
//you can declare names of multiple variables or objects in one line seperated by commas
var canvas, stage;

//declare text fields
var titleField, instructionsField;

//declare game objects
var rollerGirl;
//declare backgrounds etc. 
var fgA, fgB, mg, bg1, bg2, sky;
//NOTE: foreground A and B is used for endless background trick

//other objects
var peel;

//declare a width va for foreground (for endless background trick)
var fgWidth;

//declare game vars
//velocity parameters for moving the spaceMan on the "tick" loop (higher numbers make it go faster)
var xv = 0;
var yv = 0;
var speed = 5;
var rightLimit = 550;
var leftLimit = 100;
var groundLevel = 575;
//Note: Low gravity on the moon!
var gravityEffect = .2;
//don't need much jump power in low gravity 
//Note: negative y velocity will make things move up
var jumpPower = -8;

var friction = .9;

//use Booleans to keep track of character state
//to avoid skating on air...
var jumping = true;  //true because he is falling at first
//to avoid stutter step when a key is held down and repeats
//use skating Boolean to know when skate animation is already playing
var skating = false;
var fallen = false;

//use Booleans to keep track of game state
var atEnd = false;

function init() {
    //declare canvas as element with id attribute value "canvas"
    //NOTE: need reference to canvas to get canvas dimensions 
    canvas = document.getElementById("canvas");
    //http://www.createjs.com/docs/easeljs/classes/Stage.html
	stage = new createjs.Stage(canvas);

    //preload sounds!
    loadSounds();
    
    //Now add and set up any initial "display objects"
    //Note: the order that you add them effects z-index or stacking order
    
    //add backgrounds first so character and text are on top
    addBackgroundsEtc();
    addtitleField();
    addInstructionsField();
    addPeels(); //add peel before girl so she's in front of it
    addRollerGirl();
    
    //http://www.createjs.com/docs/easeljs/classes/Ticker.html
	//set up the "tick" event listener.
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", onTick);
    
    //handle key events            
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
}

//ASSET LOADING

function loadSounds () {
    //register any sounds here
    console.log("Registering Sounds...");
    
    //MAKE SURE YOU GIVE CREDIT FOR ANY SOURCE MEDIA!
    
    //sound downloaded from https://freesound.org/people/ItsFunnyInc/sounds/141462/ under creative commons licence and edited by Orion Atkinson
    createjs.Sound.registerSound("sounds/roller-skates.mp3", "skate");
    
    //sound downloaded from https://freesound.org/people/fins/sounds/191590/ under creative commons licence and edited by Orion Atkinson
    createjs.Sound.registerSound("sounds/toy-jump.mp3", "jump");
    
    //sound downloaded from https://freesound.org/people/qubodup/sounds/222501/ under creative commons licence and edited by Orion Atkinson
    createjs.Sound.registerSound("sounds/fall.mp3", "fall");
    
    //add event handler for load if you want to play a sound automatically
    createjs.Sound.addEventListener("fileload", onSoundLoad);
   
}
function onSoundLoad(e){
    console.log("Sound Loaded: "+e);   
}

function addBackgroundsEtc(){

    //Note: make sure to add in order of z-depth
    //create new Bitmap object and load image into it
    sky = new createjs.Bitmap("images/Sky.png");
    //do some positioning with the x and y properties
    sky.x = 0;
    sky.y = 0;
    //add to the stage
    stage.addChild(sky);
  
    //repeat for any other backgrounds...
    bg2 = new createjs.Bitmap("images/BG2.png");
    bg2.x = 0;
    bg2.y = 30;
    stage.addChild(bg2);     
    bg1 = new createjs.Bitmap("images/BG1.png");
    bg1.x = 0;
    bg1.y = 40;
    stage.addChild(bg1);     
    mg = new createjs.Bitmap("images/Midground.png");
    mg.x = 0;
    mg.y = 185;
    stage.addChild(mg);   
    
    //foreground A
    fgA = new createjs.Bitmap("images/Foreground.png");
    fgA.x = 0;
    fgA.y = 245;
    stage.addChild(fgA); 
    
    //add an onload handler function to the image object to get image properties like width (can only do this after it's loaded) 
    fgA.image.onload = function() {      
        console.log("Foreground loaded. Getting Width...");
        console.log("   Foreground width: "+fgA.image.width);   
        //assign value to foreground width var
        fgWidth = fgA.image.width;
    }   
    
    //load another instance of the same foreground image for endless background trick
    fgB = new createjs.Bitmap("images/Foreground.png");
    //Trick: stick foreground B to be on the right hand side of foreground A
    fgB.x = fgA.x + fgWidth;
    fgB.y = 245;
    stage.addChild(fgB);
    
}

function addPeels(){
    //banana downloaded and edited by Orion Atkinson under Creative Commons licence from http://www.publicdomainfiles.com/show_file.php?id=13551062414582
    peel = new createjs.Bitmap("images/banana-peel_sm.png");
    //peel.scale = 1;
    peel.y = groundLevel-20;
    peel.x = 500;
    stage.addChild(peel);
    
}
//STAGE SETUP FUNCTIONS
function addtitleField(){
	//Create a new Text "object"!
    //http://www.createjs.com/docs/easeljs/classes/Text.html
	titleField = new createjs.Text("IMD ROLLER GIRL\nHTML5 GAME PROTOTYPE", "bold 36px Verdana", "#037d91");
    //NOTE: \n will start your text on a new line

    // set text position
    titleField.x = 40;
    titleField.y = 30;
    
    //play with properties of EaselJS "API"
    //titleField.outline = 2;
    //titleField.shadow = new createjs.Shadow("#333", 0, 0, 10);
    
    //use addChild() function/method to add display objects to the stage
    stage.addChild(titleField);  
}
function addInstructionsField(){
	//Create a new Text "object"!
    //http://www.createjs.com/docs/easeljs/classes/Text.html
	instructionsField = new createjs.Text("USE A & D KEYS TO SKATE AND W TO JUMP", "bold 21px Verdana", "#033a43");
    //NOTE: \n will start your text on a new line

    // set text position
    instructionsField.x = 40;
    instructionsField.y = 130;
    
    //use addChild() function/method to add display objects to the stage
    stage.addChild(instructionsField);  
}

function addRollerGirl(){
    //http://www.createjs.com/docs/easeljs/classes/Shape.html
    rollerGirl = new RollerGirl();
    rollerGirl.x = 300;
    //start him in the air and let gravity push him to the ground level
    rollerGirl.y = 0;
    
    //can resise here with scaleX and scaleY properties
    //rollerGirl.scaleX = .5;
    //rollerGirl.scaleY = .5;
    
    //add as a child of the stage
    stage.addChild(rollerGirl);
    
    //start in resting position
    rollerGirl.rest();
      
    //Note: any timeline control code in Animate timeline doesn't export with spritesheet.
    //However, you can set the next sequences for spritesheet animations.
    RollerGirl._SpriteSheet.getAnimation("jump").next = "rest";

}

function onTick(){
    
    //SCRIPTED MOTION
    
    //use velocity parameters to update x and y properties
    rollerGirl.x += xv;
    rollerGirl.y += yv;
    
    //xv *= friction;
    
    //add gravity effect!
    yv += gravityEffect;
    
    //don't let the character go below the ground level
    if (rollerGirl.y > groundLevel){
        //console.log("spaceMan hit the ground!");
        rollerGirl.y = groundLevel;
        yv = 0;
        //if on the ground, not jumping. don't forget to update the boolean
        jumping = false;
        
        //if moving left or right, hit the ground skating
        //NOTE: if xv is anything but zero, then he's moving!
        if(xv != 0 && skating == false){
            //moving and on ground so must be skating. 
            rollerGirl.skate();                
            //play appropriate sound effect
            createjs.Sound.play("skate", {loop: -1});
            //Note: loop -1 means endless looping (default is zero for no loops)
            //don't forget to update the boolean!
            skating = true;
        }
       
    }   
    
    //Trick: can use a background object to set end limit of level
    //in this case, log midground x property until past it's edge
    //then use the logged number to set a limit
    //console.log("mg.x = "+mg.x);
    if(atEnd == false && mg.x < -2680){
        //console.log("Past Edge");
        atEnd = true;
        //change left and right limits for boss battle?
        leftLimit = 50;
        rightLimit = 750;
        //provide update or instructions
        instructionsField.text = "YOU MADE IT TO THE END!\nPREPARE FOR THE BIG BOSS BATTLE!";
    } 
    
    //move backgrounds the opposite direction at different speeds
    
    //but only move them if the character isn't at the end yet
    //AND only if character is moving right (xv > 0)
    if(atEnd == false && xv > 0){
        //move the foreground in the opposite direction at the equal speed
        fgA.x -= xv;
        //Note: divide xv by different numbers to get parallax effect
        //Tip: try random numbers and get the right "feel" through trial and error
        mg.x -= xv/4;
        bg1.x -= xv/15;
        bg2.x -= xv/20;
        sky.x -= xv/50;
        peel.x -= xv;
    }
    
    //make it interesting by moving the sky a bit all the time even if character not moving
    sky.x -= .1;
    //Note: the sky will run out but the canvas background matches so you won't notice :)
    
    //ENDLESS BACKGROUND SOLUTION
    
    //Trick 1: stick foreground B to be on the right hand side of foreground A
    fgB.x = fgA.x + fgWidth - 2; // subtracting 2 covers up a tiny seam
    
    //can add a few pixels between if you want to see the seam
    //fgB.x = fg.x + fgWidth + 10;
    
    //Trick 2: when foreground B gets to zero x, to a quick switch...
    if(fgB.x <= 0){
        fgA.x = 0;
    }
    
    //set motion limits for character
    if(rollerGirl.x < leftLimit){
        rollerGirl.x = leftLimit;
    } else if(rollerGirl.x > rightLimit){
        rollerGirl.x = rightLimit;
    }
    
    //COLLISION DETECTION (well, not realy...)
    
    //if the roller girl's x property is in the range of the banana peel and she's not jumping, then she falls
    if(rollerGirl.x > peel.x && rollerGirl.x < (peel.x + 50) && jumping == false && fallen == false){
        console.log("HIT!");    
        rollerGirl.fall();
        fallen = true;
        //stop the world from moving
        xv = 0;
        yv = 0;
        //stop other sounds and play appropriate sound effect
        createjs.Sound.stop();
        createjs.Sound.play("fall");
        //provide update o
        instructionsField.text = "GAME OVER! \nYOU TRIPPED ON A BANANA PEEL!";
    } else{
        //console.log("Not hit...");
    }
    
    //update/redraw the canvas at the tick rate (e.g. 60 times per second)
    stage.update();   
}

//KEY EVENT HANDLER FUNCTIONS
//allow for WASD and arrow control scheme
function onKeyDown(e) {
    
    if(fallen == false){
        
     //cross browser issues exist and may need to use window.event 
    //  https://developer.mozilla.org/en-US/docs/Web/API/Window/event
    if (!e) {
        e = window.event;
    }
    //test the keycode
    console.log("Keycode of key pressed: "+e.keyCode);
    
    if(e.keyCode == KEYCODE_A){
        //skate left
        
        //only skate if not already skating
        if(skating == false){
            //trick: flip horizontally with scaleX property
            rollerGirl.scaleX = -1;
            //move left with negative x velocity
            xv = -speed; 
            
            //don't play skate cycle if jumping
            if(jumping == false){
                //play spritesheet animated sequence!
                rollerGirl.skate();
                
                //play appropriate sound effect
                createjs.Sound.play("skate", {loop: -1});
                //Note: loop -1 means endless looping (default is zero for no loops)
                
                //don't forget to update boolean!
                skating = true;
            }
        }
    } else if(e.keyCode == KEYCODE_D){
        //skate right
        
        //only skate if not already skating
        if(skating == false){
            //trick: flip horizontally with scaleX property
            rollerGirl.scaleX = 1;
            //move right with positive x velocity
            xv = speed;
            
            //don't play skate cycle if jumping
            if(jumping == false){
                //play spritesheet animated sequence!
                rollerGirl.skate();
                
                //play appropriate sound effect
                createjs.Sound.play("skate", {loop: -1});
                //Note: loop -1 means endless looping (default is zero for no loops)
                
                //don't forget to update boolean!
                skating = true;
            }
        }
    } else if(e.keyCode == KEYCODE_W){
        //Jump!
        //only jump if not already jumping
        if(jumping == false){
            
            //stop any looping sound effect (eg. walking sound)
            createjs.Sound.stop();
            
            yv = jumpPower;
            rollerGirl.jump();
            
            //play appropriate sound effect
            createjs.Sound.play("jump");
            
            //don't forget to update the boolean!
            jumping = true;
            
        }
    } 
    }//fallen condition
}

function onKeyUp(e) {
    if(fallen == false){
        
    //cross browser issues exist
    if (!e) {
        e = window.event;
    }
    //test the keycode
    console.log("Keycode of key released: "+e.keyCode);
 
    //reset velocity parameters to zero
    if(e.keyCode == KEYCODE_A){
        xv = 0;
        rollerGirl.rest();
        //don't forget to update boolean!
        skating = false;
        //stop any looping sound effect (eg. walking sound)
        createjs.Sound.stop();
        
    } else if(e.keyCode == KEYCODE_D){
        xv = 0;
        rollerGirl.rest();
        //don't forget to update boolean!
        skating = false;
        //stop any looping sound effect (eg. walking sound)
        createjs.Sound.stop();
        
    }
    //don't forget to update boolean!
    skating = false;
        
    }//fallen condition
}
