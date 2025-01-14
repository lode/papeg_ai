const text_file_extensions = ['txt','js','ts','json','html','xhtml','css','yaml','ino','py','readme'];
const binary_image_extensions = ['png','jpg','jpeg','gif','webp','ico','bmp','tiff'];
const binary_video_extensions = ['mp4','h264','h265','mjpeg','webm','mov','ogv'];
const binary_audio_extensions = ['mp3','wav','flac','aac','m4a','ogg'];
const binary_media_extensions = binary_video_extensions.concat(binary_audio_extensions);  //['mp4','mp3','wav','h264','h265','mjpeg','flac','aac','webm','m4a','ogg'];
const archive_extensions = ['zip','gzip'];
const binary_document_extensions = ['pdf','epub']; // epub is zipped html


function add_body_class(new_class=null){
	if(typeof new_class == 'string' && new_class.length){
		if(!document.body.classList.contains(new_class)){
			document.body.classList.add(new_class);
		}
	}
}
window.add_body_class = add_body_class;

function remove_body_class(new_class=null){
	if(typeof new_class == 'string' && new_class.length){
		if(document.body.classList.contains(new_class)){
			document.body.classList.remove(new_class);
		}
	}
}
window.remove_body_class = remove_body_class;

function add_element_class(target_element=null, class_name=null){
	if(target_element != null && typeof class_name == 'string'){
		if(!target_element.classList.contains(class_name)){
			target_element.classList.add(class_name);
		}
	}
}
window.add_element_class = add_element_class;

function remove_element_class(target_element=null, class_name=null){
	if(target_element != null && typeof class_name == 'string'){
		if(target_element.classList.contains(class_name)){
			target_element.classList.remove(class_name);
		}
	}
}
window.remove_element_class = remove_element_class;


function keyz(object){
	if(typeof object != 'undefined' && object != null){
		return Object.keys(object);
	}
	else{
		console.error("KEYZ: invalid object provided");
		return [];
	}
}
window.keyz = keyz;


function delay(millisec) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, millisec); 
    }) 
}
window.delay = delay;



const n = navigator;
//console.log("does a service worker exist?  n.serviceWorker:", n.serviceWorker);
const controlling = n.serviceWorker && n.serviceWorker.controller;

if(typeof navigator.serviceWorker != 'undefined'){
    navigator.serviceWorker.addEventListener("message", (message) => {
        console.error("index.html: received message from service worker: ", message);
    });
}
//console.log("is a service worker controlling? ", controlling);
//console.log("window.crossOriginIsolated: ", window.crossOriginIsolated);



if(document.pictureInPictureEnabled){
    document.body.classList.add('pip-available');
}

window.time_started = Date.now();


function delay(millisec) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, millisec); 
    }) 
}

function is_valid_URL(test_URL) {
    let url;
  
    try {
		url = new URL(test_URL);
    } catch (_) {
		console.warn("is_valid_URL: URL is not valid: ", test_URL);
		return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
}


function clean_url_bar(){
	console.warn("doing history.replaceState");
	let new_location = window.location.origin + '/';
	if(window.location.pathname.startsWith('/wasm4')){
		new_location += 'wasm4/';
	}
	console.log("clean_url_bar: new_location: ", new_location);
    history.replaceState(null, 'Papeg.ai', new_location);
}


let should_clean_url_bar = false;
let received_url_parameters = null;

window.url_parameters = new URLSearchParams(window.location.search);
//console.log("window.url_parameters: ", window.url_parameters);


window.url_parameter_functionality = window.url_parameters.get('do'); // ?do=
if(typeof window.url_parameter_functionality == 'string'){
	if(window.url_parameter_functionality.startsWith('http') || window.url_parameter_functionality.indexOf('/') != -1){
		console.error("unvalid functionality parameter in URL: " + window.url_parameter_functionality);
		window.url_parameter_functionality = null;
	}
	else{
		if(window.url_parameter_functionality.toLowerCase() == 'advanced'){
			console.log("URL DO PARAMETER WAS ADVANCED");
			window.settings.settings_complexity == 'advanced';
			window.save_settings();
		}
		else if(window.url_parameter_functionality.toLowerCase() == 'developer'){
			console.log("URL DO PARAMETER WAS DEVELOPER");
			window.settings.settings_complexity == 'developer';
			window.save_settings();
		}
	}
    console.log("received functionality link. window.url_parameter_functionality: ", window.url_parameter_functionality);
    should_clean_url_bar = true;
}


const ask_for_url_dialog_iframe_el = document.getElementById('ask-for-url-dialog-iframe');
ask_for_url_dialog_iframe_el.addEventListener('load', () => {
	console.log("preview iframe has loaded in");
	ask_for_url_dialog_iframe_el.classList.remove('hidden');
});
ask_for_url_dialog_iframe_el.addEventListener('error', () => {
	console.error("Error loading preview image of URL to download");
});

let url_parameter_ai = window.url_parameters.get('ai');
if(typeof url_parameter_ai == 'string'){
    url_parameter_ai = url_parameter_ai.replaceAll('?download=true','');
	url_parameter_ai = url_parameter_ai.replace('http:/','http://');
	url_parameter_ai = url_parameter_ai.replace('https:/','https://');
    console.log("received AI in url:  url_parameter_ai: ", url_parameter_ai);
	if(url_parameter_ai.startsWith('http') && is_valid_URL(url_parameter_ai) === false){
		url_parameter_ai = null;
	}
	should_clean_url_bar = true;
}

let url_parameter_file = window.url_parameters.get('file');
if(typeof url_parameter_file == 'string'){
    console.log("received FILE in url:  url_parameter_file: ", url_parameter_file);
	if(!url_parameter_file.startsWith('http')){
		console.warn("invalid file path provided (did not start with http)");
		url_parameter_file = null;
	}
	if(!url_parameter_file.indexOf('.') == -1){
		console.warn("invalid file path provided (did not contain dot)");
		url_parameter_file = null;
	}
	url_parameter_file = url_parameter_file.replace('http:/','http://');
	url_parameter_file = url_parameter_file.replace('https:/','https://');
	console.log("url_parameter_file: ", url_parameter_file);
	if(is_valid_URL(url_parameter_file) === false){
		console.error("provided URL was invalid: ", url_parameter_file);
		url_parameter_file = null;
	}
	else{
		console.log("privided file URL seems valid: ", url_parameter_file);
		
	}
	should_clean_url_bar = true;
}

//console.log("url_parameter_ai: ", url_parameter_ai);
//const url_parameter_prompt = window.url_parameters.get('prompt');
//console.log("url_parameter_prompt: ", url_parameter_prompt);
//window.location.href = window.location.origin + window.location.pathname;



let received_a_document = false;
window.received_document = window.url_parameters.get('document');
window.received_document_extension = null;
window.received_document_filename = null;

if(typeof window.received_document == 'string'){
    console.log("received a document via url:  window.received_document: ", window.received_document);
	received_a_document = true;
    window.received_document_extension = window.url_parameters.get('extension');
    if(typeof window.received_document_extension == 'string' && window.received_document_extension.length){
        console.log("- also received a document extension: ", window.received_document_extension);
    }
    else{
        window.received_document_extension = 'txt';
    }

    window.received_document_filename = window.url_parameters.get('filename');
    if(typeof window.received_document_filename == 'string' && window.received_document_filename.length){
        console.log("- also received a document filename: ", window.received_document_filename);
    }
    else{
        window.received_document_filename = null;
    }
}
else{
    window.received_prompt = window.url_parameters.get('prompt');
    if(typeof window.received_prompt == 'string'){
        console.log("No received document, but did receive a prompt via the url:  window.received_prompt: ", window.received_prompt);
		
    }
}

if(typeof window.received_prompt == 'string'){
	if(window.received_prompt.indexOf(' ') == -1){
		window.received_prompt = window.received_prompt.replaceAll('_',' ');
	}
	
	should_clean_url_bar = true;
}






// Show received prompt

const received_prompt_textarea_el = document.getElementById('received-prompt-textarea');

function show_received_prompt(){
    console.log("in show_received_prompt. window.received_prompt: ", window.received_prompt);
    if(typeof window.received_prompt == 'string' && window.received_prompt.length > 2 && typeof url_parameter_ai == 'string' && url_parameter_ai.length > 1){
		
		if(window.received_prompt.indexOf('_') != -1 && window.received_prompt.indexOf('%20') == -1 && window.received_prompt.indexOf(' ') == -1){
			window.received_prompt = window.received_prompt.replaceAll('_',' ');
		}

        received_prompt_textarea_el.value = window.received_prompt;
        if(typeof textAreaAdjust === 'function'){
            textAreaAdjust(received_prompt_textarea_el);
        }

        if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].emoji == 'string' && window.settings.assistants[window.settings.assistant].emoji.length){
            let received_emoji_icon_el = document.getElementById('received-prompt-assistant-emoji');
            received_emoji_icon_el.textContent = window.settings.assistants[window.settings.assistant].emoji;
            if(typeof window.settings.assistants[window.settings.assistant].emoji_bg == 'string' && window.settings.assistants[window.settings.assistant].emoji_bg.length > 2){
				if(!window.settings.assistants[window.settings.assistant].emoji_bg.startsWith('#')){
					window.settings.assistants[window.settings.assistant].emoji_bg = '#' + window.settings.assistants[window.settings.assistant].emoji_bg;
					save_settings();
				}
                received_emoji_icon_el.style.backgroundColor = window.settings.assistants[window.settings.assistant].emoji_bg;
            }
        }
        else if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].icon == 'string' && window.settings.assistants[window.settings.assistant].icon.length){
            let received_prompt_icon_el = document.getElementById('received-prompt-assistant-name-icon');
            received_prompt_icon_el.src = 'images/' + window.settings.assistants[window.settings.assistant].icon + '_thumb.png';
        }
        else{
            let received_prompt_icon_el = document.getElementById('received-prompt-assistant-name-icon');
            received_prompt_icon_el.src = 'images/developer_thumb.png';
        }

        document.getElementById('received-prompt-dialog').showModal();

    }
    window.received_prompt = null;
}



