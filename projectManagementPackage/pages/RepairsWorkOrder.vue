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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="报修工单" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-top">
				<view class="tab-title">
					<view :class="{liStyle: currentIndex == index}" v-for="(item,index) in tabTitleList" :key="index" @click="liClickEvent(item,index)">{{item}}</view>
				</view>
			</view>
			<view class="content-bottom" ref="contentBottom">
				<scroll-view  refresher-enabled="true" scroll-y :refresher-triggered="isRefresh" refresherrefresh="onRefresh">
					<view class="content-list-action-task-wrapper" v-if="currentIndex === 0">
						<view class="content-list-action-task-item" v-for="(item,index) in taskMessageList" :key="item.id">
							<text class="status-box" :class="{statusWaitSure:item.state == 1,statusWaitFinish: item.state == 3,statusWaitSignature: item.state == 4, statusWaitCheck:item.state == 8}">{{stateTransfer(item.state)}}</text>
							<text class="task-date">{{item.planStartTime}}</text>
							<view class="task-btn">
								<text class="back" @click="taskBack(item)" v-if="item.state == 1 || item.state == 2">退回</text>
								<text class="sure" @click="taskSure(item)" v-if="item.state == 1">确认</text>
								<text class="view"  @click="taskView(item)" v-if="item.state !== 1">查看任务</text>
							</view>
							<view class="work-order-number">
								<!-- <u-checkbox-group
									v-model="checkboxValue1"
									v-if="item.state == 8 && isManagementClick"
								>
									<u-checkbox
										checked-color="#3B9DF9"
										v-for="(item, index) in itemCheckboxList"
										:key="index"
										:label="item.name"
										:name="item.name"
									>
									</u-checkbox>
								</u-checkbox-group> -->
								<text class="tit">工单号:</text>
								<text class="name">{{item.taskNumber}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">工单:</text>
								<text class="name">{{item.taskDesc}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">类型:</text>
								<text class="name">{{item.typeName}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">地点:</text>
								<text class="name">{{item.depName}}</text>
								<text v-for="(item,index) in item.spaces" :key="index">-{{item.name}}</text>
							</view>
						</view>
					</view>
					<view class="content-list-action-task-wrapper content-list-complete-task-wrapper" v-if="currentIndex === 1">
						<view class="content-list-action-task-item" v-for="(item,index) in taskCompleteMessageList" :key="item.id">
							<text class="status-box">{{stateTransfer(item.state)}}</text>
							<text class="task-date">{{item.planStartTime}}</text>
							<view class="task-btn">
								<text class="view" v-if="item.state !== 1" @click="taskView(item)">查看任务</text>
							</view>
							<view class="work-order-number">
								<text class="tit">工单号:</text>
								<text class="name">{{item.taskNumber}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">工单:</text>
								<text class="name">{{item.taskDesc}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">类型:</text>
								<text class="name">{{item.typeName}}</text>
							</view>
							<view class="work-info-other">
								<text class="tit">地点:</text>
								<text class="name">{{item.depName}}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="bottom-check-area" v-if="isManagementClick && taskMessageList.length > 0">
				<view class="check-area-left">
					<!-- <van-checkbox icon-size="24px" checked-color="#3B9DF9" v-model="allChecked" @click="allChooseEvent">全选</van-checkbox> -->
				</view>
				<view class="check-area-right" :class="{'checkAreaRightStyle' : !isCheckCanClick}" @click="completeCheckEvent">完成审核</view>
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
	} from '@/common/js/utils'
	import store from '@/store'
	import navBar from "@/components/zhouWei-navBar"
	import {queryRepairsProjectList,sureRepairsTask,backRepairsTask,queryBackRepairsTaskReason,batchCgeckTask,sureStartTask} from '@/api/project.js'
	export default {
		components: {
			navBar
		},
		data() {
			return {
				showLoadingHint: false,
				currentIndex: 0,
				taskId: '',
				infoText: '加载中,请稍候····',
				tabTitleList: ['待办任务','已完成'],
				reasonShow: false,
				isRefresh: false,
				reasonOperationList: [],
				reasonInputValue: '',
				reasonIndex: '',
				reasonText: '',
				reasonName: '',
				reasonValue: '',
				taskMessageList: [],
				allChecked: false,
				temporaryTaskMessageList: [],
				taskCompleteMessageList: [],
				isManagementClick: false,
				isCheckCanClick: false,
				checkDialogShow: false,
				checkOrderCount: 0,
				chooseCheckOrder: []
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
			// 控制tab切换首项文案显示
			if (this.userInfo['extendData']['projectAudit']) {
				this.tabTitleList[0] = '待复核任务'
			};
			this.getRepairsProjectList({
				proId: this.proId,
				workerId: this.workerId,
				state: -1,
				startDate	: '',
				endDate : '',
				audit: this.userInfo.extendData.projectAudit
			},0,'')
		},
		
		methods: {
			...mapMutations([
				'changeOverDueWay'
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
						return '待确认'
						break;
					case 2 :
						return '待完成'
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
					case 6 :
						return '已取消'
						break;
					case 7 :
						return '已延迟'
						break;
					 case 8 :
						return '待复核'
						break;
				}
			},

			// 管理事件
			managementEvent () {
				this.isManagementClick = !this.isManagementClick;
				let contentBottom = this.$refs.contentBottom;
				if (this.isManagementClick) {
					contentBottom.style.paddingBottom = '78px';
					this.taskMessageList = this.temporaryTaskMessageList.filter((item) => { return item.state == 8 });
					this.taskMessageList.forEach((item) => { return item.checked = false });
				} else {
					contentBottom.style.paddingBottom = 0;
					this.taskMessageList = this.temporaryTaskMessageList
				};
				if (this.taskMessageList.length == 0) {
					
				} else {
					
				}
			},

			// 复选框全选事件
			allChooseEvent () {
				if (this.allChecked) {
					this.taskMessageList.forEach(el => {
						el.checked = true
					})
				} else {
					this.taskMessageList.forEach(el => {
						el.checked = false
					})
				}
			},

			// 完成审核事件
			completeCheckEvent () {
				if (!this.isCheckCanClick) { return };
				if (!this.userInfo.extendData.projectAudit) {
					this.$toast('你暂无此权限!');
					return
				};
				this.checkDialogShow = true;
				this.chooseCheckOrder = this.taskMessageList.filter((item) => { return item.checked == true });
				this.checkOrderCount = this.chooseCheckOrder.length
			},

			// 确定审核事件
			sureCheckEvent () {
				this.checkDialogShow = false;
				this.infoText = '批量审核中,请稍等···';
				this.showLoadingHint = true;
				let temporaryTaskList = [];
				for (let item of this.chooseCheckOrder) {
					temporaryTaskList.push(item.id)
				};
				batchCgeckTask({
					proId: this.proId,
					taskList: temporaryTaskList
				})
				.then((res) => {
					if (res && res.data.code == 200) {
						this.$toast('批量审核成功');
						this.checked = false;
						this.getRepairsProjectList({
							proId: this.proId,
							workerId: this.workerId,
							state: -1,
							startDate	: '',
							endDate : '',
							audit: this.userInfo.extendData.projectAudit
						},0,'审核')
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						})
					};
					this.infoText = '加载中,请稍候····';
					this.showLoadingHint = false;
				})
				.catch((err) => {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					});
					this.infoText = '加载中,请稍候····';
					this.showLoadingHint = false;
				})
			},

			// 下拉刷新事件
			onRefresh() {
				this.getRepairsProjectList ({
					proId: this.proId,
					workerId: this.workerId,
					state: this.currentIndex == 0 ? -1 : -2,
					startDate	: '',
					endDate : '',
					audit: this.userInfo.extendData.projectAudit
				},this.currentIndex,'')
			},

			// 退回原因确定
			reasonSure () {
				if (this.reasonInputValue === '') {
					this.$refs.uToast.show({
						message: '请选择退回原因!',
						position: 'center'
					});
					return
				};
				this.reasonShow = false;
				backRepairsTask({proId:this.proId, taskId:this.taskId,reason:this.reasonInputValue})
				.then((res) => {
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						});
						this.getRepairsProjectList({
							proId: this.proId,
							workerId: this.workerId,
							state: -1,
							startDate	: '',
							endDate : '',
							audit: this.userInfo.extendData.projectAudit
						},0,'')
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
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

			// 退回原因取消
			reasonCancel() {
				this.reasonIndex = '';
				this.reasonName = '';
				this.reasonInputValue = '';
				this.reasonShow = false
			},

			// 原因选中事件
			reasonCheck (item,index) {
				this.reasonIndex = index;
				this.reasonText = item.text;
				this.reasonName = item.text
				this.reasonValue = item.value;
				if (this.reasonInputValue === '') {
					this.reasonInputValue = this.reasonText;
				} else {
					this.reasonInputValue = this.reasonInputValue + ',' + this.reasonText;
				}
			},

			// tab点击事件
			liClickEvent (item,index) {
				this.currentIndex = index;
				this.isManagementClick = false;
				let contentBottom = this.$refs.contentBottom;
				console.log('袁术',contentBottom);
				contentBottom.style.paddingBottom = 0;
				if (index == 0) {
					this.getRepairsProjectList({
						proId: this.proId,
						workerId: this.workerId,
						state: -1,
						startDate	: '',
						endDate : '',
						audit: this.userInfo.extendData.projectAudit
					},index,'')
				} else {
					this.getRepairsProjectList({
						proId: this.proId,
						workerId: this.workerId,
						state: -2,
						startDate	: '',
						endDate : '',
						audit: this.userInfo.extendData.projectAudit
					},index,'')
				}
			},

			// 查询报修项目列表
			getRepairsProjectList (data,index,text) {
				this.showLoadingHint = true;
				queryRepairsProjectList(data)
				.then((res) => {
					this.showLoadingHint = false;
					this.taskMessageList = [];
					this.temporaryTaskMessageList = [];
					this.taskCompleteMessageList = [];
					if(res && res.data.code == 200) {
						this.isRefresh = false;
						if (res.data.data.length > 0) {
							for (let item of res.data.data) {
								if (index == 0) {
									this.taskMessageList.push({
										taskNumber: item.taskNumber,
										taskDesc: item.taskDesc,
										typeName: item.typeName,
										depName: item.depName,
										planStartTime: item.planStartTime,
										planFinishTime: item.planFinishTime,
										createTime: item.createTime,
										state: item.state,
										id: item.id,
										isMe: item.isMe,
										spaces: item.spaces,
										checked: false
									})
								} else {
									this.taskCompleteMessageList.push({
										taskNumber: item.taskNumber,
										taskDesc: item.taskDesc,
										typeName: item.typeName,
										depName: item.depName,
										planStartTime: item.planStartTime,
										planFinishTime: item.planFinishTime,
										createTime: item.createTime,
										state: item.state,
										id: item.id,
										isMe: item.isMe,
										spaces: item.spaces
									})
								}
							};
							this.temporaryTaskMessageList = this.taskMessageList;
							if (text == '审核') {
								if (this.temporaryTaskMessageList.filter((item) => { return item.state == 8 }).length == 0) {
									this.isManagementClick = false
								} else {
									this.isManagementClick = true;
									this.taskMessageList = this.temporaryTaskMessageList.filter((item) => { return item.state == 8 });
								};
								this.allChecked = false;
							}
							// 为房间信息增加check字段
							for (let item of this.taskMessageList) {
								for (let innerItem in item) {
									if (innerItem == 'spaces') {
										for (let medicalItem of item[innerItem]) {
											medicalItem['check'] = false
										}
									}
								}
							};
						} else {
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
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					});
					this.showLoadingHint = false
				})
			},

			// 任务退回
			taskBack (item) {
				this.taskId = item.id;
				this.reasonShow = true;
				this.reasonInputValue = '';
				queryBackRepairsTaskReason({proId:this.proId})
				.then((res) => {
					this.reasonOperationList = [];
					if (res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							for (let item of res.data.data) {
								this.reasonOperationList.push({
									text: item.name,
									value: item.code
								})
							}
						} else {
							this.$refs.uToast.show({
								message: '没有查到退回原因',
								type: 'error',
								position: 'center'
							})
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
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				});
				this.reasonIndex = ''
			},

			// 任务确认
			taskSure (item) {
				sureRepairsTask({
					proId: this.proId, //项目ID 必输
					taskId: item.id, //任务ID 必输
					workerId: this.workerId //用户ID 必输
				})
				.then((res) => {
					if (res && res.data.code == 200) {
						this.getRepairsProjectList({
							proId: this.proId,
							workerId: this.workerId,
							state: -1,
							startDate	: '',
							endDate : '',
							audit: this.userInfo.extendData.projectAudit
						},0,'')
					} else {
						this.$dialog.alert({
							message: `${res.data.msg}`,
							closeOnPopstate: true
						}).then(() => {
						})
					}
				})
				.catch((err) => {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					});
				})
			},

			// 任务查看
			taskView (item) {
				this.changeRepairsWorkOrderMsg(item);
				setStore('repairsWorkOrderMsg',item);
				if (item.state == 2) {
					// 确认任务开始
					this.sureTask({
						proId: this.proId, //项目ID 必输
						taskId: item.id, //任务ID 必输
						workerId: this.workerId //用户ID 必输
					})
				};
				if (item.state == 8) {
					this.$router.push({path: 'workOrderCheck'});
					this.changeTitleTxt({tit:'工单审核'});
					setStore('currentTitle','工单审核');
				} else {
					this.$router.push({path: 'workOrderDetails'});
					this.changeTitleTxt({tit:'工单详情'});
					setStore('currentTitle','工单详情')
				}
			},

			// 确认任务开始
			sureTask (data) {
				sureStartTask(data).then((res) => {
					if(res && res.data.code == 200) {
					}
				})
				.catch((err) => {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
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
			 padding: 10px;
			 box-sizing: border-box;
			 position: relative;
			 background: #F8F8F8;
			.content-top {
				height: 60px;
				 .tab-title {
					 width: 90%;
					 height: 55px;
					 margin: 0 auto;
					 >view {
						float: left;
						font-size: 16px;
						font-weight: 600;
						width: 50%;
						line-height: 55px;
						text-align: center;
						color: #bbbaba
					 };
					 .liStyle {
						color: #2db8f9;
						border-bottom: 1px solid #2db8f9;
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
			 box-sizing: border-box;
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
					 .statusWaitSure {
						 color: red
					 };
					 .statusWaitFinish {
						 color: #2db8f9;
					 };
					 .statusWaitSignature {
						 color: #06e606
					 };
					 .statusWaitCheck {
						 color: orange
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
						 >text {
							 display: inline-block;
							 width: 90px;
							 height: 35px;
							 line-height: 35px;
							 text-align: center;
							 color: #fff
						 };
						 .back {
							 background: #bec7d1
						 };
						 .sure {
							 background: #2db8f9;
						 };
						 .view {
							 background: #2db8f9;
						 }
					 }
					 > view {
						 height: 30px;
						 font-size: 15px;
						 overflow: auto;
						 color: black;
						 font-weight: bold;
					 };
					 .work-order-number {
						 font-size: 14px;
						 color: #bbbaba;
						 display: flex;
						 align-items: center;
						 ::v-deep .u-checkbox {
							 margin-right: 6px;
						 };
						 .name {
							 max-width: 70%;
							 display: inline-block;
							 overflow: auto;
							 vertical-align: top
						 }
					 }
					 &:last-child {
						 margin-bottom: 0
					 }
				 }
			 };
			 .content-list-complete-task-wrapper {
 
			 }
		 };
		 .bottom-check-area {
			 width: 100%;
			 position: fixed;
			 left: 0;
			 bottom: 0;
			 height: 78px;
			 display: flex;
			 justify-content: space-between;
			 padding: 20px 10px;
			 box-sizing: border-box;
			 background: #fff;
			 .check-area-left {
				 height: 37px;
				 display: flex;
				 align-items: center;
				 ::v-deep .u-checkbox {
					 .van-icon {
						 border: 1px solid #3B9DF9 !important
					 }; 
					 .van-checkbox__label {
						 font-size: 14px !important;
						 color: #101010 !important;
					 }
				 }
			 };
			 .check-area-right {
				 width: 140px;
				 height: 37px;
				 text-align: center;
				 line-height: 37px;
				 background: #2C65F7;
				 border-radius: 4px;
				 font-size: 14px;
				 color: #fff;
			 };
			 .checkAreaRightStyle {
				 background: #e4e4e4 !important;
			 }
		 }
		}
	}
</style>
