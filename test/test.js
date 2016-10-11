var __dirname = "components/city-selector/page";
var __overwrite = require("../../../utils/overwrite.js");

// 为数据分段，3个一段
function subsection(list){
	if(list){
		return new Array(Math.ceil(list.length / 3) + 1).join("|").split("").map(function(item, index){
			var items = list.slice(index * 3, index * 3 + 3);
			var count = items.length;
			if(count !== 3){
				items.length = 3;
				for(; count < 3; count ++){
					items[count] = null;
				}
				//items.fill(null, count, 3);
			}
			return items;
		});
	}else{
		return null;
	}
}

var CITY_SELECT_HISTORY_STORAGE_KEY = "city-select-history-storage-key";

(function(require, Page){
	var api = require("utils/api")(__dirname);
	var CityService = require("service/city");

	function getHistory(callback){
		api.Storage.get({
			key: CITY_SELECT_HISTORY_STORAGE_KEY,
			success: function(result){
				callback(result.data || []);
			},
			fail: function(e){
				callback([]);
			}
		});
	}

	function addHistory(item, callback){
		getHistory(function(list){
			list = list.filter(function(_item){
				return _item.cityId !== item.cityId;
			});
			list.unshift(item);
			api.Storage.set({
				key: CITY_SELECT_HISTORY_STORAGE_KEY,
				data: list,
				success: callback
			});
		});
	}

	Page({
		data: {
			hots: [],
			historys: [],
			letters: "ABCDEFGHJKLMNPQRSTWXYZ".split(""),
			indexs: {},
			unfoldKey: "",
			searchKey: "",
			inputing: false,
			suggestItems: [],
			selectedCityId: 0,
			scrollTop: 0
		},
		onLoad: function(options){
			this.setData({
				selectedCityId: options.cityId
			});
			
			this._tapLetter("A");
			if(options.hotCitys){
				this.setData({
					hots: subsection(options.hotCitys)
				});
			}else{
				this.loadHot();
			}
			this.loadHistory();
		},
		onShow: function(){
		},
		loadHistory: function(){
			getHistory(function(data){
				this.setData({
					historys: subsection(data)
				});
			}.bind(this));
		},
		clearHistory: function(){
			api.Storage.set({
				key: CITY_SELECT_HISTORY_STORAGE_KEY,
				data: [],
				success: function(){
					this.loadHistory();
				}.bind(this)
			});
		},
		loadHot: function(){
			CityService.Hot().then(function(data){
				this.setData({
					hots: subsection(data)
				})
			}.bind(this));
		},
		loadLetter: function(letter){
			CityService.Letter(letter).then(function(data){
				var changeData = {
					indexs: {}
				};
				changeData.indexs[letter] = data;
				this.setData(changeData);
			}.bind(this));
		},
		_tapLetter: function(letter){
			this.setData({
				unfoldKey: this.data.unfoldKey === letter ? "" : letter
			});
			this.loadLetter(letter);
		},
		tapLetter: function(e){
			var letter = e.currentTarget.dataset.letter;
			this._tapLetter(letter);
			this.setData({
				scrollTop: e.currentTarget.offsetTop
			});
		},
		selectCity: function(e){
			var city = {
				cityId: e.currentTarget.dataset.cityid,
				cityName: e.currentTarget.dataset.cityname
			};
			addHistory(city, function(){
				this.loadHistory();
			}.bind(this));

			this.fireEvent("select", {
				type: "city",
				value: city
			});
			api.Navigate.back();
		},
		selectCurrent: function(){
			api.Location.get({
				success: function(result){
					this.fireEvent("select", {
						type: "location",
						value: result
					});
					api.Navigate.back();
				}.bind(this),
				fail: function(e){
					console.log(e);
				}
			})
		},
		selectPosition: function(e){
			var index = e.currentTarget.dataset.index;
			var data = this.data.suggestItems[index];

			if(data.regionType == 0){
				this.fireEvent("select", {
					type: "city",
					value: {
						cityId: data.cityId,
						cityName: data.cityName
					}
				});
			}else{
				this.fireEvent("select", {
					type: "suggest",
					value: data
				});
			}
			api.Navigate.back();

			addHistory({
				cityId: data.cityId,
				cityName: data.cityName
			}, function(){
				this.loadHistory();
			}.bind(this));

			this.closeSuggest();
		},
		inputBind: function(e){
			var value = e.detail.value;
			this.setData({
				searchKey: value
			});
			CityService.Suggest(value).then(function(data){
				this.setData({
					suggestItems: data || []
				})
			}.bind(this));
		},
		openSuggest: function(){
			this.setData({
				inputing: true
			});
		},
		closeSuggest: function(){
			this.setData({
				inputing: false,
				searchKey: ""
			});
		}
	});
})(__overwrite.require(require, __dirname), __overwrite.Page);
