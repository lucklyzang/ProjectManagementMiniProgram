<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<u-modal :show="againScanCodeShow" :title="againScanCodeContent" @confirm="againScanCodeConfirm" @cancel="againScanCodeCancel" confirmColor="#2db8f9" confirmText="确定" :showCancelButton="true" ref="uModal" :asyncClose="true"></u-modal>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast" />
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="工单详情" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<!-- 内容部分 -->
			<view class="content-top">
				<view class="content-top-other">
					<text>巡检编号</text>
					<text>
						{{oneRepairsMsg.taskNumber}}
					</text>
				</view>
				<view class="content-top-other">
					<text>巡检名称</text>
					<text>
						{{oneRepairsMsg.taskName}}
					</text>
				</view>
				<view class="content-top-other">
					<text>当前次数</text>
					<text>
						{{oneRepairsMsg.currentTimes}}
					</text>
				</view>
				<view class="content-top-other">
					<text>时间</text>
					<text>
						{{oneRepairsMsg.startTime}}
					</text>
				</view>
			</view>
			<view class="content-middle">
				<view>巡检地点</view>
				<view v-if="oneRepairsMsg.spaces ? oneRepairsMsg.spaces.length > 0 : false">
					<view v-for="(item,index) in oneRepairsMsg.spaces" :key="index" :class="{listStyle: oneRepairsMsg.hasSpaces.filter((innerItem) => { return innerItem['depId'] == item['depId']}).length > 0}">{{item.depName}}</view>
				</view>
			</view>
			<view class="content-bottom" v-if="departmentServiceMsg.state !== 4">
				<view class="back-home"  @click="fillConsumable">扫一扫</view>
				<view class="quit-account" v-if="departmentServiceMsg.state != 3" @click="completeTask">完成巡检</view>
				<view class="quit-account" v-if="departmentServiceMsg.state == 3" @click="signatureClick">签字</view>
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
		repeArray,
		deepClone
	} from '@/common/js/utils'
	import store from '@/store'
	import { queryOneDepartmentService, verifyDepartment, updateDepartmentServiceTaskBeSigned } from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '修改中···',
				showLoadingHint: false,
				oneRepairsMsg: '',
				departmentId: '',
				departmentNo: '',
				againScanCodeContent: '当前没有扫描到任何信息,请重新扫描',
				againScanCodeShow: false
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'departmentServiceMsg',
				'isCurrentDepartmentServiceVerifySweepCode',
				'completeDepartmentServiceOfficeInfo',
				'isDepartmentServiceVerifySweepCode'
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
		onLoad () {
			this.getOneDepartmentService()
		},
		methods: {
			...mapMutations([
				'changeIsDepartmentServiceVerifySweepCode',
				'changeIsCurrentDepartmentServiceVerifySweepCode',
				'changeDepartmentServiceOfficeId',
				'changeIsSingleDepartmentSignature'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 查询单条科室巡检任务信息
			getOneDepartmentService () {
				queryOneDepartmentService(this.taskId).then((res) => {
					if(res && res.data.code == 200) {
						let temporaryOneRepairsMsg = res.data.data;
						temporaryOneRepairsMsg.spaces = res.data.data.spaces;
						for (let item of temporaryOneRepairsMsg.spaces) {
							item.checked = false
						};
						this.oneRepairsMsg = temporaryOneRepairsMsg;
						// 为完成巡检的科室增加标记
						if (this.completeDepartmentServiceOfficeInfo.length > 0) {
							for (let w = 0, wLen = this.completeDepartmentServiceOfficeInfo.length; w < wLen; w++) {
								if (this.oneRepairsMsg['id'] == this.completeDepartmentServiceOfficeInfo[w]['taskId']) {
									if (this.completeDepartmentServiceOfficeInfo[w]['officeList'].length > 0) {
										for (let i = 0, len1 = this.completeDepartmentServiceOfficeInfo[w]['officeList'].length; i < len1; i++) {
											if (this.oneRepairsMsg['spaces'].length > 0) {
												for (let j = 0, len2 = this.oneRepairsMsg['spaces'].length; j < len2; j++) {
													if (this.oneRepairsMsg['spaces'][j]['depNo'] == this.completeDepartmentServiceOfficeInfo[w]['officeList'][i]) {
														this.oneRepairsMsg['spaces'][j]['checked'] = true
													}
												}
											}
										}
									}
								}
							}
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
				})
			},

			// 扫一扫
			fillConsumable () {
				// if (this.oneRepairsMsg.spaces.length == this.oneRepairsMsg.hasSpaces.length) {
				//   this.$toast('该任务下所有区域都已完成检修,不能执行该操作');
				//   return
				// };
				if (this.departmentServiceMsg.state == 3) {
					this.$refs.uToast.show({
						message: '该任务状态为待签字,不能执行该操作',
						type: 'error',
						position: 'center'
					});
					return
				};
				uni.scanCode({
					onlyFromCamera: true, // 只允许相机扫码
					scanType: ['qrCode'], // 只扫二维码
					success: (res) => {
						this.scanQRcodeCallback(res.result)
					},
					fail: (err) => {
						if (err.errMsg !== 'scanCode:fail cancel') {
							uni.showToast({ title: '扫码失败', icon: 'none' });
						}
					}
				})
			},

			// 校验当前科室二维码
			juddgeCurrentDepartment(data) {
				verifyDepartment(data).then((res) => {
					if (res && res.data.code == 200) {
						// 存储扫码校验通过的科室编号
						this.storeDepartmentNumber(data.depNo);
						// 存储当前扫码校验通过的科室id
						this.storeCurrentDepartmentNumber(data.depId);
						// 存储当前扫码校验通过的科室编号
						this.changeDepartmentServiceOfficeId(data.depNo);
						this.$router.push({path: 'departmentServiceBill'});
						this.changeTitleTxt({tit:'区域巡检单'});
						setStore('currentTitle','区域巡检单')
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

			// 摄像头扫码后处理的方法
			scanQRcodeCallback(code) {
				if (code) {
					let codeData = code.split('|');
					if (codeData.length > 0) {
						this.departmentId = codeData[0];
						this.departmentNo = codeData[1];
						// 如果当前科室已完成检查结果上报,则禁止在次校验
						// let temporaryFlagOne = this.oneRepairsMsg.spaces.filter((item) => {return item.checked == true});
						// let temporaryFlagTwo = temporaryFlagOne.some((item) => {return item.depNo == this.departmentNo});
						// if (temporaryFlagTwo) {
						//   this.$toast('当前扫码区域巡检已完成,禁止此操作');
						//   return
						// };
						this.juddgeCurrentDepartment({
							id: this.taskId,  //任务ID
							depNo: this.departmentNo, //科室编号
							depId: this.departmentId,  //科室ID
							workerId: this.workerId // 用户id
						})
					}
				} else {
					this.againScanCodeShow = true
				}
			},
			
			againScanCodeConfirm () {
				this.againScanCodeShow = false;
				this.fillConsumable()
			},
			
			againScanCodeCancel () {
				this.againScanCodeShow = false
			},

			// 存储扫码校验通过的科室编号
			storeDepartmentNumber (departmentNumber) {
				let temporaryOfficeList = [];
				let temporaryDepartmentId = [];
				temporaryOfficeList = deepClone(this.isDepartmentServiceVerifySweepCode);
				if (this.isDepartmentServiceVerifySweepCode.length > 0 ) {
					let temporaryIndex = this.isDepartmentServiceVerifySweepCode.indexOf(this.isDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
					if (temporaryIndex != -1) {
						temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
						temporaryDepartmentId.push(departmentNumber);
						temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId)
					} else {
						temporaryDepartmentId.push(departmentNumber);
						temporaryOfficeList.push(
							{
								officeList: repeArray(temporaryDepartmentId),
								taskId: this.taskId
							}
						)
					}
				} else {
					temporaryDepartmentId.push(departmentNumber);
					temporaryOfficeList.push(
						{
							officeList: repeArray(temporaryDepartmentId),
							taskId: this.taskId
						}
					)
				};
				this.changeIsDepartmentServiceVerifySweepCode(temporaryOfficeList)
			},

			// 存储当前扫码校验通过的科室id
			storeCurrentDepartmentNumber (departmentNumber) {
				let temporaryDepartmentNumber = [];
				temporaryDepartmentNumber = deepClone(this.isCurrentDepartmentServiceVerifySweepCode);
				if (temporaryDepartmentNumber.length > 0 ) {
					let temporaryIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
					if (temporaryIndex != -1) {
						temporaryDepartmentNumber[temporaryIndex]['number'] = departmentNumber
					} else {
						temporaryDepartmentNumber.push(
							{
								number: departmentNumber,
								taskId: this.taskId
							}
						)
					};
				} else {
					temporaryDepartmentNumber.push(
						{
							number:departmentNumber,
							taskId: this.taskId
						}
					)
				};
				this.changeIsCurrentDepartmentServiceVerifySweepCode(temporaryDepartmentNumber)
			},

			// 签字
			signatureClick () {
				this.changeIsSingleDepartmentSignature(false);
				uni.navigateTo({
					url: '/projectManagementPackage/pages/DepartmentService/DepartmentServiceSignature'
				})
			},

			// 完成巡检
			completeTask () {
				if (this.oneRepairsMsg.hasSpaces.length < 1) {
					this.$refs.uToast.show({
						message: '请至少完成一个区域的巡检,才能完成',
						type: 'error',
						position: 'center'
					});
					return
				};
				updateDepartmentServiceTaskBeSigned(this.proId, this.taskId).then((res) => {
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
							message: `${res.data.msg}`,
							type: 'success',
							position: 'center'
						});
						// 删除当前任务存储的扫码校验校验通过的科室编号信息
						let temporaryCurrentDepartmentNUmInfo = this.isDepartmentServiceVerifySweepCode.filter((item) => { return item.taskId !== this.taskId});
						this.changeIsDepartmentServiceVerifySweepCode(temporaryCurrentDepartmentNUmInfo);
						// 删除当前任务存储的当前扫码校验校验通过的科室编号信息
						let temporaryInfo = this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => { return item.taskId !== this.taskId});
						this.changeIsCurrentDepartmentServiceVerifySweepCode(temporaryInfo);
						this.backTo()
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
			 overflow: auto;
			 position: relative;
			 display: flex;
			 flex-direction: column;
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
				 height: 45px;
				 line-height: 45px;
				 box-sizing: border-box;
				 position: relative;
				 @include bottom-border-1px(#dadada);
				 &:last-child {
					 @include bottom-border-1px(#fff)
				 }
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
						 font-weight: bold;
						 right: 10px;
						 top: 0
					 }
				 }
			 }
		 };
		 .content-middle {
			 flex: 1;
			 margin: 0 auto;
			 border-top: 4px solid #f7f7f7;
			 width: 100%;
			 overflow: auto;
			 font-size: 14px;
			 background: #fff;
			 padding: 10px;
			 position: relative;
			 display: flex;
			 flex-direction: column;
			 height: 0;
			 > view {
				color: black;
				&:last-child {
					width: 100%;
					flex: 1;
					overflow: auto;
					margin-top: 10px;
					>view {
						 float: left;
						 padding: 8px;
						 margin-right: 4px;
						 margin-bottom: 4px;
						 background: #8e9397;
						 color: #fff;
						 border-radius: 2px
					};
					.listStyle {
						background: #2db8f9
					}
				}
			 }
		 };
		 .content-bottom {
			 height: 140px;
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
				 top: 20px;
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
				 bottom: 20px;
				 background: #2db8f9;
				 color: #fff;
				 font-weight: bold;
				 text-align: center
			 }
		 }
		}
	}
</style>
