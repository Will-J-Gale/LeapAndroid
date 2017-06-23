var scene, camera, renderer, orbit, 
    rHand, lHand, mixArea, gui, stats; 

function changeScene(scene)
{
    switch(scene.uuid)
    {
        case SCENES.startMenu.uuid:
            startMenuScene(scene)
            break;
        case SCENES.mixingDesk.uuid:
            mixingDeskScene(scene)
            break;
    }
}
function mixingDeskScene(scene)
{
    SCENES.startMenu.remove(camera)
    SCENES.mixingDesk.add(camera)
    SCENES.currentScene = scene 

    for(var i = 0; i < camera.children.length; i++)
    {
        var child = camera.children[i];
            if(child.uuid != MIX.LOADING_SCREEN.uuid 
            && child.uuid != MIX.TEXT.LOADING.MESH.uuid 
            && child.uuid != MIX.TEXT.HOVERING.MESH.uuid)
            {
                child.visible = true;
                child.userData.active = true;
            }
    }
    
    MIX.userOptions.frontView();
}
var smoothing = 0.99;
var SCENES = {
    startMenu: new THREE.Scene(),
    mixingDesk: new THREE.Scene(),
    currentScene: null,
    changeScene : changeScene
}
SCENES.currentScene = SCENES.mixingDesk;

var directLight = null;

var guiFolders = {};
var audioArray = []
var playButton, exitButton, mixButton1, mixButton2, mixButton3,
    mixingDeskButtons, startMenuButtons;

var processedBuffers = [];
var fftWorker = new Worker('lib/analysis/fftWorker.js');
fftWorker.onmessage = function(e)
{
    var data = e.data;
    switch(data.message)
    {
        case 'incrementLoader':
            console.log(data.fundemental, data.centroid)
            MIX.AUDIO_ARRAY[data.index].centroidFreq = data.centroid;
            //MIX.AUDIO_ARRAY[data.index].fft = data.fft;
            //processedBuffers.push(data.processed)
            break;
        case 'finishedLoading':
            console.log("Finished")
            spectralCentroidDisplay();
            finishedLoading();
            break;
    }
}

var VIEWS = {
    FRONT: 0,
    RIGHT: 1, 
    TOP: 2
}
var MODES = {
    NORMAL: 0,
    EQ: 1,

}
var mode = MODES.NORMAL;
var eqObj = null;
var mixArea;
var WALL_COLOR = "white"

var BONE_GRAB_COLOR = "red",
    BONE_COLOR = "white"

var eqGestures = {
    HPF:0,
    LPF:1,
    PEAK:2
}
var eqGesture = null,
    setEqGesture = false;

var DISTANCE_THRESH = 200;

var EQ_RIBBON_OPACITY = 0.2,
    EQ_MODE_DEFAULT = 'MakeupGain';

var EQ_FREQ_MIN = 20,
    EQ_FREQ_MAX = 20000,
    EQ_LEVEL_MIN = -16,
    EQ_LEVEL_MAX = 16,
    EQ_WIDTH = 30,
    EQ_QWIDTH_MIN = EQ_WIDTH / 12,
    EQ_QWIDTH_MAX = 95,
    EQ_YOFFSET = 60,
    EQ_Q_OFFSET = 500,
    EQ_Q_MIN = 0.1,
    EQ_Q_MAX = 30,
    EQ_RIBBON_MIN = 17,
    EQ_RIBBON_MAX = 100,
    EQ_RIBBON_OPACITY = 0.2,
    EQ_DELAY = 500;

var buttonsActive = true,
    BUTTON_POS_X = -800,
    BUTTON_POS_Z = -650;

var LIGHT_OFFSET = 50;

var MOVE_DELAY = 1000,
    ACTIVE_DELAY = 500;

var smoothedEqSet = true;
var DIRECTIONS = {
    UP: new THREE.Vector3(0, 1, 0),
    DOWN: new THREE.Vector3(0, -1, 0),
    LEFT: new THREE.Vector3(-1, 0, 0),
    RIGHT: new THREE.Vector3(1, 0, 0),
    BWD: new THREE.Vector3(0, 0, -1),
    FWD: new THREE.Vector3(0, 0, 1),
}
var cameraTimer = 0;
var CAMERA_CHANGE_OFFSET_R = 400,
    CAMERA_CHANGE_OFFSET_F = 20;
    CAMERA_CHANGE_OFFSET_T = 20

