<script>
	import store from '@/store'
	import { mapMutations } from 'vuex'
	export default {
		globalData: {
			statusBarHeight: 0, // 状态导航栏高度
			navHeight: 0, // 总体高度
			navigationBarHeight: 0, // 导航栏高度(标题栏高度)
		},
		methods: {
			...mapMutations([
				'storeStatusBarHeight',
				'storeNavigationBarHeight',
				'storeCapsuleMessage'
			])
		},
		onLaunch: function() {
			const that = this;
			//获取设备状态栏高度
			uni.getSystemInfo({
				success(res) {
					that.storeStatusBarHeight(res.statusBarHeight);
					that.globalData.statusBarHeight = res.statusBarHeight;
				},
				fail: (err) => {
					that.storeStatusBarHeight(47);
					that.globalData.statusBarHeight = 47;
				}
			});
			// 获取微信胶囊的位置信息 width,height,top,right,left,bottom
			const custom = uni.getMenuButtonBoundingClientRect()
			// 导航栏高度(标题栏高度) = 胶囊高度 + (顶部距离 - 状态栏高度) * 2
			this.globalData.navigationBarHeight = custom.height + (custom.top - this.globalData.statusBarHeight) * 2
			// 总体高度 = 状态栏高度 + 导航栏高度
			this.globalData.navHeight = this.globalData.navigationBarHeight + this.globalData.statusBarHeight;
			this.storeNavigationBarHeight(this.globalData.navigationBarHeight);
			this.storeCapsuleMessage(custom);
		},
		onShow: function() {
		},
		onHide: function() {
		}
	}
</script>

<style lang="scss">
@import "uview-ui/index.scss";
/* 解决头条小程序组件内引入字体不生效的问题 */
/* #ifdef MP-TOUTIAO */
@font-face {
	font-family: uniicons;
	src: url('/static/uni.ttf');
}
/* #endif */
page { 
  min-height: 100%; /* 防止页面高度塌陷 */
}
</style>
