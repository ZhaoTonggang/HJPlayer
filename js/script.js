"use strict";
// 初始化参数对象（与原 up 对象功能一致）
const up = {
	"usernum": "100", // 在线人数
	"mylink": "/player/?url=", // 播放器路径，用于下一集
	"diyid": [0, '游客', 1] // 自定义弹幕id
};

// 获取 URL 参数
const urlParams = getUrlParam("url") || '';
// 初始化配置对象（完全对应原 config 逻辑）
const config = {
	"api": 'https://api.danmu.icu/', // 弹幕接口
	"av": getUrlParam("av") || '', // B站弹幕id（默认空字符串）
	"url": urlParams, // 视频链接
	"id": (() => {
		// 模拟 substr(md5($_GET['url']), -20) 逻辑
		if (!urlParams) return '';

		// MD5 加密函数（兼容前端环境）
		function md5(str) {
			let hash = 0;
			if (str.length === 0) return hash.toString();
			for (let i = 0; i < str.length; i++) {
				const char = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash = hash & hash; // 转换为32位整数
			}
			return hash.toString(16).padStart(32, '0');
		}

		const md5Str = md5(urlParams);
		// 截取最后20位，与 PHP substr(md5(...), -20) 一致
		return md5Str.slice(-20);
	})(),
	"sid": getUrlParam("sid") || '', // 集数id
	"pic": getUrlParam("pic") || '', // 视频封面
	"title": getUrlParam("name") || 'on', // 视频标题
	"next": getUrlParam("next") || '', // 下一集链接
	"live": getUrlParam("live") || 0, //是否直播
	"autoplay": getUrlParam("autoplay") || 1, //是否自动播放
	"user": getUrlParam("user") || '', // 用户名
	"group": getUrlParam("group") || '', // 用户组
	"time": 2
};
// 启动 HJPlayer
if (typeof HJPlayer !== 'undefined' && typeof HJPlayer.start === 'function') {
	HJPlayer.start();
}
//移动浏览器video兼容
// 获取body下所有video元素
const videoElements = document.querySelectorAll('body video');
// 遍历NodeList
videoElements.forEach(video => {
	video.setAttribute('playsinline', '');
	video.setAttribute('x5-playsinline', '');
	video.setAttribute('webkit-playsinline', '');
	video.setAttribute('x-webkit-airplay', 'allow');
});
delete window.document.referrer;
window.document.__defineGetter__('referrer', function() {
	return 'pcvideochuangott.titan.mgtv.com';
});
//时间更新
function timeUpdate() {
	const timeE = document.getElementById('stats');
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');
	timeE.textContent = year + "-" + month + "-" + day + " " + " " + hour + ":" + minute + ":" + second;
	setTimeout(timeUpdate, 1000);
}
timeUpdate();