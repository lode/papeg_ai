import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from './tjs/transformers.min.js';
//import { encodeWAV } from './js/wav_utils.js';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

self.supports_web_gpu16 = false;
self.supports_web_gpu32 = false;
self.device = 'wasm';
let gpu_checked = false;
env.backends.onnx.wasm.proxy = true;

self.quantized = null; // true or null
//self.task = null;

let sentence = null;

self.disposing = false;
self.tts_busy = false;

self.preloading = false;
self.preloaded = false;

function delay(millisec) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, millisec); 
    }) 
}


function encodeWAV(samples) {
    let offset = 44;
    const buffer = new ArrayBuffer(offset + samples.length * 4);
    const view = new DataView(buffer);
    const sampleRate = 16000;

    writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 4, true)
    /* RIFF type */
    writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, 3, true)
    /* channel count */
    view.setUint16(22, 1, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true)
    /* bits per sample */
    view.setUint16(34, 32, true)
    /* data chunk identifier */
    writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * 4, true)

    for (let i = 0; i < samples.length; ++i, offset += 4) {
        view.setFloat32(offset, samples[i], true)
    }

    return buffer
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; ++i) {
        view.setUint8(offset + i, string.charCodeAt(i))
    }
}





//console.log("TTS WORKER EXISTS");


const SPEAKERS = {
    "US female 1": "cmu_us_slt_arctic-wav-arctic_a0001",
    "US female 2": "cmu_us_clb_arctic-wav-arctic_a0001",
    "US male 1": "cmu_us_bdl_arctic-wav-arctic_a0003",
    "US male 2": "cmu_us_rms_arctic-wav-arctic_a0003",
    "Canadian male": "cmu_us_jmk_arctic-wav-arctic_a0002",
    "Scottish male": "cmu_us_awb_arctic-wav-arctic_b0002",
    "Indian male": "cmu_us_ksp_arctic-wav-arctic_a0007",
}

const DEFAULT_SPEAKER = "cmu_us_slt_arctic-wav-arctic_a0001";


// Disable remote model checks
//env.allowLocalModels = false;
//env.allowRemoteModels = true;

//let cache_name = "llama-cpp-wasm-cache";

let synthesizer = null;

const voice_to_file_lookup = {
	'US female 1':'cmu_us_slt_arctic-wav-arctic_a0001.bin',
	'US female 2':'cmu_us_clb_arctic-wav-arctic_a0001.bin',
	'US male 1':'cmu_us_bdl_arctic-wav-arctic_a0003.bin',
	'US male 2':'cmu_us_rms_arctic-wav-arctic_a0003.bin',
	'Canadian male':'cmu_us_jmk_arctic-wav-arctic_a0002.bin',
	'Scottish male':'cmu_us_awb_arctic-wav-arctic_b0002.bin',
	'Indian male':'cmu_us_ksp_arctic-wav-arctic_a0007.bin',
}


let url_to_cache = import.meta.url;
url_to_cache = url_to_cache.substr(0, url_to_cache.lastIndexOf("/"));
//console.log("cut to proper length url to cache base: ", url_to_cache);
if(url_to_cache.startsWith('http') && url_to_cache.endsWith('/')){
	url_to_cache += 'tts_embeddings/speaker_embeddings.bin';
	//console.log("full url to cache: ", url_to_cache);
}




// Use the Singleton pattern to enable lazy construction of the pipeline.
class MyTextToSpeechPipeline {

    static BASE_URL = 'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/';

    static model_id = 'Xenova/speecht5_tts';
    static vocoder_id = 'Xenova/speecht5_hifigan';
	static device = 'wasm';

    static tokenizer_instance = null;
    static model_instance = null;
    static vocoder_instance = null;

	static instance_exists(){
		return this.model_instance != null;
	}
	
	static set_to_null(var_to_null=null) {
		if(typeof var_to_null == 'string' && typeof this[var_to_null] != 'undefined'){
			this[var_to_null] = null;
			//console.log("TTS WORKER: MyTextToSpeechPipeline: set_to_null: ", var_to_null);
		}
	}