// Show received document

const received_document_dialog_el = document.getElementById('received-document-dialog');
const received_document_filename_el = document.getElementById('received-document-filename');
const received_document_textarea_el = document.getElementById('received-document-textarea');
const share_document_also_share_ai_el = document.getElementById('share-document-also-share-ai-checkbox');
const share_document_link_text_el = document.getElementById('share-document-link-text');

function show_received_document(text=null,suggested_filename=null,extension=null){
    console.log("in show_received_document.  text,extension: ", text, extension);
    if(typeof text != 'string' && typeof window.received_document == 'string'){
        text = window.received_document;
    }

    if(typeof text != 'string'){
        console.error("show_received_document: invalid text  or extension provided: ", text, extension);
        return 
    }
	if(text.indexOf('_') != -1 && text.indexOf('%20') == -1 && text.indexOf(' ') == -1){
		text = text.replaceAll('_',' ');
	}
    received_document_textarea_el.value = text;

    if(typeof suggested_filename != 'string' && typeof window.received_document_filename == 'string'){
		//console.log("show_received_document: using window.received_document_filename: ", window.received_document_filename)
        suggested_filename = window.received_document_filename;
    }

    if(typeof extension != 'string'){
        if(typeof suggested_filename == 'string' && suggested_filename.indexOf('.') != -1){
            extension = get_file_extension(suggested_filename);
        }
        else if(typeof window.received_document_extension == 'string' && window.received_document_extension.length){
            extension = window.received_document_extension;
        }
        else{
            extension = 'txt';
        }
    }
    if(typeof extension != 'string' || extension == ''){
        extension = 'txt';
    }
    console.log("received document extension: ", extension);
    if(extension == "blueprint"){
        received_document_dialog_el.classList.add('for-blueprint');
    }
    else{
        received_document_dialog_el.classList.remove('for-blueprint');
    }


    // Suggest a filename
    if(typeof suggested_filename != 'string' || (typeof suggested_filename == 'string' && suggested_filename == '')){

        suggested_filename = '';
        const d = new Date();
        let date_string = d.toLocaleString([],{year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'});
        date_string = date_string.replaceAll('/','-');
        date_string = date_string.replace(':','h');

        if(extension == 'blueprint'){
            suggested_filename = get_translation('Received_blueprint') + ' ' + date_string + '.blueprint';
        }
        else{
            suggested_filename = get_translation('Received_document') + ' ' + date_string + '.' + extension;
        }
    }
    received_document_filename_el.value = suggested_filename;
	window.received_document = null;
	window.received_document_filename = null;
	window.received_document_extension = null;

    document.getElementById('received-document-dialog').showModal();
	
}





if( 
	(typeof url_parameter_ai == 'string' && url_parameter_ai.length > 1) 
	|| (typeof url_parameter_file == 'string' && url_parameter_file.length > 5) 
	//  && url_parameter_prompt != null
){ 

    received_url_parameters = {};
    //window.url_parameter_functionality = null; // don't do both a functionality and a new model at the same time // TODO: with the ability to download files this has become interesting

    const keyCandidates = Array.from(window.url_parameters);
    for(let kc = 0; kc < keyCandidates.length; kc++){
        //console.log("keyCandidates: ", kc, keyCandidates[kc]);
        if(Array.isArray(keyCandidates[kc]) && keyCandidates[kc].length == 2){
            received_url_parameters[ keyCandidates[kc][0] ] = keyCandidates[kc][1];
			if(typeof received_url_parameters[ keyCandidates[kc][0] ] == 'string' && received_url_parameters[ keyCandidates[kc][0] ].startsWith('http:/') && !received_url_parameters[ keyCandidates[kc][0] ].startsWith('http://')){
				received_url_parameters[ keyCandidates[kc][0] ] = received_url_parameters[ keyCandidates[kc][0] ].replace('http:/','http://');
			}
			else if(typeof received_url_parameters[ keyCandidates[kc][0] ] == 'string' && received_url_parameters[ keyCandidates[kc][0] ].startsWith('https:/') && !received_url_parameters[ keyCandidates[kc][0] ].startsWith('https://')){
				received_url_parameters[ keyCandidates[kc][0] ] = received_url_parameters[ keyCandidates[kc][0] ].replace('https:/','https://');
			}
        }
        else{
            console.error("unexpected shape of keyCandidates array: ", keyCandidates);
        }
    }

}

if( !(typeof url_parameter_ai == 'string' && url_parameter_ai.length > 1) ){
    document.body.classList.add('no-received-ai');
}

/*
console.log("--> url_parameter_ai: ", url_parameter_ai);
console.log("--> window.received_prompt: ", window.received_prompt);
console.log("--> received_a_document: ", received_a_document);
console.log("--> window.received_document: ", window.received_document);
console.log("--> window.location.origin: ", window.location.origin);
console.log("--> window.location.pathname: ", window.location.pathname);
*/

if(
	should_clean_url_bar
    || typeof url_parameter_ai == 'string'
	|| typeof url_parameter_file == 'string'
    || typeof window.received_prompt == 'string' 
    || typeof window.received_document == 'string'
	|| received_a_document
){
	clean_url_bar();
}




received_document_filename_el.addEventListener('input', () => {
    update_share_document_url();
});
received_document_textarea_el.addEventListener('input', () => {
    update_share_document_url();
});
share_document_also_share_ai_el.addEventListener('change', () => {
    update_share_document_url();
});

function update_share_document_url(){
    console.log("in update_share_document_url");
    let share_link = '?document=' + encode_url_component(received_document_textarea_el.value.replaceAll(' ','_'));

    if(received_document_filename_el.value.trim() != ''){
        share_link = share_link + '&filename=' + encode_url_component(received_document_filename_el.value)
    }
    console.log("share_document_also_share_ai_el: ", share_document_also_share_ai_el);
    console.log("share_document_also_share_ai_el.checked: ", share_document_also_share_ai_el.checked);
    if(share_document_also_share_ai_el.checked === true){
        console.log("also adding current AI");
        share_link = create_share_prompt_link(false,null,'',share_link);
    }
    else{
        let origin_part = window.location.origin + window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'));
        if( (origin_part.length + share_link.length) > 2000){
            share_link = get_translation('The_link_is_too_long_to_share') + ' (' + (origin_part.length + share_link.length) + '/2000)';
        }
        else{
            share_link = origin_part + share_link;
        }
    }
    share_document_link_text_el.textContent = share_link;

    //let first_part = share_link.substr(0,share_link.indexOf('?'));
    //share_link = share_link.replace(first_part,encode_url_component(first_part));
    const fully_encoded_share_link = encode_url_component(share_link);

    document.getElementById('twitter-share-document-link').href = 'https://x.com/intent/post?text=' + fully_encoded_share_link;
    document.getElementById('facebook-share-document-link').href = 'http://www.facebook.com/sharer.php?u=' + fully_encoded_share_link;
    document.getElementById('linkedin-share-document-link').href = 'https://www.linkedin.com/shareArticle?mini=true&amp;url=' + fully_encoded_share_link;
    document.getElementById('reddit-share-document-link').href = 'http://www.reddit.com/submit?url=' + fully_encoded_share_link + '&title=www.papeg.ai';

}


//window.cache_name = "llama-cpp-wasm-cache";
window.cache_name = "v1";
//window.cache_base_url = window.location.origin;
window.cache_base_url = location.protocol + '//' + location.host + location.pathname

//console.log("cache_base_url: ", cache_base_url);

window.scripts_to_add = { // a lookup table, not really used anymore
    'musicgen': './musicgen_module.js',
    'camera':'./camera_module.js',
    'translation':'./translation_module.js',
    'language_recognition':'./js/eld.M60.min.js'
}


window.web_gpu_supported = false; // only counts 16 bit as supported, which is the optimal variety when it comes to saving memory. TODO: does this put mac-users at a disadvantage?
window.web_gpu32_supported = false; // fallback if WebGPU is available, but 16bit is not

window.added_scripts = [];
window.chat_message_counter = 0;
//window.language = 'en';
window.microphone_enabled = false;
window.speaker_enabled = false;
window.current_audio_file_duration = null;
window.model_loaded = false;
window.last_loaded_model_url = null;
window.currently_loaded_assistant = null;
window.currently_loaded_llama_cpp_assistant = null;
window.currently_loaded_web_llm_assistant = null;
window.currently_loaded_ollama_assistant = null;
window.busy_loading_assistant = null

window.temperature = 0.7;
window.conversations = {};
window.developer_response_count = 0;
//window.tts_queue = []; // deprecated

window.audioCtx = null; // deprecated
window.transcribing = false;

window.used_memory = 0;
window.available_memory = 0;



window.docs = {};
window.coder = false; //whether a coding LLM is active
window.doc_text = '';
window.doc_length = 0;
window.doc_line_nr = null;
window.doc_current_line_nr = null; // TODO: duplicate
window.doc_selection = null;
window.doc_selected_text = null;
/*
let default_doc = {
    'name':'unnamed',
    'type':null,
    'text':'',
    'size':null,
    'last_modified':0,
}
*/
window.speakers_manually_overridden = false;

window.should_add_demo_files = false; // becomes true on first ever run, when there are no settings in localstorage yet

// WEB LLM
window.should_restrict_models = false;

window.opencv_interval_delay = 500;

// These are probably not needed anymore
webLLMGlobal = {};
//window.prompts = ['what is the capital of Germany?'];


function check_if_mobile() {
    var match = window.matchMedia || window.msMatchMedia;
    if(match) {
        var mq = match("(any-pointer:fine)");
        //console.log("check_if_mobile: mq: ", mq);
        if(!mq.matches && typeof localStorage != 'undefined' && typeof localStorage.mobile != 'undefined' && window.innerWidth < 1024){
            return true
        }
        //return !mq.matches;
    }
    return false;
}

//window.is_mobile = localStorage.mobile; // || window.navigator.maxTouchPoints > 1;
//window.is_mobile = check_if_mobile();
window.is_mobile = false;
//if(typeof localStorage != 'undefined' && typeof localStorage.mobile != 'undefined' && window.innerWidth < 1024){
/*
if(window.innerWidth < 641){
    window.is_mobile = true;
}
*/
if(localStorage.mobile || window.navigator.maxTouchPoints > 1){
    //console.log("seems to be a mobile device. window.navigator.maxTouchPoints: ", window.navigator.maxTouchPoints);
    window.is_mobile = true;
}

//console.log("check_if_mobile(): ", check_if_mobile());


//window.use_simple_vad = false;


// debug
window.use_simple_vad = true; // Switched to using it all the time, as it works better on mobile devices
//window.is_mobile = true;


console.log("is_mobile: ", window.is_mobile);
if(window.is_mobile == true){
    document.body.classList.add('mobile');
    window.use_simple_vad = true;
    window.speakers_manually_overridden = true;
    //window.settings.voice = 'basic';
    window.opencv_interval_delay = 500;

    if(typeof window.settings.assistants['danube'] == 'undefined'){
        window.settings.assistants['danube'] = {};
    }
    window.settings.assistants['danube'].selected = true;

    if(typeof window.settings.assistants['danube'] == 'undefined'){
        window.settings.assistants['danube_3_500m'] = {};
    }
    window.settings.assistants['danube_3_500m'].selected = true;
}





/*
if(window.innerWidth < 641){
    document.body.classList.add('mobile');
}
*/

window.is_firefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
if(window.is_firefox){
    document.body.classList.add('is-firefox');
}





const iosDeviceMapping = new Map([
  ["320x480", "IPhone 4S, 4, 3GS, 3G, 1st gen"],
  ["320x568", "IPhone 5, SE 1st Gen,5C, 5S"],
  ["375x667", "IPhone SE 2nd Gen, 6, 6S, 7, 8"],
  ["375x812", "IPhone X, XS, 11 Pro, 12 Mini, 13 Mini"],
  ["390x844", "IPhone 13, 13 Pro, 12, 12 Pro"],
  ["414x736", "IPhone 8+"],
  ["414x896", "IPhone 11, XR, XS Max, 11 Pro Max"],
  //["428x926", "IPhone 13 Pro Max, 12 Pro Max"],
  ["476x847", "IPhone 7+, 6+, 6S+"],
  ["744x1133", "IPad Mini 6th Gen"],
  [
    "768x1024",
    "IPad Mini (5th Gen), IPad (1-6th Gen), iPad Pro (1st Gen 9.7), Ipad Mini (1-4), IPad Air(1-2)  ",
  ],
  ["810x1080", "IPad 7-9th Gen"],
  ["820x1180", "iPad Air (4th gen)"],
  ["834x1194", "iPad Pro (3-5th Gen 11)"],
  ["834x1112", "iPad Air (3rd gen), iPad Pro (2nd gen 10.5)"],
  //["1024x1366", "iPad Pro (1-5th Gen 12.9)"],
]);

const ios_screen_resolution = window.screen.width + 'x' + window.screen.height;
window.ios_device = null; // iosDeviceMapping.get(ios_screen_resolution);

window.old_ios_device = false;
window.is_ios = false;
if (/iP(hone|od|ad)/.test(navigator.platform)){
    console.warn("Apple Device (iOS) detected");
    window.is_ios = true;
    document.body.classList.add('ios');
    window.ios_device = iosDeviceMapping.get(ios_screen_resolution);
    console.log("apple ios device model: ", ios_device);
    if(window.ios_device){
        window.old_ios_device = true;
        document.body.classList.add('old-ios-device');
    }
}

window.ios_device = iosDeviceMapping.get(ios_screen_resolution);
//console.error("window.ios_device failure is: ", window.ios_device );





// Maybe a little late? Could move this to early.js
async function check_gpu(){
	//console.log("in check_gpu");
	// CHECK WEB GPU SUPPORT
    if (!navigator.gpu) {
		console.error("WebGPU not supported.");
		remove_body_class('web-gpu');
		remove_body_class('web-gpu32');
    }
	else{
		//console.log("navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				//console.log(`Web GPU: 16 bit is available`);
				window.web_gpu_supported = true;
				add_body_class('web-gpu');
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				console.warn("Web GPU: only 32-bit floating-point value support is available");
				window.web_gpu32_supported = true;
				remove_body_class('web-gpu');
				add_body_class('web-gpu32');
				
				add_web_gpu32_models();
			}
			
		}
		else{
			console.error("querying WebGPU failed, invalid adapter: ", adapter);
			remove_body_class('web-gpu');
			remove_body_class('web-gpu32');
		}
    }
	
}

