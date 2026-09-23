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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="自主报修历史记录" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-box-inner" v-if="isLoadComplete">
				 <view class="problem-description-box">
					 <view class="problem-description-tit">
							问题描述
					 </view>
					 <view class="problem-description-content">
						 <view class="line-content">
							 <text>类型</text>
							 <text>{{ taskMessage.typeName }}</text>
						 </view>
						 <view class="line-content">
							 <text>建筑</text>
							 <text>{{ taskMessage.structName }}</text>
						 </view>
						 <view class="line-content">
							 <text>科室</text>
							 <text>{{ taskMessage.depName }}</text>
						 </view>
						 <view class="line-content">
							 <text>房间</text>
							 <text>{{ disposeCheckType(taskMessage.spaces) }}</text>
						 </view>
						 <view class="list-line-image">
								<view>问题图片</view>
								<view>
									<image v-for="(innerItem,innerIndex) in taskMessage.images" :key="innerIndex" :src="innerItem.path" alt="" @click.stop="enlareEvent(innerItem.path)"></image>
								</view>
							</view>
							<view class="issue-content">
								<view class="issue-left">
									问题描述
								</view>
								<view class="issue-right">
									{{ taskMessage.taskDesc }}
								</view>
							</view>
					 </view>
				 </view>
				 <view class="maintenance-record-box">
					 <view class="maintenance-record-tit">
							 <text>维修记录</text>
					 </view>
					 <view class="maintenance-record-content">
							<view class="line-content">
							 <text>维修员</text>
							 <text>{{ taskMessage.workerName }}</text>
						 </view>
						 <view class="line-content">
							 <text>参与人</text>
							 <text>{{ disposeTaskPresent(taskMessage.present) }}</text>
						 </view>
							<view class="list-line-image">
								<view>修复图片</view>
								<view>
									<image v-for="(innerItem,innerIndex) in taskMessage.repairImg" :key="innerIndex" :src="innerItem.path" @click.stop="enlareEvent(innerItem.path)"></image>
								</view>
							</view>
						</view>
				 </view>
				 <view class="use-material-box">
						<view class="material-tit">
							<text>使用物料</text>
						</view>
						<view class="material-content">
							<view class="material-list" v-for="(item,index) in taskMessage.materials" :key="index">
								<view class="material-list-left">
									<text>{{ index+1 }}</text>
									<text>{{ `${item.mateName}-${item.model}` }}</text>
								</view>
								<view class="material-list-right">
									<text>{{ item.number }}</text>
								</view>
							</view>
						</view>
				 </view>
				 <view class="signature-box">
					<view class="signature-tit">
						<text>签字</text>
					</view>
					<view class="signature-content">
						<image v-if="taskMessage.signImg.length > 0 && taskMessage.signImg[0].hasOwnProperty('path')" :src="taskMessage.signImg[0]['path']"></image>
					</view>
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
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				isLoadComplete: false,
				moveInfo: {
					startX: ''
				},
				currentImgUrl: '',
				taskMessage: {},
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
			}
		},
		onLoad (options) {
			this.taskMessage = JSON.parse(decodeURIComponent(options.params));
			this.isLoadComplete = true
		},
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 处理维修任务空间信息
			disposeCheckType (item) {
				if (!item) { return };
				if (item.length == 0) { return ''};
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
			position: relative;
			height: 0;
			.content-box-inner {
					 flex: 1;
					 box-sizing: border-box;
					 display: flex;
					 flex-direction: column;
					 width: 100%;
					 height: 0;
					 overflow: auto;
					 background: #f7f7f7;
					 z-index: 10;
					 .problem-description-box {
							 .problem-description-tit {
									 font-size: 14px;
									 font-weight: bold;
									 color: #101010;
									 height: 35px;
									 line-height: 35px;
									 padding-left: 10px;
									 box-sizing: border-box; 
							 };
							 .problem-description-content {
									 .line-content {
											 padding: 14px;
											 box-sizing: border-box;
											 background: #fff;
											 display: flex;
											 justify-content: space-between;
											 margin-bottom: 6px;
											 >text {
													 display: inline-block;
													 font-size: 14px;
													 &:first-child {
															 color: #9E9E9A
													 };
													 &:last-child {
															 flex: 1;
															 word-break: break-all;
															 line-height: 18px;
															 text-align: right;
															 padding-left: 6px;
															 font-weight: bold;
															 color: #101010;
													 }
											 }
									 };
									 .list-line-image {
											 display: flex;
											 flex-direction: column;
											 >view {
													 &:first-child {
															 font-size: 14px;
															 color: #9E9E9A; 
															 height: 40px;
															 line-height: 40px;
															 padding-left: 14px;
															 box-sizing: border-box
													 };
													 &:last-child {
															 display: flex;
															 padding-left: 10px;
															 box-sizing: border-box;
															 flex-wrap: wrap;
															 >image {
																	 width: 18.4%;
																	 height: 70px;
																	 margin-right: 2%;
																	 margin-bottom: 10px;
																	 &:nth-child(5n) {
																			 margin-right: 0 !important
																	 }
															 }
													 }    
											 }
									 };
									 .issue-content {
											 background: #fff;
											 padding: 14px;
											 margin-top: 10px;
											 box-sizing: border-box;
											 display: flex;
											 justify-content: space-between;
											 .issue-left {
													 font-size: 14px;
													 color: #9E9E9A
											 };
											 .issue-right {
													 padding-left: 10px;
													 box-sizing: border-box;
													 text-align: right;
													 word-break: break-all;
													 font-size: 14px;
													 font-weight: bold;
													 color: #101010;
													 flex: 1;
													 line-height: 18px
											 }
									 }
							 }
					 };
					 .maintenance-record-box {
							 .maintenance-record-tit {
									 font-size: 14px;
									 color: #101010;
									 height: 35px;
									 line-height: 35px;
									 padding-left: 10px;
									 box-sizing: border-box;
									 >text {
										 font-weight: bold;
									 } 
							 };
							 .maintenance-record-content {
									.line-content {
											 padding: 14px;
											 box-sizing: border-box; 
											 background: #fff;
											 display: flex;
											 justify-content: space-between;
											 margin-bottom: 6px;
											 >text {
													 display: inline-block;
													 font-size: 14px;
													 &:first-child {
														 color: #9E9E9A
													 };
													 &:last-child {
															 flex: 1;
															 line-height: 18px;
															 word-break: break-all;
															 text-align: right;
															 padding-left: 6px;
															 font-weight: bold;
															 color: #101010;
													 }
											 }
									 };
									 .list-line-image {
											 display: flex;
											 flex-direction: column;
											 >view {
													 &:first-child {
															 font-size: 14px;
															 color: #9E9E9A; 
															 height: 40px;
															 line-height: 40px;
															 padding-left: 14px;
															 box-sizing: border-box
													 };
													 &:last-child {
															 display: flex;
															 padding-left: 10px;
															 box-sizing: border-box;
															 flex-wrap: wrap;
															 >image {
																	 width: 18.4%;
																	 height: 70px;
																	 margin-right: 2%;
																	 margin-bottom: 10px;
																	 &:nth-child(5n) {
																			 margin-right: 0 !important
																	 }
															 }
													 }    
											 }
									 }
							 }
					 };
					 .use-material-box {
						 .material-tit {
							 font-size: 14px;
							 background: #fff;
							 color: #101010;
							 height: 35px;
							 line-height: 35px;
							 padding-left: 10px;
							 margin-top: 10px;
							 box-sizing: border-box;
							 >text {
								 font-weight: bold;
							 } 
						 };
						 .material-content {
							 padding: 10px;
							 box-sizing: border-box;
							 background: #fff; 
							 .material-list {
								 height: 40px;
								 background: #f7f7f7;
								 display: flex;
								 align-items: center;
								 border-radius: 2px;
								 justify-content: space-between;
								 margin-bottom: 6px;
								 .material-list-left {
									 display: flex;
									 flex: 1;
									 width: 0;
									 >text {
										 font-size: 14px;
										 color: #101010;
										 &:first-child {
											 text-align: center;
											 width: 40px;
											 color: #333
										 };
										 &:last-child {
											 flex: 1;
											 @include no-wrap
										 }
									 }
								 };
								 .material-list-right {
									 width: 40px;
									 font-size: 14px;
									 color: #101010
								 };
							 }
						 }
					 };
					 .signature-box {
						 .signature-tit {
							 font-size: 14px;
							 color: #101010;
							 height: 35px;
							 line-height: 35px;
							 padding-left: 10px;
							 box-sizing: border-box;
							 >text {
								 font-weight: bold;
							 } 
						 };
						 .signature-content {
							 padding: 10px;
							 box-sizing: border-box;
							 background: #fff;
							 >image {
								 width: 100%;
								 background: #e9e9e9;
							 } 
						 }
					 }
			 }
		 }
	}
</style>
