var  mongodb = require('./db');

function Resource(id,timestamp,filename) {
	this.id=id;
	this.timestamp=timestamp;
	this.filename=filename;
}

module.exports = Resource;

Resource.get = function get(resourceID,callback){
	if (!resourceID)
	{
		callback({message:"null id"},null);
		return;
	}

	mongodb.open(function(err,db){
		if (err) {
			mongodb.close();
			return  callback(err);
		}
		db.collection('resources', function(err, collection) {
			if (err) {
				mongodb.close();
				return  callback(err);
			}
			collection.findOne({id:resourceID},function (err, doc) {
				mongodb.close();
				if (err){
					callback(err,null);
					return;
				}

				if (doc)
					callback(null, new Resource(doc.id,null,doc.filename));
				else
					callback({message:"id not found:"+resourceID},null);
			});
		});
	});
};
