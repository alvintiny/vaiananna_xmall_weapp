// pages/ucenter/express/express.js
const db = require('../../../utils/db')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    express: {
      company: '',
      expno: '',
      detail: []
    },
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '物流信息',
    })
    this.loadExpress(options.orderId)
  },
  loadExpress: function (orderId) {
    const that = this
    if (!orderId) {
      return
    }
    db.mine('express', { order_id: orderId }).then(function (list) {
      const express = list[0]
      if (!express) {
        return
      }
      return db.mine('express_trace', { express_id: express.id }).then(function (traces) {
        traces.sort(function (a, b) {
          return String(b.tracedAt || '').localeCompare(String(a.tracedAt || ''))
        })
        that.setData({
          express: {
            company: express.company,
            expno: express.expno,
            detail: traces.map(function (item) {
              return {
                text: item.text,
                desc: item.tracedAt || item.desc || ''
              }
            })
          }
        })
      })
    }).catch(function (err) {
      console.error('物流加载失败', err)
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

  }
})