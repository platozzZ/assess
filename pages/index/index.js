const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that

Page({
  data: {
    isLogin: false,
    modalName: null,
    onfocus:false,
    singlePrice:5,
    linkList:[
      {link:''}
    ],
    getUrlList: [
      {
        title: '途家',
        list: [
          '打开途家APP', '切换为房客', '找到您的房源（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
        ]
       }, 
       //{
      //   title: '爱彼迎',
      //   list: [
      //     '打开爱彼迎APP', '切换为旅行模式', '找到您的房源（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
      //   ]
      // }, {
      //   title: '美团榛果',
      //   list: [
      //     '打开美团民宿APP', '切换到房东', '进入房源预览（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
      //   ]
      // }, {
      //   title: '小猪',
      //   list: [
      //     '打开小猪APP', '切换成房东', '进入房源预览（若有多套请任选一个）', '点击分享，选择短信', '复制短信内容中的链接'
      //   ]
      // }
    ],
  },
  onLoad(options) {
    that = this

  },

  onShow(){
  
    setTimeout(()=>{
      that.setData({
        isLogin: app.globalData.isLogin
      })
      console.log(app.globalData.isLogin)
    },1500)
   
  },
  //继续添加
  add(){
    let linkList = that.data.linkList
    let json={}
    json.link=''
    linkList.push(json)
    that.setData({
      linkList
    })
  },
  //删除
  delete(){
    let linkList = that.data.linkList
    linkList.pop()
    that.setData({
      linkList
    })
  },

  //监听链接输入框
  bindvalue(e){
    console.log(e)
    let linkList = that.data.linkList
    let index = e.currentTarget.dataset.index
    linkList[index].link=e.detail.value
    that.setData({
      linkList
    })
  },
  //去支付
   toPay(){

     let linkList = that.data.linkList
     if (linkList[0].link==''){
       that.showToast('请粘贴房源链接')
       return false;
     }
     let singlePrice = that.data.singlePrice
     let totalPrice = that.data.singlePrice * that.data.linkList.length
     let links=[]
     linkList.map((item,index)=>{
  
         links.push(item.link)
       
      
     })
     console.log(links)

    let data = {
      tujia_house_urls:links,
    }

     api.request('/pms/house/assess/save_assess_url.do', 'POST', data, true, false).then(res => {
      console.log('链接上传结果', res)
       
       if (res.data.rlt_code == 'S_0000') {
         that.toPay2(res.data.data.id)
       }else{
         that.showToast(res.data.rlt_msg)
       }

     
    }).catch(res => {
      console.log(res)

    }).finally(() => { })

  },
  toPay2(business_id) {
    let  data={
      business_id: business_id
    }
    api.request('/pms/assess/weixin/order/assess_unified_order.do', 'POST', data, true).then(res => {
      console.log('支付:', res.data)

        let payData = res.data
        if (payData.rlt_code == 'S_0000') {
          wx.requestPayment({
            timeStamp: payData.data.timeStamp,
            nonceStr: payData.data.nonceStr,
            package: payData.data.package,
            signType: payData.data.signType,
            paySign: payData.data.paySign,
            success(res) {
              console.log('pay-success:', res)
              let linkList = [{
                link:''
              }]
             
              that.setData({
                linkList: linkList
              })
              setTimeout(()=>{
                wx.switchTab({
                  url: '../main/main'

                })
              },500)
             
            },
            fail(res) {
              console.log('pay-fail:', res)
              // that.showToast('支付失败')

            },
            complete: function (res) {
              console.log(res)
            }
          })
        } else {
          console.log('pay-codeFail:', payData)
          that.showToast(payData.rlt_msg)

        }

    
    }).catch(res => {

    }).finally(() => {

    })
  },
  //获取手机号登录
  getPhoneNumber(e) {
    console.log(e)
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      let data = {
        iv: e.detail.iv,
        encrypted_data: e.detail.encryptedData
      }

      let storageOpenid = wx.getStorageSync('openid')
      let globalOpenid = app.globalData.open_id
      data.openid = this.checkOpenid(storageOpenid) ? storageOpenid : globalOpenid
      console.log(data)
      api.request('/pms/weixin/assess/decrypt_authorization', 'POST', data, true, false, false, app).then(res => {
        console.log('getPhoneNumber:', res.data)

        if (res.data.rlt_code == 'S_0000') {
          wx.setStorageSync('token', res.data.data.access_token)
          wx.setStorageSync('user_mobile', res.data.data.user_mobile)
          app.globalData.isLogin = true
          app.globalData.user_mobile = res.data.data.user_mobile
          that.onShow()
          wx.showToast({
            title: '授权成功',
            success(res) {
              setTimeout(function () {
                that.toPay()
              }, 1000)
            }
          })
        } else {
          this.showToast(res.data.rlt_msg)
        }
      }).catch(res => {
        console.log(res)

      }).finally(() => { })
    }
    
  },
  checkOpenid(e) {
    if (e == 0 || e == undefined || e == null || e == false || e == '') {
      return false
    } else {
      return true
    }
  },
//如何获取链接
  showModal(e) {
    that.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  onFocus(){
    that.setData({
      onfocus: true
    })
  },
 hideModal(e){
    that.setData({
      modalName: null
    })
  },
  //toast框
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  onShareAppMessage: function (options) {
    return {
      title:'同样的位置，为什么您的客源就少？',
      path: "/pages/index/index",
      imageUrl:'/images/assess01.jpg',
      success: function (res) {
        console.log('onShareAppMessage  success:', res)
      },
      fail: function (res) {
        console.log('onShareAppMessage  fail:', res)
      }
    }
  }

})