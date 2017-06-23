//global variables //////////////////////////////////////////////////////////
var fftSize = 2048;//need to define this variable value globally
var sampleRate = 44100; //define the sample rate
var audioContext = new AudioContext();
var finishedLoading = true
//function to fill first 1024 values of the window 2 arraywith zeros
//array.length == fftSize

function zeroPad(array)
{
	//Simple for loop to fill the array with 0.0s
	for (i = 0; i < fftSize/2; i++) 
	{ 
    	array[i] = 0.0;//make the cell value = 1.0(floNum)
	}
	//console.log('zeropadding complete');//just show me whats happening
}

function renderOffline(buffer, url)
{
	if(loaded === true)
	{
		var audioCtx = audioContext;
		//variables required by the function///////////////////////////////////////////

		var offlineCtx = null; //offline audio context
		var numChannels = 1; //number of channels in the audio file (1 by default as the tracks are mono)
		var source = null; //the source node

		var audioFileDuration = null; //use this variable to store the audio file's duration (in seconds)
		var audioBufferLength = null; //this is used when the offline context is defined
		var myRenderedBuffer = null; //used to access the audio buffer's data
		
		var hann = new WindowFunction(DSP.HANN);//define the hann window in dsp.js
		var fft = new FFT(fftSize, sampleRate);//define the FFT in dsp.js
		//define the fft variable - currently using the dsp.js library while I wait for web audio to catch-up
		var noOfFFTBins = fftSize/2;
		var myRenderedBuffer = null; //used to store the channel data from the renderedBuffer created by offline processing
		//var windowArray = [];
		var windowOnearray = []; //store fft frames for window one
		var windowTwoarray = []; //store fft frames for window two (2x overlap)
		var fftArray = []; //stores the sum of windowOnearray[i] + windowTwoarray[i] as fftArray[i]
		//zero-pad the windowTwoArray
		zeroPad(windowTwoarray);//add zeros for the first 

		/////////////////////////////////LOAD EM IN! /////////////////////////////////////////
		
		audioFileDuration = buffer.duration; //get the duration by querying the audio buffer
		//console.log("audio file decoded"); //log it so we can see it
		audioBufferLength = sampleRate * audioFileDuration;
	
		offlineCtx = new OfflineAudioContext(numChannels,audioBufferLength,sampleRate);
		// make the myRenderedBuffer the same length as the audioBufferLength variable
		myRenderedBuffer = new Float32Array(audioBufferLength);
		// create a buffer source to link up
		source = offlineCtx.createBufferSource();
		//now we can get the data from the file
		source.buffer = buffer;
		//notice that we are connecting it to the offline context
		source.connect(offlineCtx.destination);
		//notice even in offline mode we still need to tell the source to start
		source.start(0);

		//uses the offlineAudioContext to render the data 
		//once it has rendered we can do what we like within the function
		//i think this is referred to as returning the promise...
		offlineCtx.startRendering().then(function(renderedBuffer)
		{
			//console.log('offline rendering complete');//alert
			//console.log(renderedBuffer);
			renderedBuffer.copyFromChannel(myRenderedBuffer,0,0);//need to copy the channel data from the audio buffer so we can process it
			//console.log(myRenderedBuffer);//check its the same

			//window 1 //////////////////////////////////////////////////////////
			//split in to chunks
			//console.log('window 1');
			var chunks = chunkBuffer(myRenderedBuffer, fftSize, 0);//call the function to perofrm the offline FFT. Third arg is the offset
			//console.log(chunks);

			//perform hann window and fft on each chunk //////////////////
			//console.log('performing hann window and fft......');
			chunks.forEach(function(chunks)
				{
					fft.forward(hann.process(chunks));//perform the fft on the chunk
					var fftd = fft.spectrum;//capture the spectrum by linking the spectral data to a variable
					for (i=0; i<fftd.length; i++)//we can then iterate through the variable and store each value in a master array
					{
						windowOnearray.push(fftd[i]);//store those values
					}
					// asynchonous simulator: zsoltfabok.com/octopress/blog/2012/08/javascript-foreach
					setTimeout(function()
					{
						//console.log(chunks);
					}, 300);
				});
			
			//console.log('windowOnearray complete');

			//window 2 //////////////////////////////////////////////////////////
			//split in to chunks (note 3rd arg offset = noOfFFTBins = 1024)
			//console.log('window 2');
			var chunksTwo = chunkBuffer(myRenderedBuffer, fftSize, noOfFFTBins);//notice the 3rd arg offset == fftsize/2 for 2x overlap
			//console.log(chunksTwo);//now show me the array that holds all the fft frames
			//console.log('performing hann window and fft......');
			//perform hann window and fft on each chunk //////////////////
			chunksTwo.forEach(function(chunksTwo)
				{
					fft.forward(hann.process(chunksTwo));//perform the fft on the chunk
					var fftd = fft.spectrum;//capture the spectrum by linking the spectral data to a variable
					for (i=0; i<fftd.length; i++)//we can then iterate through the variable and store each value in a master array
					{
						windowTwoarray.push(fftd[i]);//store those values
					}
					
					// asynchonous simulator: zsoltfabok.com/octopress/blog/2012/08/javascript-foreach
					setTimeout(function()
					{
						//console.log(chunks);
					}, 300);
				});
			//console.log('windowTwoarray complete');

			//sum overlapping windows////////////////////////////////////
			//console.log('calculating fft output....');
			//simple for loop (misses off the last fft frame so we only have to zero pad windowTwoarray [window 2 only])
			for (i=0; i<windowOnearray.length; i++)
			{
				fftArray[i]= windowOnearray[i]+windowTwoarray[i];
			}
			//turn back in to chunks == synchronise frames
			var fftChunks = chunkBuffer(fftArray, noOfFFTBins, 0);
			//console.log('complete: you can sleep now chris');

			//the next few functions need the frames of silence stripped from the fft array
			//using a gate
			var gatedFFTArray = gate(fftChunks);

			//Threshold Tally i.e. how often is there energy above a threshold level across all fft frames
			//calculate it...
			var thresholdTally = thresholdTallyAlgorithm(gatedFFTArray);
			//plot it...
			//thresholdTallyPlot(thresholdTally, gatedFFTArray);

			//FFT Bin Averages (Mean)
			//calculate it..
			var averageFftArray = fftBinAveragesAlgorithm(gatedFFTArray);
			//plot it..
			//fftBinAveragesPlot(averageFftArray);

			//setTheThreshold(gatedFFTArray);
			//console.log(spectralCentroid(averageFftArray) * 21.5, url);

			sortCentroidArray(url, averageFftArray);
			getFundemental(averageFftArray);
			
			//centroidArray.push(spectralCentroid(averageFftArray) * 21.5);
			
			//this last little bit is part of the xhr render offline promise
			}).catch(function(err)
			{
				console.log('rendering failed:' + err);
			});
		
		
	    	//console.log( 'rendering offline........' );//tell mewhats happening	
		}		
}

