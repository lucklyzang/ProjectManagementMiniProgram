<template>
	<!--pickerHospital 子组件-->
		<view class="date-background" v-if="value">
			<view class='date-gray-background' @click="hiddeDatePicker"></view>
			<view class='date-container'>
				<view class="transparent">
					<view ref="chooseBox" class="title-box" v-if="buttonLocation == 'bottom'">
					  {{ title }}
					  <u-icon name="close" size="25" @click="close"></u-icon>
					</view>
					<view class="button-box-top" v-if="buttonLocation == 'top'">
						<text class="cancel-text" @click="cancel">取消</text>
						<text class="title-text"> {{ title }}</text>
						<text class="sure-text" @click="confirm">确定</text>
					</view>
					<view class="search-box" v-if="isShowSearch" ref="searchBox">
						<u-search
							v-if="isShowSearch" 
							style="width: 70%;" 
							placeholder="请输入关键词进行搜索" 
							@clear="clearSearch" 
							@change='searchChange'
							:show-action='false' 
							v-model="searchValue" 
							shape="round" 
							clearabled
						>
							<template #action>
								<view @click="onSearch">搜索</view>
							</template>
						</u-search>
					</view>
					<picker-view v-if="list.length > 0" :immediate-change='true' :value="setValues"
						@change="bindChange" mask-style="height:100rpx;" indicator-style="height: 34px;">
						<picker-view-column>
							<view v-for="(item,index) in list" :key="item.id" :class="{ 'selectStyle': form.id == item.id }" class="u-column-item">{{item.text}}
							</view>
						</picker-view-column>
					</picker-view>
					<view class="button-box" v-if="list.length > 0 && buttonLocation == 'bottom'">
						<text @click="reset" v-if="isShowReset">重置</text>
						<text @click="cancel" v-if="!isShowReset">取消</text>
						<text @click="confirm">确认</text>
					</view>
					<u-empty text="暂无数据" v-if="list.length == 0" />
				</view>
			</view>
		</view>
</template>
 
<script>
	export default {
		options: {
			styleIsolation: 'shared'
		},
		props: {
			// 顶部标题
			title: {
			  type: String,
			  default: '请选择'
			},
			// 当前选中的数据 格式[{value: '',text:''}]
			currentSelectData: {
			  type: Array,
			  default: []
			},
			// 按钮位置
			buttonLocation: {
				type: String,
				default: 'bottom'
			},
			// 是否显示搜索框
			isShowSearch: {
			  type: Boolean,
			  default: false
			},
			
			// 是否显示重置按钮
			isShowReset: {
			  type: Boolean,
			  default: false
			},
			// 滚动展示的数据 格式[{id: '',text:'',value:''}]
			columns: {
				type: Array,
				default: []
			},
			pickerValues: { //picker默认展示的值
				type: Array,
				default () {
					return [0]
				}
			},
			value:{
				type:Boolean,
				default:false
			}
		},
		data() {
			return {
				searchValue: '', // 搜索值
				setValues: [0], // picker 选中的项
				form: { //要传过去的值
					id: '',
					text: ''
				},
				list: this.columns,
			}
		},
		watch: {
			columns: {
				handler(newValue, oldValue) {
					this.list = newValue
				},
				deep: true,
				immediate: true,
			},
			value(newValue, oldValue) {
				this.init()
			},
			pickerValues: {
				handler(newValue, oldValue) {
					this.setValues = newValue;
					this.list.forEach((item, index) => {
						if (this.setValues == index) {
							this.form.id = item.id;
							this.form.text = item.text;
							this.form.value = item.value;
						}
					})
				},
				deep: true,
				immediate: true,
			}
		},
		methods: {
			init() {
				this.$nextTick(() => {//组件渲染完成后在更新数据
					this.setValues = this.pickerValues
				})
			},
			bindChange(e) {
				let value = e.detail.value.toString();
				this.list.forEach((item, index) => {
					if (value == index) {
						this.form.id = item.id;
						this.form.text = item.text;
						this.form.value = item.value;
					}
				})
			},
			hiddeDatePicker() {
				this.$emit('input',false)
			},
			// 确认事件
			confirm(e) {
				if (this.form.id == '' && this.list.length > 0) {
					this.form = {
						id: this.list[0].id,
						text: this.list[0].text,
						value: this.list[0].value
					};
				};
				this.hiddeDatePicker();
				this.$emit('sure', this.form.text,this.form.value,this.form.id);
			},
			// 搜索查询
			async searchChange(e) {
				// 调模糊查询然后 把返回的结果传给this.list数组
				let findList = this.columns.filter(item => item.text.includes(e));
				this.list = findList;
				if (e == '') {
					this.list = this.columns
				};
				this.reset()
			},
			
			reset() { //重置
				this.form = {
					id: '',
					text: '',
					value: ''
				}
			},
			
			// 关闭事件
			close () {
			  this.$emit('close',this.form.text);
			  this.hiddeDatePicker()
			},
			
			// 取消事件
			cancel () {
				this.$emit('cancel',this.form.text);
				this.hiddeDatePicker()
			},
			
			clearSearch() { //清空搜索内容
				this.searchValue = '';
				this.list = this.columns
			}
		},
	}
