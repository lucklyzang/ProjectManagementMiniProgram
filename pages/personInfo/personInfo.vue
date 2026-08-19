<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
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
		<view class="content">
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
						{{userInfo.name}}
					</text>
				</view>
				<view class="content-top-other">
					<text>手机号码</text>
					<text>
						无
					</text>
				</view>
				<view class="content-top-other">
					<text>公司部门</text>
					<text>
						{{userInfo.extendData.proName}}
					</text>
				</view>
				<view class="content-top-other">
					<text>职位</text>
					<text>
						{{userInfo.extendData.userType}}
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
				versionNumber: '1.0.0',
				defaultPersonPng: require('@/static/img/default-person-photo.png')
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'chooseHospitalArea'
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
			}
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
						store.dispatch('resetCommitState')
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
