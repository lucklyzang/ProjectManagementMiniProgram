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
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="巡检问题上报" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<!-- 内容部分 -->
			<view class="content-top">
				<view class="content-top-other">
					<view>问题名称</view>
					<view>
						<u--input
							placeholder="请输入问题名称"
							border="none"
							v-model="issueName">
						</u--input>	
					</view>
				</view>
				<view class="content-top-other">
					<view>地点</view>
					<view>
						<u--input
							placeholder="请输入地点"
							border="none"
							v-model="pointName">
						</u--input>	
					</view>
				</view>
				<view class="content-top-other-last">
					<view>时间</view>
					<view @click="endTimePop = true">
						<u--input v-model="currentTime" border="none" placeholder="请选择时间" :readonly="true"></u--input>	
					</view>
				</view>
			</view>
			<view class="content-middle">
				<view class="issue-photo">
					<text>问题拍照</text>
					<view class="photo-list">
						<view v-for="(item,index) in issueImageList" :key="index">
							<image :src="item" @click="enlargeCompleteImgEvent(item)"></image>
							<u-icon name="close" color="#2db8f9" @click="issueDelete(index)"></u-icon>
						</view>
					</view>
					<view @click="issueClickEvent" class="icon-wrapper">
						<u-icon name="plus" color="#2db8f9" size="30"></u-icon>
					</view>
				</view>
				<view class="content-top-name">
					<view>问题描述</view>
					<view>
						<u--textarea
							v-model="issueMessage"
							rows="1"
							autosize
							border="none"
							maxlength="200"
							placeholder="请输入问题描述"
							count>
						</u--textarea>
					</view>
				</view>
			</view>
			<view class="content-bottom">
				<view class="back-home"  @click="cancel">取消</view>
				<view class="quit-account" @click="completeTask">确认上报</view>
			</view>
		</view>
		<u-popup :show="endTimePop" title="" mode="bottom">
			<u-datetime-picker
				:show="endTimePop"
				v-model="currentDateStart"
				mode="datetime"
				:minDate="minDateEnd"
				@cancel="endTimePop = false"
				@confirm="endTimePop = false"
				@change="timeChange">
			</u-datetime-picker>
		</u-popup>
		<view class="infoDialog">
			<u-modal class="infoDialog" :show="enlargeImgShow" @confirm="enlargeImgShow = false">
				<image :src="enlargeImgUrl" mode="widthFix"></image>
			</u-modal>
		</view>
	</view>
</template>

