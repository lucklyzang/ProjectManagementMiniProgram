<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<u-modal :show="modalShow" title="确定签退?" :showCancelButton="true" confirmColor="#2db8f9" @confirm="sureCancel" @cancel="cancelSure"></u-modal>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast" />
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" backState='2000' fontColor="#FFF" bgColor="none" title="个人资料">
			</nav-bar>
		</view>
		<view class="content" v-if="!needAuth">
			<view class="content-top">
				<view class="content-top-name">
					<view>头像</view>
					<view>
						<image :src="defaultPersonPng" mode="widthFix"></image>
					</view>
				</view>
				<view class="content-top-other">
					<text>姓名</text>
					<text>
						{{ userInfo.name ? userInfo.name : ''}}
					</text>
				</view>
				<view class="content-top-other">
					<text>手机号码</text>
					<text>
						{{ maskedPhone }}
					</text>
				</view>
				<view class="content-top-other">
					<text>公司部门</text>
					<text>
						{{ userInfo.extendData.proName ? userInfo.extendData.proName : '' }}
					</text>
				</view>
				<view class="content-top-other">
					<text>职位</text>
					<text>
						{{ userInfo.extendData.userType ? userInfo.extendData.userType : '' }}
					</text>
				</view>
			</view>
			<view class="app-version">
				<text>当前版本</text>
				<text>
					{{versionNumber}}
				</text>
			</view>
		</view>
		<view class="bottom-area">
			<view class="back-home" @click="backTo">返回主页</view>
			<view class="quit-area" @click="signOutEvent">退出账号</view>
		</view>
		<!-- 局部隐私授权弹窗遮罩（仅在 needAuth 为 true 时显示） -->
		<view class="privacy-mask" v-if="needAuth">
			<view class="privacy-box">
				<text class="title">隐私保护提示</text>
				<text class="desc">
					查看您的个人资料前，请先阅读并同意
					<text class="link" @click.stop="openPrivacyContract">《隐私保护指引》</text>
				</text>
				<!-- 官方提供的同意按钮 -->
				<button 
					class="agree-btn"
					open-type="agreePrivacyAuthorization" 
					@agreeprivacyauthorization="handleAgree"
					type="primary"
				>
					同意并继续
				</button>
				<!-- 拒绝按钮（点击后返回上一页） -->
				<button class="reject-btn" @click="handleReject">不同意并返回</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import _ from 'lodash'
	import store from '@/store'
	import {
		setCache,
		removeAllLocalStorage,
		fenToYuan
	} from '@/common/js/utils'
	import { userSignOut } from '@/api/login.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '退出登录中···',
				showLoadingHint: false,
				modalShow: false,
				needAuth: false,
				isDataLoaded: false,
				versionNumber: '1.0.0',
				defaultPersonPng: require('@/static/img/default-person-photo.png')
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight'
			]),
			userName () {
			 return this.userInfo.userName
			},
			userTypeId () {
				return this.userInfo.extendData.user_type_id
			},
			proId () {
				return this.userInfo.extendData.proId
			},
			proName () {
				return this.userInfo.extendData.proName
			},
			workerId () {
				return this.userInfo.extendData.userId
			},
			name () {
				return this.userInfo.name
			},
			// 手机号脱敏
			maskedPhone() {
				const phone = this.userInfo.mobile;
				if (!phone) return '无';
				const str = String(phone);
				if (str.length === 11) {
					return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
				}
				return str
			}
		},
		onShow() {
			this.checkPrivacyForThisPage()
		},
		methods: {
			...mapMutations([
				'changeOverDueWay'
			]),
			
			// 返回主页
			backTo () {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			
			// 退出登录事件
			signOutEvent () {
				this.modalShow = true;
			},
			
			// 退出登录弹框确定事件
			sureCancel () {
				this.modalShow = false;
				this.userSignOutEvent();
			},
			
			// 弹框取消事件
			cancelSure () {
				this.modalShow = false;
			},
			
			// 退出登录
			userSignOutEvent () {
				this.showLoadingHint = true;
				this.infoText = '退出登录中...';
				this.changeOverDueWay(true);
				userSignOut(this.proId,this.workerId).then((res) => {
					if ( res && res.data.code == 200) {
						uni.redirectTo({
							url: '/pages/login/login'
						});
						// 清空store和localStorage
						removeAllLocalStorage();
						store.dispatch('resetLoginState');
						store.dispatch('resetCommitState');
						store.dispatch('resetAutoRepairTaskStore');
						store.dispatch('resetCreateProjectStateAction');
						store.dispatch('resetTaskSchedulingStateAction')
					} else {
						this.changeOverDueWay(false);
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'bottom'
						})
					};
					this.showLoadingHint = false;
				})
				.catch((err) => {
					this.changeOverDueWay(false);
					this.showLoadingHint = false;
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'bottom'
					})
				})
			},
			
			/**
			 * 检查当前页面的隐私状态
			 */
			checkPrivacyForThisPage() {
				// #ifdef MP-WEIXIN
				if (wx.canIUse('getPrivacySetting')) {
					wx.getPrivacySetting({
						success: (res) => {
							if (res.needAuthorization) {
								// 需要授权：显示遮罩，不请求接口
								this.needAuth = true;
							} else {
								// 已授权：隐藏遮罩，请求数据
								this.needAuth = false;
								this.fetchUserInfo()
							}
						},
						fail: (err) => {
							// 如果 API 调用失败，为了不影响业务，默认放行
							this.needAuth = false;
							this.fetchUserInfo();
						}
					});
				} else {
					// 基础库太低，直接放行
					this.needAuth = false;
					this.fetchUserInfo();
				}
				// #endif
	
				// #ifndef MP-WEIXIN
				// 非微信小程序环境直接放行
				this.needAuth = false;
				this.fetchUserInfo()
				// #endif
			},
	
			/**
			 *  请求后端接口获取资料（包含手机号）
			 */
			fetchUserInfo() {
				if (this.isDataLoaded) return;
				try {
					uni.showLoading({ title: '加载中...' });
					this.isDataLoaded = true;
				} catch (error) {
					uni.showToast({ title: '获取资料失败', icon: 'none' });
				} finally {
					uni.hideLoading();
				}
			},
	
			// 打开官方隐私协议详情页
			openPrivacyContract() {
				// #ifdef MP-WEIXIN
				// 兼容性判断：检查当前基础库是否支持该 API
				if (!wx.canIUse('openPrivacyContract')) {
					uni.showModal({
						title: '提示',
						content: '当前微信版本过低，无法查看隐私协议，请升级微信后重试。',
						showCancel: false
					});
					return;
				};
				// 调用官方 API 并处理回调
				wx.openPrivacyContract({
					success: (res) => {
					},
					fail: (err) => {
						// 针对常见错误码进行精准提示
						let errMsg = '打开隐私协议失败，请稍后再试';
						if (err.errMsg && err.errMsg.includes('fail')) {
							// 通常是因为开发者在微信公众平台后台还没有配置/发布《隐私保护指引》
							errMsg = '开发者暂未配置隐私协议或网络异常';
						};
						uni.showToast({
							title: errMsg,
							icon: 'none',
							duration: 2000
						})
					},
					complete: (res) => {}
				});
				// #endif
				
				// #ifndef MP-WEIXIN
				// 非微信小程序端（如H5、App）的降级处理
				uni.showToast({ title: '当前平台暂不支持', icon: 'none' });
				// #endif
			},
	
			/**
			 *  用户点击“同意”按钮
			 */
			handleAgree(e) {
				this.needAuth = false;
				this.fetchUserInfo();
			},
	
			/**
			 *  用户点击“拒绝”按钮
			 */
			handleReject() {
				// 拒绝后，不在当前页面停留，直接返回上一页
				uni.showToast({ title: '需同意后方可查看', icon: 'none' });
				setTimeout(() => {
					uni.navigateBack({
						delta: 1,
						fail: () => {
							// 如果没有上一页（比如通过链接直接进），跳回首页
							uni.switchTab({ url: '/pages/index/index' });
						}
					});
				}, 1000)
			}
		}
	}