check_gpu();





// Check if any cameras are available
window.camera_select_el = document.querySelector('select#video-sources-select');
window.has_camera = 0;
if(window.camera_select_el != null && typeof navigator.mediaDevices != 'undefined'){
    navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
        //console.log("all media devices: ", devices);
        for(var i = 0; i < devices.length; i ++){
            var device = devices[i];
            if (device.kind === 'videoinput') {
                window.has_camera++;
                document.body.classList.add('has-camera');
                var option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || 'camera ' + (i + 1);
                camera_select_el.appendChild(option);
            }
        }
        if(window.has_camera < 2){
            camera_select_el.style.display = 'none';
        }

    });
}









let scripts_busy_loading = [];

function add_script(path,module=false,load_async=null){
    //console.log("in add_script.  path,module,load_async: ", path,module,load_async);
    return new Promise(function(resolve,reject) {
        //console.log("add_script: inside promise");

        if(typeof path == 'string' && path.length){
			
			if(scripts_busy_loading.indexOf(path) != -1){
				console.error("add_script: script was already handled: ",path);
				resolve(false);
				return false
			}

            if(typeof window.scripts_to_add[path] == 'string'){
                //console.log("add_scripts: switching script name for script path: ", path, ' --> ',window.scripts_to_add[path]);
                path = window.scripts_to_add[path];
            }

            if(window.added_scripts.indexOf(path) != -1){
                //console.log("add_script: script was already in window.added_scripts: ", path);
                resolve(true);
                return true
            }
            else{
                //console.log("add_script: script was not yet in window.added_scripts: ", path);
                window.added_scripts.push(path);
            }

            var scripts = document.getElementsByTagName("script");

            for (i=0; i<scripts.length; i++){
                if(scripts[i].src == path){
                    //console.error("add_script: that script has already been added: ", path);
                    if(window.added_scripts.indexOf(path) == -1){
                        console.error("add_script: adding missing script path to list of scripts that have already been added: ", path);
                        window.added_scripts.push(path);
                    }
                    resolve(true);
                    return true
                }
            }

            let new_script_el = document.createElement('script');
			if(typeof load_async == 'boolean'){
				new_script_el.async = load_async;
			}
			else{
				new_script_el.async = false;
				new_script_el.defer = false;
			}
			
			
            if(module){
                new_script_el.type = 'module';
            }
            else{
                new_script_el.type = 'text/javascript';
            }

            new_script_el.src = path;

            new_script_el.addEventListener('load', function() {
                //console.log("new script has loaded in: ", path);
                /*
                if(window.added_scripts.indexOf(path) == -1){
                    //console.log("new script has loaded in, adding path to window.added_scripts: ", path);
                    window.added_scripts.push(path);
                }
                else{
                    console.error("new script has loaded in, but it was already in window.added_scripts: ", path);
                }
                */
                //handle_script_loaded(path);
                delay(1000)
                .then(() => {
                    resolve(true);
                })

                //return true
            });
            document.body.appendChild(new_script_el); 

        }
        else{
			console.error("add_script: invalid path provided: ", path);
            reject(false);
            return false

        }
    });

}

