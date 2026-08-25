<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast" />
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="区域巡检" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-top">
				<view class="tab-title">
					<view :class="{liStyle: currentIndex == index}" v-for="(item,index) in tabTitleList" :key="index" @click="liClickEvent(item,index)">{{item}}</view>
				</view>
			</view>
			<view class="content-bottom">
				<u-empty text="暂无数据" mode="list" v-if="isShowNoData"></u-empty>
				<scroll-view  refresher-enabled="true" scroll-y :refresher-triggered="triggered" @refresherrefresh="onRefresh">
					<view class="content-list-action-task-wrapper" v-if="currentIndex == 0">
						<view class="content-list-action-task-item" v-for="(item,index) in taskMessageList" :key="index">
							<text class="status-box" :class="{statusWaitFinish: item.state == 2,statusWaitSignature: item.state == 3}">{{stateTransfer(item.state)}}</text>
							<text class="task-date">{{item.startTime}}</text>
							<view class="task-btn">
								<text class="view"  :class="{viewStyle: item.state == 1}" @click="taskView(item)">查看任务</text>
							</view>
							<view class="work-order-number">
								<text class="tit">巡检单号:</text>
								<text class="name ">{{item.taskNumber}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">巡检:</text>
								<text class="name">{{item.taskName}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">当前次数:</text>
								<text class="name">{{item.currentTimes}}</text>
							</view>
							<view class="work-info-other work-info-other-row">
								<text class="tit">已完成点位:</text>
								<text class="name">{{item.hasSpaces ? calculateCount(item.hasSpaces) : 0}}</text>
							</view>
							<view class="work-info-other work-info-other-row">
								<text class="tit">未完成点位:</text>
								<text class="name">{{item.hasSpaces ? calculateCountUnfinish(item,item.spaces,item.hasSpaces) : calculateCount(item.spaces)}}</text>
							</view>
						</view>
					</view>
					<view class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-if="currentIndex == 1">
						<view class="content-list-action-task-item" v-for="(item,index) in taskCompleteMessageList" :key="index">
							<text class="status-box">{{stateTransfer(item.state)}}</text>
							<text class="task-date">{{item.startTime}}</text>
							<view class="task-btn">
								<text class="view"  @click="taskView(item)">查看任务</text>
							</view>
							<view class="work-order-number">
									<text class="tit">巡检单号:</text>
									<text class="name">{{item.taskNumber}}</text>
								</view>
								<view class="work-info-other">
									<text class="tit">巡检:</text>
									<text class="name">{{item.taskName}}</text>
								</view>
								<view class="work-info-other">
									<text class="tit">当前次数:</text>
									<text class="name">{{item.currentTimes}}</text>
								</view>
								<view class="work-info-other work-info-other-row">
									<text class="tit">已完成点位:</text>
									<text class="name">{{item.hasSpaces ? calculateCount(item.hasSpaces) : 0}}</text>
								</view>
								<view class="work-info-other work-info-other-row">
									<text class="tit">未完成点位:</text>
									<text class="name">{{item.hasSpaces ? calculateCountUnfinish(item,item.spaces,item.hasSpaces) : calculateCount(item.spaces)}}</text>
								</view>
						</view>
					</view>
				</scroll-view>
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
	import {
		setCache,
		removeAllLocalStorage,
		deteleObject
	} from '@/common/js/utils'
	import store from '@/store'
	import {queryDepartmentServiceList} from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				currentIndex: 0,
				triggered: false,
				isRefreshing: false,
				tabTitleList: ['待办任务','已完成'],
				isShowNoData: false,
				toolShow: false,
				vehicleOperationList: [],
				taskMessageList: [],
				taskCompleteMessageList: []
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight'
			]),
			proId () {
				return this.userInfo.extendData.proId
			},
			workerId () {
				return this.userInfo.extendData.userId
			}
		},
		onLoad () {
			this.getDepartmentList({
				proId: this.proId,
				workerId: this.workerId,
				state: -1,
				startDate	: '',
				endDate : ''
			},0)
		},
		methods: {
			...mapMutations([
				'changeDepartmentServiceMsg'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 任务状态转换
				stateTransfer (index) {
					switch(index) {
						case 0 :
							return '未分配'
							break;
						case 1 :
							return '未开始'
							break;
						case 2 :
							return '待完成'
							break;
						case 3 :
							return '待签字'
							break;
						case 4 :
							return '已完成'
							break
					}
				},
	
				// 计算点位数量(已完成)
				calculateCount (number) {
					return deteleObject(number).length
				},
	
				// 计算点位数量(未完成)
				calculateCountUnfinish (item,sum,finishNum) {
					return deteleObject(sum).length - deteleObject(finishNum).length
				},
	
				toolSure () {
	
				},
	
				toolCancel () {
	
				},
	
				// tab点击事件
				liClickEvent (item,index) {
					this.currentIndex = index;
					this.showLoadingHint = true;
					this.infoText = '加载中,请稍候···';
					if (index == 0) {
						this.getDepartmentList({
							proId: this.proId,
							workerId: this.workerId,
							state: -1,
							startDate	: '',
							endDate : ''
						},index)
					} else {
						this.getDepartmentList({
							proId: this.proId,
							workerId: this.workerId,
							state: -2,
							startDate	: '',
							endDate : ''
						},index)
					}
				},
	
				// 下拉刷新事件
				onRefresh() {
					if (this.isRefreshing) {
						return
					};
					this.isRefreshing = true;
					if (this.triggered) {
						return
					};
					this.triggered = true;
					this.getDepartmentList({
						proId: this.proId,
						workerId: this.workerId,
						state: this.currentIndex == 0 ? -1 : -2,
						startDate	: '',
						endDate : ''
					},this.currentIndex)
				},
	
				// 查询任务列表
				getDepartmentList(data,index) {
					this.isShowNoData = false;
					queryDepartmentServiceList(data).then((res) => {
						this.showLoadingHint = false;
						this.taskMessageList = [];
						this.taskCompleteMessageList = [];
						if (this.triggered) {
							this.$nextTick(() => {
								this.triggered = false;
								this.isRefreshing = false;
							})
						};
						if(res && res.data.code == 200) {
							if (res.data.data.length > 0) {
								this.isShowNoData = false;
								for (let item of res.data.data) {
									if (index == 0) {
										this.taskMessageList.push({
											taskNumber: item.taskNumber,
											taskName: item.taskName,
											startTime: item.startTime,
											state: item.state,
											currentTimes: item.currentTimes,
											id: item.id,
											isMe: item.isMe,
											spaces: item.spaces,
											hasSpaces: item.hasSpaces
										})
									} else {
										this.taskCompleteMessageList.push({
											taskNumber: item.taskNumber,
											taskName: item.taskName,
											startTime: item.startTime,
											state: item.state,
											currentTimes: item.currentTimes,
											id: item.id,
											isMe: item.isMe,
											spaces: item.spaces,
											hasSpaces: item.hasSpaces
										})
									}
								}
							} else {
								this.isShowNoData = true;
							}
						} else {
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'center'
							});
						}
					})
					.catch((err) => {
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						});
						if (this.triggered) {
							this.$nextTick(() => {
								this.triggered = false;
								this.isRefreshing = false;
							})
						};
						this.showLoadingHint = false
					})
				},
	
				// 任务查看
				taskView (item) {
					this.changeDepartmentServiceMsg(item);
					uni.navigateTo({
						url: '/projectManagementPackage/pages/DepartmentService/DepartmentWorkOrderDeatils'
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
			 display: flex;
			 height: 0;
			 flex-direction: column;
			 position: relative;
			 .content-top {
			 height: 60px;
			 .tab-title {
				 width: 90%;
				 height: 55px;
				 margin: 0 auto;
				 view {
					 float: left;
					 font-size: 16px;
					 width: 50%;
					 line-height: 55px;
					 text-align: center;
					 color: #bbbaba
				 };
				 .liStyle {
					 color: #2db8f9;
					 border-bottom: 1px solid #2db8f9
				 }
			 }
		 };
		 .content-bottom {
			 flex: 1;
			 width: 100%;
			 font-size: 13px;
			 background: #f7f7f7;
			 position: relative;
			 overflow: auto;
			 ::v-deep .u-empty {
			 	position: absolute;
			 	top: 50%;
			 	left: 50%;
			 	transform: translate(-50%,-50%)
			 };
			 scroll-view {
			 		width: 100%;
			 		height: 100%;
			 					padding-left: 1px;
			 					padding-right: 1px;
			 					box-sizing: border-box;
			 };
			 > view {
				 width: 96%;
				 margin: 0 auto;
				 height: 100%;
				 padding-top: 10px;
				 box-sizing: border-box;
			 }
			 .content-list-action-task-wrapper {
				 .content-list-action-task-item {
					 height: 200px;
					 background: #fff;
					 padding: 15px;
					 box-sizing: border-box;
					 margin-bottom: 15px;
					 position: relative;
					 .status-box {
						 position: absolute;
						 top: 15px;
						 right: 8px;
						 font-size: 13px;
						 color: #8e9397
					 };
					 .statusWaitFinish {
						 color: #2db8f9
					 };
					 .statusWaitSignature {
						 color: #06e606
					 };
					 .task-date {
						 position: absolute;
						 bottom: 30px;
						 left: 15px;
						 font-size: 13px;
						 color: #bbbaba
					 };
					 .task-btn {
						 position: absolute;
						 bottom: 15px;
						 right: 15px;
						 font-size: 13px;
						 height: 35px;
						 text {
							 display: inline-block;
							 width: 90px;
							 height: 35px;
							 line-height: 35px;
							 text-align: center;
							 color: #fff
						 };
						 .view {
							 background: #2db8f9
						 };
						 .viewStyle {
							 background: #8e9397
						 }
					 }
					 > view {
						 height: 30px;
						 font-size: 15px;
						 color: black;
						 font-weight: bold;
					 };
					 .work-order-number {
						 font-size: 14px;
						 color: #bbbaba;
						 .name {
							 max-width: 70%;
							 display: inline-block;
							 overflow: auto;
							 vertical-align: top
						 }
					 };
					 .work-info-other-row {
						 display: inline-block;
						 width: 40%;
					 }
					 &:last-child {
						 margin-bottom: 0
					 }
				 }
			 }
		 }
		}
	}
</style>
