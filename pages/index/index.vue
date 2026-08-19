<template>
	<view class="content" :style="{ 'padding-top': statusBarHeight + 'px' }">
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 'px' }"></view>
		<u-toast ref="uToast" />
    <!-- 顶部标题 -->
    <view class="topTabbar" :style="{ 'height': navigationBarHeight + 'px', 'lineHeight': navigationBarHeight + 'px'}">
			<view class="title-center">
				工程管理系统
			</view>
    </view>
		<view class="content-box">
			<view class="content-top">
				<view class="content-top-userName">
					<view class="content-top-userName-img">
						<image :src="defaultPersonPng" mode="widthFix"></image>
					</view>
					<view class="content-top-userName-msg">
						<text class="real-name-one">{{name}}</text>
						<text class="real-name-two">{{proName}}&emsp;&emsp;{{userType}}</text>
					</view>
				</view>
			</view>
			<view class="content-middle-task-message">
				<view class="content-middle-title">任务看板</view>
					<view class="content-middle-task-name">
						<view v-for="(item,index) in taskList" :key="index" @click="taskClickEvent(item,index)">
							<text class="task-length" :class="{daskListSignStyle:isExist(item.tit)}" v-show="item.count !== null && item.count !== '' && item.count !== 0">{{ item.count }}</text>
							<view class="task-button-wrapper">
								<image :src="btnTaskWrapperPng" mode="widthFix"></image>
							</view>
							<view class="task-btn-img">
								<view>
									<image :src="item.imgUrl" mode="widthFix"></image>
								</view>
							</view>
							<view  class="task-btn-tit">{{item.tit}}</view>
						</view>
					</view>
			</view>
			<view class="content-bottom">
				<view class="btn-left" v-for="(item,index) in btnList" :key="index" @click="bottomBtnClickEvent(item,index)">
					<view :class="{pStyle: btnIndex == index}">
						<u-icon :name="`${item.icon}`"></u-icon>
					</view>
					<view :class="{pStyle: btnIndex == index}">{{item.name}}</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import departmentServiceOnePng from '@/static/img/department-service-one.png'
	import dispatchingManagementPng from '@/static/img/dispatching-management.png'
	import deviceServiceOnePng from '@/static/img/device-service-one.png'
	import autoRepairPng from '@/static/img/auto-repair.png'
	import repairsWorkOrderOnePng from '@/static/img/repairs-work-order-one.png'
	import store from '@/store'
	import {queryTaskCount,getNewWork} from '@/api/project.js'
	let windowTimer
	export default{
		data() {
			return {
				showLoadingHint: false,
				temporaryNumList: [],
				isTimeoutContinue: true,
				taskList: [
					{tit:'报修工单', imgUrl: repairsWorkOrderOnePng, value: 'bxTask', count: 0},
					{tit:'设备巡检', imgUrl: deviceServiceOnePng, value: 'sxTask', count: 0},
					{tit:'区域巡检', imgUrl: departmentServiceOnePng, value: 'kxTask', count: 0},
					{tit:'调度管理', imgUrl: dispatchingManagementPng, value: 'dgTask', count: 0},
					{tit:'自主报修', imgUrl: autoRepairPng, value: 'zizhuTask', count: 0}
				],
				defaultPersonPng: require('@/static/img/default-person-photo.png'),
				btnTaskWrapperPng: require('@/static/img/btn-background.png'),
			}
		},
		updated() {},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'capsuleMessage',
				'globalTimer',
				'newTaskName'
			]),
			
			userName () {
			 return this.userInfo.userName
			},
			 userName () {
			 return this.userInfo.userName
			},
			userTypeId () {
				return this.userInfo.extendData.user_type_id
			},
			userType () {
				return this.userInfo.extendData.userType
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
		
		onShow() {
			if (!this.globalTimer) {
					windowTimer = setInterval(() => {
						if (this.isTimeoutContinue) {
							setTimeout(() => {
								this.queryNewWork(this.proId, this.workerId)
							}, 0);
							this.changeGlobalTimer(windowTimer)
						} else {
							this.changeGlobalTimer(null)
						}
					}, 3000)
			};
			this.getTaskCount(this.proId,this.workerId);
			this.controlModuleShow()
		},
		
		methods: {
			...mapMutations([
				'changeNewTaskList',
				'changeGlobalTimer'
			]),
			
			// 控制模块显示
			controlModuleShow () {
				if (this.userInfo['extendData']) {
					if (!this.userInfo['extendData']['projectDisp']) {
						this.taskList = this.taskList.filter((item) => { return item.tit != '报修工单'})
					};
					if (!this.userInfo['extendData']['projectAssgin'] || this.userInfo['extendData']['projectAudit']) {
						this.taskList = this.taskList.filter((item) => { return item.tit != '调度管理'})
					};
					if (this.userInfo['extendData']['projectAudit']) {
						this.taskList = this.taskList.filter((item) => { return item.tit != '自主报修'})
					}
				}  
			},
			
			// 查询是否有新任务
			queryNewWork (proId,workerId) {
				this.isTimeoutContinue = false;
				const audioCtx = uni.createInnerAudioContext();
				audioCtx.src = '/static/task-info-voice.wav'; // 推荐使用 HTTPS 链接
				audioCtx.volume = 0.8; // 设置音量 (0~1)
				getNewWork(proId,workerId).then((res) => {
					// token过期,清除定时器
					if (!res['headers']['token']) {
						if(windowTimer) {clearInterval(windowTimer)}
					};
					if (res && res.data.code == 200) {
						this.isTimeoutContinue = true;
						Object.keys(res.data.data).forEach((item) => {
							if (item != "all" && res.data.data[item] == true) {
								this.temporaryNumList = this.newTaskName;
								this.temporaryNumList.push(item);
								// 新任务存入vuex中
								this.changeNewTaskList(repeArray(this.temporaryNumList));
								// 新任务存入localStore中
								setStore('newTaskList',{taskName:repeArray(this.temporaryNumList)});
								//更新任务数量
								this.getTaskCount(this.proId,this.workerId);
								//进行播放
								audioCtx.play();
								audioCtx.onPlay();
								audio.onEnded = () => {
								}
							}
						})
					}
				})
				.catch((err) => {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},
			
			// 任务类型转换字母
			taskTypeTransferLetter (type) {
				switch(type) {
					case '报修工单' :
						return 'bx'
						break;
					case '区域巡检' :
						return 'kx'
						break;
					case '设备巡检' :
						return 'sx'
						break;
					case '自主报修' :
						return 'zizhuTask'
						break
				}
			},

			// 是否存在指定任务
			isExist (item) {
				let flag;
				if (this.newTaskName.indexOf(this.taskTypeTransferLetter(item))!= -1) {
					flag = true
				} else {
					flag = false
				}
				return flag
			},

			// 查询任务数量
			getTaskCount (proId,workerId) {
				queryTaskCount(proId,workerId).then((res) => {
					if (res && res.data.code == 200) {
						const {bxTask, sxTask, kxTask} = res.data.data;
						this.taskList.forEach((item) => {
							if (item.value == 'bxTask') {
								item.count = bxTask;
							} else if (item.value == 'sxTask') {
								item.count = sxTask;
							} else if (item.value == 'kxTask') {
								item.count = kxTask;
							}
						})
					}
				})
				.catch((err) => {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},
			
			// 任务类型点击事件
			taskClickEvent (item,index) {
				let currentIndex = this.newTaskName.indexOf(this.taskTypeTransferLetter(item.tit));
				this.temporaryNumList = this.newTaskName;
				if (item.tit == '报修工单') {
					if (currentIndex != -1) {
						this.temporaryNumList.splice(index,1);
						this.changeNewTaskList(this.temporaryNumList);
					};
					uni.navigateTo({
						url: '/projectManagementPackage/pages/RepairsWorkOrder'
					})
				} else if (item.tit == '设备巡检') {
					if (currentIndex != -1) {
						this.temporaryNumList.splice(index,1);
						this.changeNewTaskList(this.temporaryNumList);
						setStore('newTaskList',{taskName:this.temporaryNumList})
					};
				} else if (item.tit == '区域巡检') {
					if (currentIndex != -1) {
						this.temporaryNumList.splice(index,1);
						this.changeNewTaskList(this.temporaryNumList);
						setStore('newTaskList',{taskName:this.temporaryNumList})
					};
				} else if (item.tit == '调度管理') {
				} else if (item.tit == '自主报修') {
				}
			}
		}
	}
</script>
<style lang="scss" scoped>
	@import "~@/common/stylus/variable.scss";
	page {
		width: 100%;
		height: 100%;
	};
	$chatContentbgc: #1E86FD;
	$sendBtnbgc: #4F7DF5;
	view,button,text,input,textarea {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	};
	.content {
		@include content-wrapper;
		height: 100vh !important;
		padding: 0 2px;
		box-sizing: border-box;
		position: relative;
		background: #F8F8F8;
		::v-deep .u-popup {
			flex: none !important
		};
		.top-background-area {
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;
			background: #2db8f9;
		};
    .topTabbar {
			width: 100%;
			display: flex;
			box-sizing: border-box;
			align-items: center;
			position: relative;
			.title-center {
				flex: 1;
				text-align: center;
				font-size: 14px;
				color: #fff;
			}
		};
		.home-banner-area {
			margin-top: 10px;
			height: 150px;
			>image {
				width: 100%;
				height: 100%;
			}
		};
		.content-box {
			position: relative;
			flex: 1;
			height: 0;
			display: flex;
			flex-direction: column;
			margin-top: 10px;
			.content-top {
				padding: 15px 10px;
				font-size: 14px;
				background: #fff;
				.content-top-userName {
					height: 100%;
					display: flex;
					flex-flow: row nowrap;
				 > view {
						display: inline-block;
						height: 100%;
				 };
				 .content-top-userName-img {
						width: 75px;
						vertical-align: top;
						margin-right: 8px;
						border-radius: 50%;
						>image {
							width: 100%;
						}
					};
					.content-top-userName-msg {
						flex: 1;
						font-size: 13px;
						vertical-align: top;
						position: relative;
						>text {
							display: block;
							word-break: break-all;
							position: absolute;
							left: 0
						};
						.real-name-one {
							top: 10px;
							color: #271010;
							line-height: 14px;
							font-weight: bold
						};
						.real-name-two {
							bottom: 10px;
							line-height: 14px;
							color: #bbbaba
						}
					}
				}
			};
			.content-middle-task-message {
				flex:1;
				overflow: scroll;
				padding: 0 10px 0 10px;
				background: #f7f7f7;
				display: flex;
				height: 0;
				flex-direction: column;
				font-size: 13px;
				.content-middle-title {
					height: 45px;
					font-size: 16px;
					line-height: 45px;
					color: #271010;
					font-weight: bold
				};
				.content-middle-task-name {
					flex:1;
					overflow: scroll;
					box-sizing: border-box;
					padding-bottom: 20px;
					>view {
						background: #fff;
						width:47%;
						height: 160px;
						margin-top: 6%;
						border-radius: 4px;
						display:inline-block;
						text-align: center;
						padding-top: 20px;
						box-sizing: border-box;
						position: relative;
						.task-length {
							position: absolute;
							width: 15px;
							height: 15px;
							line-height: 15px;
							font-size: 10px;
							top: 14px;
							right: 14px;
							background: orange;
							color: #fff;
							border-radius: 2px;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap
						};
						.daskListSignStyle {
							background: #eb0000
						};
						.task-button-wrapper {
							width: 100%;
							position: absolute;
							top: 0;
							left: 0;
							z-index: -1;
							>image {
								width: 100%;
							}
						};
						.task-btn-img {
							width: 56px;
							height: 56px;
							line-height: 60px;
							margin: 0 auto;
							border-radius: 4px;
							position: relative;
							>view {
								display: inline-block;
								width: 56px;
								height: 56px;
								margin: 0 auto;
								position: absolute;
								top: 50%;
								left: 50%;
								margin-top: -28px;
								margin-left: -28px;
								>image {
									width: 100%;
								}
							}
						};
						.task-btn-tit {
							color: #271010;
							font-weight: bold;
							margin-top: 30px;
						}
						&:nth-child(1) {
							margin-top: 0 !important
						};
						&:nth-child(2) {
							margin-top: 0 !important
						};
						&:nth-child(odd) {
							margin-right: 6%
						}
					}
				}
			};
			.content-bottom {
				height: 60px;
				margin: 0 auto;
				width: 100%;
				font-size: 13px;
				position: relative;
				> view {
					width: 50%;
					height: 60px;
					position: absolute;
					top: 0;
					text-align: center;
					line-height: 60px;
					.pStyle {
						color: #2db8f9 !important
					}
					> view {
						height: 30px;
						line-height: 30px;
						&:first-child {
							color: #333;
							font-size: 26px;
							padding-top: 8px;
							box-sizing: border-box;
							::v-deep .u-icon {
								margin-top: -2px
							}
						};
						&:last-child {
							letter-spacing: 5px;
							text-indent: 5px;
							color: #271010;
							font-weight: bold;
						}
					};
					&:first-child {
						left: 0
					};
					&:last-child {
						 right: 0
					}
				}
			}
		}
	}
</style>