window.add_script = add_script;


function is_script_added(script_name){
    if(typeof script_name == 'string' && typeof window.scripts_to_add[script_name] != 'undefined'){
        if(window.added_scripts.indexOf(window.scripts_to_add[script_name]) != -1){
            //console.log("is_script_added:  yes: ", script_name);
            return true;
        }
    }
    console.warn("is_script_added:  no: ", script_name);
    return false
}



function handle_script_loaded(path){
    //console.log("in handle_script_loaded. path: ", path);
    if(typeof path == 'string'){
        if(window.added_scripts.indexOf(path) == -1){
            window.added_scripts.push(path);
        }
    }
}


// Detect mobile phones
/*
const androidMaxStorageBufferBindingSize = 134217728; // 128MB
const mobileVendors = new Set([
    "qualcomm",
    "arm"
]);
let restrictModels = false;
let maxStorageBufferBindingSize;
let gpuVendor;
try {
    [maxStorageBufferBindingSize, gpuVendor] = await Promise.all([
        chat.getMaxStorageBufferBindingSize(),
        chat.getGPUVendor()
    ]);
} catch (err) {
    //chatUI.appendMessage("error", "Init error, " + err.toString());
    console.log("Error detecting mobile phone GPU: ", err.stack);
    return;
}
if (gpuVendor.length != 0 && mobileVendors.has(gpuVendor) || maxStorageBufferBindingSize <= androidMaxStorageBufferBindingSize) {
    chatUI.appendMessage("init", "Your device seems to have limited resources, so we restrict the selectable models.");
    restrictModels = true;
}
*/




function save_settings(){
    //console.log("saving settings: ", JSON.stringify(window.settings,null,4));
    //console.log("saving settings: ", window.settings);
    localStorage.setItem("settings", JSON.stringify(window.settings));
    if(window.generate_ui){
        window.generate_ui();
    }
	
    let model_info_share_link_el = document.getElementById('model-info-share-clone-link-text');
    if(model_info_share_link_el){
        setTimeout(() => {
            create_share_prompt_link(false,window.settings.assistant,''); // updates the share link if model info is open
        },10);
    }

}
window.save_settings = save_settings;

// load settings
let stored_settings = localStorage.getItem("settings");
if(stored_settings == null){
    //console.log("no settings found in local storage");
    window.should_add_demo_files = true; // TODO: no longer used
    window.first_run = true;


    if(typeof window.settings.assistants['image_to_text'] == 'undefined'){
        window.settings.assistants['image_to_text'] = {}; // 'selected':true
    }




    /*
    if(window.is_mobile){
        window.settings.assistants['image_to_text']['huggingface_id'] = 'onnx-community/Florence-2-base-ft';
    }
    else{
        window.settings.assistants['image_to_text']['huggingface_id'] = 'Xenova/moondream2';
    }
    */
    window.settings.assistants['image_to_text']['huggingface_id'] = 'Xenova/moondream2';

    // Detect initial language
    var browser_lang = navigator.language || navigator.userLanguage; 
    //console.log("browser_lang: ", browser_lang);
    browser_lang = browser_lang.toLowerCase();

    if(browser_lang.toLowerCase() == 'nl' || browser_lang.startsWith('nl-')){
        //console.log("switching language to Dutch");
        //window.language = 'nl';
        window.settings.language = 'nl';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'nl';
        }

        window.settings.assistants['fietje3'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'de' || browser_lang.startsWith('de-')){
        //console.log("switching language to German");
        //window.language = 'nl';
        window.settings.language = 'de';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'de';
        }

        window.settings.assistants['german_gemma_2b'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'fr' || browser_lang.startsWith('fr-')){
        //console.log("switching language to French");
        //window.language = 'nl';
        window.settings.language = 'fr';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'fr';
        }
        window.settings.assistants['phi3_mini_french'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'es' || browser_lang.startsWith('es-')){
        //console.log("switching language to Spanish");
        //window.language = 'nl';
        window.settings.language = 'es';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'es';
        }
        window.settings.assistants['phi3_mini_spanish'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'pt' || browser_lang.startsWith('pt-')){
        //console.log("switching language to Portugese");
        //window.language = 'nl';
        window.settings.language = 'pt';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'pt';
        }
        window.settings.assistants['phi3_mini_portugese'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'it' || browser_lang.startsWith('it-')){
        //console.log("switching language to Italian");
        //window.language = 'nl';
        window.settings.language = 'it';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'it';
        }
        window.settings.assistants['phi3_mini_italian'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'pl' || browser_lang.startsWith('pl-')){
        //console.log("switching language to Polish");
        //window.language = 'nl';
        window.settings.language = 'pl';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'pl';
        }
        window.settings.assistants['tiny_llama_polish'] = {'selected':true};
        save_settings();
    }
    else if(browser_lang.toLowerCase() == 'uk' || browser_lang.startsWith('uk-')){
        //console.log("switching language to Ukrianian");
        //window.language = 'nl';
        window.settings.language = 'uk';
        if(window.settings.input_language == 'en' && window.settings.output_language == null){
            window.settings.output_language = 'uk';
        }
        window.settings.assistants['ukrianian'] = {'selected':true};
        save_settings();
    }


}
else{
    try{
        stored_settings = JSON.parse(stored_settings);
        //console.log("found stored settings in local storage: ", stored_settings);
        window.settings = {...window.settings, ...stored_settings};


        document.body.classList.remove('first-run');

        // Overwrite window.assistants with data from window.settings.assistants
        //if(window.settings.assistants != 'undefined'){
            //console.log("applying custom assistants settings over the default assistants settings: ", JSON.stringify(window.settings.assistants,null,4));
            //window.assistants = {...window.assistants, ...window.settings.assistants};
        //}

        if(typeof window.settings.assistant == 'string'){
            //console.log("Found assistant in settings: ", window.settings.assistant);
        }

    }
    catch(e){
        console.error("error restoring settings: ", e);
    }
}


// Restore timers
window.timers = localStorage.getItem("timers");
if(typeof window.timers == 'string'){
    window.timers = JSON.parse(window.timers);
    //console.log("restored timers data: ", window.timers);
}
else{
    window.timers = [];
}
// Restore timer index
window.timer_index = localStorage.getItem("timer_index");
if(window.timer_index == null || isNaN(window.timer_index)){
    window.timer_index = 0;
}
else if(typeof window.timer_index == 'string'){
    window.timer_index = parseInt(window.timer_index);
}
//console.log("initial window.timer_index: ", window.timer_index);

// UPDATE SERVICEWORKER CACHE
// TODO: instead of rushing this, maybe wait until the system has settled instead?
if(typeof window.settings.version == 'number'){
    document.getElementById('papegai-version').innerText = 'v' + window.settings.version;
}

//console.log("navigator.hardwareConcurrency: ", navigator.hardwareConcurrency);


window.ram = 0;
if(typeof navigator.deviceMemory == 'number'){
    window.ram = navigator.deviceMemory * 1000;
    window.available_memory = navigator.deviceMemory * 1000;
}
//window.ram = 4000;
//window.available_memory = 3000;
console.log("RAM: ", window.ram);

if(window.ram > 0 && window.ram < 512){ // can happen in incognito mode
	window.ram = 4000;
}

if(window.ram == 0){
    document.getElementById('total-memory-wrapper').style.display = 'none';
}
else{
    document.getElementById('total-memory').textContent = Math.round(window.ram / 1000) + "GB";
}
document.getElementById('limited-ram').textContent = Math.round(window.ram / 1000) + "GB";

if(window.ram > 10000){
    window.is_mobile = false;
}

if(window.ram > 0 && window.is_mobile){
    window.ram = Math.round(window.ram / 2) + 1;
    if(window.ram < 3001){
        window.ram += 1000;
    }
    //console.log("Mobile, so lowering RAM to: ", window.ram);
}
else if(window.ram > 0 && window.ram < 4000){
    window.is_mobile = true;
}





//
//  CACHE STORAGE
//

window.cached_urls = [];
window.cached_urls2 = {};
window.storage = null;


function check_cache() {
    //console.log("in check_cache");
    return new Promise(function(resolve,reject) {
        try {

            caches.keys()
            .then((cacheNames) => {
				//console.log("check_cache: cacheNames: ", cacheNames);
				if(cacheNames.length == 0){
					
					resolve(false);
					return
				}
                cacheNames.map(cacheName => {
					if(window.settings.settings_complexity == 'developer'){
						console.warn("dev: check_cache:  cacheName:", cacheName);
					}
                    

                    caches.open(cacheName)
                    .then(cache => {

                        cache.keys()
                        .then(items => {
                            items.map(item => {
                                //if(item.url.indexOf('ocket') != -1){
                                //	//console.log(cacheName + " - item - ", item.url , item);
                                //}
                                //console.log(cacheName + " - item - ", item.url , item);
                                if(window.cached_urls.indexOf(item.url) == -1){
                                    window.cached_urls.push(item.url);
                                }
                                window.cached_urls2[item.url] = cacheName;
                            })
                            setTimeout(() => {
                                resolve(true);
                            },200)

                        })
                        .catch((err) => {
                            console.error("check_cache: promise error: ", err);
                            resolve(false);
                        })

                    })
                    .catch((err) => {
                        console.error("check_cache: promise error: ", err);
                        resolve(false);
                    })
                })

                /*
                Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log("check_cache: cacheName: ", cacheName);

                        if (!expectedCacheNamesSet.has(cacheName)) {
                          // If this cache name isn't present in the set of
                          // "expected" cache names, then delete it.
                          console.log("Deleting out of date cache:", cacheName);
                          return caches.delete(cacheName);
                        }

                    }),
                ),
                */
            })
			.catch((e) => {
				console.error("caught error in check_cache: ", e);
				reject(false);
			})


        } catch (e) {
            console.error("caught error in check_cache: ", e);
            reject(false);
        }
    })

}






