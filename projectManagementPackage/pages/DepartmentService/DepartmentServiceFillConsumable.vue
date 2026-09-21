<template>
	<view class="content-box">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<view class="top-background-area" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }"></view>
		<u-toast ref="uToast" />
		<view class="nav" :style="{ 'height': statusBarHeight + navigationBarHeight + 5 + 'px' }">
			<nav-bar :home="false" :isShowBackText="true" backState='3000' fontColor="#FFF" bgColor="none" title="填写耗材" @backClick="backTo">
			</nav-bar> 
		</view>
		<view class="content">
			<view class="content-top">
				<u-empty text="物料为空" mode="list" v-if="materialShow"></u-empty>
				<view class="circulation-area-title">
					<view></view>
					<view>耗材名称</view>
					<view>单位</view>
					<view>数量</view>
				</view>
				<view class="circulation-area">
					<view v-for="(item,index) in consumableMsgList" :key="index">
						<view>{{index + 1}}</view>
						<view>
							{{item.mateName}}-{{item.model}}
						</view>
						<view>
							{{item.unit}}
						</view>
						<view>
							<!-- <view>
								<van-icon name="delete" @click="deleteEvent(item,index)" />
							</view> -->
							<u-number-box v-model="item.number"
								button-size="36"
								color="#ffffff"
								bgColor="#2db8f9"
								iconStyle="color: #fff"
								@change="function(val){stepValueChange(item,index,val)}"
								theme="round" integer @focus="function(val){stepValueFocus(item,index,val)}"
								min="0">
							</u-number-box>
						</view>
					</view>
				</view>
			</view>
			<view class="content-bottom">
				<view class="back-home"  @click="addConsumable">添加物资</view>
				<view class="quit-account" @click="$noMultipleClicks(sure)">确认</view>
			</view>
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
								<u-input
									v-model="searchValue"
									border="none"
								>
									<template slot="suffix">
										<u-icon name="search" size="28" @click="searchEvent"></u-icon>
									</template>
								</u-input>
							</view>
							<view class="tool-name-list-content">
								<view class="circulation-area-title">
									<view>物料名称</view>
									<view>单位</view>
									<view>操作</view>
								</view>
								<u-checkbox-group v-model="selectedMaterialIds" placement="column"  @change="handleMaterialListChange">
									<u-empty text="暂无数据" mode="list" v-if="inventoryMsgList.length == 0"></u-empty>
									<view v-for="(item,index) in inventoryMsgList" @click="mateNameEvent(item,index)" :key="index" class="circulation-area-content">
										<view>
											{{item.mateName}}-{{item.model}}
										</view>
										<view>
											{{item.unit ? item.unit : '无'}}
										</view>
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
												@change="onCheckboxChange"
												:disabled="item.disabled"
											>
											</u-checkbox>
										</view>
									</view>
								</u-checkbox-group>
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
		setCache,
		removeAllLocalStorage,
	} from '@/common/js/utils'
	import store from '@/store'
	 import {queryDepartmentMaterial,queryAllMaterial,saveDepartmentMate} from '@/api/project.js'
	import navBar from "@/components/zhouWei-navBar"
	export default {
		components: {
			navBar
		},
		data() {
			return {
				infoText: '加载中···',
				showLoadingHint: false,
				isFirstShow: true,
				noClick: true,
				toolShow: false,
				materialShow: false,
				isDeleteShow: false,
				consumableIndex: null,
				lastConsumableNumber: null,
				isFinishShow: false,
				materialContentShow: false,
				searchValue: '',
				consumableMsgList: [],
				inventoryMsgList: [],
				temporaryInventoryMsgList: [],
				storeId: '',
				systemId: '',
				selectedMaterialIds: []
			}
		},
		onLoad () {
			this.queryStoreId({proId: this.proId,state: 0});
			this.getMaterialById(this.taskId)
		},
		watch: {
			searchValue:{
				handler(newVal, oldVal){
					this.$nextTick(() => {
						// 如果新值包含空格，则重新赋值为去除空格后的字符串
						if (/\s/g.test(newVal)) {
							this.searchValue = newVal.replace(/\s/g, '')
						};
						if (this.searchValue == '') {
							this.inventoryMsgList = this.temporaryInventoryMsgList;
							return
						};
						this.inventoryMsgList = this.temporaryInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1})
					})
				},
				deep: true
			}
		},
		computed: {
			...mapGetters([
				'userInfo',
				'statusBarHeight',
				'navigationBarHeight',
				'departmentServiceMsg',
				'completeRoomList'
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
			]),
			
			// 顶部导航返回事件
			backTo () {
				uni.navigateBack()
			},
			
			//查询任务关联的物料信息
			getMaterialById (taskId) {
				queryDepartmentMaterial(taskId)
				.then((res) => {
					if(res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							this.materialShow = false;
							this.materialContentShow = true;
							this.consumableMsgList = [];
							this.consumableMsgList = res.data.data
						} else {
							this.materialShow = true;
							this.materialContentShow = false
						}
					} else {
						this.materialContentShow = false;
						this.$refs.uToast.show({
							message: res.data.msg,
							type: 'error',
							position: 'center'
						})
					}
				})
				.catch((err) => {
					this.materialContentShow = false;
					this.$refs.uToast.show({
						message: err,
						type: 'error',
						position: 'center'
					})
				})
			},

			//查询storeId与systemId
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
			
			// 物料选择列表复选框变化事件
			handleMaterialListChange(value) {
				
			},

			//查询所有物料信息
			 getAllMaterial (data) {
				this.infoText ='加载中···';
				this.showLoadingHint = true;
				queryAllMaterial(data)
				.then((res) => {
					this.showLoadingHint = false;
					if(res && res.data.code == 200) {
						if (res.data.data.length > 0) {
							this.inventoryMsgList = [];
							this.temporaryInventoryMsgList = [];
							for (let item of res.data.data) {
								// 添加过的物料不允许再次添加,数量为0不容许选择操作
								let isExist = this.consumableMsgList.filter((innerItem) => { return innerItem.mateId == item.id});
								if (isExist.length > 0) {
									item['disabled'] = true;
									if (this.isFirstShow) {
										this.selectedMaterialIds.push(item.id);
									}
								} else {
									if (item.quantity > 0) {
										item['disabled'] = false;
									} else {
										item['disabled'] = true
									}
								}
							};
							this.isFirstShow = false;
							this.inventoryMsgList = res.data.data;
							this.temporaryInventoryMsgList = res.data.data;
							this.storeId = this.inventoryMsgList[0]['storeId'];
							this.systemId = this.inventoryMsgList[0]['systemId']
						} else {
							this.$refs.uToast.show({
								message: '没有查询到对应的物料信息',
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
			
			// 添加取消
			toolCancel () {
				this.toolShow = false;
			},
			
			// checkbox 自身点击（阻止冒泡后单独处理）
			onCheckboxChange(val) {
				const index = this.selectedMaterialIds.indexOf(val.name);
				if (val.checked && index === -1) {
					this.selectedMaterialIds.push(val.name)
				} else if (!val.checked && index > -1) {
					this.selectedMaterialIds.splice(index, 1)
				}
			},
			
			// 耗材名称点击事件
			mateNameEvent (name) {
				const index = this.selectedMaterialIds.indexOf(name.id)
				if (index > -1) {
					this.selectedMaterialIds.splice(index, 1)
				} else {
					this.selectedMaterialIds.push(name.id)
				}
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

			// 添加确认
			toolSure () {
				const checkConsumableList = this.inventoryMsgList.filter(order => this.selectedMaterialIds.includes(order.id) && !order.disabled);
				if (checkConsumableList.length == 0) {
					this.$refs.uToast.show({
						message: '至少要选择一种耗材',
						type: 'error',
						position: 'center'
					})
				} else {
					this.toolShow = false;
					this.materialShow = false;
					this.materialContentShow = true;
					for (let item of checkConsumableList) {
						 this.consumableMsgList.push({
								number: 0,
								mateName: item.mateName,
								mateNumber: item.mateNumber,
								quantity: item.quantity,
								unit: item.unit,
								mateId: item.id,
								model: item.model,
								storeId: this.storeId,
								systemId: this.systemId
						 })

					}
				}
			},

			// 删除事件
			deleteEvent(item,index) {
				this.consumableMsgList.splice(index,1)
			},

			// 搜索事件
			searchEvent () {
				this.$nextTick(() => {
					// 如果新值包含空格，则重新赋值为去除空格后的字符串
					if (/\s/g.test(this.searchValue)) {
						this.searchValue = newVal.replace(/\s/g, '')
					};
					if (this.searchValue == '') {
						this.inventoryMsgList = this.temporaryInventoryMsgList;
						return
					};
					this.inventoryMsgList = this.temporaryInventoryMsgList.filter((item) => {return item.mateName.indexOf(this.searchValue) != -1})
				})
			},

			

			// 步进器值变化事件
			stepValueChange (item,index,val) {
				if (val['value'] === "") {return};
				this.consumableIndex = index;
				if (val['value'] == 0) {
					if (!this.isDeleteShow) {
						this.isDeleteShow = true;
						return
					}
				};
				if (val > item.quantity) {
					this.$refs.uToast.show({
						message: "数量已经超过耗材库存数量",
						type: 'error',
						position: 'center'
					});
					this.consumableMsgList[index]['number'] = 1;
					return
				};
				this.lastConsumableNumber = val
			},

			// 步进器聚焦事件
			stepValueFocus (item,index,val) {
				if (val != 0) {
					this.lastConsumableNumber = item.number
				}
			},

			 // 是否删除耗材确定事件
			isDeleteSure () {
				this.isDeleteShow = false;
				this.selectedMaterialIds = this.selectedMaterialIds.filter((item) => {
					return item != this.consumableMsgList[this.consumableIndex]['mateId']
				});
				this.consumableMsgList.splice(this.consumableIndex,1)
			},

			// 是否删除耗材取消事件
			isDeleteCancel () {
				// 耗材数量恢复为0之前的值
				this.isDeleteShow = false;
				this.consumableMsgList[this.consumableIndex]['number'] = this.lastConsumableNumber
			},

			// 确认
			sure () {
				this.infoText ='提交中···';
				this.showLoadingHint = true;
				let mateMsg = {
					proId: this.proId,
					taskId: this.taskId,
					materials: []
				};
				// let temporaryConsumableMsgList = this.consumableMsgList.filter((item) => {return item.number > 0});
				// if (temporaryConsumableMsgList.length == 0) {
				//   this.$toast('添加的耗材数量不能为0');
				//   return
				// };
				for (let item of this.consumableMsgList) {
					mateMsg.materials.push(
						{
							proId: this.proId,
							proName: this.proName,
							mateId: item.mateId,
							number: item.number,
							mateName: item.mateName,
							mateNumber: item.mateNumber,
							model: item.model,
							unit: item.unit,
							storeId: this.storeId,
							systemId: this.systemId
						}
					)
				};
				saveDepartmentMate(mateMsg).then((res) => {
					this.showLoadingHint = false;
					if (res && res.data.code == 200) {
						this.$refs.uToast.show({
							message: `${res.data.msg}`,
							type: 'success',
							position: 'center'
						});
						uni.navigateBack({
							delta: 1
						})
					} else {
						this.$refs.uToast.show({
							message: `${res.data.msg}`,
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
		.contentDialog {
			::v-deep .u-modal {
				top: 50%;
				.u-modal__content {
					margin-bottom: 6px;
					padding: 10px !important;
					height: 70vh;
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
							box-sizing: border-box;
							.u-input {
								border: 1px solid #dfdcdc;
								height: 30px;
								padding: 0 6px !important;
								box-sizing: border-box;
							}
						};
						.u-checkbox-group--column {
							flex: 1;
							height: 0;
							overflow: auto;
							position: relative;
							.u-empty {
								position: absolute;
								top: 50%;
								left: 50%;
								transform: translate(-50%,-50%)
							}
						};
						.tool-name-list-content {
							flex: 1;
							padding: 6px;
							box-sizing: border-box;
							border-top: 1px solid #b2b2b2;
							display: flex;
							flex-direction: column;
							height: 0;
							.circulation-area-content {
								height: 40px;
								background: #fff;
								display: flex;
								align-items: center;
								> view {
									height: 40px;
									line-height: 40px;
									font-size: 16px;
									&:first-child {
										width: 58%;
										overflow-x: auto;
										white-space: nowrap;
										margin-right: 2%;
									};
									&:nth-child(2) {
										width: 20%;
										text-align: center;
									}
									&:last-child {
										width: 20%;
										display: flex;
										align-items: center;
										justify-content: center;
										.u-checkbox {
											.u-checkbox__icon-wrap {
												margin-right: 0 !important;
											}
										}
									}
								}
							}
							.circulation-area-title {
								display: flex;
								align-items: center;
								>view {
									height: 40px;
									line-height: 40px;
									font-size: 17px;
									font-weight: bold;
									&:first-child {
										width: 58%;
										margin-right: 2%;
									};
									&:nth-child(2) {
										width: 20%;
										text-align: center;
									}
									&:last-child {
										width: 20%;
										text-align: center;
									}
								}
							}
						}
					}
				}
			}
		};
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
				 position: relative;
				 ::v-deep .u-empty {
				 	position: absolute;
				 	top: 50%;
				 	left: 50%;
				 	transform: translate(-50%,-50%);
				};
			 .circulation-area {
				 max-height: 90%;
				 margin: 0 auto;
				 overflow: auto;
			 > view {
				 height: 50px;
				 background: #fff;
				 margin-bottom: 6px;
				 display: flex;
				 align-items: center;
				 &:last-child {
					 margin-bottom:0
				 };
				 > view {
					 height: 50px;
					 line-height: 50px;
					 font-size: 16px;
					 text-align:center;
					 &:first-child {
						 width: 10%;
					 };
					 &:nth-child(2) {
						width: 45%;
						white-space: nowrap;
						overflow-x: auto;
						margin-right: 5%;
					 };
					 &:nth-child(3) {
						 width: 15%;
					 };
					 &:last-child {
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
					 }
				 }
			 }
		 };
		 .circulation-area-title {
			 height: 10%;
			 position: relative;
			 display: flex;
			 align-items: center;
				>view {
					 text-align: center;
					 font-size: 16px;
					 line-height: 56px;
					 &:first-child {
						 width: 10%;
					 };
					 &:nth-child(2) {
						 width: 45%;
						 margin-right: 5%;
					 };
					 &:nth-child(3) {
						 width: 15%
					 };
					 &:last-child {
						 width: 30%;
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
