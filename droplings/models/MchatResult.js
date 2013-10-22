var  mongodb = require('./db');

function  MchatResult(result) {
	this.data = result;
	//console.log(this.data);
}
module.exports = MchatResult;


MchatResult.prototype.save = function  save(callback) {
	// 存入 Mongodb 的文档
	var data=this.data;
	mongodb.open(function (err, db) {
		if (err) {
			return  callback(err);
		}
		db.collection('mchat', function (err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.insert(data, {safe: true},  function (err) {
				mongodb.close();
				callback(err);
			});
		});

	});
};

MchatResult.getCount=function (callback){
	mongodb.open(function (err, db) {
		if (err) {
			return  callback(err);
		}
		db.collection('mchat', function (err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.count({}, function(err, count){
				mongodb.close();
				callback(err,count);
			});
		});

	});
};

MchatResult.getRange=function(limit,skip,callback){
	mongodb.open(function (err, db) {
		if (err) {
			return  callback(err);
		}
		db.collection('mchat', function (err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.find(null, {_id: 0}).limit(limit).skip(skip).toArray(function(err, docs){
				mongodb.close();
				if (err || !docs){
					callback(err,null);
					return;
				}

				var data=[];
				docs.forEach(function(doc,index){
					data.push(doc);
				});
				callback(null, data);
			});
		});

	});
};