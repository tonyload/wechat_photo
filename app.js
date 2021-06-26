import SERVER from "./server/index"
import Store from './reducers/index'
App({
  Store,
  onLaunch() {
    wx.showLoading({ title: 'loading...', mask: true })
    let session_key;
    try {
      session_key = wx.getStorageSync(SERVER.SESSION_KEY)
    } catch (e) {
      console.log('[获取登录key-value失败' + JSON.stringify(e))
    }
    if (!session_key) {
      console.log('token为空，获取token并登录');
      this._login()
    } else {
      console.log('token存在，进行验证 -> ' + session_key);
      this.getUserInfo();
    }
  },
  getUserInfo(){
    SERVER.getCurrentUserInfo().then(response => {
      console.log('token验证成功,并获取用户信息 -> ' + JSON.stringify(response.data))
      Store.dispatch({ type: "MODIFY_USER", data: response.data })
      wx.hideLoading()
    }).catch(e=>{
        console.log('token验证出错，移除token后重新登陆 -> ' + wx.getStorageSync(SERVER.SESSION_KEY));
        wx.removeStorage({ key: SERVER.SESSION_KEY })
    })
  },
  _login() {// 登录/注册，并获取当前用户信息
    let self =this
    wx.login({
      complete: (res) => {
        if (res.code) {
          SERVER.login(res.code).then(response => {
            const { data } = response.data
            console.log('登陆成功，记录新token -> ' + data.sessionKey)
            wx.setStorageSync(SERVER.SESSION_KEY, data.sessionKey)
            self.getUserInfo();
          })
        }
      }
    })
    

  },
  globalData: {
    userInfo: null
  }
})
