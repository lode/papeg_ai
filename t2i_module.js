

//
//   TEXT TO IMAGE - STABLE DIFFUSION TURBO
//

let my_text_to_image_task = null;

let text_to_image_worker_error_count = 0;
let text_to_image_previous_percentage = 1;
let text_to_image_previous_percentage_timestamp = 0;
let text_to_image_files = {};
text_to_image_files = {'unet':{'loaded':0,'total':1733430199}, 'text_encoder':{'loaded':0,'total':681393168}, 'vae_decoder':{'loaded':0,'total':99094314},'tokenizer.json':{'loaded':0,'total':2224081}};


window.interrupt_text_to_image = function(){
	//console.log("in interrupt_text_to_image");
	
	window.change_tasks_with_type('text_to_image');
	
	if(window.real_text_to_image_worker != null){
		window.real_text_to_image_worker.postMessage({'action':'interrupt'});
		return true
	}
	return false
}


window.stop_text_to_image_worker = function(){
	//console.log("in stop_text_to_image_worker");
	
	if(window.real_text_to_image_worker != null){
		//console.log("stop_text_to_image: posting stop message to worker");
		window.real_text_to_image_worker.postMessage({'action':'stop'});
	}
	/*
	if(window.real_text_to_image_worker != null){
		//console.log("stop_text_to_image: posting stop message to worker");
		window.real_text_to_image_worker.postMessage({'action':'stop'});
		setTimeout(()=>{
			window.real_text_to_image_worker.terminate();
		},1000;)
		return true
	}
	else{
		//console.log("stop_text_to_image: worker is already null");
	}
	*/
	
	setTimeout(() => {
		if(window.real_text_to_image_worker){
			//console.log("do_unload: stopping imager worker harshly by terminating worker");
			
			window.real_text_to_image_worker.terminate();
			
		}
		else{
			//console.log("do_unload: text_to_image worker stopped cleanly");
		}
		window.text_to_image_worker = null; // promise worker, not used right now
		window.real_text_to_image_worker = null;
		window.text_to_image_worker_busy = false;
		window.text_to_image_worker_loaded = false;
		window.busy_loading_text_to_image = false;
	},2000);
	
	
	
	
	return true
}




