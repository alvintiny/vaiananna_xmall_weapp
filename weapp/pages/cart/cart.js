// pages/cart/cart.js
const db = require('../../utils/db')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    noChecked: false,
    checkedAll: false,
    isExpressFree: false,
    restExpressFree: 0,
    isPromotion: false,
    restPromotion: 0,
    totalPrice: 0,
    totalCount: 0,
    cartList: [
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '购物车'
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
    this.loadCart()
  },
  loadCart: function () {
    const that = this
    db.mine('cart_item').then(function (list) {
      const cartList = list.map(function (item) {
        return {
          id: item.id,
          productId: item.productId,
          checked: item.checked !== false,
          picUrl: item.picUrl,
          title: item.title,
          spec: item.spec,
          count: item.count || 1,
          maxNum: 99,
          price: item.price || 0
        }
      })
      that.setData({
        isLogin: true,
        cartList: cartList
      })
      that.setCheckedTotalPrice()
      that.setCheckedTotalCount()
      that.judgeCheckedAll()
    }).catch(function (err) {
      console.error('购物车加载失败', err)
      that.setData({
        isLogin: false,
        cartList: []
      })
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
  changeCheck: function (e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      [`cartList[${index}].checked`]: e.detail
    })
    this.setCheckedTotalPrice()
    this.setCheckedTotalCount()
    this.judgeCheckedAll()
    this.updateCartItem(index, { checked: e.detail })
  },
  changeCount: function (e) {
    const index = e.currentTarget.dataset.index
    const count = e.detail.value
    this.setData({
      [`cartList[${index}].count`]: count
    })
    this.setCheckedTotalPrice()
    this.setCheckedTotalCount()
    this.updateCartItem(index, { count: count })
  },
  updateCartItem: function (index, data) {
    const item = this.data.cartList[index]
    if (!item) {
      return
    }
    db.update('cart_item', item.id, data).catch(function (err) {
      console.error('购物车更新失败', err)
    })
  },
  setCheckedTotalPrice: function () {
    let totalPrice = 0;
    this.data.cartList.forEach(function (v) {
      if (v.checked) {
        totalPrice += v.price * v.count
      }
    })
    this.setData({
      totalPrice: totalPrice
    })
    this.judgeExpressFree();
    this.judgePromotion();
  },
  judgeCheckedAll: function () {
    let noChecked = true;
    this.data.cartList.forEach(function (v) {
      if (v.checked) {
        noChecked = false;
        return;
      }
    })
    let checkedAll = true;
    this.data.cartList.forEach(function (v) {
      if (!v.checked) {
        checkedAll = false;
        return;
      }
    })
    this.setData({
      noChecked: noChecked,
      checkedAll: checkedAll
    })
  },
  judgeExpressFree: function () {
    if (this.data.totalPrice >= 88) {
      this.setData({
        isExpressFree: true
      })
    } else {
      let rest = 88 - this.data.totalPrice;
      this.setData({
        isExpressFree: false,
        restExpressFree: rest
      })
    }
  },
  judgePromotion: function () {
    if (this.data.totalPrice >= 130) {
      this.setData({
        isPromotion: true
      })
    } else {
      let rest = 130 - this.data.totalPrice;
      this.setData({
        isPromotion: false,
        restPromotion: rest
      })
    }
  },
  changeCheckedAll: function (e) {
    this.setData({
      checkedAll: e.detail
    });
    for (let i = 0; i < this.data.cartList.length; i++) {
      this.setData({
        [`cartList[${i}].checked`]: e.detail
      })
      this.updateCartItem(i, { checked: e.detail })
    }
    this.setCheckedTotalPrice();
    this.setCheckedTotalCount();
    this.judgeCheckedAll();
  },
  setCheckedTotalCount: function () {
    let totalCount = 0
    this.data.cartList.forEach(function (v) {
      if (v.checked) {
        totalCount += v.count
      }
    })
    this.setData({
      totalCount: totalCount
    })
  },
  deleteProduct: function (e) {
    let id = e.currentTarget.dataset.value.id;
    let data = [];
    this.data.cartList.forEach(function (v) {
      if (id != v.id) {
        data.push(v);
      }
    })
    this.setData({
      cartList: data
    })
    this.setCheckedTotalPrice();
    this.setCheckedTotalCount();
    this.judgeCheckedAll();
    db.remove('cart_item', id).catch(function (err) {
      console.error('购物车删除失败', err)
    })
  },
  checkout: function () {
    if (this.data.noChecked) {
      return;
    }
    // 购物车数据存入缓存
    wx.setStorageSync("cartList", this.data.cartList);
    wx.setStorageSync("isExpressFree", this.data.isExpressFree);
    wx.setStorageSync("totalPrice", this.data.totalPrice);
    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });
  },
  toChangeOther: function(){
    wx.navigateTo({
      url: '/pages/category/category'
    })
  },
  toBuyOther: function(){
    wx.navigateTo({
      url: '/pages/promotion/promotion?title=加价购凑单区'
    })
  },
  toProduct: function(e){
    wx.navigateTo({
      url: '/pages/product/product?id=' + e.currentTarget.dataset.value.productId
    })
  }
})