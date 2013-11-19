var  mongodb = require('./db');

function  Message(m) {
	this.message = m.message;
}
module.exports = Message;


Message.get =  function  get(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return  callback(err);
		}
		// 读取 users 集合
		db.collection('testdata', function(err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			// 查找 name  属性为 username 的文档
			collection.findOne({},  function (err, doc) {
				mongodb.close();
				if (doc) {
					//  封装文档为 User 对象
					var  message =  new  Message(doc);
					callback(err, message);
				} else {
					callback(err, null);
				}
			});
		});
	});
};