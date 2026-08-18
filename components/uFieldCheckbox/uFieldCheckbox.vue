<template>
  <view class="dh-field ">
    <view class="van-hairline--bottom">
		<view class="input-class" @click="showPopu">
			<u-input
				v-model="resultLabel"
				readonly
				inputAlign="right"
				border="none"
				suffixIcon="arrow-right"
				suffixIconStyle="color:#174E97"
				:placeholder="placeholder"
				placeholderStyle="color:#174E97"
				class="dh-cell"
			/>
		</view>	
    <u-popup :show="show" mode="bottom" round="10" :closeOnClickOverlay="true">
      <view class="van-picker__toolbar">
        <u-button type="button" class="van-picker__cancel" @click="cancel">取消</u-button>
        <view class="van-ellipsis van-picker__title">
					<text v-if="max">(最多选{{max}}个)</text>
				</view>
        <u-button type="button" class="van-picker__confirm" @click="onConfirm">确定</u-button>
      </view>
      <view class="checkbox-con"  style="max-height:264px;overflow-y:auto;position:relative">
          <u-empty description="暂无数据" v-if="columnsData.length == 0" />
          <u-input v-model="searchVal"  placeholder="搜索" @input="search" v-if="isSearch" input-align="left"/>
					<view class="all-check-area" v-if="columnsData.length > 0">
						<u-checkbox-group
							iconPlacement="right" 
							placement="column"
							v-model="allCheckboxValue"
							@change="allCheckboxChange"
							:borderBottom="true"
						>
							<u-checkbox :label="allCheckboxList[0]['name']" :checked="allCheckboxChecked" 
								:name="allCheckboxList[0]['name']"
								 size="22"
								 labelSize="18"
								 shape="circle">
								</u-checkbox>
						</u-checkbox-group>
					</view>
					<view class="check-area">
						<u-checkbox-group v-model="checkboxValue" :borderBottom="true" @change="change" iconPlacement="right" placement="column">
							<u-checkbox   
								v-for="(item, index) in columnsData"
								:key="item[option.value]"
								:label="item[option.label]"
								:name="item[option.value]" :checked="item.checked" shape="circle">
							</u-checkbox>
						</u-checkbox-group>
					</view>
      </view>
    </u-popup>
    </view>
  </view>
</template>

