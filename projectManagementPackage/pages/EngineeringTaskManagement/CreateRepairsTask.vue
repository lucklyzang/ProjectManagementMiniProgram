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
		 <!-- 目的建筑 -->
		<view class="transport-rice-box" v-if="showStructure">
			<ScrollSelection v-model="showStructure" :pickerValues="currentStructureDefaultIndex" :columns="structureOption" title="目的建筑" @sure="structureSureEvent" @cancel="structureCancelEvent" @close="structureCloseEvent" />
		</view>
		<!-- 目的科室 -->
		<view class="transport-rice-box" v-if="showGoalDepartment">
			<ScrollSelection v-model="showGoalDepartment" :pickerValues="currentGoalDepartmentDefaultIndex" :columns="goalDepartmentOption" title="目的科室" @sure="goalDepartmentSureEvent" @cancel="goalDepartmentCancelEvent" @close="goalDepartmentCloseEvent" :isShowSearch="true" />
		</view>
		<!-- 目的房间 -->
		<view class="transport-rice-box" v-if="showGoalSpaces">
			<BottomSelect v-model="showGoalSpaces" :columns="goalSpacesOption" title="目的房间" :currentSelectData="currentGoalSpaces" @sure="goalSpacesSureEvent" @cancel="goalSpacesCancelEvent" @close="goalSpacesCloseEvent" />
		</view>
		<!-- 任务类型 -->
		<view class="transport-rice-box" v-if="showTaskType">
			<ScrollSelection v-model="showTaskType" :pickerValues="currentTaskTypeDefaultIndex" :columns="taskTypeOption" title="任务类型" @sure="taskTypeSureEvent" @cancel="taskTypeCancelEvent" @close="taskTypeCloseEvent" />
		</view>
		<!-- 维修员 -->
		<view class="transport-rice-box" v-if="showTransporter">
			<ScrollSelection v-model="showTransporter" :pickerValues="currentTransporterDefaultIndex" :columns="transporterOption" title="维修员" @sure="transporterSureEvent" @cancel="transporterCancelEvent" @close="transporterCloseEvent" />
		</view>
		<!-- 使用工具 -->
		<view class="transport-rice-box" v-if="showUseTool">
			<BottomSelect :columns="useToolOption" title="工具" :currentSelectData="currentUseTool"  @sure="useToolSureEvent" @cancel="useToolCancelEvent" @close="useToolCloseEvent" />
		</view>
		 <!-- 参与人 -->
		<view class="transport-rice-box" v-if="showParticipant">
			<BottomSelect :columns="participantOption" title="参与人" :currentSelectData="currentParticipant" @sure="participantSureEvent" @cancel="participantCancelEvent" @close="participantCloseEvent" />
		</view>
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="创建维保任务" @backClick="backTo">
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
							优先级
						</view>
						<view class="message-one-right">
							<u-radio-group v-model="priorityRadioValue" direction="horizontal">
								<u-radio name="1" activeColor="#289E8E" labelColor="#289E8E" label="正常"></u-radio>
								<u-radio name="2" activeColor="#E8CB51" labelColor="#F2A15F" label="紧急"></u-radio>
								<u-radio name="3" activeColor="#F2A15F" labelColor="#E8CB51" label="重要"></u-radio>
								<u-radio name="4" activeColor="#E86F50" labelColor="#E86F50" label="紧急重要"></u-radio>
							</u-radio-group>
						</view>
					</view>
					<view class="select-box">
						<view class="select-box-left">
							<text>*</text>
							<text>任务类型</text>
						</view>
						<view class="select-box-right" @click="showTaskType = true">
							<text>{{ currentTaskType }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					<view class="select-box end-select-box">
						<view class="select-box-left">
							<text>目的建筑</text>
						</view>
						<view class="select-box-right" @click="showStructure = true">
							<text>{{ currentStructure }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					<view class="select-box end-select-box">
						<view class="select-box-left">
							<text>目的科室</text>
						</view>
						<view class="select-box-right" @click="goalDepartmentClickEvent">
							<text>{{ currentGoalDepartment }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					<view class="select-box end-select-box">
						<view class="select-box-left">
							<text>目的房间</text>
						</view>
						<view class="select-box-right" @click="goalSpacesClickEvent">
							<text>{{ disposeTaskPresent(currentGoalSpaces) }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					<view class="task-describe transport-type problem-overview">
						<view class="transport-type-left">
							<text>问题概述</text>
						</view>
						<view class="transport-type-right">
							<u-input 
								v-model="problemOverview" 
								placeholder="请输入问题简要概述" 
								border="none"
							>
							</u-input>
						</view>
					</view>
					<view class="select-box end-select-box">
						<view class="select-box-left">
							<text>维修员</text>
						</view>
						<view class="select-box-right" @click="showTransporter = true">
							<text>{{ currentTransporter }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					<view class="select-box end-select-box">
						<view class="select-box-left">
							<text>参与人</text>
						</view>
						<view class="select-box-right" @click="showParticipant = true">
							<text>{{ disposeTaskPresent(currentParticipant) }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					<view class="select-box end-select-box">
						<view class="select-box-left">
							<text>使用工具</text>
						</view>
						<view class="select-box-right" @click="showUseTool = true">
							<text>{{ disposeTaskPresent(currentUseTool) }}</text>
							<u-icon name="arrow-right" color="#989999" size="20"></u-icon>
						</view>
					</view>
					 <view class="message-one is-me">
						<view class="message-one-left">
							我方解决
						</view>
						<view class="message-one-right">
							<u-radio-group v-model="isMeRadioValue" direction="horizontal">
								<u-radio name="1" activeColor="#3B9DF9"  label="是"></u-radio>
								<u-radio name="0" activeColor="#3B9DF9" label="否"></u-radio>
							</u-radio-group>
						</view>
					</view>
					<view class="concat-box">
						<view class="concat-box-left">
							<text>联系人(电话)</text>
						</view>
						<view class="concat-box-right">
							<u-input v-model="contact" border="none"  placeholder="请输入联系人及联系方式" type="text">
							</u-input>
						</view>
					</view>
					<view class="task-describe transport-type">
						<view class="transport-type-left">
							<text>任务描述</text>
						</view>
						<view class="transport-type-right">
							<u--textarea
								v-model="taskDescribe" 
								placeholder="请输入任务描述" 
								border="none"
								height="83"
							>
							</u--textarea>
						</view>
					</view>
					<view class="consumable-management-area">
						<view class="circulation-area-title">
							<text>耗材管理</text>
							<text @click="materialShowEvent">添加</text>
						</view>
						<view class="circulation-area">
							<view v-for="(item,index) in consumableMsgList" :key="item.mateId">
								<view>{{index+1}}</view>
								<scroll-view class="scroll-box" scroll-x @touchmove.stop>
									<text class="scroll-item">
										{{item.mateName}}-{{item.model}}
									</text>
								</scroll-view>
								<view>
									<u-number-box 
									  v-model="item.number"
										button-size="36"
										color="#ffffff"
										bgColor="#2db8f9"
										iconStyle="color: #fff"
										@change="function(value){stepperEvent(item,index,value)}"
										@blur="function(value){stepperEvent(item,index,value)}"
										theme="round" 
										integer 
										min="0"
										:max="item.quantity+1"
										>
									</u-number-box>
								</view>
								<view>
									<u-icon name="trash" color="red" size="22" @click="deleteEvent(item,index)"></u-icon>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="btn-box">
					<text class="operate-one" @click="sureEvent">确认</text>
					<text class="operate-two" @click="temporaryStorageEvent">暂存</text>
					<text class="operate-three" @click="cancelEvent">取消</text>
				</view>
			</view>
		</view>
		<!-- 物料弹框  -->
		<view class="material-box">
		  <u-modal :show="materialShow"  :showCancelButton="true"
			  @confirm="materialSure" @cancel="materialCancel" confirmText="添加"
			  cancelText="取消"
			>
			  <view class="dialog-top">
					<view class="select-title">添加耗材</view>
					<u-icon name="close" size="24" @click="closeScreenDialogEvent"></u-icon>
			  </view>
			  <view class="tool-name-list">
				<view class="tool-name-list-title-innner">
					<view class="search-input">
					  <u--input
						v-model="searchValue"
						placeholder="物资"
					  >
					  </u--input>
					  <text class="icon-span">
						<u-icon name="search" color="#B7B6B6"></u-icon>
					  </text>
					</view>
					<view class="search-btn" @click="searchEvent">搜索</view>
				</view>
				<view class="tool-name-list-content">
				  <view class="static-row">
						<view class="circulation-area-title-box">
							<view>物资名称</view>
							<view>单位</view>
							<view>型号</view>
							<view>规格</view>
						</view>
						<view class="circulation-area-content-box"> 
							<view v-for="(item,index) in inventoryMsgList" @click="mateNameEvent(item,index)" :key="item.id" class="circulation-area-content">
							<view>
								{{item.mateName}}
							</view>
							<view>
								{{item.unit ? item.unit : '无'}}
							</view>
							<view>
								{{ item.model ?  item.model : '无'}}
							</view>
							<view>
								{{ item.norms ?  item.norms : '无' }}
							</view>
							</view>
							<u-empty text="暂无数据" v-if="inventoryMsgList.length == 0"></u-empty>
						</view>
				  </view>
				  <view class="absolute-row">
					<view class="absolute-title">
					  占位
					</view>
					<view class="absolute-operate">
						<u-checkbox-group v-model="currentPageIds" @change="checkboxChange" placement="column">
						  <view v-for="(item,index) in inventoryMsgList" :key="item.id">
							<view>
								<u-checkbox
									size="26"
									iconSize="22"
									active-color="#3B9DF9"
									:key="item.id"
									:name="item.id"
									shape="square"
									@click.stop
									:disabled="item.disabled"
								>
								</u-checkbox>
							</view>
						  </view>
						</u-checkbox-group>
					</view>
				  </view>
				  <view class="shadow-box"></view> 
				</view>
				<view class="page-area">
				  <view class="page-left" @click="pageClickEvent('previous')" :class="{'pageSpanStyle' : currentPage == 1}">上一页</view>
				  <view class="page-center">
					<text>{{ totalPage == 0 ? 0 : currentPage }}</text>
					<text>/</text>
					<text>{{ totalPage }}</text>
				  </view>
				  <view class="page-right" @click="pageClickEvent('next')" :class="{'pageSpanStyle' : currentPage == totalPage}">下一页</view>
				</view>
			  </view>
		  </u-modal>
		</view>
		<!-- 物料删除提示框 -->
		<view class="material-delete-box">
		   <u-modal :show="materialDeleteShow"  :showCancelButton="true"
			  @confirm="materialDeleteSure" @cancel="materialDeleteCancel" confirmText="确定"
			  cancelText="取消"
			>
			  <view class="dialog-top">
				<image :src="deleteInfoPng" mode="widthFix"></image>
			  </view>
			  <view class="dialog-center">
			   {{`是否删除:${deleteMaterial}?`}}
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
	import {userSignOut} from '@/api/login.js'
	import { createRepairsTask, getTransporter, querySpace, queryDepartment, queryRepairsTaskTool, queryStructure, queryRepairsTaskMaterial, getRepairsTaskType} from '@/api/taskScheduling.js'
	import navBar from "@/components/zhouWei-navBar"
	import ScrollSelection from "@/components/scrollSelection/scrollSelection";
	import BottomSelect from "@/components/bottomSelect/bottomSelect";
	export default {
		components: {
			navBar,
			ScrollSelection,
			BottomSelect
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				materialShow: false,
				deleteInfoPng: require('@/static/img/delete-info.png'),
				materialDeleteShow: false,
				modalShow: false,
				deleteMaterialIndex: '',
				deleteMaterial: '',
				searchValue: '',
				problemOverview: '',
				taskDescribe: '',
				transportNumberValue: '',
				totalPage: '',
				pageSize: 6,
				currentPage: 1,
				participationPersonIds: [],
				selectedMaterialIds: [],
				allSelectedIds: [],
				currentPageIds: [],  
				inventoryMsgList: [],
				echoInventoryMsgList: [],
				temporaryInventoryMsgList: [],
				consumableMsgList: [],
				storeId: '',
				systemId: '',
	
				useToolOption: [],
				showUseTool: false,
				currentUseTool: [],
	
				participantOption: [],
				showParticipant: false,
				currentParticipant: [],
	
				goalDepartmentOption: [],
				currentGoalDepartmentDefaultIndex: [0],
				showGoalDepartment: false,
				currentGoalDepartment: '请选择',
	
				goalSpacesOption: [],
				showGoalSpaces: false,
				currentGoalSpaces: [],
	
				taskTypeOption: [],
				currentTaskTypeDefaultIndex: [0],
				showTaskType: false,
				currentTaskType: '请选择',
	
				structureOption: [],
				currentStructureDefaultIndex: [0],
				showStructure: false,
				currentStructure: '请选择',
	
				transporterOption: [],
				currentTransporterDefaultIndex: [0],
				showTransporter: false,
				currentTransporter: '请选择',
				moveInfo: {
					startX: ''
				},
				priorityRadioValue: '1',
				isMeRadioValue: '1',
				functionListIndex: 0,
				rightMenuShow: false,
				xflSelectShow: false,
				switchShowPng: require("@/static/img/switch-show.png"),
				switchHiddenPng: require("@/static/img/switch-hidden.png"),
				anxiousSignPng: require("@/static/img/anxious-sign.png"),
				taskList: [
					{tit:'调度管理'},
					{tit:'报修任务'},
					{tit:'区域巡检'}
				],
				contact: ''
			}
		},
		watch: {
			problemOverview:{
				handler(newVal, oldVal){
					this.$nextTick(() => {
						// 如果新值包含空格，则重新赋值为去除空格后的字符串
						if (/\s/g.test(newVal)) {
							this.problemOverview = newVal.replace(/\s/g, '')
						}
					})
				}
			},
			contact:{
				handler(newVal, oldVal){
					this.$nextTick(() => {
						// 如果新值包含空格，则重新赋值为去除空格后的字符串
						if (/\s/g.test(newVal)) {
							this.contact = newVal.replace(/\s/g, '')
						}
					})
				}
			},
			taskDescribe:{
				handler(newVal, oldVal){
					this.$nextTick(() => {
						// 如果新值包含空格，则重新赋值为去除空格后的字符串
						if (/\s/g.test(newVal)) {
							this.taskDescribe = newVal.replace(/\s/g, '')
						}
					})
				}
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'schedulingTaskDetails',
				'operateBtnClickRecord',
				'temporaryStorageCreateRepairsTaskMessage'
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
		onLoad () {
			this.parallelFunction();
			//判断是否回显暂存的数据
			if (JSON.stringify(this.temporaryStorageCreateRepairsTaskMessage) != '{}' && this.temporaryStorageCreateRepairsTaskMessage['isTemporaryStorage']) {
				this.echoTemporaryStorageMessage()
			}
		},
		methods: {
			...mapMutations([
				"changeOverDueWay",
				"changeOperateBtnClickRecord",
				"changeTemporaryStorageCreateRepairsTaskMessage"
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 回显暂存的信息
			async echoTemporaryStorageMessage () {
				let casuallyTemporaryStorageCreateRepairsTaskMessage = this.temporaryStorageCreateRepairsTaskMessage;
				this.priorityRadioValue = casuallyTemporaryStorageCreateRepairsTaskMessage['priorityRadioValue'];
				this.currentTaskType = casuallyTemporaryStorageCreateRepairsTaskMessage['currentTaskType'];
				this.currentTaskTypeDefaultIndex = casuallyTemporaryStorageCreateRepairsTaskMessage['currentTaskTypeDefaultIndex'];
				this.currentStructure = casuallyTemporaryStorageCreateRepairsTaskMessage['currentStructure'];
				this.currentStructureDefaultIndex	= casuallyTemporaryStorageCreateRepairsTaskMessage['currentStructureDefaultIndex'];
				this.currentGoalDepartment = casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalDepartment'];
				this.currentGoalDepartmentDefaultIndex = casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalDepartmentDefaultIndex'];
				this.currentGoalSpaces = casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalSpaces'];
				this.problemOverview = casuallyTemporaryStorageCreateRepairsTaskMessage['problemOverview'];
				this.currentTransporter = casuallyTemporaryStorageCreateRepairsTaskMessage['currentTransporter'];
				this.currentTransporterDefaultIndex = casuallyTemporaryStorageCreateRepairsTaskMessage['currentTransporterDefaultIndex'];
				this.currentParticipant = casuallyTemporaryStorageCreateRepairsTaskMessage['currentParticipant'];
				this.currentUseTool = casuallyTemporaryStorageCreateRepairsTaskMessage['currentUseTool'];
				this.isMeRadioValue = casuallyTemporaryStorageCreateRepairsTaskMessage['isMeRadioValue'];
				this.taskDescribe = casuallyTemporaryStorageCreateRepairsTaskMessage['taskDescribe'];
				this.consumableMsgList = casuallyTemporaryStorageCreateRepairsTaskMessage['consumableMsgList'];
				this.contact = casuallyTemporaryStorageCreateRepairsTaskMessage['contact'];
			},
	
			// 公共修改是否暂存的方法
			commonIsTemporaryStorageMethods () {
				let casuallyTemporaryStorageCreateRepairsTaskMessage = this.temporaryStorageCreateRepairsTaskMessage;
				casuallyTemporaryStorageCreateRepairsTaskMessage['isTemporaryStorage'] = false;
				this.changeTemporaryStorageCreateRepairsTaskMessage(casuallyTemporaryStorageCreateRepairsTaskMessage)
			},
	
			// 处理维修任务参与者
			disposeTaskPresent (item) {
				if (!item) { return '请选择'};
				if (item.length == 0) { return '请选择'};
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.text)
				};
				return temporaryArray.join('、')
			},
	
			// 删除物料事件
			deleteEvent(item,index) {
				this.materialDeleteShow = true;
				this.deleteMaterial = `${item.mateName}-${item.model}`;
				this.deleteMaterialIndex = index
			},
	
			// 物料数量变化事件
			stepperEvent (item,index,value) {
				if (item.quantity == null) { return};
				item['number'] = value['value'];
				if (value['value'] === "") { item['number'] = 0; return};
				if (item.quantity > 0) {
					if (value['value'] > item.quantity) {
						this.$refs.uToast.show({
							message: `已超出库存数量${item.quantity}`,
							type: 'error',
							position: 'center'
						});
						this.$nextTick(() => {
							this.$set(this.consumableMsgList[index],'number',item.quantity)
						});
						return
					}
				}
			},
	
			// 点击物料加事件
			stepperPlusEvent(item,index) {
				if (item.number  >= item.quantity) {
					this.$nextTick(() => {
						this.$set(this.consumableMsgList[index],'number',item.quantity)
					});
					this.$refs.uToast.show({
						message: '已超出库存数量',
						type: 'error',
						position: 'center'
					})
				}
			},
	
			// 格式化时间
			getNowFormatDate(currentDate) {
				let currentdate;
				let strDate = currentDate.getDate();
				let seperator1 = "-";
				let seperator2 = ":";
				let month = currentDate.getMonth() + 1;
				let hour = currentDate.getHours();
				let minutes = currentDate.getMinutes();
				if (month >= 1 && month <= 9) {
					month = "0" + month;
				};
				if (hour >= 0 && hour <= 9) {
					hour = "0" + hour;
				};
				if (minutes >= 0 && minutes <= 9) {
					minutes = "0" + minutes;
				};
				if (strDate >= 0 && strDate <= 9) {
					strDate = "0" + strDate;
				};
				currentdate = currentDate.getFullYear() + seperator1 + month + seperator1 + strDate + ' ' + hour + seperator2 + minutes
				return currentdate
			},
	
			// 根据建筑查询科室信息
			getDepartmentByStructureId (structureId,flag,isInitial) {
				this.infoText = '查询中...';
				this.showLoadingHint = true;
				this.goalDepartmentOption = [];
				queryDepartment(this.proId,structureId)
				.then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							for (let i = 0, len = res.data.data.length; i < len; i++) {
								this.goalDepartmentOption.push({
									text: res.data.data[i].departmentName,
									value: res.data.data[i].id,
									id: i
								})
							};
							if (isInitial) {
								if (this.currentGoalDepartment != '请选择') {
									this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],false)
								}
							}  
						};
						if (flag) {
							this.showGoalDepartment = true
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
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},
	
			// 根据科室查询空间间信息
			getSpacesByDepartmentId (depId,flag) {
				this.infoText = '查询中...';
				this.showLoadingHint = true;
				this.goalSpacesOption = [];
				querySpace(this.proId,depId)
				.then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							for (let i = 0, len = res.data.data.length; i < len; i++) {
								this.goalSpacesOption.push({
									text: res.data.data[i].spaceName,
									value: res.data.data[i].id,
									selected: false
								})
							}
						};
						if (flag) {this.showGoalSpaces = true}
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
	
			// 并行查询任务类型、目的建筑、维修员、物料信息、维修工具
			parallelFunction (type) {
					this.infoText = '加载中...';
					this.showLoadingHint = true;
					Promise.all([this.getTaskType(), this.getStructure(), this.queryTransporter(), this.getRepairsTaskMaterial(), this.getRepairsTaskTool()])
					.then((res) => {
						this.infoText = '';
						this.showLoadingHint = false;
						if (res && res.length > 0) {
							this.structureOption = [];
							this.participantOption = [];
							this.taskTypeOption = [];
							this.transporterOption = [];
							this.useToolOption = [];
							let [item1,item2,item3,item4,item5] = res;
							if (item1) {
								// 任务类型
								for (let i = 0, len = item1.length; i < len; i++) {
									this.taskTypeOption.push({
										text: item1[i].typeName,
										value: item1[i].id,
										id: i
									})
								}
							};
							if (item2) {
								// 目的建筑
								for (let i = 0, len = item2.length; i < len; i++) {
									this.structureOption.push({
										text: item2[i].structName,
										value: item2[i].id,
										id: i
									})
								};
								if (this.currentStructure != '请选择') {
									this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false,true)
								}
							};
							if (item3) {
								// 运送员
								for (let i = 0, len = item3.length; i < len; i++) {
									this.transporterOption.push({
										text: item3[i].workerName,
										value: item3[i]['id'],
										id: i
									});
									this.participantOption.push({
										text: item3[i].workerName,
										value: item3[i]['id'],
										selected: false
									})
								}
							};
							// 物料信息
							if (item4) {
								this.inventoryMsgList = [];
								this.temporaryInventoryMsgList = [];
								this.echoInventoryMsgList = [];
								if (item4.length > 0) {
									for (let item of item4) {
										item['checked'] = false
									};
									this.inventoryMsgList = item4;
									this.temporaryInventoryMsgList = item4;
									this.echoInventoryMsgList = item4;
									this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
									// 默认展示第一页的物料信息
									this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
									this.storeId = this.inventoryMsgList[0]['storeId'];
									this.systemId = this.inventoryMsgList[0]['systemId']
								}  
							};
							// 维修工具
							if (item5) {
								for (let i = 0, len = item5.length; i < len; i++) {
									this.useToolOption.push({
										text: item5[i].toolName,
										value: item5[i].id,
										selected: false
									})
								}
							};
							// if (item4) {
							//   //任务类型
							//   // 有暂存的话,则回显该暂存信息
							//   if (this.temporaryStorageCreateRepairsTaskMessage['isTemporaryStorage']) {
							//   }
							// }
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
	
				// 查询维修工具
				getRepairsTaskTool () {
					return new Promise((resolve,reject) => {
						queryRepairsTaskTool(this.proId).then((res) => {
							if (res && res.data.code == 200) {
								resolve(res.data.data)
							}
						})
						.catch((err) => {
							reject(err)
						})
					})
				},
	
				// 查询物料信息
				getRepairsTaskMaterial () {
					return new Promise((resolve,reject) => {
						queryRepairsTaskMaterial(this.proId).then((res) => {
							if (res && res.data.code == 200) {
								resolve(res.data.data)
							} else {
								reject(res.data.msg)
							}
						})
						.catch((err) => {
							reject(err)
						})
					})
				},
	
				// 查询目的建筑
				getStructure () {
					return new Promise((resolve,reject) => {
						queryStructure(this.proId).then((res) => {
							if (res && res.data.code == 200) {
								resolve(res.data.data)
							}
						})
						.catch((err) => {
							reject(err)
						})
					})
				},
	
			// 查询维修员
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
	
			// 查询任务类型
			getTaskType () {
				return new Promise((resolve,reject) => {
					getRepairsTaskType(this.proId, this.workerId)
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
	
			// 滑动开始（直接接收事件对象 e）
			touchstartHandle(e) {
				// uni-app 中统一使用 e.touches
				if (e.touches.length === 1) {
					this.moveInfo.startX = e.touches[0].clientX;
				}
			},
					
			// 滑动中（直接接收事件对象 e）
			touchmoveHandle(e) {
				if (this.materialShow || this.showGoalSpaces || this.showUseTool || this.showParticipant) {
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
			
			// 使用工具下拉选择框确认事件
			useToolSureEvent (val) {
				if (val.length > 0) {
					this.currentUseTool =  val
				} else {
					this.currentUseTool = []
				};
				this.showUseTool = false
			},
	
			// 使用工具下拉选择框取消事件
			useToolCancelEvent () {
				this.showUseTool = false
			},
	
			// 使用工具下拉选择框关闭事件
			useToolCloseEvent () {
				this.showUseTool = false
			},
	
			// 参与人下拉选择框确认事件
			participantSureEvent (val) {
				if (val.length > 0) {
					this.currentParticipant =  val
				} else {
					this.currentParticipant = []
				};
				this.showParticipant = false
			},
	
			// 参与人下拉选择框取消事件
			participantCancelEvent () {
				this.showParticipant = false
			},
	
			// 参与人下拉选择框关闭事件
			participantCloseEvent () {
				this.showParticipant = false
			},
	
			// 任务类型下拉选择框确认事件
			taskTypeSureEvent (val,value,id) {
				if (val) {
					this.currentTaskType =  val;
					this.currentTaskTypeDefaultIndex = [id];
				} else {
					this.currentTaskType = '请选择'
				};
				this.showTaskType = false
			},
	
			// 任务类型下拉选择框取消事件
			taskTypeCancelEvent () {
				this.showTaskType = false
			},
	
			// 任务类型下拉选择框关闭事件
			taskTypeCloseEvent () {
				this.showTaskType = false
			},
	
			// 目的建筑下拉选择框确认事件
			structureSureEvent (val,value,id) {
				if (val) {
					this.currentStructure =  val;
					this.currentStructureDefaultIndex = [id];
					this.currentGoalDepartment = '请选择';
					this.currentGoalSpaces = [];
					this.goalSpacesOption = [];
					this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],false,false)
				} else {
					this.currentStructure = '请选择'
				};
				this.showStructure = false
			},
	
			// 目的建筑下拉选择框取消事件
			structureCancelEvent () {
				this.showStructure = false
			},
	
			// 目的建筑下拉选择框关闭事件
			structureCloseEvent () {
				this.showStructure = false
			},
	
			// 目的科室下拉选择框确认事件
			goalDepartmentSureEvent (val,value,id) {
				if (val) {
					this.currentGoalDepartment =  val;
					this.currentGoalDepartmentDefaultIndex = [id];
					this.currentGoalSpaces = [];
					this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],false)
				} else {
					this.currentGoalDepartment = '请选择'
				};
				this.showGoalDepartment = false
			},
	
			// 目的科室列点击事件
			goalDepartmentClickEvent () {
				if (this.currentStructure == '请选择') {
					this.$refs.uToast.show({
						message: '请选择建筑',
						position: 'center'
					})
				} else {
					this.getDepartmentByStructureId(this.structureOption.filter((item) => { return item['text'] == this.currentStructure})[0]['value'],true,false)
				}
			},
	
			// 目的科室下拉选择框取消事件
			goalDepartmentCancelEvent () {
				this.showGoalDepartment = false
			},
	
			// 目的科室下拉选择框关闭事件
			goalDepartmentCloseEvent () {
				this.showGoalDepartment = false
			},
	
			// 目的房间下拉选择框关闭事件
			goalSpacesCloseEvent () {
				this.showGoalSpaces = false
			},
			
			// 目的房间列点击事件
			goalSpacesClickEvent () {
				if (this.currentGoalDepartment == '请选择') {
					this.$refs.uToast.show({
						message: '请选择科室',
						position: 'center'
					})
				} else {
					this.getSpacesByDepartmentId(this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'],true)
				}
			},
	
			// 目的房间下拉选择框确认事件
			goalSpacesSureEvent (val) {
				if (val.length > 0) {
					this.currentGoalSpaces =  val;
				} else {
					this.currentGoalSpaces = []
				};
				this.showGoalSpaces = false
			},
	
			// 目的房间下拉选择框取消事件
			goalSpacesCancelEvent () {
				this.showGoalSpaces = false
			},
	
	
			// 运送员下拉选择框确认事件
			transporterSureEvent (val,value,id) {
				if (val) {
					this.currentTransporter =  val;
					this.currentTransporterDefaultIndex = [id];
				} else {
					this.currentTransporter = '请选择'
				};
				this.showTransporter = false
			},
	
			// 运送员下拉选择框取消事件
			transporterCancelEvent () {
				this.showTransporter = false
			},
	
			// 运送员下拉选择框关闭事件
			transporterCloseEvent () {
				this.showTransporter = false
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
	
	
				// 根据维修员名称获取运送员id
				getCurrentTransporterIdByName(text) {
					return this.transporterOption.filter((item) => {return item['text'] == text })[0]['value']
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
	
			// 确认事件(创建维保任务)
			sureEvent () {
				// 任务类型不能为空
				if (this.currentTaskType == '请选择') {
					this.$refs.uToast.show({
						message: '任务类型不能为空',
						position: 'center'
					});
					return
				};
				// 创建维修任务
				let temporaryMessage = {
					typeId: this.taskTypeOption.filter((item) => { return item['text'] == this.currentTaskType})[0]['value'], // 任务类型
					taskDesc: this.problemOverview, // 问题描述
					destinationId: '', // 目的地id
					depId: this.currentGoalDepartment == '请选择' ? '' : this.goalDepartmentOption.filter((item) => { return item['text'] == this.currentGoalDepartment})[0]['value'], // 目的科室id
					select: '',
					isMe: this.isMeRadioValue, // 是否我方解决 0-否，1-是
					priority: this.priorityRadioValue,
					taskRemark: this.taskDescribe, //任务描述
					proId: this.proId,
					proName: this.proName,
					createId: this.workerId,
					createName: this.userName,
					createType: 0, // 创建类型 0-调度员 2-医务人员 3-巡检人员
					workerId: this.currentTransporter == '请选择' ? '' : this.getCurrentTransporterIdByName(this.currentTransporter),
					workerName: this.currentTransporter == '请选择' ? '' : this.currentTransporter,
					spaces: [], //空间信息
					present: [], //参与者
					tools: [],  //使用工具
					depName: `${this.currentStructure == '请选择' ? '' : this.currentStructure}/${this.currentGoalDepartment == '请选择' ? '' : this.currentGoalDepartment}`, //出发地名称
					typeName: this.currentTaskType, // 类型名称
					materials: [],        // 需要的物料
					contact: this.contact
				};
				// 拼接参与者数据
				if (this.currentParticipant.length > 0) {
					for (let item of this.currentParticipant) {
						temporaryMessage['present'].push({
							id: item.hasOwnProperty('value') ? item.value : item.id,
							name: item.hasOwnProperty('text') ? item.text : item.name
						})
					}
				};
				// 拼接使用工具数据
				if (this.currentUseTool.length > 0) {
					for (let item of this.currentUseTool) {
						temporaryMessage['tools'].push({
							id: item.hasOwnProperty('value') ? item.value : item.id,
							name: item.hasOwnProperty('text') ? item.text : item.name
						})
					}
				};
				// 拼接空间信息
				if (this.currentGoalSpaces.length > 0) {
					for (let item of this.currentGoalSpaces) {
						temporaryMessage['spaces'].push({
							id: item.hasOwnProperty('value') ? item.value : item.id,
							name: item.hasOwnProperty('text') ? item.text : item.name
						})
					}
				};
				// 拼接使用耗材数据
				if (this.consumableMsgList.length > 0) {
					for (let item of this.consumableMsgList) {
						if (item.number > 0) {
							temporaryMessage['materials'].push({
								mateNumber: item['mateNumber'],
								storeId: item['storeId'],
								number: item['number'],
								mateName: item['mateName'],
								mateId: item['mateId'],
								proId: this.proId,
								proName: this.proName,
								systemId: item['systemId'],
								unit: item['unit'],
								model: item['model']
							})
						}  
					}
				};
				this.postGenerateRepairsTask(temporaryMessage)
			},
	
			// 生成维修任务
			postGenerateRepairsTask (data) {
				this.infoText = '创建中...';
				this.showLoadingHint = true;
				createRepairsTask(data).then((res) => {
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
							message: res.data.msg,
							position: 'center'
						});
						this.commonIsTemporaryStorageMethods();
						const pages = getCurrentPages();
						const prevPageInner = pages[pages.length-2];
						if (prevPageInner) {
							prevPageInner.$vm.loadData();
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
					};
					this.infoText = '';
					this.showLoadingHint = false;
				})
				.catch((err) => {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					});
					this.infoText = '';
					this.showLoadingHint = false
				})
			},
			
			// 专门用于根据 allSelectedIds 恢复 currentPageIds 的方法
			restoreCurrentPageSelection() {
			  this.currentPageIds = [];
			    // 遍历当前页展示的数据
			    for (let item of this.inventoryMsgList) {
					let isExist = this.consumableMsgList.filter((innerItem) => { 
						return innerItem.mateId == item.id 
					});
					if (isExist.length > 0) {
						item['disabled'] = true;
						this.currentPageIds.push(item.id);
						if (!this.allSelectedIds.includes(item.id)) {
							this.allSelectedIds.push(item.id);
						}
					} else {
						if (item.quantity > 0) {
							item['disabled'] = false;
							if (this.allSelectedIds.includes(item.id)) {
									this.currentPageIds.push(item.id);
							}
						} else {
							item['disabled'] = true;
						}
					}
				};
				this.currentPageIds = [...this.currentPageIds]
			},
	
			// 搜索物料事件
			searchEvent () {
				 if (this.searchValue == '') {
				 	this.temporaryInventoryMsgList = this.echoInventoryMsgList;
				 	this.inventoryMsgList = this.echoInventoryMsgList;
				 	this.currentPage = 1;
				 	this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
				 	// 根据页码分割展示对应的数据
				 	this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
				 	this.restoreCurrentPageSelection();
				 	return
				 };
				 this.inventoryMsgList = this.echoInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1});
				 this.temporaryInventoryMsgList = this.inventoryMsgList;
				 this.currentPage = 1;
				 this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
				 this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
				 this.restoreCurrentPageSelection()
			},
	
			// 删除物料弹框确定事件
			materialDeleteSure () {
				this.materialDeleteShow = false;
				const deletedItem = this.consumableMsgList[this.deleteMaterialIndex];
				if (deletedItem) {
					const idIndex = this.allSelectedIds.indexOf(deletedItem.mateId);
					if (idIndex > -1) {
						this.allSelectedIds.splice(idIndex, 1);
					}
				};
				this.consumableMsgList.splice(this.deleteMaterialIndex,1)
			},
	
			// 删除物料弹框取消事件
			materialDeleteCancel () {
				
			},
	
			// 耗材名称点击事件
			mateNameEvent (item,index) {
				if (item.disabled) return;
				const innerIndex = this.currentPageIds.indexOf(item.id);
				if (innerIndex > -1) {
						this.currentPageIds.splice(innerIndex, 1);
				} else {
						this.currentPageIds.push(item.id);
				};
				this.currentPageIds = [...this.currentPageIds];
				this.checkboxChange(this.currentPageIds);
			},
			
			// 耗材复选框变化事件
			checkboxChange(value) {
				const currentPageItemIds = this.inventoryMsgList.map(item => item.id);
				this.allSelectedIds = this.allSelectedIds.filter(id => !currentPageItemIds.includes(id));
				this.allSelectedIds = [...new Set([...this.allSelectedIds, ...value])];
				this.selectedMaterialIds = this.allSelectedIds;
			},
	
			// 添加物料确认
			materialSure () {
				const checkConsumableList = this.echoInventoryMsgList.filter(order => this.selectedMaterialIds.includes(order.id) && !order.disabled);
				if (checkConsumableList.length == 0) {
					this.$refs.uToast.show({
						message: '至少要选择一种耗材',
						type: 'error',
						position: 'center'
					})
				} else {
					this.materialShow = false;
					this.materialContentShow = true;
					for (let item of checkConsumableList) {
						this.consumableMsgList.push({
							number: 0,
							mateName: item.mateName,
							mateNumber: item.mateNumber,
							unit: item.unit,
							mateId: item.id,
							quantity: item.quantity,
							model: item.model,
							storeId: this.storeId,
							systemId: this.systemId
						})
					}
				}
			},
	
			// 添加物料取消
			materialCancel () {
				this.materialShow = false;
				this.currentPage = 1
			},
	
	
			// 打开耗材弹框事件
			materialShowEvent () {
				this.materialShow = true;
				this.searchValue = '';
				this.currentPage = 1; // 每次打开默认回到第一页
				this.currentPageIds = [];
				// 打开物料弹框就显示全部物料信息
				this.temporaryInventoryMsgList = this.echoInventoryMsgList;
				this.totalPage = Math.ceil(this.temporaryInventoryMsgList.length / this.pageSize);
				// 截取第一页数据
				this.inventoryMsgList = this.temporaryInventoryMsgList.slice(
						(this.currentPage - 1) * this.pageSize, 
						(this.currentPage - 1) * this.pageSize + this.pageSize
				);
				for (let item of this.inventoryMsgList) {
					// 判断是否已经在外部页面添加过
					let isExist = this.consumableMsgList.some((innerItem) => { 
							return innerItem.mateId == item.id 
					});
					if (isExist) {
						// 已经添加过的，禁用并默认勾选
						item['disabled'] = true;
						this.currentPageIds.push(item.id);
						// 确保它在全局记录中
						if (!this.allSelectedIds.includes(item.id)) {
							this.allSelectedIds.push(item.id);
						}
					} else {
						// 未添加过的
						if (item.quantity > 0) {
							item['disabled'] = false;
							// 如果在弹框中被用户手动勾选过（且没被删除），则恢复勾选状态
							if (this.allSelectedIds.includes(item.id)) {
									this.currentPageIds.push(item.id);
							}
						} else {
							// 库存为0，禁用且不勾选
							item['disabled'] = true;
						}
					}
				};
				this.currentPageIds = [...this.currentPageIds];
			},
	
			// 关闭耗材弹框
			closeScreenDialogEvent () {
				this.materialShow = false;
				this.currentPage = 1
			},
	
			// 物料分页点击事件
			pageClickEvent (text) {
				if (this.totalPage == 0) { return };
				if (text == 'previous') {
					if ( this.currentPage == 1) { return };
					this.currentPage--;
				} else if (text == 'next') {
					if ( this.currentPage == this.totalPage ) { return }
					this.currentPage++
				};
				// 根据页码分割展示对应的数据
				this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
				this.restoreCurrentPageSelection()
			},
	
			// 暂存事件
			temporaryStorageEvent () {
				let casuallyTemporaryStorageCreateRepairsTaskMessage = this.temporaryStorageCreateRepairsTaskMessage;
				casuallyTemporaryStorageCreateRepairsTaskMessage['priorityRadioValue'] = this.priorityRadioValue;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentTaskType'] = this.currentTaskType;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentTaskTypeDefaultIndex'] = this.currentTaskTypeDefaultIndex;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentStructure'] = this.currentStructure;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentStructureDefaultIndex'] = this.currentStructureDefaultIndex;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalDepartment'] = this.currentGoalDepartment;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalDepartmentDefaultIndex'] = this.currentGoalDepartmentDefaultIndex;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentGoalSpaces'] = this.currentGoalSpaces;
				casuallyTemporaryStorageCreateRepairsTaskMessage['problemOverview'] = this.problemOverview;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentTransporter'] = this.currentTransporter;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentTransporterDefaultIndex'] = this.currentTransporterDefaultIndex;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentParticipant'] = this.currentParticipant;
				casuallyTemporaryStorageCreateRepairsTaskMessage['currentUseTool'] = this.currentUseTool;
				casuallyTemporaryStorageCreateRepairsTaskMessage['isMeRadioValue'] = this.isMeRadioValue;
				casuallyTemporaryStorageCreateRepairsTaskMessage['taskDescribe'] = this.taskDescribe;
				casuallyTemporaryStorageCreateRepairsTaskMessage['consumableMsgList'] = this.consumableMsgList;
				casuallyTemporaryStorageCreateRepairsTaskMessage['isTemporaryStorage'] = true;
				casuallyTemporaryStorageCreateRepairsTaskMessage['contact'] = this.contact;
				this.changeTemporaryStorageCreateRepairsTaskMessage(casuallyTemporaryStorageCreateRepairsTaskMessage);
				this.$refs.uToast.show({
					message: '暂存成功',
					position: 'center'
				});
				this.backTo()
			},
	
			// 取消事件
			cancelEvent () {
				this.commonIsTemporaryStorageMethods();
				this.backTo()
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
		.material-box {
		      ::v-deep .u-modal {
		        top: auto !important;
		        left: 0 !important;
		        border-right: 1px solid #fff;
		        bottom: 0 !important;
		        border-top-left-radius: 20px !important;
		        border-top-right-radius: 20px !important;
		        border-bottom-left-radius: 0 !important;
		        border-bottom-right-radius: 0 !important;
		        transform: translate3d(0,0,0) !important;
		        .u-modal__content {
		            padding: 0 20px 0 20px !important;
		            box-sizing: border-box;
		            height: 60vh;
		            display: flex;
		            flex-direction: column;
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
		            .tool-name-list {
		              flex: 1;
		              display: flex;
		              min-height: 0;
		              display: flex;
		              position: relative;
		              flex-direction: column;
		              .tool-name-list-title-innner {
		                display: flex;
		                justify-content: space-between;
		                align-items: center;
		                height: 52px;
		                .search-input {
		                  flex: 1;
		                  padding: 10px;
		                  position: relative;
		                  .van-cell {
		                    padding: 4px 4px 4px 30px;
		                    background: #F7F7F9;
		                    box-sizing: border;
		                    border-radius: 10px;
		                  };
		                  .icon-span {
		                    position: absolute;
		                    top: 50%;
		                    transform: translateY(-50%);
		                    display: inline-block;
		                    left: 16px;
		                    .van-icon {
		                      font-size: 23px
		                    }
		                  }
		                };
		                .search-btn {
		                  font-size: 14px;
		                  color: #3B9DF9;
		                  margin-left: 6px;
		                }
		              };
		              .tool-name-list-content {
		                width: 100%;
		                position: relative;
		                flex: 1;
		                padding: 20px 6px 10px 6px;
		                display: flex;
		                flex-direction: column;
		                height: 0;
		                box-sizing: border-box;
		                border-top: 1px solid #b2b2b2;
		                .static-row {
		                  &::-webkit-scrollbar {
		                    height: 0;
		                    display: none
		                  };
		                  width: 90%;
		                  height: 100%;
		                  overflow-x: auto;
		                  white-space: nowrap;
											display: flex;
											flex-direction: column;
		                  .circulation-area-content-box {
		                    flex: 1;
							position: relative;
							.u-empty {
								position: absolute;
								top: 50%;
								left: 50%;
								transform: translate(-50%,-50%)
							};
		                    .circulation-area-content {
		                      height: 40px;
		                      font-size: 0;
		                      background: #fff;
							  display: flex;
							  align-items: center;
							  width: 100%;
		                      > view {
		                        font-size: 15px;
		                        overflow-x: auto;
		                        white-space: nowrap;
								box-sizing: border-box;
								padding: 0 4px;
								text-align: center;
		                        &:first-child {
								  flex: 0 0 60%;
								  text-align: left !important; 
		                        };
		                        &:nth-child(2) {
		                          flex: 0 0 20%;
		                        };
		                        &:nth-child(3) {
		                          flex: 0 0 25%;
		                        };
		                        &:nth-child(4) {
		                          flex: 0 0 30%;
		                        }
		                      }
		                    }
		                  };  
		                  .circulation-area-title-box {
							width: 100%;
							height: 40px;
		                    display: flex;
		                    align-items: center;
		                    >view {
								text-align: center;
								font-size: 16px;
								font-weight: bold;
		                      &:first-child {
		                        flex: 0 0 60%;
		                        text-align: left !important;
		                      };
		                      &:nth-child(2) {
		                        flex: 0 0 20%;
		                      };
		                      &:nth-child(3) {
		                        flex: 0 0 25%;
		                      };
		                      &:nth-child(4) {
		                        flex: 0 0 30%;
		                      }
		                    }
		                  }
		                };
		                .absolute-row {
		                  height: 90%;
		                  width: 10%;
		                  z-index: 100;
		                  position: absolute;
		                  top: 20px;
		                  display: flex;
		                  flex-direction: column;
		                  right: 0;
		                  background: #fff;
						  .u-checkbox-group--column {
						  	flex: 1;
						  };
		                  .absolute-title {
		                    line-height: 20px;
		                    width: 100%;
		                    font-size: 0;
		                    padding: 10px 0;
		                    box-sizing: border-box;
		                  };
		                  .absolute-operate {
		                    width: 100%;
		                    flex: 1;
							min-height: 0;
							display: flex;
		                    overflow-y: auto;
		                    >view {
		                      >view {
		                        line-height: 20px;
		                        display: flex;
		                        justify-content: center;
		                        align-items: center;
								padding: 7px 0;
								box-sizing: border-box;
		                        .u-checkbox {
		                        	.u-checkbox__icon-wrap {
		                        		margin-right: 0 !important;
		                        	}
		                        }
		                      }
		                    }  
		                  }
		                };
		                .shadow-box {
		                  position: absolute;
		                  background: #fff;
		                  right: 0;
		                  width: 10%;
		                  height: 90%;
		                  box-shadow: -3px 0 3px 0 #dddddd;
		                }  
		              };
		              .page-area {
		                height: 40px;
		                width: 70%;
		                margin: 0 auto;
		                display: flex;
		                align-items: center;
		                justify-content: space-between;
		                .page-left {
		                  font-size: 14px;
		                  padding: 4px 6px;
		                  border-radius: 2px;
		                  box-sizing: border-box;
		                  border: 1px solid #d0d0d0
		
		                };
		                .page-center {
		                  >text {
		                    font-size: 12px;
		                    color: #333;
		                    &:nth-child(1) {
		                      color: #3B9DF9
		                    }
		                  }
		                };
		                .page-right {
		                  font-size: 14px;
		                  border-radius: 2px;
		                  padding: 4px 6px;
		                  box-sizing: border-box;
		                  border: 1px solid #d0d0d0
		                };
		                .pageSpanStyle {
		                  color: #d0d0d0 !important
		                }
		              }
		            }
		        };
						.u-line {
							display: none !important;
						};
		        .u-modal__button-group {
		          padding: 10px 20px 20px 20px !important;
		          box-sizing: border-box;
		          justify-content: space-between;
							.u-line {
								display: none !important;
							};
		        .u-modal__button-group__wrapper--cancel {
		            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
		            background: #fff;
		            border-radius: 30px;
		            margin-right: 20px;
								.u-modal__button-group__wrapper__text {
									color: #1864FF !important;
								}
		        };
		        .u-modal__button-group__wrapper--confirm {
		            background: linear-gradient(to right, #6cd2f8, #2390fe);
		            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
		            border-radius: 30px;
								.u-modal__button-group__wrapper__text {
									color: #fff !important;
								}
		        }
		        }
		      }
		  };
		  .material-delete-box {
		    ::v-deep .u-modal {
		      .u-modal__content {
		          padding: 20px 20px 0 20px !important;
		          box-sizing: border-box;
		          display: flex;
		          flex-direction: column;
		          .dialog-top {
		            text-align: center;
					image {
						width: 60px;
					}
		          };
		          .dialog-center {
		            text-align: center;
		            line-height: 20px;
		            padding: 20px 0;
		            box-sizing: border-box;
		            font-weight: bold;
		            color: #101010;
		            font-size: 16px
		          }
		        };
						.u-line {
							display: none !important;
						};
		        .u-modal__button-group {
		          padding: 10px 40px 20px 40px !important;
		          box-sizing: border-box;
		          justify-content: space-between;
							.u-line {
								display: none !important;
							};
		        .u-modal__button-group__wrapper--cancel {
		            height: 40px;
		            border: 1px solid #3B9DF9;
		            border-radius: 8px;
		            margin-right: 20px;
								.u-modal__button-group__wrapper__text {
									color: #3B9DF9 !important;
								}
		        };
		        .u-modal__button-group__wrapper--confirm {
		            height: 40px;
		            background: #3B9DF9;
		            border-radius: 8px;
								.u-modal__button-group__wrapper__text {
									color: #fff !important;
								}
		        }
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
						 padding: 10px 6px 10px 16px;
						 box-sizing: border-box;
						 background: #fff;
						 display: flex;
						 align-items: center;
						 justify-content: space-between;
						 font-size: 14px;
						 margin-top: 6px;
						 .message-one-left {
							 width: 20%;
							 color: #101010
						 };
						 .message-one-right {
							 flex: 1;
							 height: 20px;
							 float: right;
							 position: relative;
							 /deep/ .u-radio-group {
							 	position: absolute;
							 	width: 100% !important;
							 	top: 50%;
							 	transform: translateY(-50%);
							 	left: 0;
							 	display: flex;
							 	justify-content: space-between;
							 	.u-radio {
							 		flex: 1 0 auto !important;
							 		justify-content: center;
							 		.u-radio__label {
							 			margin-right: 9px;
							 		}
							 	}
							 }
						 }
					 };
					 .is-me {
						 .message-one-left {
							 color: #9E9E9A !important
						 };
						 .message-one-right {
								flex: 1;
								::v-deep .u-radio-group {
									display: flex;
									justify-content: flex-end;
									position: absolute;
									width: 100%;
									top: 50%;
									transform: translateY(-50%);
									left: 0;
									.u-radio {
										flex: none !important;
										&:last-child {
											margin-left: 20px;
										}
									}
								}
						 }
					 };
					 .select-box {
						 width: 100%;
						 padding: 8px 6px;
						 box-sizing: border-box;
						 background: #fff;
						 display: flex;
						 align-items: center;
						 justify-content: space-between;
						 font-size: 14px;
						 margin-top: 6px;
						 .select-box-left {
							 padding-right: 10px;
							 box-sizing: border-box;
							 >text {
								 &:nth-child(1) {
									 color: red
								 };
								 &:nth-child(2) {
									 color: #9E9E9A;
									 padding-right: 6px;
									 box-sizing: border-box
								 };
							 }
						 };
						 .select-box-right {
							 flex: 1;
							 justify-content: flex-end;
							 align-items: center;
							 display: flex;
							 width: 0;
							 >text {
								 color: #101010;
								 text-align: right;
								 flex: 1;
								 @include no-wrap
							 }
						 }
					 };
					 .end-select-box {
						 .select-box-left {
							 padding: 0 10px;
							 box-sizing: border-box;
							 >text {
								 &:nth-child(1) {
									 color: #9E9E9A;
									 padding-right: 6px;
									 box-sizing: border-box
								 };
							 }
						 };
					 };
					 .problem-overview {
						 align-items: center
					 };
					 .transport-type {
						 width: 100%;
						 padding: 10px 6px;
						 box-sizing: border-box;
						 background: #fff;
						 display: flex;
						 justify-content: space-between;
						 font-size: 14px;
						 margin-top: 6px;
						 .transport-type-left {
							 width: 105px;
							 >text {
								 &:nth-child(1) {
									 color: #9E9E9A
								 }
							 }
						 };
						 .transport-type-right {
							 flex: 1;
							 width: 0;
							 display: flex;
							 flex-wrap: wrap;
							 .transport-type-list {
								 display: inline-block;
								 font-size: 13px;
								 color: #9E9E9A;
								 background: #F9F9F9;
								 text-align: center;
								 border-radius: 10px;
								 margin-right: 10px;
								 margin-bottom: 10px;
								 line-height: 20px;
								 padding: 6px 10px;
								 box-sizing: border-box
							 };
							 .transportTypeListStyle {
								 color: #fff !important;
								 background: #3B9DF9 !important
							 }
						 }
					 };
					 .transport-type {
						 .transport-type-right {
							 ::v-deep .u-textarea {
								 background: #F9F9F9;
							 }
						 }
					 };
					 .problem-overview {
						 .transport-type-right {
							 ::v-deep .u-input {
								 padding: 4px 6px !important;
								 box-sizing: border-box;
								 background: #F9F9F9;
							 }
						 }
					 };
					 .concat-box {
						 width: 100%;
						 padding: 8px 6px;
						 box-sizing: border-box;
						 background: #fff;
						 display: flex;
						 justify-content: space-between;
						 align-items: center;
						 font-size: 14px;
						 margin-top: 6px;
						 .concat-box-left {
							 width: 105px;
							 >text {
								color: #9E9E9A;
							 }
						 };
						 .concat-box-right {
							 flex: 1;
							 ::v-deep .u-input {
								 padding: 4px 6px !important;
								 box-sizing: border-box;
								 background: #F9F9F9
							 }
						 }
					 };
					 .consumable-management-area {
						 width: 100%;
							 padding: 8px 10px;
							 box-sizing: border-box;
							 background: #fff;
							 font-size: 14px;
							 margin-top: 10px;
							.circulation-area {
								max-height: 90%;
								margin: 0 auto;
								overflow: auto;
								font-size: 0;
							> view {
								 height: 50px;
								 background: #fff;
								 margin-bottom: 6px;
								 display: flex;
								 align-items: center;
								 &:last-child {
									 margin-bottom:0
								 };
								 .scroll-box {
								   flex: 1;
								   width: 0;
								   height: 50px;
								   white-space: nowrap;  
								   margin-right: 2%;
								   .scroll-item {
								     display: inline-block;
										 width: 100%;
								     height: 100%;
								     line-height: 50px;
								     text-align: left;
								     font-size: 16px;
								   }
								 };
								 > view {
									 height: 50px;
									 line-height: 50px;
									 font-size: 16px;
									 text-align: center;
									 &:first-child {
										 width: 5%;
										 @include no-wrap
									 };
									 &:nth-child(3) {
										 width: 30%;
										 display: flex;
										 align-items: center;
										 ::v-deep .u-number-box {
											 .u-number-box__minus  {
												 color: #fff;
												 background-color: #2db8f9;
												 border: 1px solid #2db8f9;
												 &:before {
													 height: 3px
												 }
											 };
											 .u-number-box__plus {
												 color: #fff;
												 background-color: #2db8f9;
												 border: 1px solid #2db8f9;
												 &:before {
													 height: 3px
												 };
												 &:after {
													 width: 3px
												 }
											 }
										 }
									 };
									 &:last-child {
										 width: 10%;
										 @include no-wrap
										 display: flex;
										 justify-content: center;
										 align-items: center;
									 }
								 }
							}					 
						 };
						 .circulation-area-title {
							 display: flex;
							 justify-content: space-between;
							 align-items: center;
							 line-height: 30px;
							 margin-bottom: 8px;
							 >text {
								 font-size: 14px;
								 display: inline-block;
								 &:first-child {
									 color: #101010;
									 font-weight: bold;
								 };
								 &:last-child {
									 width: 55px;
									 height: 23px;
									 border-radius: 4px;
									 text-align: center;
									 line-height: 23px;
									 background: #3B9DF9;
									 color: #fff;
								 }
							 }
						 }
					 }
				 };
				 .btn-box {
					 width: 90%;
					 margin: 0 auto;
					 height: 90px;
					 display: flex;
					 align-items: center;
					 justify-content: space-between;
					 >text {
						 width: 40%;
						 display: inline-block;
						 height: 45px;
						 font-size: 18px;
						 line-height: 45px;
						 background: #fff;
						 text-align: center;
						 border-radius: 30px;
						 &:nth-child(1) {
							 color: #fff;
							 background: linear-gradient(to right, #6cd2f8, #2390fe);
							 box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
							 margin-right: 30px
						 };
						 &:nth-child(2) {
							 color: #1864FF;
							 box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
							 margin-right: 30px
						 };
						 &:last-child {
							 color: #1864FF;
							 box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1)
						 }
					 }
				 }
		 }
		}
	}
</style>
