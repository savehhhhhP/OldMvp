var mongodb = require('./db');
var uuid=require('../libs/uuid.js');

//create table card(id varchar(36) primary key,type varchar(8),name varchar(64),image var(36),audio varchar(36),
// user varchar(36));
function  Card(card) {
	this.id = card.id;
	this.type = card.type;
	this.name = card.name;
	this.image = card.image;
	this.audio = card.audio;
	this.user = card.user;
}
module.exports =Card;

Card.prototype.save = function  save(callback) {
	// 存入 Mongodb 的文档
	var  card = this;
	mongodb.open(function (err, db) {
		if (err) {
			return  callback(err);
		}
		db.collection('mvpcards', function (err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.ensureIndex('id', {unique:  true},function (err, inserted) {});
			collection.insert(card, {safe: true},  function (err, user) {
				mongodb.close();
				callback(err, user);
			});
		});

	});
};

Card.get = function get(id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return  callback(err);
		}
		db.collection('mvpcards', function(err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.findOne({id:id},  function (err, doc) {
				mongodb.close();
				if (doc) {
					var card =  new Card(doc);
					callback(err, card);
				} else {
					callback(err, null);
				}
			});
		});
	});
};

Card.getAll = function getAll(user, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			callback(err);
			return;
		}
		db.collection('mvpcards', function(err, collection) {
			if (err) {
				mongodb.close();
				callback(err);
				return;
			}
			var cards=[];
			collection.find({user:user}).toArray( function (err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				docs.forEach(function (doc) {
					cards.push(new Card(doc));
				});
				callback(null, cards);
			});
		});
	});
};