async function delete_model_from_cache(assistant_id){
    //console.log("in delete_model_from_cache. assistant_id: ", assistant_id);
    if(typeof assistant_id != 'string'){
        return
    }
    if(assistant_id.length == 0){
        return
    }

    if(typeof window.assistants[assistant_id] != 'undefined' || typeof window.settings.assistants[assistant_id] != 'undefined'){
        //let cache_name = 'wllama_cache';
        //let runner = 'llama_cpp';
        let deletion_names = [];

        // If the currently active AI is being deleted, switch to the developer first
        if(assistant_id == window.currently_loaded_assistant){
            window.switch_assistant('developer',true);
            window.stop_assistant();
            window.currently_loaded_assistant = null;
        }

        // WebLLM
        if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].web_llm_file_name == 'string' && window.assistants[assistant_id].web_llm_file_name.indexOf('-q') != -1){
            deletion_names.push(window.assistants[assistant_id].web_llm_file_name.split('-q')[0]);
        }

        // LlamaCPP
        let wllama_filename = null;
        if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].model_file_name == 'string' && window.settings.assistants[assistant_id].model_file_name.length > 4){
            wllama_filename = window.settings.assistants[assistant_id].model_file_name;
        }
        else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].model_file_name == 'string' && window.assistants[assistant_id].model_file_name.length > 4){
            wllama_filename = window.assistants[assistant_id].model_file_name;
        }

        else if(typeof window.assistants[assistant_id].download_url == 'string' && window.assistants[assistant_id].download_url.endsWith('.gguf')){
            let gguf_filename = window.assistants[assistant_id].download_url.split('/').pop();
            if(gguf_filename.indexOf('-00001') != -1){
                gguf_filename = gguf_filename.split('-00001')[0];
            }
            deletion_names.push(gguf_filename);
            //wllama_filename = window.assistants[assistant_id].model_file_name;
        }


        if(typeof wllama_filename == 'string'){
            if(wllama_filename.indexOf('-Q') != -1){
                deletion_names.push(wllama_filename.split('-Q')[0]);
            }
            if(wllama_filename.indexOf('_q') != -1){
                deletion_names.push(wllama_filename.split('_q')[0]);
            }
            else if(wllama_filename.indexOf('_Q') != -1){
                deletion_names.push(wllama_filename.split('_Q')[0]);
            }
            else if(wllama_filename.indexOf('.q') != -1){
                deletion_names.push(wllama_filename.split('.q')[0]);
            }
            else if(wllama_filename.indexOf('.Q') != -1){
                deletion_names.push(wllama_filename.split('.Q')[0]);
            }
            else{
                console.warn("pushing full filename to deletion_names: ", wllama_filename);
                deletion_names.push(wllama_filename);
            }

        }



        if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].download_url == 'string' && window.settings.assistants[assistant_id].download_url.length > 4 && window.settings.assistants[assistant_id].download_url.endsWith('.gguf')){
            await delete_model_from_wllama(window.settings.assistants[assistant_id].download_url);
        }
        if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].download_url == 'string' && window.assistants[assistant_id].download_url.length > 4 && window.assistants[assistant_id].download_url.endsWith('.gguf')){
            await delete_model_from_wllama(window.assistants[assistant_id].download_url);
        }





        if(typeof window.assistants[assistant_id].model_file_name == 'string' && window.assistants[assistant_id].model_file_name.length > 4){
            if( window.assistants[assistant_id].model_file_name.indexOf('/params_shard') != -1){
                deletion_names.push(window.assistants[assistant_id].model_file_name.split('/params_shard')[0]);
            }
            else{
                deletion_names.push(window.assistants[assistant_id].model_file_name);
            }
        }

        if(deletion_names.length){
            console.log("delete_model_from_cache: deletion_names list: ", deletion_names);

            caches.keys()
            .then((cacheNames) =>
                cacheNames.map(cacheName => {
                    //console.warn("cacheName: ", cacheName);

                    caches.open(cacheName)
                    .then(cache => {

                        cache.keys()
                        .then(items => {
                            //console.log("DELETE_MODEL_FROM_CACHE: ", cacheName, items);
                            items.map(item => {
                                //console.log(cacheName + " - item - ", item.url , item);
                                const cached_file_url = item.url;
                                //console.log("delete_model_from_cache: cached_file_url: ", cached_file_url);

                                for(let dn = 0; dn < deletion_names.length; dn++){
                                    if(deletion_names[dn].length > 4 && cached_file_url.indexOf(deletion_names[dn]) != -1){
                                        //console.log("delete_model_from_cache: deleting url from cache: ", cacheName, cached_file_url);
                                        cache.delete( cached_file_url )
                                        .then((value) => {
                                            //console.log('delete_model_from_cache: cache.delete() resolve value: ', value);

                                            remove_from_cached_list(cached_file_url);

                                        })
                                        .catch((err) => {
                                            console.error('delete_model_from_cache: cache.delete() rejected/failed:', err);
                                        })



                                    }
                                }
                            })
                        })
                        .catch((err) => {
                            console.error("delete_model_from_cache: level 2 promise error: ", err);
                        });

                    })
                    .catch((err) => {
                        console.error("delete_model_from_cache: promise error: ", err);
                    });
                })
            )
            .then(() => {
                console.log("remove model from cache complete. Calling generate_ui");
                setTimeout(() => {
                    window.generate_ui();
                    show_models_info(false);
                },1000);

            })
            .catch((err) => {
                console.error("delete_model_from_cache: promise error: ", err);
            });

        }


    }

    localStorage.removeItem('preload_recovery_' + assistant_id);

}

async function delete_model_from_wllama(download_url=null){
    console.log("in delete_model_from_wllama.  download_url: ", download_url);

    if(window.llama_cpp_app == null && typeof window.create_wllama_object == 'function'){
        console.error("delete_model_from_wllama: window.llama_cpp_app was null. Attempting to create it now.");
        window.create_wllama_object();
    }


    if(window.llama_cpp_app != null && typeof window.llama_cpp_app.cacheManager != 'undefined' && typeof download_url == 'string' && download_url.length > 4 && download_url.endsWith('.gguf')){

        console.log("delete_model_from_cache: window.llama_cpp_app: ", window.llama_cpp_app);

        if(download_url.indexOf('-00001-of-0') != -1 && typeof window.llama_cpp_app.cacheManager.deleteMany != 'undefined'){
            let trimmed_download_url = download_url;

            if( trimmed_download_url.indexOf('-00001-of-0') != -1){
                trimmed_download_url = trimmed_download_url.split('-00001-of-0')[0];
            }
            if(trimmed_download_url.indexOf('/') != -1){
                trimmed_download_url = trimmed_download_url.substr( (trimmed_download_url.lastIndexOf('/')) + 1 );
            }
            console.log("delete_model_from_cache: trimmed download_url: ", trimmed_download_url);

            console.log("delete_model_from_cache: deleting many from Wllama cache using partial gguf trimmed_download_url: ", trimmed_download_url);

            // CacheManager is given a function which will be used for each file in the cache to determine if it should be deleted or not. Clever design.
            await window.llama_cpp_app.cacheManager.deleteMany((cache_item) => {
                if(typeof cache_item.name == 'string' && cache_item.name.indexOf(trimmed_download_url) != -1){
                    console.log("wllama: deleteMany true: ", cache_item);
                    remove_from_cached_list(trimmed_download_url);
                    return true // returning true here tells the cacheManager to delete the file it's currently looping over
                }
                else{
                    console.error("wllama: deleteMany: did not find gguf in Wllama cache: ", cache_item);
                    return false
                }
            });
            remove_from_cached_list(trimmed_download_url);
            return true
        }


        else if(typeof window.llama_cpp_app.cacheManager.delete != 'undefined'){
            console.log("delete_model_from_cache: deleting single gguf: ", download_url);
            const deleted = await window.llama_cpp_app.cacheManager.delete(download_url); // deletes a single file from Wllama cache
            console.log("Did Wllama cacheManager delete? ", deleted);
            remove_from_cached_list(download_url);
            return true
        }


    }
    return false
}