async function create_text_to_image_worker(){
	//console.log("in create_text_to_image_worker.");
	if(window.busy_loading_assistant != null){
		console.warn("create_text_to_image_worker: notice only: window.busy_loading_assistant was not null");
	}
	window.busy_loading_assistant = 'text_to_image';
	
	return new Promise((resolve, reject) => {
		
		let exists = false;
		window.text_to_image_worker = null;
		window.real_text_to_image_worker = null;
		window.real_text_to_image_worker = new Worker('./t2i_worker.js', {
		  	type: 'module'
		})
		//window.text_to_image_worker = new PromiseWorker(window.real_text_to_image_worker);
		
		//console.log("text_to_image_module: window.text_to_image_worker: ", window.text_to_image_worker);
		
		setTimeout(() => {
			window.add_chat_message_once('text_to_image','text_to_image','model_examples#setting---');
		},2000);
		
		setTimeout(() => {
			if(exists == false){
				console.error("after ten seconds, text_to_image worker still did not exist. Something probably went wrong.");
				reject(false);
			}
		},10000);
		
		
		
		window.real_text_to_image_worker.addEventListener('message', e => {
			//console.log("text_to_image_module: received message from text_to_image_worker: ", e.data);
			handle_worker_message(e);
		});
		
		function handle_worker_message(e){
			if(typeof e.data.status == 'string'){
				
				if(e.data.status == 'progress' && typeof e.data.file == 'string'){
					//console.log("text_to_image worker sent download progress: ", e.data.progress);
					
					let text_to_image_progress_el = document.getElementById('download-progress-text_to_image');
					if(text_to_image_progress_el == null){
						console.error("text_to_image (down)load progress element is missing");
						add_chat_message('text_to_image','text_to_image','download_progress#setting---');
					}
					else{
						
						
						
						text_to_image_files[e.data.file] = e.data;
				
						//console.log("text_to_image_files: ", text_to_image_files);
						
						let total_bytes = 0;
						let loaded_bytes = 0;
						let text_to_image_file_names = keyz(text_to_image_files);
						if(text_to_image_file_names.length > 0){
							for(let w = 0; w < text_to_image_file_names.length; w++){
								if(typeof text_to_image_files[text_to_image_file_names[w]].total == 'number' && typeof text_to_image_files[text_to_image_file_names[w]].loaded == 'number'){
									total_bytes += text_to_image_files[text_to_image_file_names[w]].total;
									loaded_bytes += text_to_image_files[text_to_image_file_names[w]].loaded;
								}
						
							}
						}
						if(total_bytes > 0){
							
							//e.data.progress
							text_to_image_progress_el.value = loaded_bytes / total_bytes;//e.data.progress / 100;
							
							
							let percentage = Math.floor((loaded_bytes / total_bytes) * 100);
							if(text_to_image_previous_percentage > percentage){
								text_to_image_previous_percentage = 0;
							}
							if(Math.floor(percentage) > text_to_image_previous_percentage){
								//console.log("text_to_image: download %: ", percentage, ", loaded/total: ", loaded_bytes, total_bytes, text_to_image_file_names);
								/*
								if(percentage == 1){
									text_to_image_previous_percentage_timestamp = Date.now();
								}
								else 
								*/
								if(percentage > 2){
									
									let text_to_image_progress_parent_el = text_to_image_progress_el.parentNode;
									if(text_to_image_progress_parent_el){
										
										let text_to_image_time_remaining_element = text_to_image_progress_parent_el.querySelector('.time-remaining');
										if(text_to_image_time_remaining_element){
											//console.log("OK, found text_to_image_time_remaining_element");
											const delta = Date.now() - text_to_image_previous_percentage_timestamp;
											//console.log("text_to_image_progress: time it took for 1% progress: ", delta);
											const percent_remaning = 100 - percentage;
											//console.log("text_to_image_download_progress: seconds remaning: ", (percent_remaning * delta) / 1000);
											//text_to_image_time_remaining_element.innerHTML = '<span></span>';
									
											let time_remaining = (percent_remaning * delta) / 1000;
											text_to_image_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
										}
										else{
											console.error("could not find text_to_image .time-remaining element");
										}
									}
									else{
										console.error("could not find text_to_image parent for .time-remaining element");
									}
									
									
									if(percentage == 100){
										text_to_image_files = {'unet':{'loaded':0,'total':1733430199}, 'text_encoder':{'loaded':0,'total':681393168}, 'vae_decoder':{'loaded':0,'total':99094314},'tokenizer.json':{'loaded':0,'total':2224081}};
										let chat_message_el = text_to_image_progress_el.closest('download-progress-chat-message');
										if(chat_message_el){
											//chat_message_el.classList.add('download-complete-chat-message');
											chat_message_el.remove();
											window.set_model_loaded(true);
										}
										//window.busy_loading_text_to_image = false;
										return
									}
									
									
								}
								text_to_image_previous_percentage = percentage;
								text_to_image_previous_percentage_timestamp = Date.now();
							
							
							}
							
							
							
							
							
							
							/*
							//let text_to_image_progress_el = document.getElementById('download-progress-text_to_image');
							if(text_to_image_progress_el == null){
								console.error("text_to_image (down)load progress element is missing");
								add_chat_message('current','text_to_image','download_progress#setting---');
							}
							else{
								//console.log("updating text_to_image (down)load progress: ", ((loaded_bytes / total_bytes) * 100) + "%");
							}
							*/
						}
						else{
							console.error("text_to_image loading: total_bytes is 0");
						}
					}
					
					
					
					/*
					let text_to_image_progress_el = document.getElementById('download-progress-text_to_image');
					if(text_to_image_progress_el == null){
						console.error("text_to_image (down)load progress element is missing");
						add_chat_message('text_to_image','text_to_image','download_progress#setting---');
					}
					else{
						//console.log("updating text_to_image (down)load progress");
						text_to_image_progress_el.value = e.data.progress / 100;
					}
					*/
				
				}
				else if(e.data.status == 'exists'){
					//console.log("text_to_image worker sent exists message");
					//console.log("window.text_to_image_worker_loaded: ", window.text_to_image_worker_loaded);
					//console.log("window.busy_loading_text_to_image: ", window.busy_loading_text_to_image);
					exists = true;
					resolve(true);
				}
				
				else if(e.data.status == 'preload_complete' || e.data.status == 'download_complete'){
					//console.log("received download_complete message from text_to_image worker");
					window.busy_loading_text_to_image = false;
				}
				
				else if(e.data.status == 'unloaded'){
					//console.log("text_to_image worker sent unloaded message");
					window.busy_loading_text_to_image = false;
					window.text_to_image_worker_busy = false;
				}
				
			
				else if(e.data.status == 'ready'){
					//console.log("text_to_image worker sent ready message. e.data: ", e.data);
					//window.text_to_image_worker_busy = false;
					
					if(typeof window.busy_loading_assistant == 'string' && window.busy_loading_assistant == 'text_to_image'){
						window.busy_loading_assistant = null;
					}
					window.text_to_image_worker_loaded = true;
					window.busy_loading_text_to_image = false;
					window.currently_loaded_assistant = 'text_to_image';
					if(window.settings.assistant == 'text_to_image'){
						window.set_model_loaded(true);
					}
					
					add_chat_message('current','developer',get_translation('Text_to_image_AI_has_loaded'));
					let text_to_image_progress_el = document.getElementById('download-progress-text_to_image');
					if(text_to_image_progress_el){
						//console.log("text_to_image became ready, adding 'download-complete-chat-message' class to chat message");
						let download_progress_chat_message_el = text_to_image_progress_el.closest('.message');
						if(download_progress_chat_message_el){
							download_progress_chat_message_el.classList.add('download-complete-chat-message');
							setTimeout(() => {
								download_progress_chat_message_el.remove();
							},3000);
						}
						else{
							console.error("text_to_image became ready, but cannot find parent chat message to add download complete class");
						}
					}
					else{
						console.error("text_to_image became ready, but cannot find loading progress indicator element");
					}
				}
			
				else if(e.data.status == 'initiate'){
					//console.log("text_to_image worker sent initiate message");
				}
				
				else if(e.data.status == 'running'){
					//console.log("text_to_image worker sent running message");
				}
				else if(e.data.status == 'running_completed'){
					//console.log("text_to_image worker sent running_completed message");
				}
			
				//https://huggingface.co/Xenova/opus-mt-nl-en/resolve/main/onnx/decoder_model_merged_quantized.onnx?download=true
			
				else if(e.data.status == 'download'){
					//console.log("text_to_image worker sent download message: ", e.data.file);
					//const file_to_cache = 'https://www.huggingface.co/' + e.data.name + '/resolve/main/' + e.data.file;
					
					if(document.body.classList.contains('developer')){
						add_chat_message('current','developer','(down)loading: ' + e.data.file);
					}
				}
			
				else if(e.data.status == 'preloaded'){
					//console.log("text_to_image worker sent 'preloaded' message. Seems to be ready to go.");
					add_chat_message('text_to_image','text_to_image', get_translation('Loading_complete'),'Loading_complete');
				}
				
			
				else if(e.data.status == 'done'){
					//console.log("text_to_image worker sent 'done' message. Seems to be for a file being done downloading");
					handle_download_complete(false);
				}
				
				
				else if(e.data.status == 'text_to_image_progress'){
					//console.log("text_to_image worker sent 'text_to_image_progress' message: ", e.data);
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number' && typeof e.data.progress == 'number'){
						//console.log("got everything to update text_to_image progress");
						let text_to_image_progress_el = document.getElementById('chat-message-task-text_to_image-progress' + e.data.task.index);
						if(text_to_image_progress_el == null){
							let text_to_image_task_el = document.getElementById('chat-message-task-text_to_image' + e.data.task.index);
							if(text_to_image_task_el){
								text_to_image_progress_el = document.createElement('progress');
								text_to_image_progress_el.setAttribute('id','chat-message-task-text_to_image-progress' + e.data.task.index);
								text_to_image_task_el.appendChild(text_to_image_progress_el);
								const text_to_image_time_remaining_el = document.createElement('div');
								text_to_image_time_remaining_el.setAttribute('id','chat-message-task-text_to_image-time-remaining' + e.data.task.index);
								text_to_image_time_remaining_el.classList.add('time-remaining');
								text_to_image_task_el.appendChild(text_to_image_time_remaining_el);
							}
							else{
								//text_to_image_previous_percentage_timestamp = Date.now();
							}
						}
						
						if(text_to_image_progress_el){
							text_to_image_progress_el.value = e.data.progress;
							
							
							
							const text_to_image_time_remaining_element = document.getElementById('chat-message-task-text_to_image-time-remaining' + e.data.task.index);
							if(text_to_image_time_remaining_element){
								const percentage = e.data.progress * 100;
								
								if(text_to_image_previous_percentage > percentage){
									text_to_image_previous_percentage = 0;
								}
								
								if(Math.floor(percentage) > text_to_image_previous_percentage){
									//console.log("\n\ntext_to_image: %: ", percentage);
									if(percentage == 1){
										text_to_image_previous_percentage_timestamp = Date.now();
									}
									if(percentage > 2){
										const delta = Date.now() - text_to_image_previous_percentage_timestamp;
										//console.log("text_to_image_progress: time it took for 1% progress: ", delta);
										const percent_remaning = 100 - percentage;
										//console.log("text_to_image_progress: seconds remaning: ", (percent_remaning * delta) / 1000);
										//text_to_image_time_remaining_element.innerHTML = '<span></span>';
										
										let time_remaining = (percent_remaning * delta) / 1000;
										text_to_image_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
										
										
									}
									text_to_image_previous_percentage = percentage;
									text_to_image_previous_percentage_timestamp = Date.now();
								
								
								}
							}
							else{
								console.error("text_to_image: could not find time-remaining element");
							}
							
							
							/*
							if(e.data.progress == 1){
								text_to_image_progress_el.removeAttribute('id');
							}
							*/
							
						}
						else{
							console.error("still no text_to_image_progress_el");
						}
						
					}
				}
				
				else if(e.data.status == 'download_required'){
					//console.log("text_to_image worker sent 'download_required' message.");
					flash_message(get_translation("A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection"), 4000, 'fail');
				}
			
				
				
				// Append generated image to task output element of chat bubble
				else if( e.data.status == 'final_image' && typeof e.data.blob != 'undefined' && typeof e.data.task == 'object' && e.data.task != null && typeof e.data.task.index == 'number'){
					console.warn("Image generated");
					//console.log("text_to_image blob: ", e.data.blob);
				
					document.body.classList.remove('doing-text_to_image');
					window.text_to_image_worker_busy = false;
				
					if(typeof e.data.task != 'undefined'){
						window.handle_completed_task(e.data.task,true);
					}
					window.place_generated_image_in_bubble(e.data);
					
					if(window.pip_started){
						window.image_to_pip_canvas(e.data.blob);
					}
					
					// Keep track of unread messages
					if(window.settings.assistant != 'text_to_image'){
						if(typeof window.unread_messages['text_to_image'] == 'number'){
							window.unread_messages['text_to_image']++; // = window.unread_messages['text_to_image'] + 1;
						}
						else{
							window.unread_messages['text_to_image'] = 1;
						}
					}
				
				}
				
				
				
				
				
				else if(e.data.status == 'error'){
					if(typeof e.data.error == 'string'){
						if(e.data.error.indexOf('no available backend found') != -1){
							flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),4000,'warn');
						}
						else{
							flash_message(get_translation('An_error_occured'),4000,'warn');
						}
					}
					
					window.text_to_image_worker_busy = false;
				}
				
				
				
				else{
					//console.log("text_to_image worker sent an unexpected content message: ", e.data);
					window.text_to_image_worker_busy = false;
				}
			}
		}
		

		window.real_text_to_image_worker.addEventListener('error', (error) => {
			console.error("ERROR: text_to_image_worker sent error. terminating!. Error was: ", error, error.message);
			text_to_image_worker_error_count++;
			
			window.real_text_to_image_worker.terminate();
			window.text_to_image_worker = null;
			window.text_to_image_worker_busy = false;
			if(window.busy_loading_assistant == 'text_to_image'){
				window.busy_loading_assistant = null;
			}
			if(typeof error != 'undefined' && text_to_image_worker_error_count < 3){
				setTimeout(() => {
					//console.log("attempting to restart text_to_image worker");
					create_text_to_image_worker();
				},1000);
			}
			else{
				console.error("text_to_image_worker errored out");
			}
			
			// TODO: clean up the partially executed task?
			if(my_text_to_image_task != null){
				window.handle_completed_task(my_text_to_image_task,false,{'state':'failed'});
				my_text_to_image_task = null;
			}
			
		});
		
		
	});
	
}







