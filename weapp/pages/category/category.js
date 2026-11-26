const db = require('../../utils/db')

Page({
  data: {
    active: 0,
    description: '',
    category: {
      id: '',
      title: '',
      children: []
    },
    product: []
  },
  onLoad: function (options) {
    this.categoryId = options.id
    this.loadCategory(options.id)
  },
  loadCategory: function (id) {
    const that = this
    if (!id) {
      return
    }
    db.get('category', id).then(function (category) {
      return db.list('category').then(function (all) {
        category.children = all.filter(function (item) {
          return String(item.parentId) === String(id)
        }).sort(function (a, b) {
          return (a.sortOrder || 0) - (b.sortOrder || 0)
        })
        that.setData({
          category: category,
          description: category.children[0] ? (category.children[0].description || '') : ''
        })
        wx.setNavigationBarTitle({
          title: category.title || '分类'
        })
        const childId = category.children[0] ? category.children[0].id : id
        that.loadProducts(childId)
      })
    }).catch(function (err) {
      console.error('类目加载失败', err)
    })
  },
  loadProducts: function (categoryId) {
    const that = this
    db.list('product', { category_id: categoryId }).then(function (list) {
      that.setData({
        product: list.map(function (item) {
          item.type = 0
          item.relateId = item.id
          return item
        })
      })
    }).catch(function (err) {
      console.error('类目商品加载失败', err)
    })
  },
  changeTab: function (e) {
    const index = e.detail.index
    const child = this.data.category.children[index]
    this.setData({
      active: index,
      description: child ? (child.description || '') : ''
    })
    if (child) {
      this.loadProducts(child.id)
    }
  },
  handleClick: function (e) {
    const id = e.currentTarget.dataset.value.id
    wx.navigateTo({
      url: '/pages/product/product?id=' + id
    })
  }
})