var CAMERA_POS_F = new THREE.Vector3(0, 0, MIX.CAMERA_OFFSET),
    CAMERA_POS_R = new THREE.Vector3(MIX.BOX_WIDTH, 0, MIX.BOX_CENTER),
    CAMERA_POS_T = new THREE.Vector3(0, MIX.BOX_HEIGHT * 1.25, MIX.BOX_CENTER + 1),
    CAMERA_TARGET = new THREE.Vector3(0, 0, MIX.BOX_CENTER);

var UP = new THREE.Euler(-Math.PI / 2, 0, 0),
    DOWN = new THREE.Euler(Math.PI / 2, 0, 0),
    LEFT = new THREE.Euler(0, -Math.PI / 2, 0),
    RIGHT = new THREE.Euler(0, Math.PI / 2, 0),
    BWD = new THREE.Euler(0, Math.PI, 0),
    FWD = new THREE.Euler(0, 0, 0);


var TEXT = {
    LOADING: {
        STRING : "Please Wait...",
        MESH: null
    },
    HOVERING: {
        STRING : "Drop files to begin loading",
        MESH: null
    }
}
var saved = false;

var empty = function(){return}
/*var VIEW_TEXT = {
    FRONT: {
        STRING : "Front",
        MESH: null
    },
    TOP: {
        STRING : "Top",
        MESH: null
    },
    LEFT: {
        STRING : "Left",
        MESH: null
    },
    RIGHT: {
        STRING : "Right",
        MESH: null
    },
    TOP: {
        STRING : "Top",
        MESH: null
    },
    BOTTOM: {
        STRING : "Bottom",
        MESH: null
    }
}*/
var VIEW_TEXT = {
    FRONT: {
        VIEW: {
            STRING: "Front",
            MESH: null
        },
        LEFT: {
            STRING: "Left",
            MESH: null
        },
        RIGHT: {
            STRING: "Right",
            MESH: null
        },
        TOP: {
            STRING: "Top",
            MESH: null
        }
    },

    LEFT: {
        VIEW: {
            STRING: "Left",
            MESH: null
        },
        LEFT: {
            STRING: "",
            MESH: null
        },
        RIGHT: {
            STRING: "Front",
            MESH: null
        },
        TOP: {
            STRING: "Top",
            MESH: null
        }
    },
    RIGHT: {
        VIEW: {
            STRING: "RIGHT",
            MESH: null
        },
        LEFT: {
            STRING: "Front",
            MESH: null
        },
        RIGHT: {
            STRING: "",
            MESH: null
        },
        TOP: {
            STRING: "Top",
            MESH: null
        }
    },
    TOP: {
        VIEW: {
            STRING: "TOP",
            MESH: null
        },
        LEFT: {
            STRING: "Left",
            MESH: null
        },
        RIGHT: {
            STRING: "Right",
            MESH: null
        },
        TOP: {
            STRING: "Front",
            MESH: null
        }
    },
}
var TEXT_Z_POS = -330;
var VIEW_TEXT_POS = new THREE.Vector3(0, -200, TEXT_Z_POS),
    VIEW_TEXT_POS_L = new THREE.Vector3(-360, -200, TEXT_Z_POS),
    VIEW_TEXT_POS_R = new THREE.Vector3(360, -200, TEXT_Z_POS),
    VIEW_TEXT_POS_T = new THREE.Vector3(0, 200, TEXT_Z_POS),
    SIDE_OFFSET = 100;

var ACTIVE_REGION_NORMAL = new THREE.Box3(
    new THREE.Vector3(MIX.BOX_LEFT * 1.5, MIX.BOX_BOTTOM * 1.6, MIX.BOX_BACK * 1.2),
    new THREE.Vector3(MIX.BOX_RIGHT * 2, MIX.BOX_TOP * 2, MIX.BOX_FRONT * 0.5)
    ),
    ACTIVE_REGION_EQ = new THREE.Box3(
    new THREE.Vector3(MIX.BOX_LEFT * 1.5, MIX.BOX_BOTTOM * 1.2, MIX.BOX_BACK * 1.2),
    new THREE.Vector3(MIX.BOX_RIGHT * 2.2, MIX.BOX_TOP * 1.2, MIX.BOX_FRONT * 0.8)
    );

var INACTIVE_AREA = MIX.BOX_RIGHT * 1.75,
    INACTIVE_OVERLAP_L = INACTIVE_AREA - 70,
    INACTIVE_OVERLAP_R = INACTIVE_AREA + 70;

var checkState;