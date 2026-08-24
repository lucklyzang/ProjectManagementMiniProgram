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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="工单完成签名" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="worker-show">
			<view class="content-top" ref="contentTop">
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
	import ElectronicSignature from '@/components/electronicSignature/electronicSignature'
	import {uploadRepairsTaskPhoto, noAuditTask} from '@/api/project.js'
	import store from '@/store'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar,
			ElectronicSignature
		},
		data() {
			return {
				noClick: true,
				infoText: '修改中···',
				showLoadingHint: false
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'currentElectronicSignature',
				'repairsWorkOrderMsg',
				'isCompleteRepairsWorkOrderPhotoList'
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
		methods: {
			...mapMutations([
				 'changeIsCompletePhotoList'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},

			// 确认
			sure () {
				this.$refs.mychild.commitSure();
				if (!this.currentElectronicSignature) {
					return
				};
				setTimeout(() => {
					this.$refs.contentTop.style.zIndex = 0;
					this.infoText = '上传中,请稍等···';
					this.showLoadingHint = true;
					let photoMsg = {
						taskId: this.taskId,  //任务ID
						images: []
					};
					photoMsg.images = [];
					photoMsg.images.push({
						imgType: 0,
						image: this.currentElectronicSignature
					});
					uploadRepairsTaskPhoto(photoMsg)
					.then((res) => {
						this.showLoadingHint = false;
						this.overlayShow = false;
						if (res && res.data.code == 200) {
							this.$refs.uToast.show({
								message: res.data.msg,
								position: 'center'
							});
							this.rewrite ();
							this.updateTaskComplete()
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
						this.showLoadingHint = false;
					})
				},1000)
			},

			// 重写
			rewrite () {
				this.$refs.mychild.overwrite()
			},

			// 更改任务状态为已完成
			updateTaskComplete () {
				this.infoText = '加载中,请稍等···';
				this.showLoadingHint = true;
				noAuditTask({
					proId: this.proId,
					taskId: this.taskId
				})
				.then((res) => {
					if (res && res.data.code == 200) {
						this.clearPhotoList();
						this.clearStoragePhoto();
						this.$refs.uToast.show({
							message: res.data.msg,
							position: 'center'
						});
						uni.navigateTo({
							url: '/projectManagementPackage/pages/RepairsWorkOrder/WorkOrderCheck'
						})
					} else {
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						})
					};
					this.loadinText = '';
					this.showLoadingHint = false;
					this.overlayShow = false
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

			// 取消
			cancel () {
				this.$refs.mychild.overwrite();
				this.backTo()
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
				this.changeIsCompletePhotoList(temporaryPhotoList)
			},

			// 清除该任务存储的照片信息
			clearStoragePhoto () {
				if (this.isCompleteRepairsWorkOrderPhotoList.length == 0) { return };
				let temporaryPhotoList = this.isCompleteRepairsWorkOrderPhotoList.filter((item) => {return item.taskId !== this.taskId});
				this.changeIsCompletePhotoList(temporaryPhotoList)
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
		.worker-show {
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
				margin-top: 20px;
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
