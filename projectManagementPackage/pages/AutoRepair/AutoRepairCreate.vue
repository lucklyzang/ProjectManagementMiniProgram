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
					<u-icon name="scan" color="#fff" size="24" @click="onClickRight"></u-icon>
				</template>
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-box-inner">
				 <view class="problem-description-box">
						 <view class="problem-description-tit">
								问题描述
						 </view>
						 <view class="problem-description-content">
								<view class="task-type">
									<view class="problem-description-content-top">
										<text>*</text>
										<text>任务类型</text>
									</view>
									<view class="problem-description-content-bottom">
										<text v-for="(item,index) in taskTypeOption" :key="index" @click="taskTypeClickEvent(index,item)" :class="{'taskTypeStyle': taskTypeIndex === index}">
											{{ item.text }}
										</text>
									</view>
								</view>
								<view class="goal-department">
									<view class="goal-department-left">
										<text>*</text>
										<text>目的科室</text>
									</view>
									<view class="goal-department-right" @click="goalDepartmentClickEvent">
										<text>{{ currentDepartment.text }}</text>
										<u-icon name="arrow-right" color="#989999" size="24"></u-icon>
									</view>
								</view>
								<view class="goal-department goal-room">
									<view class="goal-department-left">
										<text>目的房间</text>
									</view>
									<view class="goal-department-right" @click="goalRoomClickEvent">
										<text>{{ disposeCheckType(currentRoom) }}</text>
										<u-icon name="arrow-right" color="#989999" size="24"></u-icon>
									</view>
								</view>
								<view class="list-line-image">
									<view>
										<text>*</text>
										<text>问题图片</text>
									</view>
									 <view class="image-list">
											<view v-for="(item, index) in problemPicturesList" :key='index'>
													<image :src="item" @click="enlareEvent(item)"></image>
													<view class="icon-box" @click="issueDelete(index,item)">
														<u-icon name="close" color="#101010" size="24"></u-icon>
													</view>
											</view>
											<view @click="issueClickEvent">
												<u-icon name="plus" color="#101010" size="30"></u-icon>
											</view>
									</view>
								</view>
								<view class="issue-content">
									<view class="issue-left">
										问题描述
									</view>
									<view class="issue-right">
										<u--textarea
											v-model="issueDescribe"
											rows="4"
											autosize
											border="none"
											maxlength="500"
											placeholder="请输入问题描述"
											count>
										</u--textarea>
									</view>
								</view>
						 </view>
				 </view>
				 <view class="maintenance-record-box">
					<view class="maintenance-record-tit">维修记录</view>
					<view class="maintenance-record-content">
						<view class="maintenance-man">
							<view class="maintenance-man-left">
								<text>*</text>
								<text>维修员</text>
							</view>
							<view class="maintenance-man-right">
								<text>{{ userInfo.name }}</text>
							</view>
						</view>
						<view class="participation-man">
							<view class="participation-man-left">
								<text>参与人</text>
							</view>
							<view class="participation-man-right" @click="participationPersonClickEvent">
								<text>{{ disposeTaskPresent(currentParticipant) }}</text>
								<u-icon name="arrow-right" color="#989999" size="24"></u-icon>
							</view>
						</view>
						 <view class="list-line-image">
								<view>
									<text>*</text>
									<text>修复图片</text>
								</view>
									<view class="image-list">
										<view v-for="(item, index) in repairPicturesList" :key='index'>
												<image :src="item" @click="enlareRepairEvent(item)"></image>
												<view class="icon-box" @click="repairDelete(index,item)">
														<u-icon name="close" color="#101010" size="24"></u-icon>
												</view>
										</view>
										<view @click="repairClickEvent">
											<u-icon name="plus" color="#101010" size="30"></u-icon>
										</view>
								</view>
							</view>
					</view>
				 </view>
				 <view class="consumable-management-area">
						<view class="circulation-area-title">
							<text>使用物料</text>
							<text @click="materialShowEvent">添加</text>
						</view>
						<view class="circulation-area">
							<view v-for="(item,index) in consumableMsgList" :key="item.mateId">
								<view>{{index+1}}</view>
								<view>
									{{item.mateName}}-{{item.model}}
								</view>
								<view>
									<u-number-box v-model.number="item.number"
										button-size="36"
										color="#ffffff"
										bgColor="#2db8f9"
										iconStyle="color: #fff"
										@change="function(val){stepperEvent(item,index,value)}"
										theme="round" 
										integer 
										@plus="stepperPlusEvent(item,index)"
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
				 <view class="operation-box">
					 <text class="operate-one" @click="sureEvent">确认</text>
					<text class="operate-three" @click="cancelEvent">取消</text>
				 </view>
			</view>
		</view>
		<!-- 选择科室弹窗 -->
		<view class="choose-department">
			<u-popup
				:show="departmentDialogShow"
				:closeOnClickOverlay="true"
				mode="bottom" :round="10" :closeable="true" @close="departmentDialogShow=false"
			>
				<view class="department-content-box">
					<view class="left-wrapper">
						<view class="left">
							<u-empty text="暂无楼栋" v-if="constructionList.length == 0"></u-empty>
							<view class="construction-list" v-for="(item,index) in constructionList" :key="index" @click="constructionItemClickEvent(item,index)" :class="{'constructionListStyle': currentConstructionIndex === index}">
								{{ item['text'] }}
							</view>
						</view>
					</view>  
					<!-- <view class="center-wrapper">
						<view class="center">
							<view class="tier-list" v-for="(item,index) in tierList" :key="index" @click="tierItemClickEvent(item,index)" :class="{'tierListStyle': currentTierIndex == index}">
								{{ item }}
							</view>
						</view>
					</view> -->
					<view class="right-wrapper">
						<view class="right">
							<u-empty text="暂无科室" v-if="departmentList.length == 0"></u-empty>
							<view class="department-list" v-for="(item,index) in departmentList" :key="index" @click="departmentItemClickEvent(item,index)" :class="{'departmentListStyle': currentDepartmentIndex === index}">
								{{ item.text }}
							</view>
						</view>
					</view>
				</view>
			</u-popup>
		</view>
		<!-- 选择房间弹窗 -->
		<view class="choose-room">
			<u-popup
				:show="roomDialogShow"
				:closeOnClickOverlay="true"
				mode="bottom" :round="10" :closeable="true"
				@close="closeRoomDialogEvent"
			>
				<view class="room-content-box">
					<u-empty text="暂无房间" v-if="roomList.length == 0"></u-empty>
					<view class="room-content" @click="roomItemClickEvent(item,index)" :class="{'roomContentStyle': item.selected}" v-for="(item,index) in roomList" :key="index">
						{{ item.text }}
					</view>
				</view>
			</u-popup>
		</view>
		<!-- 参与人弹窗 -->
		<view class="participation-person">
			<u-popup
				:show="participationPersonDialogShow"
				@close="closeParticipationPersonDialogEvent"
				:closeOnClickOverlay="true"
				mode="bottom" :round="10" :closeable="true"
			>
				<view class="participation-person-box">
					<u-checkbox-group v-model="participationPersonIds" placement="column">
						<u-empty text="暂无参与人" v-if="participationPersonList.length == 0"></u-empty>
						<view class="participation-person-content" @click="participationPersonEvent(item)" v-for="(item,index) in participationPersonList" :key="index">
							<view class="participation-person-content-left">
								{{ item.text }}
							</view>
							<view class="participation-person-content-right">
								<u-checkbox
									size="26"
									iconSize="22"
									active-color="#3B9DF9"
									:key="item.value"
									:name="item.value"
									shape="circle" 
									:checked="participationPersonIds.includes(item.value)"
								>
								</u-checkbox>
							</view>
						</view>
					</u-checkbox-group>
				</view>
			</u-popup>
		</view>
		<!-- 图片放大弹框  -->
		<view class="img-dislog-box">
			<u-modal :show="imgBoxShow" @confirm="imgBoxShow = false" confirmText="关闭">
			  <image :src="currentImgUrl" mode="widthFix"></image>
			</u-modal> 
		</view>
		 <!-- 问题图片删除 -->
		<u-modal :show="deleteInfoDialogShow" title="确定删除此图片?" 
		  confirmColor="#218FFF" :showCancelButton="true"
		  @confirm="sureDeleteEvent"
		  @cancel="deleteInfoDialogShow = false"
		  >
		</u-modal>
		<!-- 修复图片删除 -->
		<u-modal :show="deleteRepairInfoDialogShow" title="确定删除此图片?" 
		  confirmColor="#218FFF" :showCancelButton="true"
		  @confirm="sureRepairDeleteEvent"
		  @cancel="deleteRepairInfoDialogShow = false"
		>
		</u-modal>
		<!-- 退出提示框   -->
		<view class="quit-info-box">
		   <u-modal :show="quitInfoShow"  :showCancelButton="true"
			  @confirm="quitSure" @cancel="quitCancel" confirmText="是"
			  cancelText="否"
			>
			  <view class="delete-icon">
				<u-icon name="close" size="24" @click="quitInfoShow = false"></u-icon>
			  </view>
			  <view class="dialog-title">
				是否保留本次填写的内容?
			  </view>
			  <view class="dialog-center">
				你下次进入创建自主报修时,将恢复本次填写的内容。
			  </view>
		  </u-modal>
		</view>
		<!-- 物料弹框  -->
		<view class="material-box">
		  <u-modal :show="materialShow"  :showCancelButton="true"
			  @confirm="materialSure" @cancel="materialCancel" confirmText="添加"
			  cancelText="取消"
			>
			  <view class="dialog-top">
				<view class="select-title">添加耗材</view>
				<van-icon name="cross" size="24" @click="closeScreenDialogEvent" />
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
						<u-checkbox-group v-model="selectedMaterialIds" placement="column">
						  <view v-for="(item,index) in inventoryMsgList" :key="item.id">
							<view>
								<u-checkbox
									size="26"
									iconSize="22"
									active-color="#3B9DF9"
									:key="item.id"
									:name="item.id"
									shape="square"
									:checked="selectedMaterialIds.includes(item.id)"
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
	import { scanDepartment, completeAutoRepairsTask } from '@/api/autoRepairCreate.js'
	import { getTransporter, querySpace, queryDepartment, queryRepairsTaskTool, queryStructure, queryRepairsTaskMaterial, getRepairsTaskType} from '@/api/taskScheduling.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				deleteInfoPng: require('@/static/img/delete-info.png'),
				currentConstructionIndex: null,
				currentDepartmentIndex: null,
				currentTierIndex: null,
				participationPersonIds: [],
				selectedMaterialIds: [],
				isIssuePhoto: false,
				isRepairPhoto: false,
				roomDialogShow: false,
				participationPersonDialogShow: false,
				departmentDialogShow: false,
				deleteInfoDialogShow: false,
				deleteRepairInfoDialogShow: false,
				quitInfoShow: false,
				isExpire: false,
				imgIndex: '',
				currentTaskType: {},
				currentConstruction: {
					text: '',
					value: ''
				},
				currentDepartment: {
					text: '',
					value: ''
				},
				currentRoom: [],
				currentParticipant: [],
				taskTypeOption: [],
				imgOnlinePathArr: [],
				imgRepairOnlinePathArr: [],
				imgDeleteUrl: '',
				issueDescribe: '',
				moveInfo: {
					startX: ''
				},
				constructionList: [],
				tierList: [],
				departmentList: [],
				roomList: [],
				participationPersonList: [],
				useToolOption: [],
				problemPicturesList: [],
				problemFileList: [],
				repairPicturesList: [],
				repairFileList: [],
				currentImgUrl: '',
				taskTypeIndex: null,
				imgBoxShow: false,
				totalPage: '',
				pageSize: 6,
				currentPage: 1,
				inventoryMsgList: [],
				echoInventoryMsgList: [],
				temporaryInventoryMsgList: [],
				consumableMsgList: [],
				materialShow: false,
				materialDeleteShow: false,
				deleteMaterialIndex: '',
				fromSource: '',
				deleteMaterial: '',
				searchValue: ''
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'createAutoRepairTaskMessage',
				'statusBarHeight',
				'navigationBarHeight'
			]),
			proId () {
				return this.userInfo.extendData.proId
			},
			userName () {
				return this.userInfo.name
			},
			proName () {
				return this.userInfo.extendData.proName
			},
			workerId () {
				return this.userInfo.extendData.userId
			}
		},
		onLoad () {
			this.parallelFunction()
		},
		methods: {
			...mapMutations([
				'changeCreateAutoRepairTaskMessage'
			]),
			
			// 顶部导航返回事件
			backTo () {
				this.quitInfoShow = true;
			},
			
			onClickRight() {
				this.scanQRCode()
			},
			
			// 回显暂存的创建自主报修任务信息
			echoTemporaryStorageMessage () {
				let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
				this.taskTypeIndex = casuallyTemporaryStorageCreateAutoRepairTaskMessage['taskTypeIndex'];
				this.currentTaskType = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentTaskType'];
				this.currentConstructionIndex = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstructionIndex'];
				this.currentConstruction = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstruction'];
				this.currentDepartment = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartment'];
				this.currentRoom = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoom'];
				this.problemPicturesList = casuallyTemporaryStorageCreateAutoRepairTaskMessage['problemPicturesList'];
				this.issueDescribe = casuallyTemporaryStorageCreateAutoRepairTaskMessage['issueDescribe'];
				this.currentParticipant = casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentParticipant'];
				this.repairPicturesList = casuallyTemporaryStorageCreateAutoRepairTaskMessage['repairPicturesList'];
				this.consumableMsgList = casuallyTemporaryStorageCreateAutoRepairTaskMessage['consumableMsgList'];
				this.imgOnlinePathArr = casuallyTemporaryStorageCreateAutoRepairTaskMessage['imgOnlinePathArr'];
				this.imgRepairOnlinePathArr = casuallyTemporaryStorageCreateAutoRepairTaskMessage['imgRepairOnlinePathArr'];
				if (this.fromSource == '/autoRepairTaskSignature') {
					this.problemPicturesList = this.imgOnlinePathArr.concat(this.problemPicturesList.filter((item) => { return item.indexOf('https://') != -1}));
					this.imgOnlinePathArr = [];
					this.repairPicturesList = this.imgRepairOnlinePathArr.concat(this.repairPicturesList.filter((item) => { return item.indexOf('https://') != -1}));
					this.imgRepairOnlinePathArr = []
				}
			},
	
			// 关闭参与人弹窗事件
			closeParticipationPersonDialogEvent () {
				this.participationPersonDialogShow = false;
				this.currentParticipant = this.participationPersonList.filter(item => this.participationPersonIds.includes(item.value));
				console.log('选择的参与人',this.currentParticipant);
			},
			
			// 参与人姓名点击事件
			participationPersonEvent (item) {
				const index = this.participationPersonIds.indexOf(item.value)
				if (index > -1) {
					this.participationPersonIds.splice(index, 1)
				} else {
					this.participationPersonIds.push(item.value)
				}
			},
	
			// 关闭目的房间弹窗事件
			closeRoomDialogEvent () {
				this.roomDialogShow = false;
				this.currentRoom = this.roomList.filter((item) => { return item.selected == true })
			},
	
			// 处理维修任务空间信息
			disposeCheckType (item) {
				if (!item) { return };
				if (item.length == 0) { return ''};
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.text)
				};
				return temporaryArray.join('、')
			},
	
			// 处理维修任务参与者
			disposeTaskPresent (item) {
				if (!item) { return };
				if (item.length == 0) { return ''};
				let temporaryArray = [];
				for (let innerItem of item) {
					temporaryArray.push(innerItem.text)
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
	
			// 任务类型点击事件
			taskTypeClickEvent (index,item) {
				this.taskTypeIndex = index;
				this.currentTaskType = item;
				this.taskTypeOption[index]['selected'] = !this.taskTypeOption[index]['selected']
			},
	
			// 楼栋名称点击事件
			constructionItemClickEvent (item,index) {
				this.currentConstruction['text'] = item['text'];
				this.currentConstruction['value'] = item['value'];
				this.currentConstructionIndex = index;
				// 根据楼栋建筑查询科室
				this.getDepartmentByStructureId(this.currentConstruction['value'],false,'常规')
			},
	
			// 楼层点击事件
			tierItemClickEvent (item,index) {
				this.currentTierIndex = index
			},
	
			// 房间名称点击事件
			roomItemClickEvent (item,index) {
				item['selected'] = !item['selected']
			},
	
			// 科室名称点击事件
			departmentItemClickEvent (item,index) {
				this.currentDepartmentIndex = index;
				this.currentDepartment['text'] = item['text'];
				this.currentDepartment['value'] = item['value'];
				// 根据科室查询房间信息
				this.getSpacesByDepartmentId(this.currentDepartment['value'],true)
			},
	
			// 目的房间点击事件
			goalRoomClickEvent () {
				// 根据科室查询房间信息
				if (!this.currentDepartment['value'] && this.currentDepartment['value'] != 0) { 
					this.$toast('请选择目的科室');
					return 
				};
				this.roomDialogShow = true
			},
	
			// 目的科室点击事件
			goalDepartmentClickEvent () {
				this.departmentDialogShow = true
			},
	
			// 参与人点击事件
			participationPersonClickEvent () {
				this.participationPersonDialogShow = true
			},
	
			// 获取阿里云签名接口
			getSign (filePath = '',text) {
				return new Promise((resolve, reject) => {
					getAliyunSign().then((res) => {
						if (res && res.status == 200) {
							// 存储签名信息
							this.changeOssMessage(res.data);
							let temporaryTimeInfo = {};
							temporaryTimeInfo['expire'] = Number(res.data.expire);
							// 存储过期时间信息
							this.changeTimeMessage(temporaryTimeInfo);
							if (this.isExpire) {
								this.uploadImageToOss(filePath,text)
							};
							this.isExpire = false;
							resolve()
						} else {
							this.infoText = '';
							this.showLoadingHint = false;
							this.$refs.uToast.show({
								message: res.data.msg,
								type: 'error',
								position: 'center'
							});
							reject()
						}
					})
					.catch((err) => {
						this.infoText = '';
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						});
						reject()
					})
				})	
			},
			
			// 上传图片到阿里云服务器
			uploadImageToOss (filePath,text) {
				return new Promise((resolve, reject) => {
					// OSS地址
					const aliyunServerURL = this.ossMessage.host;
					// 存储路径(后台固定位置+随即数+文件格式)
					const aliyunFileKey = this.ossMessage.dir + new Date().getTime() + Math.floor(Math.random() * 100) + base64ImgtoFile(filePath).name;
					// 临时AccessKeyID0
					const OSSAccessKeyId = this.ossMessage.accessid;
					// 加密策略
					const policy = this.ossMessage.policy;
					// 签名
					const signature = this.ossMessage.signature;
					let formData = new FormData();
					formData.append('key',aliyunFileKey);
					formData.append('policy',policy);
					formData.append('OSSAccessKeyId',OSSAccessKeyId);
					formData.append('success_action_status','200');
					formData.append('Signature',signature);
					formData.append('file',base64ImgtoFile(filePath));
					axios({
						url: aliyunServerURL,
						method: 'post',
						data: formData,
						headers: {'Content-Type': 'multipart/form-data'}
					}).then((res) => {
						if (text == "issue") {
							this.imgOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
						} else if (text == "repair") {
							this.imgRepairOnlinePathArr.push(`${aliyunServerURL}/${aliyunFileKey}`);
						};
						resolve()
					})
					.catch((err) => {
						this.infoText = '';
						this.showLoadingHint = false;
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						});
						reject()
					})
				})
			},
	
			// 确定退出(暂存)
			quitSure () {
				this.quitInfoShow = false;
				this.temporaryStorageEvent();
				uni.navigateBack()
			},
	
			// 取消退出(不暂存)
			quitCancel () {
				this.quitInfoShow = false;
				uni.navigateBack()
			},
	
			// 并行查询任务类型、目的建筑、维修员、物料信息、维修工具
			parallelFunction (type) {
					this.infoText = '加载中···';
					this.showLoadingHint = true;
					Promise.all([this.getTaskType(), this.getStructure(), this.queryTransporter(), this.getRepairsTaskMaterial(), this.getRepairsTaskTool()])
					.then((res) => {
						this.infoText = '';
						this.showLoadingHint = false;
						if (res && res.length > 0) {
							this.constructionList = [];
							this.participationPersonList = [];
							this.taskTypeOption = [];
							this.useToolOption = [];
							let [item1,item2,item3,item4,item5] = res;
							if (item1) {
								// 任务类型
								for (let i = 0, len = item1.length; i < len; i++) {
									this.taskTypeOption.push({
										text: item1[i].typeName,
										value: item1[i].id,
										id: i,
										selected: false
									})
								};
								if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
									if (this.createAutoRepairTaskMessage['currentTaskType']['value'] || this.createAutoRepairTaskMessage['currentTaskType']['value'] === 0) {
										let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
										let TemporaryIndex = this.taskTypeOption.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentTaskType']['value']});
										casuallyTemporaryStorageCreateAutoRepairTaskMessage['taskTypeIndex'] = TemporaryIndex;
										this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
									}
								}  
							};
							if (item2) {
								// 目的建筑
								for (let i = 0, len = item2.length; i < len; i++) {
									this.constructionList.push({
										text: item2[i].structName,
										value: item2[i].id,
										id: i
									})
								};
								if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
									if (this.createAutoRepairTaskMessage['currentConstruction']['value'] || this.createAutoRepairTaskMessage['currentConstruction']['value'] === 0) {
										let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
										let TemporaryIndex = this.constructionList.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentConstruction']['value']});
										casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstructionIndex'] = TemporaryIndex;
										this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
										this.getDepartmentByStructureId(this.createAutoRepairTaskMessage['currentConstruction']['value'],true,'常规')
									}
								}
							};
							if (item3) {
								// 参与人
								for (let i = 0, len = item3.length; i < len; i++) {
									this.participationPersonList.push({
										text: item3[i].workerName,
										value: item3[i]['id'],
										checked: false
									})
								};
								if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
									if (this.createAutoRepairTaskMessage['currentParticipant'].length > 0) {
										this.participationPersonList.forEach((innerItem) => {
											if (this.createAutoRepairTaskMessage['currentParticipant'].findIndex((el) => { return el.value == innerItem.value }) != -1) {
												innerItem['checked'] = true
											}
										})
									}
								}
							};
							// 物料信息
							if (item4) {
								this.inventoryMsgList = [];
								this.temporaryInventoryMsgList = [];
								this.echoInventoryMsgList = [];
								if (item4.length > 0) {
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
							//判断是否回显暂存的数据
							if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
								this.echoTemporaryStorageMessage()
							}
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
	
				// 根据建筑查询科室信息
				getDepartmentByStructureId (structureId,isInitial,text) {
				this.infoText = '查询中···';
				this.showLoadingHint = true;
				this.departmentList = [];
				if (text == '常规') {
					this.currentDepartment = {
						text: '',
						value: ''
					}
				};  
				this.currentDepartmentIndex = null;
				this.roomList = [];
				this.currentRoom = [];
				queryDepartment(this.proId,structureId)
				.then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							for (let i = 0, len = res.data.data.length; i < len; i++) {
								this.departmentList.push({
									text: res.data.data[i].departmentName,
									value: res.data.data[i].id,
									id: i
								})
							};
							if (text == '扫码') {
								let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
								let TemporaryIndex = this.departmentList.findIndex((innerItem) => { return innerItem.value == this.currentDepartment['value']});
								casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartmentIndex'] = TemporaryIndex;
								this.currentDepartmentIndex = TemporaryIndex;
								this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
							};
							if (isInitial) {
								// 根据科室查询房间信息
								if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}') {
									if (this.createAutoRepairTaskMessage['currentDepartment']['value'] || this.createAutoRepairTaskMessage['currentDepartment']['value'] === 0) {
										let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
										let TemporaryIndex = this.departmentList.findIndex((innerItem) => { return innerItem.value == this.createAutoRepairTaskMessage['currentDepartment']['value']});
										casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartmentIndex'] = TemporaryIndex;
										this.currentDepartmentIndex = TemporaryIndex;
										this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
										this.getSpacesByDepartmentId(this.createAutoRepairTaskMessage['currentDepartment']['value'],false)
									}
								}  
							}  
						}
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
	
			// 根据科室查询房间信息
			getSpacesByDepartmentId (depId,flag) {
				this.infoText = '查询中···';
				this.showLoadingHint = true;
				this.roomList = [];
				if (flag) {
					this.currentRoom = []
				};
				querySpace(this.proId,depId)
				.then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							for (let i = 0, len = res.data.data.length; i < len; i++) {
								this.roomList.push({
									text: res.data.data[i].spaceName,
									value: res.data.data[i].id,
									selected: false
								})
							};
							if (JSON.stringify(this.createAutoRepairTaskMessage) != '{}' && !flag) {
								if (this.createAutoRepairTaskMessage['currentRoom'].length > 0) {
									this.roomList.forEach((innerItem) => {
										if (this.createAutoRepairTaskMessage['currentRoom'].findIndex((el) => { return el.value == innerItem.value }) != -1) {
											innerItem['selected'] = true
										}
									})
								}
							}  
						}
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
						} else {
							reject(res.data.msg)
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
							} else {
								reject(res.data.msg)
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
						} else {
							reject(res.data.msg)
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
						} else {
							reject(res.data.msg)
						}
					})
					.catch((err) => {
						reject(err)
					})
				})
			},
	
			// 任务创建维修取消事件
			cancelEvent () {
				this.quitInfoShow = true
				// if (this.judgeIsChangeTaskMessage()) {
				//   this.quitInfoShow = true
				// } else {
				//   this.$router.push({path: '/autoRepairList'})
				// }
			},
	
			// 判断是否选择或修改任务信息
			judgeIsChangeTaskMessage () {
				let flag = false;
				if ( JSON.stringify(this.currentTaskType) != '{}' || (this.currentDepartment['value'] || this.currentDepartment['value'] === 0) || this.currentParticipant.length > 0
					|| this.problemPicturesList.length > 0 || this.repairPicturesList.length > 0 || this.currentRoom.length > 0
					|| this.issueDescribe
					|| this.consumableMsgList.length > 0 || (this.currentConstruction['value'] || this.currentConstruction['value'] === 0)
				) {
					flag = true
				} else {
					this.changeCreateAutoRepairTaskMessage({})
				};
				return flag
			},
	
			// 自主报修提交事件
			async sureEvent () {
				if (JSON.stringify(this.currentTaskType) == '{}') {
					this.$toast('任务类型不能为空');
					return
				};
				if (!this.currentDepartment['value'] && this.currentDepartment['value'] !== 0) {
					this.$toast('目的科室不能为空');
					return
				};
				// if (this.currentParticipant.length == 0) {
				//   this.$toast('参与人不能为空');
				//   return
				// };
				if (this.problemPicturesList.length == 0) {
					this.$toast('问题图片不能为空');
					return
				};
				if (this.repairPicturesList.length == 0) {
					this.$toast('修复图片不能为空');
					return
				};
				// 上传图片到阿里云服务器(问题图片)
				let temporaryProblemPicturesList = this.problemPicturesList.filter((item) => { return item.indexOf('https://') == -1});
				this.infoText = '图片上传中···';
				this.showLoadingHint = true;
				for (let imgI of temporaryProblemPicturesList) {
					if (Object.keys(this.timeMessage).length > 0) {
						// 判断签名信息是否过期
						if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
							await this.getSign(imgI,'issue');
							await this.uploadImageToOss(imgI,'issue')
						} else {
							await this.uploadImageToOss(imgI,'issue')
						};
					} else {
						await this.getSign(imgI,'issue');
						await this.uploadImageToOss(imgI,'issue')
					}
				};
				// 上传图片到阿里云服务器(修复图片)
				let temporaryRepairPicturesList = this.repairPicturesList.filter((item) => { return item.indexOf('https://') == -1});
				this.infoText = '图片上传中···';
				this.showLoadingHint = true;
				for (let imgI of temporaryRepairPicturesList) {
					if (Object.keys(this.timeMessage).length > 0) {
						// 判断签名信息是否过期
						if (new Date().getTime()/1000 - this.timeMessage['expire']  >= -30) {
							await this.getSign(imgI,'repair');
							await this.uploadImageToOss(imgI,'repair')
						} else {
							await this.uploadImageToOss(imgI,'repair')
						}
					} else {
						await this.getSign(imgI,'repair');
						await this.uploadImageToOss(imgI,'repair')
					}
				};
				// 新增自主报修
				let temporaryMessage = {
					typeId: this.currentTaskType['value'], // 任务类型
					typeName: this.currentTaskType['text'], // 类型名称
					taskDesc: this.issueDescribe, // 问题描述
					depId: this.currentDepartment['value'], // 目的地id
					depName: this.currentDepartment['text'],
					structId:  this.currentConstruction['value'],
					structName: this.currentConstruction['text'],
					isOwn: 1,
					isApp: 1,
					proId: this.proId,
					images: [],
					proName: this.proName,
					createId: this.workerId,
					createName: this.userName,
					createType: 3, // 创建类型 0-调度员 2-医务人员 3-巡检人员
					workerId: this.workerId,
					workerName: this.userName,
					spaces: [], //空间信息
					present: [], //参与者
					materials: [] // 需要的物料
				};
				// 拼接图片信息
				let temporaryIssueImages = this.imgOnlinePathArr.concat(this.problemPicturesList.filter((item) => { return item.indexOf('https://') != -1}));
				let temporaryRepairImages = this.imgRepairOnlinePathArr.concat(this.repairPicturesList.filter((item) => { return item.indexOf('https://') != -1}));
				temporaryIssueImages.forEach((item) => {
					temporaryMessage['images'].push({
						imgType: 1,
						proId: this.proId,
						proName: this.proName,
						path: item
					})
				});
				temporaryRepairImages.forEach((item) => {
					temporaryMessage['images'].push({
						imgType: 2,
						proId: this.proId,
						proName: this.proName,
						path: item
					})
				});
				// 拼接参与者数据
				if (this.currentParticipant.length > 0) {
					for (let item of this.currentParticipant) {
						temporaryMessage['present'].push({
							id: item.value,
							name: item.text
						})
					}
				};
				// 拼接空间信息
				if (this.currentRoom.length > 0) {
					for (let item of this.currentRoom) {
						temporaryMessage['spaces'].push({
							id: item.value,
							name: item.text
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
				this.infoText = '提交中···';
				this.showLoadingHint = true;
				completeAutoRepairsTask(temporaryMessage).then((res) => {
					this.infoText = '';
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						// 清除保存的创建自主报修任务信息
						this.changeCreateAutoRepairTaskMessage({});
						// 去往签字页
						uni.navigateTo({
							url: `/projectManagementPackage/pages/AutoRepair/AutoRepairTaskSignature?params=${encodeURIComponent(JSON.stringify({ taskId: res.data.data }))}`
						})
					} else {
						this.imgOnlinePathArr = [];
						this.imgRepairOnlinePathArr = [];
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						})
					}
				})
				.catch((err) => {
					this.imgOnlinePathArr = [];
					this.imgRepairOnlinePathArr = [];
					this.infoText = '';
					this.showLoadingHint = false;
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},
	
			// 问题图片放大事件
			enlareEvent (item) {
				this.currentImgUrl = item;
				this.imgBoxShow = true
			},
			
			/**
			 *检查微信小程序摄像头权限
			 * @param {Function} successCallback 权限允许后的回调
			*/
			checkCameraPermission(successCallback) {
				// #ifdef MP-WEIXIN
				wx.getSetting({
					success: (res) => {
							// 如果用户之前明确拒绝过摄像头权限 (值为 false)
							if (res.authSetting['scope.camera'] === false) {
								uni.showModal({
									title: '权限提示',
									content: '您需要开启摄像头权限才能使用拍照功能，是否前往设置？',
									confirmText: '去设置',
									cancelText: '仅从相册选择',
									success: (modalRes) => {
										if (modalRes.confirm) {
											// 用户点击“去设置”，打开微信设置页
											wx.openSetting({
												success: (settingRes) => {
													// 如果在设置页开启了权限
													if (settingRes.authSetting['scope.camera']) {
														successCallback();
													} else {
														uni.showToast({ title: '您未开启摄像头权限', icon: 'none' });
													}
												}
											})
										} else if (modalRes.cancel) {
											// 用户不想开权限，可以选择继续走流程（微信底层会处理无权限时的表现）
											// 或者你可以在这里直接 return 阻止后续操作
											successCallback();
										}
									}
								})
							} else {
								// 权限为 true 或 undefined（从未询问过），均可直接调用
								successCallback();
							}
						},
						fail: () => {
							// 获取设置失败，放行让微信自己处理
							successCallback();
						}
				});
				// #endif
				// #ifndef MP-WEIXIN
				// 非微信小程序平台，直接放行
				successCallback()
				// #endif
			},
			
			/**
			 *  问题图片选择
			*/
			executeIssueChooseImage() {
				let that = this;
				that.isChoosingImage = true;
				uni.chooseImage({
					count: 5,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						uni.previewImage({
							urls: res.tempFilePaths,
							complete: function() {
									that.isChoosingImage = true;
							}
						});
						for (let imgI = 0, len = res.tempFilePaths.length; imgI < len; imgI++) {
							let url = res.tempFiles[imgI].path;
							//获取最后一个的位置
							let index = url.lastIndexOf(".");
							//获取后缀
							let jpgUrl = url.substr(index + 1);
							if (jpgUrl != "png" && jpgUrl != "jpg" && jpgUrl != "jpeg") {
								that.$refs.uToast.show({
									message: '只可上传jpg或png格式的图片!',
									type: 'error',
									position: 'center'
								});
								continue;
							};
							let isLt2M = res.tempFiles[imgI].size / 1024 / 1024 <= 16;
							if (!isLt2M) {
								that.$refs.uToast.show({
									message: '图片必须小于16MB!',
									type: 'error',
									position: 'center'
								});
								continue;
							};
							that.problemFileList.push(res.tempFiles[imgI]['path']);
							uni.getFileSystemManager().readFile({
								filePath: res.tempFilePaths[imgI],
								encoding: 'base64',
								success: res => {
									let base64 = 'data:image/jpeg;base64,' + res.data;
									that.problemPicturesList.push(base64)
								},
								fail: function(err) {
									uni.showToast({ title: `${err.errMsg}`, icon: 'none' });
								}
							})
						}
					},
					fail: function(err) {
						const errMsg = err.errMsg || '';
						if (errMsg.includes('cancel')) return;
						// 处理隐私拒绝或系统异常
						if (errMsg.includes('privacy') || errMsg.includes('deny')) {
							uni.showToast({ title: '需同意隐私协议才能使用', icon: 'none' });
						} else {
							uni.showToast({ title: '选择图片失败', icon: 'none' });
						}
					},
					complete: function() {
						that.isChoosingImage = true;
					}
				})
			},
	
			// 问题图片拍照点击
			issueClickEvent () {
				try {
					this.isIssuePhoto = true;
					this.isRepairPhoto = false;
					if (this.problemPicturesList.length >= 9) {
						this.$refs.uToast.show({
							message: "至多只能上传9张图片",
							position: 'center'
						});
						return
					};
					//前置校验隐私协议
					// #ifdef MP-WEIXIN
					wx.requirePrivacyAuthorize({
						success: () => {
							// 用户已同意隐私协议，进入第二步：检查摄像头权限
							this.checkCameraPermission(() => {
								// 权限校验通过，进入第三步：执行真正的选图逻辑
								this.executeIssueChooseImage()
							})
						},
						fail: (err) => {
							// 用户拒绝了隐私协议，或者触发了拒绝
							uni.showToast({ 
								title: '需同意隐私协议才能上传图片', 
								icon: 'none',
								duration: 2000
							})
						}
					});
					// #endif
					// #ifndef MP-WEIXIN
					// 非微信小程序平台（如 H5、App），不需要隐私校验，直接走原有逻辑
					this.checkCameraPermission(() => {
						this.executeIssueChooseImage()
					});
					// #endif
				} catch (e) {
					uni.showToast({ title: e.message || '发生异常', icon: 'none' });
				}	
			},
	
			// 图片确定删除提示框确定事件(问题图片)
			sureDeleteEvent () {
				this.deleteInfoDialogShow = false;
				this.problemPicturesList.splice(this.imgIndex, 1);
				this.problemFileList.splice(this.imgIndex, 1)
			},
	
			// 图片确定删除提示框确定事件(修复图片)
			sureRepairDeleteEvent () {
				this.deleteRepairInfoDialogShow = false;
				this.repairPicturesList.splice(this.imgIndex, 1);
				this.repairFileList.splice(this.imgIndex, 1)
			},
	
			// 问题拍照照片删除
			issueDelete (index,item) {
				this.deleteInfoDialogShow = true;
				this.imgIndex = index;
				this.imgDeleteUrl = item
			},
			
			// 修复拍照照片删除
			repairDelete (index,item) {
				this.deleteRepairInfoDialogShow = true;
				this.imgIndex = index;
				this.imgDeleteUrl = item
			},
	
			// 修复图片放大事件
			enlareRepairEvent (item) {
				this.currentImgUrl = item;
				this.imgBoxShow = true
			},
			
			/**
			 *  问题图片选择
			*/
			executeRepairChooseImage() {
				let that = this;
				that.isChoosingImage = true;
				uni.chooseImage({
					count: 5,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						uni.previewImage({
							urls: res.tempFilePaths,
							complete: function() {
									that.isChoosingImage = true;
							}
						});
						for (let imgI = 0, len = res.tempFilePaths.length; imgI < len; imgI++) {
							let url = res.tempFiles[imgI].path;
							//获取最后一个的位置
							let index = url.lastIndexOf(".");
							//获取后缀
							let jpgUrl = url.substr(index + 1);
							if (jpgUrl != "png" && jpgUrl != "jpg" && jpgUrl != "jpeg") {
								that.$refs.uToast.show({
									message: '只可上传jpg或png格式的图片!',
									type: 'error',
									position: 'center'
								});
								continue;
							};
							let isLt2M = res.tempFiles[imgI].size / 1024 / 1024 <= 16;
							if (!isLt2M) {
								that.$refs.uToast.show({
									message: '图片必须小于16MB!',
									type: 'error',
									position: 'center'
								});
								continue;
							};
							that.repairFileList.push(res.tempFiles[imgI]['path']);
							uni.getFileSystemManager().readFile({
								filePath: res.tempFilePaths[imgI],
								encoding: 'base64',
								success: res => {
									let base64 = 'data:image/jpeg;base64,' + res.data;
									that.repairPicturesList.push(base64)
								},
								fail: function(err) {
									uni.showToast({ title: `${err.errMsg}`, icon: 'none' });
								}
							})
						}
					},
					fail: function(err) {
						const errMsg = err.errMsg || '';
						if (errMsg.includes('cancel')) return;
						// 处理隐私拒绝或系统异常
						if (errMsg.includes('privacy') || errMsg.includes('deny')) {
							uni.showToast({ title: '需同意隐私协议才能使用', icon: 'none' });
						} else {
							uni.showToast({ title: '选择图片失败', icon: 'none' });
						}
					},
					complete: function() {
						that.isChoosingImage = true;
					}
				})
			},
				
	
			// 修复图片拍照点击
			repairClickEvent () {
				try {
					this.isIssuePhoto = true;
					this.isRepairPhoto = false;
					if (this.repairPicturesList.length >= 9) {
						this.$refs.uToast.show({
							message: "至多只能上传9张图片",
							position: 'center'
						});
						return
					};
					//前置校验隐私协议
					// #ifdef MP-WEIXIN
					wx.requirePrivacyAuthorize({
						success: () => {
							// 用户已同意隐私协议，进入第二步：检查摄像头权限
							this.checkCameraPermission(() => {
								// 权限校验通过，进入第三步：执行真正的选图逻辑
								this.executeRepairChooseImage()
							})
						},
						fail: (err) => {
							// 用户拒绝了隐私协议，或者触发了拒绝
							uni.showToast({ 
								title: '需同意隐私协议才能上传图片', 
								icon: 'none',
								duration: 2000
							})
						}
					});
					// #endif
					// #ifndef MP-WEIXIN
					// 非微信小程序平台（如 H5、App），不需要隐私校验，直接走原有逻辑
					this.checkCameraPermission(() => {
						this.executeIssueChooseImage()
					});
					// #endif
				} catch (e) {
					uni.showToast({ title: e.message || '发生异常', icon: 'none' });
				}
			},
	
			// 拍照取消
			photoCancel () {
				this.photoBox = false;
				this.overlayShow = false
			},
	
			// 图片放大事件
			enlareEvent (item) {
				this.currentImgUrl = item;
				this.imgBoxShow = true
			},
			
			/**
			 * 检查微信小程序摄像头权限
			 * @param {Function} successCallback 权限允许后的回调
			 */
			checkCameraPermission(successCallback) {
				// #ifdef MP-WEIXIN
				wx.getSetting({
					success: (res) => {
						// 核心判断：如果 scope.camera 严格等于 false，说明用户之前明确拒绝过
						if (res.authSetting['scope.camera'] === false) {
							uni.showModal({
								title: '权限提示',
								content: '您已拒绝摄像头权限，无法进行扫码。请在设置中开启。',
								confirmText: '去设置',
								cancelText: '取消',
								success: (modalRes) => {
									if (modalRes.confirm) {
										// 用户点击“去设置”，打开微信权限设置页
										wx.openSetting({
											success: (settingRes) => {
												// 如果用户在设置页手动开启了摄像头
												if (settingRes.authSetting['scope.camera']) {
													successCallback()
												} else {
													uni.showToast({ title: '您未开启摄像头权限', icon: 'none' })
												}
											}
										})
									}
								}
							})
						} else {
							// 权限为 true（已授权）或 undefined（从未询问过，微信会自动弹系统授权框）
							// 这两种情况都可以直接放行
							successCallback()
						}
					},
					fail: () => {
						// 获取设置失败，放行让微信自己处理
						successCallback()
					}
				});
				// #endif
				// #ifndef MP-WEIXIN
				// 非微信小程序平台（如H5、App），直接放行
				successCallback();
				// #endif
			},
			
			/**
			 * 步骤2：安全调用 uni.scanCode
			*/
			executeScanCode() {
				uni.scanCode({
					onlyFromCamera: true, // 只允许相机扫码
					scanType: ['qrCode'], // 只扫二维码
					success: (res) => {
						this.scanQRcodeCallback(res.result)
					},
					fail: (err) => {
						const errMsg = err.errMsg || '';
						// 1. 用户主动点击左上角返回/取消扫码（正常行为，不提示）
						if (errMsg.includes('cancel') || errMsg.includes('fail cancel')) {
							return;
						};
						// 2. 隐私协议被拒绝（触发了官方弹窗但用户点了拒绝）
						if (errMsg.includes('privacy permission is not authorized') || errMsg.includes('deny')) {
							uni.showToast({ 
								title: '需同意隐私协议才能使用扫码功能', 
								icon: 'none',
								duration: 2500
							});
							return;
						};
						// 3. 其他异常（如无摄像头设备、系统异常等）
						uni.showToast({ 
							title: '扫码失败，请重试', 
							icon: 'none' 
						})
					}
				})
			},
			
			// 扫描二维码方法
			scanQRCode () {
				//前置校验隐私协议
				// #ifdef MP-WEIXIN
				wx.requirePrivacyAuthorize({
					success: () => {
						// 用户已同意隐私协议，进入第二步：检查摄像头权限
						this.checkCameraPermission(() => {
							// 权限校验通过，进入第三步：执行真正的扫码逻辑
							this.executeScanCode()
						})
					},
					fail: (err) => {
						// 用户拒绝了隐私协议，或者触发了拒绝
						uni.showToast({ 
							title: '需同意隐私协议才能上传图片', 
							icon: 'none',
							duration: 2000
						})
					}
				});
				// #endif
				// #ifndef MP-WEIXIN
				// 非微信小程序平台（如 H5、App），不需要隐私校验，直接走原有逻辑
				this.checkCameraPermission(() => {
					this.executeScanCode()
				});
				// #endif
			},
	
			// 摄像头扫码后的回调
			scanQRcodeCallback(code) {
				if (code) {
					try {
						let codeData = code.split('|');
						if (codeData.length > 0) {
							scanDepartment(codeData[0]).then((res) => {
								if (res && res.data.code == 200) {
									// 获取扫码科室信息;
									this.currentDepartment['value'] = codeData[0];
									this.currentDepartment['text'] = res.data.data.data['name'];
									let TemporaryDepartmentIndex = this.departmentList.findIndex((innerItem) => { return innerItem.value == this.currentDepartment['value']});
									this.currentDepartmentIndex = TemporaryDepartmentIndex;
									// 获取当前科室所在建筑信息
									this.currentConstruction['text'] = res.data.data.data['structName'];
									this.currentConstruction['value'] = res.data.data.data['structId'];
									let temporaryIndex = this.constructionList.findIndex((innerItem) => { return innerItem.value == this.currentConstruction['value']});
									// 根据楼栋建筑查询科室
									this.getDepartmentByStructureId(this.currentConstruction['value'],false,'扫码');
									this.currentConstructionIndex = temporaryIndex;
									// 根据科室获取房间信息
									this.getSpacesByDepartmentId(codeData[0],true)
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
						} else {
							this.$refs.uToast.show({
								message: '当前二维码数据格式不正确,请重新扫描!',
								type: 'error',
								position: 'center'
							})
						}
					} catch (err) {
						this.$refs.uToast.show({
							message: err,
							type: 'error',
							position: 'center'
						})
					}     
				} else {
					this.$refs.uToast.show({
						message: '当前二维码数据格式不正确,请重新扫描!',
						type: 'error',
						position: 'center'
					})
				}
			},
	
			// 摄像头取消扫码后的回调
			scanQRcodeCallbackCanceled () {
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
					return
				};
				this.inventoryMsgList = this.echoInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1});
				this.temporaryInventoryMsgList = this.inventoryMsgList;
				this.currentPage = 1;
				this.totalPage =  Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
				this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
			},
	
			// 删除物料弹框确定事件
			materialDeleteSure () {
				this.materialDeleteShow = false;
				this.consumableMsgList.splice(this.deleteMaterialIndex,1)
			},
	
			// 删除物料弹框取消事件
			materialDeleteCancel () {
				this.materialDeleteShow = false;
			},
	
			// 删除物料事件
			deleteEvent(item,index) {
				this.materialDeleteShow = true;
				this.deleteMaterial = `${item.mateName}-${item.model}`;
				this.deleteMaterialIndex = index
			},
	
			// 物料数量变化事件
			stepperEvent (item,index,value) {
				if (item.number > item.quantity) {
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
	
			// 耗材名称点击事件
			mateNameEvent (item,index) {
				const innerIndex = this.selectedMaterialIds.indexOf(item.id)
				if (innerIndex > -1) {
					this.selectedMaterialIds.splice(innerIndex, 1)
				} else {
					this.selectedMaterialIds.push(item.id)
				}
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
				this.selectedMaterialIds = [];
				for (let item of this.echoInventoryMsgList) {
					// 添加过的物料不允许再次添加
					let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
					if (isExist.length > 0) {
						item['disabled'] = true;
						this.selectedMaterialIds.push(item.id);
					} else {
						if (item.quantity > 0) {
							item['disabled'] = false
						} else {
							item['disabled'] = true
						}
					}
				};
				// 打开物料弹框就显示全部物料信息
				this.temporaryInventoryMsgList = this.echoInventoryMsgList;
				this.totalPage = Math.ceil(this.temporaryInventoryMsgList.length/this.pageSize);
				this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize)
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
				this.selectedMaterialIds = [];
				this.inventoryMsgList = this.temporaryInventoryMsgList.slice((this.currentPage - 1) * this.pageSize,(this.currentPage - 1) * this.pageSize + this.pageSize);
				for (let item of this.inventoryMsgList) {
					let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
					if (isExist.length > 0) {
						item['disabled'] = true;
						this.selectedMaterialIds.push(item.id);
					} else {
						if (item.quantity > 0) {
							item['disabled'] = false
						} else {
							item['disabled'] = true
						}
					}
				}
			},
	
			// 暂存事件
			temporaryStorageEvent () {
				try {
					let casuallyTemporaryStorageCreateAutoRepairTaskMessage = this._.cloneDeep(this.createAutoRepairTaskMessage);
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['taskTypeIndex'] = this.taskTypeIndex;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentTaskType'] = this.currentTaskType;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstructionIndex'] = this.currentConstructionIndex;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentConstruction'] = this.currentConstruction;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartment'] = this.currentDepartment;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentDepartmentIndex'] = this.currentDepartmentIndex;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentRoom'] = this.currentRoom;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['problemPicturesList'] = this.problemPicturesList;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['issueDescribe'] = this.issueDescribe;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['currentParticipant'] = this.currentParticipant;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['repairPicturesList'] = this.repairPicturesList;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['consumableMsgList'] = this.consumableMsgList;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['imgOnlinePathArr'] = this.imgOnlinePathArr;
					casuallyTemporaryStorageCreateAutoRepairTaskMessage['imgRepairOnlinePathArr'] = this.imgRepairOnlinePathArr;
					this.changeCreateAutoRepairTaskMessage(casuallyTemporaryStorageCreateAutoRepairTaskMessage);
					this.$refs.uToast.show({
						message: '暂存成功',
						type: 'success',
						position: 'center'
					});
					uni.navigateTo({
						url: '/projectManagementPackage/pages/AutoRepair/AutoRepairList'
					})
				} catch (err) {
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
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
		.choose-department {
			::v-deep .u-popup {
				.u-popup__content {
					.u-popup__content__close {
						.u-icon__icon {
							font-size: 22px !important;
							color: #101010 !important;
						}
					}
				};
				.department-content-box {
					width: 100%;
					height: 50vh;
					display: flex;
					padding: 40px 14px 10px 14px;
					box-sizing: border-box;
					>view {
						flex: 1;
						height: 100%;
						overflow: auto;
						font-size: 14px;
					};
					.left-wrapper {
						position: relative;
						.u-empty {
							position: absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%,-50%)
						};
						.left {
							display: flex;
							flex-direction: column;
							.construction-list {
								width: 100%;
								flex-shrink: 0;
								@include no-wrap;
								padding-left: 10px;
								box-sizing: border-box;
								height: 40px;
								line-height: 40px
							};
							.constructionListStyle {
								color: #3B9DF9 !important;
								background-color: rgba(0, 0, 0, 0.05) !important; 
							}
						}
					};
					.center-wrapper {  
						.center {
							display: flex;
							flex-direction: column;
							.tier-list {
								padding-left: 10px;
								@include no-wrap;
								flex-shrink: 0;
								box-sizing: border-box;
								height: 40px;
								line-height: 40px
							};
							.tierListStyle {
								color: #3B9DF9 !important;
								background-color: rgba(0, 0, 0, 0.05) !important; 
							}
						}
					};
					.right-wrapper {
						position: relative;
						.u-empty {
							position: absolute;
							top: 50%;
							left: 50%;
							transform: translate(-50%,-50%)
						};
						.right {
							display: flex;
							flex-direction: column;
							.department-list {
								padding-left: 10px;
								flex-shrink: 0;
								@include no-wrap;
								box-sizing: border-box;
								height: 40px;
								line-height: 40px
							};
							.departmentListStyle {
								color: #3B9DF9 !important;
								background-color: rgba(0, 0, 0, 0.05) !important; 
							}
						}
					}  
				}
			}	
		};
		.choose-room {
			::v-deep .u-popup {
				.u-popup__content {
					.u-popup__content__close {
						.u-icon__icon {
							font-size: 22px !important;
							color: #101010 !important;
						}
					}
				};
				.room-content-box {
					width: 100%;
					height: 50vh;
					display: flex;
					position: relative;
					overflow: auto;
					padding: 40px 0 10px 0;
					box-sizing: border-box;
					.u-empty {
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%,-50%)
					};
					.room-content {
						padding-left: 10px;
						box-sizing: border-box;
						font-size: 14px;
						color: #101010;
						height: 40px;
						line-height: 40px
					};
					.roomContentStyle {
						background-color: rgba(0, 0, 0, 0.05); 
					}
				}
			}
		};
		.participation-person {
			::v-deep .u-popup {
				.u-popup__content {
					.u-popup__content__close {
						.u-icon__icon {
							font-size: 22px !important;
							color: #101010 !important;
						}
					}
				};
				.u-checkbox-group--column {
					flex: 1;
					min-height: 0 !important;
					overflow: auto;
					position: relative;
					overflow-x: hidden;
					.u-empty {
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%,-50%)
					}
				};
				.participation-person-box {
					width: 100%;
					height: 50vh;
					display: flex;
					padding: 40px 20px 10px 20px;
					box-sizing: border-box;
					.participation-person-content {
						box-sizing: border-box;
						font-size: 14px;
						display: flex;
						justify-content: space-between;
						align-items: center;
						color: #101010;
						height: 40px;
						line-height: 40px;
						.participation-person-content-left {
							flex: 1;
							text-align: center;
							padding-right: 8px;
							box-sizing: border-box;
							@include no-wrap
						};
						.participation-person-content-right {
							width: 30px;
							height: 40px;
							display: flex;
							align-items: center;
							justify-content: center
						}
					}
				}
			}
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
		.quit-info-box {
		    ::v-deep .u-modal {
		      .u-modal__content {
		          padding: 20px 20px 0 20px !important;
		          box-sizing: border-box;
		          display: flex;
		          flex-direction: column;
		          .delete-icon {
		            .u-icon {
		              justify-content: flex-end !important;
		            }
		          };
		          .dialog-title {
		            padding: 10px 0;
		            box-sizing: border-box;
		            color: #101010;
		            font-size: 16px;
		          };
		          .dialog-center {
		            line-height: 20px;
		            padding: 20px 0;
		            box-sizing: border-box;
		            color: #101010;
		            font-size: 12px
		          }
		        };
				.u-modal__button-group {
					padding: 10px 40px 20px 40px !important;
					box-sizing: border-box;
					justify-content: space-between;
					.u-modal__button-group__wrapper--cancel {
						height: 40px;
						color: #3B9DF9 !important;
						border: 1px solid #3B9DF9;
						border-radius: 8px;
						margin-right: 20px
					};
					.u-modal__button-group__wrapper--confirm {
						height: 40px;
						 color: #fff;
						 background: #3B9DF9;
						 border-radius: 8px
					}
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
		              height: 0;
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
		        .u-modal__button-group {
		          padding: 10px 20px 20px 20px !important;
		          box-sizing: border-box;
		          justify-content: space-between;
		        .u-modal__button-group__wrapper--cancel {
		            color: #1864FF;
		            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
		            background: #fff;
		            border-radius: 30px;
		            margin-right: 20px
		        };
		        .u-modal__button-group__wrapper--confirm {
		            background: linear-gradient(to right, #6cd2f8, #2390fe);
		            box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
		            color: #fff !important;
		            border-radius: 30px;
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
		        .u-modal__button-group {
		          padding: 10px 40px 20px 40px !important;
		          box-sizing: border-box;
		          justify-content: space-between;
		        .u-modal__button-group__wrapper--cancel {
		            height: 40px;
		            color: #3B9DF9;
		            border: 1px solid #3B9DF9;
		            border-radius: 8px;
		            margin-right: 20px
		        };
		        .u-modal__button-group__wrapper--confirm {
		            height: 40px;
		            background: #3B9DF9;
		            color: #fff !important;
		            border-radius: 8px;
		        }
		        };
		        .van-hairline--top::after {
		          border-top-width: 0 !important
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
		};
		.content {
			 flex: 1;
			 display: flex;
			 flex-direction: column;
			 position: relative;
			 height: 0;
			 .content-box-inner {
					 flex: 1;
					 padding-bottom: 80px;
					 box-sizing: border-box;
					 display: flex;
					 flex-direction: column;
					 width: 100%;
					 height: 0;
					 position: relative;
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
								 .task-type {
									 padding: 0 10px 4px 10px;
									 box-sizing: border-box;
									 background: #fff;
									 .problem-description-content-top {
										 height: 40px;
										 line-height: 40px;
										 >text {
											 &:first-child {
												 color: red
											 };
											 &:last-child {
												 font-size: 14px;
												 color: #9E9E9A
											 }
										 }
									 };
									 .problem-description-content-bottom {
										 display: flex;
										 align-items: center;
										 flex-wrap: wrap;
										 >text {
											 font-size: 14px;
											 color: #101010;
											 border-radius: 7px;
											 background-color: rgba(0, 0, 0, 0.05);
											 text-align: center;
											 padding: 10px 20px;
											 box-sizing: border-box;
											 margin-right: 20px;
											 margin-bottom: 10px
										 };
										 .taskTypeStyle {
											 background: #41a4ff !important;
											 color: #fff !important
										 }
									 }
								 };
								 .goal-department {
									 height: 40px;
									 background: #fff;
									 padding: 0 10px;
									 box-sizing: border-box;
									 display: flex;
									 align-items: center;
									 justify-content: space-between;
									 margin-top: 10px;
									 .goal-department-left {
										 >text {
											 &:first-child {
												 color: red
											 };
											 &:last-child {
												 color: #9E9E9A;
												 font-size: 14px
											 }
										 }
									 };
									 .goal-department-right {
										 flex: 1;
										 display: flex;
										 width: 0;
										 align-items: center;
										 padding-left: 6px;
										 box-sizing: border-box;
											>text {
											 &:first-child {
												 flex: 1;
												 color: #101010;
												 font-size: 14px;
												 text-align: right;
												 @include no-wrap
											 };
											 &:last-child {
												 font-size: 14px
											 }
										 }
									 }
								 };
								 .goal-room {
										.goal-department-left {
										 >text {
											 &:first-child {
												 margin-left: 10px;
												 color: #9E9E9A !important;
												 font-size: 14px
											 }
										 }
									 }
								 };
								 .list-line-image {
									 display: flex;
									 flex-direction: column;
									 background: #fff;
									 margin-top: 10px;
									 padding-bottom: 10px;
									 box-sizing: border-box;
									 >view {
										 &:first-child {
											 font-size: 14px;
											 color: #9E9E9A; 
											 height: 40px;
											 line-height: 40px;
											 padding-left: 10px;
											 box-sizing: border-box;
											 >text {
												 &:first-child {
													 color: red !important
												 }
											 }
										 }
									 };
									 .image-list {
										 width: 100%;
										 flex-wrap: wrap;
										 display: flex;
										 padding: 0 10px;
										 box-sizing: border-box;
										 >view {
												 width: 23.5%;
												 height: 70px;
												 vertical-align: top;
												 margin-right: 2%;
												 margin-top: 2%;
												 position: relative;
												 &:nth-child(1) {
														 margin-top: 0;
												 };
												 &:nth-child(2) {
														 margin-top: 0;
												 };
												 &:nth-child(3) {
														 margin-top: 0;
												 };
												 &:nth-child(4) {
														 margin-top: 0;
												 };
												 &:nth-child(4n+4) {
														 margin-right: 0;
												 };
												 .icon-box {
														 position: absolute;
														 top: 2px;
														 right: 2px;
														 ::v-deep .u-icon {
															 font-weight: bold;
														 }  
												 };
												 image {
														 width: 100%;
														 height: 100%
												 };
												 &:last-child {
														 display: flex;
														 justify-content: center;
														 align-items: center;
														 background: #f2f2f2;
														 ::v-deep .u-icon {
																 position: relative;
																 top: 0;
																 right: 0;
														 }
												 }
										 }
									 }
								 };
								 .issue-content {
									 background: #fff;
									 padding: 10px;
									 margin-top: 10px;
									 box-sizing: border-box;
									 display: flex;
									 flex-direction: column;
									 .issue-left {
										 font-size: 14px;
										 padding-left: 10px;
										 box-sizing: border-box;
										 margin-bottom: 10px;
										 color: #9E9E9A
									 };
									 .issue-right {
										 flex: 1;
										 margin-top: 2px;
										 ::v-deep .u-textarea {
											 padding: 10px 4px;
											 font-size: 14px;
											 color: #101010;
											 background: #F9F9F9;
										 }
									 }
							 }  
						 }
					 };
					 .maintenance-record-box {
						 .maintenance-record-tit {
							 font-size: 14px;
							 font-weight: bold;
							 color: #101010;
							 height: 35px;
							 line-height: 35px;
							 padding-left: 10px;
							 box-sizing: border-box; 
						 };
						 .maintenance-record-content {
							 .maintenance-man {
								 height: 40px;
								 background: #fff;
								 padding: 0 10px;
								 box-sizing: border-box;
								 display: flex;
								 align-items: center;
								 justify-content: space-between;
								 margin-top: 10px;
								 .maintenance-man-left {
									 >text {
										 &:first-child {
											 color: red
										 };
										 &:last-child {
											 color: #9E9E9A;
											 font-size: 14px
										 }
									 }
								 };
								 .maintenance-man-right {
									 flex: 1;
									 display: flex;
									 width: 0;
									 align-items: center;
									 padding-left: 6px;
									 box-sizing: border-box;
									 >text {
										 &:first-child {
											 flex: 1;
											 color: #101010;
											 font-size: 14px;
											 text-align: right;
											 @include no-wrap
										 }
									 }
								 }
							 };
							 .participation-man {
								 height: 40px;
								 background: #fff;
								 padding: 0 10px;
								 box-sizing: border-box;
								 display: flex;
								 align-items: center;
								 justify-content: space-between;
								 margin-top: 10px;
								 .participation-man-left {
									 padding-left: 10px;
									 box-sizing: border-box;
									 >text {
										 &:first-child {
											 color: #9E9E9A;
											 font-size: 14px
										 }
									 }
								 };
								 .participation-man-right {
									 flex: 1;
									 display: flex;
									 width: 0;
									 align-items: center;
									 padding-left: 6px;
									 box-sizing: border-box;
									 >text {
										 &:first-child {
											 flex: 1;
											 color: #101010;
											 font-size: 14px;
											 text-align: right;
											 @include no-wrap
										 };
										 &:last-child {
											 font-size: 14px
										 }
									 }
								 }
							 };
							 .list-line-image {
								 display: flex;
								 flex-direction: column;
								 background: #fff;
								 margin-top: 10px;
								 padding-bottom: 10px;
								 box-sizing: border-box;
								 >view {
									 &:first-child {
										 font-size: 14px;
										 color: #9E9E9A; 
										 height: 40px;
										 line-height: 40px;
										 padding-left: 10px;
										 box-sizing: border-box;
										 >text {
											 &:first-child {
												 color: red !important
											 }
										 }
									 }
								 };
								 .image-list {
									 width: 100%;
									 flex-wrap: wrap;
									 display: flex;
									 padding: 0 10px;
									 box-sizing: border-box;
									 >view {
											 width: 23.5%;
											 height: 70px;
											 vertical-align: top;
											 margin-right: 2%;
											 margin-top: 2%;
											 position: relative;
											 &:nth-child(1) {
													 margin-top: 0;
											 };
											 &:nth-child(2) {
													 margin-top: 0;
											 };
											 &:nth-child(3) {
													 margin-top: 0;
											 };
											 &:nth-child(4) {
													 margin-top: 0;
											 };
											 &:nth-child(4n+4) {
													 margin-right: 0;
											 };
											 .icon-box {
													 position: absolute;
													 top: 2px;
													 right: 2px;
													 ::v-deep .u-icon {
														 font-weight: bold;
													 }  
											 };
											 image {
													 width: 100%;
													 height: 100%
											 };
											 &:last-child {
													 display: flex;
													 justify-content: center;
													 align-items: center;
													 background: #f2f2f2;
													 ::v-deep .u-icon {
															 position: relative;
															 top: 0;
															 right: 0;
													 }
											 }
										 }
									 }
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
								 }
								 > view {
									 height: 50px;
									 line-height: 50px;
									 font-size: 16px;
									 text-align: center;
									 &:first-child {
										 width: 5%;
										 @include no-wrap
									 };
									 &:nth-child(2) {
										width: 53%;
										overflow-x: auto;
										white-space: nowrap;
										text-align: left;
										margin-right: 2%;
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
					 };
					 .operation-box {
						 width: 80%;
						 height: 80px;
						 display: flex;
						 position: fixed;
						 bottom: 0;
						 left: 10%;
						 align-items: center;
						 justify-content: space-between;
						 >text {
							 width: 44%;
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
							 };
							 &:nth-child(2) {
								 color: #1864FF;
								 box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
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
