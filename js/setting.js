"use strict";
const HJPlayer = {
	versions: function() {
		const u = navigator.userAgent,
			app = navigator.appVersion;
		return {
			trident: u.indexOf('Trident') > -1, //IE内核
			presto: u.indexOf('Presto') > -1, //opera内核
			webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
			gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
			mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
			android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
			iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
			iPad: u.indexOf('iPad') > -1, //是否iPad
			webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
			weixin: u.indexOf('MicroMessenger') > -1, //是否微信
			qq: u.match(/\sQQ/i) == " qq" //是否QQ
		};
	}(),
	'start': function() {
		fetch('./config.json')
			.then(response => {
				// 检查响应是否成功
				if (!response.ok) {
					throw new Error('请求失败，状态码：' + response.status);
				}
				// 解析 JSON 数据
				return response.json();
			})
			.then(e => {
				HJPlayer.waittime = e.waittime;
				HJPlayer.ads = e.ads;
				config.logo = e.logo;
				up.pbgjz = e.pbgjz;
				up.jzuser = e.jzuser;
				up.trysee = e.trytime;
				config.sendtime = e.sendtime;
				config.color = e.color;
				config.background_color = e.background_color;
				config.background_url = e.background_url;
				config.group_x = HJPlayer.ads.set.group;
				config.dmrule = e.dmrule;
				config.title = e.title;
				config.pic = (e.pic == '') ? config.pic : e.pic;
				config.background_color = e.background_color;
				config.font_color = e.font_color;
				config.contextmenu = e.contextmenu;
				config.style = e.style;
				config.time = e.time;
				config.fullscreen = false;
				if (e.count && e.count !== "") {
					const rand = function(min, max) {
						return parseInt(Math.random() * (max - min + 1) + min);
					};
					const str = e.count.split('-');
					if (str.length === 2) {
						up.usernum = rand(str[0], str[1]);
					}
				}
				config.danmuon = e.danmuon;
				if (HJPlayer.ads.state == 'on') {
					if (HJPlayer.ads.set.state == '1') {
						HJPlayer.MYad.vod(HJPlayer.ads.set.vod.url, HJPlayer.ads.set.vod.link);
					} else if (HJPlayer.ads.set.state == '2') {
						HJPlayer.MYad.pic(HJPlayer.ads.set.pic.link, HJPlayer.ads.set.pic.time, HJPlayer.ads
							.set.pic.img);
					}
				} else {
					HJPlayer.play(config.url);
				}
			})
			.catch(error => {
				// 捕获所有错误（网络错误、状态码错误、解析错误等）
				console.error('捕获错误：', error);
			});
	},
	'play': function(url) {
		if (!config.danmuon || config.live) {
			HJPlayer.player.play(url);
		} else {
			if (config.av != '') {
				HJPlayer.player.bdplay(url);
			} else {
				HJPlayer.player.dmplay(url);
			}
		}

		document.addEventListener('DOMContentLoaded', function() {
			// 获取核心元素
			const speedSettingEl = document.querySelector('.speed-stting');
			const speedBtnEls = document.querySelectorAll(
				'.hjplayer-setting-speeds, .hjplayer-setting-speed-item');
			const speedItemEls = document.querySelectorAll(
				'.speed-stting .hjplayer-setting-speed-item');
			const speedTitleEl = document.querySelector('.hjplayer-setting-speeds .title');
			// 边界检查：确保核心元素存在再执行逻辑
			if (!speedSettingEl || !speedTitleEl) return;
			// 1. 点击速度设置按钮/选项时，切换展开/收起类
			speedBtnEls.forEach(el => {
				el.addEventListener('click', function() {
					speedSettingEl.classList.toggle('speed-stting-open');
				});
			});
			// 2. 点击具体速度选项时，更新显示的速度文本
			speedItemEls.forEach(el => {
				el.addEventListener('click', function() {
					// 确保当前元素有文本内容再更新
					if (this.textContent) {
						speedTitleEl.textContent = this.textContent;
					}
				});
			});
		});
		// $(".hjplayer-playlist-icon").on("click", function() { $(".hjplayer-playlist").toggle(); });
		// 关闭全屏操作
		const fulloff = document.querySelector('.hjplayer-fulloff-icon');
		if (fulloff) {
			fulloff.addEventListener('click', function() {
				// 执行取消全屏操作
				if (typeof HJPlayer !== 'undefined' && HJPlayer.dp && HJPlayer.dp.fullScreen) {
					HJPlayer.dp.fullScreen.cancel();
				}
			});
		}
		// 暂停后开始播放
		const showing = document.querySelector('.hjplayer-showing');
		// 增加元素存在性判断，避免报错
		if (showing) {
			showing.addEventListener('click', function() {
				// 执行播放操作
				if (typeof HJPlayer !== 'undefined' && HJPlayer.dp && typeof HJPlayer.dp.play ===
					'function') {
					HJPlayer.dp.play();
				}
				// 移除所有类名为vod-pic的元素
				const vodPic = document.querySelectorAll('.vod-pic');
				vodPic.forEach(element => {
					element.remove();
				});
			});
		}
		//检测标题开关
		const vodtitle = document.getElementById('vodtitle');
		if (config.title === 'on') {
			// 移除 display 样式，恢复默认/原有显示状态
			vodtitle.style.removeProperty('display');
		} else {
			vodtitle.style.display = 'none';
		}
		// $("#vodtitle").html(xyplay.title + '  ' +(Number(xyplay.part)+1));
		//检测时间开关
		if (typeof config !== 'undefined' && config.time) {
			// 创建 stats 元素
			const statsDiv = document.createElement('div');
			statsDiv.id = 'stats';
			// 根据不同的 time 值选择不同的容器
			let targetE;
			if (config.time === 1) {
				targetE = document.querySelector('.vod-title');
			} else if (config.time === 2) {
				targetE = document.getElementById('vodtitle');
			}
			// 确保目标元素存在时再追加，避免操作 null
			if (targetE) targetE.appendChild(statsDiv);
		}
		//显示列表
		HJPlayer.video.list();
		//主题配置
		const cssStyles = [
			'<style type="text/css">',
			'.yzm-hjplayer-send-icon{background:' + config.color + ' !important;}',
			'.showdan-setting .hjplayer-toggle input+label {border: 1px solid' + config.color +
			' !important;background:' + config.color + ' !important;}',
			'.loading .pic { background: url(' + config.background_url + ') no-repeat !important; }',
			'#loading-box{background-image:radial-gradient(' + config.background_color + ') !important ;}',
			'#loading-box span{color:' + config.font_color + ' !important ;}',
			config.style,
			'</style>'
		].join('');
		// 创建style元素并插入到body中
		const styleElement = document.createElement('style');
		styleElement.type = 'text/css';
		// 处理不同浏览器的样式文本插入方式
		if (styleElement.styleSheet) {
			// IE浏览器兼容
			styleElement.styleSheet.cssText = cssStyles.replace('<style type="text/css">', '').replace(
				'</style>', '');
		} else {
			// 标准浏览器
			styleElement.appendChild(document.createTextNode(
				cssStyles.replace('<style type="text/css">', '').replace('</style>', '')
			));
		}
		// 将样式元素添加到body
		// document.body.appendChild(styleElement);
		//隐藏页面全屏
		const iconElement = document.querySelector('.hjplayer-full-in-icon');
		if (iconElement) { // 避免元素不存在时报错
			iconElement.style.display = 'none';
		}
	},
	'dmid': function() {
		let a, b;
		if (up.diyid[0] == 0 && config.id != '') {
			a = config.id,
				b = config.sid
		} else if (up.diyid[0] == 1 || !config.id) {
			a = up.diyid[1],
				b = up.diyid[2]
		}
		HJPlayer.id = a + ' P' + b
	},
	'load': function() {
		const fadeIns = (el) => {
			el.style.opacity = 0;
			el.style.display = 'block';
			el.style.transition = 'opacity 400ms ease';
			el.offsetWidth; // 触发重绘
			el.style.opacity = 1;
		};
		setTimeout(() => fadeIns(document.getElementById('link1')), 100);
		setTimeout(() => fadeIns(document.getElementById('link1-success')), 500);
		setTimeout(() => {
			document.getElementById('link2').style.display = 'block';
		}, 1000);
		setTimeout(() => {
			fadeIns(document.getElementById('link3'));
			fadeIns(document.getElementById('span'));
		}, 2000);
		if (HJPlayer.versions.weixin && (HJPlayer.versions.ios || HJPlayer.versions.iPad) || HJPlayer
			.waittime == 0) {
			// 1. 创建 style 元素
			const styleElement = document.createElement('style');
			styleElement.type = 'text/css';
			// 2. 设置样式内容（保持原有样式规则）
			const cssContent = '#loading-box{display: none;}';
			// 3. 兼容老版本浏览器的样式文本设置方式
			if (styleElement.styleSheet) {
				// IE 8 及以下兼容
				styleElement.styleSheet.cssText = cssContent;
			} else {
				// 标准浏览器
				styleElement.appendChild(document.createTextNode(cssContent));
			}
			// 4. 将 style 元素添加到 body 中
			document.body.appendChild(styleElement);
		}
		HJPlayer.danmu.send();
		HJPlayer.danmu.list();
		HJPlayer.def();
		HJPlayer.video.try();
		HJPlayer.dp.danmaku.opacity(1);
	},
	'def': function() {
		HJPlayer.stime = 0;
		HJPlayer.headt = yzmck.get("headt");
		HJPlayer.lastt = yzmck.get("lastt");
		HJPlayer.last_tip = parseInt(HJPlayer.lastt) + 10;
		HJPlayer.frists = yzmck.get('frists');
		HJPlayer.lasts = yzmck.get('lasts');
		HJPlayer.playtime = Number(HJPlayer.getCookie("time_" + config.url));
		HJPlayer.ctime = HJPlayer.formatTime(HJPlayer.playtime);
		HJPlayer.dp.on("loadedmetadata", function() {
			HJPlayer.loadedmetadataHandler();
		});
		HJPlayer.dp.on('fullscreen', function() {
			if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				screen.orientation.lock('landscape');
			}
			document.getElementById('stats').style.display = '';
			document.getElementById('vodtitle').style.display = '';
			config.fullscreen = true;
		});
		HJPlayer.dp.on('fullscreen_cancel', function() {
			config.fullscreen = false;
			const vodtitle = document.getElementById('vodtitle');
			const stats = document.getElementById('stats');
			if (config.title && config.title !== 'on' && vodtitle) {
				vodtitle.style.display = 'none';
			}
			if (stats) {
				stats.style.display = 'none';
			}
		});
		HJPlayer.dp.on("ended", function() {
			HJPlayer.endedHandler();
		});
		HJPlayer.dp.on('pause', function() {
			HJPlayer.MYad.pause.play(HJPlayer.ads.pause.link, HJPlayer.ads.pause.pic);
		});
		HJPlayer.dp.on('play', function() {
			HJPlayer.MYad.pause.out();
		});
		HJPlayer.dp.on('timeupdate', function(e) {
			HJPlayer.timeupdateHandler();
		});
		/*            切换播放列表          */
		//监控来源列表被改变
		const flaglist = document.getElementById('flaglist');
		if (flaglist) { // 增加元素存在性校验，避免报错
			flaglist.addEventListener('change', function() {
				// xyplay.pflag = this.value;
				HJPlayer.video.playlist(this.value);
			});
		}
		//播放列表选项卡被改变
		const playlist = document.getElementById('playlist');
		if (playlist) {
			playlist.addEventListener('change', function() {
				HJPlayer.video.part(this.value);
			});
		}
		//播放列表失去焦点
		const playlistElement = document.querySelector('.hjplayer-playlist');
		// 定义事件处理函数
		function BOrM() {
			changelist(false);
		}
		// 为元素绑定 blur 和 mouseleave 事件
		if (playlistElement) {
			// 绑定 blur 事件
			playlistElement.addEventListener('blur', BOrM);
			// 绑定 mouseleave 事件
			playlistElement.addEventListener('mouseleave', BOrM);
		}
		// 定义点击事件处理函数
		function plClick() {
			// 获取播放列表容器元素
			const playlistElement = document.querySelector('.hjplayer-playlist');
			// 检查是否包含 fadeleftIn 类
			const isFadeleftIn = playlistElement?.classList.contains('fadeleftIn');
			if (isFadeleftIn) {
				changelist(false);
			} else {
				// 检查视频列表是否存在
				if (typeof HJPlayer !== 'undefined' && HJPlayer.video && typeof HJPlayer.video.list ===
					'function' && HJPlayer.video
					.list()) {
					changelist(true);
				} else {
					// 显示提示信息
					if (typeof HJPlayer !== 'undefined' && HJPlayer.dp && typeof HJPlayer.dp.notice ===
						'function') {
						HJPlayer.dp.notice("当前为直链播放");
					} else {
						console.warn('HJPlayer.dp.notice 方法未定义');
					}
				}
			}
		}
		//监控图标切换
		const playlistIcon = document.querySelector('.hjplayer-playlist-icon');
		// 为图标添加点击事件监听
		if (playlistIcon) {
			playlistIcon.addEventListener('click', plClick);
		} else {
			console.warn('未找到 .hjplayer-playlist-icon 元素');
		}
		//切换播放列表显示
		function changelist(show) {
			const listE = document.querySelector('.hjplayer-playlist');
			// 校验元素是否存在，避免报错
			if (!listE) {
				console.warn('未找到.hjplayer-playlist 元素');
				return;
			}
			if (show) {
				// 移除淡出类，添加显示和淡入类
				listE.classList.remove('faderightOut');
				listE.classList.add('show', 'fadeleftIn');
			} else {
				// 移除淡入类，添加淡出类
				listE.classList.remove('fadeleftIn');
				listE.classList.add('faderightOut');
			}
		}
		/*            切换播放列表END          */
		HJPlayer.jump.def();
	},
	'video': {
		'list': function() {
			try {
				//刷新线路列表
				const flaglistShow = document.querySelector('.flaglist-show');
				// 清空下拉列表（原生方式，比innerHTML=''性能更好）
				while (flaglistShow.firstChild) {
					flaglistShow.removeChild(flaglistShow.firstChild);
				}
				// 遍历列表生成option元素
				const listArray = xyplay.list_array;
				const pflag = xyplay.pflag;
				const len = listArray.length;
				for (let i = 0; i < len; i++) {
					// 创建option元素（原生DOM创建，比拼接HTML更安全）
					const option = document.createElement('option');
					option.className = 'flaglist-item';
					option.value = i;
					option.textContent = listArray[i].flag_name;
					// 设置选中状态
					if (pflag === i) {
						option.selected = true;
					}
					// 添加到下拉列表
					flaglistShow.appendChild(option);
				}
				// 刷新播放列表
				HJPlayer.video.playlist(pflag);
				// 刷新标题
				document.getElementById('vodtitle').textContent = xyplay.title + '  ' + config.vname[xyplay
						.part] || config.vname[0] ||
					'';
				return true;
			} catch (e) {
				showMsg('没有找到剧集信息');
				HJPlayer.dp.notice("没有找到剧集信息");
				return false;
				//$(".hjplayer-playlist-icon").hide();
			}
		},
		'playlist': function(pflag) {
			try {
				const playlistShow = document.querySelector('.playlist-show');
				const playlistSelect = document.getElementById('playlist');
				// 清空元素内容
				playlistShow.innerHTML = '';
				playlistSelect.innerHTML = '';
				// 获取视频列表数据
				const list = xyplay.list_array[pflag].video;
				const len = list.length;
				// 重置配置数组
				config.video = [];
				config.vname = [];
				// 遍历视频列表
				for (let i = 0; i < len; i++) {
					const array = list[i].split('$');
					let title = array[0];
					// 当前选中项标题处理
					let t = (xyplay.part === i) ? title + '' : title;
					// 标题长度截取
					if (title.length > 10) {
						t = title.substring(0, 10);
					}
					// 样式处理
					const style = (xyplay.part === i) ? xyplay.play.style.play_on : '';
					// 创建播放列表li元素
					const li = document.createElement('li');
					li.className = 'playlist';
					li.style.cssText = style;
					li.title = title;
					li.textContent = t;
					// 绑定点击事件（替代onclick内联事件，更优实践）
					li.addEventListener('click', function() {
						HJPlayer.video.part(i);
					});
					// 创建下拉选项option元素
					const option = document.createElement('option');
					option.className = 'playlist-item';
					option.value = i;
					option.title = title;
					option.textContent = title;
					// 设置选中状态
					if (xyplay.part === i) {
						option.selected = true;
					}
					// 更新配置数组
					config.video.push(array[1]);
					config.vname.push(array[0]);
					// 添加到DOM
					playlistShow.appendChild(li);
					playlistSelect.appendChild(option);
				}
				const titleb = "【" + xyplay.title + "】 " + (config.vname[xyplay.part] || config.vname[0]);
				xyplay.setTitle("正在播放: " + titleb);
				const titleE = document.querySelector('.hjplayer-watching-title');
				if (titleE) { // 先判断元素是否存在
					titleE.textContent = "正在播放";
					typeof titleb !== 'undefined' && titleE.setAttribute('title', titleb);
				}
				return true;
			} catch (e) {
				// HJPlayer.dp.notice("没有找到剧集信息");
				showMsg("未找到剧集信息");
				return false;
				// $(".hjplayer-playlist-icon").hide();      
			}
		},
		'part': function(part) {
			const playlist = document.querySelector('.hjplayer-playlist');
			if (playlist) { // 避免元素不存在时报错
				playlist.classList.remove('fadeleftIn');
				playlist.classList.add('faderightOut');
			}
			xyplay.part = part;
			try {
				const url = config.video[part];
				if (this.isVideo(url)) {
					return HJPlayer.video.switchVideo(url);
				}
				// 保存要发送的数据
				const postData = {
					'tp': 'checkPlay',
					'url': url
				};
				HJPlayer.dp.pause();
				const targetContainer = document.querySelector('.hjplayer-cplayer');
				if (targetContainer) {
					targetContainer.insertAdjacentHTML('beforeend',
						'<div style="" class="memory-play-wrap"><div class="memory-play"><span>正在解析</span></div></div>'
					);
				} else {
					console.warn('未找到类名为 "hjplayer-cplayer" 的容器元素');
				}
				// 使用 fetch 发送 POST 请求
				fetch("../../api.php", {
						method: "POST",
						headers: {
							// 设置请求头
							"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
							// 如果后端需要，可以添加 X-Requested-With 标识 AJAX 请求
							"X-Requested-With": "XMLHttpRequest"
						},
						// 将对象转换为 URL 编码的字符串
						body: new URLSearchParams(postData)
					})
					// 处理响应
					.then(response => {
						// 先检查 HTTP 状态是否成功
						if (!response.ok) {
							throw new Error(`HTTP 错误！状态码：${response.status}`);
						}
						// 解析 JSON 响应
						return response.json();
					})
					// 处理成功响应
					.then(data => {
						if (data.type === 'link') {
							xyplay.open(data.url);
						} else if (data.type === 'video' || data.type === 'hls' || data.type === 'mp4') {
							HJPlayer.video.switchVideo(data.url);
						} else {
							xyplay.jxplay();
						}
					})
					// 处理请求错误
					.catch(error => {
						console.error('请求失败：', error);
					})
					.finally(() => {
						const playWrapElement = document.querySelector('.memory-play-wrap');
						if (playWrapElement) {
							playWrapElement.remove();
						}
					});
			} catch (e) {
				xyplay.AutoPlay('list');
			}
		},
		'switchVideo': function(url) {
			// 此处为 MD5 核心实现
			function md5(str) {
				let hash = 0;
				const len = str.length;
				if (len === 0) return hash.toString();
				for (let i = 0; i < len; i++) {
					const char = str.charCodeAt(i);
					hash = ((hash << 5) - hash) + char;
					hash = hash & hash; // 转换为 32 位整数
				}
				return hash.toString(16);
			}
			// 原生字符串截取函数
			function substr(str, start, length) {
				return str.slice(start, start + length);
			}
			config.url = url;
			HJPlayer.playtime = Number(HJPlayer.getCookie("time_" + config.url));
			HJPlayer.ctime = HJPlayer.formatTime(HJPlayer.playtime);
			HJPlayer.id = (
					typeof xyplay === 'object' &&
					xyplay !== null &&
					typeof xyplay.title === 'string' &&
					xyplay.title.indexOf("直链") === -1
				) ?
				xyplay.title.trim() :
				(() => {
					// 兜底处理：防止 config.url/xyplay.part 不存在
					const url = typeof config === 'object' && config.url ? config.url : '';
					const part = typeof xyplay === 'object' && xyplay !== null ? Number(xyplay.part || 0) :
						0;
					return substr(md5(url), 8, 16) + ' P' + (part + 1);
				})();
			HJPlayer.danmu.relist();
			HJPlayer.jump.head();
			HJPlayer.dp.switchVideo({
				url: url
			}, {
				id: HJPlayer.id,
				api: config.api + '?ac=dm',
				user: config.user
			});
			HJPlayer.dp.play();
			HJPlayer.video.playlist(xyplay.pflag);
			const vodtitle = document.getElementById('vodtitle');
			let content = config.vname[xyplay.part] || config.vname[0] || '';
			if (xyplay && xyplay.title) {
				// 拼接标题和分P名称
				content = xyplay.title + '  ' + content;
			}
			if (vodtitle) {
				vodtitle.innerHTML = content;
			}
			xyplay.setTitle("正在播放: " + "【" + xyplay.title + "】 " + (config.vname[xyplay.part] || config.vname[
				0]));
		},
		'isVideo': function(word) {
			if (word === "" || word === null || typeof word === "undefined") {
				return false;
			}
			const n = word.search(/\.(ogg|mp4|webm|m3u8)/i);
			if (n !== -1) {
				return true;
			} else {
				return false;
			}
		},
		'play': function() {
			const targetElement = document.getElementById('link3');
			// 确保元素存在后再操作
			if (targetElement) {
				// 优先使用textContent（标准），降级使用innerText（兼容）
				if (typeof targetElement.textContent !== 'undefined') {
					targetElement.textContent = '视频已准备就绪，即将为您播放';
				} else {
					targetElement.innerText = '视频已准备就绪，即将为您播放';
				}
			} else {
				console.warn('未找到id为link3的元素');
			}
			setTimeout(function() {
				HJPlayer.dp.play();
				const loadingBox = document.getElementById('loading-box');
				if (loadingBox) { // 避免元素不存在时报错
					loadingBox.remove();
				}
				HJPlayer.jump.head();
			}, 1 * 1500);
		},
		'next': function() {
			try {
				if (config.fullscreen) {
					if (Number(xyplay.part) < xyplay.playlist_array.length) {
						xyplay.part++;
						HJPlayer.video.part(xyplay.part);
					} else {
						HJPlayer.dp.notice("已经是最后一集了");
					}
				} else {
					setTimeout(config.next + "();", 0);
				}
			} catch (e) {
				HJPlayer.dp.notice("已经是最后一集了");
			}
		},
		'try': function() {
			function IsInArray(arr, value) {
				const len = arr.length;
				for (let i = 0; i < len; i++) {
					if (value === arr[i]) {
						return true;
					}
				}
				return false;
			}
			if (up.trysee > 0 && config.group < config.group_x && config.group != '') {
				const dmText = document.getElementById('dmtext');
				if (dmText) {
					dmText.disabled = true;
					dmText.placeholder = '登陆才能发弹幕';
				}
			};
			/*	
    		var xyplay=$.ajax({
				url: '/ass.php?url=dp&vid='+zvid+'&vfrom='+zvfrom+'&vpart='+zvpart,
				dataType: 'jsonp',
				async:false,
				jsonp: 'cb'                				
    		}).responseJSON.s;
	var vtry_time=xyplay['try'];
	var vjifen=xyplay['jifen'];
	var vjifenname=xyplay['jifenname'];
	var vhouz=xyplay['houz'];
	var viparr2=xyplay.vipp;
	var viparr=Object.values(viparr2);
	var isauth=xyplay['isauth'];
	var t = parseInt(vtry_time);
	setInterval(function() {		
				var s = parseInt(HJPlayer.dp.video.currentTime);
				if (IsInArray(viparr,parseInt(zvpart)) && isauth=='n' && s > t) {
						HJPlayer.dp.fullScreen.cancel();
						HJPlayer.dp.pause();
						document.write("<div class='x-showtips-txt'  style='position:absolute;top:50%;left:50%;width: 100%;transform:translate(-50%,-50%);text-align:center;background:#1a1b1b;padding: 20px;'><div class='x-tips-title' style='font-size:16px;font-weight:700;color:#fff';>抱歉，本片需要购买观看完整版</div><div class='x-tips-subTitle'   style='font-size: 12px;color: #ccc;margin-top: 4px;max-height: 17px';>开通VIP购买此片，可享受会员权限</div><div class='x-showtips-btn'   style='width: 100%;float: left;padding: 5px';><div class='x-btn x-btn-try'  style='border: 1px solid #ebba73;border-radius: 22.5px;box-sizing: border-box;width: 150pxposition: relative;margin-top: 14px;display: inline-block;padding: 0 12px; margin-right: 12px;color: #c8a764;background-image: linear-gradient(270deg,#1b1b1b 0,#000 99%)';><div class='x-btn-text' ><a style='display: inline-block;text-align: center;font-size: 13px;color: #ebba73;height: 32px;line-height: 30px; width: 100%;max-width: 100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;text-decoration:none';  href=/video/?"+zvid+"-"+zvfrom+"-"+zvpart+vhouz+"&action=pay&from2="+zvpart+" target='_blank'>非会员"+vjifen+""+vjifenname+"购买</a></div></div><div class='x-btn x-btn-buy' style='border: 1px solid #ebba73;border-radius: 22.5px;box-sizing: border-box;width: 150px;position: relative;margin-top: 14px;display: inline-block;padding: 0 12px;background-image: linear-gradient(132deg,#e1b271 0,#fce5aa 100%)';><div class='x-btn-text x-btn-buy-text'><a  style='display: inline-block;text-align: center;font-size: 13px;color: #ebba73;height: 32px;line-height: 30px;width: 100%;max-width: 100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;font-size: 13px;font-size: 13px;font-weight: 700;color: #5b3301;text-decoration:none'; href='/member.php' target='_blank'>开通会员</a></div></div></div></div>");
					}
				}, 1000);
                  */
		},
		'seek': function() {
			if (!config.live) HJPlayer.dp.seek(HJPlayer.playtime);
		},
		'end': function() {
			showMsg("播放结束啦=。=");
		},
		'con_play': function() {
			if (!config.danmuon || HJPlayer.waittime == 0 || config.live) {
				HJPlayer.jump.head();
				HJPlayer.dp.play();
				const mpw = document.querySelector('.memory-play-wrap');
				if (mpw) {
					mpw.remove();
				}
				const load = document.getElementById('loading-box');
				if (load) {
					load.remove();
				}
			} else {
				const link3 = document.getElementById('link3');
				if (link3) { // 增加元素存在性校验，避免报错
					link3.innerHTML = '<e>已播放至' + HJPlayer.ctime +
						'，继续上次播放？</e><d class="conplay-jump">是 <i id="num">' +
						HJPlayer.waittime + '</i>s</d><d class="conplaying">否</d>'.trim(); // 去除首尾空白字符，保持代码整洁
				}
				try {
					// 获取倒计时元素并校验
					const span = document.getElementById("num");
					if (!span) {
						console.error("倒计时元素不存在：#num");
					} else {
						// 解析为数字，处理非数字情况（默认值设为 5）
						let num = parseInt(span.innerHTML.trim(), 10);
						num = isNaN(num) ? 5 : num;
						// 声明 timer 变量，避免全局污染
						// let Inter = null;
						Inter = setInterval(function() {
							num--;
							// 确保数字合法性
							span.innerHTML = Math.max(num, 0);
							// 倒计时结束逻辑
							if (num <= 0) {
								clearInterval(Inter);
								Inter = null; // 清空定时器引用
								try {
									// 播放视频相关操作（做存在性校验）
									if (HJPlayer.video) {
										HJPlayer.video.seek();
									}
									if (HJPlayer.dp) {
										HJPlayer.dp.play();
									}
									// 移除 DOM 元素（简化写法，避免重复获取）
									const removeElement = (selector) => {
										const el = document.querySelector(selector);
										el && el.remove();
									};
									removeElement('.memory-play-wrap');
									removeElement('#loading-box');
								} catch (e) {
									console.error("倒计时结束后执行操作失败：", e);
								}
							}
						}, 1000);
					}
				} catch (err) {
					//HJPlayer.video.seek();
					HJPlayer.dp.play();
					const mpw = document.querySelector('.memory-play-wrap');
					if (mpw) {
						mpw.remove();
					}
					const load = document.getElementById('loading-box');
					if (load) {
						load.remove();
					}
				}
			};
			const cplayer =
				'<div class="memory-play-wrap"><div class="memory-play"><span class="close">×</span><span>上次看到 </span><span>' +
				HJPlayer.ctime + '</span><span class="play-jump">跳转播放</span></div></div>';
			const targetElement = document.querySelector('.hjplayer-cplayer');
			if (targetElement) { // 先判断元素是否存在，避免报错
				targetElement.innerHTML += cplayer;
			}
			const close = document.querySelector('.close');
			if (close) {
				close.addEventListener('click', function() {
					// 获取class为memory-play-wrap的元素并移除
					const mPlay = document.querySelector('.memory-play-wrap');
					if (mPlay) { // 增加存在性判断，避免报错
						mPlay.remove();
					}
				});
			}
			setTimeout(function() {
				const el = document.querySelector('.memory-play-wrap');
				if (el) {
					el.remove(); // 先判断元素存在，避免报错
				}
			}, 20 * 1000);
			const conplaying = document.querySelector('.conplaying');
			// 为元素绑定点击事件（先判断元素是否存在）
			if (conplaying) {
				conplaying.addEventListener('click', function() {
					// 清除定时器
					if (typeof Inter !== 'undefined') {
						clearTimeout(Inter);
					}
					// 移除 loading-box 元素
					const loadingBox = document.getElementById('loading-box');
					if (loadingBox) {
						loadingBox.remove();
					}
					// 执行播放和跳转逻辑（增加容错，避免 HJPlayer 未定义时报错）
					if (typeof HJPlayer !== 'undefined') {
						if (HJPlayer.dp && typeof HJPlayer.dp.play === 'function') {
							HJPlayer.dp.play();
						}
						if (HJPlayer.jump && typeof HJPlayer.jump.head === 'function') {
							HJPlayer.jump.head();
						}
					}
				});
			}
			document.querySelectorAll('.conplay-jump, .play-jump').forEach(element => {
				element.addEventListener('click', function() {
					// 清除定时器
					if (typeof Inter !== 'undefined') {
						clearTimeout(Inter);
					}
					// 调用视频跳转方法（容错处理，避免YZM未定义时报错）
					if (typeof HJPlayer !== 'undefined' && HJPlayer.video && typeof HJPlayer
						.video.seek ===
						'function') {
						HJPlayer.video.seek();
					}
					// 移除指定DOM元素
					const rema = document.querySelector('.memory-play-wrap');
					if (rema) {
						rema.remove();
					}
					const remb = document.getElementById('loading-box');
					if (remb) {
						remb.remove();
					}
					// 播放视频（容错处理）
					if (typeof HJPlayer !== 'undefined' && HJPlayer.dp && typeof HJPlayer.dp
						.play ===
						'function') {
						HJPlayer.dp.play();
					}
				});
			});
		}
	},
	'jump': {
		'def': function() {
			const fSelector = "#fristtime";
			const jSelector = "#jumptime";
			const fInput = document.querySelector(fSelector);
			const jInput = document.querySelector(jSelector);
			// 初始化输入框值
			fInput.value = HJPlayer.headt;
			jInput.value = HJPlayer.lastt;
			// 提示信息函数
			function TimeMsg() {
				showMsg("请输入有效时间哟！");
			}

			// 设置成功提示函数
			function SuccessMsg() {
				showMsg("设置完成，将在刷新或下一集生效");
			}
			/**
			 * 绑定标签点击事件的核心函数
			 * @param {HTMLElement} label - 要绑定事件的label元素
			 * @param {string} cKey - yzmck.set的第一个参数
			 * @param {number} dValue - 初始状态值
			 * @param {string} eKey - yzmck.set的第一个参数
			 * @param {number} gValue - 初始时间值
			 * @param {string} Selector - 输入框选择器
			 */
			function bindEvent(label, cKey, dValue, eKey, gValue, Selector) {
				const iElement = document.querySelector(Selector);
				const lElement = document.querySelector(label);
				// 第一个点击事件：切换checked类、验证时间、设置提示和yzmck
				lElement.addEventListener("click", function() {
					const iValue = Number(iElement.value);
					if (iValue > 0) {
						// 切换checked类
						this.classList.toggle('checked');
						SuccessMsg();
						const newGValue = Number(iElement.value);
						yzmck.set(eKey, newGValue);
					} else {
						TimeMsg();
					}
				});
				// 根据初始值绑定第二个点击事件
				if (dValue === 1) {
					// 初始值为1时的逻辑
					lElement.classList.add('checked');
					lElement.addEventListener("click", function() {
						const iValue = Number(iElement.value);
						if (iValue > 0) {
							yzmck.set(cKey, 0);
						} else {
							TimeMsg();
						}
					});
				} else {
					// 初始值不为1时的逻辑
					lElement.addEventListener("click", function() {
						const iValue = Number(iElement.value);
						if (iValue > 0) {
							yzmck.set(cKey, 1);
						} else {
							TimeMsg();
						}
					});
				}
			}
			// 绑定两个label的点击事件
			bindEvent('.hjplayer-setting-jfrist label', 'frists', HJPlayer.frists, 'headt', HJPlayer.headt,
				fSelector);
			bindEvent('.hjplayer-setting-jlast label', 'lasts', HJPlayer.lasts, 'lastt', HJPlayer.lastt,
				jSelector);
			HJPlayer.jump.last();
		},
		'head': function() {
			if (config.live) {
				return;
			}
			if (HJPlayer.stime > HJPlayer.playtime) HJPlayer.playtime = HJPlayer.stime;
			if (HJPlayer.frists == 1) {
				if (HJPlayer.headt > HJPlayer.playtime || HJPlayer.playtime == 0) {
					HJPlayer.jump_f = 1
				} else {
					HJPlayer.jump_f = 0
				}
			}
			if (HJPlayer.jump_f == 1) {
				HJPlayer.dp.seek(HJPlayer.headt);
				HJPlayer.dp.notice("已为您跳过片头");
			}
		},
		'last': function() {
			if (config.live) {
				return;
			}
			if (config.next != '') {
				if (HJPlayer.lasts == 1) {
					setInterval(function() {
						let e = HJPlayer.dp.video.duration - HJPlayer.dp.video.currentTime;
						if (e < HJPlayer.last_tip) HJPlayer.dp.notice('即将为您跳过片尾');
						if (HJPlayer.lastt > 0 && e < HJPlayer.lastt) {
							HJPlayer.setCookie("time_" + config.url, "", -1);
							HJPlayer.video.next();
						};
					}, 1000);
				};
			} else {
				document.querySelector('.icon-xj').remove();
			};
		},
		'ad': function(a, b) {}
	},
	'danmu': {
		'send': function() {
			const g = document.querySelector(".yzm-hjplayer-send-icon");
			const d = document.getElementById("dmtext");
			const h = ".hjplayer-comment-setting-";
			// 1. 颜色选择事件
			const colorInputs = document.querySelector(h + 'color input');
			colorInputs.addEventListener('click', function() {
				const r = this.getAttribute("value");
				setTimeout(function() {
					d.style.color = r;
				}, 100);
			});
			// 2. 类型选择事件
			const typeInputs = document.querySelector(h + 'type input');
			typeInputs.addEventListener('click', function() {
				const t = this.getAttribute("value");
				setTimeout(function() {
					d.setAttribute("dmtype", t);
				}, 100);
			});
			// 3. 字体大小选择事件
			const fontInputs = document.querySelector(h + 'font input');
			fontInputs.addEventListener('click', function() {
				/*
				    if (up.trysee > 0 && config.group == config.group_x) {
						layer.msg("会员专属功能");
						return;
					};
				*/
				const t = this.getAttribute("value");
				setTimeout(function() {
					d.setAttribute("size", t);
				}, 100);
			});
			// 4. 发送按钮点击事件
			g.addEventListener('click', function() {
				// 获取弹幕内容并去除首尾空格
				const a = d.value.trim();
				// 获取弹幕属性
				const b = d.getAttribute("dmtype");
				const c = d.style.color;
				const z = d.getAttribute("size");
				// 登录验证
				if (up.trysee > 0 && config.group < config.group_x && config.group !== '') {
					showMsg("登陆才能发弹幕");
					return;
				}
				// 违禁词检测
				const jzword = up.pbgjz.split(',');
				const len = jzword.length;
				for (let i = 0; i < len; i++) {
					if (a.search(jzword[i]) !== -1) {
						showMsg("请勿发送无意义内容，规范您的弹幕内容");
						return;
					}
				}
				// 内容为空检测
				if (a.length < 1) {
					showMsg("要输入弹幕内容啊喂！");
					return;
				}
				// 发送频率限制
				const e = Date.parse(new Date());
				const f = yzmck.get('dmsent', e);
				const t = config.sendtime;
				if (e - f < t * 1000) {
					showMsg('请勿频繁操作！发送弹幕需间隔' + t + '秒~');
					return;
				}
				// 清空输入框
				d.value = "";
				// 发送弹幕
				HJPlayer.dp.danmaku.send({
					text: a,
					color: c,
					type: b,
					size: z
				});
				// 记录发送时间
				yzmck.set('dmsent', e);
			});
			// 5. 模拟点击发送按钮的函数
			function k() {
				// 触发原生点击事件
				g.click();
			}
			// 6. 输入框回车发送
			d.addEventListener('keydown', function(e) {
				// 兼容 keyCode 和 key (13 是回车键)
				if (e.keyCode === 13 || e.key === 'Enter') {
					k();
				}
			});
		},
		'relist': function() {
			// 获取DOM元素引用
			const listShow = document.querySelector('.list-show');
			const danmukuNum = document.querySelector('.danmuku-num');
			// 清空列表
			listShow.innerHTML = '';
			// 使用fetch发送请求
			fetch(config.api + '?ac=get&id=' + HJPlayer.id)
				// 处理响应，解析JSON数据
				.then(response => {
					// 检查HTTP响应状态是否成功
					if (!response.ok) {
						throw new Error('HTTP error! Status:' + response.status);
					}
					return response.json();
				})
				// 处理返回的数据
				.then(d => {
					if (d.code === 23) {
						const a = d.danmuku;
						const b = d.name;
						const c = d.danum;
						// 更新弹幕数量显示
						danmukuNum.textContent = c;
						// 遍历弹幕数据，构建DOM元素
						a.forEach((item, index) => {
							// 创建d元素
							const dElement = document.createElement('d');
							dElement.className = 'danmuku-list';
							dElement.setAttribute('time', item[0]);
							// 构建内部HTML
							const timeStr = HJPlayer.formatTime(item[0]);
							const secondLiTitle = item[4][item[8]];
							const thirdLiTitle = '用户：' + item[8];
							dElement.innerHTML = '<li>' + timeStr + '</li><li title="' +
								secondLiTitle + '">' + item[4][item[8]] + '</li><li title="' +
								thirdLiTitle + '">' + item[6] + '</li><li class="report">举报</li>';
							// 为举报按钮添加点击事件（避免onclick属性的安全问题）
							const reportBtn = dElement.querySelector('.report');
							reportBtn.addEventListener('click', () => {
								HJPlayer.danmu.report(item[5], b, `[${item[8]}] ${item[4]}`,
									item[3]);
							});
							// 添加到列表容器
							listShow.appendChild(dElement);
						});
						// 为所有弹幕列表项添加双击事件
						const danmukuItems = document.querySelectorAll('.danmuku-list');
						danmukuItems.forEach(item => {
							item.addEventListener('dblclick', () => {
								HJPlayer.dp.seek(item.getAttribute('time'));
							});
						});
					}
				})
				// 捕获错误
				.catch(error => {
					console.error('请求弹幕数据失败:', error);
				});
		},
		'list': function() {
			// 为指定元素绑定点击事件，触发弹幕重新加载
			const clickE = document.querySelectorAll('.hjplayer-list-icon, .yzm-hjplayer-send-icon');
			clickE.forEach(element => {
				element.addEventListener('click', function() {
					HJPlayer.danmu.relist();
				});
			});
			// 构建弹幕礼仪元素并添加到指定位置
			const liyih = '<div class="dmrules"><a target="_blank" href="' + config.dmrule +
				'">弹幕礼仪 </a></div>';
			const comment = document.querySelectorAll('div.hjplayer-comment-box');
			// 获取最后一个评论框元素
			const CommentBox = comment[comment.length - 1];
			if (CommentBox) {
				CommentBox.insertAdjacentHTML('beforeend', liyih);
			}
			// 设置观看人数文本
			const watch = document.querySelector('.hjplayer-watching-number');
			if (watch) {
				watch.textContent = up.usernum;
			}
			// 修改违规词标题
			const panel = document.querySelector(
				'.hjplayer-info-panel-item-title-amount .hjplayer-info-panel-item-title');
			if (panel) {
				panel.innerHTML = "违规词";
			}
			// 循环添加违规词标签到标题元素
			const vodTit = document.getElementById('vod-title');
			if (vodTit && up.pbgjz && up.pbgjz.length > 0) {
				for (let i = 0; i < up.pbgjz.length; i++) {
					const gjz_html = `<e>${up.pbgjz[i]}</e>`;
					vodTit.insertAdjacentHTML('beforeend', gjz_html);
				}
			}
			add('.hjplayer-list-icon', ".hjplayer-danmu", 'show');
			// 弹幕容器鼠标移出事件
			const danmuEl = document.querySelector('.hjplayer-danmu');
			if (danmuEl) {
				danmuEl.addEventListener('mouseleave', function() {
					this.classList.remove("show");
				});
			}

			function add(selector1, selector2, className, selector4) {
				const triggerEl = document.querySelector(selector1);
				const targetEl = document.querySelector(selector2);
				const removeEl = selector4 ? document.querySelector(selector4) : null;
				if (triggerEl && targetEl) {
					triggerEl.addEventListener('click', function() {
						// 切换类名
						targetEl.classList.toggle(className);
						// 移除指定元素（如果存在）
						if (removeEl && removeEl.parentNode) {
							removeEl.parentNode.removeChild(removeEl);
						}
					});
				}
			}
		},
		'report': function(a, b, c, d) {
			customConfirm('' + c + '<!--br><br><span style="color:#333">请选择需要举报的类型</span-->', {
					anim: 1,
					title: '举报弹幕',
					btn: ['违法违禁', '色情低俗', '恶意刷屏', '赌博诈骗', '人身攻击', '侵犯隐私', '垃圾广告', '剧透', '引战'],
					btn3: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '恶意刷屏');
					},
					btn4: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '赌博诈骗');
					},
					btn5: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '人身攻击');
					},
					btn6: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '侵犯隐私');
					},
					btn7: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '垃圾广告');
					},
					btn8: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '剧透');
					},
					btn9: function(index, layero) {
						HJPlayer.danmu.post_r(a, b, c, d, '引战');
					}
				},
				// btn1 回调（违法违禁）
				function(index, layero) {
					HJPlayer.danmu.post_r(a, b, c, d, '违法违禁');
				},
				// btn2 回调（色情低俗）
				function(index) {
					HJPlayer.danmu.post_r(a, b, c, d, '色情低俗');
				});
		},
		'post_r': function(a, b, c, d, type) {
			// 使用原生 fetch 发送 GET 请求
			fetch(config.api + '?ac=report&cid=' + d + '&user=' + a + '&type=' + type + '&title=' +
					encodeURIComponent(b) + '&text=' + encodeURIComponent(c), {
						method: 'GET',
						cache: 'no-cache',
						headers: {
							'Accept': 'application/json' // 告诉服务器期望返回 JSON 格式
						}
					})
				// 第一步：处理响应状态
				.then(response => {
					// 先判断 HTTP 状态是否成功（2xx 范围内）
					if (!response.ok) {
						throw new Error('网络请求失败或服务器返回错误');
					}
					// 解析 JSON 响应体
					return response.json();
				})
				// 第二步：请求成功的回调
				.then(data => {
					showMsg("举报成功！感谢您为守护弹幕作出了贡献");
				})
				// 第三步：请求失败的回调
				.catch(error => {
					showMsg("服务故障 or 网络异常，请稍后再试！");
				});
		}
	},
	'setCookie': function(c_name, value, expireHours) {
		const exdate = new Date();
		exdate.setHours(exdate.getHours() + expireHours);
		document.cookie = c_name + "=" + encodeURIComponent(value) + ((expireHours === null) ? "" :
			";expires=" + exdate
			.toGMTString());
	},
	'getCookie': function(c_name) {
		const cookies = document.cookie;
		if (cookies && cookies.length > 0) {
			let c_start = cookies.indexOf(c_name + "=");
			if (c_start !== -1) {
				c_start = c_start + c_name.length + 1;
				let c_end = cookies.indexOf(";", c_start);
				if (c_end === -1) {
					c_end = cookies.length;
				};
				return decodeURIComponent(cookies.substring(c_start, c_end));
			}
		} else {
			return "";
		}
	},
	'formatTime': function(seconds) {
		return [parseInt(seconds / 60 / 60), parseInt(seconds / 60 % 60), parseInt(seconds % 60)].join(":")
			.replace(
				/\b(\d)\b/g, "0$1");
	},
	'loadedmetadataHandler': function() {
		if (HJPlayer.playtime > 0 && HJPlayer.dp.video.currentTime < HJPlayer.playtime) {
			setTimeout(function() {
				HJPlayer.video.con_play()
			}, 1 * 1000);
		} else {
			setTimeout(function() {
				if (!config.danmuon) {
					HJPlayer.jump.head();
				} else {
					HJPlayer.dp.notice("视频已准备就绪，即将为您播放");
					HJPlayer.video.play()
				}
			}, 1 * 1000);
		}
		HJPlayer.dp.on("timeupdate", function() {
			HJPlayer.timeupdateHandler();
		});
	},
	'timeupdateHandler': function() {
		if (!config.live) {
			HJPlayer.setCookie("time_" + config.url, HJPlayer.dp.video.currentTime, 24);
		}
	},
	'endedHandler': function() {
		HJPlayer.setCookie("time_" + config.url, "", -1);
		if (config.next !== '') {
			HJPlayer.dp.notice("2s后,将自动为您播放下一集");
			setTimeout(function() {
				HJPlayer.video.next();
			}, 2 * 1000);
		} else {
			HJPlayer.dp.notice("视频播放已结束");
			setTimeout(function() {
				HJPlayer.video.end();
			}, 2 * 1000);
		}
	},
	'player': {
		'play': function(url) {
			document.body.classList.add("danmu-off");
			HJPlayer.dp = new hjplayer({
				autoplay: config.autoplay,
				element: document.getElementById('player'),
				theme: config.color,
				logo: config.logo,
				live: config.live,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
			});
			const style = document.createElement('style');
			style.type = 'text/css';
			style.textContent = '#loading-box{display: none;}';
			document.body.appendChild(style);
			HJPlayer.def();
			HJPlayer.jump.head();
		},
		'adplay': function(url) {
			document.body.classList.add("danmu-off");
			HJPlayer.ad = new hjplayer({
				autoplay: true,
				element: document.getElementById('ADplayer'),
				theme: config.color,
				logo: config.logo,
				//contextmenu: config.contextmenu,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
			});
			// 1. 定义需要移除的元素选择器列表
			const removeSelectors = [
				'.hjplayer-controller',
				'.hjplayer-cplayer',
				'.hjplayer-logo',
				'#loading-box',
				'.hjplayer-controller-mask'
			];
			// 2. 遍历选择器，移除所有匹配的元素
			removeSelectors.forEach(selector => {
				// 获取所有匹配元素（querySelectorAll 返回类数组）
				const elements = document.querySelectorAll(selector);
				// 遍历并移除每个元素
				elements.forEach(el => {
					// 先判断元素是否存在，避免空指针错误
					if (el && el.parentNode) {
						el.parentNode.removeChild(el);
					}
				});
			});
			// 3. 显示 .hjplayer-mask 元素
			const maskElement = document.querySelector('.hjplayer-mask');
			if (maskElement) {
				// 移除隐藏样式
				maskElement.style.display = 'block';
			}
			HJPlayer.ad.on('timeupdate', function() {
				if (HJPlayer.ad.video.currentTime > HJPlayer.ad.video.duration - 0.1) {
					// 1. 移除 body 上的 "danmu-off" 类
					document.body.classList.remove("danmu-off");
					// 2. 销毁广告实例
					HJPlayer.ad.destroy();
					// 3. 移除 ADplayer 元素
					const adPlayer = document.getElementById('ADplayer');
					if (adPlayer && adPlayer.parentNode) {
						adPlayer.parentNode.removeChild(adPlayer);
					}
					// 4. 移除 ADtip 元素
					const adTip = document.getElementById('ADtip');
					if (adTip && adTip.parentNode) {
						adTip.parentNode.removeChild(adTip);
					}
					// 5. 播放视频
					HJPlayer.play(config.url);
				}
			});
		},
		'dmplay': function(url) {
			HJPlayer.dmid();
			HJPlayer.dp = new hjplayer({
				autoplay: HJPlayer.waittime ? false : config.autoplay,
				element: document.getElementById('player'),
				theme: config.color,
				logo: config.logo,
				live: config.live,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
				danmaku: {
					id: HJPlayer.id,
					api: config.api + '?ac=dm',
					user: config.user
				}
			});
			HJPlayer.load();
		},
		'bdplay': function(url) {
			HJPlayer.dmid();
			HJPlayer.dp = new hjplayer({
				autoplay: HJPlayer.waittime ? false : config.autoplay,
				element: document.getElementById('player'),
				theme: config.color,
				logo: config.logo,
				live: config.live,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
				danmaku: {
					id: HJPlayer.id,
					api: config.api + '?ac=dm',
					user: config.user,
					addition: [config.api + 'bilibili/?av=' + config.av]
				}
			});
			HJPlayer.load();
		}
	},
	'MYad': {
		'vod': function(u, l) {
			// 获取 ADtip 元素并设置其 HTML 内容
			document.getElementById('ADtip').innerHTML = '<a id="link" href="' + l +
				'" target="_blank">查看详情</a>';
			// 获取 ADplayer 元素并绑定点击事件
			document.getElementById('ADplayer').addEventListener('click', function() {
				// 获取链接元素并触发点击
				document.getElementById('link').click();
			});
			HJPlayer.player.adplay(u);
		},
		'pic': function(l, t, p) {
			const adTip = document.getElementById('ADtip');
			// 拼接 HTML 内容
			adTip.innerHTML = '<a id="link" href="' + l + '" target="_blank">广告 <e id="time_ad">' + t +
				'</e></a><img src="' + p + '">';
			// 绑定点击事件
			adTip.addEventListener('click', function() {
				// 获取内部的链接元素并触发点击
				document.getElementById('link').click();
			});
			const span = document.getElementById("time_ad");
			let num = span.innerHTML;
			const timer = null;
			setTimeout(function() {
				timer = setInterval(function() {
					num--;
					span.innerHTML = num;
					if (num == 0) {
						clearInterval(timer);
						HJPlayer.play(config.url);
						document.getElementById('ADtip').remove();
					}
				}, 1000);
			}, 1);
		},
		'pause': {
			'play': function(l, p) {
				if (HJPlayer.ads.pause.state == 'on') {
					const ad_html = '<div id="player_pause"><div class="tip">广告</div><a href="' + l +
						'" target="_blank"><img src="' + p + '"></a></div>';
					const player = document.getElementById('player');
					// 将广告元素插入到 player 元素前面
					player.parentNode.insertBefore(ad_html, player);
				}
			},
			'out': function() {
				const pause = document.getElementById('player_pause');
				if (pause) pause.remove();
			}
		}
	}
}
// 控制台报错
// setInterval(function() {
// 	window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized ? t("on") : (a = "off", (
// 		"undefined" !== typeof console.clear) && console.clear());
// 	debugger;
// }, 10);