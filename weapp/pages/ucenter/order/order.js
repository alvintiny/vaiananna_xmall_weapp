// pages/ucenter/order/order.js
const db = require('../../../utils/db')
import Dialog from '../../../lib/vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    loading: false,
    orderList: [],
    order: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单中心',
    })
    // 获取参数
    let type = options.type;
    if (type) {
      this.setData({
        active: type
      })
    }
    this.fetchOrders(type)
  },
  fetchOrders: function (type) {
    const that = this
    this.setData({ loading: true })
    Promise.all([
      db.mine('order'),
      db.mine('order_item')
    ]).then(function (result) {
      const items = result[1]
      that.orders = result[0].map(function (order) {
        order.productList = items.filter(function (item) {
          return String(item.orderId) === String(order.id)
        }).map(function (item) {
          item.status = order.orderStatus
          return item
        })
        order.address = {
          name: order.addressName || '',
          mobile: order.addressMobile || '',
          address: order.address || '',
          street: order.street || ''
        }
        return order
      })
      that.loadData(type)
    }).catch(function (err) {
      console.error('订单加载失败', err)
      that.setData({ loading: false, orderList: [] })
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
  loadData: function (type) {
    const source = this.orders || []
    const data = type && type != 0 ? source.filter(function (item) {
      return item.orderStatus == type
    }) : source
    this.setData({
      orderList: data,
      loading: false
    })
  },
  changeTab: function (e) {
    let type = e.detail.index;
    // 模拟加载数据
    this.loadData(type)
  },
  scrollListen: function (e) {
    console.log("滑到底部啦 该加载下一页数据啦")
  },
  cancelOrder: function (e) {
    Dialog.confirm({
      message: '要取消此订单？'
    }).then(() => {
      // on confirm
      let index = e.currentTarget.dataset.index;
      this.setData({
        [`orderList[${index}].orderStatus`]: 0
      })
      for (let i = 0; i < this.data.orderList[index].productList.length; i++) {
        this.setData({
          [`orderList[${index}].productList[${i}].status`]: 0
        })
      }
    }).catch(() => {
      // on cancel
    });
  },
  deleteOrder: function (e) {
    Dialog.confirm({
      message: '要删除此订单？'
    }).then(() => {
      // on confirm
      let id = e.currentTarget.dataset.value.id;
      let data = [];
      this.data.orderList.forEach(function (v) {
        if (id != v.id) {
          data.push(v);
        }
      })
      this.setData({
        orderList: data
      })
    }).catch(() => {
      // on cancel
    });
  },
  confirmReceive: function (e) {
    Dialog.confirm({
      message: '确收到货物？'
    }).then(() => {
      // on confirm
      let index = e.currentTarget.dataset.index;
      this.setData({
        [`orderList[${index}].orderStatus`]: 4
      })
      for (let i = 0; i < this.data.orderList[index].productList.length; i++) {
        this.setData({
          [`orderList[${index}].productList[${i}].status`]: 4
        })
      }
    }).catch(() => {
      // on cancel
    });
  },
  toPay: function (e) {
    let actualPrice = e.currentTarget.dataset.value.actualPrice;
    wx.showModal({
      title: '提示',
      content: '此处需调用微信支付接口',
      showCancel: false,
      confirmColor: '#b4282d',
      success: function (res) {
        if (res.confirm) {
          wx.redirectTo({
            url: '/pages/pay-result/pay-result?status=1&actualPrice=' + actualPrice,
          })
        }
      }
    })
  },
  toOrderDetail: function (v) {
    let data = v.currentTarget.dataset.value;
    wx.setStorageSync("currOrder", data);
    wx.navigateTo({
      url: '/pages/ucenter/order-detail/order-detail'
    })
  },
  toComment: function (v) {
    let data = v.currentTarget.dataset.value;
    wx.setStorageSync("currOrder", data);
    wx.navigateTo({
      url: '/pages/ucenter/to-comment/to-comment'
    })
  },
  toExpress: function (v) {
    const id = v.currentTarget.dataset.value.id
    wx.navigateTo({
      url: '/pages/ucenter/express/express?orderId=' + id
    })
  },
  buyAgain: function (e){
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/product/product?id='+this.data.order[index].productList[0].id
    })
  }
})