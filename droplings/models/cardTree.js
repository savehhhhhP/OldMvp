var mongodb = require('./db');

//create table card_tree(child varchar(36), parent varchar(36), position int);
function  CardTree(card) {
	this.parent = card.parent;
	this.child = card.child;
	this.position = card.position;
}
module.exports =CardTree;

CardTree.prototype.save = function  save(callback) {
	// 存入 Mongodb 的文档
	var  cardtree = this;
	mongodb.open(function (err, db) {
		if (err) {
			callback(err);
			return;
		}
		db.collection('mvpcardtree', function (err, collection) {
			if (err) {
				mongodb.close();
				callback(err);
				return;
			}
			collection.ensureIndex({parent:1,position:1}, {unique:  true},function (err, inserted) {});
			collection.insert(cardtree, {safe: true},  function (err, cardtree) {
				mongodb.close();
				callback(err, cardtree);
			});
		});
	});
};

CardTree.getChildren = function get(parent, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			callback(err);
		    return;
		}
		db.collection('mvpcardtree', function(err, collection) {
			if (err) {
				mongodb.close();
				callback(err);
				return;
			}
			var cardtree=[];
			collection.find({parent:parent}).toArray( function (err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}
				docs.forEach(function (doc) {
					cardtree[doc.position]=doc.child;
				});
				callback(null, cardtree);
			});
		});
	});
};

CardTree.prototype.upsert = function upsert(callback) {
	var cardTree=this;
	mongodb.open(function(err, db) {
		if (err) {
			callback(err);
			return;
		}
		db.collection('mvpcardtree', function(err, collection) {
			if (err) {
				mongodb.close();
				callback(err);
				return;
			}
			collection.update(
				{parent:cardTree.parent,position:parseInt(cardTree.position)},
				{$set:{child:cardTree.child}},{upsert:true},function(err){
					mongodb.close();
					if (err) {
						callback(err);
					}else{
						callback(null);
					}
			});
		});
	});
};
