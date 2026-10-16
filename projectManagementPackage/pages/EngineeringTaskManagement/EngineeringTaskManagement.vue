<template>
	<view class="content-box"
		@touchstart="touchstartHandle" 
		@touchmove="touchmoveHandle"
		@touchend="touchendHandle"
	>
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast" />
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="工程维保任务管理" @backClick="backTo">
				<template slot="right" style="height:24px">
					<image :src="switchShowPng" mode="widthFix" alt="切换显示" @click="onClickRight"></image>
				</template>
			</nav-bar> 
		</view>
		<view class="content">
			<view class="flex-container">
				<view class="tab-list-wrapper">
					<view class="tab-list" v-for="(item,index) in taskTypeList" :key="index" @click="vanTabsChangeEvent(item,index)">
						<text>{{ item.name }}</text>
					</view>
				</view>
				<view class="content-box-inner">
						<view class="task-message-top">
							<view class="message-left">
								<text>当前任务数:</text>
								<text>{{ repairsTaskList.length }}</text>
							</view>
							<view class="message-right">
								<text @click="createTask('报修任务')">创建任务</text>
								<text @click="screenEvent">筛选</text>
							</view>
						</view>
						<u-empty text="暂无数据" mode="list" v-if="repairsTaskEmptyShow"></u-empty>
						 <view class="backlog-task-list-box">
							<view class="backlog-task-list" v-for="(item,index) in repairsTaskList" :key="index" @click="enterRepairsTaskEvent(item,index,'维修任务')">
									<view class="list-top appoint-list-top">
										<view class="list-top-left">
											<image :src="anxiousSignPng" alt="急" v-if="item.priority == 2 || item.priority == 3 || item.priority == 4"></image>
											<text>{{disposeStructureDepName(item)}}</text>
										</view>
										<view class="list-top-right" :class="{'noAllocationStyle':item.state == 0,'noLookupStyle':item.state == 1,'noStartStyle': item.state == 2,'underwayStyle':item.state == 3,'tobeSigned':item.state == 4}">
											{{ taskStatusTransition(item.state) }}
										</view>
									</view>
									<view class="list-center appoint-list-center">
										<view class="center-one-line">
											<view class="center-one-line-left">
												<text>创建时间:</text>
												<text>{{ item.createTime ? item.createTime : '' }}</text>
											</view>
											<view class="center-one-line-right">
												<text>已经历时间:</text>
												<text>{{ elapsedTime(item.planStartTime) }}</text>
											</view>
										</view>
										<view class="center-one-line">
											<view class="center-one-line-left">
												<text>响应时间:</text>
												<text>{{ item.responseTime ? item.responseTime : '' }}</text>
											</view>
											<view class="center-one-line-right">
												<text>开始时间:</text>
												<text>{{ item.startTime ? item.startTime : '' }}</text>
											</view>
										</view>
										<view class="center-one-line">
											<view class="center-one-line-left">
												<text>房间:</text>
												<text>{{ disposeCheckType(item.spaces) }}</text>
											</view>
											<view class="center-one-line-right">
												<text>维修员:</text>
												<text>{{ item.workerName ? item.workerName : '无' }}</text>
											</view>
										</view>
										<view class="issue-image">
											<view class="issue-image-left">
												<text>问题图片:</text>
											</view>
										<view class="issue-image-list" v-if="item.images && item.images.length > 0">
												<view v-for="(innerItem,innerIndex) in item.images" :key="innerIndex" >
														<image alt="" :src="innerItem.path ? innerItem.path : ''" @click.stop="enlareEvent(innerItem.path)"></image>
												</view>
										</view>
										</view>
										<view class="issue-describe">
											<text>问题描述:</text>
											<text>{{ item.taskDesc ? item.taskDesc : '' }}</text>
										</view>
									</view>
									<view class="list-bottom appoint-list-bottom">
										<view class="list-bottom-left">
											<text @click.stop="() => { return }" class="delay-btn" v-if="item.hasDelay == 1">已延迟</text>
											<!-- <text @click.stop="() => { return }" class="allocation-btn" v-if="item.state != 0">已分配</text> -->
										</view>
										<view class="list-bottom-right">
											<text  v-if="item.state == 0" class="operate-one" @click.stop="allocationEvent(item,index,'维修任务')">分配</text>
											<text class="operate-complete"  v-if="item.state == 3" @click.stop="completeTask(item,index)">完成</text>
											<text class="operate-two" @click.stop="editEvent(item,index,'维修任务')">编辑</text>
											<text v-if="item.hasDelay == 0" class="operate-three" @click.stop="delayReasonEvent(item,index,'维修任务')">延迟</text>
											<text class="operate-four" @click.stop="cancelReasonEvent(item,index,'维修任务')">取消</text>
										</view>
									</view>
								</view>
								<u-loadmore :status="status" v-if="repairsTaskList.length > 0" />
						</view>
					</view>
				</view>	
		</view>
		<!-- 筛选弹窗 -->
		<view class="screen-box" v-if="screenDialogShow">
			<u-popup 
				:show="screenDialogShow"
				:round="20"
				:safeAreaInsetBottom="false"
			>
				<view class="dialog-top">
					<view class="select-title">全部筛选</view>
					<u-icon name="close" color="#000000" size="24" @click="closeScreenDialogEvent"></u-icon>
				</view>
				<view class="dialog-center">
					<view class="dialog-center-one-line">
						<view>目的区域选择</view>
						<view>
							<SelectSearch ref="departmentOption" :itemData="startPointDepartmentOption" :curData="startPointDepartmentValue" @change="startPointDepartmentOptionChange" />
						</view>
						<view @click="startPointDepartmentClear">清除</view>
					</view>
					<view class="dialog-center-one-line">
						<view>维修员</view>
						<view>
							<SelectSearch ref="transporterOption" :itemData="transporterOption" :curData="transporterValue" @change="transporterOptionChange" />
						</view>
						<view  @click="transporterValueClear">清除</view>
					</view>
					<view class="priority-box">
						<view class="priority-title">
							优先级
						</view>
						<u-checkbox-group v-model="priorityResult" direction="horizontal">
							<u-checkbox name="1" label="正常" shape="square" iconSize="14" labelSize="16"></u-checkbox>
							<u-checkbox name="2" label="重要" shape="square" iconSize="14" labelSize="16"></u-checkbox>
							<u-checkbox name="3" label="紧急" shape="square" iconSize="14" labelSize="16"></u-checkbox>
							<u-checkbox name="4" label="紧急重要" shape="square" iconSize="14" labelSize="16"></u-checkbox>
						</u-checkbox-group>
					</view>
				</view>
				<view class="dialog-bottom">
					<view class="reset-box" @click="screenDialogCancel">重置</view>
					<view class="sure-box" @click="screenDialogSure">确认</view>
				</view>
			</u-popup>
		</view>
		<!-- 分配弹框 -->
		<view class="allocation-box allocation-box-one" v-if="allocationShow">
			<u-modal :show="allocationShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="allocationDialogSure"
				@cancel="allocationDialogCancel"
				confirmText="确定"
				cancelText="取消"
				:customStyle="{ overflow: 'visible' }"
			>
				<view class="dialog-top">
					请选择分配至
				</view>
				<view class="dialog-center">
					<SelectSearch :itemData="allocationOption" ref="allocationOption" :curData="allocationValue" @change="allocationOptionChange" />
				</view>
			</u-modal>
		</view>
		<!-- 延迟原因弹框 -->
		<view class="allocation-box" v-if="delayReasonShow">
			<u-modal 
				:show="delayReasonShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="delayReasonDialogSure"
				@cancel="delayReasonDialogCancel"
				confirmText="确定"
				cancelText="取消"
				:customStyle="{ overflow: 'visible' }"
			>
				<view class="dialog-top">
					请选择延迟原因
				</view>
				<view class="dialog-center">
					<SelectSearch :itemData="delayReasonOption" ref="delayOption" :isNeedSearch="false" :curData="delayReasonValue" @change="delayReasonOptionChange" />
				</view>
			</u-modal>
		</view>
		 <!-- 取消原因弹框 -->
		<view class="allocation-box" v-if="cancelReasonShow">
			<u-modal 
				:show="cancelReasonShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="cancelReasonDialogSure"
				@cancel="cancelReasonDialogCancel"
				confirmText="确定"
				cancelText="取消"
				:customStyle="{ overflow: 'visible' }"
			>
				<view class="dialog-top">
					请选择取消原因
				</view>
				<view class="dialog-center">
					<SelectSearch :itemData="cancelReasonOption" ref="cancelOption" :isNeedSearch="false" :curData="cancelReasonValue" @change="cancelReasonOptionChange" />
				</view>
			</u-modal>
		</view>
		<!-- 完成确定弹框 -->
		 <view class="complete-box">
			<u-modal 
				:show="completeShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="completeSure"
				@cancel="completeCancel"
				confirmText="取消"
				cancelText="确定"
			>
				<view class="dialog-top">
					信息
				</view>
				 <view class="dialog-center">
					确定要完成么
				</view>
			</u-modal>
		</view>
		<!-- 右侧菜单 -->
		<view class="right-menu-box">
			<u-popup :show="rightMenuShow" @close="rightMenuShow = false" :safeAreaInsetTop="true" mode="right" :round="10">
					<view class="top-icon">
							<image :src="switchHiddenPng" mode="widthFix" alt="切换隐藏" @click="switchHiddenEvent"></image>
					</view>
					<view class="center-content">
							<view class="function-list" :class="{'functionListStyle': functionListIndex == index}" v-for="(item, index) in taskList" :key="index" @click="taskRouterSkip(item.tit,index)">
									{{ item.tit }}
							</view>
					</view>
					<view class="signout-box" @click="signOutEvent">
							下班签退
					</view>
			</u-popup>
		</view>	
		<!-- 图片放大弹框  -->
		<view class="img-dislog-box">
				<u-modal :show="imgBoxShow" @confirm="imgBoxShow = false" confirmText="关闭">
						<image :src="currentImgUrl" mode="widthFix"></image>
				</u-modal> 
		</view>
		<!-- 下班签退弹框  -->
		<view class="signout-modal-box">
			<u-modal :show="modalShow" title="确定签退?" :showCancelButton="true" confirmColor="#2db8f9" @confirm="sureCancel" @cancel="cancelSure"></u-modal>
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
	import { repairsList, assignRepairsTask,queryDepartment,delayRepairsTask, cancelRepairsTask, getTransporter, queryRepairsTaskCancelReason,queryRepairsTaskDelayReason, completeRepairsTask} from '@/api/taskScheduling.js'
	import { userSignOut } from '@/api/login.js'
	import navBar from "@/components/zhouWei-navBar"
	import SelectSearch from "@/components/selectSearch/selectSearch";
	export default {
		components: {
			navBar,
			SelectSearch
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				status: 'nomore',
				modalShow: false,
				refresherEnabled: true,
				scrollTop: 0,
				taskTypeList: [{ name: '报修任务', value: 'repairsTask' }],
				triggered: false,
				isRefreshing: false,
				isDiabledPullRefresh: false,
				isLoadingRepairsTask: false,
				completeShow: false,
				screenDialogShow: false,
				allocationShow: false,
				curentTaskInfo: '',
				delayReasonShow: false,
				cancelReasonShow: false,
				moveInfo: {
					startX: ''
				},
				functionListIndex: 0,
				taskId: '',
				imgBoxShow: false,
				currentImgUrl: '',
				rightMenuShow: false,
				repairsTaskEmptyShow: false,
				isShowDispatchTaskNoMoreData: false,
				isShowAppointTaskNoMoreData: false,
				activeName: 'repairsTask',
				switchShowPng: require("@/static/img/switch-show.png"),
				switchHiddenPng: require("@/static/img/switch-hidden.png"),
				anxiousSignPng: require("@/static/img/anxious-sign.png"),
				taskList: [
					{tit:'调度管理'},
					{tit:'报修任务'},
					{tit:'区域巡检'}
				],
				priorityResult: ['1','2','3','4'],
				startPointDepartmentValue: null,
				startPointDepartmentText: null,
				startPointDepartmentOption: [],
				transporterValue: null,
				transporterText: null,
				transporterOption: [],
				selectAllocation: {},
				allocationValue: null,
				allocationOption:  [],
				selectDelayReason: {},
				delayReasonValue: null,
				delayReasonOption: [],
				repairsDelayReasonOption: [],
				selectCancelReason: {},
				cancelReasonValue: null,
				cancelReasonOption: [],
				repairsCancelReasonOption: [],
				echoRepairsTaskList: [],
				repairsTaskList: []
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'schedulingTaskType',
				'schedulingTaskAboutMessage',
				'operateBtnClickRecord',
				'schedulingTaskDetails'
			]),
			proId () {
				return this.userInfo.extendData.proId
			},
			userName () {
				return this.userInfo.userName
			},
			proName () {
				return this.userInfo.extendData.proName
			},
			workerId () {
				return this.userInfo.extendData.userId
			}
		},
		onShow() {
		  this.refresherEnabled = true;
		},
		onHide() {
			this.refresherEnabled = false;
			this.triggered = false;
			this.isRefreshing = false;
		},
		
		onLoad () {
			this.parallelFunction();
			const pages = getCurrentPages();
			const prevPageInner = pages[pages.length-2];
			if (prevPageInner['route'] == 'pages/index/index') {
			  this.getRepairsList(false)
			} else {
			  // 回显调度页面点击的任务类型
			  if (this.schedulingTaskType.taskTypeName) {
			    this.activeName = this.schedulingTaskType.taskTypeName;
			    this.taskId = this.schedulingTaskDetails.id
			  };
			  if (this.schedulingTaskType.taskTypeName) {
			    if (this.schedulingTaskType.taskTypeName == 'repairsTask') {
			      this.getRepairsList(false)
			    }
			  }
			}
		},
		
		// 监听页面原生下拉刷新
		onPullDownRefresh() {
			this.getRepairsList(true)
		},

		methods: {
			...mapMutations([
				"changeSchedulingTaskType",
				"changeSchedulingTaskAboutMessage",
				"changeOverDueWay",
				"changeSchedulingTaskDetails",
				"changeOperateBtnClickRecord"
			]),
			
			// 顶部导航返回事件
			backTo () {
				this.resetBtnClickStatus();
				uni.navigateBack()
			},
			
			// 加载数据
			loadData () {
				this.getRepairsList(false)
			},
	
			// 完成任务确定事件
			completeCancel () {
				this.completeShow = false;
				this.completeRepairsTaskEvent({
					proId: this.proId,
					taskId: this.taskId
				})
			},
	
			// 完成任务取消事件
			completeSure () {
				this.completeShow = false;
			},
	
			// 维修任务完成事件
			completeTask (item) {
				this.curentTaskInfo = item;
				this.taskId = item.id;
				this.completeShow = true
			},
	
			// 维修任务完成接口
			completeRepairsTaskEvent (data) {
				this.showLoadingHint = true;
				this.infoText = '完成中';
				completeRepairsTask(data)
				.then((res) => {
					this.showLoadingHint = false;
					this.infoText = '';
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
							message: '任务完成成功',
							position: 'center'
						});
						this.taskComplateSuccessOperate();
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						})
					}
				})
				.catch((err) => {
					this.infoText = '';
					this.showLoadingHint = false;
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},
			
			// 处理建筑科室信息
			disposeStructureDepName (item) {
				if (item.structName) {
					if (item['depName'].indexOf('/') != -1) {
						let trmporaryMessage = item['depName'].split("/");
						if (trmporaryMessage.length > 0) {
							return `${trmporaryMessage[0]}/${trmporaryMessage[1]}`
						}
					} else {
						return `${item.structName}/${item.depName}`
					}
				} else {
					if (item['depName'] == '/') {
						return ''
					} else {
						if (item['depName'].indexOf('/') != -1) {
							let trmporaryMessage = item['depName'].split("/");
							if (trmporaryMessage.length > 0) {
								if (trmporaryMessage.length == 2) {
									return item['depName']
								} else {
									return `${trmporaryMessage[0]}/${trmporaryMessage[1]}`	
								}
							}
						}
					}
				}
			},
	
			// 处理维修任务空间信息
			disposeCheckType (item) {
				if (!item) { return '无' };
				if (item.length == 0) { return '无'};
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.name)
				};
				return temporaryArray.join('、')
			},
	
			// 维修任务列表
			getRepairsList (flag) {
				if (!flag) {
					this.showLoadingHint = true;
					this.infoText = '加载中...';
				};
				this.repairsTaskEmptyShow = false;
				repairsList(-3,this.proId,1)
				.then((res) => {
					uni.stopPullDownRefresh();
					this.showLoadingHint = false;
					this.infoText = '';
					if (res && res.data.code == 200) {
						// 是否开启下拉刷新
						if (flag) {
							this.isLoadingRepairsTask = false;
							this.$refs.uToast.show({
								message: '刷新成功',
								position: 'center'
							})
						};
						this.repairsTaskList = res.data.data;
						// 显示未完成(不包括已取消)的任务状态(0-未分配，1-未查阅,2-未开始，3-进行中，4-待签字，5-已完成，6-已取消)
						this.repairsTaskList = this.repairsTaskList.filter(( item ) => { return item.state != 5 && item.state != 6});
						this.echoRepairsTaskList = this.repairsTaskList;
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
					this.infoText = '';
					this.showLoadingHint = false;
					if (flag) {
						this.isLoadingRepairsTask = false;
						return
					};
					uni.stopPullDownRefresh();
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
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
	
			// 并行查询目的地、运送员、任务取消原因、任务延迟原因
			parallelFunction () {
					this.infoText = '加载中...';
					this.showLoadingHint = true;
					Promise.all([this.getAllDestination(),this.queryTransporter(),this.getCancelReason(),this.getDelayReason()])
					.then((res) => {
						this.infoText = '';
						this.showLoadingHint = false;
						if (res && res.length > 0) {
							this.startPointDepartmentOption = [{
								text: '请选择',
								value: null
							}];
							this.transporterOption = [{
								text: '请选择',
								value: null
							}];
							this.allocationOption = [{
								text: '请选择',
								value: null
							}];
							this.repairsCancelReasonOption = [{
								text: '请选择取消原因',
								value: null
							}];
							this.repairsDelayReasonOption = [{
								text: '请选择延迟原因',
								value: null
							}];
							let [item1,item2,item3,item4] = res;
							if (item1) {
								item1.forEach((item,index) => {
									// 起点科室
									this.startPointDepartmentOption.push({
										text: item['departmentName'],
										value: item['id']
									})
								})
							};
							if (item2) {
								for (let i = 0, len = item2.length; i < len; i++) {
									this.transporterOption.push({
										text: item2[i].workerName,
										value: item2[i]['id'],
										id: i
									});
									this.allocationOption.push({
										text: item2[i].workerName,
										value: item2[i]['id'],
										id: i
									})
								};
								// 保存运送员列表信息
								let temporaryMessage = this.schedulingTaskAboutMessage;
								temporaryMessage['allocationOption'] = this.allocationOption;
								this.changeSchedulingTaskAboutMessage(temporaryMessage)
							};
							if (item3) {
								for (let i = 0, len = item3.length; i < len; i++) {
									this.repairsCancelReasonOption.push({
										text: item3[i]['cancelName'],
										value: item3[i]['id']
									})
								};
								// 保存任务取消原因列表信息
								let temporaryMessage = this.schedulingTaskAboutMessage;
								temporaryMessage['repairsCancelReasonOption'] = this.repairsCancelReasonOption;
								this.changeSchedulingTaskAboutMessage(temporaryMessage)
							};
							if (item4) {
								for (let i = 0, len = item4.length; i < len; i++) {
									this.repairsDelayReasonOption.push({
										text: item4[i]['delayName'],
										value: item4[i]['id']
									})
								};
							// 保存任务延迟原因列表信息
								let temporaryMessage = this.schedulingTaskAboutMessage;
								temporaryMessage['repairsDelayReasonOption'] = this.repairsDelayReasonOption;
								this.changeSchedulingTaskAboutMessage(temporaryMessage)
							}
						};
						// 根据任务详情页面点击的按钮,显示对应的弹框及为对应的弹框列表数据赋值
					//   if (this.operateBtnClickRecord) {
					//     if (this.operateBtnClickRecord['allocationBtnClick']) {
					//       this.allocationShow = true
					//     } else if (this.operateBtnClickRecord['delayBtnClick']) {
					//       if (this.activeName == 'repairsTask') {
					//         this.delayReasonOption = this.repairsDelayReasonOption
					//       };
					//       this.delayReasonShow = true
					//     } else if (this.operateBtnClickRecord['cancelBtnClick']) {
					//       if (this.activeName == 'repairsTask') {
					//         this.cancelReasonOption = this.repairsCancelReasonOption
					//       };
					//       this.cancelReasonShow = true
					//     }
					//   };
					})
					.catch((err) => {
						this.infoText = '';
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						})
					})
				},
			
			 // 查询科室
			getAllDestination () {
				return new Promise((resolve,reject) => {
					queryDepartment(this.proId,'').then((res) => {
						if (res && res.data.code == 200) {
							resolve(res.data.data)
						}
					})
					.catch((err) => {
						reject(err)
					})
				})
			},
	
			// 查询运送员
			queryTransporter () {
				return new Promise((resolve,reject) => {
					getTransporter(this.proId, this.workerId)
					.then((res) => {
						if (res && res.data.code == 200) {
							resolve(res.data.data)
						}
					})
					.catch((err) => {
						reject(err)
					})
				})
			},
	
			// 获取取消原因列表
			getCancelReason (type) {
				 return new Promise((resolve,reject) => {
					queryRepairsTaskCancelReason(this.proId)
					.then((res) => {
						if (res && res.data.code == 200) {
							resolve(res.data.data)
						}
					})
					.catch((err) => {
						reject(err)
					})
				})
			},
	
			// 获取延迟原因列表
			getDelayReason (type) {
				 return new Promise((resolve,reject) => {
					queryRepairsTaskDelayReason(this.proId)
					.then((res) => {
						if (res && res.data.code == 200) {
							resolve(res.data.data)
						}
					})
					.catch((err) => {
						reject(err)
					})
				})
			},
	
			// 处理空间信息
			disposeTaskPresent (item) {
				if (!item) { return};
				if (item.length == 0) { return};
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.text)
				};
				return temporaryArray.join('、')
			},
	
			// 滑动开始（直接接收事件对象 e）
			touchstartHandle(e) {
				// uni-app 中统一使用 e.touches
				if (e.touches.length === 1) {
					this.moveInfo.startX = e.touches[0].clientX;
				}
			},
		
			// 滑动中（直接接收事件对象 e）
			touchmoveHandle(e) {
				if (this.screenDialogShow || this.allocationShow || this.delayReasonShow || this.cancelReasonShow || this.completeShow) {
					return;
				};
				if (e.touches.length === 1) {
					// 滑动距离
					let moveX = e.touches[0].clientX - this.moveInfo.startX;
					
					// 左滑（显示右侧菜单）
					if (moveX < -50) {
						if (this.rightMenuShow) return;
						this.rightMenuShow = true;
						this.functionListIndex = this.functionListIndex != 0 ? 0 : this.functionListIndex;
					} 
					// 右滑（隐藏右侧菜单）
					else if (moveX > 50) {
						if (!this.rightMenuShow) return;
						this.rightMenuShow = false;
					}
				}
			},
			
			// 补充滑动结束事件
			touchendHandle(e) {
				// 可以在这里做一些收尾逻辑，比如回弹动画等
				this.moveInfo.startX = 0;
			},

			// 图片放大事件
			enlareEvent (item) {
				this.currentImgUrl = item;
				this.imgBoxShow = true
			},
			
			// 任务分配成功后更新任务状态为未查阅-1
			taskAllocationSuccessOperate () {
				let currentOrderIndex = this.repairsTaskList.findIndex((item) => { return item.id == this.taskId });
				if (currentOrderIndex != -1) {
					this.$set(this.repairsTaskList[currentOrderIndex],'state',1);
				}
			},
			
			// 任务延迟成功后更新延迟状态hasDelay为-1
			taskDelaySuccessOperate () {
				let currentOrderIndex = this.repairsTaskList.findIndex((item) => { return item.id == this.taskId });
				if (currentOrderIndex != -1) {
					this.$set(this.repairsTaskList[currentOrderIndex],'hasDelay',1)
				}
			},
			
			// 任务取消后删除该条任务
			taskCancelSuccessOperate () {
				let currentOrderIndex = this.repairsTaskList.findIndex((item) => { return item.id == this.taskId });
				if (currentOrderIndex != -1) {
					this.repairsTaskList.splice(currentOrderIndex,1)
				}
			},
			
			// 任务完成成功后删除该条任务
			taskComplateSuccessOperate () {
				let currentOrderIndex = this.repairsTaskList.findIndex((item) => { return item.id == this.taskId });
				if (currentOrderIndex != -1) {
					this.repairsTaskList.splice(currentOrderIndex,1)
				}
			},
	
			// 筛选事件
			screenEvent () {
				this.screenDialogShow = true
			},
	
			// 筛选弹框起点科室下拉框值清除事件
			startPointDepartmentClear () {
				this.$refs['departmentOption'].clearSelectValue()
			},
	
			// 筛选弹框运送员下拉框值清除事件
			transporterValueClear () {
				this.$refs['transporterOption'].clearSelectValue()
			},
	
			// 筛选弹框目的科室下拉框选值变化事件
			startPointDepartmentOptionChange (item) {
				this.startPointDepartmentValue = item.value;
				this.startPointDepartmentText = item.text
			},
	
			// 筛选弹框运送员下拉框选值变化事件
			transporterOptionChange (item) {
				this.transporterValue = item.value;
				this.transporterText = item.text
			},
	
			// 根据科室名称获取科室id
			getCurrentDepartmentIdByName(text) {
				if (!text) { return null};
				return this.startPointDepartmentOption.filter((item) => {return item['text'] == text })[0]['value']
			},
	
			// 筛选弹框确定事件
			screenDialogSure () {
				this.screenDialogShow = false;
				try {
					if (this.activeName == 'repairsTask') {
							if (!this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length == 0) {
									this.repairsTaskList = this.echoRepairsTaskList;
									if (this.repairsTaskList.length == 0) {
											this.repairsTaskEmptyShow = true
									} else {
											this.repairsTaskEmptyShow = false
									}
								} else {
								this.repairsTaskList = this.echoRepairsTaskList.filter((item) => {
										if (this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length > 0) {
											if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
												return item['depName'] == this.startPointDepartmentText &&
												item['workerName'] == this.transporterText &&
												this.priorityResult.indexOf(item.priority.toString()) != -1
											} else {
												if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
														return item['depName'].split('/')[1] == this.startPointDepartmentText &&
														item['workerName'] == this.transporterText &&
														this.priorityResult.indexOf(item.priority.toString()) != -1
												} else {
													return item['depName'] == this.startPointDepartmentText &&
													item['workerName'] == this.transporterText &&
													this.priorityResult.indexOf(item.priority.toString()) != -1
												}
											}
										} else {
												if (this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length == 0) {
													if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
														return item['depName'] == this.startPointDepartmentText
													} else {
														if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
															return item['depName'].split('/')[1] == this.startPointDepartmentText
														} else {
															return item['depName'] == this.startPointDepartmentText
														}
													}
												};
												if (!this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length == 0) {
													item['workerName'] == this.transporterText
												};
												if (!this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length > 0) {
													return this.priorityResult.indexOf(item.priority.toString()) != -1
												};
												if (this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length == 0) {
													if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
														return item['depName'] == this.startPointDepartmentText && item['workerName'] == this.transporterText
													} else {
														if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
															return item['depName'].split('/')[1] == this.startPointDepartmentText && item['workerName'] == this.transporterText
														} else {
															return item['depName'] == this.startPointDepartmentText && item['workerName'] == this.transporterText
														}
													}
												};
												if (this.startPointDepartmentValue && !this.transporterValue && this.priorityResult.length > 0) {
													if (item['depName'] == '/' || !item['depName'] || item['depName'].indexOf('//') != -1) {
														return item['depName'] == this.startPointDepartmentText && this.priorityResult.indexOf(item.priority.toString()) != -1
													} else {
														if (item['depName'].split('/').length >= 2 && item['depName'].split('/')[1]) {
															return item['depName'].split('/')[1] == this.startPointDepartmentText && this.priorityResult.indexOf(item.priority.toString()) != -1
														} else {
															return item['depName'] == this.startPointDepartmentText && this.priorityResult.indexOf(item.priority.toString()) != -1
														}
													}
												};
												if (!this.startPointDepartmentValue && this.transporterValue && this.priorityResult.length > 0) {
													return item['workerName'] == this.transporterText && this.priorityResult.indexOf(item.priority.toString()) != -1
												};
										}
								});
								if (this.repairsTaskList.length == 0) {
										this.repairsTaskEmptyShow = true
								} else {
										this.repairsTaskEmptyShow = false
								}
							}
					}
				} catch (err) {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				}  
			},
	
			// 筛选弹框取消事件
			screenDialogCancel () {
				this.$refs['departmentOption'].clearSelectValue();
				this.$refs['transporterOption'].clearSelectValue();
				this.priorityResult = ['1','2','3','4']
			},
	
			// 关闭筛选弹框
			closeScreenDialogEvent () {
				this.screenDialogShow = false
			},
	
			// 分配点击事件
			allocationEvent (item,index,text) {
				this.curentTaskInfo = item;
				this.allocationShow = true;
				this.taskId = item.id;
			},
	
			// 分配弹框运送员下拉框选值变化事件
			allocationOptionChange (item) {
				this.selectAllocation = item
			},
	
			// 分配弹框确定事件
			allocationDialogSure () {
				if (this.selectAllocation.value == null) {
					this.$refs.uToast.show({
						message: '请选择运送员',
						type: 'error',
						position: 'center'
					});
					return 
				};
				this.allocationShow = false;
				this.showLoadingHint = true;
				this.infoText = '分配中...';
					if (this.activeName == 'repairsTask') {
					assignRepairsTask({
							id: this.taskId, //任务id
							proId: this.proId, //项目id
							isMe: this.curentTaskInfo['isMe'], // 是否我方
							taskNumber: this.curentTaskInfo['taskNumber'], // 任务编号
							present: this.curentTaskInfo['present'], //参与者
							workerId: this.selectAllocation['value'], //运送员id
							workerName: this.selectAllocation['text'] //运送员姓名
						})
						.then((res) => {
							this.showLoadingHint = false;
							this.infoText = '';
							if (res && res.data.code == 200) {
								this.$refs.uToast.show({
									message: '分配成功',
									position: 'center'
								});
								this.taskAllocationSuccessOperate()
							} else {
								this.$refs.uToast.show({
									message: res.data.msg,
									type: 'error',
									position: 'center'
								})
							}
						})
						.catch((err) => {
							this.infoText = '';
							this.showLoadingHint = false;
							this.$refs.uToast.show({
								message: err,
								type: 'error',
								position: 'center'
							})
					})
				}
			},
	
			// 分配弹框取消事件
			allocationDialogCancel () {
				this.allocationShow = false
			},
	
			// 编辑点击事件
			editEvent (item,index,text) {
				let temporaryTaskType = this.schedulingTaskType;
				if (text == '维修任务') {
					temporaryTaskType['taskTypeName'] = 'repairsTask';
					temporaryTaskType['editSource'] = 'list';
					uni.navigateTo({
						url: '/projectManagementPackage/pages/EngineeringTaskManagement/EditRepairsTask'
					})
				};
				// 保存调度页面任务详情
				this.changeSchedulingTaskDetails(item);
				// 保存调度页面任务点击的类型
				this.changeSchedulingTaskType(temporaryTaskType)
				this.resetBtnClickStatus()
			},
	
			// 延迟点击事件
			delayReasonEvent(item,index,text) {
				this.delayReasonShow = true;
				this.curentTaskInfo = item;
				this.taskId = item.id;
				if (this.activeName == 'repairsTask') {
					this.delayReasonOption = this.repairsDelayReasonOption
				}
			},
	
			// 延迟原因弹框下拉框选值变化事件
			delayReasonOptionChange (item) {
				this.selectDelayReason = item
			},
	
			// 延迟原因弹框确定事件
			delayReasonDialogSure () {
				if (this.selectDelayReason.value == null) {
					this.$refs.uToast.show({
						message: '请选择延迟原因',
						type: 'error',
						position: 'center'
					});
					return 
				};
				this.delayReasonShow = false;
				this.showLoadingHint = true;
				this.infoText = '延迟中...';
				// 维修任务延迟
				if (this.activeName == 'repairsTask') {
					delayRepairsTask({
							taskId: this.taskId, //任务id
							proId: this.proId, // 医院id
							reason: this.selectDelayReason['text'], //延迟原因
							state: 7
						})
						.then((res) => {
							this.showLoadingHint = false;
							this.infoText = '';
							if (res && res.data.code == 200) {
								this.$refs.uToast.show({
									message: '延迟成功',
									position: 'center'
								});
								this.taskDelaySuccessOperate()
							} else {
								this.$refs.uToast.show({
									message: res.data.msg,
									type: 'error',
									position: 'center'
								})
							}
						})
						.catch((err) => {
							this.infoText = '';
							this.showLoadingHint = false;
							this.$refs.uToast.show({
								message: err,
								type: 'error',
								position: 'center'
							})
					})
				}
			},
	
			// 延迟原因弹框取消事件
			delayReasonDialogCancel () {
				this.delayReasonShow = false
			},
	
			// 取消点击事件
			cancelReasonEvent(item,index,text) {
				this.cancelReasonShow = true;
				this.curentTaskInfo = item;
				this.taskId = item.id;
				if (this.activeName == 'repairsTask') {
					this.cancelReasonOption = this.repairsCancelReasonOption
				}
			},
	
			// 取消原因弹框下拉框选值变化事件
			cancelReasonOptionChange (item) {
				this.selectCancelReason = item
			},
	
	
			// 取消原因弹框确定事件
			cancelReasonDialogSure () {
				if (this.selectCancelReason.value == null) {
					this.$refs.uToast.show({
						message: '请选择取消原因',
						type: 'error',
						position: 'center'
					});
					return 
				};
				this.cancelReasonShow = false;
				this.showLoadingHint = true;
				this.infoText = '取消中...';
				// 维修任务取消
				if (this.activeName == 'repairsTask') {
					cancelRepairsTask({
							taskId: this.taskId, //任务id
							state: 6,
							proId: this.proId, // 医院id
							reason: this.selectCancelReason['text'] //取消原因
						})
						.then((res) => {
							this.showLoadingHint = false;
							this.infoText = '';
							if (res && res.data.code == 200) {
								this.$refs.uToast.show({
									message: '取消成功',
									position: 'center'
								});
								this.taskCancelSuccessOperate()
							} else {
								this.$refs.uToast.show({
									message: res.data.msg,
									type: 'error',
									position: 'center'
								})
							}
						})
						.catch((err) => {
							this.infoText = '';
							this.showLoadingHint = false;
							this.$refs.uToast.show({
								message: err,
								type: 'error',
								position: 'center'
							})
					})
				}
			},
	
			// 取消原因弹框取消事件
			cancelReasonDialogCancel () {
				this.cancelReasonShow = false
			},
	
	
			// 切换显示右侧菜单事件
			onClickRight () {
				this.rightMenuShow = true;
				this.functionListIndex = this.functionListIndex != 0 ? 0 : this.functionListIndex;
			},
	
			// 切换隐藏右侧菜单事件
			switchHiddenEvent () {
				this.rightMenuShow = false
			},
	
			// 进入任务详情事件
			enterRepairsTaskEvent (item,index,text) {
				this.taskId = item.id;
				let temporaryTaskType = this.schedulingTaskType;
				if (text == '维修任务') {
					temporaryTaskType['taskTypeName'] = 'repairsTask';
					uni.navigateTo({
						url: '/projectManagementPackage/pages/EngineeringTaskManagement/SchedulingRepairsTaskDetails'
					})
				};
				// 保存调度页面任务详情
				this.changeSchedulingTaskDetails(item);
				// 保存调度页面任务点击的类型
				this.changeSchedulingTaskType(temporaryTaskType);
				this.resetBtnClickStatus()
			},
	
			// 重置按钮点击状态
			resetBtnClickStatus () {
				let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
				temporaryOperateBtnClickRecord['delayBtnClick'] = false;
				temporaryOperateBtnClickRecord['allocationBtnClick'] = false;
				temporaryOperateBtnClickRecord['cancelBtnClick'] = false;
				this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord)
			},
	
			// 创建任务
			createTask (text) {
				let temporaryTaskType = this.schedulingTaskType;
					if (text == '报修任务') {
					temporaryTaskType['taskTypeName'] = 'repairsTask';
					uni.navigateTo({
						url: '/projectManagementPackage/pages/EngineeringTaskManagement/CreateRepairsTask'
					})
				};
				// 保存调度页面任务点击的类型
				this.changeSchedulingTaskType(temporaryTaskType)
				this.resetBtnClickStatus()
			},
	
			// 右侧菜单任务列表点击事件
			taskRouterSkip (name, index) {
					this.functionListIndex = index;
					this.rightMenuShow = false;
					if (name === '报修任务') {
						this.resetBtnClickStatus();
						uni.navigateTo({
							url: '/projectManagementPackage/pages/RepairsWorkOrder/RepairsWorkOrder'
						})
					} else if (name === '区域巡检') {
						this.resetBtnClickStatus();
						uni.navigateTo({
							url: '/projectManagementPackage/pages/DepartmentService/DepartmentService'
						})
					} else if (name === '调度管理') {
					}
				},
	
				// 下班签退事件
				signOutEvent () {
					this.modalShow = true;
				},
				
				// 签退确定事件
				sureCancel () {
					this.modalShow = false;
					this.userLoginOut(this.proId, this.userInfo.userName)
				},
				
				// 签退取消事件
				cancelSure () {
					this.modalShow = false;
				},
				
				// 用户签退
				userLoginOut (proId,workerId) {
					this.showLoadingHint = true;
					this.infoText = '退出登录中...';
					this.changeOverDueWay(true);
					userSignOut(proId,workerId).then((res) => {
						if (res && res.data.code == 200) {
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
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'center'
							});
							this.changeOverDueWay(false)
						};
						this.showLoadingHint = false;
					}).
					catch((err) => {
						this.changeOverDueWay(false);
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						})
					})
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
					default:
						return ''
				}
			},
	
			// tab切换值变化事件
			vanTabsChangeEvent (item,index) {
				if (item['value'] == 'repairsTask') {
					this.getRepairsList(false)
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
		::v-deep .u-toast{
			.u-transition {
				z-index: 1000000 !important;
			}
		};
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
		.img-dislog-box {
			::v-deep .u-modal {
				top: 50% !important;
				.u-modal__content {
					max-height: 70vh;
					overflow: auto;
					padding: 0 !important;
					>image {
						width: 100%;
					}
				}
			}
		};
		.screen-box {
			::v-deep .u-popup {
				.u-popup__content {
					padding: 0 20px 10px 20px !important;
					box-sizing: border-box;
				  width: 100%;
					.dialog-top {
						height: 60px;
						position: relative;
						display: flex;
						align-items: center;
						justify-content: center;
						.select-title {
							font-size: 18px;
							color: #101010;
							text-align: center
						};
						.u-icon {
							position: absolute;
							top: 50%;
							transform: translateY(-50%);
							right: 0
						}
					};
					.dialog-center {
						margin-bottom: 30px;
						.dialog-center-one-line {
							display: flex;
							align-items: center;
							justify-content: space-between;
							margin-bottom: 10px;
							>view {
								&:nth-child(1) {
									width: 30%;
									font-size: 14px;
									color: #101010;
									font-weight: bold
								};
								&:nth-child(2) {
									flex: 1;
									margin: 0 10px;
								};
								&:nth-child(3) {
									color: #fff;
									font-size: 12px;
									padding: 4px;
									box-sizing: border-box;
									background: #E86F50
								}
							};
							.vue-dropdown {
								width: 100%
							}
						};
						.priority-box {
							.priority-title {
								font-size: 14px;
								color: #101010;
								font-weight: bold;
								padding-top: 10px;
								margin-bottom: 20px
							};
							.u-checkbox-group {
								display: flex;
								justify-content: space-between;
								.u-checkbox {
									.u-checkbox__label {
										margin-right: 9px;
									}
								}
							}
						}
					};
					.dialog-bottom {
						display: flex;
						align-items: center;
						justify-content: center;
						height: 90px;
						.reset-box {
							flex: 1;
							height: 50px;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-right: 20px;
							box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
							background: #fff;
							border-radius: 30px;
							margin-right: 20px;
							color: #1864FF
						};
						.sure-box {
							flex: 1;
							height: 50px;
							display: flex;
							align-items: center;
							justify-content: center;
							background: linear-gradient(to right, #6cd2f8, #2390fe);
							box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
							border-radius: 30px;
							color: #fff;
						}
					}
				}
			}
		};
		.complete-box {
			 ::v-deep .u-modal {
				.u-modal__content {
						padding: 0 !important;
						box-sizing: border-box;
						flex-direction: column !important;
						.dialog-top {
							height: 40px;
							padding-left: 10px;
							position: relative;
							display: flex;
							align-items: center;
							font-size: 14px;
							color: #fff;
							background: #3B9DF9;
							text-align: left
						};
						.dialog-center {
							height: 8vh;
							text-align: center;
							line-height: 8vh;
							margin: 0 auto;
							margin-top: 20px
						}
				};
				.u-line {
					display: none !important;
				};
				.u-modal__button-group {
					padding: 20px !important;
					box-sizing: border-box;
					justify-content: center;
					.u-line {
						display: none !important;
					};
					.u-modal__button-group__wrapper--cancel {
						height: 40px;
						line-height: 40px;
						flex: none !important;
						width: 40%;
						background: #3B9DF9;
						border-radius: 10px;
						margin-right: 30px;
						.u-modal__button-group__wrapper__text {
							color: #fff !important;
						}
					};
					.u-modal__button-group__wrapper--confirm {
						width: 40%;
						height: 40px;
						line-height: 40px;
						background: #fff;
						flex: none !important;
						border-radius: 10px;
						border: 1px solid #3B9DF9;
						 .u-modal__button-group__wrapper__text {
								color: #3B9DF9 !important;
						 }
					}
				}
			}
		};
		.allocation-box {
			::v-deep .u-modal {
				.u-modal__content {
						padding: 0 !important;
						box-sizing: border-box;
						flex-direction: column !important;
						overflow: visible !important;
						.dialog-top {
							height: 40px;
							padding-left: 10px;
							position: relative;
							display: flex;
							align-items: center;
							font-size: 14px;
							color: #fff;
							background: #3B9DF9;
							text-align: left
						};
						.dialog-center {
							width: 80%;
							height: 20vh;
							margin: 0 auto;
							margin-top: 20px
						}
				};
				.u-modal__content__text {
				  overflow: visible !important;
				};	
				.u-line {
					display: none !important;
				};
				.u-modal__button-group {
					padding: 20px !important;
					box-sizing: border-box;
					justify-content: center;
					.u-line {
						display: none !important;
					};
					.u-modal__button-group__wrapper--cancel {
						width: 40%;
						height: 40px;
						line-height: 40px;
						background: #fff;
						flex: none !important;
						border-radius: 10px;
						border: 1px solid #3B9DF9;
						margin-right: 30px;
						.u-modal__button-group__wrapper__text {
								color: #3B9DF9 !important;
						}
					};
					.u-modal__button-group__wrapper--confirm {
						 height: 40px;
						 line-height: 40px;
						 flex: none !important;
						 width: 40%;
						 background: #3B9DF9;
						 border-radius: 10px;
						 .u-modal__button-group__wrapper__text {
								color: #fff !important;
						 }
					}
				}
			}  
		};
		.allocation-box-one {
			::v-deep .dialog-center {
				.list-module {
					max-height: 260px !important
				}
			}
		};
		.right-menu-box {
			::v-deep .u-popup {
				.u-popup__content {
					padding: 20px 0 80px 0;
					box-sizing: border-box;
					width: 30vh;
				};
				.top-icon {
					padding-left: 10px;
					box-sizing: border-box;
					>image {
						width: 24px;
					}
				};
				.center-content {
					margin-top: 20px;
					.function-list {
						width: 153px;
						height: 40px;
						line-height: 40px;
						text-align: center;
						margin: 0 auto;
						border: 1px solid #3B9DF9;
						box-sizing: border-box;
						font-size: 16px;
						color: #3B9DF9;
						border-radius: 8px;
						margin-bottom: 20px
					};
					.functionListStyle {
						color: #fff !important;
						border: none !important;
						background: #3B9DF9 !important
					}
				};
				.signout-box {
					position: absolute;
					bottom: 80px;
					left: 50%;
					transform: translateX(-50%);
					width: 153px;
					height: 40px;
					line-height: 40px;
					text-align: center;
					background: #E86F50;
					font-size: 16px;
					color: #fff;
					border-radius: 8px
				}
			}
		};	
		.top-background-area {
			width: 100%;
			background: #3890EE;
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10
		};
		.nav {
			width: 100%;
			.header_right_info {
				image {
					width: 24px !important;
				}
			}
		};
		.content {
			 flex: 1;
			 height: 0;
			 display: flex;
			 flex-direction: column;
			 .flex-container {
					height: 100%;
					display: flex;
					flex-direction: column;
					.tab-list-wrapper {
						width: 100%;
						height: 52px;
						padding: 0 20px;
						box-sizing: border-box;
						display: flex;
						align-items: center;
						overflow-x: auto;
						white-space: nowrap;
						.tab-list {
							width: 180px;
							height: 32px;
							text-align: center;
							line-height: 32px;
							background: #fff;
							border-radius: 4px;
							>text {
								font-size: 14px;
								color: #174e97;
							}
						}
					}
			 };
			 .content-box-inner {
				 flex: 1;
				 height: 0;
				 display: flex;
				 flex-direction: column;
				 position: relative;
				 ::v-deep .u-empty {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%,-50%)
				 };
				 .task-message-top {
					 width: 100%;
					 padding: 0 8px;
					 margin-bottom: 10px;
					 height: 42px;
					 display: flex;
					 justify-content: space-between;
					 align-items: center;
					 box-sizing: border-box;
					 background: #fff;
					 .message-left {
						 >text {
							 font-size: 14px;
							 &:nth-child(1) {
								 color: #4B4B4B
							 };
							 &:nth-child(2) {
								 color: #3B9DF9
							 }
						 }
					 };
					 .message-right {
						 flex: 1;
						 display: flex;
						 justify-content: flex-end;
						 >text {
							 display: inline-block;
							 width: 76px;
							 height: 26px;
							 border-radius: 6px;
							 text-align: center;
							 line-height: 26px;
							 font-size: 14px;
							 &:nth-child(1) {
								 color: #fff;
								 background: #3B9DF9;
								 margin-right: 8px;
							 };
							 &:nth-child(2) {
								 color: #3B9DF9;
								 background: #fff;
								 box-sizing: border-box;
								 border: 1px solid #3B9DF9
							 }
						 }
					 }
				 };
				 .backlog-task-list-box {
						 flex: 1;
						 height: 100%;
						 overflow-y: auto;
						 -webkit-overflow-scrolling: touch;
						 .backlog-task-list {
								 padding: 2px 8px 4px 8px;
								 box-sizing: border-box;
								 border-radius: 6px;
								 background: #fff;
								 box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.23);
								 margin-bottom: 10px;
								 .list-top {
									 display: flex;
									 justify-content: space-between;
									 align-items: center;
									 height: 40px;
									 .list-top-left {
										 flex: 1;
										 font-size: 14px;
										 color: #101010;
										 display: flex;
										 align-items: center;
										 image {
											 width: 40px;
											 height: 40px;
											 margin-right: 2px;
											 margin-left: -6px;
										 };
										 >text {
											 display: inline-block;
											 &:nth-child(2) {
												 margin-right: 8px
											 };
											 &:nth-child(3) {
												 height: 20px;
												 padding-left: 8px;
												 line-height: 20px;
												 border-left: 1px solid #BBBBBB
											 }
										 }  
									 };
									 .list-top-right {
										 font-size: 16px;
										 color: #E86F50
									 };
									 .noAllocationStyle {
										 color: #E86F50 !important
									 };
									 .noLookupStyle {
										 color: #E8CB51 !important
									 };
									 .noStartStyle {
										 color: #174E97 !important
									 };
									 .underwayStyle {
										 color: #289E8E !important
									 };
									 .tobeSigned {
										 color: #40f9e0 !important
									 }
								 };
								 .list-center {
									 display: flex;
									 justify-content: space-between;
									 align-items: center;
									 margin: 8px 0;
									 .list-center-left {
										 flex: 1;
										 font-size: 14px;
										 color: #101010;
										 display: flex;
										 align-items: center;
										 margin-right: 6px;
										 width: 0;
										 >view {
											 width: 0;
											 display: flex;
											 flex: 1;
											 align-items: center;
											 >text {
												 font-weight: bold;
												 display: inline-block;
												 &:nth-child(1) {
													 margin-right: 8px
												 };
												 &:nth-child(2) {
													 flex: 1;
													 @include no-wrap;
													 height: 20px;
													 padding-left: 8px;
													 line-height: 20px;
													 border-left: 1px solid #BBBBBB
												 }
											 }
										 }    
									 };
									 .list-center-right {
										 
									 }
								 };
								 .list-bottom {
									 display: flex;
									 justify-content: space-between;
									 align-items: center;
									 height: 40px;
									 .list-bottom-left {
										 flex: 1;
										 font-size: 14px;
										 color: #101010;
										 display: flex;
										 align-items: center;
										 >text {
											 font-weight: bold;
											 display: inline-block;
											 color: #fff;
											 border-radius: 16px;
											 font-size: 12px;
											 width: 54px;
											 height: 25px;
											 text-align: center;
											 line-height: 25px;
											 &:nth-child(1) {
												 margin-right: 4px;
												 background: #F2A15F
											 };
										 };
										 .delay-btn {
											 margin-right: 4px;
											 background: #174E97
										 };
										 .allocation-btn {
											 background: #ffb77d
										 };
										 .listBottomLeftStyle {
											 color: #F2A15F !important;
											 border: 1px solid #F2A15F;
											 background: #fff !important;
											 box-sizing: border-box
										 }  
									 };
									 .list-bottom-right {
										 >text {
											 font-weight: bold;
											 display: inline-block;
											 color: #fff;
											 border-radius: 10px;
											 font-size: 14px;
											 width: 48px;
											 height: 26px;
											 text-align: center;
											 line-height: 26px;
											 box-sizing: border-box;
											 border-radius: 2px;
											 margin-right: 4px
										 };
										 .operate-complete {
											 color: #289E8E;
											 border: 1px solid #289E8E
										 };
										 .operate-one {
											 color: #F2A15F;
											 border: 1px solid #F2A15F
										 };
										 .operate-two {
											 color: #174E97;
											 border: 1px solid #174E97
										 };
										 .operate-three {
											 color: #254550;
											 border: 1px solid #254550
										 };
										 .operate-four {
											 color: #E86F50;
											 border: 1px solid #E86F50;
											 margin-right: 0
										 }                   
									 }
								 };
								 .appoint-list-top {
									 padding: 4px 0;
									 @include bottom-border-1px(#afafaf);
									 .list-top-left {
										 >text {
											 font-weight: bold
										 }
									 }
								 };
								 .appoint-list-center {
									 margin-top: 0;
									 flex-direction: column;
									 .center-one-line {
										 display: flex;
										 width: 100%;
										 line-height: 20px;
										 margin-top: 10px;
										 .center-one-line-left {
											 flex: 1;
											 word-break: break-all;
											 margin-right: 6px
										 };
										 .center-one-line-checkItem {

										 };
										 .center-one-line-right {
											 flex: 1;
											 word-break: break-all
										 }
									 };
									 .issue-image {
										 display: flex;
										 width: 100%;
										 margin-top: 10px;
										 align-items: center;
										 .issue-image-left {

										 };
										 .issue-image-list {
											 flex: 1;
											 display: flex;
											 flex-flow: row wrap;
											 margin-left: 6px;
											 > view {
												 width: 22%;
												 height: 80px;
												 margin-right: 4%;
												 margin-bottom: 10px;
												 &:nth-child(4n) {
														 margin-right: 0
												 }
												 >image {
													 width: 100%;
													 height: 100%;
												 }
											 }
										 }
									 };
									 .issue-describe {
										 display: flex;
										 width: 100%;
										 margin-top: 10px;
										 >text {
												 line-height: 20px;
												 &:nth-child(2) {
														 flex: 1;
														 word-break: break-all;
												 }
										 }
									 }
								 };
								 .appoint-list-bottom {
									 .list-bottom-left {
										 .delay-btn {
											 background: #174E97 !important
										 };
										 .allocation-btn {
											 background: #ffb77d !important
										 }
									 }
								 }   
						 };
						 .no-more-data {
								 font-size: 12px;
								 color: #BEC7D1;
								 width: 100%;
								 text-align: center;
								 line-height: 30px
						 }
				 }
			}				 
		}
	}
</style>
