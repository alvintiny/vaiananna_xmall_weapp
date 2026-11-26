const db = require('../../utils/db')

Page({
  data: {
    sections: []
  },
  onLoad: function () {
    this.loadSections()
  },
  loadSections: function () {
    const that = this
    Promise.all([
      db.list('home_section'),
      db.list('home_section_item')
    ]).then(function (result) {
      that.setData({
        sections: db.buildSections(result[0], result[1])
      })
    }).catch(function (err) {
      console.error('首页加载失败', err)
    })
  },
  toSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
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
    } else if (data.type == 2) {
      wx.navigateTo({
        url: '/pages/category/category?id=' + data.relateId
      })
    }
  },
  clickHeader: function (e) {
    const data = e.currentTarget.dataset.value
    wx.navigateTo({
      url: '/pages/promotion/promotion?id=' + (data.relateId || '')
    })
  }
})
