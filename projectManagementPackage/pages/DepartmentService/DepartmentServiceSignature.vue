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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="巡检签名" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-top">
			  <ElectronicSignature ref="mychild"></ElectronicSignature>
			</view>
			<view class="content-bottom">
				<text @click="sure">确认</text>
				<text @click="rewrite">重写</text>
				<text @click="cancel">取消</text>
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
	import ElectronicSignature from '@/components/electronicSignature/electronicSignature'
	import store from '@/store'
	import {submitDepartMentServiceSignInfo, submitSingleDepartMentServiceSignInfo,updateDepartmentServiceTaskBeCompleted} from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar,
			ElectronicSignature
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				currentDepartmentId: ''
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'currentElectronicSignature',
				'departmentServiceMsg',
				'completeDepartmentServiceOfficeInfo',
				'isSingleDepartmentSignature',
				'departmentServiceOfficeId',
				'isCurrentDepartmentServiceVerifySweepCode'
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
			if (this.isSingleDepartmentSignature) { this.echoCurrentDepartmentId() }
		},
		methods: {
			...mapMutations([
				'changeCompleteDepartmentServiceOfficeInfo'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 获取当前需要签名的科室id
			echoCurrentDepartmentId () {
				try {
					if (this.isCurrentDepartmentServiceVerifySweepCode.length == 0) { return };
					let echoIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
					if (echoIndex == -1) { return };
					this.currentDepartmentId = this.isCurrentDepartmentServiceVerifySweepCode[echoIndex]['number'];
				} catch (err) {
					uni.showToast({
					  title: err,
					  icon: 'error'
					})
				}
			},

			// 确认
			sure () {
				this.$refs.mychild.commitSure();
				setTimeout(() => {
					if (!this.currentElectronicSignature) {
						return
					};
					uni.showToast({
					  title: '上传中,请稍等···',
					  icon: 'none'
					});
					if (!this.isSingleDepartmentSignature) {
						submitDepartMentServiceSignInfo({
							taskId: this.taskId,
							imgType: 0,
							imgOrsign: this.currentElectronicSignature
						}).then((res) => {
								this.showLoadingHint = false;
								if (res && res.data.code == 200) {
									this.updateTaskComplete(this.proId, this.taskId)
								} else {
									uni.showToast({
									  title: res.data.msg,
									  icon: 'error'
									})
								}
							})
							.catch((err) => {
								uni.showToast({
								  title: err,
								  icon: 'error'
								})
							})
					} else {
						submitSingleDepartMentServiceSignInfo({
							proId: this.proId, //项目ID
							taskId: this.taskId, //任务id
							depId: this.currentDepartmentId, //部门ID
							depNo: this.departmentServiceOfficeId, //部门编号
							imgSign: this.currentElectronicSignature // 签名信息
						}).then((res) => {
							this.showLoadingHint = false;
							if (res && res.data.code == 200) {
								uni.showToast({
								  title: res.data.data,
								  icon: 'success'
								});
								uni.navigateBack({
									delta: 2
								})
							} else {
								uni.showToast({
								  title: res.data.msg,
								  icon: 'error'
								})
							}
						})
						.catch((err) => {
							uni.showToast({
							  title: err,
							  icon: 'error'
							})
						})
					}
				},1000)
			},

			// 更新任务为已完成
			updateTaskComplete (proId,taskId) {
				updateDepartmentServiceTaskBeCompleted(proId,taskId).then((res) => {
					if(res && res.data.code == 200) {
						// 删除当前任务存储的已完成巡检的科室信息
						uni.showToast({
						  title: '任务已完成',
						  icon: 'success'
						});
						let temporaryInfo = this.completeDepartmentServiceOfficeInfo.filter((item) => { return item.taskId !== this.taskId});
						this.changeCompleteDepartmentServiceOfficeInfo(temporaryInfo);
						const pages = getCurrentPages();
						const prevPageInner = pages[pages.length-3];
						if (prevPageInner) {
							prevPageInner.$vm.loadData();
						};
						uni.navigateBack({
							delta: 2
						})
					} else {
						uni.showToast({
						  title: res.data.msg,
						  icon: 'error'
						})
					}
				})
				.catch((err) => {
					uni.showToast({
					  title: err,
					  icon: 'error'
					})
				})
			},

			// 重写
			rewrite () {
				this.$refs.mychild.overwrite()
			},

			// 取消
			cancel () {
				this.$refs.mychild.overwrite();
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
			 flex: 1;
			 padding-top: 10px;
			 overflow: auto
		 };
		 .content-bottom {
			 width: 90%;
			 margin: 0 auto;
			 height: 150px;
			 margin-top: 10px;
			 position: relative;
			 > text {
				 display: inline-block;
				 position: absolute;
				 width: 100%;
				 height: 45px;
				 text-align: center;
				 line-height: 45px;
				 left: 0;
				 border-radius: 2px;
				 &:first-child {
					 background: #2db8f9;
					 color: #fff;
					 top: 0
				 };
				 &:nth-child(2) {
					 border: 1px solid #7198fa;
					 color: #7198fa;
					 bottom: 53px;
					 box-sizing: border-box
				 }
				 &:last-child {
					 background: #999ea1;
					 color: #fff;
					 bottom: 1px
				 }
			 }
		 }
		}
	}
</style>