function remove_from_cached_list(cached_file_url){
    for(let cu = window.cached_urls.length - 1; cu > 0; --cu){
        if(window.cached_urls[cu].indexOf(cached_file_url) != -1){
            console.log("remove_from_cached_list: removing from window.cached_urls: " + window.cached_urls[cu]);
            window.cached_urls.splice(cu,1);
        }
    }
    /*
    let cached_urls_index = window.cached_urls.indexOf(cached_file_url);
    if(cached_urls_index != -1){
        //console.log("delete_model_from_cache: removing url from window.cached_urls: ", cached_file_url);
        window.cached_urls.splice(cached_urls_index,1);
    }
    */
    let cache2_keys = keyz(window.cached_urls2);
    for(let ck = cache2_keys.length - 1; ck > 0; --ck){
        if(cache2_keys[ck].indexOf(cached_file_url) != -1){
            //console.log("remove_from_cached_list: deleting from window.cached_urls2: " + window.cached_urls2[cache2_keys[ck]]);
            delete window.cached_urls2[cache2_keys[ck]];
        }
    }
    /*
    if(typeof window.cached_urls2[cached_file_url] != 'undefined'){
        //console.log("delete_model_from_cache: removing url from window.cached_urls2: ", cached_file_url);
        delete window.cached_urls2[cached_file_url];
    }
    */
}


