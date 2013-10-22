var  mongodb = require('./db');
var Resource=require('./Resource');

function  Manifest(user) {
	this.user= user;
	this.resources= [];
}

module.exports = Manifest;

Manifest.get = function get(username,callback){
	if (!username)
	{
		callback({message:"null username"},null);
		return;
	}

	mongodb.open(function(err,db){
		if (err) {
			mongodb.close();
			return  callback(err);
		}
		db.collection('manifest', function(err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.find({user:username}).toArray(function (err, docs) {
				mongodb.close();
				if (err || !docs){
					callback(err,null);
					return;
				}

				var manifest=new Manifest(username);
				docs.forEach(function(doc,index){
					manifest.resources.push(new Resource(doc.resource,doc.timestamp));
				});
				callback(null, manifest);
			});
		});
	});
};