<script>
	import {
		mapGetters,
		mapMutations
	} from 'vuex'
	import moment from 'moment'
	import _ from 'lodash'
	import {
		setCache,
		removeAllLocalStorage,
		formatTime,
		deepClone,
		repeArray
	} from '@/common/js/utils'
	import {reportProblem} from '@/api/project.js'
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
				endTimePop: false,
				enlargeImgShow: false,
				currentDepartmentId: '',
				enlargeImgUrl: '',
				currentDateStart: Number(new Date()),
				minDateEnd: Number(new Date(2020, 0, 1)),
				issueName: '',
				pointName: '',
				currentTime: '',
				issueImageList: [],
				issueMessage: ''
			}
		},
		onLoad () {
			this.initDate();
			this.echoCurrentDepartmentId()
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'departmentServiceMsg',
				'isCurrentDepartmentServiceVerifySweepCode',
				'currentDepartmentServiceCheckedItemId',
				'completeDepartmentServiceCheckedItemList'
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
		methods: {
			...mapMutations([
				'changeCompleteDepartmentServiceCheckedItemList',
				'changeCurrentDepartmentServiceCheckedItemId'
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			// 回显当前检修科室名称
			echoCurrentDepartmentId () {
				if (this.isCurrentDepartmentServiceVerifySweepCode.length == 0) { return };
				let echoIndex = this.isCurrentDepartmentServiceVerifySweepCode.indexOf(this.isCurrentDepartmentServiceVerifySweepCode.filter((item) => {return item.taskId == this.taskId})[0]);
				if (echoIndex == -1) { return };
				this.currentDepartmentId = this.isCurrentDepartmentServiceVerifySweepCode[echoIndex]['number'];
			},
			
			// 放大维修后图片点击事件
			enlargeCompleteImgEvent (item) {
				this.enlargeImgShow = true;
				this.enlargeImgUrl = item
			},

			// 时间框改变事件
			timeChange (e) {
				let endTimeArr = e.value;
				let temporaryCurrentTime = moment(endTimeArr).format('YYYY-MM-DD HH:mm').split('-');
				this.currentTime = `${temporaryCurrentTime[0]}-${temporaryCurrentTime[1]}-${temporaryCurrentTime[2]}`
			},

			// 初始化时间显示框
			initDate () {
				let currentDateList = formatTime('YYYY-MM-DD HH:mm').split('-');
				this.currentTime = `${currentDateList[0]}-${currentDateList[1]}-${currentDateList[2]}`
			},

			// 拍照问题照片点击
			issueClickEvent () {
				if (this.issueImageList.length == 5) {
					this.$refs.uToast.show({
						message: "至多只能上传5张图片",
						position: 'center'
					});
					return
				};
				let that = this;
				uni.chooseImage({
					count: 5,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						uni.previewImage({
							urls: res.tempFilePaths
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
								continue
							};
							let isLt2M = res.tempFiles[imgI].size/1024/1024 <= 16;
							if (!isLt2M) {
								that.$refs.uToast.show({
									message: '上传图片大小不能超过16MB!',
									type: 'error',
									position: 'center'
								});
								continue
							};
							uni.getFileSystemManager().readFile({
								filePath: res.tempFilePaths[imgI],
								encoding: 'base64',
								success: res => {
									let base64 = 'data:image/jpeg;base64,' + res.data;
									that.issueImageList.push(base64)
								}
							})
						}
					}
				})
			},

			// 问题照片删除
			issueDelete (index) {
				this.issueImageList.splice(index,1)
			},

			// 取消
			cancel () {
				this.backTo()
			},

			// 存储完成问题上报的检查项信息
			storageCompleteCheckItemInfo () {
				let temporaryOfficeList = [];
				let temporaryDepartmentId = [];
				temporaryOfficeList = deepClone(this.completeDepartmentServiceCheckedItemList);
				if (this.completeDepartmentServiceCheckedItemList.length > 0 ) {
					let temporaryIndex = this.completeDepartmentServiceCheckedItemList.indexOf(this.completeDepartmentServiceCheckedItemList.filter((item) => {return item.taskId == this.taskId})[0]);
					if (temporaryIndex != -1) {
						temporaryDepartmentId = temporaryOfficeList[temporaryIndex]['officeList'];
						// 存储问题的解决方式
						let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
						// 删除重复的id
						temporaryDepartmentId = temporaryDepartmentId.filter((item) => {return item.id !== this.currentDepartmentServiceCheckedItemId.id});
						temporaryCheckItemInfo['checkResult'] = 2;
						this.changeCurrentDepartmentServiceCheckedItemId(temporaryCheckItemInfo);
						temporaryDepartmentId.push(this.currentDepartmentServiceCheckedItemId);
						temporaryOfficeList[temporaryIndex]['officeList'] = repeArray(temporaryDepartmentId);
						temporaryOfficeList[temporaryIndex]['depId'] = this.currentDepartmentId
					} else {
						// 存储问题的解决方式
						let temporaryCheckItemInfo = this.currentDepartmentServiceCheckedItemId;
						temporaryCheckItemInfo['checkResult'] = 2;
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
					temporaryCheckItemInfo['checkResult'] = 2;
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

			// 完成工单
			completeTask () {
				this.infoText = '上报中,请稍等···';
				this.showLoadingHint = true;
				let data = {
					taskDesc: this.issueName,    //问题描述  必填
					taskRemark: this.issueMessage,  //问题详情  非必输
					depId: this.currentDepartmentId,      //科室ID   必输
					workerId: this.workerId,   //上报人ID，及当前登录用户ID 必输
					workerName: "",  //当前登录用户名 非必输
					space: this.pointName,
					proId: this.proId,      //项目ID 必输
					images: this.issueImageList // 问题图片信息 非必输
				}
				reportProblem(data).then((res) => {
					this.showLoadingHint = false;
					this.overlayShow = false;
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
							message: '上报成功',
							type: 'success',
							position: 'center'
						});
						this.storageCompleteCheckItemInfo();
						this.backTo()
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
					});
					this.showLoadingHint = false
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
		.infoDialog {
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
			 background: #fff;
			 font-size: 14px;
			 .content-top-other {
				 height: 55px;
				 line-height: 55px;
				 box-sizing: border-box;
				 position: relative;
				 border-bottom: 4px solid #f7f7f7;
				 > view {
					 position: absolute;
					 height: 55px;
					 &:first-child {
						 left: 0;
						 width: 20%;
						 top: 0;
						 color: black;
						 padding-left: 10px;
					 };
					 &:last-child {
						 color: #2db8f9;
						 width: 80%;
						 font-weight: bold;
						 right: 0;
						 top: 0;
						 ::v-deep .u-input {
							 padding: 0;
							 height: 55px;
							 line-height: 55px;
							 box-sizing: border-box;
							 border-bottom: 4px solid #f7f7f7;
						 }
					 }
				 }
			 };
			 .content-top-other-last {
				 height: 55px;
				 line-height: 55px;
				 box-sizing: border-box;
				 position: relative;
				 border-bottom: 4px solid #f7f7f7;
				 > view {
					 position: absolute;
					 &:first-child {
						 left: 0;
						 width: 20%;
						 top: 0;
						 color: black;
						 padding-left: 10px
					 };
					 &:last-child {
						 color: #2db8f9;
						 width: 80%;
						 font-weight: bold;
						 right: 0;
						 top: 0;
						 ::v-deep .u-input {
							 padding: 0;
							 height: 55px;
							 line-height: 55px;
							 box-sizing: border-box
						 }
					 }
				 }
			 }
		 };
		 .content-middle {
			 flex: 1;
			 margin: 0 auto;
			 width: 100%;
			 overflow: auto;
			 font-size: 14px;
			 background: #f7f7f7;
			 position: relative;
			 .photo-list {
				 position: absolute;
				 left: 70px;
				 width: 250px;
				 top: 10px;
				 height: 100px;
				 overflow: auto;
				 >view {
					 width: 80px;
					 height: 80px;
					 float: left;
					 margin-right: 4px;
					 position: relative;
					 margin-bottom: 4px;
					 ::v-deep .u-icon {
						 position: absolute;
						 top: 0;
						 right:0;
						 color: #2db8f9;
						 font-size: 20px;
					 };
					 image {
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
				 margin-top: 15px;
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
				 };
				 .icon-wrapper {
					 height: 100px;
					 display: flex;
					 align-items: center;
					 justify-content: center;
					 position: absolute;
					 right: 10px;
					 top: 4px
				 }
			 };
			 .content-top-name {
				 height: auto;
				 padding: 10px;
				 box-sizing: border-box;
				 position: relative;
				 display: block;
				 background: #fff;
				 border-top: 15px solid #f7f7f7;
				 > view {
					 width: 100%;
					 &:first-child {
						 height: 26px;
						 line-height: 26px;
						 color: black;
					 };
					 &:last-child {
						 margin-top: 2px;
						 color: black;
						 ::v-deep .u-textarea {
							 padding: 10px 4px;
							 border: 1px solid #e3e3e3
						 }
					 }
				 }
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
				 outline: 1px solid #2db8f9
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
