// pages/ucenter/index/index.js
var app = getApp();
const db = require('../../../utils/db')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isLogin: false,
    order: {
      pay: 0,
      toSend: 0,
      send: 0,
      comment: 0,
      afterSale: 0
    },
    wallet: {
      coupon: 0,
      point: 0,
      red: 0,
      allowance: 0,
      gift: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '个人中心'
    })

  },
  loadSummary: function () {
    const that = this
    Promise.all([
      db.mine('user'),
      db.mine('order'),
      db.mine('user_coupon'),
      db.mine('user_red_packet')
    ]).then(function (result) {
      const user = result[0][0]
      const orders = result[1]
      if (user) {
        that.setData({
          isLogin: true,
          userInfo: {
            nickName: user.nickname || '微信用户',
            username: user.nickname || '微信用户',
            avatarUrl: user.avatarUrl || '/assets/avatar.png'
          }
        })
      }
      that.setData({
        order: {
          pay: orders.filter(function (item) { return item.orderStatus == 1 }).length,
          toSend: orders.filter(function (item) { return item.orderStatus == 2 }).length,
          send: orders.filter(function (item) { return item.orderStatus == 3 }).length,
          comment: orders.filter(function (item) { return item.orderStatus == 4 }).length,
          afterSale: 0
        },
        'wallet.coupon': result[2].filter(function (item) { return item.status == 0 }).length,
        'wallet.red': result[3].filter(function (item) { return item.status == 0 }).length
      })
    }).catch(function (err) {
      console.error('个人中心加载失败', err)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let userInfo = wx.getStorageSync('userInfo');
    let isLogin = wx.getStorageSync('isLogin');
    // 页面显示
    if (userInfo && isLogin) {
      this.setData({
        userInfo: userInfo,
        isLogin: isLogin
      });
    } else {
      // 未登录信息
      this.setData({
        userInfo: app.globalData.userInfo,
        isLogin: isLogin
      });
    }
    this.loadSummary()
    // 动画
    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease'
    });
    let next = true;
    let count = 0;
    // 连续动画
    setInterval(function () {
      if(count>3){
        return ;
      }
      if (next) {
        animation.translateX(6).step()
        next = !next;
      } else {
        animation.translateX(0).step()
        next = !next;
      }
      this.setData({
        ani: animation.export()
      })
      count++;
    }.bind(this), 800)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  toLogin: function () {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/auth/tologin/tologin',
      })
    }
  },
  checkLogin: function () {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/auth/tologin/tologin',
      })
    }
  },
  toOrder: function (e) {
    this.checkLogin();
    let type = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/ucenter/order/order?type=' + type,
    })
  },
  toAddress: function () {
    this.checkLogin();
    wx.navigateTo({
      url: '/pages/ucenter/address/index/index'
    })
  },
  toCoupon: function () {
    this.checkLogin();
    wx.navigateTo({
      url: '/pages/ucenter/coupon/coupon'
    })
  },
  toRed: function () {
    this.checkLogin();
    wx.navigateTo({
      url: '/pages/ucenter/red/red',
    })
  },
  toSetting: function () {
    wx.navigateTo({
      url: '/pages/ucenter/setting/setting',
    })
  },
  toVip: function () {
    wx.navigateTo({
      url: '/pages/ucenter/vip/vip',
    })
  }
})