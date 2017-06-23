function LoadSounds(context) 
{
	var loader = new BufferLoader(context, ['client/audio/Kick.wav', 'client/audio/Snare.wav', 'client/audio/Overhead2.wav', 'client/audio/Tom1.wav', 
                                          'client/audio/Tom2.wav', 'client/audio/BassDI.wav', 'client/audio/BassAmp.wav', 'client/audio/Gtr1.wav', 
                                          'client/audio/Gtr2.wav', 'client/audio/LeadVox.wav', 'client/audio/LeadVoxDoubletrack.wav'], onLoaded);

  	function onLoaded(buffers) 
  	{
    	audioBuffer = buffers;
    	loaded = true;
		if(loadCookie("fftDone") == null)
		{
			for(var i = 0; i < audioBuffer.length; i++)
			{
				renderOffline(audioBuffer[i], audioFilesID[i]);
			}
			saveCookie("fft", true);
		}
		else
		{
			for(var i = 0; i < audioFilesID.length; i++)
			{
				centroidArray[i] = loadCookie(audioFilesID[i]);
			}

			if(loadCookie("pos") != null)
			{
				var tempArray = JSON.parse(loadCookie("pos"));
				for(var i = 0; i < audioObjects.length; i++)
				{
					var xTextScale = audioObjects[i].id.length / 2;
					audioObjects[i].sphere.position.set(tempArray[i].x, tempArray[i].y, tempArray[i].z);
					audioObjects[i].text.position.set(tempArray[i].x - (textXOffset * xTextScale), tempArray[i].y, tempArray[i].z + textZOffset);
				}
			}
			spectralCentroidDisplay();
		}
    };

    loader.load();
 }

 function playSounds()
 {
 	if(!isPlaying)
 	{
 		isPlaying = true;

 		for(var i = 0; i < audioBuffer.length; i++)
 		{
 			//Creates all nodes
	 		var source = audioContext.createBufferSource(); 
			var gainNode = audioContext.createGain();
			var pannerNode = audioContext.createStereoPanner();

			//Sets value for nodes
			source.buffer = audioBuffer[i]; //audioBuffer array contains all sounds

			audioObjects[i].audioBuffer = source;
			audioObjects[i].gainNode = gainNode;
			audioObjects[i].panNode = pannerNode;

			SetLevel(audioObjects[i].sphere.position.z, i);
			SetPan(audioObjects[i].sphere.position.x, i);
			
			//Connects all nodes
			source.connect(pannerNode);
			pannerNode.connect(gainNode);
			gainNode.connect(audioContext.destination);

			//Plays audio
			source.start(0);
			source.loop = true;		
 		}
 	}	 	
 }

function SetLevel(zPos, sphereID)
{
	var newGain = (((zPos - boxBack) * 1) / depth) + 0; // Changes range of z position into 0-1
    audioObjects[sphereID].gainNode.gain.value = Math.pow(-newGain, 0.5); //The Math function creates a logorithmic like taper on the audio
	
}

function SetPan(xPos, sphereID)
{
    var newPan = (((-xPos - boxRight) * 2) / boxWidth) + -1; //Changes range of x position to -1 to 1
	console.log(newPan);
    audioObjects[sphereID].panNode.pan.value = newPan;  
	//NewValue = (((OldValue - OldMin) * NewRange) / OldRange) + NewMin
}

function stopSounds()
{
 	for(var i = 0; i < audioObjects.length; i++) // Loops through all nodes in the array and stops them
 	{
 		isPlaying = false;
 		audioObjects[i].audioBuffer.stop();
 	}
}
