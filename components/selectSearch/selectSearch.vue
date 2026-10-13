<template>
	<view class="vue-dropdown">
		<view class="cur-name" @click="curNameClickEvent">
			<text :class="{'textStyle': current.indexOf('请选择') != -1}">{{current}}</text>
			<u-icon :name="isShow ? 'arrow-down' : 'arrow-up'" size="16"></u-icon>
		</view>
		<view class="dropdown-mask" v-if="isShow" @click="closeDropdown"></view>
		<view class="list-and-search" :class="isShow ? 'on' : ''" :style="dropdownStyle">
			<view class="search-module clearfix" v-if="isNeedSearch">
				<u--input
					:placeholder="placeholder"
					prefixIcon="search"
					@input="search"
					:value="searchValue"
				></u--input>
			</view>
			
			<view class="list-module">
				<view 
					v-for="(item, index) in datalist" 
					@click="clickItem(item, index)" 
					:key="index"
					:class="{
						'liStyle': !multiple ? (item.value == currentFullValue['value']) && currentFullValue['value'] != null : item['selected'],
						'liSelectItemStyle': item.text.indexOf('请选择') != -1
					}"
				>
					<text class="list-item-text">{{ item.text }}</text>
					<text v-if="item.text.indexOf('请选择') == -1 && isShowTaskCompleteMessage">(</text>
					<text v-if="item.text.indexOf('请选择') == -1 && isShowTaskCompleteMessage">{{ `${item.ongoing}` }}</text>
					<text v-if="item.text.indexOf('请选择') == -1 && isShowTaskCompleteMessage">{{ `/ ${item.complete} /` }}</text>
					<text v-if="item.text.indexOf('请选择') == -1 && isShowTaskCompleteMessage">{{ `${item.complete + item.ongoing}` }}</text>
					<text v-if="item.text.indexOf('请选择') == -1 && isShowTaskCompleteMessage">)</text>
				</view>
			</view>
			
			<view class="tip-nodata" v-if="searchValue.length && !datalist.length">暂无数据!</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'SelectSearch',
	data() {
		return {
			searchValue: '',
			current: '',
			currentFullValue: null,
			datalist: [],
			selectedItem: [],
			isShow: false,
			dropdownStyle: {}
		}
	},
	props: {
		multiple: {
			type: Boolean,
			default: false
		},
		curData: { type: [String, Number, Array, Object], default: null },
		itemData: { type: Array, default: () => [] },
		isNeedSearch: {
			type: Boolean,
			default: true
		},
		isShowTaskCompleteMessage: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: '搜索'
		}
	},

	watch: {
		curData: {
			handler: function(newVal, oldVal) {
				if (!this.multiple) {
					if (newVal == null || !isNaN(newVal)) {
						this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal })[0]['text'] : '';
						this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal })[0] : null;
					} else {
						this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal['value'] })[0]['text'] : '';
						this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal['value'] })[0] : null;
					}
				} else {
					this.datalist = this.itemData;
					if (newVal == null) {
						this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == newVal })[0]['text'] : '';
					} else {
						let temporarySelectArr = [];
						if (newVal.length > 0) {
							for (let item of newVal) {
								temporarySelectArr.push(item['value']);
							}
							for (let itemTwo of this.datalist) {
								if (temporarySelectArr.indexOf(itemTwo.value) != -1) {
									itemTwo['selected'] = true;
								} else {
									itemTwo['selected'] = false;
								}
							}
						} else {
							this.datalist.forEach((item) => { item['selected'] = false; });
						}
						let temporaryArray = [];
						this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true; });
						for (let it of this.datalist) {
							if (it['selected']) {
								temporaryArray.push(it['text']);
							}
						}
						this.current = newVal.length > 0 ? temporaryArray.join(',') : this.itemData[0]['text'];
					}
				}
			},
			deep: true,
			immediate: true
		},
		itemData: {
			handler: function(newVal, oldVal) {
				this.datalist = newVal;
			},
			deep: true,
			immediate: true
		},
		selectedItem: {
			handler: function(newVal, oldVal) {
				if (this.multiple) {
					if (this.selectedItem.length == 0) {
						this.current = this.itemData[0]['text'];
					}
				}
			},
			deep: true,
			immediate: true
		}
	},

	created() {
		this.datalist = this.itemData;
		if (!this.multiple) {
			if (this.curData == null || !isNaN(this.curData)) {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData })[0]['text'] : '';
				this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData })[0] : null;
			} else {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData['value'] })[0]['text'] : '';
				this.currentFullValue = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData['value'] })[0] : null;
			}
		} else {
			if (this.curData == null) {
				this.current = this.datalist.length > 0 ? this.datalist.filter((item) => { return item.value == this.curData })[0]['text'] : '';
			} else {
				let temporaryArray = [];
				this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true; });
				for (let it of this.itemData) {
					if (it['selected']) {
						temporaryArray.push(it['text']);
					}
				}
				this.current = this.curData.length > 0 ? temporaryArray.join(',') : this.itemData[0]['text'];
			}
		}
	},

	methods: {
		calculatePosition() {
			const query = uni.createSelectorQuery().in(this);
			query.select('.cur-name').boundingClientRect(data => {
				if (data) {
					this.dropdownStyle = {
						top: `${data.top + data.height}px`,
						left: `${data.left}px`,
						width: `${data.width}px`
					};
				}
			}).exec();
		},

		curNameClickEvent() {
			this.isShow = !this.isShow;
			if (this.isShow) {
				this.searchValue = '';
				this.datalist = this.itemData;
				if (this.multiple) {
					if (this.current != null && this.current != this.itemData[0]['text']) {
						let temporaryArray = [];
						if (this.selectedItem.length > 0) {
							for (let item of this.selectedItem) {
								temporaryArray.push(item.value);
							}
							this.datalist.forEach((item) => {
								if (temporaryArray.indexOf(item.value) != -1 && item.text != this.itemData[0]['text']) {
									item.selected = true;
								} else {
									item.selected = false;
								}
							});
						}
					} else {
						this.datalist.forEach(element => {
							if (element['value']) {
								element['selected'] = false;
							}
						});
					}
				}
				this.$nextTick(() => {
					this.calculatePosition();
				});
			} else {
				this.closeDropdown();
			}
		},

		closeDropdown() {
			this.isShow = false;
			if (this.multiple) {
				this.$emit('change', this.selectedItem);
			}
		},

		search(e) {
			this.searchValue = e;
			this.datalist = this.itemData.filter((item) => {
				return item.text.indexOf(this.searchValue) != -1;
			});
		},

		clickItem(item, index) {
			if (!this.multiple) {
				this.current = this.datalist.filter((innerItem) => { return innerItem.value == item.value })[0]['text'];
				this.currentFullValue = this.datalist.filter((innerItem) => { return innerItem.value == item.value })[0];
				this.isShow = false;
				this.$emit('change', item);
			} else {
				if (item['value'] == null) { return; }
				this.datalist[index]['selected'] = !this.datalist[index]['selected'];
				this.selectedItem = this.itemData.filter((innerItem) => { return innerItem['selected'] == true; });
				this.$emit('change', this.selectedItem);
				let temporaryArray = [];
				for (let it of this.selectedItem) {
					temporaryArray.push(it['text']);
				}
				this.current = temporaryArray.join(',');
			}
		},

		sureEvent() {
			this.$emit('change', this.selectedItem);
			this.isShow = false;
		},

		clearSelectValue() {
			if (!this.multiple) {
				this.current = this.itemData[0]['text'];
				this.currentFullValue = this.datalist[0];
				this.$emit('change', { text: this.itemData[0]['text'], value: null });
			} else {
				this.datalist.forEach((element) => {
					if (element['value']) {
						element['selected'] = false;
					}
				});
				this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true; });
				this.$emit('change', this.selectedItem);
				let temporaryArray = [];
				for (let it of this.selectedItem) {
					temporaryArray.push(it['text']);
				}
				this.current = temporaryArray.join(',');
			}
			this.datalist = this.itemData;
		},

		selectAllValue() {
			if (this.multiple) {
				this.datalist.forEach(element => {
					if (element['value']) {
						element['selected'] = true;
					}
				});
				this.selectedItem = this.datalist.filter((innerItem) => { return innerItem['selected'] == true; });
				this.$emit('change', this.selectedItem);
				let temporaryArray = [];
				for (let it of this.selectedItem) {
					temporaryArray.push(it['text']);
				}
				this.current = temporaryArray.join(',');
			}
		}
	}
}
</script>

