<template>
  <view class="page-box" ref="wrapper">
		<canvas 
			type="2d" 
			id="rotateCanvas"
			style="position: fixed; left: -9999px; top: -9999px; width: 100px; height: 100px;"
		></canvas>
   <u-transition :show="showLoadingHint" mode="fade-down">
   	<view class="loading-box">
   		<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
   	</view>
   </u-transition>
    <view class="nav">
    <!-- <NavBar path="/AutoRepairCreate" title="工单完成签名" :leftArrow="false" :leftText="null" /> -->
    </view>
    <view class="content">
      <view class="content-left">
				<view class="electronic-signature-box">
					<ElectronicSignature ref="mychild"></ElectronicSignature>
				</view>
        <view class="btn-area">
          <view class="cancel-btn" @click="cancel">
            <text>取</text>
            <text>消</text>
          </view>
          <view class="overwrite-btn" @click="rewrite">
            <text>重</text>
            <text>写</text>
          </view>
          <view class="sure-btn" @click="sure">
            <text>确</text>
            <text>认</text>
          </view>
        </view> 
      </view>
      <view class="content-right">
        <text>工</text>
        <text>单</text>
        <text>完</text>
        <text>成</text>
        <text>签</text>
        <text>名</text>
      </view>
    </view>
  </view>
</template>
<script>
import ElectronicSignature from '@/components/electronicSignature/electronicSignature'
import { mapGetters, mapMutations } from "vuex";
import { rotateBase64Img } from '@/common/js/utils';
import { uploadRepairsTaskPhoto, completeRepairsTaskFinal, noAuditTask } from '@/api/project.js'
export default {
  name: "AutoRepairTaskSignature",
  components: {
    ElectronicSignature
  },
  data() {
    return {
      showLoadingHint: false,
      isExpire: false,
      isAllTaskComplete: true,
      infoText: '提交中',
			currentTaskId: '',
      fromPathSource: '',
      imgOnlinePathArr: [],
      currentTaskSetId: '',
      timeTabIndex: 0,
      taskSetTime: '',
      taskSetName: '',
      taskSetNameIndex: 0,
      allPatrolTaskDetailsData: [],
      timeList: []
    }
  },
	
  watch: {},

  computed: {
    ...mapGetters(["userInfo","currentElectronicSignature"]),
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
      }
  },
	
	onLoad (options) {
		this.currentTaskId = JSON.parse(decodeURIComponent(options.params))['taskId']
	},
	
  methods: {
    ...mapMutations([]),
		
		// 顶部导航返回事件
		backTo () {
			uni.navigateBack()
		},

    // 签名重写
    rewrite () {
      this.$refs.mychild.overwrite()
    },

    // 签名确认
    sure () {
      this.$refs.mychild.commitSure();
			setTimeout(() => {
				rotateBase64Img(this.currentElectronicSignature,-90,this.signatureRotateCallback)
			},1000)
  },
  
  //canvas签名旋转完成回调
  signatureRotateCallback (signatureValue) {
    this.infoText = '上传中,请稍等···';
    this.showLoadingHint = true;
    let photoMsg = {
      taskId: this.currentTaskId,  //任务ID
      images: []
    };
    photoMsg.images = [];
    photoMsg.images.push({
      imgType: 0,
      image: signatureValue
    });
    uploadRepairsTaskPhoto(photoMsg)
    .then((res) => {
      this.loadingShow = false;
      this.overlayShow = false;
      if (res && res.data.code == 200) {
        uni.showToast({
          title: res.data.msg,
          icon: 'success'
        })
        this.rewrite ();
        this.updateTaskNoAuditTask()
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
      });
      this.showLoadingHint = false;
    })
  },
  

  // 更改任务状态为已完成
    updateTaskComplete () {
      this.infoText = '加载中,请稍等···';
      this.showLoadingHint = true;
      completeRepairsTaskFinal({
        proId: this.proId,
        taskId: this.currentTaskId
      })
      .then((res) => {
        if (res && res.data.code == 200) {
          uni.showToast({
            title: res.data.msg,
            icon: 'success'
          });
          this.$router.push({ path: "/autoRepairList" })
        } else {
          uni.showToast({
            title: res.data.msg,
            icon: 'error'
          })
        };
        this.infoText = '';
        this.showLoadingHint = false;
      })
      .catch((err) => {
        this.infoText = '';
        this.showLoadingHint = false;
        uni.showToast({
          title: err,
          icon: 'error'
        })
      })
    },

    // 更改任务状态为待审核
    updateTaskNoAuditTask () {
      this.infoText = '加载中,请稍等···';
      this.showLoadingHint = true;
      noAuditTask({
        proId: this.proId,
        taskId: this.currentTaskId
      })
      .then((res) => {
        if (res && res.data.code == 200) {
          uni.showToast({
            title: res.data.msg,
            icon: 'success'
          });
          this.$router.push({ path: "/autoRepairList" })
        } else {
          uni.showToast({
            title: res.data.msg,
            icon: 'error'
          })
        };
        this.infoText = '';
        this.showLoadingHint = false;
      })
      .catch((err) => {
        this.infoText = '';
        this.showLoadingHint = false;
        uni.showToast({
          title: err,
          icon: 'error'
        })
      })
    },

    // 签名取消
    cancel () {
      this.$refs.mychild.overwrite()
      this.backTo()
    }
  }
};
</script>
<style lang='scss' scoped>
@import "~@/common/stylus/variable.scss";
page {
	width: 100%;
	height: 100%;
};
.page-box {
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
  .nav {
    width: 100%;
    height: 46px
  };
  .content {
    width: 92%;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: row;
    height: 0;
    .content-left {
      display: flex;
      flex: 1;
      flex-direction: column;
			.electronic-signature-box {
				flex: 1;
				::v-deep .signature {
				  display: flex;
				  flex-direction: column;
				  width: 100%;
				  .canvas-wrapper {
						background: transparent !important;
						width: 100% !important;
						flex: 1
				  }
				}
			};
      .btn-area {
        width: 100%;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 150px;
        >view {
          font-size: 14px;
          border-radius: 4px;
          margin-right: 20px;
          width: 39px;
          height: 95px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          >text {
            transform: rotate(90deg);
            margin-bottom: 2px
          }
        }
        .cancel-btn {
            background: #1684FC;
            color: #fff

        };
        .overwrite-btn {
            border: 1px solid #1684FC;
            color: #1684FC
        };
        .sure-btn {
            background: #E86F50;
            color: #fff;
            margin-right: 0
        }
      }
    };
    .content-right {
      width: 50px;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 20px;
      color: #101010;
      >text {
        transform: rotate(90deg)
      }
    }  
  }
}
</style>