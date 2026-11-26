// pages/ucenter/red/red.js
const db = require('../../../utils/db')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    disabled: true,
    value: "",
    redList: [],
    red: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '红包',
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
    this.fetchRed()
  },
  fetchRed: function () {
    const that = this
    Promise.all([
      db.mine('user_red_packet'),
      db.list('red_packet')
    ]).then(function (result) {
      const templates = {}
      result[1].forEach(function (item) {
        templates[item.id] = item
      })
      const red = result[0].map(function (item) {
        const tpl = templates[item.redPacketId] || {}
        return {
          id: item.id,
          title: tpl.title || '',
          startTime: tpl.startTime || '',
          endTime: tpl.endTime || '',
          description: tpl.description || '',
          money: tpl.money || 0,
          disabled: item.status != 0,
          showAll: false,
          selected: false,
          status: item.status || 0
        }
      })
      that.setData({ red: red })
      that.loadData(that.data.active || 0)
    }).catch(function (err) {
      console.error('红包加载失败', err)
    })
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
  loadData: function (type) {
    let data = this.data.red.filter(item => item.status == type);
    this.setData({
      redList: data
    })
  },
  changeTab: function (e) {
    let index = e.detail.index;
    this.loadData(index);
  },
  scrollListen: function (e) {
    console.log("滑到底部啦 该加载下一页数据啦")
  }
})