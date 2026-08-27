<template>
  <view class="signature">
    <view class="canvas-wrapper" id="signWrapper">
			<canvas
				type="2d" 
				id="signCanvas"
				class="sign-canvas"
				:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
				@touchstart="onTouchStart"
				@touchmove="onTouchMove"
				@touchend="onTouchEnd"
				disable-scroll
			></canvas>
		</view>
  </view> 
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { base64ImgtoFile } from '@/common/js/utils'
  export default {
    name: 'ElectronicSignature',
    data() {
      return {
				canvasWidth: 0,
				canvasHeight: 0,
				canvas: null,
				ctx: null,
				dpr: 1,
				isEmpty: true,
				isDrawing: false,
				lastX: 0,
				lastY: 0,
				// 用于贝塞尔曲线平滑
				points: []
			} 
    },
    
    props: {
      color: {
        type: String,
        default: '#000'
      },
      lineWidth: {
        type: Number,
        default: 2
      }
    },

		 onLoad() {
			// 获取屏幕信息
			const systemInfo = uni.getSystemInfoSync()
			this.dpr = systemInfo.pixelRatio
     },
   
     onReady() {
       this.initCanvas()
     },

     computed:{
      ...mapGetters([
        'currentElectronicSignature'
      ]),
    },

    methods: {
      ...mapMutations([
        'changeCurrentElectronicSignature'
      ]),
			
			// 初始化画布
			initCanvas() {
				// 第一步：获取外层容器尺寸
				const query = uni.createSelectorQuery().in(this)
				query
				.select('#signWrapper')
				.boundingClientRect()
				.exec((res) => {
					if (!res || !res[0]) {
						console.error('未获取到容器尺寸')
						return
					}
					const { width, height } = res[0]
					this.canvasWidth = width
					this.canvasHeight = height
					// 第二步：等待 DOM 更新后再初始化 canvas 节点
					this.$nextTick(() => {
						this.setupCanvas()
					})
				});
				this.changeCurrentElectronicSignature({DtMsg: null})
			},
			
			/**
			 * 初始化 Canvas 2D 上下文
			 */
			setupCanvas() {
				const query = uni.createSelectorQuery().in(this)
				query
					.select('#signCanvas')
					.fields({ node: true, size: true })
					.exec((res) => {
						if (!res || !res[0]) {
							console.error('未获取到 canvas 节点')
							return
						}
						const { node, width, height } = res[0]
						// 设置画布实际像素（适配高清屏）
						node.width = width * this.dpr
						node.height = height * this.dpr
						const ctx = node.getContext('2d')
						ctx.scale(this.dpr, this.dpr)
						// 画笔样式
						ctx.strokeStyle = '#000000'
						ctx.lineWidth = 3
						ctx.lineCap = 'round'
						ctx.lineJoin = 'round'
						// 绘制白色背景
						ctx.fillStyle = '#ffffff'
						ctx.fillRect(0, 0, width, height)
						this.canvas = node
						this.ctx = ctx
					})
			},

			/**
			 * 触摸开始
			 */
			onTouchStart(e) {
				if (e.touches.length !== 1) return
				const touch = e.touches[0]
				this.isDrawing = true
				this.isEmpty = false
				this.lastX = touch.x
				this.lastY = touch.y
				// 记录起始点（用于贝塞尔曲线）
				this.points = [{ x: touch.x, y: touch.y }]
				// 绘制起始点（一个小圆点）
				this.ctx.beginPath()
				this.ctx.arc(touch.x, touch.y, 1.5, 0, Math.PI * 2)
				this.ctx.fillStyle = '#000000'
				this.ctx.fill()
			},
	
			/**
			 * 触摸移动（贝塞尔曲线平滑）
			 */
			onTouchMove(e) {
				if (!this.isDrawing || e.touches.length !== 1) return
				const touch = e.touches[0]
				// 添加新点
				this.points.push({ x: touch.x, y: touch.y })
				// 取最近3个点做二次贝塞尔曲线
				const len = this.points.length
				if (len >= 3) {
					const p0 = this.points[len - 3]
					const p1 = this.points[len - 2]
					const p2 = this.points[len - 1]
					// 中点作为起点和终点
					const midX1 = (p0.x + p1.x) / 2
					const midY1 = (p0.y + p1.y) / 2
					const midX2 = (p1.x + p2.x) / 2
					const midY2 = (p1.y + p2.y) / 2
					this.ctx.beginPath()
					this.ctx.moveTo(midX1, midY1)
					this.ctx.quadraticCurveTo(p1.x, p1.y, midX2, midY2)
					this.ctx.stroke()
				} else {
					// 前两个点直接用 lineTo
					const prev = this.points[len - 2]
					this.ctx.beginPath()
					this.ctx.moveTo(prev.x, prev.y)
					this.ctx.lineTo(touch.x, touch.y)
					this.ctx.stroke()
				}
			},
	
			/**
			 * 触摸结束
			 */
			onTouchEnd() {
				this.isDrawing = false
				this.points = []
			},
	
			/**
			 * 清除画布
			 */
			overwrite() {
				if (!this.ctx) return
				this.ctx.fillStyle = '#ffffff'
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
				this.isEmpty = true
				this.changeCurrentElectronicSignature({DtMsg: null})
			},

			/**
			 * 确认签名
			*/
			 commitSure() {
					if (this.isEmpty) {
						uni.showToast({ title: '请先签名', icon: 'none' })
						return
					}
					uni.showLoading({ title: '签名生成中...' })
					setTimeout(() => {
						this.exportBase64()
							.then((base64) => {
								uni.hideLoading()
								this.changeCurrentElectronicSignature({DtMsg:base64});
							})
							.catch((err) => {
								uni.hideLoading()
								uni.showToast({ title: '导出失败', icon: 'none' })
							})
					}, 300)
				},
		
				//导出 Base64
				exportBase64() {
					return new Promise((resolve, reject) => {
						uni.canvasToTempFilePath({
							canvas: this.canvas,
							x: 0,
							y: 0,
							width: this.canvasWidth,
							height: this.canvasHeight,
							destWidth: this.canvasWidth * this.dpr,
							destHeight: this.canvasHeight * this.dpr,
							fileType: 'png',
							quality: 1,
							success: (res) => {
								console.log('临时路径:', res.tempFilePath)
								this.tempFileToBase64(res.tempFilePath)
									.then(resolve)
									.catch(reject)
							},
							fail: (err) => reject(err)
						}, this)
					})
				},
		
			/**
			 * 临时文件转 base64（多重降级）
			 */
			tempFileToBase64(filePath) {
				return new Promise((resolve, reject) => {
					// ===== 开发者工具：http://tmp 路径 =====
					if (filePath.indexOf('http://tmp/') === 0 || filePath.indexOf('http://store/') === 0) {
						this.readHttpTmpFile(filePath)
							.then(resolve)
							.catch(reject)
						return
					}
			
					// ===== 真机：正常读取 =====
					const fs = wx.getFileSystemManager()
					fs.readFile({
						filePath: filePath,
						encoding: 'base64',
						success: (res) => {
							resolve('data:image/png;base64,' + res.data)
						},
						fail: () => {
							fs.readFile({
								filePath: filePath,
								success: (res) => {
									const base64 = wx.arrayBufferToBase64(res.data)
									resolve('data:image/png;base64,' + base64)
								},
								fail: (err) => reject(err)
							})
						}
					})
				})
			},
			
			/**
			 * 读取开发者工具的 http://tmp 路径
			 */
			readHttpTmpFile(url) {
			  return new Promise((resolve, reject) => {
			    // 方法1：wx.request 直接请求
			    wx.request({
			      url: url,
			      method: 'GET',
			      responseType: 'arraybuffer',
			      success: (res) => {
			        if (res.statusCode === 200 && res.data) {
			          const base64 = wx.arrayBufferToBase64(res.data)
			          resolve('data:image/png;base64,' + base64)
			        } else {
			          console.warn('wx.request 失败，尝试 downloadFile...')
			          // 方法2：downloadFile 下载
			          this.downloadAndRead(url).then(resolve).catch(reject)
			        }
			      },
			      fail: () => {
			        console.warn('wx.request 失败，尝试 downloadFile...')
			        this.downloadAndRead(url).then(resolve).catch(reject)
			      }
			    })
			  })
			},
			
			/**
			 * downloadFile 下载后再读取
			 */
			downloadAndRead(url) {
			  return new Promise((resolve, reject) => {
			    wx.downloadFile({
			      url: url,
			      success: (res) => {
			        if (res.statusCode === 200 && res.tempFilePath) {
			          const fs = wx.getFileSystemManager()
			          fs.readFile({
			            filePath: res.tempFilePath,
			            encoding: 'base64',
			            success: (fileRes) => {
			              resolve('data:image/png;base64,' + fileRes.data)
			            },
			            fail: () => {
			              // 最终降级：返回文件路径
			              resolve(res.tempFilePath)
			            }
			          })
			        } else {
			          reject(new Error('downloadFile 失败'))
			        }
			      },
			      fail: (err) => reject(err)
			    })
			  })
			}
    }
  }
</script>
<style lang='less' scoped>
  .signature {
    height: 100%;
		display: flex;
    .canvas-wrapper{
			 flex: 1;
       margin: 20rpx;
       background-color: #fff;
       border-radius: 16rpx;
       position: relative;
       overflow: hidden;
    }
  }
</style>