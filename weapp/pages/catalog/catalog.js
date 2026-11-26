const db = require('../../utils/db')

Page({
  data: {
    category: [],
    currentCategory: {}
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '分类'
    })
    const that = this
    db.list('category').then(function (list) {
      const tree = db.buildCategoryTree(list)
      that.setData({
        category: tree,
        currentCategory: tree[0] || {}
      })
    }).catch(function (err) {
      console.error('分类加载失败', err)
    })
  },
  switchCategory: function (e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.value
    })
  },
  handleClickBigCover: function () {
    const data = this.data.currentCategory
    if (data.type == 0) {
      wx.navigateTo({
        url: '/pages/product/product?id=' + data.relateId
      })
    } else if (data.type == 1) {
      wx.navigateTo({
        url: '/pages/promotion/promotion?id=' + data.relateId
      })
    } else if (data.type == 2) {
      wx.navigateTo({
        url: '/pages/category/category?id=' + data.relateId
      })
    }
  },
  handleClick: function (e) {
    const data = e.currentTarget.dataset.value
    if (data.type == 0) {
      wx.navigateTo({
        url: '/pages/product/product?id=' + data.relateId
      })
    } else if (data.type == 1) {
      wx.navigateTo({
        url: '/pages/promotion/promotion?id=' + data.relateId
      })
    } else {
      wx.navigateTo({
        url: '/pages/category/category?id=' + data.relateId
      })
    }
  }
})
