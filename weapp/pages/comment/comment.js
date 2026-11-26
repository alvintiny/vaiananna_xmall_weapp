// pages/comment/comment.js
const db = require('../../utils/db')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: "all",
    count: {
      pic: 2,
      add: 1,
      good: 3,
      mid: 0,
      bad: 0
    },
    goodCommentRate: 100,
    rate: 5,
    comment: [],
    commentList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    if (!options.productId) {
      return
    }
    db.list('comment', { product_id: options.productId }).then(function (list) {
      const comments = list.map(function (item) {
        item.pics = item.pics || []
        return item
      })
      const good = comments.filter(function (item) { return item.rate >= 4 }).length
      that.setData({
        commentList: comments,
        comment: comments,
        goodCommentRate: comments.length ? Math.round(good / comments.length * 100) : 0,
        count: {
          pic: comments.filter(function (item) { return item.pics.length > 0 }).length,
          add: comments.filter(function (item) { return item.addComment }).length,
          good: good,
          mid: comments.filter(function (item) { return item.rate == 3 }).length,
          bad: comments.filter(function (item) { return item.rate <= 2 }).length
        }
      })
    }).catch(function (err) {
      console.error('评价加载失败', err)
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

  },
  changeTag: function (e) {
    let tag = e.currentTarget.dataset.value;
    this.setData({
      active: tag
    });
    let data = this.data.commentList;
    if (tag == "new") {
      data.sort(function (a, b) {
        if (b.time > a.time) {
          return 1;
        }
        if (b.time < a.time) {
          return -1;
        }
        return 0;
      });
    } else if (tag == "pic") {
      data = data.filter(v => {
        return v.pics.length > 0;
      });
    } else if (tag == "add") {
      data = data.filter(v => {
        return v.addComment;
      })
    } else if (tag == "good") {
      data = data.filter(v => {
        return v.rate >= 4;
      })
    } else if (tag == "mid") {
      data = data.filter(v => {
        return v.rate == 4 || v.rate == 3;
      })
    } else if (tag == "bad") {
      data = data.filter(v => {
        return v.rate <= 2;
      })
    }
    this.setData({
      comment: data
    })
  }
})