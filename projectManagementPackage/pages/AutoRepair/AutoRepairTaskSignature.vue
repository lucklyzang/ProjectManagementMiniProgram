<template>
  <view class="page-box" ref="wrapper">
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
        <ElectronicSignature ref="mychild"></ElectronicSignature>
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
    ...mapGetters(["userInfo","submitAutoRepairTaskMessage","currentElectronicSignature","createAutoRepairTaskMessage","patrolTaskListMessage","ossMessage","timeMessage","originalSignature","devicePatrolDetailsSelectMessage"]),
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

  methods: {
    ...mapMutations(["changeOssMessage","changeTimeMessage","changePatrolTaskListMessage"]),


    resizeScreen() {
      const _this = this;
      // 利用 CSS3 旋转 对根容器逆时针旋转 90 度
      const detectOrient = function() {
        let width = document.documentElement.clientWidth,
        height = document.documentElement.clientHeight,
        $wrapper = _this.$refs.wrapper, // 页面最外层元素
          style = "";
        if (width >= height) {
          // 横屏
          style += "width:" + width + "px;"; // 注意旋转后的宽高切换
          style += "height:" + height + "px;";
          style += "-webkit-transform: rotate(0); transform: rotate(0);";
          style += "-webkit-transform-origin: 0 0;";
          style += "transform-origin: 0 0;";
        } else {
          // 竖屏
          console.log('竖屏了');
          style += "width:" + height + "px;";
          style += "height:" + width + "px;";
          style += "min-height:auto;";
          style +=
            "-webkit-transform: rotate(90deg); transform: rotate(90deg);";
          // 注意旋转中点的处理
          style +=
            "-webkit-transform-origin: " +
            width / 2 +
            "px " +
            width / 2 +
            "px;";
          style += "transform-origin: " + width / 2 + "px " + width / 2 + "px;";
        }
        $wrapper.style.cssText = style;
      };
      window.onresize = detectOrient;
      detectOrient()
    },

    // 签名重写
    rewrite () {
      this.$refs.mychild.overwrite()
    },

    // 签名确认
    sure () {
      this.$refs.mychild.commitSure();
      if (this.currentElectronicSignature == this.originalSignature || !this.currentElectronicSignature) {
        this.$toast('签名不能为空');
        return
      };
      // canvas签名旋转
      rotateBase64Img(this.currentElectronicSignature,-90,this.signatureRotateCallback)
  },
  
  //canvas签名旋转完成回调
  signatureRotateCallback (signatureValue) {
    this.infoText = '上传中,请稍等···';
    this.showLoadingHint = true;
    let photoMsg = {
      taskId: this.$route.params.taskId,  //任务ID
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
        taskId: this.$route.params.taskId
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
        taskId: this.$route.params.taskId
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
      this.$refs.mychild.overwrite();
      this.$router.push({path: '/autoRepairList'})
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
    height: 46px;
    /deep/ .van-nav-bar {
        .van-nav-bar__left {
        .van-nav-bar__text {
            color: #101010 !important;
            margin-left: 8px !important;
        }
        }
        .van-icon {
            color: #101010 !important;
            font-size: 22px !important;
        }
        .van-nav-bar__title {
          color: #101010 !important;
          font-size: 16px !important;
          margin: 0 !important;
          margin-left: 2% !important
        }
    }
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
      .signature {
        flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        /deep/ .signatureBox {
            width: 100% !important;
            flex: 1
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