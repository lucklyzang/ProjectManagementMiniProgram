<template>
	<view class="container">
		<u-transition :show="showLoadingHint" mode="fade-down">
			<view class="loading-box" v-if="showLoadingHint">
				<u-loading-icon :show="showLoadingHint" :text="infoText" size="18" textSize="16"></u-loading-icon>
			</view>
		</u-transition>
		<u-modal :show="modalShow" :title="modalContent"
		 :showCancelButton="true" @confirm="sureCancel" @cancel="cancelSure">
		</u-modal>
		<u-toast ref="uToast"></u-toast>
		<view class="top-background-area">
			<view class="title-area">
				<image src="/static/img/login-icon.png" mode="widthFix"></image>
				<text>工程维修</text>
			</view>
		</view>
		<view class="container-content">
			<view class="form-box">
				<u--input
					prefixIcon="account"
					prefixIconStyle="font-size: 24px;color: #B6B6B6"
					placeholderStyle="font-size: 16px;color: #B6B6B6"
					fontSize="16px"
					color="#B6B6B6"
					placeholder="请输入用户名"
					v-model="form.username"
					border="bottom"
					type="text"
					clearable
				>
				</u--input>
				<u--input
					prefixIcon="lock"
					prefixIconStyle="font-size: 24px;color: #B6B6B6"
					placeholderStyle="font-size: 16px;color: #B6B6B6"
					fontSize="16px"
					color="#B6B6B6"
					placeholder="请输入密码"
					v-model="form.password"
					border="bottom"
					type="password"
					clearable
				>
				</u--input>
			</view>
			<view class="form-btn">
				<button type="primary" @click="loginEvent">登 录</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapGetters, mapMutations } from 'vuex'
	import { logIn, getDepartmentMsg } from '@/api/login.js'
	import Qs from 'qs'
	import { setCache, getCache, removeCache } from '@/common/js/utils'
	export default {
		data() {
			return {
				showLoadingHint: false,
				infoText: '登录中···',
				form: {
					username: '',
					password: ''
				},
        list: [
          {
            name: '记住账户密码',
            disabled: false
          }
        ],
				hospitalCampusDefaultIndex: [0],
				hospitalCampusOption: [],
				showHospitalCampus: false,
				currentHospitalCampusSpaces: '请选择',
				
				rememberAccountMessage: false,
				modalShow: false,
				modalContent: ''
			}
		},
		onReady () {
		},
		computed: {
			...mapGetters([
			])
		},
		onShow () {
		},
		methods: {
			...mapMutations([
				'storeUserInfo',
				'changeOverDueWay',
				'changeToken',
				'changeIsLogin',
				'storeDepartmentMessage'
			]),
			
			// 登录事件
			async loginEvent () {
				if (this.form.username === '' || this.form.password === '') {
					this.$refs.uToast.show({
						message: '用户名或密码不能为空'
					});
					return;
				};
				const resultOne = await this.login();
				const resultTwo = await this.queryDepartmentMsg(resultOne.proId);
				this.storeDepartmentMessage(resultTwo);
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
  
			// 登录接口
			login () {
				return new Promise((resolve,reject) => {
					this.showLoadingHint = true;
					let loginMessage = {
						username: this.form.username,
						password: this.form.password,
						rememberMe: 1
					};
					logIn(loginMessage).then((res) => {
						this.showLoadingHint = false;
						if (res) {
							if (res.data.code == 200) {
								resolve(res.data.data);
								this.changeOverDueWay(false);
								setCache('storeOverDueWay',false); 
								// 登录用户名密码及用户信息存入Locastorage
								// 判断是否勾选记住用户名密码
								if (this.rememberAccountMessage) {
									setCache('userName', this.form.username);
									setCache('userPassword', this.form.password);
								} else {
									removeCache('userName');
									removeCache('userPassword');
								};
								// 登录用户信息存入store
								this.changeIsLogin(true);
								this.storeUserInfo(res.data.data);
							} else {
							 reject(res.data.msg);
							 this.modalShow = true;
							 this.modalContent = `${res.data.msg}`
							}
						}
					})
					.catch((err) => {
						reject(err);
						this.showLoadingHint = false;
						this.modalShow = true;
						this.modalContent = err
					})
				})
			},
			
			// 获取科室信息字典值
			queryDepartmentMsg (proId) {
				return new Promise((resolve,reject) => {
					getDepartmentMsg(proId).then((res) => {
						if (res && res.data.code == 200) {
							resolve(res.data.data)
						} else {
							this.modalShow = true;
							this.modalContent = res.data.msg;
						}
					})
					.catch((err) => {
						this.modalShow = true;
						this.modalContent = err;
					})
				})
			},
			
			// 弹框确定事件
			sureCancel () {
				this.modalShow = false;
			},
			
			// 弹框取消事件
			cancelSure () {
				this.modalShow = false;
			}
		}
	}
</script>

<style lang="scss">
	@import "~@/common/stylus/variable.scss";
	.container {
		@include content-wrapper;
		padding-top: 50vh;
		box-sizing: border-box;
		.top-background-area {
			width: 100%;
			height: 50vh;
			background-image: linear-gradient(#20c4f8, #31abf8);
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10;
			.title-area {
				width: 100%;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				>image {
					width: 70%;
				};
				>text {
					position: absolute;
					width: 100%;
					height: 40px;
					line-height: 40px;
					left: 0;
					bottom: 10px;
					color: #fff;
					text-align: center;
					font-size: 24px
				}
			}
		};
		.container-content {
			height: 50vh;
			background: #fff;
			position: relative;
			padding-top: 50px;
			box-sizing: border-box;
			.form-box {
        width: 80%;
        margin: 0 auto;
				::v-deep {
					.u-input {
						height: 40px;
						border-color: #B6B6B6 !important;
						.u-input__content {
							.u-input__content__prefix-icon {
								margin-right: 12px;
							}
						};
						&:first-child {
							margin-bottom: 14px;
						}
					}
				}
			};
			.form-btn {
        width: 75%;
        margin: 0 auto;
        margin-top: 70px;
				::after {
					border-radius: 26px;
					border: none;
				};
				button {
					height: 48px;
					line-height: 48px;
					font-size: 16px;
          background-image: linear-gradient(to right, #6ED3F7,#218FFF);
          border-radius: 26px;
					box-shadow: 0pt 2pt 6pt 0pt rgba(36,149,213,1);
				}
			}
		}
	}
</style>