function test() {
    window.testing = true;
    console.log("in test");
    console.log("window.cached_urls.length: ", window.cached_urls.length);
    console.log("window.cached_urls2: ", window.cached_urls2);
    console.log("window.intro_explanations_given: ", window.intro_explanations_given);
    console.log("window.translation_languages: ", window.translation_languages);

    console.log("window.settings.favourite_translation_languages: ", window.settings.favourite_translation_languages);
    console.log("window.added_scripts: ", window.added_scripts);
    console.log("window.conversations: ", window.conversations);
    console.log("window.assistants: ", window.assistants);
    console.warn("window.settings: ", window.settings);

    // List all indexDB databases
    indexedDB.databases()
    .then(r => console.log("IndexDB databases: ", r))
    .catch(err => console.log("Error getting IndexDB databases: ", err));

    console.log("\n\nstate: ", window.state);
    console.log("window.idle: ", window.idle);
    console.log("window.active_section: ", window.active_section);
    console.log("window.active_destination: ", window.active_destination);
    console.log("window.busy_doing_blueprint_task: ", window.busy_doing_blueprint_task);

    console.log("\nDOCS & FILES");
    console.log("window.settings.docs.open: ", window.settings.docs.open);
    console.log("current_file_name: ", current_file_name);
    console.log("files: ", files);
    console.log("folder: ", folder);
    console.log("sub_folders: ", sub_folders);
    console.log("window.doc_selection: ", window.doc_selection);
    console.log("window.doc_line_nr: ", window.doc_line_nr);
    console.log("window.currently_loaded_assistant: ", window.currently_loaded_assistant);
    if(typeof current_file_name == 'string' && typeof files[current_file_name] != 'undefined'){
        console.log("FILE META files[current_file_name]: ", files[current_file_name]);
        if(typeof files[current_file_name]['origin_file'] != 'undefined' && files[current_file_name]['origin_file'] != null && typeof files[current_file_name]['origin_file'].filename == 'string' && files[ files[current_file_name]['origin_file'].filename ] != 'undefined'){
            console.log("FILE META for origin_file: ", files[ files[current_file_name]['origin_file'].filename ]);
        }
        else{
            console.log("no origin_file in this file's meta");
        }
    }
    else{
        if(current_file_name != unsaved_file_name){
            console.error("current_file_name not in files: ", typeof current_file_name, current_file_name);
        }
    }
    console.log("playground_live_backups: ", playground_live_backups);
    console.log("playground_saved_files: ", playground_live_backups);

    console.log("\nASSISTANT");
    console.log("window.settings.assistant: ", window.settings.assistant);
    console.log("window.busy_loading_assistant: ", window.busy_loading_assistant);
    console.log("window.currently_loaded_assistant: ", window.currently_loaded_assistant);
    console.log("window.settings.last_loaded_text_ai: ", window.settings.last_loaded_text_ai);

    console.log("\nWLLAMA");
    console.log("window.llama_cpp_model_being_loaded: ", window.llama_cpp_model_being_loaded);
    console.log("window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
    console.log("window.llama_cpp_busy: ", window.llama_cpp_busy);
    console.log("window.llama_cpp_fresh: ", window.llama_cpp_fresh);
    console.log("window.doing_llama_cpp_refresh: ", window.doing_llama_cpp_refresh);
    if(window.llama_cpp_app){
        console.log("window.llama_cpp_app: ", window.llama_cpp_app);
    }
    else{
        console.log("window.llama_cpp_app not loaded: ", window.llama_cpp_app);
    }

    console.log("\nWEB_LLM");
    console.log("window.currently_loaded_web_llm_assistant: ", window.currently_loaded_web_llm_assistant);
    console.log("window.web_llm_busy: ", window.web_llm_busy);
    console.log("window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
    console.log("window.doing_web_llm_refresh: ", window.doing_web_llm_refresh);
    console.log("window.web_llm_engine: ", window.web_llm_engine);

    console.log("\nOLLAMA");
    console.log("window.ollama_online: ", window.ollama_online);
    console.log("window.ollama_busy: ", window.ollama_busy);


    console.log("\nMUSICGEN");
    console.log("window.busy_loading_musicgen: ", window.busy_loading_musicgen);
    console.log("window.musicgen_loaded: ", window.musicgen_loaded);
    console.log("window.musicgen_worker_busy: ", window.musicgen_worker_busy);


    console.log("\nTASKS");
    console.warn("window.task_queue: ");
    console.warn(window.task_queue);
    console.warn("window.current_tasks: ", window.current_tasks);
    console.log("window.stt_tasks_left: ", window.stt_tasks_left);
    console.log("window.tts_tasks_left: ", window.tts_tasks_left);

    console.log("window.microphone_enabled: ", window.microphone_enabled);
    console.log("window.speaker_enabled: ", window.speaker_enabled);

    console.log("\nTTS");
    console.log("window.busy_loading_tts: ", window.busy_loading_tts);
    console.log("window.tts_worker_loaded: ", window.tts_worker_loaded);
    console.log("window.tts_worker_busy: ", window.tts_worker_busy);
    console.log("window.audio_player_busy: ", window.audio_player_busy);

    console.log("\nVAD");
    console.log("window.myvad: ", window.myvad);
    console.log("window.busy_recording_simple_vad: ", window.busy_recording_simple_vad);
    console.log("window.skip_first_vad_recording: ", window.skip_first_vad_recording);

    console.log("\nWHISPER");
    console.log("window.whisper_worker: ", window.whisper_worker);
    console.log("window.whisper_loading: ", window.whisper_loading);
    console.log("window.busy_loading_whisper: ", window.busy_loading_whisper);
    console.log("window.whisper_loaded: ", window.whisper_loaded);
    console.log("window.whisper_worker_busy: ", window.whisper_worker_busy);
    console.log("window.current_scribe_voice_parent_task_id: ", window.current_scribe_voice_parent_task_id);



    console.log("\nRAG");
    console.log("window.selected_rag_documents: ", window.selected_rag_documents);
    console.log("window.rag_worker_busy: ", window.rag_worker_busy);

    console.log("\nIMAGE TO TEXT");
    console.log("window.last_image_to_text_blob: ", window.last_image_to_text_blob);
    console.log("window.image_to_text_worker_busy: ", window.image_to_text_worker_busy);
    console.log("window.busy_loading_image_to_text: ", window.busy_loading_image_to_text);
    console.log("window.image_to_text_worker_loaded: ", window.image_to_text_worker_loaded);
    console.log("\n")
    console.log("")
    console.log("window.settings.auto_detect_input_language: ", window.settings.auto_detect_input_language);
    console.log("window.diffusion_worker: ", window.diffusion_worker);

    window.used_memory = check_memory({},true);
    console.log("window.used_memory: ", window.used_memory);
    console.log("")
    console.log("window.received_prompt: ", window.received_prompt);
    console.log("")
	console.log("document.body: ", document.body);



    if(window.vad_audio_context){
        console.log("test setSinkId: changing vad_audio_context sink to none");
        window.vad_audio_context.setSinkId({ type : 'none' });
    }
    if(window.audioNodeVAD){
        console.log("test setSinkId: changing audioNodeVAD.ctx sink to none");
        window.audioNodeVAD.ctx.setSinkId({ type : 'none' });
    }
    if(window.vad_context_s){
        console.log("test setSinkId: changing vad_context_s sink to none");
        window.vad_context_s.ctx.setSinkId({ type : 'none' });
    }



    async function measureMemory() {
        console.log("in measureMemory");
        if (performance.measureUserAgentSpecificMemory) {
            const memorySample = await window.performance.measureUserAgentSpecificMemory();
            console.log("memorySample: ", memorySample);
            console.log("memorySample.bytes", (memorySample.bytes / (1024*1024)));
        }
        else{
            console.warn("measureUserAgentSpecificMemory is not available in this browser");
        }
    }



    if (window.crossOriginIsolated) {
        console.log("crossOriginIsolated");

        measureMemory();
    }
    else{
        console.error("NOT CROSS ORIGIN ISOLATED");
    }
	
	if(typeof remove_highlight_selection == 'function'){
		 remove_highlight_selection();
	}
   
    //console.log("window.chat: ", window.chat);

    if(typeof list_caches === 'function'){
        console.log("");
		console.log("__caches__");
        list_caches();
    }
	else{
		console.error("list_caches was not a function, updater.js did not load? offline?");
	}

}


const content_container_el = document.getElementById('content-container');
const sidebars_el = document.getElementById('sidebars');
const main_view_el = document.getElementById('main-view');
/*
if ("virtualKeyboard" in navigator) {
    navigator.virtualKeyboard.overlaysContent = true;

    navigator.virtualKeyboard.addEventListener("geometrychange", (event) => {
        console.log("DETECTED VIRTUAL KEYBOARD GEOMETRY CHANGE. event.target.boundingRect: ", event.target.boundingRect);
        const { x, y, width, height } = event.target.boundingRect;
  });
}

*/
/*
window.addEventListener('resize', () => {
    // For the rare legacy browsers that don't support it
    if (!window.visualViewport) {
        return
    }
    //console.log("RESIZE: window.visualViewport.height: ", window.visualViewport.height);
})
*/


// iOS is tricky when it comes to virtual keyboards, this is a 'hack' to deal with unwanted scrolling
window.virtual_keyboard_shown = false;

if(window.is_mobile){
    if(window.visualViewport){
        window.visualViewport.addEventListener("resize", () => {
            //console.log("detected visualViewport height change from listener on window.visualViewport: ", window.visualViewport.height);

            document.documentElement.style.height = window.visualViewport.height + "px";
            document.documentElement.style.maxHeight = window.visualViewport.height + "px";
            document.body.style.height = window.visualViewport.height + "px";
            document.body.style.maxHeight = window.visualViewport.height + "px";
            content_container_el.style.height = window.visualViewport.height + "px";
            content_container_el.style.maxHeight = window.visualViewport.height + "px";
            sidebars_el.style.height = window.visualViewport.height + "px";
            sidebars_el.style.maxHeight = window.visualViewport.height + "px";

            if(window.is_ios){
                main_view_el.style.height = (window.visualViewport.height - 50) + "px";
                main_view_el.style.maxHeight = (window.visualViewport.height - 50) + "px";
                window.scrollTo(0, 0);
            }

            //console.log("content_container_el: ", content_container_el.getBoundingClientRect() );


            if(window.visualViewport.height < 400){
                window.virtual_keyboard_shown = true;
                document.body.classList.add('has-keyboard');

                const scrollPosition = window.pageYOffset;
                console.log("scrollPosition: ", scrollPosition);
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                //document.body.style.top = `${scrollPosition}px`;
                //document.body.style.width = '100%';

            }
            else{
                window.virtual_keyboard_shown = false;
                document.body.classList.remove('has-keyboard');
            }

        } );
    }
}


const handleScrollToTop = () => {
    //console.log("scrolling to top");
    const scrollPosition = window.pageYOffset;
    //console.log("scrolling to top. scrollPosition: ", scrollPosition);
    window.scrollTo(0, 0);
};


let last_scroll_update_time = 0;
if(window.is_ios){


    document.addEventListener("touchend", handleScrollToTop);

    /*
    window.onscroll = function (e) {
        console.log("scrolling. window.virtual_keyboard_shown: ", window.virtual_keyboard_shown);
        if(window.virtual_keyboard_shown){
            let now = Date.now();
            if(now > last_scroll_update_time + 100){
                console.log("ios fix", content_container_el.getBoundingClientRect() );
                last_scroll_update_time = now;
                content_container_el.style.top = 0;
                content_container_el.style.bottom = 'auto';
            }
        }
    } 
    */
}




/*
function unregister_serviceworkers(){
    console.log("in unregister_serviceworkers");
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        console.log("serviceworker registrations: ", registrations);
        for(let registration of registrations) {
            registration.unregister();
        } 
    })
}
*/



function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
window.makeid = makeid;



function strip_html(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}


window.add_script('./updater.js?' + makeid(16),false,true); // not a module, but do load async








const isolated_el = document.getElementById('cross-origin-isolated-checkbox-container');
isolated_el.classList.add("show-if-developer");
//isolated_el.setAttribute('style','padding:15px');
isolated_el.innerHTML = `${window.crossOriginIsolated ? "✅" : "❌"}`

// ldb, a simple indexDB wrapper
!function(){var s,c,e="undefined"!=typeof window?window:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();





window.functionality = {
    "chat":{
        "type":"chat",
        "i18n_code":"chat",
        //"assistant_id":"any_small_writer",
        "functions":["load_chat_example"],
        "better_with_web_gpu":true,
        "classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
    },
    "pictures":{
        "type":"media",
        "i18n_code":"make_pictures",
        "assistant_id":"text_to_image",
        "classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-rewrite","sidebar-settings","chat-shrink"],
        "requires_web_gpu":true,
    },
    "music":{
        "type":"music",
        "i18n_code":"make_music",
        "assistant_id":"musicgen",
        //"classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-rewrite","sidebar-settings","sidebar","chat-shrink"],
    },

    "new":{
        "type":"document",
        "i18n_code":"New_document",
        //"assistant_id":"any_writer",
        "functions":["create_file"],
        //"classes_to_add":["show-document"],
        "classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
        "better_with_web_gpu":true,
    },
    "transcribe":{
        "type":"document",
        "i18n_code":"Transcribe_an_audio_file",
        //"assistant_id":"scribe",
        //"classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-rewrite","sidebar"],
        "better_with_web_gpu":true,
        //"requires_web_gpu":true,
        "functions":["load_generate_a_subtitle_example"],
    },
    "rewrite":{
        "type":"document",
        "i18n_code":"improve_a_document",
        "assistant_id":"any_writer",
        //"fast_assistant_id":"fast_llama3_8B",
        "classes_to_add":["show-document"],
        "classes_to_remove":["sidebar-chat","sidebar-settings"],
        "better_with_web_gpu":true,
        "functions":["load_improve_a_document_example"],
    },
    "summarize":{
        "type":"document",
        "i18n_code":"summarize_a_document",
        //"assistant_id":"any_small_writer",
        "classes_to_add":["show-document"],
        "classes_to_remove":["sidebar-chat","sidebar-settings"],
        "better_with_web_gpu":true,
        "functions":["load_summarize_a_document_example"],
    },
    "translate":{
        "type":"document",
        "i18n_code":"translate_a_document",
        //"assistant_id":"any_small_writer",
        "classes_to_add":["show-document"],
        "classes_to_remove":["sidebar-chat","sidebar-settings"],
        "better_with_web_gpu":true,
        "functions":["load_translate_a_document_example"],
    },

    "meeting":{
        "type":"microphone",
        "i18n_code":"take_meeting_notes",
        "assistant_id":"scribe",
        "functions":["enable_microphone","load_meeting_notes_example"],
        "classes_to_add":["show-document"],
        "classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite","chat-shrink"],
    },
    /*
    "tell_a_fairytale":{
        "type":"document",
        "i18n_code":"tell_a_fairytale",
        "assistant_id":"any_writer",
        //"assistant_id":"danube",
        //"fast_assistant_id":"fast_mistral",
        "functions":["load_fairytale_example"],
        "better_with_web_gpu":true,
    },
    */

    "homework":{
        "type":"chat",
        "i18n_code":"help_with_homework",
        "assistant_id":"phi3_mini",
        "fast_assistant_id":"fast_phi3_mini",
        "better_with_web_gpu":true,
        "classes_to_remove":["show-rewrite","chat-shrink"],
    },
    "medical":{
        "type":"chat",
        "i18n_code":"ask_medical_questions",
        "assistant_id":"medical6",
        "classes_to_remove":["show-rewrite","chat-shrink"],
    },
    "live_audio_translation":{
        "type":"microphone",
        "i18n_code":"live_audio_translation",
        "assistant_id":"translator",
        "functions":["enable_microphone"],
        "classes_to_remove":["show-rewrite","chat-shrink"],
    },

    "subtitles":{
        "type":"music",
        "i18n_code":"Generate_a_subtitle",
        "assistant_id":"scribe",
        //"classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-rewrite","sidebar"],
        "better_with_web_gpu":true,
        //"requires_web_gpu":true,
        "functions":["load_generate_a_subtitle_example"],
    },
    "scan":{
        "type":"camera",
        "i18n_code":"scan_a_document",
        //"assistant_id":"any",
        //"classes_to_add":["show-document"],
        //"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
        "functions":["load_scan_a_document_example"]
    },

    "describe":{
        "type":"media",
        "i18n_code":"Describe_images",
        "assistant_id":"image_to_text",
        "functions":["load_image_to_text_example"],
        "classes_to_remove":["show-rewrite","sidebar","chat-shrink"],
        "requires_web_gpu":true,
    },
    "live_camera_description":{
        "type":"camera",
        "i18n_code":"Live_camera_description",
        //"assistant_id":"scribe",
        "functions":["load_live_image_to_text_example"],
        "requires_web_gpu":true,
    },
    "live_camera_translation":{
        "type":"camera",
        "i18n_code":"live_camera_translation",
        "assistant_id":"translator",
        "functions":["load_live_camera_translation_example"],
        //"requires_web_gpu":true,
        /*
        "classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
        */
    },
    /*
    "role_playing":{
        "type":"chat",
        "i18n_code":"role_playing",
        "assistant_id":"actor_nous_capybara",
        "classes_to_add":["show-document"],
        "classes_to_remove":["sidebar-chat","sidebar-settings"],
        "functions":["load_leonardo_example","enable_microphone","enable_speaker"],
    },
    "chat_with_cleopatra":{
        "type":"chat",
        "i18n_code":"chat_with_cleopatra",
        "assistant_id":"actor1",
        "functions":["load_cleopatra_example","enable_microphone","enable_speaker"],
    },
    */
    "therapy":{
        "type":"chat",
        "i18n_code":"get_a_hug",
        "assistant_id":"mental6",
        "classes_to_remove":["show-rewrite","chat-shrink"],
    },

    "voice":{
        "type":"microphone",
        "i18n_code":"Voice_chat",
        "assistant_id":"any_writer",
        "better_with_web_gpu":true,
        "functions":["enable_microphone","enable_speaker","load_voice_chat_example"],
        "classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
    },

    "search":{
        "type":"learning",
        "i18n_code":"Search_your_documents",
        "assistant_id":"any_writer",
        "better_with_web_gpu":true,
        //"functions":["enable_microphone","enable_speaker","load_voice_chat_example"],
        "classes_to_add":["show-documents-search"],
        "classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite","chat-shrink"],
    },
    /*
    "search_many_documents":{
        "type":"learning",
        "i18n_code":"Search_many_documents",
        "assistant_id":"any_writer",
        "functions":["Search_many_documents_example"],
        "classes_to_add":["show-documents-search"],
        "classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
    },
    */
    "chat_with_a_document":{
        "type":"learning",
        "i18n_code":"Chat_with_a_document",
        "assistant_id":"any_writer",
        "functions":["load_chat_with_a_document_example"],
    },

    "research":{
        "type":"learning",
        "i18n_code":"Research_a_topic",
        "assistant_id":"clone_researcher1",
        //"better_with_web_gpu":true,
        //"functions":["enable_microphone","enable_speaker","load_voice_chat_example"],
        //"classes_to_add":["sidebar-chat"],
        "classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
    },
    "code":{
        "type":"programming",
        "i18n_code":"write_code",
        "assistant_id":"any_coder",
        "classes_to_add":["show-document","coder"],
        "classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
        "functions":["load_write_code_example"],
    },

}

