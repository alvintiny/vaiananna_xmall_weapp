// pages/product/product.js
let WxParse = require("../../lib/wxParse/wxParse.js");
import Toast from '../../lib/vant-weapp/toast/toast';
const db = require('../../utils/db')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    couponShow: false,
    serviceShow: false,
    cartList: [],
    deliveryAddress: {
      address: "北京市东城区东华门街道",
      time: "23:00",
      day: "",
      diff: "明天"
    },
    product: {
      id: '',
      picUrl: '',
      promotion: 0,
      gallery: [],
      title: '',
      description: '',
      defaultPrice: 0,
      price: 0,
      originPrice: 0,
      detail: '',
      tags: [],
      serviceList: [],
      comment: {
        goodCommentRate: 0,
        count: 0,
        goodComment: null
      },
      attribute: []
    },
    recommend: [],
    hot: [],
    sku: {
      show: false,
      noneSku: false,
      quota: 100,
      productId: '',
      picUrl: '',
      specText: '',
      specTextNoCount: '',
      tree: [],
      list: [],
      selectedSku: {},
      count: 1
    },
    couponList: []
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '商品详情',
    })
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate() + 1;
    this.setData({
      'deliveryAddress.day': month + '月' + day + '日'
    })
    this.productId = options.id
    this.loadProduct(options.id)
  },
  loadProduct: function (id) {
    const that = this
    if (!id) {
      return
    }
    Promise.all([
      db.get('product', id),
      db.list('sku_spec', { product_id: id }),
      db.list('sku_spec_value'),
      db.list('sku', { product_id: id }),
      db.list('comment', { product_id: id }),
      db.list('coupon'),
      db.list('product')
    ]).then(function (result) {
      const product = result[0]
      const specs = result[1].slice().sort(function (a, b) {
        return (a.sortOrder || 0) - (b.sortOrder || 0)
      })
      const values = result[2]
      const skus = result[3]
      const comments = result[4]
      const coupons = result[5]
      const products = result[6].filter(function (item) {
        return item.id !== id
      })
      const tree = specs.map(function (spec) {
        return {
          k: spec.name,
          ks: spec.specKey,
          v: values.filter(function (value) {
            return String(value.specId) === String(spec.id)
          }).map(function (value) {
            return {
              id: value.id,
              name: value.name,
              picUrl: value.picUrl || '',
              selected: false,
              disabled: false
            }
          })
        }
      })
      const list = skus.map(function (sku) {
        return {
          id: sku.id,
          price: sku.price,
          s1: sku.s1,
          s2: sku.s2,
          stockNum: sku.stockNum || 0
        }
      })
      const good = comments.filter(function (item) {
        return item.rate >= 4
      })
      const picked = good[0] || comments[0]
      product.gallery = product.gallery && product.gallery.length ? product.gallery : [{ picUrl: product.picUrl, sortOrder: 1 }]
      product.defaultPrice = product.price
      product.originPrice = product.originPrice || product.price
      product.promotion = product.promotion || 0
      product.tags = product.tags || []
      product.serviceList = product.serviceList || []
      product.attribute = product.attribute || []
      product.detail = product.detail || ''
      product.comment = {
        goodCommentRate: comments.length ? Math.round(good.length / comments.length * 100) : 0,
        count: comments.length,
        goodComment: picked ? {
          nickname: picked.nickname,
          avatar: picked.avatar,
          content: picked.content,
          rate: picked.rate,
          time: picked.time,
          spec: picked.spec,
          pics: picked.pics || []
        } : null
      }
      const selectedSku = {}
      tree.forEach(function (item) {
        selectedSku[item.ks] = ''
      })
      if (tree.length === 1 && tree[0].v.length) {
        tree[0].v[0].selected = true
        selectedSku[tree[0].ks] = tree[0].v[0].id
      }
      that.setData({
        product: product,
        sku: Object.assign({}, that.data.sku, {
          productId: id,
          tree: tree,
          list: list,
          selectedSku: selectedSku,
          noneSku: tree.length === 0
        }),
        couponList: coupons.map(function (item) {
          return {
            id: item.id,
            title: item.title,
            time: (item.startTime || '') + '-' + (item.endTime || ''),
            description: item.description,
            discount: item.discount,
            disabled: false,
            showAll: false,
            selected: false,
            get: false,
            mode: 'get',
            status: 0
          }
        }),
        recommend: products.slice(0, 6),
        hot: products.slice(0, 6)
      })
      WxParse.wxParse('productDetail', 'html', product.detail || '', that, 0)
      that.judgeAllItem()
    }).catch(function (err) {
      console.error('商品加载失败', err)
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
  openIndexPage: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  openCoupon: function () {
    this.setData({
      couponShow: true
    })
  },
  closeCoupon: function () {
    this.setData({
      couponShow: false
    })
  },
  openAddress: function () {
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        if(!res.address){
          return;
        }
        that.setData({
          'deliveryAddress.address': res.address
        })
      },
    })
  },
  openService: function () {
    this.setData({
      serviceShow: true
    })
  },
  closeService: function () {
    this.setData({
      serviceShow: false
    })
  },
  openCartPage: function () {
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },
  toComment: function () {
    wx.navigateTo({
      url: '/pages/comment/comment?productId=' + this.data.product.id,
    })
  },
  toProduct: function (e) {
    let id = e.currentTarget.dataset.value.id;
    wx.navigateTo({
      url: '/pages/product/product?id=' + id
    })
  },
  clickTag: function (e) {
    let v = e.currentTarget.dataset.value;
    wx.navigateTo({
      url: '/pages/promotion/promotion?id=' + v.id + '&title=' + v.title
    });
  },
  previewThumb: function (e) {
    wx.previewImage({
      current: this.data.product.picUrl,
      urls: [this.data.product.picUrl]
    })
  },
  showSku: function (e) {
    this.setData({
      'sku.show': true
    })
  },
  closeSku: function (e) {
    this.setData({
      'sku.show': false
    })
  },
  selectSku: function (e) {
    let k = e.currentTarget.dataset.k;
    let v = e.currentTarget.dataset.value;
    let index = e.currentTarget.dataset.index;
    let iindex = e.currentTarget.dataset.iindex;
    if (this.data.sku.tree[index].v[iindex].disabled) {
      return;
    }
    // 勾选或反选 设置属性
    if (!this.data.sku.tree[index].v[iindex].selected) {
      // 勾选 记录
      let s = 'sku.selectedSku.' + k.ks;
      this.setData({
        [s]: v.id
      });
    } else {
      // 反选 删除值
      let s = 'sku.selectedSku.' + k.ks;
      this.setData({
        [s]: ''
      });
    }
    this.setData({
      [`sku.tree[${index}].v[${iindex}].selected`]: !this.data.sku.tree[index].v[iindex].selected
    });
    // 排除该组其他已选项
    let vList = this.data.sku.tree[index].v;
    for (let i = 0; i < vList.length; i++) {
      if (vList[i].id != v.id) {
        this.setData({
          [`sku.tree[${index}].v[${i}].selected`]: false
        })
      }
    }
    this.judgeAllItem();
    // 修改属性图片
    if (index == 0) {
      this.setData({
        'product.picUrl': this.data.sku.tree[0].v[iindex].picUrl
      })
    }
    // 修改选择商品价格信息
    if (this.isAllSelected()) {
      let skuComb = this.getSkuComb();
      this.setData({
        'product.price': skuComb.price
      })
    } else {
      // 恢复默认价格
      this.setData({
        'product.price': this.data.product.defaultPrice
      })
    }
  },
  // 循环判断所有属性是否可选
  judgeAllItem: function () {
    // 判断库存
    let tree = this.data.sku.tree;
    for (let i = 0; i < tree.length; i++) {
      let v = tree[i].v;
      for (let j = 0; j < v.length; j++) {
        if (this.isSkuChoosable(tree[i].ks, v[j].id)) {
          // 可点击
          this.setData({
            [`sku.tree[${i}].v[${j}].disabled`]: false
          })
        } else {
          // 不可点击
          this.setData({
            [`sku.tree[${i}].v[${j}].disabled`]: true
          })
        }
      }
    }
    this.getSelectedText();
  },
  isSkuChoosable: function (ks, vId) {

    let selectedSku = this.data.sku.selectedSku;
    let list = this.data.sku.list;

    // 先假设sku已选中，拼入已选中sku对象中
    let matchedSku = Object.assign({}, selectedSku, {
      [ks]: vId
    });

    // 再判断剩余sku是否全部不可选，若不可选则当前sku不可选中
    let skusToCheck = Object.keys(matchedSku).filter(
      skuKey => matchedSku[skuKey] != ''
    );

    let filteredSku = list.filter(sku => (
      skusToCheck.every(
        skuKey => String(matchedSku[skuKey]) == String(sku[skuKey])
      )
    ));

    let stock = filteredSku.reduce((total, sku) => {
      total += sku.stockNum;
      return total;
    }, 0);
    return stock > 0;
  },
  // 是否所有规格已选
  isAllSelected: function () {
    let selectedSku = this.data.sku.selectedSku;
    let selected = Object.keys(selectedSku).filter(
      skuKeyStr => selectedSku[skuKeyStr] != ""
    );
    return this.data.sku.tree.length == selected.length;
  },
  // 获得已选择的组合
  getSkuComb: function () {
    if (!this.isAllSelected()) {
      return {};
    }
    let selectedSku = this.data.sku.selectedSku;
    let list = this.data.sku.list;
    let skusToCheck = [];
    this.data.sku.tree.forEach(v => {
      skusToCheck.push(v.ks)
    })
    let filteredSku = list.filter(sku => (
      skusToCheck.every(
        skuKey => String(selectedSku[skuKey]) == String(sku[skuKey])
      )
    ));
    return filteredSku[0];
  },
  // 选择属性文字
  getSelectedText: function () {
    let selectedSku = this.data.sku.selectedSku;
    let text = "";
    Object.keys(selectedSku).forEach(
      skuKeyStr => {
        let id = selectedSku[skuKeyStr];
        let tree = this.data.sku.tree;
        for (let i = 0; i < tree.length; i++) {
          let v = tree[i].v;
          for (let j = 0; j < v.length; j++) {
            if (v[j].id == id) {
              text = text + ' ' + v[j].name
            }
          }
        }
      }
    )
    this.setData({
      'sku.specTextNoCount': text
    })
    if (this.isAllSelected()) {
      text = text + ' ×' + this.data.sku.count;
    }
    this.setData({
      'sku.specText': text
    })
  },
  changeCount: function (e) {
    this.setData({
      'sku.count': e.detail.value
    });
    this.getSelectedText();
  },
  // 未选择属性提示
  toChooseTip: function () {
    // 未选择规格属性
    if (!this.data.sku.show) {
      // 未显示选择面板则显示
      this.setData({
        'sku.show': true
      })
      return;
    }
    let selectedSku = this.data.sku.selectedSku;
    let skuNotChoose = Object.keys(selectedSku).filter(
      skuKeyStr => selectedSku[skuKeyStr] == ''
    )[0]
    this.data.sku.tree.forEach(v => {
      if (v.ks == skuNotChoose) {
        Toast("请选择：" + v.k);
      }
    })
  },
  buyNow: function () {
    if (!this.isAllSelected()) {
      // 提示
      this.toChooseTip();
    } else {
      // 下单 判断数量
      let skuComb = this.getSkuComb() || {};
      if (skuComb.stockNum != null && this.data.sku.count > skuComb.stockNum) {
        Toast("库存不足，请减少购买数量");
        return;
      }
      // 跳转checkout页面
      wx.setStorageSync("checkoutProduct", this.data.product);
      wx.setStorageSync("checkoutProductSku", this.data.sku);
      wx.navigateTo({
        url: '/pages/checkout/checkout?from=product',
      })
    }
  },
  addToCart: function () {
    if (!this.isAllSelected()) {
      // 提示
      this.toChooseTip();
    } else {
      // 添加至购物车 判断数量
      const skuComb = this.getSkuComb() || {}
      if (skuComb.stockNum != null && this.data.sku.count > skuComb.stockNum) {
        Toast("库存不足，请减少购买数量");
        return;
      }
      const that = this
      db.add('cart_item', {
        sku_id: skuComb.id || '',
        product_id: this.data.product.id,
        count: this.data.sku.count,
        checked: true,
        title: this.data.product.title,
        pic_url: this.data.product.picUrl,
        spec: this.data.sku.specTextNoCount,
        price: this.data.product.price
      }).then(function (id) {
        const cartList = that.data.cartList.concat([{ id: id }])
        that.setData({
          cartList: cartList
        })
        Toast("加入购物车成功")
      }).catch(function (err) {
        console.error('加入购物车失败', err)
        Toast("加入购物车失败")
      })
    }
  },
  toVip: function(){
    wx.navigateTo({
      url: '/pages/ucenter/vip/vip',
    })
  }
})