    static async getInstance(progress_callback = null) {
		//console.log("TTS WORKER: in MyTextToSpeechPipeline.getInstance. this.model_instance is null?: ", (this.model_instance === null));
		//console.log("TTS WORKER: getIntance: self.device: ", self.device);
		//console.log("getIntance: self.quantized: ", self.quantized);
		
		let my_dtype = 'fp32';
		/*
		if(self.supports_web_gpu16){
			my_dtype = 'fp16';
		}*/
		
        if (this.tokenizer_instance === null) {
            this.tokenizer = AutoTokenizer.from_pretrained(this.model_id, { progress_callback });
        }

        if (this.model_instance === null) {
            this.model_instance = SpeechT5ForTextToSpeech.from_pretrained(this.model_id, {
                //quantized: false,
				dtype: my_dtype, //'fp32',
				//quantized:self.quantized,
				quantized:false,
				device: this.device,
                progress_callback,
				//device:'wasm',
				
            });
        }
        if (this.vocoder_instance === null) {
            this.vocoder_instance = SpeechT5HifiGan.from_pretrained(this.vocoder_id, {
                //quantized: false,
				dtype: my_dtype, //'fp32',
				//quantized:self.quantized,
				//quantized:true,
				quantized:false,
				device: this.device,
                progress_callback,
				//device: 'wasm' //self.device,
				
            });
        }

		//console.log("three promises? ", this.tokenizer, this.model_instance, this.vocoder_instance);

        return new Promise(async (resolve, reject) => {
            const result = Promise.all([
                this.tokenizer,
                this.model_instance,
                this.vocoder_instance,
            ]);
            resolve(result);
        });
    }

    static async getSpeakerEmbeddings(speaker_id) {
        // e.g., `cmu_us_awb_arctic-wav-arctic_a0001`
        const speaker_embeddings_url = `${this.BASE_URL}${speaker_id}.bin`;
		//console.log("TTS WORKER: speaker_embeddings_url: ", speaker_embeddings_url);
        const speaker_embeddings = new Tensor(
            'float32',
            new Float32Array(await (await fetch(speaker_embeddings_url)).arrayBuffer()),
            [1, 512]
        )
        return speaker_embeddings;
    }
}



async function dispose(){
	//console.log("TTS WORKER: in dispose");
	const p = MyTextToSpeechPipeline;
	
	if(p.instance_exists() === true){
		//console.log("TTS WORKER: MyTextToSpeechPipeline has instance. disposing");
		
	    const [tokenizer, model, vocoder] = await p.getInstance();
		if(tokenizer && typeof tokenizer.dispose == 'function'){
			//console.log("TTS WORKER: dispose: disposing of tokenizer");
			await tokenizer.dispose();
		}
		if(model && typeof model.dispose == 'function'){
			//console.log("TTS WORKER: dispose: disposing of model");
			await model.dispose();
		}
		if(vocoder && typeof vocoder.dispose == 'function'){
			//console.log("TTS WORKER: dispose: disposing of vocoder");
			await vocoder.dispose();
		}
		p.set_to_null('tokenizer_instance');
		p.set_to_null('model_instance');
		p.set_to_null('vocoder_instance');
	}
	else{
		console.warn("TTS worker: nothing to dispose?");
	}
}




async function preload() {
	//console.log("tts_worker: in preload");
	
	const p = MyTextToSpeechPipeline;
	
	if(p.instance_exists() === true){
		console.error("TTS WORKER: preload: MyTextToSpeechPipeline already has instance");
		return true
	}
	//console.warn("TTS WORKER: CALLING p.getInstance...");
    const [tokenizer, model, vocoder] = await p.getInstance(x => {
		//console.log("TTS WORKER: preload: posting download progress message: ", x);
        self.postMessage(x);
    });
	//console.warn("\n\n\nTTS WORKER: PRELOAD COMPLETE\n\n\ntts model loaded: ", (model !== null));
	return true
}