//this function creates chunks of data and outputs a multidimensional array
function chunkBuffer(myRenderedBuffer, chunkSize, offset)//arg1 = array to chunk //arg2 = number of samples in each chunk //arg3 = any offset applied
{
	//console.log( 'splitting into chunks........' );
	var bufferIndex;// this keeps track of where we are in the buffer 
	var bufferLength = myRenderedBuffer.length; //defines the variable for the for loop max
	var chunk = chunkSize;//chunk steps up the queried bufferIndex at intervals == fftSize
	var chunkedArray = [];
	//chunk for window 1 //////////////////////////////////////////////////////////////////////////////////////////
	for (bufferIndex=offset; bufferIndex<bufferLength; bufferIndex+=chunk) 
	{
		realDataInput = [].slice.call(myRenderedBuffer, bufferIndex, bufferIndex + chunk);//take a slice of the myRenderedBuffer array from [bufferIndex] to [bufferIndex + chunk]
		//console.log(realDataInput.length);//just to show whats going on

		if (realDataInput.length == chunkSize)
		{
			chunkedArray.push(realDataInput);
		}
	}
	//console.log( 'chunking complete' );
	//console.log(chunkedArray);
	return chunkedArray;
}

//initiate the functions when the page loads
function init()
{
	//LoadSounds(audioContext);
}

//window.onload = init();//kick the whole thing off when the window is loaded




///////////////////////////OLD CODE ////////////////////////////////////////////////////

//this is the callback function defined in the forEach method used to process each frame array
//https://msdn.microsoft.com/library/ff679980(v=vs.94).aspx
//appears to be more efficient than a for loop with regards to data integrity
function calcWindow(value, index, array1)
{

	hann.process(array1[index]);//use hann window to process array
	windowArray.push(array1[index]);
}

function calcFFT(value, index, array1)
{
	//
	var fft = new FFT(fftSize, sampleRate);
	fft.forward(array1[index]);
	var fftd = fft.spectrum;
	//push each value in to the corresponding array
	FFTarray.push(fftd);
	//console.log(fftd);
}

function getFundemental(fftArray)
{
	var tempPeaks = peakFinder(fftArray);
	var tempLargest = 0;
	
	for(var i = 0; i < tempPeaks.length; i++)
	{
		if(fftArray[tempPeaks[i]] > tempLargest)
		{
			tempLargest = tempPeaks[i] * 21.5
		}
	}
	console.log("Fundemental:" + tempLargest);
	return;
}

function sortCentroidArray(url, fftArray)
{
	for(var i = 0; i < audioFilesID.length; i++)
	{
		if(audioFilesID[i] == url)
		{
			centroidArray[i] = spectralCentroid(fftArray) * 21.5;
			saveCookie(url, centroidArray[i]);
			console.log(url);
			console.log("Centroid: " + centroidArray[i]);
			break;
		}
	}
	if(url == audioFilesID[audioFilesID.length-1])
	{
		spectralCentroidDisplay();
	}
}
