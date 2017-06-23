// Useful routines for all Web Audio applications

// Initialize a new context. We must do this for all new applications.
// It's like setting up a new project.

// Historical versions of Web Audio are accounted for

context = new (window.AudioContext || window.webkitAudioContext)();

if (!context.createGain)
  context.createGain = context.createGainNode;
if (!context.createDelay)
  context.createDelay = context.createDelayNode;
if (!context.createScriptProcessor)
  context.createScriptProcessor = context.createJavaScriptNode;

// Initialize for Animation (Multiple browsers accounted for)

window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame    || 
  window.oRequestAnimationFrame      || 
  window.msRequestAnimationFrame     || 
  function( callback ){
  window.setTimeout(callback, 1000 / 60);
};
})();

// This is a handy routine for allowing us to play back audio files.
// It takes care of buffering of the sample and allows us to specify a start time x

function playSound(buffer, time) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);

// Historical versions of Web Audio are accounted for here. If the version
// doesn't evaluate true for source.start then noteOn is used otherwise
// start is used.
// So, for our purposes this statement evaluates to source.start(time)

  source[source.start ? 'start' : 'noteOn'](time);
}

// This function loads samples into an array
// names[] holds a list of property names, so that we can refer to
// samples by a name rather than an array index number

function loadSounds(obj, soundMap, callback) {
  // Put into arrays
  
  var names = [];
  var paths = [];

// This for loop
// uses each of the property names in the user-defined properties of an array object

  for (var name in soundMap) {
    var path = soundMap[name];

// Push adds new items to the end of an array

    names.push(name);
    paths.push(path);
  }
  
// Load up the buffers 
  
  bufferLoader = new BufferLoader(context, paths, function(bufferList) {
    for (var i = 0; i < bufferList.length; i++) {
      var buffer = bufferList[i];
      var name = names[i];
      
// Remember that obj corresponds to a sound source that is created
      
      obj[name] = buffer;
    }
    
// If there is a callback function then call it. This can be used because we are 
// loading our data asynchronously

    if (callback) {
      callback();
    }
  });
  bufferLoader.load();
}


function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

// Create a series of audio buffers

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  // XMLHttpRequest ia used to bring in the sample data
  
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

// request.onload is called after the data is received

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  }

// Send the request

  request.send();
};

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
};