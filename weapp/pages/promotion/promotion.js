// pages/promotion/promotion.js
const db = require('../../utils/db')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    filters: [
      {
        type: 'text',
        label: '综合',
        value: 'default',
        checked: true,
        groups: ['001'],
      },
      {
        type: 'sort',
        label: '价格',
        value: 'price',
        groups: ['002'],
      }
    ],
    product: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.title) {
      wx.setNavigationBarTitle({
        title: options.title,
      })
    }
    this.loadProducts(options.id)
  },
  loadProducts: function (categoryId) {
    const that = this
    const where = categoryId ? { category_id: categoryId } : null
    db.list('product', where).then(function (list) {
      that.setData({
        product: list
      })
    }).catch(function (err) {
      console.error('促销商品加载失败', err)
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
  handleClick: function (e) {
    let id = e.currentTarget.dataset.value.id;
    wx.navigateTo({
      url: '/pages/product/product?id=' + id
    });
  },
  onFilterChange: function (e) {
    let price = e.detail.checkedValues[1];
    if (price == 1) {
      let data = this.data.product;
      data.sort(function (a, b) {
        return a.price - b.price
      });
      this.setData({
        product: data
      })
    } else if (price == -1) {
      let data = this.data.product;
      data.sort(function (a, b) {
        return b.price - a.price
      });
      this.setData({
        product: data
      })
    } else {
      let data = this.data.product;
      data.sort(function (a, b) {
        return a.id - b.id
      });
      this.setData({
        product: data
      })
    }
  },
  scrollListen: function (e) {
    console.log("滑到底部啦 该加载下一页数据啦")
  }
})