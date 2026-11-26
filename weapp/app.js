//app.js
const db = require('./utils/db')

App({
  onLaunch: function () {
    db.init()
  },
  globalData: {
    userInfo: {
      nickName: "Hi，游客",
      username: "点击去登录",
      avatarUrl: "/assets/avatar.png"
    },
    token: "",
  }
})