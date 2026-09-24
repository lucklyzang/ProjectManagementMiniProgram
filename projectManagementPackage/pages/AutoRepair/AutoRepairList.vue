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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="自主报修" @backClick="backTo">
				<template slot="right">
					<u-icon name="plus" color="#fff" size="22" @click="onClickRight"></u-icon>
				</template>
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-box-inner">
				<u-empty text="暂无数据" mode="list" v-if="repairsTaskEmptyShow"></u-empty>
				<view class="list-box">
					<scroll-view class="scroll-view" scroll-y="true"  @scrolltolower="scrolltolower">
						<view class="repair-list" @click="enterTaskDetailsEvent(item)" v-for="(item,index) in repairsTaskList" :key="index">
							<view class="list-line-one">
								<view class="list-line-one-left">
									<text>工单号: </text>
									<text>{{ item.taskNumber }}</text>
								</view>
								<view class="list-line-one-right">
									<text>{{ item.createTime }}</text>
								</view>
							</view>
							<view class="list-line-two">
								<view class="list-line-two-left">
									<text>类型: </text>
									<text>{{ item.typeName }}</text>
								</view>
								<view class="list-line-two-right" :class="{statusWaitSure:item.state == 1,statusWaitFinish: item.state == 3,statusWaitSignature: item.state == 4, statusWaitCheck:item.state == 8}">
									{{ taskStatusTransition(item.state) }}
								</view>
							</view>
							<view class="list-line-three">
								<text>概述: </text>
								<text>{{ item. taskDesc }}</text>
							</view>
							<view class="list-line-four">
								<view>问题图片</view>
								<view>
									<image v-for="(innerItem,innerIndex) in item.images" :key="innerIndex" :src="innerItem.path" alt="" @click.stop="enlareEvent(innerItem.path)"></image>
								</view>
							</view>
						</view>
						<u-loadmore :status="status" v-if="repairsTaskList.length > 0" />
					</scroll-view>
				</view>    
			</view> 
		</view>
		<!-- 图片放大弹框 -->
		<view class="infoDialog">
			<u-modal class="infoDialog" :show="imgBoxShow" @confirm="imgBoxShow = false">
				<image :src="currentImgUrl" mode="widthFix"></image>
			</u-modal>
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
	} from '@/common/js/utils'
	import store from '@/store'
	import {getHistoryAutoRepairsTaskList} from '@/api/autoRepairCreate.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				isLoadingRepairsTask: false,
				repairsTaskEmptyShow: false,
				moveInfo: {
					startX: ''
				},
				loadFreshTimer: null,
				isLoadMore: true,
				isShowNoMoreData: false,
				currentPageList: [],
				repairsTaskList: [],
				totalCount: '',
				currentPageNum: 1,
				timeTwo: null,
				pageSize: 10,
				status: 'nomore',
				currentImgUrl: '',
				imgBoxShow: false
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
			this.getRepairsList(this.currentPageNum,this.pageSize,this.workerId,1,this.proId,false,true)
		},
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			onClickRight() {
				uni.navigateTo({
					url: '/projectManagementPackage/pages/AutoRepair/AutoRepairCreate'
				})
			},
			
			// 上拉加载数据
			scrolltolower () {
				let totalPage = Math.ceil(this.totalCount/this.pageSize);
				if (this.currentPageNum >= totalPage) {
					this.status = 'nomore'
				} else {
					this.status = 'loadmore';
					this.currentPageNum++;
					this.getRepairsList(this.currentPageNum,this.pageSize,this.workerId,1,this.proId,true,false)
				}
			},
			
			// 自主报修任务列表
			getRepairsList (currentPage,pageSize,workerId,isOwn,proId,flag,isInitQuery) {
				this.showLoadingHint = true;
				this.infoText = '加载中...';
				this.repairsTaskEmptyShow = false;
				this.currentPageList = [];
				getHistoryAutoRepairsTaskList({
					page:currentPage,
					limit: pageSize,
					workerId,
					isOwn,
					proId
				})
				.then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if (res && res.status == 200) {
						if (res.data.hasOwnProperty('code')) {
							if (res.data.code != 200) {
								this.$refs.uToast.show({
									message: res.data.msg,
									type: 'error',
									position: 'center'
								});
								return;
							}
						};  
						this.currentPageList = res.data.data;
						this.totalCount = res.data.recordsTotal;
						if (isInitQuery) {
							let totalPage = Math.ceil(this.totalCount/this.pageSize);
							if (this.currentPageNum >= totalPage) {
								this.isShowNoMoreData = true
							}
						};  
						// 是否上拉加载
						if (flag) {
							this.isLoadingRepairsTask = false;
							this.$refs.uToast.show({
								message: '加载成功',
								type: 'success',
								position: 'center'
							})
						};
						this.repairsTaskList = this.repairsTaskList.concat(this.currentPageList);
						if (this.repairsTaskList.length == 0) {
							this.repairsTaskEmptyShow = true
						}
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						})
					}
				})
				.catch((err) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if (flag) {
						this.isLoadingRepairsTask = false;
						this.$refs.uToast.show({
							message: '加载失败',
							type: 'error',
							position: 'center'
						});
						if (this.loadFreshTimer) {
							clearTimeout(this.loadFreshTimer)
						};
						return
					};
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},
	
			// 处理维修任务空间信息
			disposeCheckType (item) {
				if (!item) { return };
				if (item.length == 0) { return };
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.name)
				};
				return temporaryArray.join('、')
			},
	
			// 处理维修任务参与者
			disposeTaskPresent (item) {
				if (!item) { return };
				if (item.length == 0) { return };
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.name)
				};
				return temporaryArray.join('、')
			},
	
			// 计算已经历时间
			elapsedTime (planStartTme) {
				let currentTime = new Date().getTime();
				let transferPlanStartTme = new Date(planStartTme).getTime();
				if (transferPlanStartTme > currentTime) {
					return ''
				} else {
					return `${this.$moment(currentTime).diff(transferPlanStartTme, 'minutes')}分钟`
				}
			},
	
			// 进入任务详情事件
			enterTaskDetailsEvent (item) {
				if (item.state == 4) {
					// 去往签字页
					uni.navigateTo({
						url: `/projectManagementPackage/pages/AutoRepair/AutoRepairTaskSignature?params=${encodeURIComponent(JSON.stringify({ taskId: item.id }))}`
					})
				} else {
					uni.navigateTo({
						url: `/projectManagementPackage/pages/AutoRepair/AutoRepairHistoryRecord?params=${encodeURIComponent(JSON.stringify(item))}`
					})
				}
			},
	
			// 图片放大事件
			enlareEvent (item) {
				this.currentImgUrl = item;
				this.imgBoxShow = true
			},
	
			// 优先级转换
			taskPriotityTransition (state) {
				switch(state) {
					case 1 :
						return '正常'
						break;
					case 2 :
						return '紧急'
						break;
					case 3 :
						return '重要'
						break;
					case 4 :
						return '紧急重要'
						break
				}
			},
	
			// 任务状态转换
			taskStatusTransition (state) {
				switch(state) {
					case 0 :
						return '未分配'
						break;
					case 1 :
						return '未查阅'
						break;
					case 2 :
						return '未开始'
						break;
					case 3 :
						return '进行中'
						break;
					case 4 :
						return '待签字'
						break;
					case 5 :
						return '已完成'
						break;
					case 8 :
						return '待审核'
						break
				}
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
			background: #3890EE;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10
		};
		.infoDialog {
			::v-deep .u-modal {
				top: 50% !important;
				.u-modal__content {
					max-height: 70vh;
					overflow: auto;
					>image {
						width: 100%;
					}
				}
			}
		};
		.nav {
			width: 100%;
		};
		.content {
			flex: 1;
			display: flex;
			flex-direction: column;
			height: 0;
			 .content-box-inner {
					 flex: 1;
					 padding: 0 6px;
					 box-sizing: border-box;
					 display: flex;
					 flex-direction: column;
					 height: 0;
					 background: #f7f7f7;
					 z-index: 10;
					 position: relative;
					 ::v-deep .u-empty {
					 	position: absolute;
					 	top: 50%;
					 	left: 50%;
					 	transform: translate(-50%,-50%)
					 };
					 .scroll-view {
					 		width: 100%;
					 		height: 100%;
					 };
					 .list-box {
						 overflow: auto;
						 height: 100%;
						 padding-bottom: 10px;
						 box-sizing: border-box;
							 .no-more-data {
								 height: 30px;
								 line-height: 30px;
								 text-align: center;
								 font-size: 12px;
								 color: #c4c4c4
							 };
							 .repair-list {
									 background: #fff;
									 border-radius: 4px;
									 padding: 10px 10px 6px 16px;
									 box-sizing: border-box;
									 margin-top: 10px;
									 .list-line-one {
										 display: flex;
										 justify-content: space-between;
										 align-items: center;
										 width: 100%;
										 .list-line-one-left {
												 padding-right: 4px;
												 box-sizing: border-box;
												 flex: 1;
												 width: 0;
												 display: flex;
												 >text {
														 font-size: 12px;
														 color: #BEC7D1;
														 &:first-child {
																 margin-right: 4px;
														 };
														 &:last-child {
																 flex: 1;
																 @include no-wrap
														 }
												 }
										 };
										 .list-line-one-right {
												 >text {
														 font-size: 12px;
														 color: #BEC7D1;
												 }    
										 }
									 };
									 .list-line-two {
										 margin-top: 16px;
										 display: flex;
										 justify-content: space-between;
										 align-items: center;
										 width: 100%;
										 .list-line-two-left {
											 padding-right: 4px;
											 box-sizing: border-box;
											 flex: 1;
											 width: 0;
											 display: flex;
											 >text {
												 font-size: 14px;
												 font-weight: bold;
												 color: #00070F; 
												 &:first-child {
													 margin-right: 4px;
												 };
												 &:last-child {
													 flex: 1;
													 word-break: break-all
												 }
											 }
										 };
										 .list-line-two-right {
											 font-size: 14px;
											 color: #8e9397;
										 };
										 .statusWaitSure {
											 color: red
										 };
										 .statusWaitFinish {
											 color: #2db8f9
										 };
										 .statusWaitSignature {
											 color: #06e606
										 };
										 .statusWaitCheck {
											 color: orange
										 };
										 .listLineTwoRightStyle {
											 color: #F2A15F !important
										 }
									 };
									 .list-line-three {
											 margin-top: 10px;
											 >text {
													 line-height: 20px;
													 font-size: 14px;
													 font-weight: bold;
													 color: #00070F;  
													 &:last-child {
														 word-break: break-all
													 }
											 }
									 };
									 .list-line-four {
											 margin-top: 10px;
											 display: flex;
											 flex-direction: column;
											 >view {
													 &:first-child {
															 font-size: 14px;
															 font-weight: bold;
															 color: #00070F; 
															 margin-bottom: 6px; 
													 };
													 &:last-child {
															 display: flex;
															 flex-wrap: wrap;
															 >image {
																	 width: 23.5%;
																	 height: 70px;
																	 margin-right: 2%;
																	 margin-bottom: 10px;
																	 &:nth-child(4n) {
																			 margin-right: 0 !important
																	 }
															 }
													 }    
											 }
									 }
							 }
					 }
				 }
			 }
		}
</style>