<script>
export default {
options: {
	styleIsolation: 'shared'
},
  name: 'UFieldCheckbox',
  model: {
    prop: 'selectValue',
		event: ''
  },
	
	data () {
	  return {
	    show: false,
	    searchVal: '',
		allCheckboxValue: [],
		allCheckboxChecked: false,
		allCheckboxList: [{name: '全选',value:1}],
	    columnsData: JSON.parse(JSON.stringify(this.columns)),
	    checkboxValue: JSON.parse(JSON.stringify(this.selectValue)),
	    resultValue: JSON.parse(JSON.stringify(this.selectValue))
	  }
	},
	
  props: {
    columns: {
      type: Array,
      default: function () {
        return []
      }
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    selectValue: {
      type: Array,
      default: function () {
        return []
      }
    },
    option: {
      type: Object,
      default: function () {
        return { label: 'name', value: 'code' }
      }
    },
    isSearch: {
      type: Boolean,
      default: false
    },
    max: { // 最大可选
      type: [Number, String],
      default: 0
    }
  },
	
	watch: {
	  selectValue: {
			handler (newVal) {
				this.resultValue = newVal;
				if (this.resultValue.length == 0) {
					
				}
			},
			immediate: true
		},
		
	  resultValue (val) {
	    this.searchVal = ''
	    this.columnsData = JSON.parse(JSON.stringify(this.columns));
		if (this.columnsData.length > 0) {
			this.change(val);
		};
	    this.$emit('input', val)
	  },
		
	  columns: {
	    handler (val) {
	      this.columnsData = JSON.parse(JSON.stringify(val))
	    },
	    immediate: true
	  }
	},
	
  computed: {
    resultLabel: {
      get () {
        let columns = JSON.parse(JSON.stringify(this.columns));
        const res = columns.filter(item => {
          return this.resultValue.indexOf(item[this.option.value]) > -1
        });
        const resLabel = res.map(item => {
          return item[this.option.label]
        });
        return resLabel.join(',');
      },
      set () {
      }
    }
  },
	
  methods: {
    search (val) {
      if (val) {
        this.columnsData = this.columnsData.filter(item => {
          return item[this.option.label].indexOf(val) > -1
        })
      } else {
        this.columnsData = JSON.parse(JSON.stringify(this.columns))
      }
    },
    getData (val) {
      const res = this.columnsData.filter(item => {
        return val.indexOf(item[this.option.value]) > -1
      });
      return res
    },
    onConfirm () {
      this.resultValue = this.checkboxValue;
      this.show = !this.show
      this.$emit('confirm', this.resultValue, this.getData(this.resultValue))
    },
		
	// 复选框变化事件
    change (val) {
		this.$emit('change', val, this.getData(val));
		this.columnsData.map((item) => { item.checked = false });
		for (let inneritem of val) {
			let mateIndex;
			mateIndex = this.columnsData.findIndex((item) => {return item.value == inneritem});
			if (mateIndex != -1) {
				this.$set(this.columnsData[mateIndex],'checked',true)
			}
		};
		let isAllCheckd = this.columnsData.every((item) => { return item.checked == true });
		if (isAllCheckd) {
			this.allCheckboxChecked = true;
		} else {
			this.allCheckboxChecked = false;
		};
    },
		
		// 全选复选框变化事件
		allCheckboxChange (e) {
			this.allCheckboxChecked = !this.allCheckboxChecked;
			if (e[0] == '全选') {
				this.columnsData.map((item) => { item.checked = true })
			} else {
				this.columnsData.map((item) => { item.checked = false })
			};
			let allCheckedList = this.columnsData.filter((item) => { return item.checked == true });
			let allCheckedArr = [];
			if (allCheckedList.length > 0) {
				for (let item of allCheckedList) {
					allCheckedArr.push(item.value)
				}
			};
			this.checkboxValue = [...allCheckedArr];
			this.$emit('change', allCheckedArr, this.getData(allCheckedArr))
		},
		
    cancel () {
      this.show = !this.show
      this.$emit('cancel')
    },
    
    showPopu () {
			this.columnsData = JSON.parse(JSON.stringify(this.columns));
			this.checkboxValue = JSON.parse(JSON.stringify(this.selectValue));
			this.resultValue = JSON.parse(JSON.stringify(this.selectValue));
			this.show = !this.show;
			if (this.show) {
			  this.$emit('showPopu')
			}
    }
  }
}
</script>

<style lang="scss" scoped>
	@import "~@/common/stylus/variable.scss";
	/deep/ .u-popup {
		.van-picker__toolbar {
			height: 44px;
			display: flex;
			align-items: center;
			.u-button {
				width: 100px;
				height: 44px;
				font-size: 16px;
				&:first-child {
					color: #909193 !important;
				};
				&:last-child {
					color: #3c9cff !important;
				}
			};
			.van-ellipsis {
				flex: 1;
				padding: 0 20px;
				box-sizing: border-box;
				font-weight: 500;
				font-size: 22px;
				text-align: center;
				@include no-wrap();
			}
		};
		.checkbox-con {
			.all-check-area {
				.u-checkbox-group {
					.u-checkbox {
						padding-bottom: 0 !important;
						height: 32px !important;
						padding: 0 6px;
						box-sizing: border-box;
					}
				}
			};
			.check-area {
				.u-checkbox-group {
					.u-checkbox {
						padding-bottom: 0 !important;
						height: 40px !important;
						padding: 0 6px;
						box-sizing: border-box;
					}
				}
			}
		}
	}
</style>
