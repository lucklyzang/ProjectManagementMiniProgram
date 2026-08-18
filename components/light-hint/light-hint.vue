<template>
    <view class="light-hint" v-if="params.isShow">
			<image :src="params.type == 'success' ? passedPng : exclamationPointPng" alt=""></image>
			<text>{{params.message}}</text>
    </view>
</template>
 
<script>
export default {
  name: 'LightHint',
  data() {
    return {
			params: {
				type: 'success',
				message: '',
				duration: '2000',
				isShow: false
			},
			defaultParams: {
				type: 'success',
				message: '',
				duration: '2000',
				isShow: false
			},
      exclamationPointPng: require("@/static/img/exclamation-point.png"),
      passedPng: require("@/static/img/passed.png")
    }
  },
  methods: {
    show(parameter={}) {
			Object.keys(this.params).forEach((key)=>{
				if (!parameter.hasOwnProperty(key)) {
					this.params[key] = this.defaultParams[key]
				} else if (parameter[key] == '') {
					this.params[key] = this.defaultParams[key]
				} else {
					this.params[key] = parameter[key]
				}
			});
      setTimeout(this.hide, this.params.duration);//设置时间自动消失
    },
    hide() {
			this.params['isShow'] = false
    }
  }
};
</script>
<style lang="scss" scoped>
 .light-hint {
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 180px;
    min-height: 48px;
    padding: 4px 10px; 
		box-sizing: border-box;
    position: fixed;
    z-index: 1000;
    bottom: 200px;
    left: 50%;
    transform: translateX(-50%);
    font-weight: bold;
    color: #101010;
    font-size: 14px;
		box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.4);
    text {
      vertical-align: middle;
      margin-left: 10px;
			text-align: left;
			word-break: break-all;
    };
    image {
			flex-shrink: 0;
      vertical-align: middle;
      width: 24px;
      height: 24px
    }
  }
</style>