</script>
 
<style lang="scss" scoped>
	.date-background {
		background-color: rgba(0,0,0,.7);
		max-height: 100vh;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 1000;
		display: flex;
	}
	.date-gray-background {
		position: absolute;
		width: 100%;
		top: 0rpx;
		background: rgba(0, 0, 0, .5);
		height: calc(100% - 500rpx);
	}
 
	.date-container {
		position: absolute;
		border-top-left-radius: 20px;
		border-top-right-radius: 20px;
		padding:  0px 0px 20px 0px;
		box-sizing: border-box;
		width: 100%;
		height: 50%;
		background: #fff;
		bottom: 0;
		z-index: 1000;
		.transparent {
			height: 100%;
			position: relative;
			display: flex;
			flex-direction: column;
			::v-deep .u-empty {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%)
			};
			.title-box {
				display: flex;
				justify-content: space-around;
				font-size: 18px;
				line-height: 40px;
				color: #101010;
				height: 40px;
				position: relative;
				::v-deep .u-icon {
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					right: 0
				}
			};
			.button-box-top {
				height: 44px;
				background: #F7F7F9;
				fonr-size: 16px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 0 10px;
				box-sizing: border-box;
				.cancel-text {
					color: #8F8F91;
				};
				.title-text {
					color: #101010;
				};
				.sure-text {
					color: #3370FF;
				}
			};
			.search-box {
				margin: 10px 0;
				::v-deep .u-search  {
					.u-search__content  {
							border-radius: 20px
					};
					.u-search__action {
						color: #3B9DF9;
						font-size: 14px
					}
				}
			};
			/deep/ picker-view {
				width: 100%; 
				flex: 1;
				text-align:center;
				background:white;
				overflow: scroll;
			};
			.button-box {
				height: 60px;
				display: flex;
				width: 100%;
				margin: 0 auto;
				align-items: center;
				justify-content: center;
				>text {
					width: 40%;
					display: inline-block;
					height: 45px;
					font-size: 18px;
					line-height: 45px;
					background: #fff;
					text-align: center;
					border-radius: 30px;
					justify-content: space-between;
					&:nth-child(1) {
						color: #1864FF;
						box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
					};
					&:nth-child(2) {
						color: #1864FF;
						box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
						margin-left: 40px;
					};
					&:last-child {
						color: #fff;
						background: linear-gradient(to right, #6cd2f8, #2390fe);
						box-shadow: 0px 2px 6px 0 rgba(36, 149, 213, 1);
					}
				}
			}
		}
	}
 
	.u-column-item {		
		color: #ACADAF;
		font-size: 20px;
		line-height: 34px;
		text-align: center;
		background-color: #fff;
	}
	
	.selectStyle {
		color: #101010 !important;
		font-size: 22px !important;
		background: #fff !important;
		
	}
</style>