const app = getApp()
const api = require('../../utils/request.js')
const baseUrl = require('../../utils/baseUrl.js')
var that
Page({
  data: {
    isLogin: null,
    modalName:null,
    houseList:[
      // {
      //   thumbnail_url:'https://magicdn.oss-cn-beijing.aliyuncs.com/pms/miniapp/static/subao.gif',
      //   name:'高碑店山丘小屋',
      //   whole_score:'100',
      //   address:'北京市朝阳区高碑…村高碑店高碑店村31-5',
      //   assess_status:2,
      //   location_level:1,
      //   fitment_level:2,
      //   price_level:3,
      //   customer_level:0,
      //   house_id:123,
      //   key:456,
      // },
      // {
      //   thumbnail_url: 'https://magicdn.oss-cn-beijing.aliyuncs.com/pms/miniapp/static/subao.gif',
      //   name: '高碑店山丘小屋高碑店山丘小屋丘小屋高碑店山丘小屋',
      //   whole_score: '100',
      //   address: '北京市朝阳区高碑…村高碑店高碑店村31-阳区高碑…村高碑店高碑店村31-5',
      //   assess_status: 0,
      //   location_level: 1,
      //   fitment_level: 2,
      //   price_level: 3,
      //   customer_level: 0,
      // }
    ],
    emptyContainer: false,
    showContainer: true,
  },
  onLoad(options) {
    that = this
  },
  //页面显示
  onShow(){
  
    that.setData({
      isLogin: app.globalData.isLogin
    })
    if (!app.globalData.isLogin) {
      return
    }
   that.getMyHouse()
  },
  //评估列表
  getMyHouse() {
    api.request('/pms/house/assess/paid_list.do', 'POST', '', true).then(res => {
      console.log('评估列表:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        if (res.data.data.length == 0) {
          that.setData({
            showContainer: false,
            emptyContainer: true
          })
          return
        }
        let datas = res.data.data
     
        console.log(datas)
        that.setData({
          houseList: datas,
          showContainer: true,
          emptyContainer: false
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  //开始评估
  startAssess(e){

    let id = e.currentTarget.dataset.id
    let data={
      house_id:id
    }
    api.request('/pms/house/assess/start_assess.do', 'POST', data, true).then(res => {
      console.log('开始评估:', res.data)
      if (res.data.rlt_code == 'S_0000') {
       that.setData({
         modalName:'assessloading'
       })
       setTimeout(()=>{
         that.setData({
           modalName:null
         })
         that.getMyHouse() 
       },10000)
      
       
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })

  },
  //查看报告
  lookResult(e) {

    let assess_status = e.currentTarget.dataset.assess_status
    if (assess_status!=2){
      return;
    }
    let remote_house_id = e.currentTarget.dataset.remote_house_id
    let key = e.currentTarget.dataset.key
    let url
    if (baseUrl.indexOf('test')!=-1){
      url = `https://test01pms.magi.link/result.html?house_id=${remote_house_id}&key=${key}&env=0`
    }else{
      url = `https://pms.magi.link/result.html?house_id=${remote_house_id}&key=${key}`
    }
   console.log(url)
    wx.navigateTo({
      url: '../webview/webview?url=' + encodeURIComponent(JSON.stringify(url)),
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
  onPullDownRefresh: function () {
     that.getMyHouse()
    wx.stopPullDownRefresh()
  },
})