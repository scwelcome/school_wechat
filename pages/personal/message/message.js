const util = require('./../../../utils/util.js');
const http = require("./../../../utils/http.js");
const app = getApp();

Page({
  data: {
image:'tmp/wx46d5674c81153f30.o6zAJs3oh85Zb1lJE8oWix57vny0.2b862a6493fd893b7fbc37bd8dfd424f.jpg',
    baseImageUrl: app.globalData.imageUrl,
    serviceId:0,
    messageList:[],
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false,
    param: app.globalData.param,
    selectPoster:2,
    friendId: '',
    friends: [],
    user:{"personal_signature":""}
  },
  onLoad: function (option) {
    let objType = option.type;
    let messageType = option.new_message;
    let selectType = option.t
    this.setData({selectPoster:selectType})
    this.getPersonalInfo()
    this.friends();
    this.getInboxList(objType, messageType);
    this.setData({ param: app.globalData.param })
    this.getService()
  },

 /**
   * 获取客服id
   */
  getService: function () {
    http.get(`/service`, {}, res => {
      this.setData({
        serviceId: res.data.data
      });
    });
  },

    /**
   * 进入建议留言列表
   */
  openSugesstion: function () {
    let id = this.data.serviceId;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },

  getTextContent:function(e){
    let user = this.data.user
    user.personal_signature = e.detail.value
    this.setData({"user":user})
  },

  signatureSave:function(){
    wx.showLoading({
      title: '提交中...',
    });
    let that = this
    http.post('/user/update/signature', {signature: this.data.user.personal_signature,}, res => {
      wx.hideLoading();
      if(res.data.error_code == 0){
        wx.setStorageSync('user', that.data.user);
        wx.showToast({
          title: "保存成功",
          icon:'none'
        });
      }else{
        wx.showToast({
          title: res.data.error_message,
          icon:'none'
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 1500)
      }
    });
  },

    /**
   * 获取个人信息
   */
  getPersonalInfo() {
    http.get(`/personal_info`, {}, res => {
      this.setData({
        user: res.data.data
      })
      wx.setStorageSync('user', res.data.data);
    });
  },

  switch:function(e){
      let objType = e.target.dataset.type;
      this.setData({
        selectPoster:objType
      })
  },

    /**
   * 好友列表
   */
  friends:function(){
    let _this = this;
    http.get(`/friends`,
      {},
      function (res) {
        _this.setData({
          friends: res.data.data
        })
      });
  },
  /**
   * 跳转私信
   */
  letter: function (e) {
    let id = e.currentTarget.dataset.obj;
    wx.navigateTo({
      url: '/pages/personal/letter/letter?friend_id=' + id
    })
  },

  /**
   * 获取消息列表
   */
  getInboxList: function (type, messageType){
    let _this = this;
    let message_type = messageType;
    http.get(`/user/${type}/inbox/${message_type}?page_size=${this.data.pageSize}&page_number=${this.data.pageNumber}`,{}, function (res){
       _this.setData({
         showGeMoreLoadin: false
       });
      let inboxs = res.data.data.page_data;
      let messageList = _this.data.messageList;
      if (inboxs.length == 0){
        _this.setData({
          notDataTips: true
        });
      }
      inboxs.map(item=>{
        messageList.push(item);
      });

      _this.setData({
        messageList: messageList,
        pageNumber: _this.data.pageNumber + 1,
      });
    });
  },
  /**
  * 上拉加载跟多
  */
  onReachBottom: function () {
    this.getInboxList();
    this.setData({
      showGeMoreLoadin: true
    });
  },
  /**
   * 打开详情
   */
  opendDetail:function(e){
    let objType = e.currentTarget.dataset.type;
    let objid = e.currentTarget.dataset.objid;
    let id = e.currentTarget.dataset.id;
    let parent = e.currentTarget.dataset.parent;
    let pobj = e.currentTarget.dataset.pobj;

    let chat = e.currentTarget.dataset.chat;
    let uid = e.currentTarget.dataset.uid;
    if (chat == 6) {
      wx.navigateTo({
        url: '/pages/personal/letter/letter?friend_id=' + uid
      })
    }

    if (parent == null){
      return;
    }

    if (chat == 7) {
      wx.navigateTo({
        url: `/pages/help/help_single/help_single?id=${objid}`
      })
      return false;
    }

    if (objType == 1){
        wx.navigateTo({
          url: `/pages/home/post_detail/post_detail?id=${id}`
        })
        return false;
    }

    if (objType == 2) {
      wx.navigateTo({
        url: `/pages/sale/comment_sale/comment_sale?id=${id}`
      })
      return false;
    }

    if (objType == 3) {
      wx.navigateTo({
        url: `/pages/match/match_detail/match_detail?id=${id}`
      })
      return false;
    }

    if (parent.obj_type == 5){
      wx.navigateTo({
        url: '/pages/home/topic_detail/topic_detail?id=' + pobj
      })
      return false;
    }
    
    if (objType == 4) {
        wx.navigateTo({
          url: `/pages/sale/comment_sale/comment_sale?id=${pobj}`
        })
        return false;
    }
  }
})