</script>

<style lang="scss">
	@import "~@/common/stylus/variable.scss";
	page {
		width: 100%;
		height: 100%;
	};
	.content-box {
		@include content-wrapper;
		height: 100vh !important;
		box-sizing: border-box;
		background: #f6f6f6;
		::v-deep .u-popup {
			flex: none !important
		};
		::v-deep .u-loading-icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%,-50%);
			z-index: 200000;
		};
		::v-deep .u-transition {
			z-index: 100000 !important;
		};
		/* 隐私弹窗遮罩样式 */
		.privacy-mask {
		  position: fixed;
		  top: 0; left: 0; right: 0; bottom: 0;
		  background-color: rgba(0, 0, 0, 0.6);
		  z-index: 9999;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		};
		.privacy-box {
		  width: 80%;
		  background-color: #fff;
		  border-radius: 24rpx;
		  padding: 50rpx 40rpx;
		  text-align: center;
		};
		.title {
		  font-size: 34rpx;
		  font-weight: bold;
		  color: #333;
		  display: block;
		  margin-bottom: 30rpx;
		};
		.desc {
		  font-size: 28rpx;
		  color: #666;
		  line-height: 1.6;
		  margin-bottom: 50rpx;
		  display: block;
		};
		.link {
		  color: #07c160;
		  text-decoration: underline;
		};
		.agree-btn {
		  width: 100% !important;
		  margin-bottom: 20rpx;
		  border-radius: 12rpx;
		};
		.reject-btn {
		  width: 100% !important;
		  background-color: #f5f5f5;
		  color: #666;
		  border-radius: 12rpx;
		};
		.top-background-area {
			width: 100%;
			background: #2db8f9;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10
		};
		.nav {
			width: 100%;
		};
		.content {
			 flex: 1;
			 overflow: auto;
			 padding: 6px 0;
			 box-sizing: border-box;
			 position: relative;
			 background: #F8F8F8;
			 .content-top {
					height: auto;
					font-size: 14px;
					background: #fff;
				 .content-top-name {
					 height: 90px;
					 padding: 10px;
					 box-sizing: border-box;
					 position: relative;
					 @include bottom-border-1px(#dadada);
					 > view {
						 position: absolute;
						 display: inline-block;
						 &:first-child {
							 left: 0;
							 top: 38px;
							 color: #bbbaba;
							 padding-left: 10px;
						 };
						 &:last-child {
							 color: #271010;
							 font-weight: bold;
							 right: 10px;
							 top: 10px;
							 width: 65px;
							 height: 65px;
							 border-radius: 50%;
							 >image {
								 width: 100%;
							 }
						 }
					 }
				 };
				 .content-top-other {
					 height: 45px;
					 line-height: 45px;
					 box-sizing: border-box;
					 position: relative;
					 @include bottom-border-1px(#dadada);
					 &:last-child {
						 @include bottom-border-1px(#fff)
					 }
					 > text {
						 position: absolute;
						 display: inline-block;
						 &:first-child {
							 left: 0;
							 top: 0;
							 color: #bbbaba;
							 padding-left: 10px;
						 };
						 &:last-child {
							 color: #271010;
							 font-weight: bold;
							 right: 10px;
							 top: 0
						 }
					 }
				 }
			};
			.app-version {
				position: relative;
				top: 14px;
				left: 0;
				height: 45px;
				background: #fff;
				line-height: 45px;
				box-sizing: border-box;
				> text {
					position: absolute;
					display: inline-block;
					&:first-child {
						left: 0;
						top: 0;
						color: #bbbaba;
						padding-left: 10px;
					};
					&:last-child {
						color: #271010;
						font-weight: bold;
						right: 10px;
						top: 0
					}
				}
			}
		};
		.bottom-area {
			height: 110px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 10px;
			box-sizing: border-box;
			.back-home {
				height: 45px;
				width: 300px;
				margin: 0 auto;
				line-height: 45px;
				left: 50%;
				margin-left: -150px;
				position: absolute;
				bottom: 100px;
				background: #fff;
				color: #271010;
				font-weight: bold;
				text-align: center
			};
			.quit-area {
				height: 45px;
				width: 300px;
				margin: 0 auto;
				line-height: 45px;
				left: 50%;
				margin-left: -150px;
				position: absolute;
				bottom: 30px;
				background: #ff0000;
				color: #fff;
				font-weight: bold;
				text-align: center
			}
		}
	}
</style>