window.place_generated_image_in_bubble = function(e_data){
	if(typeof e_data.task.index == 'number' && typeof e_data.blob != 'undefined'){
		let task_output_el = document.querySelector("#chat-message-task-text_to_image-text_to_image" + e_data.task.index);

		if(task_output_el == null && typeof e_data.task.prompt == 'string'){
			console.warn("adding missing text_to_image chat output bubble"); // for blueprints
			add_chat_message('text_to_image','text_to_image',e_data.task.prompt,null,'<div class="spinner"></div>',e_data.task.index);
			task_output_el = document.querySelector("#chat-message-task-text_to_image-text_to_image" + e_data.task.index);
		}
		
		if(task_output_el){
			//console.log("found chat bubble text_to_image task output element");
	
			task_output_el.innerHTML = '';
	
			// image wrapper
			let generated_image_container_el = document.createElement('div');
			generated_image_container_el.classList.add('generated-image-container');
	
			// image
			let generated_image_el = document.createElement('img');
			const image_blob_url = window.URL.createObjectURL(e_data.blob);
			generated_image_el.src = window.URL.createObjectURL(e_data.blob);
			generated_image_el.classList.add('generated-image');
			generated_image_container_el.appendChild(generated_image_el);
	
			// buttons wrapper
			let generated_image_buttons_container_el = document.createElement('div');
			generated_image_buttons_container_el.classList.add('generated-image-buttons-container');
	
			// Download generated image button
			let download_generated_image_button_el = document.createElement('div');
			download_generated_image_button_el.classList.add('generated-image-button');
			download_generated_image_button_el.classList.add('download-generated-image-button');
			download_generated_image_button_el.innerHTML = '<span class="unicode-icon">⤓<span>';
			generated_image_buttons_container_el.appendChild(download_generated_image_button_el);
			download_generated_image_button_el.addEventListener('click', (event) => {
				//console.log("downloading generated image");
		
				const a = document.createElement("a");
				a.href = image_blob_url;
				let download_filename = e_data.task.prompt;
				if(download_filename.length > 80){
					download_filename = download_filename.substr(0,80);
				}
				//console.log("download_filename: ", download_filename);
				a.download = download_filename + ".png";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
		
			});
	
			// Save generated image button
			let save_generated_image_button_el = document.createElement('div');
			save_generated_image_button_el.classList.add('generated-image-button');
			save_generated_image_button_el.classList.add('save-generated-image-button');
			save_generated_image_button_el.innerHTML = '<span class="unicode-icon">💾</span>';
			save_generated_image_button_el.addEventListener('click', (event) => {
				//console.log("saving generated image to current folder");
		
				let save_filename = e_data.task.prompt;
				if(save_filename.length > 62){
					save_filename = save_filename.substr(0,62);
				}
				let final_filename = save_filename + '-' + makeid(4) + '.png';
				//console.log("final_filename: ", final_filename);
				//console.log("blob to save: ", image_blob_url);
				if(valid_new_name(final_filename)){
					//console.log("new filename is valid");
				}
				else{
					//console.log("new filename is invalid, attempting to add random string");
					final_filename = save_filename + '-' + window.makeid(4) + '.png';
				}
				final_filename = window.sanitize_filename(final_filename);
				if(valid_new_name(final_filename)){
					//console.log("calling save_blob with filename: ", final_filename);
					window.save_blob(e_data.blob, final_filename);
					window.show_files_tab(); // only shows it if the sidebar is already open
			
				}
				else{
					console.error("could not create a valid filename for the generated image: ", final_filename);
					//flash_message(get_translation("invalid_file_name"),3000,'fail');
				}
		
			});
	
			generated_image_buttons_container_el.appendChild(save_generated_image_button_el);
	
			generated_image_container_el.appendChild(generated_image_buttons_container_el);
	
			task_output_el.appendChild(generated_image_container_el);
	
			
	
		}
		else{
			console.error("Could not find chat bubble to place generated image into: #chat-message-task-text_to_image-text_to_image" + e_data.task.index);
		}
		
	
		if(e_data.status == 'final_image'){
			
			handle_completed_task(e_data.task,true);
			window.text_to_image_worker_busy = false;
			
			if(typeof e_data.task != 'undefined' && e_data.task != null && typeof e_data.task.origin == 'string' && e_data.task.origin == 'play_document' && document.body.classList.contains('fairytale')){
				
				//console.log("fairytale! special case. placing generated image in playground overlay");
				
			   const playground_overlay = document.getElementById('playground-overlay');
			   if(playground_overlay){
				   var reader = new FileReader();
				   reader.readAsDataURL(e_data.blob); 
				   reader.onloadend = function() {
					   
					   const existing_image = playground_overlay.querySelector('img');
					   if(existing_image){
						   existing_image.classList.add('fade-out-slow');
					   }
					   setTimeout(() => {
						   playground_overlay.innerHTML = '<img src="' + reader.result + '" class="fade-in-slow"/>'; 
						   //URL.revokeObjectURL(reader.result);
					   },2000);
				   
					   
					   
				   
				   }
			   }
				   
				
			}
			
			
		}
	}
	
}


