"use strict";
// 获取URL中的url参数值
const urldata = window.location.href;
let search;
// 解析URL参数部分
try {
	search = decodeURI(atob(urldata.substring(urldata.indexOf('?') + 1, urldata.indexOf('.html'))));
} catch {
	search = window.location.search.substr(1) || '';
}
const getUrlParam = (name) => {
	if (!search) return;
	let result = search.match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)'));
	result = result ? decodeURIComponent(result[2]) : '';
	return result;
}
// 核心逻辑：根据url参数内容动态加载对应JS文件
const urlParam = getUrlParam('url');
const Script = document.createElement('script');
Script.defer = true;
if (urlParam.includes('m3u8')) {
	const p2pinfo = getUrlParam('p2pinfo');
	// 加载hls.min.js
	Script.src = p2pinfo === "1" ? './js/p2p.min.js' : './js/hls.min.js';
} else if (urlParam.includes('flv')) {
	// 加载flv.min.js
	Script.src = './js/flv.min.js';
}
const bodyEl = document.body;
// 方式1：使用 insertBefore 方法（精准控制插入位置，推荐）
if (bodyEl.firstChild) {
	// 如果 body 已有子元素，插入到第一个子元素之前（即 body 开头）
	bodyEl.insertBefore(Script, bodyEl.firstChild);
} else {
	// 如果 body 为空（无任何子元素），直接追加（等价于开头）
	bodyEl.appendChild(Script);
}
// document.head.appendChild(Script);
// 创建style元素
const sElement = document.createElement('style');
sElement.type = 'text/css';
// 获取当前小时数
const currentHour = new Date().getHours();
// 定义loading-box的背景样式
let loadingBoxStyle = '';
// 判断时段（17:00-23:00为晚上，其余为白天）
if (currentHour < 17 || currentHour > 23) {
	loadingBoxStyle = '#loading-box{background: #fff;}'; // 白天
} else {
	loadingBoxStyle = '#loading-box{background: #000;}'; // 晚上
}
// 将样式内容添加到style元素
sElement.textContent = loadingBoxStyle;
// 将style元素插入到文档头部（使样式生效）
document.head.appendChild(sElement);
/**
 * 自定义提示框函数（模拟layer.msg）
 * @param {string} text - 提示文本
 * @param {number} duration - 自动关闭时长（默认2000ms）
 */
const showMsg = (text, duration = 2000) => {
	// 1. 检查是否已有提示框，有则先移除
	const oldMsg = document.querySelector('.custom-msg');
	if (oldMsg) oldMsg.remove();
	// 2. 创建提示框元素
	const msgBox = document.createElement('div');
	msgBox.className = 'custom-msg';
	msgBox.textContent = text;
	document.body.appendChild(msgBox);
	// 3. 显示提示框（触发过渡动画）
	setTimeout(() => msgBox.classList.add('show'), 10);
	// 4. 自动关闭
	setTimeout(() => {
		msgBox.classList.remove('show');
		// 过渡结束后移除元素
		setTimeout(() => msgBox.remove(), 300);
	}, duration);
}
// 调用示例：showMsg("提示文本");
/**
 * 自定义提示框函数（模拟layer.confirm）
 */
function customConfirm(content, options, ...btnCallbacks) {
	// 默认配置
	const defaultOptions = {
		anim: 1,
		title: '提示',
		btn: ['确定', '取消'],
		// 存储额外按钮的回调函数
		btn3: null,
		btn4: null,
		btn5: null,
		btn6: null,
		btn7: null,
		btn8: null,
		btn9: null
	};
	// 合并配置项
	const config = {
		...defaultOptions,
		...options
	};
	// 1. 创建遮罩层
	const mask = document.createElement('div');
	mask.className = `custom-confirm-mask ${config.anim ? 'anim' : ''}`;
	// 2. 创建弹窗容器
	const dialog = document.createElement('div');
	dialog.className = `custom-confirm-dialog ${config.anim ? 'anim' : ''}`;
	// 3. 创建标题栏
	const titleBar = document.createElement('div');
	titleBar.className = 'custom-confirm-title';
	titleBar.textContent = config.title;
	// 4. 创建内容区域
	const contentArea = document.createElement('div');
	contentArea.className = 'custom-confirm-content';
	contentArea.innerHTML = content; // 使用innerHTML支持HTML内容
	// 5. 创建按钮容器
	const btnContainer = document.createElement('div');
	btnContainer.className = 'custom-confirm-btn-container';
	// 6. 创建所有按钮
	const btnList = config.btn;
	// 存储所有按钮的回调函数
	const allCallbacks = [
		...btnCallbacks, // btn1, btn2 的回调
		config.btn3, config.btn4, config.btn5,
		config.btn6, config.btn7, config.btn8, config.btn9
	];
	// 生成按钮并绑定事件
	btnList.forEach((btnText, index) => {
		const btn = document.createElement('button');
		btn.className = 'custom-confirm-btn';
		btn.textContent = btnText;
		// 绑定点击事件
		btn.addEventListener('click', () => {
			// 执行对应回调函数
			if (allCallbacks[index] && typeof allCallbacks[index] === 'function') {
				allCallbacks[index](index + 1, dialog); // 传入index和layero(dialog)
			}
			// 关闭弹窗
			closeDialog();
		});
		btnContainer.appendChild(btn);
	});
	// 7. 组装弹窗
	dialog.appendChild(titleBar);
	dialog.appendChild(contentArea);
	dialog.appendChild(btnContainer);
	mask.appendChild(dialog);
	document.body.appendChild(mask);
	// 8. 定义关闭弹窗函数
	function closeDialog() {
		mask.classList.add('close'); // 添加关闭过渡类
		setTimeout(() => {
			if (document.body.contains(mask)) {
				document.body.removeChild(mask);
			}
		}, 300);
	}
	// 点击遮罩层关闭弹窗
	mask.addEventListener('click', (e) => {
		if (e.target === mask) {
			closeDialog();
		}
	});
	// 返回关闭函数，方便外部控制
	return {
		close: closeDialog
	};
}