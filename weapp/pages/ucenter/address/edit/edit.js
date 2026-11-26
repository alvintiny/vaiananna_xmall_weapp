// pages/address/edit/edit.js
import {
  areaData
} from "../../../../lib/area.js"
import Toast from '../../../../lib/vant-weapp/toast/toast';
const db = require('../../../../utils/db')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {
      id: "",
      name: "",
      mobile: "",
      address: "",
      street: "",
      isDefault: false
    },
    show: false,
    areaList: areaData,
    edit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    wx.setNavigationBarTitle({
      title: '编辑地址',
    })
    if (e.edit == "true") {
      this.setData({
        edit: true,
        'form.id': e.id,
        'form.name': e.name,
        'form.mobile': e.mobile,
        'form.address': e.address,
        'form.street': e.street
      })
    } else if (e.import == "true"){
      this.setData({
        edit: false,
        'form.id': e.id,
        'form.name': e.name,
        'form.mobile': e.mobile,
        'form.address': e.address,
        'form.street': e.street
      })
    }
    if (e.isDefault == "true") {
      this.setData({
        'form.isDefault': true
      })
    } else {
      this.setData({
        'form.isDefault': false
      })
    }
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
  onChangeName: function (e) {
    this.setData({
      'form.name': e.detail
    })
  },
  onChangeMobile: function (e) {
    this.setData({
      'form.mobile': e.detail
    })
  },
  onChangeStreet: function (e) {
    this.setData({
      'form.street': e.detail
    })
  },
  changeDefault: function (e) {
    this.setData({
      'form.isDefault': e.detail
    })
  },
  importAddress: function () {
    let that = this;
    wx.chooseAddress({
      success(res) {
        that.setData({
          'form.name': res.userName,
          'form.mobile': res.telNumber,
          'form.address': res.provinceName + " " + res.cityName + " " + res.countyName,
          'form.street': res.detailInfo
        })
      }
    })
  },
  showSelectAddress: function (e) {
    this.setData({
      show: true
    })
  },
  cancelSelect: function () {
    this.setData({
      show: false
    })
  },
  selectArea: function (e) {
    let v = e.detail.values;
    let data = v[0].name + " " + v[1].name + " " + v[2].name;
    this.setData({
      'form.address': data,
      show: false
    })
  },
  saveAddress: function () {
    const form = this.data.form
    const data = {
      name: form.name,
      mobile: form.mobile,
      address: form.address,
      street: form.street,
      is_default: !!form.isDefault
    }
    const task = this.data.edit && form.id
      ? db.update('address', form.id, data)
      : db.add('address', data)
    task.then(function () {
      Toast.success({
        duration: 0,
        message: '保存成功',
      })
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)
    }).catch(function (err) {
      console.error('地址保存失败', err)
      Toast.fail('保存失败')
    })
  }
})