// 登录信息store的初始值
export function getDefaultLoginState() {
	return {
		userInfo: {},
		token: null, //请求token,
		affairToken: null, //事务订单专用token
		isLogin: false,
		overDueWay: false,
		globalTimer: null,
		newTaskName: []
	}	
}

// 公共信息store的初始值
export function getDefaultCommonState() {
	return {
		//状态栏高度
		statusBarHeight: 0,
		//导航栏栏高度
		navigationBarHeight: 0,
		// 胶囊信息
		capsuleMessage: {},
		// 科室信息
		departmentMessage: {},
		// 生产域名 https://blinktech.cn/nblink
		// 开发域名 https://blink.blinktech.cn/nblink
		// 准生产域名 https://ver.blinktech.cn
		// 测试域名 https://show.blinktech.cn/nblink
		// 新测试域名 https://act.blinktech.cn/nblink
		baseURL: 'https://ver.blinktech.cn'
	}	
}

// 工程订单信息store的初始值
export function getDefaultProjectState() {
	return {
		// 报修工单详情
		repairsWorkOrderMsg: {},
		isCompleteRepairsWorkOrderPhotoList: [],
		isFillMaterialList: []
	}	
}