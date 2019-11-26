const app = getApp(); 
const api = require('../../utils/request.js')
console.log(app.globalData)
Component({
  options: {
    styleIsolation: 'apply-shared'
    // addGlobalClass: true,
    // multipleSlots: true
  },
  properties: {
    
  },
  data: {
    isLogin: app.globalData.isLogin,
  },
  methods: {

    getPhoneNumber(e) {
      console.log(e)
      // console.log(e.detail.errMsg)
      // console.log(e.detail.iv)
      //  console.log(e.detail.encryptedData)
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
            app.globalData.isLogin = true
            app.globalData.user_mobile = res.data.data.user_mobile
            wx.showToast({
              title: '授权成功',
              success(res) {
                setTimeout(function () {

                  wx.switchTab({
                    url: '/pages/index/index',
                  })

                }, 2000)
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
    showToast(e) {
      wx.showToast({
        title: e,
        icon: 'none',
        mask: true,
        duration: 2000
      })
    },
  }
})