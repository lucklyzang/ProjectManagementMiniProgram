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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="工单审核" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-top">
				<view class="content-top-other">
					<text>工单编号</text>
					<text>
						{{oneRepairsMsg.taskNumber}}
					</text>
				</view>
				<view class="content-top-other">
					<text>工单标题</text>
					<text>
						{{oneRepairsMsg.taskDesc}}
					</text>
				</view>
				<view class="content-top-other">
					<text>工单类型</text>
					<text>
						{{oneRepairsMsg.typeName}}
					</text>
				</view>
				<view class="content-top-other">
					<text>时间</text>
					<text>
						{{oneRepairsMsg.planStartTime}}
					</text>
				</view>
				<view class="content-top-other">
					<text>参与人员</text>
					<text v-if="oneRepairsMsg.present ? oneRepairsMsg.present.length > 0 : false">
						<text v-for="(item,index) in oneRepairsMsg.present" :key="index">
							{{item.name}}
						</text>
					</text>
					<text v-if="oneRepairsMsg.present ? oneRepairsMsg.present.length == 0 : false">
						<text>
							无
						</text>
					</text>
				</view>
				<view class="content-top-other">
					<text>地点</text>
					<text>
						{{oneRepairsMsg.depName}}
					</text>
				</view>
				<view class="content-top-space">
					<text>目的空间</text>
					<view v-if="oneRepairsMsg && oneRepairsMsg.spaces && oneRepairsMsg.spaces.length > 0">
						{{ oneRepairsMsg.spaces.join(',') }}
					</view>
				</view>
				<view class="content-top-name">
					<text>工单内容</text>
					<text>
						{{oneRepairsMsg.taskRemark ? oneRepairsMsg.taskRemark : '无'}}
					</text>
				</view>
			</view>
			<view class="content-middle">
				<view class="issue-photo">
					<text>问题拍照</text>
					<view class="photo-list">
						<view v-for="(item,index) in issueImageList" :key="index">
							<image :src="item" @click="enlargeIssueImgEvent(item,0)"></image>
						</view>
					</view>
				</view>
				<view class="complete-photo">
					<text>完成拍照</text>
					<view class="photo-list">
						<view v-for="(item,index) in completeImageList" :key="index">
							<image :src="item" @click="enlargeCompleteImgEvent(item,0)"></image>
						</view>
					</view>
				</view>
				<view class="manage-wrapper-one" v-if="!userInfo.extendData.projectAudit">
					<view class="mange-title">
						<text>耗材使用量</text>
					</view>
					<view class="circviewation-area">
						<view v-for="(item,index) in consumableMsgList" :key="index">
							<text>{{index+1}}</text>
							<text>
								{{item.mateName}}-{{item.model}}
							</text>
							<text>
							 {{ `${item.number}${item.unit}` }}
							</text>
						</view>
					</view>
				</view>
				<view class="manage-wrapper" v-if="userInfo.extendData.projectAudit">
					<view class="mange-title">
						<text>{{repairsWorkOrderMsg.state == 5 || repairsWorkOrderMsg.state == 6? "消耗耗材" : "耗材管理"}}</text>
						<text @click="addConsumable" v-if="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">添加</text>
					</view>
					<view class="circviewation-area">
						<view v-for="(item,index) in consumableMsgList" :key="index">
							<text>{{index+1}}</text>
							<text>
								{{item.mateName}}-{{item.model}}
							</text>
							<text>
								<u-number-box v-model="value" @change="valChange"></u-number-box>
							<!-- 	<van-stepper @change="function(val){stepValueChange(item,index,val)}" theme="round" integer 
								@focus="function(val){stepValueFocus(item,index,val)}"
								:disabled="repairsWorkOrderMsg.state == 5 || repairsWorkOrderMsg.state == 6? true : false"
								v-model="item.number" min="0"/> -->
							</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="content-bottom" ref="contentBottom" v-if="repairsWorkOrderMsg.state !== 5 && repairsWorkOrderMsg.state !== 6">
			<view class="complete-check" :class="{'completeCheckStyle' : !userInfo.extendData.projectAudit }" @click="completeTask">完成审核</view>
			<view class="reject-workorder" :class="{'rejectWorkorderStyle' : !userInfo.extendData.projectAudit }" @click="rejectWorkorderEvent">取消</view>
		</view>
		<view class="reject-reason-dialog">
				<u-modal :show="rejectReasonShow" showCancelButton cancelText="否" confirmText="是"
					@cancel="rejectWorkorderCancelEvent" :before-close="rejectReasonDialogBeforeCloseEvent"
				>
						<view class="reject-reason-box">
								<view class="reject-title">
										<text>是否驳回该工单?</text>
										<u-icon name="close" size="24" color="#101010" @click="closeRejectReasonDialogEvent"></u-icon>
								</view>
								<view class="reject-content">
										<view class="reject-left">驳回原因:</view>
										<view class="reject-right">
											<u--textarea
												v-model="rejectReason"
												rows="3"
												border="none"
												maxlength="50"
												placeholder="请输入驳回原因"
												count>
											</u--textarea>
										</view>
								</view>
						</view>
				</u-modal>
		</view>
		<view class="infoDialog">
			<u-modal class="infoDialog" :show="enlargeImgShow">
				<image :src="enlargeImgUrl" mode="widthFix"></image>
			</u-modal>
		</view>  
		<view class="infoDialog">
			<u-modal :show="isFinishShow"  title="确定完成?" showCancelButton
					@confirm="isFinishSure" @cancel="isFinishCancel"
				>
			</u-modal>
		</view>
		<view class="infoDialog">
			<u-modal :show="isDeleteShow"  title="是否删除该耗材?" showCancelButton
					@confirm="isDeleteSure" @cancel="isDeleteCancel"
				>
			</u-modal>
		</view>
		<view class="contentDialog">
			<u-modal :show="toolShow"  showCancelButton
						@confirm="toolSure" @cancel="toolCancel" confirmText="添加"
					>
						<view class="tool-name-list">
							<view class="tool-name-list-title-innner">
								<u--input
									v-model="searchValue"
								>
								</u--input>
								<text class="icon-text">
									<u-icon name="search" @click="searchEvent"></u-icon>
								</text>
							</view>
							<view class="tool-name-list-content">
								<view class="circulation-area-title">
									<text>物料名称</text>
									<text>单位</text>
									<text>操作</text>
								</view>
								<view v-for="(item,index) in inventoryMsgList" :key="index" class="circulation-area-content">
									<text @click="mateNameEvent(item,index)">
										{{item.mateName}}-{{item.model}}
									</text>
									<text>
										{{item.unit ? item.unit : '无'}}
									</text>
									<text>
										<!-- <van-checkbox v-model="item.checked" shape="square" :disabled="item.disabled"></van-checkbox> -->
									</text>
								</view>
							</view>
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
		deepClone
	} from '@/common/js/utils'
	import store from '@/store'
	 import {queryOneRepairsProject,uploadRepairsTaskPhoto,queryAllMaterial,queryRepairsTaskPhoto,saveMate,completeRepairsTaskFinal,sureStartTask,queryMaterialById, dismissalTask} from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				rejectReasonShow: false,
				rejectReason: '',
				photoBox: false,
				toolShow: false,
				isDeleteShow: false,
				consumableIndex: null,
				isFinishShow: false,
				isChangeConsumableShow: false,
				imageType: '',
				photoType: '',
				clickIssue: false,
				clickComplete: false,
				issueImageList: [],
				completeImageList: [],
				inventoryMsgList: [],
				searchValue: '',
				temporaryInventoryMsgList: [],
				historyIssueImageList: [],
				historyCompleteImageList: [],
				photonList: [],
				consumableMsgList: [],
				enlargeimageShow: false,
				oneRepairsMsg: '',
				enlargeImgUrl: '',
				storeId: '',
				systemId: ''
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'repairsWorkOrderMsg',
				'statusBarHeight',
				'navigationBarHeight'
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
			},
			taskId () {
				return this.repairsWorkOrderMsg.id
			}
		},
		
		 watch: {
			issueImageList: {
				handler(newValue,oldValue) {
					if (newValue.length == 0) {
						if (this.completeImageList.length == 0) {
						}
					} else {
					}
				},
				immediate: true,
				deep: true
			},
			completeImageList: {
				handler(newValue,oldValue) {
					if (newValue.length == 0) {
						if (this.issueImageList.length == 0) {
						}
					} else {
					}
				},
				immediate: true,
				deep: true
			}
		},
		
		onLoad () {
			this.getOneRepairsProjectNoComplete(this.taskId);
			this.parallelFunction();
			// this.echoIsMaterial();
			if (this.repairsWorkOrderMsg.state != 5 && this.repairsWorkOrderMsg.state != 6) {
				this.queryStoreId({proId: this.proId,state: 0});
			};
			this.getMaterialById(this.taskId)
		},
		
		methods: {
			...mapMutations([
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 关闭拒绝弹框事件
		closeRejectReasonDialogEvent () {
			this.rejectReasonShow = false;
		},

		// 搜索事件
		searchEvent () {
			if (this.searchValue == '') {
				this.getAllMaterial({
					proId: this.proId,
					state: 0
				});
				return
			};
			this.inventoryMsgList = [];
			this.inventoryMsgList = this.temporaryInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1})
		},

		// 添加确认
		toolSure () {
			let count = this.inventoryMsgList.some((item)=> {return item.checked == true});
			if (!count) {
				this.$refs.uToast.show({
					message: '至少要选择一种耗材',
					type: 'error',
					position: 'center'
				})
			} else {
				this.materialContentShow = true;
				let checkConsumableList = this.inventoryMsgList.filter((item) => {return item.checked == true});
				for (let item of checkConsumableList) {
					this.consumableMsgList.push({
						number: 0,
						mateName: item.mateName,
						mateNumber: item.mateNumber,
						unit: item.unit,
						mateId: item.id,
						model: item.model,
						quantity: item.quantity,
						storeId: this.storeId,
						systemId: this.systemId
					})
				};
			}
		},

		// 添加取消
		toolCancel () {

		},

		// 耗材名称点击事件
		mateNameEvent (name,index) {
			this.inventoryMsgList[index]['checked'] = !this.inventoryMsgList[index]['checked'];
		},

		// 添加物质
		addConsumable () {
			this.toolShow = true;
			this.searchValue = '';
			this.getAllMaterial({
				proId: this.proId,
				state: 0
			})
		},

		//查询所有物料信息
		getAllMaterial (data) {
			queryAllMaterial(data)
			.then((res) => {
				if(res && res.data.code == 200) {
					if (res.data.data.length > 0) {
						this.inventoryMsgList = [];
						this.temporaryInventoryMsgList = [];
						for (let item of res.data.data) {
							item.checked = false;
							// 添加过的物料不允许再次添加,数量为0不容许选择操作
							let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
							if (isExist.length > 0) {
								item['disabled'] = true
							} else {
								if (item.quantity > 0) {
									item['disabled'] = false
								} else {
									item['disabled'] = true
								}
							}
						};
						this.inventoryMsgList = res.data.data;
						this.temporaryInventoryMsgList = res.data.data;
						this.storeId = this.inventoryMsgList[0]['storeId'];
						this.systemId = this.inventoryMsgList[0]['systemId'];
					} else {
						this.$refs.uToast.show({
							message: '没有查询到对应的物料信息',
							type: 'error',
							position: 'center'
						})
					}
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

		// 是否删除耗材确定事件
		isDeleteSure () {
			this.consumableMsgList.splice(this.consumableIndex,1)
		},

		// 是否删除耗材取消事件
		isDeleteCancel () {
			this.consumableMsgList[this.consumableIndex]['number'] = 1
		},

		// 回显当前是否填写过耗材
		echoIsMaterial () {
			try {
				if (this.isFillMaterialList.length == 0) { this.isChangeConsumableShow = false; return };
				let echoIndex = this.isFillMaterialList.indexOf(this.isFillMaterialList.filter((item) => {return item.taskId == this.taskId})[0]);
				if (echoIndex == -1) { this.isChangeConsumableShow = false; return };
				this.isChangeConsumableShow = this.isFillMaterialList[echoIndex]['isFilledMaterial']
			} catch (err) {
				this.$refs.uToast.show({
					message: err,
					type: 'error',
					position: 'center'
				})
			}
		},

		// 步进器值变化事件
		stepValueChange (item,index,val) {
			if (item.quantity == nviewl) { return};
			if (val === "") {return};
			this.consumableIndex = index;
			if (val == 0) {
				if (!this.isDeleteShow) {
					this.isDeleteShow = true;
					return
				}
			};
			if (item.quantity > 0) {
				if (val > item.quantity) {
					this.$refs.uToast.show({
						message: `数量不能超过耗材库存数量${item.quantity}`,
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

		// 步进器聚焦事件
		stepValueFocus (item,index,val) {
			if (val != 0) {
			}
		},

		// 步进器失去焦点事件
		stepValueBlur (item,index,val) {
			if (Number(item.number) > item.quantity && this.consumableMsgList[index]['number'] != 1) {
				this.consumableMsgList[index]['number'] = 1
			}
		},

		// 存储是否填写过耗材
		storageIsMaterial () {
			let temporaryDepartmentNumber = [];
			temporaryDepartmentNumber = deepClone(this.isFillMaterialList);
			if (temporaryDepartmentNumber.length > 0 ) {
				let temporaryIndex = this.isFillMaterialList.indexOf(this.isFillMaterialList.filter((item) => {return item.taskId == this.taskId})[0]);
				if (temporaryIndex != -1) {
					temporaryDepartmentNumber[temporaryIndex]['isFilledMaterial'] = true
				} else {
					temporaryDepartmentNumber.push(
						{
							isFilledMaterial: true,
							taskId: this.taskId
						}
					)
				};
			} else {
				temporaryDepartmentNumber.push(
					{
						isFilledMaterial:true,
						taskId: this.taskId
					}
				)
			};
			this.changeisFillMaterialList(temporaryDepartmentNumber);
			setStore('isFillMaterialList', {"number": temporaryDepartmentNumber})
		},

		// 清除该任务存储的是否填写耗材的状态
		clearStorageMaterial () {
			if (this.isFillMaterialList.length == 0) { return };
			let temporaryPhotoList = this.isFillMaterialList.filter((item) => {return item.taskId !== this.taskId});
			this.changeisFillMaterialList(temporaryPhotoList);
			setStore('isFillMaterialList', {"number": temporaryPhotoList});
		},

		// 放大问题图片点击事件
		enlargeIssueImgEvent (item,type) {
			this.enlargeImgShow = true;
			type === 0 ? this.enlargeImgUrl = item : this.enlargeImgUrl = item
		},

		// 放大维修后图片点击事件
		enlargeCompleteImgEvent (item,type) {
			this.enlargeImgShow = true;
			type === 0 ? this.enlargeImgUrl = item : this.enlargeImgUrl = item
		},

		// 并行查询工单信息和图片信息
		parallelFunction () {
			this.infoText = '加载中,请稍等···';
			this.showLoadingHint = true;
			Promise.all([this.getOneRepairsProjectPhoto()]).then((values) => {
				this.showLoadingHint = false;
				if (values.length > 0) {
					this.photonList = values[0];
					if (this.photonList.length > 0) {
						for (let i = 0, len = this.photonList.length; i < len; i++) {
							if (this.photonList[i].imgType == 1) {
								this.issueImageList.push(this.photonList[i].path);
							} else if (this.photonList[i].imgType == 2) {
								this.completeImageList.push(this.photonList[i].path)
							}
						}
					}
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
				this.showLoadingHint = false;
			})
		},

		// 查询单条工单信息
		getOneRepairsProjectNoComplete () {
			this.infoText = '加载中,请稍等···';
			this.showLoadingHint = true;
			queryOneRepairsProject(this.taskId).then((res) => {
				if(res && res.data.code == 200) {
					this.oneRepairsMsg = res.data.data;
					let temporaryArr = [];
					for (let item of this.oneRepairsMsg.spaces) {
						temporaryArr.push(item.name)
					};
					this.oneRepairsMsg['spaces'] = temporaryArr
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
				this.showLoadingHint = false;
			})
		},

		//查询任务关联的物料信息
		getMaterialById (taskId) {
			queryMaterialById(taskId)
			.then((res) => {
				if(res && res.data.code == 200) {
					if (res.data.data.length > 0) {
						this.consumableMsgList = [];
						console.log('使用物料',res.data.data);
						this.consumableMsgList = res.data.data;
					} else {
					}
				} else {
					this.$refs.uToast.show({
						message: `${res.data.msg}`,
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

		//查询查询所有物料信息
		queryStoreId (data) {
			queryAllMaterial(data)
			.then((res) => {
				if(res && res.data.code == 200) {
					if (res.data.data.length > 0) {
						this.storeId = res.data.data[0]['storeId'];
						this.systemId = res.data.data[0]['systemId'];
					} else {
						this.$refs.uToast.show({
							message: '没有查询到对应的物料信息',
							type: 'error',
							position: 'center'
						})
					}
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
		},

		// 查询任务下的图片
		getOneRepairsProjectPhoto () {
			return new Promise((resolve,reject) => {
				queryRepairsTaskPhoto({taskId:this.taskId,imgType:-1}).then((res) => {
					if(res && res.data.code == 200) {
						resolve(res.data.data)
					}
				})
				.catch((err) => {
					reject(err.message)
				})
			})
		},

		// 回显照片
		echoPhoto () {
			this.historyIssueImageList = [];
			this.historyCompleteImageList = [];
			this.issueImageList = [];
			this.completeImageList = [];
			if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
			let echoIndex = this.isCompleteRepairsWorkOrderPhotoList.indexOf(this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
			if (echoIndex === -1) { return };
			if (this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['issuePhototList']) {
				this.issueImageList = deepClone(this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['issuePhototList'])
			};
			if (this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['completePhototList']) {
				this.completeImageList = deepClone(this.isCompleteRepairsWorkOrderPhotoList[echoIndex]['completePhototList'])
			};
		},
		
		// 清除上传成功后存储的照片
		clearPhotoList () {
			if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
			let echoIndex = this.isCompleteRepairsWorkOrderPhotoList.indexOf(this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId == this.taskId})[0]);
			if (echoIndex == -1) { return };
			let temporaryPhotoList = deepClone(this.isCompleteRepairsWorkOrderPhotoList);
			let temporaryPhotoId = [];
			temporaryPhotoList[echoIndex]['completePhototList'] = temporaryPhotoId;
			temporaryPhotoList[echoIndex]['issuePhototList'] = temporaryPhotoId;
			this.changeIsCompletePhotoList(temporaryPhotoList);
			setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
		},

		// 清除该任务存储的照片信息
		clearStoragePhoto () {
			if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
			let temporaryPhotoList = this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId !== this.taskId});
			this.changeIsCompletePhotoList(temporaryPhotoList);
			setStore('completPhotoInfo', {"photoInfo": temporaryPhotoList});
		},

		// 是否确定完成确认
		isFinishSure () {
			this.infoText = '完成中,请稍等···';
			this.showLoadingHint = true;
			completeRepairsTask({
				proId: this.proId,
				taskId: this.taskId
			})
			.then((res) => {
				if (res && res.data.code == 200) {
					this.$refs.uToast.show({
						message: `${res.data.msg}`,
						type: 'error',
						position: 'center'
					});
					if (this.repairsWorkOrderMsg.state == 5 || this.repairsWorkOrderMsg.state == 6) {
						// this.changeIsFreshRepairsWorkOrderPage(false)
					} else {
						// this.changeIsFreshRepairsWorkOrderPage(true)
					};
					this.backTo()
				} else {
					this.$refs.uToast.show({
						message: `${res.data.msg}`,
						type: 'error',
						position: 'center'
					})
				};
				this.infoText = '';
				this.showLoadingHint = false;
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

			// 提交用到的耗材信息
			submitMaterials () {
				let mateMsg = {
					proId: this.proId,
					id: this.taskId,
					isApp: 1,
					materials: []
				};
				for (let item of this.consumableMsgList) {
					if (item.number > 0) {
						mateMsg.materials.push(
							{
								proId: this.proId,
								proName: item.mateName,
								mateId: item.mateId,
								number: item.number,
								mateNumber: item.mateNumber,
								mateName: item.mateName,
								unit: item.unit,
								model: item.model,
								storeId: this.storeId,
								systemId: this.systemId
							}
						)
					}  
				};
				this.infoText = '物料上传中,请稍等···';
				this.showLoadingHint = true;
				 return new Promise((resolve,reject) => {
					saveMate(mateMsg).then((res) => {
						this.infoText = '';
						this.showLoadingHint = false;
						if (res && res.data.code == 200) {
							this.$refs.uToast.show({
								message: '物料上传成功',
								position: 'center'
							});
							resolve()
						} else {
							this.$refs.uToast.show({
								message: `${res.data.msg}`,
								type: 'error',
								position: 'center'
							});
							reject(`${res.data.msg}`)
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
					reject(err)
				})
			})
		},

		// 是否确定完成取消
		isFinishCancel () {
			if (this.repairsWorkOrderMsg.state == 5 || this.repairsWorkOrderMsg.state == 6) {
				this.changeIsFreshRepairsWorkOrderPage(false)
			} else {
				this.changeIsFreshRepairsWorkOrderPage(true)
			};
			this.$router.push({path: 'repairsWorkOrder'});
			this.changeTitleTxt({tit:'报修工单'});
			setStore('currentTitle','报修工单')
		},

		// 完成审核
		async completeTask () {
			if (!this.userInfo.extendData.projectAudit) {
				this.$refs.uToast.show({
					message: '你暂无此权限!',
					type: 'error',
					position: 'center'
				});
				return
			};
			await this.submitMaterials();
			this.infoText = '完成审核中,请稍等···';
			this.showLoadingHint = true;
			completeRepairsTaskFinal({
				proId: this.proId,
				taskId: this.taskId
			})
			.then((res) => {
				this.clearStorageMaterial();  
				if (res && res.data.code == 200) {
					this.$router.push({path: 'repairsWorkOrder'});
					this.changeTitleTxt({tit:'报修工单'});
					setStore('currentTitle','报修工单')
				} else {
					this.$refs.uToast.show({
						message: `${res.data.msg}`,
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
				this.showLoadingHint = false;
			})
		},

	// 驳回工单事件
	rejectWorkorderSureEvent () {
			this.infoText = '驳回中,请稍等···';
			this.showLoadingHint = true;
			dismissalTask({
				proId: this.proId,
				taskId: this.taskId,
				reason: this.rejectReason,
				workerId: this.workerId
			})
			.then((res) => {
				this.clearStorageMaterial();  
				if (res && res.data.code == 200) {
					this.$router.push({path: 'repairsWorkOrder'});
					this.changeTitleTxt({tit:'报修工单'});
					setStore('currentTitle','报修工单')
				} else {
					this.$refs.uToast.show({
						message: `${res.data.msg}`,
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
				this.showLoadingHint = false;
			})
		},
		

		// 驳回工单显示驳回原因弹框事件(需求变更，点击后直接返回上一页)
		rejectWorkorderEvent () {
			this.$router.push({path: 'repairsWorkOrder'});
			this.changeTitleTxt({tit:'报修工单'});
			setStore('currentTitle','报修工单')
			// if (!this.userInfo.extendData.projectAudit) {
				// this.$refs.uToast.show({
				// 	message: '你暂无此权限!',
				// 	type: 'error',
				// 	position: 'center'
				// })
			//   return
			// };          
			// this.rejectReason = '';  
			// this.rejectReasonShow = true;
		},

		// 驳回工单关闭前事件
		rejectReasonDialogBeforeCloseEvent (action, done) {
			if (action == "confirm") {
					if (this.rejectReason === '') {
						this.$refs.uToast.show({
							message: '请输入驳回原因!',
							type: 'error',
							position: 'center'
						});
						done(false) 
					} else {
						this.rejectWorkorderSureEvent();  
						done() 
					}
			} else {
					done() 
			}
		},

		// 驳回工单取消事件
		rejectWorkorderCancelEvent () {}
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
		.reject-reason-dialog {
		 ::v-deep .u-modal {
				width: 95% !important;
				top: 50% !important;
				border-radius: 8px;
				.u-modal__content {
					padding: 20px 20px 0 20px;
					box-sizing: border-box;
					.reject-reason-box {
						.reject-title {
								display: flex;
								align-items: center;
								justify-content: space-between;
								>text {
										font-size: 16px;
										color: #101010;
										font-weight: bold;
								}
						};
						.reject-content {
								display: flex;
								margin-top: 20px;
								.reject-left {
										font-size: 14px;
										color: #101010;
								};
								.reject-right {
										flex: 1;
										margin-left: 10px;
										/deep/ .van-cell {
												border: 1px solid #d9d9d9;
										}
								}
						}    
					}
				};
				.van-dialog__footer {
						justify-content: center;
						height: 90px;
						align-items: center;
						.van-dialog__cancel {
								flex: none !important;
								width: 30%;
								margin-right: 60px;
								color: #fff;
								border-radius: 7px;
								color: #0A7AF5;
								height: 40px;
								border: 1px solid #0A7AF5;
						};
						.van-dialog__confirm {
								flex: none !important;
								width: 30%;
								height: 40px;
								color: #fff;
								border-radius: 7px;
								background: #0A7AF5;
						}
				}
			}
		};
		.infoDialog {
			::v-deep .u-modal {
				width: 95% !important;
				top: 50% !important;
				.u-modal__content {
					height: 90vh;
					>image {
						width: 100%;
					}
				}
			}
		};
		.contentDialog {
			::v-deep .u-modal {
				top: 50%;
				.u-modal__content {
					margin-bottom: 6px;
					/*height: 500px;*/
					margin: 10px 0;
					.tool-name-list {
						width: 94%;
						display: flex;
						flex-flow: column;
						overflow: auto;
						margin: 0 auto;
						padding: 0;
						max-height: 80vh;
						.tool-name-list-title-innner {
							padding: 10px;
							position: relative;
							/deep/ .van-cell {
								padding: 4px;
								border: 1px solid #333;
							};
							.icon-span {
								position: absolute;
								top: 50%;
								transform: translateY(-50%);
								display: inline-block;
								right: 16px;
								.u-icon {
									font-size: 23px
								}
							}
						}
						.tool-name-list-content {
							flex: 1;
							padding: 6px;
							overflow: auto;
							box-sizing: border-box;
							border-top: 1px solid #b2b2b2;
							.circulation-area-content {
								position: relative;
								height: 40px;
								background: #fff;
								> text {
									height: 40px;
									line-height: 40px;
									font-size: 16px;
									display: inline-block;
									&:first-child {
										width: 55%
									};
									&:nth-child(2) {
										width: 20%;
									}
									&:last-child {
										position: absolute;
										top: 12px;
										right: 0
									}
								}
							}
							.circulation-area-title {
								position: relative;
								font-size: 0;
								text {
									height: 40px;
									line-height: 40px;
									display: inline-block;
									width: 20%;
									font-size: 16px;
									&:first-child {
										width: 55%
									};
									&:nth-child(2) {
										width: 20%;
									}
									&:last-child {
										position: absolute;
										text-align: right;
										right: 0
									}
								}
							}
						}
					}
				}
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
			 position: relative;
			 display: flex;
			 flex-direction: column;
			 font-size: 13px;
			 height: 0;
			 .content-top {
				 font-size: 14px;
				 background: #fff;
				 .content-top-name {
					 height: 90px;
					 padding: 10px;
					 box-sizing: border-box;
					 position: relative;
					 @include bottom-border-1px(#dadada);
					 > text {
						 position: absolute;
						 display: inline-block;
						 &:first-child {
							 left: 0;
							 top: 16px;
							 color: black;
							 padding-left: 10px;
						 };
						 &:last-child {
							 color: #2db8f9;
							 font-weight: bold;
							 right: 10px;
							 top: 16px;
							 width: 300px;
							 padding-left: 50px;
							 box-sizing: border-box;
							 line-height: 18px;
							 height: 65px;
							 overflow: auto
						 }
					 }
				 };
				 .content-top-other {
					 min-height: 45px;
					 box-sizing: border-box;
					 display: flex;
					 align-items: center;
					 justify-content: space-between;
					 padding: 4px 10px;
					 @include bottom-border-1px(#dadada);
					 &:last-child {
						 @include bottom-border-1px(#fff)
					 }
					 > text {
						 display: inline-block;
						 &:first-child {
							 color: black;
						 };
						 &:not(:first-child) {
							 width: 70%;
							 text-align: right;
							 word-break: break-all;
							 color: #2db8f9;
							 font-weight: bold;
							 line-height: 18px;
							 text {
								 font-weight: bold;
							 }
						 }
					 }
				 };
					.content-top-space {
					 min-height: 45px;
					 box-sizing: border-box;
					 display: flex;
					 align-items: center;
					 justify-content: space-between;
					 padding: 4px 10px;
					 @include bottom-border-1px(#dadada);
					 >text {
						 display: inline-block;
					 };
					>view {
						 width: 70%;
						 text-align: right;
						 color: #2db8f9;
						 font-weight: bold;
						 word-break: break-all;
						 line-height: 18px;
						 >text {
							 font-size: 14px
						 }
					 }
				 }
			 };
			 .content-middle {
				 position: relative;
				 background: #f7f7f7;
				 padding: 20px 0;
				 box-sizing: border-box;
				 .photo-list {
					 position: absolute;
					 left: 70px;
					 width: 250px;
					 top: 10px;
					 height: 90px;
					 overflow: auto;
					 >view {
						 width: 80px;
						 height: 80px;
						 float: left;
						 margin-right: 4px;
						 margin-bottom: 4px;
						 position: relative;
						 >image {
							 width: 100%;
							 height: 100%
						 };
						 &:nth-of-type(3n+0)
						 {
							 margin-right: 0
						 }
					 }
				 }
				 .issue-photo {
					 position: relative;
					 height: 100px;
					 background: #fff;
					 line-height: 100px;
					 box-sizing: border-box;
					 > text {
						 position: absolute;
						 display: inline-block;
						 &:first-child {
							 left: 0;
							 top: 0;
							 color: black;
							 padding-left: 10px;
						 };
						 &:last-child {
							 color: #2db8f9;
							 font-size: 34px;
							 font-weight: bold;
							 right: 10px;
							 top: 4px
						 }
					 }
				 };
				 .complete-photo {
					 position: relative;
					 margin: 20px 0;
					 height: 100px;
					 background: #fff;
					 line-height: 100px;
					 box-sizing: border-box;
					 > text {
						 position: absolute;
						 display: inline-block;
						 &:first-child {
							 left: 0;
							 top: 0;
							 color: black;
							 padding-left: 10px;
						 };
						 &:last-child {
							 color: #2db8f9;
							 font-size: 34px;
							 font-weight: bold;
							 right: 10px;
							 top: 4px
						 }
					 }
				 };
				 .manage-wrapper-one {
					 background: #fff;
					 .mange-title {
						 height: 50px;
						 @include bottom-border-1px(#dadada);
						 text {
							 position: absolute;
							 top: 50%;
							 transform: translateY(-50%);
							 &:first-child {
								 left: 10px;
							 }
						 }
					 };
					 .circulation-area {
							 max-height: 90%;
							 margin: 0 auto;
							 overflow: auto;
							 font-size: 0;
						 > view {
							 position: relative;
							 height: 50px;
							 background: #fff;
							 margin-bottom: 6px;
							 > text {
								 height: 50px;
								 line-height: 50px;
								 font-size: 16px;
								 display: inline-block;
								 text-align: center;
								 &:first-child {
									 width: 15%;
									 @include no-wrap;
								 };
								 &:nth-child(2) {
									 width: 55%;
									 @include no-wrap;
									 text-align: left;
									 /deep/ .van-cell {
										 .van-cell__value--alone {
											 .van-field__control {
												 text-align: center
											 }
										 }
									 }
								 };
								 &:last-child {
									 position: absolute;
									 top:0;
									 right: 4px;
									 width: 30%;
									 text-align: center;
									 text {
										 display: inline-block;
										 position: absolute;
										 top: 0;
										 right: 2px;
										 font-size: 22px;
										 color: #2db8f9;
										 /deep/ .van-icon {
											 top: 2px
										 }
									 }
								 }
							 }
						 }
					 }
				 };
					.manage-wrapper {
					 background: #fff;
					 .mange-title {
						 height: 50px;
						 @include bottom-border-1px(#dadada);
						 text {
							 position: absolute;
							 top: 50%;
							 transform: translateY(-50%);
							 &:first-child {
								 left: 10px;
							 };
							 &:last-child {
								 right: 10px;
								 width: 55px;
								 height: 30px;
								 text-align: center;
								 line-height: 30px;
								 border-radius: 6px;
								 background: #2db8f9;
								 color: #fff
							 }
						 }
					 };
					 .circulation-area {
							 max-height: 90%;
							 margin: 0 auto;
							 overflow: auto;
							 font-size: 0;
						 > view {
							 position: relative;
							 height: 50px;
							 background: #fff;
							 margin-bottom: 6px;
							 &:last-child {
								 margin-bottom:0
							 }
							 > text {
								 height: 50px;
								 line-height: 50px;
								 font-size: 16px;
								 display: inline-block;
								 text-align: center;
								 &:first-child {
									 width: 15%;
									 @include no-wrap
								 };
								 &:nth-child(2) {
									 width: 55%;
									 @include no-wrap;
									 text-align: left;
									 /deep/ .van-cell {
										 .van-cell__value--alone {
											 .van-field__control {
												 text-align: center
											 }
										 }
									 }
								 };
								 &:last-child {
									 position: absolute;
									 top:0;
									 right: 4px;
									 width: 30%;
									 text-align: right;
									 /deep/ .van-stepper--round {
										 .van-stepper__minus {
											 color: #fff;
											 background-color: #2db8f9;
											 border: 1px solid #2db8f9;
											 &:before {
												 height: 3px
											 }
										 };
										 .van-stepper__plus {
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
									 };
									 text {
										 display: inline-block;
										 position: absolute;
										 top: 0;
										 right: 2px;
										 font-size: 22px;
										 color: #2db8f9;
										 /deep/ .van-icon {
											 top: 2px
										 }
									 }
								 }
							 }
						 }
					 }
				}
			}
		};
		.content-bottom {
		 height: 60px;
		 margin: 0 auto;
		 width: 100%;
		 font-size: 14px;
		 background: #f7f7f7;
		 display: flex;
		 justify-content: center;
		 align-items: center;
		 .complete-check {
			 height: 40px;
			 width: 35%;
			 line-height: 40px;
			 border-radius: 4px;
			 background: #2db8f9;
			 color: #fff;
			 font-weight: bold;
			 text-align: center;
			 margin-right: 25px;
		 };
		 .completeCheckStyle {
			 opacity: .5 !important;
		 };
		 .reject-workorder {
			 height: 40px;
			 width: 35%;
			 line-height: 40px;
			 border: 1px solid #101010;
			 border-radius: 4px;
			 color: #101010;
			 font-weight: bold;
			 text-align: center
		 };
		 .rejectWorkorderStyle {
			 // opacity: .4 !important;
		 }
		}
	}
</style>