//console.log("text_to_image_module.js:  calling create_text_to_image_worker");
//create_text_to_image_worker();




window.preload_text_to_image = function (){
	//console.log("in preload_text_to_image");
	if(window.text_to_image_worker == null && window.busy_loading_text_to_image == false){
		window.busy_loading_text_to_image = true;
		create_text_to_image_worker();
	}
}


window.do_text_to_image = function (task=null){ // text_to_image_queue_item
	//console.log("in do_text_to_image. Task: ", task);
	
	if(task == null){
		console.error("do_text_to_image: invalid task provided");
		return false
	}
	if(typeof task.prompt != 'undefined' && task.prompt == null){
		console.error("do_text_to_image: task has invalid prompt: ", task);
		return false
	}
	
	if(window.real_text_to_image_worker){
		//console.log("do_text_to_image: sending task to real worker");
		window.real_text_to_image_worker.postMessage({'task':task});
	}
	else{
		console.error("do_text_to_image: real text_to_image worker was null, attempting to create it now");
		create_text_to_image_worker()
		.then((value) => {
			//console.log("create_text_to_image_worker is done. value: ", value);
			if(window.real_text_to_image_worker){
				//console.log("OK, posting task to text_to_image worker: ", task);
				document.body.classList.add('doing-text-to-image');
				// Seems to need a little more time before it can receive messages
				//setTimeout(() => {
					
				//},1000);
				window.real_text_to_image_worker.postMessage({'task':task});
				
			}
			else{
				console.error("still no window.real_text_to_image_worker? ", window.real_text_to_image_worker);
			}
		})
		.catch((err) => {
			console.error("do_text_to_image: caught error from create_text_to_image_worker: ", err);
			window.handle_completed_task(task,false,{'state':'failed'});
			window.text_to_image_worker_busy = false;
			window.text_to_image_worker_loaded = false;
			window.busy_loading_text_to_image = false;
			document.body.classList.remove('doing-text-to-image');
		})
		
	}
	
	return true;
}