<style scoped lang="scss">
@import "~@/common/stylus/variable.scss";
.dropdown-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: transparent;
	z-index: 10098;
}

.vue-dropdown {
	position: relative;
	width: 100%;
	border-radius: 3px;
	border: 1px solid #ccc;
	background: #fff;
	cursor: pointer;
	box-sizing: border-box;
	user-select: none;
	-webkit-user-select: none;

	&._self-show {
		display: block !important;
	}

	.search-module {
		position: relative;
		border-bottom: 1px solid #ccc;
		box-sizing: border-box;
		.search-text {
			width: 100%;
			height: 30px;
			padding: 0 10px 0 30px;
			box-shadow: none;
			outline: none;
			box-sizing: border-box;
			border: none;
		}
		::-webkit-input-placeholder { color: #dadada; }
		:-moz-placeholder { color: #dadada; }
		::-moz-placeholder { color: #dadada; }
		:-ms-input-placeholder { color: #dadada; }
	}

	input::-webkit-input-placeholder {
		font-size: 14px;
	}

	.list-module {
		max-height: 150px;
		overflow-y: auto;
		> view {
			word-break: break-all;
			line-height: 20px;
			> text {
				&:nth-child(1) { margin-right: 10px; }
				&:nth-child(2) { color: #101010 !important; }
				&:nth-child(3) { color: #E86F50 !important; }
				&:nth-child(4) { color: #289E8E !important; }
				&:nth-child(5) { color: #174E97 !important; }
				&:nth-child(6) { color: #101010 !important; }
			}
		}
		.liStyle {
			color: #3B9DF9;
		}
		.liSelectItemStyle {
			color: #dadada !important;
		}
	}
}

.list-and-search {
	display: none;
	background: #fff;
	border: 1px solid #ccc;
	box-sizing: border-box;
	
	position: fixed !important;
	z-index: 10099 !important;
	
	&.on {
		display: block;
	}

	.operation-btn {
		height: 60px;
		display: flex;
		width: 90%;
		margin: 0 auto;
		align-items: center;
		justify-content: center;
		> text {
			width: 40%;
			display: inline-block;
			height: 35px;
			font-size: 14px;
			line-height: 35px;
			background: #fff;
			text-align: center;
			border-radius: 6px;
			&:nth-child(1) {
				color: #ccc;
				margin-right: 40px;
				box-sizing: border-box;
				border: 1px solid #ccc;
			}
			&:last-child {
				color: #fff;
				background: #2390fe;
			}
		}
	}
}

.cur-name {
	height: 32px;
	line-height: 32px;
	padding: 0 10px;
	position: relative;
	color: #777;
	display: flex;
	> text {
		flex: 1;
		padding-right: 8px;
		box-sizing: border-box;
		@include no-wrap;
	}
	.textStyle {
		color: #dadada !important;
	}
	::v-deep .u-icon {
		position: relative;
	}
	::v-deep .u-icon::before {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
}

.tip-nodata {
	font-size: 14px;
	padding: 10px;
}
</style>