let functionality_categories = []; //['chat','document','media','camera'];
for (let [key, value] of Object.entries(window.functionality)) {
	if(typeof value.type == 'string' && functionality_categories.indexOf(value.type) == -1){
		functionality_categories.push(value.type);
	}
}



function generate_early_functionalities_list(){
	//console.log("in generate_early_functionalities_list. window.functionality: ", window.functionality);

	
	for(let f = 0; f < functionality_categories.length; f++){
		let list_to_clear_el = document.querySelector("#" + functionality_categories[f] + "-functionalities-list");
		if(list_to_clear_el){
			list_to_clear_el.innerHTML = '';
		}
	}
	
	let functionality_counter = 0;
	for (let [key, details] of Object.entries(window.functionality)) {
	    //console.log(key, details);
		functionality_counter++;
		if(typeof details.i18n_code == 'string'){
			let switch_button_el = document.createElement('button');
			switch_button_el.classList.add('functionality-button-' + details.i18n_code);
			if(typeof details.requires_web_gpu == 'boolean' && details.requires_web_gpu == true){
				switch_button_el.classList.add('functionality-requires-web-gpu');
			}
			if(typeof details.better_with_web_gpu == 'boolean' && details.better_with_web_gpu == true){
				switch_button_el.classList.add('functionality-better-with-web-gpu');
			}
			
			if(key == 'chat'){
				switch_button_el.innerHTML = '<img src="./images/chat_mini_ankeiler.png" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'new'){
				switch_button_el.innerHTML = '<img src="./images/new_document_mini_ankeiler.png" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'pictures'){
				switch_button_el.innerHTML = '<img src="./images/make_pictures_mini_ankeiler.png" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'scan'){
				switch_button_el.innerHTML = '<img src="./images/scan_document_mini_ankeiler.png" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'meeting'){
				switch_button_el.innerHTML = '<img src="./images/take_meeting_notes_mini_ankeiler.svg" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'music'){
				switch_button_el.innerHTML = '<img src="./images/make_music_mini_ankeiler.svg" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'search'){
				switch_button_el.innerHTML = '<img src="./images/search_your_documents_mini_ankeiler.svg" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			else if(key == 'code'){
				switch_button_el.innerHTML = '<img src="./images/write_code_mini_ankeiler.png" alt="' + details.i18n_code + '"/><div data-i18n="' + details.i18n_code + '">' + details.i18n_code.replaceAll('_',' ') + '</div>';
			}
			
			else{
				let button_text_content_el = document.createElement('span');
				button_text_content_el.setAttribute('data-i18n',details.i18n_code);
				button_text_content_el.textContent = details.i18n_code.replaceAll('_',' ');
				switch_button_el.appendChild(button_text_content_el);
			}
			switch_button_el.addEventListener("click", (event) => {
				if(typeof do_functionality != 'undefined'){
					do_functionality(key);
				}
				
				
				//generate_ui();
				//translate();
			});
			
			if(typeof details.type == 'string'){
				let list_to_attach_to_el = document.getElementById(details.type + "-functionalities-list");
				if(list_to_attach_to_el){
					list_to_attach_to_el.appendChild(switch_button_el);
				}
			}
			
			/*
			setTimeout(() => {
				
				
			},functionality_counter * 100);
			*/
			
		}
		
	}
}
//if(window.settings.docs.open == null){
	//generate_early_functionalities_list();
//}




const recently_opened_documents_list_el = document.getElementById("recently-opened-documents-list");

function generate_recent_documents_list(){
	//console.log("in generate_recent_documents_list");
	
	recently_opened_documents_list_el.innerHTML = '';
	let added_something = false;
	if(window.settings.docs.recent && window.settings.docs.recent.length){
		
		for(let r = 0; r < window.settings.docs.recent.length; r++){
			
			const file_data = window.settings.docs.recent[r];
			//console.log("generate_recent_documents_list: file_data: ", file_data);
			
			if(window.files_loaded && !filename_is_media(file_data.filename) && typeof playground_live_backups[file_data.folder + '/' + file_data.filename] != 'string' && typeof playground_saved_files[file_data.folder + '/' + file_data.filename] != 'string'){
				//console.error("generate_recent_documents_list: skipping file item that no longer seems to exist: ", file_data.filename);
				continue
			}
			
			
			let recent_li = document.createElement('li');
			recent_li.classList.add('recent-documents-item');
			recent_li.classList.add('flex');
			
			let recent_file_icon_container_el = document.createElement('div');
			recent_file_icon_container_el.classList.add('recent-documents-icon-container');
			
			let recent_file_icon_el = document.createElement('img');
			recent_file_icon_el.classList.add('recent-documents-icon');
			
			if(file_data.filename.endsWith('.vtt') || file_data.filename.endsWith('.srt') ){
				recent_file_icon_el.src = './images/subtitle_icon.svg';
			}
			else if(file_data.filename.endsWith('.blueprint') ){
				recent_file_icon_el.src = './images/blueprint_icon.svg';
			}
			else if(window.filename_is_image(file_data.filename)){
				recent_file_icon_el.src = './images/image_icon.svg';
			}
			else if(window.filename_is_audio(file_data.filename)){
				recent_file_icon_el.src = './images/audio_icon.svg';
			}
			else if(window.filename_is_video(file_data.filename)){
				recent_file_icon_el.src = './images/video_icon.svg';
			}
			else{
				recent_file_icon_el.src = './images/document.svg';
			}
			recent_file_icon_container_el.appendChild(recent_file_icon_el);
			
			let recent_file_info_container_el = document.createElement('div');
			recent_file_info_container_el.classList.add('recent-documents-info-container');
			
			let folder_name_el = document.createElement('span');
			folder_name_el.classList.add('recent-documents-item-folder');
			let clean_folder_name = file_data.folder;
			/*
			if(clean_folder_name.endsWith('/')){
				clean_folder_name = clean_folder_name.substr(0,clean_folder_name.length-1);
			}
			*/
			if(clean_folder_name.startsWith('/')){
				clean_folder_name = clean_folder_name.substr(1);
			}
			folder_name_el.textContent = clean_folder_name;
			
			let file_name_el = document.createElement('span');
			file_name_el.classList.add('recent-documents-item-filename');
			file_name_el.textContent = file_data.filename;
			
			recent_file_info_container_el.appendChild(file_name_el);
			recent_file_info_container_el.appendChild(folder_name_el);
			
			recent_li.appendChild(recent_file_icon_container_el);
			recent_li.appendChild(recent_file_info_container_el);
			
			recent_li.addEventListener('click', () => {
				//console.log("clicked on recent document item: ", file_data);
				/*
				if(file_data.filename != current_file_name || file_data.folder != folder){
					open_file(file_data.filename,null,file_data.folder);
				}
				*/
				if(window.files_loaded){
					open_file(file_data.filename,null,file_data.folder);
					document.body.classList.add('show-document');
				}
				
			});
			
			added_something = true;
			recently_opened_documents_list_el.appendChild(recent_li);
		
			
		}
	}
	
	if(added_something){
		document.body.classList.add('has-recent-documents');
	}
	else{
		document.body.classList.remove('has-recent-documents');
	}
	
}
window.generate_recent_documents_list = generate_recent_documents_list;

window.generate_recent_documents_list();