// Mapping of cached speaker embeddings
const speaker_embeddings_cache = new Map();

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
	
	//console.log("TTS WORKER RECEIVED MESSAGE");
	//console.log("TTS WORKER RECEIVED MESSAGE. event.data: ", event.data);
	
	//if(typeof event.data.cache_name == 'string'){
		//console.log("TTS WORKER: setting cache_name to: ", event.data.cache_name)
		//cache_name = event.data.cache_name;
	//}
	
	if(disposing){
		console.error("TTS WORKER: got message while busy disposing: ", event.data);
		postMessage({"status":"error","error":"was busy disposing"});
		return
	}
	
	if(typeof event.data.action == 'string'){
		//console.warn("TTS WORKER: received action");
		if(self.disposing == false){
			
			if(event.data.action == 'dispose'){
				//console.log("TTS worker: action: disposing");
				if(self.tts_busy){
					console.error("TTS WORKER: notice only: dispose was called while self.tts_busy was true");
				}
				self.disposing = true;
				try{
					await dispose();
					await delay(10);
				}
				catch(err){
					console.error("TTS WORKER: caught error disposing: ", err);
				}
				self.disposing = false;
				self.tts_busy = false;
			    self.postMessage({
			        status: "disposed"
			    });
			}
			
			else if(event.data.action == 'preload'){
				//console.log("TTS worker: action: preload");
				if(self.preloading){
					console.error("TTS WORKER: ignoring preload command, already busy preloading");
					self.postMessage({status: "warning",message:"already preloading"});
					return
				}
				
				if(self.preloaded){
					console.error("TTS WORKER: ignoring preload command, already preloaded");
					self.preloading = false;
					self.preloaded = true;
					self.postMessage({status: "preloaded"});
					return
				}
				
				self.preloading = true;
				try{
					await preload();
					await delay(10);
					self.preloaded = true;
				}
				catch(err){
					console.error("TTS WORKER: caught error preloading: ", err);
					
				    self.postMessage({
				        status: "warning",
						error: "TTS worker caught error preloading"
				    });
				}
				self.preloading = false;
				
				//self.tts_busy = false;
			    self.postMessage({status: "preloaded"});
			}
			
		}
	}
	else if(typeof event.data.task == 'object'){
		//console.log("TTS WORKER: received a task: ",  event.data.task);
		//console.log("TTS WORKER RECEIVED TASK");
		
		if(self.tts_busy){
			console.error("TTS WORKER: ALREADY BUSY");
		    self.postMessage({
		        status: "error",
				error: "TTS worker was already busy"
		    });
			return false
		}
		self.tts_busy = true;
		
		sentence = null;
		
		if(typeof event.data.task.sentence == 'string' && event.data.task.sentence.length){
			//console.log("TTS WORKER: task has simple sentence property, using that as the input sentence: ", event.data.task.sentence);
			sentence = event.data.task.sentence; // simpler shortcut option for simple tasks
			//self.task = event.data.task;
			
			
			const start_stamp = Date.now();
			
			//await delay(10);
			
			const p = MyTextToSpeechPipeline;
			//console.log("tts worker: calling getInstance");
		    // Load the pipeline
		    const [tokenizer, model, vocoder] = await p.getInstance(x => {
				//console.log("TTS WORKER: posting download progress message: ", x);
		        // We also add a progress callback so that we can track model loading.
		        self.postMessage(x);
		    });
			//console.warn("\n\n\nTTS INSTANCE CREATED SUCCESFULLY\n\n\n");
			
            self.postMessage({
                status: 'ready',
            });

			await delay(10);
			
			//console.log("model: ", model);
			//console.log("vocoder: ", vocoder);
			//console.log("tokenizer: ", tokenizer);

		    // Tokenize the input
		    //const { input_ids } = tokenizer(event.data.text);
			//console.log("\n\nTTS WORKER: doing tokenizer: sentence: " + sentence);
			const { input_ids } = await tokenizer(sentence);
			
			//console.log('TTS WORKER: stopwatch +tokenizer: ', (Date.now() - start_stamp) / 1000, 'ms using ', env.backends.onnx.wasm.numThreads, 'threads');
			
			let speaker_id = 'cmu_us_slt_arctic-wav-arctic_a0001';
			if(typeof event.data.task.voice == 'string'){
				if(typeof SPEAKERS[event.data.task.voice] != 'undefined'){
					//console.log("TTS WORKER: using specific voice: ", event.data.task.voice);
					
					speaker_id = SPEAKERS[event.data.task.voice];
					
				}
				else{
					console.error("TTS WORKER: no voice in task, falling back to default voice: ", event.data.task);
					//speaker_embeddings = default_speaker_embeddings;
				}
			}
			else{
				console.error("TTS WORKER: no/invalid voice in task, falling back to default voice: ", speaker_id, event.data.task);
				//speaker_embeddings = default_speaker_embeddings;
			}
			
			
		    // Load the speaker embeddings
		    let speaker_embeddings = speaker_embeddings_cache.get(speaker_id);
		    if (speaker_embeddings === undefined) {
		        speaker_embeddings = await MyTextToSpeechPipeline.getSpeakerEmbeddings(speaker_id);
		        speaker_embeddings_cache.set(speaker_id, speaker_embeddings);
		    }
			//console.log('TTS worker: stopwatch: +embeddings: ', (Date.now() - start_stamp) / 1000, 'ms using ', env.backends.onnx.wasm.numThreads, 'threads');
			//console.log("speaker_embeddings: ", speaker_embeddings);

		    // Generate the waveform
			
		    const { waveform } = await model.generate_speech(input_ids, speaker_embeddings, { vocoder });
			
		    // Encode the waveform as a WAV file
		    const wav = encodeWAV(waveform.data);

			//console.log('TTS worker: stopwatch:  +wav-encode', (Date.now() - start_stamp) / 1000);

		    // Send the output back to the main thread
		    self.postMessage({
				task: event.data.task,
		        status: 'complete',
				big_audio_array: waveform.data,
		        wav_blob: new Blob([wav], { type: 'audio/wav' }),
		    });
			
			self.tts_busy = false;
			return true
			
		}
		
		self.tts_busy = false;
		if(typeof sentence != 'string'){
			console.error("TTS WORKER: SENTENCE NOT LONG ENOUGH OR INVALID: ", sentence);
			postMessage({"status":"error","error":"Invalid sentence provided",'task':event.data.task});
			return
		}

		//postMessage({'tts_data':event.data});
		//postMessage(event.data);
		
	}
	else{
		console.error("TTS WORKER: no valid task provided");
		postMessage({"status":"error","error":"No valid task object provided"});
		return
	}
	
});



