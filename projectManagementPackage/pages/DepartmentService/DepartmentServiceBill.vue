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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="区域巡检单" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<!-- 内容部分 -->
			<view class="content-top">
				<view class="circulation-area-title">
					当前巡检区域: {{currentDepartmentName}}
				</view>
				<view class="circulation-area">
					<view v-for="(item,index) in consumableMsgList" :key="index">
						<view>{{index + 1}}</view>
						<view>
							{{item.itemName}}
						</view>
						<view>
							<u-icon name="checkmark-circle-fill" size="29" :color="(item.right || item.rightClicked) ? '#7fdc90' : ''" @click="rightClick(item,index,'right')"></u-icon>
							<u-icon name="close-circle-fill" size="29" :color="(item.error || item.errorClicked) ? 'red' : ''" @click="rightClick(item,index,'error')"></u-icon>
						</text>
					</view>
				</view>
			</view>
		</view>
		<view class="content-bottom">
			<view class="back-home"  @click="fillConsumable" v-if="showFillConsumable">填写耗材</view>
			<view class="quit-account" @click="sure">确认</view>
		</view>
	</view>
	<u-modal :show="issueShow" title="是否反馈该问题到调度中心" :showCancelButton="true"  :closeOnClickOverlay="true"
		confirmText="不上报" cancelText="上报问题"
		@confirm="noReportProblem"
		@cancel="reportProblem"
		@close="issueShow = false"
		>
	</u-modal>
	 <u-modal :show="isBackShow"  content="返回上级将不会保存本区域检查结果,确定返回?" :showCancelButton="true"
			@confirm="isBackSure" @cancel="isBackCancel"
		>
	</u-modal>
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
		Dictionary,
		deepClone,
		repeArray,
		getCache
	} from '@/common/js/utils'
	import {queryExamineItems,postCheckResult} from '@/api/project.js'
	import store from '@/store'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				issueShow: false,
				isBackShow: false,
				showFillConsumable: false,
				currentDepartmentId: '',
				currentDepartmentName: '',
				consumableMsgList: []
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'departmentServiceMsg',
				'isCurrentDepartmentServiceVerifySweepCode',
				'departmentServiceOfficeId',
				'completeDepartmentServiceOfficeInfo',
				'completeDepartmentServiceCheckedItemList',
				'currentDepartmentServiceCheckedItemId'
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
				return this.departmentServiceMsg.id
			}
		},
		onShow () {
			this.echoCurrentDepartmentId();
			// 查询检查项
			this.getExamineItems({
				proId: this.proId,
				depId: this.currentDepartmentId
			})
		},
		methods: {
			...mapMutations([
				'changeCompleteDepartmentServiceOfficeInfo',
				'changeCurrentDepartmentServiceCheckedItemId',
				'changeCompleteDepartmentServiceCheckedItemList',
				'changeIsSingleDepartmentSignature'
			]),
			
			// 顶部导航返回事件
			backTo () {
				this.issueShow = false;
				this.isBackShow = true;
				if (this.isBackShow)  {
					this.isBackShow = true;
					return
				};
				uni.navigateBack()
			},
			
			// 确定返回
			isBackSure () {
				this.isBackShow = false;
				this.clearCheckedInfo();
				uni.navigateBack()
			},

			// 取消返回
			isBackCancel () {
				this.isBackShow = false
			},

			// 回显当前检修科室名称
			echoCurrentDepartmentId () {
				try {
					if (this.isCurrentDepartmentServiceVerifySweepCode.length == 0) { return };
					let echoIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
					if (echoIndex == -1) { return };
					this.currentDepartmentId = this.isCurrentDepartmentServiceVerifySweepCode[echoIndex]['number'];
					// 获取科室名称
					this.currentDepartmentName = Dictionary(getCache('departmentMessage'),this.currentDepartmentId)
				} catch (err) {
					console.log('err',err);
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				}
			},

			 // 填写耗材
			fillConsumable () {
				uni.navigateTo({
					url: '/projectManagementPackage/pages/DepartmentService/DepartmentServiceFillConsumable'
				})
			},

			// 查询检查项
			getExamineItems (data) {
				this.infoText ='加载中···';
				this.showLoadingHint = true;
				queryExamineItems(data).then((res) => {
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						this.consumableMsgList = [];
						if (res.data.data.length > 0) {
							for (let item of res.data.data) {
								this.consumableMsgList.push({
									depId: item.depId,  //科室ID
									depName: item.depName,   //科室名称
									typeName: item.typeName,  //检测类型
									itemName: item.itemName,  //检测项
									itemId: item.itemId,    //检测项ID
									right: false,
									error: false,
									rightClicked: false,
									errorClicked: false,
									checkResult: 0
								})
							};
							// 为完成问题上报的巡检项增加标记
							if (this.completeDepartmentServiceCheckedItemList.length > 0) {
								let echoIndex = this.completeDepartmentServiceCheckedItemList.indexOf(this.completeDepartmentServiceCheckedItemList.filter((item) => {return item.taskId == this.taskId})[0]);
								if (echoIndex == -1) { return };
								if (this.completeDepartmentServiceCheckedItemList[echoIndex]['depId'] != this.currentDepartmentId) {
									this.clearCheckedInfo();
									return
								};
								if (this.consumableMsgList.length > 0) {
									for (let n = 0, nLen = this.consumableMsgList.length; n < nLen; n++) {
										if (this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'].length > 0) {
											for (let i = 0, len1 = this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'].length; i < len1; i++) {
												if (this.consumableMsgList[n]['itemId'] == this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'][i]['id']) {
													if (this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'][i]['type'] == "error") {
														this.consumableMsgList[n]['errorClicked'] = true;
														this.consumableMsgList[n]['rightClicked'] = false;
														this.consumableMsgList[n]['right'] = false;
														this.consumableMsgList[n]['error'] = true;
														this.consumableMsgList[n]['checkResult'] = this.completeDepartmentServiceCheckedItemList[echoIndex]['officeList'][i]['checkResult']
													} else {
														this.consumableMsgList[n]['errorClicked'] = false;
														this.consumableMsgList[n]['rightClicked'] = true;
														this.consumableMsgList[n]['right'] = true;
														this.consumableMsgList[n]['error'] = false;
														this.consumableMsgList[n]['checkResult'] = 0
													}
												}
											}
										}
									}
								}
							}
						} else {
							this.$refs.uToast.show({
								message: '没有查询到检查项',
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
					this.showLoadingHint = false;
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},

			// 存储完成问题上报的检查项信息
			storageCompleteCheckItemInfo (number) {
				let temporaryOfficeList = [];
				let temporaryDepartmentId = [];
				temporaryOfficeList = deepClone(this.completeDepartmentServiceCheckedItemList);
				if (this.completeDepartmentServiceCheckedItemList.length > 0 ) {
					let temporaryIndex = this.completeDepartmentServiceCheckedItemList.indexOf(this.completeDepartmentServiceCheckedItemList.filter((item) => {return item.taskId == this.taskId})[0]);
					if (temporaryIndex != -1) {
						temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
						// 存储问题的解决方式
						let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
						// 删除重复存的id
						temporaryDepartmentId = temporaryDepartmentId.filter((item) => {return item.id !== this.currentDepartmentServiceCheckedItemId.id});
						temporaryCheckItemInfo['checkResult'] = number;
						this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
						temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
						temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId);
						temporaryOfficeList[temporaryIndex]['depId'] = this.currentDepartmentId
					} else {
						// 存储问题的解决方式
						let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
						temporaryCheckItemInfo['checkResult'] = number;
						this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
						temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
						temporaryOfficeList.push(
							{
								officeList: repeArray(temporaryDepartmentId),
								taskId: this.taskId,
								depId: this.currentDepartmentId
							}
						)
					}
				} else {
					// 存储问题的解决方式
					let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
					temporaryCheckItemInfo['checkResult'] = number;
					this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
					temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
					temporaryOfficeList.push(
						{
							officeList: repeArray(temporaryDepartmentId),
							taskId: this.taskId,
							depId: this.currentDepartmentId
						}
					)
				};
				this.changeCompleteDepartmentServiceCheckedItemList(temporaryOfficeList)
			},

			//对号图标点击
			rightClick(item,index,type) {
				if (item.errorClicked) {
					this.$refs.uToast.show({
						message: '检查结果已上报,不能更改',
						type: 'error',
						position: 'center'
					});
					return
				};
				if (type == 'right') {
					this.changeCurrentDepartmentServiceCheckedItemId({id: item.itemId,type:'right'});
					this.storageCompleteCheckItemInfo(0);
					this.consumableMsgList[index].right = !this.consumableMsgList[index].right;
					if (this.consumableMsgList[index].error == true) {
						this.consumableMsgList[index].error = false
					}
				} else {
					this.changeCurrentDepartmentServiceCheckedItemId({id: item.itemId,type:'error'});
					this.consumableMsgList[index].error = !this.consumableMsgList[index].error;
					if (this.consumableMsgList[index].right == true) {
						this.consumableMsgList[index].right = false
					};
					this.issueShow = true
				};
				this.showFillConsumable = false;
				// 重新查询检查项并给相关字段赋值
				this.getExamineItems({
					proId: this.proId,
					depId: this.currentDepartmentId
				});
				console.log(this.consumableMsgList);
			},

			// 上报问题弹框
			reportProblem () {
				this.issueShow = false;
				uni.navigateTo({
					url: '/projectManagementPackage/pages/DepartmentService/DepartmentServiceIssueReport'
				})
			},

			// 不上报问题弹框
			noReportProblem () {
				this.issueShow = false;
				this.storageCompleteCheckItemInfo(1);
				this.showFillConsumable = true;
				// 重新查询检查项并给相关字段赋值
				this.getExamineItems({
					proId: this.proId,
					depId: this.currentDepartmentId
				})
			},

			// 存储完成巡检的科室编号
			storeCompleteDepartmentNumber () {
				let temporaryOfficeList = [];
				let temporaryDepartmentId = [];
				temporaryOfficeList = deepClone(this.completeDepartmentServiceOfficeInfo);
				if (this.completeDepartmentServiceOfficeInfo.length > 0 ) {
					let temporaryIndex = this.completeDepartmentServiceOfficeInfo.indexOf(this.completeDepartmentServiceOfficeInfo.filter((item) => {return item.taskId == this.taskId})[0]);
					if (temporaryIndex != -1) {
						temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
						temporaryDepartmentId.push(this.departmentServiceOfficeId);
						temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
					} else {
						temporaryDepartmentId.push(this.departmentServiceOfficeId);
						temporaryOfficeList.push(
							{
								officeList: repeArray(temporaryDepartmentId),
								taskId: this.taskId
							}
						)
					}
				} else {
					temporaryDepartmentId.push(this.departmentServiceOfficeId);
					temporaryOfficeList.push(
						{
							officeList: repeArray(temporaryDepartmentId),
							taskId: this.taskId
						}
					)
				};
				this.changeCompleteDepartmentServiceOfficeInfo(temporaryOfficeList)
			},

			// 清除当前房间存储的检查项信息
			clearCheckedInfo () {
				let temporaryInfo = this.completeDepartmentServiceCheckedItemList.filter((item) => { return item.taskId !== this.taskId});
				this.changeCompleteDepartmentServiceCheckedItemList(temporaryInfo)
			},

			// 确认
			sure () {
				let flag = this.consumableMsgList.every((item) => {  return item.rightClicked == true || item.errorClicked == true});
				if (!flag) {
					this.$refs.uToast.show({
						message: '请完成所有的检查项',
						type: 'error',
						position: 'center'
					});
					return
				};
				this.infoText ='提交中···';
				this.showLoadingHint = true;
				let temporaryCheckItems = [];
				for (let item of this.consumableMsgList) {
					temporaryCheckItems.push({
						itemId: item.itemId,
						itemName: item.itemName,
						checkResult: item.checkResult
					})
				};
				let data = {
					taskId: this.taskId,
					depId: this.currentDepartmentId,
					checkItems: temporaryCheckItems
				};
				postCheckResult(data).then((res) => {
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						this.changeIsSingleDepartmentSignature(true);
						uni.navigateTo({
							url: '/projectManagementPackage/pages/DepartmentService/DepartmentServiceSignature'
						})
						this.$refs.uToast.show({
							message: '上报成功',
							type: 'success',
							position: 'center'
						});
						this.clearCheckedInfo();
						this.storeCompleteDepartmentNumber();
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
		::v-deep .u-modal {
			.van-button--default {
				background-color: #2db8f9;
				color: #fff;
				border: none
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
			 width: 100%;
			 flex: 1;
			 display: flex;
			 height: 0;
			 flex-direction: column;
			 .content-top {
				 height: auto;
				 font-size: 14px;
				 background: #f7f7f7;
				 flex: 1;
				 overflow: auto;
				 .circulation-area {
					 max-height: 90%;
					 margin: 0 auto;
					 overflow: auto;
					 font-size: 0;
				 > view {
					 display: flex;
					 align-items: center;
					 height: 50px;
					 background: #fff;
					 margin-bottom: 6px;
					 &:last-child {
						 margin-bottom:0
					 };
					 >view {
						 height: 50px;
						 font-size: 16px;
						 display: flex;
						 align-items: center;
						 justify-content: center;
						 &:first-child {
							 width: 10%;
						 };
						 &:nth-child(2) {
							 flex: 1;
							 overflow-x: auto;
							 white-space: nowrap;
							 justify-content: left !important;
						 };
						 &:last-child {
							 width: 30%;
							 ::v-deep .u-icon {
								&:last-child {
									margin-left: 6px;
								}
							 }
						 }
					 }
				 }
			 };
			 .circulation-area-title {
				 height: 10%;
				 position: relative;
				 padding-left: 4px;
				 padding-top: 6%;
				 box-sizing: border-box;
				 font-size: 16px
				 }
			 };
			 .content-bottom {
				 height: 100px;
				 margin: 0 auto;
				 width: 100%;
				 font-size: 13px;
				 background: #f7f7f7;
				 position: relative;
				 .back-home {
					 height: 40px;
					 width: 220px;
					 margin: 0 auto;
					 line-height: 40px;
					 left: 50%;
					 margin-left: -110px;
					 position: absolute;
					 top: 5px;
					 background: #fff;
					 color: #2db8f9;
					 font-weight: bold;
					 text-align: center;
					 border: 1px solid #2db8f9
				 };
				 .quit-account {
					 height: 40px;
					 width: 220px;
					 margin: 0 auto;
					 line-height: 40px;
					 left: 50%;
					 margin-left: -110px;
					 position: absolute;
					 bottom: 5px;
					 background: #2db8f9;
					 color: #fff;
					 font-weight: bold;
					 text-align: center
				 }
			 }
		}
	}
</style>
