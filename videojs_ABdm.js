videojs.plugin('ABP', ABPinit);
function ABPinit(){
	//this.TOUCH_ENABLED = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
	danmu_div = document.createElement('div');
	danmu_div.className = 'vjs-danmu';
	//if (this.TOUCH_ENABLED && this.options()['nativeControlsForTouch'] !== false) {
	//	this.el().insertBefore(danmu_div,this.el().children[0]);	
	//}else{
		this.el().insertBefore(danmu_div,this.el().getElementsByClassName('vjs-poster')[0]);
	//}
	danmu_control = document.createElement('dev');
	danmu_control.className= 'vjs-danmu-control vjs-menu-button vjs-control';
	danmu_control_content = document.createElement('span');
	danmu_control_content.className='glyphicon glyphicon-eye-open';
	danmu_control.appendChild(danmu_control_content);
	this.el().getElementsByClassName('vjs-control-bar')[0].appendChild(danmu_control);
	this.binddm=function(){
		video=this.el().children[0];
		if(typeof CommentManager !== "undefined"){
			this.cmManager = new CommentManager(this.el().getElementsByClassName('vjs-danmu')[0]);
			this.cmManager.display = true;
			this.cmManager.init();
			this.cmManager.clear();
			video.cmManager=this.cmManager;
			window.cmManager=this.cmManager;
			var lastPosition = 0;
			video.addEventListener("progress", function(){
				if(lastPosition == video.currentTime){
					video.hasStalled = true;
					this.cmManager.stopTimer();
				}else
				lastPosition = video.currentTime;
			});
			if(window){
				window.addEventListener("resize", function(){
					this.cmManager.setBounds();
				});
			}
			video.addEventListener("timeupdate", function(){
				if(this.cmManager.display === false) return;
				if(video.hasStalled){
					this.cmManager.startTimer();
					video.hasStalled = false;
				}
				this.cmManager.time(Math.floor(video.currentTime * 1000));
			});
			video.addEventListener("play", function(){
				this.cmManager.startTimer();
				try{
					var e = this.buffered.end(0);
					var dur = this.duration;
					var perc = (e/dur) * 100;
					vjs.barLoad.style.width = perc + "%";
				}catch(err){}	
			});
			video.addEventListener("ratechange", function(){
				if(this.cmManager.def.globalScale != null){
					if(video.playbackRate !== 0){
						this.cmManager.def.globalScale = (1 / video.playbackRate);
						this.cmManager.rescale();
					}
				}
			});
			video.addEventListener("pause", function(){
				this.cmManager.stopTimer();
			});
			video.addEventListener("waiting", function(){
				this.cmManager.stopTimer();
			});
			video.addEventListener("playing",function(){
				this.cmManager.startTimer();
			});
			video.addEventListener("seeked",function(){
				this.cmManager.clear();
			});

			this.el().getElementsByClassName("vjs-danmu-control")[0].addEventListener("click",function(){
				if(window.cmManager.display==true){
					window.cmManager.display=false;
					window.cmManager.clear();
					this.children[0].setAttribute("class","glyphicon glyphicon-eye-close");
				}else{
					window.cmManager.display=true;
					this.children[0].setAttribute("class","glyphicon glyphicon-eye-open");
				}
			});
		}
	}
	this.binddm();
	this.CommentLoader = function(url,callback){
		if(callback == null)
		  callback = function(){return;};
		if (window.XMLHttpRequest){
			xmlhttp=new XMLHttpRequest();
		}   
		else{
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}   
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
		var cm = this.cmManager;
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				if(navigator.appName == 'Microsoft Internet Explorer'){
					var f = new ActiveXObject("Microsoft.XMLDOM");
					f.async = false;
					f.loadXML(xmlhttp.responseText);
					cm.load(BilibiliParser(f));
					callback(true);
				}else{
					cm.load(BilibiliParser(xmlhttp.responseXML));
					callback(true);
				}   
			}else
			  callback(false);
		}   
	}

};