async function check_gpu(){
	// CHECK WEB GPU SUPPORT
	
    if (!navigator.gpu) {
		console.error("TTS WORKER: WebGPU not supported.");
    }else{
		//console.error("TTS WORKER: navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		//console.error("TTS WORKER:  adapter,adapter.features: ", adapter, adapter.features);
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				//web_gpu_supported = true;
				self.supports_web_gpu16 = true;
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`TTS WORKER: webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				console.warn("TTS WORKER: Web GPU: 16-bit floating-point value support is not available");
				//web_gpu32_supported = true;
				self.supports_web_gpu32 = true;
			}
		}
		else{
			console.error("TTS WORKER: querying WebGPU was not a success");
		}
    }
	
}

await check_gpu(); // no WebGPU support for this model yet // actually, it seems to work now.
// https://github.com/xenova/transformers.js/issues/892
// https://github.com/xenova/transformers.js/issues/898

//console.error("TTS WORKER:  self.supports_web_gpu16, self.supports_web_gpu32: ", self.supports_web_gpu16, self.supports_web_gpu32);
self.gpu_checked = true;

if(self.supports_web_gpu16 || self.supports_web_gpu32){
	//console.log("TTS WORKER: WEBGPU SUPPORTED");
	self.device = 'webgpu';
	env.backends.onnx.wasm.proxy = false;
}




//console.log("TTS worker exists");
postMessage({"status":"exists"});