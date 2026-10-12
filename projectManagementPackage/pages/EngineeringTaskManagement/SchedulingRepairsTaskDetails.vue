<template>
	<view class="content-box"
		@touchstart="touchstartHandle"
		@touchmove.stop.prevent="touchmoveHandle"
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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="任务详情" @backClick="backTo">
				<template slot="right" style="height:24px">
					<image :src="switchShowPng" mode="widthFix" alt="切换显示" @click="onClickRight"></image>
				</template>
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-box-inner">
					<view class="message-box">
							<view class="message-one">
									<view class="message-one-left">
											<text>编号:</text>
											<text>{{ schedulingTaskDetails.taskNumber }}</text>
									</view>
									<view class="message-one-right" v-if="taskStatusTransition(schedulingTaskDetails.state) != ''" :class="{'noAllocationStyle':schedulingTaskDetails.state == 0,'noLookupStyle':schedulingTaskDetails.state == 1,'noStartStyle': schedulingTaskDetails.state == 2,'underwayStyle':schedulingTaskDetails.state == 3,'tobeSigned':schedulingTaskDetails.state == 4}">
											{{ taskStatusTransition(schedulingTaskDetails.state) }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>创建时间</text>
									</view>
									<view class="message-two-right">
											{{ schedulingTaskDetails.createTime }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>已经历时间</text>
									</view>
									<view class="message-two-right">
											{{ elapsedTime(schedulingTaskDetails.planStartTime) }}
									</view>
							</view>
							 <view class="message-one message-two">
									<view class="message-two-left">
											<text>响应时间</text>
									</view>
									<view class="message-two-right">
											{{ schedulingTaskDetails.responseTime ? schedulingTaskDetails.responseTime : '' }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>开始时间</text>
									</view>
									<view class="message-two-right">
											{{ schedulingTaskDetails.planStartTime ? schedulingTaskDetails.planStartTime : '' }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>位置</text>
									</view>
									<view class="message-two-right">
											{{ schedulingTaskDetails.depName == '/' ? '' : schedulingTaskDetails.depName }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>房间</text>
									</view>
									<view class="message-two-right">
										 {{ disposeCheckType(schedulingTaskDetails.spaces) }}
									</view>
							</view>
							<view class="message-one message-two message-six">
									<view class="message-two-left">
											<text>优先级</text>
									</view>
									<view class="message-two-right" 
									:class="{
											'priorityNormalStyle' : schedulingTaskDetails.priority == 1,
											'priorityUrgencyStyle' : schedulingTaskDetails.priority == 2,
											'priorityImportanceStyle' : schedulingTaskDetails.priority == 3,
											'priorityUrgentImportanceStyle' : schedulingTaskDetails.priority == 4,
									 
									 }">
											{{ taskPriotityTransition(schedulingTaskDetails.priority) }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>维修员</text>
									</view>
									<view class="message-two-right">
											{{ schedulingTaskDetails.workerName ? schedulingTaskDetails.workerName : '' }}
									</view>
							</view>
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>参与人</text>
									</view>
									<view class="message-two-right">
											{{ disposeTaskPresent(schedulingTaskDetails.present) }}
									</view>
							</view>
							<view class="issue-image">
									<view class="issue-image-left">
											<text>问题图片</text>
									</view>
									<view class="issue-image-list" v-if="schedulingTaskDetails.images && schedulingTaskDetails.images.length > 0">
											<view v-for="(innerItem,innerIndex) in schedulingTaskDetails.images" :key="innerIndex" >
													<image alt="" :src="innerItem.path" @click="enlareEvent(innerItem.path)"></image>
											</view>
									</view>
							</view> 
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>联系人(电话)</text>
									</view>
									<view class="message-two-right">
											{{ schedulingTaskDetails.contact ? schedulingTaskDetails.contact : '无' }}
									</view>
							</view>  
							<view class="message-one message-two">
									<view class="message-two-left">
											<text>问题描述</text>
									</view>
									<view class="message-two-right task-remark">
											{{ schedulingTaskDetails.taskDesc }}
									</view>
							</view>
					</view>
					<view class="btn-box">
						<text class="operate-one" @click="allocationEvent" v-if="schedulingTaskDetails.state == 0">分配</text>
						<text class="operate-complete"  v-if="schedulingTaskDetails.state == 3" @click="completeTask">完成</text>
						<text class="operate-two" @click="editEvent">编辑</text>
						<text class="operate-three" @click="delayReasonEvent" v-if="schedulingTaskDetails.hasDelay == 0">延迟</text>
						<text class="operate-four" @click="cancelReasonEvent">取消</text>
					</view>
			</view>
		</view>
		<!-- 分配弹框   -->
		<view class="allocation-box allocation-box-one">
			<u-modal :show="allocationShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="allocationDialogSure"
				@cancel="allocationDialogCancel"
				confirmText="确定"
				cancelText="取消"
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
		<view class="allocation-box">
			<u-modal 
				:show="delayReasonShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="delayReasonDialogSure"
				@cancel="delayReasonDialogCancel"
				confirmText="确定"
				cancelText="取消"
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
		<view class="allocation-box">
			<u-modal 
				:show="cancelReasonShow"
				:showCancelButton="true"
				confirmColor="#2390fe"
				@confirm="cancelReasonDialogSure"
				@cancel="cancelReasonDialogCancel"
				confirmText="确定"
				cancelText="取消"
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
	import { assignRepairsTask, delayRepairsTask, cancelRepairsTask, completeRepairsTask } from '@/api/taskScheduling.js'
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
				moveInfo: {
					startX: ''
				},
				completeShow: false,
				modalShow: false,
				allocationShow: false,
				delayReasonShow: false,
				cancelReasonShow: false,
				functionListIndex: 0,
				currentImgUrl: '',
				imgBoxShow: false,
				overlayShow: false,
				rightMenuShow: false,
				switchShowPng: require("@/static/img/switch-show.png"),
				switchHiddenPng: require("@/static/img/switch-hidden.png"),
				anxiousSignPng: require("@/static/img/anxious-sign.png"),
				taskList: [
					{tit:'调度管理'},
					{tit:'报修任务'},
					{tit:'区域巡检'}
				],
				transporterValue: null,
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
				repairsCancelReasonOption: []
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'schedulingTaskDetails',
				'schedulingTaskAboutMessage',
				'operateBtnClickRecord',
				'schedulingTaskType'
			]),
			proId () {
				return this.userInfo.extendData.proId
			}
		},
		onLoad () {
			// 回显运送员列表、取消原因列表、延迟原因列表
			this.allocationOption = this.schedulingTaskAboutMessage['allocationOption'];
			this.repairsCancelReasonOption = this.schedulingTaskAboutMessage['repairsCancelReasonOption'];
			this.repairsDelayReasonOption = this.schedulingTaskAboutMessage['repairsDelayReasonOption']
		},
		methods: {
			...mapMutations([
				'changeOverDueWay',
				'changeOperateBtnClickRecord',
				'changeSchedulingTaskType'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 完成任务确定事件
			completeCancel () {
				this.completeShow = false;
				this.completeRepairsTaskEvent({
					taskId: this.schedulingTaskDetails['id'], //任务id
					proId: this.proId, //项目id
				})
			},
	
			// 完成任务取消事件
			completeSure () {
				this.completeShow = false;
			},
	
			// 维修任务完成事件
			completeTask () {
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
						const pages = getCurrentPages();
						const prevPageInner = pages[pages.length-2];
						if (prevPageInner) {
							prevPageInner.$vm.taskComplateSuccessOperate();
						};
						uni.navigateBack({
							delta:1
						})	
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
	
	
			// 处理维修任务空间信息
			disposeCheckType (item) {
				if (!item) { return '无' };
				if (item.length == 0) { return '无' };
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.name)
				};
				return temporaryArray.join('、')
			},
	
			// 处理维修任务参与者
			disposeTaskPresent (item) {
				if (!item) { return '无'};
				if (item.length == 0) { return '无' };
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.name)
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
				assignRepairsTask({
						id: this.schedulingTaskDetails['id'], //任务id
						proId: this.proId, //项目id
						isMe: this.schedulingTaskDetails['isMe'], // 是否我方
						taskNumber: this.schedulingTaskDetails['taskNumber'], // 任务编号
						present: this.schedulingTaskDetails['present'], //参与者
						workerId: this.selectAllocation['value'], //运送员id
						workerName: this.selectAllocation['text'] //运送员姓名
					})
					.then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						this.$refs['allocationOption'].clearSelectValue();
						if (res && res.data.code == 200) {
							this.$refs.uToast.show({
								message: '分配成功',
								position: 'center'
							});
							const pages = getCurrentPages();
							const prevPageInner = pages[pages.length-2];
							if (prevPageInner) {
								prevPageInner.$vm.taskAllocationSuccessOperate();
							};
							uni.navigateBack({
								delta:1
							})	
						} else {
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'center'
							})
						}
					})
					.catch((err) => {
						this.$refs['allocationOption'].clearSelectValue();
						this.infoText = '';
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						})
				})
			},
	
			// 分配弹框取消事件
			allocationDialogCancel () {
				this.allocationShow = false;
				this.$refs['allocationOption'].clearSelectValue()
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
					delayRepairsTask({
						taskId: this.schedulingTaskDetails['id'], //任务id
						proId: this.proId, // 医院id
						reason: this.selectDelayReason['text'], //延迟原因
						state: 7
					})
					.then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						this.$refs['delayOption'].clearSelectValue();
						if (res && res.data.code == 200) {
							this.$refs.uToast.show({
								message: '延迟成功',
								position: 'center'
							});
							const pages = getCurrentPages();
							const prevPageInner = pages[pages.length-2];
							if (prevPageInner) {
								prevPageInner.$vm.taskDelaySuccessOperate();
							};
							uni.navigateBack({
								delta:1
							})	
						} else {
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'center'
							})
						}
					})
					.catch((err) => {
						this.$refs['delayOption'].clearSelectValue();
						this.infoText = '';
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						})
				})
			},
	
			// 延迟原因弹框取消事件
			delayReasonDialogCancel () {
				this.delayReasonShow = false;
				this.$refs['delayOption'].clearSelectValue()
			},
	
			// 取消点击事件
			cancelReasonEvent(item,index,text) {
				this.cancelReasonShow = true;
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
					cancelRepairsTask({
						taskId: this.schedulingTaskDetails['id'], //任务id
						state: 6,
						proId: this.proId, // 医院id
						reason: this.selectCancelReason['text'] //取消原因
					})
					.then((res) => {
						this.showLoadingHint = false;
						this.infoText = '';
						this.$refs['cancelOption'].clearSelectValue();
						if (res && res.data.code == 200) {
							this.$refs.uToast.show({
								message: '取消成功',
								position: 'center'
							});
							const pages = getCurrentPages();
							const prevPageInner = pages[pages.length-2];
							if (prevPageInner) {
								prevPageInner.$vm.taskCancelSuccessOperate();
							};
							uni.navigateBack({
								delta:1
							})	
						} else {
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'center'
							})
						}
					})
					.catch((err) => {
						this.$refs['cancelOption'].clearSelectValue();
						this.infoText = '';
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						})
				})
			},
	
			// 取消原因弹框取消事件
			cancelReasonDialogCancel () {
				this.cancelReasonShow = false;
				this.$refs['cancelOption'].clearSelectValue()
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
	
			// 右侧菜单任务列表点击事件
			taskRouterSkip (name, index) {
				this.functionListIndex = index;
				this.rightMenuShow = false;
				if (name === '报修任务') {
					uni.navigateTo({
						url: '/projectManagementPackage/pages/RepairsWorkOrder/RepairsWorkOrder'
					})
				} else if (name === '区域巡检') {
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
	
			// 分配点击事件
			allocationEvent () {
				// let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
				// temporaryOperateBtnClickRecord['allocationBtnClick'] = true;
				// this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord);
				// this.$router.push({path:'/taskScheduling'})
				this.allocationShow = true
			},
	
			// 编辑点击事件
			editEvent () {
				let temporaryTaskType = this.schedulingTaskType;
				temporaryTaskType['editSource'] = 'details';
				uni.navigateTo({
					url: '/projectManagementPackage/pages/EngineeringTaskManagement/EditRepairsTask'
				});
				this.changeSchedulingTaskType(temporaryTaskType)
			},
	
			// 延迟点击事件
			delayReasonEvent () {
				// let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
				// temporaryOperateBtnClickRecord['delayBtnClick'] = true;
				// this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord);
				// this.$router.push({path:'/taskScheduling'})
				this.delayReasonShow = true;
				this.delayReasonOption = this.repairsDelayReasonOption
			},
	
			// 取消点击事件
			cancelReasonEvent () {
				// let temporaryOperateBtnClickRecord = this.operateBtnClickRecord;
				// temporaryOperateBtnClickRecord['cancelBtnClick'] = true;
				// this.changeOperateBtnClickRecord(temporaryOperateBtnClickRecord);
				// this.$router.push({path:'/taskScheduling'})
				this.cancelReasonShow = true;
				this.cancelReasonOption = this.repairsCancelReasonOption
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
					>image {
						width: 100%;
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
					 background: #f7f7f7;
					 z-index: 10;
					 .message-box {
							 flex: 1;
							 width: 100%;
							 overflow: scroll;
							 .message-one {
									 width: 100%;
									 padding: 4px 6px;
									 box-sizing: border-box;
									 background: #fff;
									 display: flex;
									 align-items: center;
									 justify-content: space-between;
									 font-size: 14px;
									 margin-top: 6px;
									 .message-one-left {
											 color: #289E8E
									 };
									 .message-one-right {
										 width: 61px;
										 height: 27px;
										 text-align: center;
										 line-height: 27px;
										 color: #fff;
										 background: #E86F50;
										 border-radius: 4px
									 };
									 .noAllocationStyle {
										 background: #E86F50 !important
									 };
									 .noLookupStyle {
										 background: #E8CB51 !important
									 };
									 .noStartStyle {
										 background: #174E97 !important
									 };
									 .underwayStyle {
										 background: #289E8E !important
									 };
									 .tobeSigned {
										 background: #40f9e0 !important
									 }
							 };
							 .message-two {
									 align-items: flex-start !important;
									 padding: 11px 6px;
									 .message-two-left {
											 color: #9E9E9A
									 };
									 .message-two-right {
											 flex: 1;
											 color: #101010;
											 line-height: 20px;
											 word-break: break-all;
											 padding-left: 10px;
											 box-align: border-box;
											 text-align: right
									 };
									 .task-remark {
											 text-align: left !important
									 }
							 };
							 .message-six {
									 align-items: flex-start !important;
									 .priorityNormalStyle { 
											 color: #289E8E !important
									 };
									 .priorityUrgencyStyle { 
											 color: #E8CB51 !important
									 };
									 .priorityImportanceStyle { 
											 color: #F2A15F !important
									 };
									 .priorityUrgentImportanceStyle { 
											 color: #E86F50 !important
									 }
							 };
							 .issue-image {
									 width: 100%;
									 padding: 4px 6px;
									 box-sizing: border-box;
									 background: #fff;
									 display: flex;
									 align-items: center;
									 font-size: 14px;
									 margin-top: 6px;
									 align-items: center;
									 .issue-image-left {
											 color: #9E9E9A
									 };
									 .issue-image-list {
											 flex: 1;
											 display: flex;
											 margin-left: 6px;
											 flex-flow: row wrap;
											 > view {
											 width: 22%;
											 margin-right: 4%;
											 margin-bottom: 10px;
											 &:nth-child(4n) {
													 margin-right: 0
											 }
											 >image {
													 width: 100%;
													 height: 80px;
											 }
											 }
									 }
							 }
					 };
					 .btn-box {
							 height: 50px;
							 display: flex;
							 align-items: center;
							 justify-content: center;
							 >text {
									 font-weight: bold;
									 display: inline-block;
									 color: #fff;
									 border-radius: 10px;
									 font-size: 14px;
									 width: 76px;
									 height: 29px;
									 text-align: center;
									 line-height: 29px;
									 box-sizing: border-box;
									 border-radius: 4px;
									 margin-right: 8px;
									 color: #fff
							 };
							 .operate-complete {
								 background: #289E8E;
							 };
							 .operate-one {
									 background: #F2A15F
							 };
							 .operate-two {
									 background: #174E97
							 };
							 .operate-three {
									 background: #254550
							 };
							 .operate-four {
									 background: #E86F50;
									 margin-right: 0
							 }                   
					 }
			 }
		 
		}
	}
</style>
