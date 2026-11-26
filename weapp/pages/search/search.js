// pages/search/search.js
import Toast from '../../lib/vant-weapp/toast/toast';
const db = require('../../utils/db')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: "",
    searchStatus: false,
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
    history: [],
    hot: [],
    result: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '搜索',
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

    // 加载历史搜索词
    this.getHistory();
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
  onSearch: function (e) {
    if (!e.detail) {
      Toast('请输入搜索关键词');
      return;
    }
    Toast.loading({
      message: '加载中...',
      duration: 0
    });
    const that = this
    db.list('product', {
      title: db.regexp(e.detail)
    }).then(function (list) {
      Toast.clear()
      that.setData({
        value: e.detail,
        searchStatus: true,
        result: list
      })
    }).catch(function (err) {
      Toast.clear()
      console.error('搜索失败', err)
    })
    this.setHistory(e.detail)
  },
  setHistory(v) {
    let history = wx.getStorageSync('historyKeyword');
    if (!history) {
      history = []
    }
    if (history.indexOf(v) >= 0) {
      // 去重
      return;
    }
    history.push(v);
    wx.setStorageSync('historyKeyword', history);
  },
  getHistory() {
    let history = wx.getStorageSync('historyKeyword');
    if (!history) {
      return;
    }
    this.setData({
      history: history
    })
  },
  onCancel: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  onClear: function () {
    this.setData({
      value: "",
      searchStatus: false
    })
  },
  clearHistory: function () {
    this.setData({
      history: []
    })
    wx.setStorageSync('historyKeyword', []);
  },
  clickTag: function (e) {
    const data = e.currentTarget.dataset.value
    const keyword = data.title || data
    this.onSearch({ detail: keyword })
  },
  onFilterChange: function (e) {
    let price = e.detail.checkedValues[1];
    if (price == 1) {
      let data = this.data.result;
      data.sort(function (a, b) {
        return a.price - b.price
      });
      this.setData({
        result: data
      })
    } else if (price == -1) {
      let data = this.data.result;
      data.sort(function (a, b) {
        return b.price - a.price
      });
      this.setData({
        result: data
      })
    } else {
      let data = this.data.result;
      data.sort(function (a, b) {
        return a.id - b.id
      });
      this.setData({
        result: data
      })
    }
  },
  handleClick: function (e) {
    let id = e.currentTarget.dataset.value.id;
    wx.navigateTo({
      url: '/pages/product/product?id=' + id
    });
  },
  scrollListen: function (e) {
    console.log("滑到底部啦 该加载下一页数据啦")
  }
})