// Not used at the moment, but with the recent speed-up it might become useful
window.do_text_to_image_promise = function (task){
	
	//await caches.open(window.cache_name).then((my_cache) => my_cache.add(e.data.file))
	//await create_text_to_image_worker();
	return new Promise((resolve, reject) => {
	
		if(task == null){
			console.error("do_text_to_image: task was null");
			reject(false);
			return false
		}
	
		if(typeof task.prompt == 'undefined' || typeof task.prompt != 'string'){
			console.error("do_text_to_image: invalid prompt provided");
			reject(false);
			return false
		}
	
	
		window.text_to_image_worker_busy = true;
	
		// This AI can use different models under the hood. It's not optimal to do this nested approach..
		/*
		if(typeof window.settings.assistants['text_to_image'] != 'undefined' && typeof window.settings.assistants['text_to_image']['huggingface_id'] == 'string' && window.settings.assistants['text_to_image']['huggingface_id'].length){  // window.settings['text_to_image'].model_id.toLowerCase().indexOf('nanollava') != -1
			task['huggingface_id'] = window.settings.assistants['text_to_image'].huggingface_id;
			//console.log('do_text_to_image: setting task.huggingface_id as: ', window.settings.assistants['text_to_image'].huggingface_id);
		}
		else{
			console.error('do_text_to_image: NOT setting task.huggingface_id.  window.settings.assistants[text_to_image]:  ', window.settings.assistants['text_to_image']);
		}
		*/
	
		/*
		else if(typeof window.settings['text_to_image'] != 'undefined' && typeof window.settings['text_to_image'].model_id == 'string' && window.settings['text_to_image'].model_id.toLowerCase().indexOf('moondream') != -1){
			task['model_id'] = window.settings['text_to_image'].model_id;
		}
		*/
	
		/*
		if(window.text_to_image_worker_busy == true){
			console.error("do_text_to_image: ABORTING. window.text_to_image_worker_busy was already true. task: ", task);
			reject(false);
			return false
		}
	
		window.text_to_image_worker_busy = true;
		*/
		my_text_to_image_task = task;
	
		/*
		caches.open(window.cache_name)
		.then((my_cache) => {
			my_cache.add(e.data.file);
			return create_text_to_image_worker();
		})
		*/
	
	
		if(window.text_to_image_worker == null){
			//console.log("do_text_to_image: calling create_text_to_image_worker");
			create_text_to_image_worker()
			.then((value) => {
				//console.log("do_text_to_image: .then: create_text_to_image_worker should be done now. value: ",value);
				//console.log("do_text_to_image: window.text_to_image_worker: ", window.text_to_image_worker);
		
				if(window.text_to_image_worker == null){
					console.error("do_text_to_image: creating text_to_image promise worker failed");
					reject(false);
				}
				else{
					console.warn("do_text_to_image: window.text_to_image_worker seems to exist: ", window.text_to_image_worker);
					//text_to_image_worker.postMessage({'task':task});
		
					document.body.classList.add('doing-text-to-image');
				
					console.warn("do_text_to_image: posting message to text_to_image_worker");
					window.text_to_image_worker.postMessage({
						'task':task
					})
					.then((response) => {
						console.error("\n\nHURRAY\n\nin text_to_image promiseWorker then!\n\n");
						//console.log("text_to_image -> promise worker response: ", response);
						document.body.classList.remove('doing-text-to-image');
						resolve(response);
						//return response;
					})
					.catch((err) => {
						console.error("promise text_to_image worker: received error which was caught in worker: ", err);
						document.body.classList.remove('doing-text-to-image');
						if( ('' + err).indexOf('network error') != -1){
							flash_message(get_translation('A_network_connection_error_occured'),5000,'error');
						}
						
					
						reject(false);
						return false;
					})
		
				}
		
			})
			.catch((err) => {
				console.error("do_text_to_image: caught error from create_text_to_image_worker: ", err);
			})
		}
		else{
			//console.log("do_text_to_image: doing postMessage. sending:  task,text_to_image_worker: ", task, window.text_to_image_worker);
		
			window.text_to_image_worker.postMessage({
				'task':task
			})
			.then((response) => {
				console.error("\n\nHURRAY\n\nin text_to_image promiseWorker.then!\n\n");
				//console.log("text_to_image promise worker response: ", response);
				if(window.continuous_text_to_image_enabled == false){
					document.body.classList.remove('doing-text-to-image');
				}
				resolve(response);
				return response;
			})
			.catch((err) => {
				console.error("promise text_to_image worker: received error which was caught in worker: ", err);
				document.body.classList.remove('doing-text-to-image');
				reject(false);
				return false;
			})
		}
	
	});
	
}




window.unload_text_to_image = function (){
	//console.log("in unload_text_to_image");
	if(window.real_text_to_image_worker != null){
		window.real_text_to_image_worker.postMessage({'action':'stop'});
	}
}







//console.log("text to image module loaded");
