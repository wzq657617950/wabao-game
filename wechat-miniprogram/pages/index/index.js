Page({
  data: {
    gameUrl: ""
  },
  onLoad() {
    const configuredUrl = wx.getStorageSync('game_url');
    const gameUrl = configuredUrl || "http://127.0.0.1:3000/";
    this.setData({ gameUrl });
  },
})
