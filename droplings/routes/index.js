var settings=require('../settings.js');
//mvp
var crypto = require('crypto');
var User = require("../models/user.js");
var Card = require("../models/card.js");
var CardTree = require("../models/cardTree.js");
var uuid = require('../libs/uuid.js');

module.exports = function (app) {
	//mvp
	//user
	app.get('/mvp/user/login',function(req,res){
		res.render('mvp/user/login.ejs');
	});

    //此处点击了登录按钮
	app.post('/mvp/user/login',function(req,res){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		User.get(req.body.username, function(err, user) {
			if (!user) {
				req.flash('error', '用户 \''+req.body.username+'\' 不存在。');
				res.redirect('/mvp/user/login');
                return;
			}
			if (user.password != password) {
				req.flash('error', '用户名或密码错误。');
				res.redirect('/mvp/user/login');
				return;
			}
			req.session.user = user;
			req.flash('success', '登录成功。');
			res.redirect('/mvp/parents/index');
		});
	});

	app.get('/mvp/user/register',function(req,res){
		res.render('mvp/user/register.ejs');
	});

	app.post('/mvp/user/register', function (req, res) {
		//检验用户两次输入的口令是否一致
		if (req.body['password'].length<6) {
			req.flash('error', '密码太短 (最少6个字符)。');
			res.redirect('/mvp/user/register');
			return;
		}

		if (req.body['passwordrepeat'] != req.body['password']) {
			req.flash('error', '确认密码与密码不一致。');
			res.redirect('/mvp/user/register');
			return;
		}

		//生成口令的散列值
		var  md5 = crypto.createHash('md5');
		var  password = md5.update(req.body.password).digest('base64');

		var  newUser =  new  User({
			name: req.body.username,
			password: password,
			uuid: Math.uuid()
		});

		//检查用户名是否已经存在
		User.get(newUser.name, function (err, user) {
			if (user)
				err = '用户名已经存在。';
			if (err) {   //err为true 说明不存在  可以创建用户名
				req.flash('error', err);
				res.redirect('/mvp/user/register');
				return;
			}
			// 如果不存在则新增用户
			newUser.save(function (err) {
				if (err) {
					req.flash('error', err);
					res.redirect('/mvp/user/register');
					return;
				}
				req.session.user = newUser;
				req.flash('success', '成功注册');
				res.redirect('/mvp/user/login');
			});
		});
	});

	app.get('/mvp/parents/index', function (req, res) {
		var cardid=req.query.category;
		if (!cardid){
			res.redirect('/mvp/parents/index?category='+req.session.user.uuid);
		}
		gridView(cardid,req.session.user.uuid,function(cards){
			res.render('mvp/parents/index.ejs',{category:cardid,cards:cards,cardnum:12});
		});
	});

	app.get('/mvp/parents/newcard',function (req,res){
		res.render('mvp/parents/newcard.ejs');
	});

	app.post('/mvp/parents/newcard', function (req, res) {
		if (req.body['name'].length==0) {
			req.flash('error', '显示文字不能为空');
			res.redirect('/mvp/parents/newcard');
			return;
		}

		if (req.body['name'].length>6) {
			req.flash('error', '显示文字不能超过6个字');
			res.redirect('/mvp/parents/newcard');
			return;
		}

		var tmpPath=req.files.imagefile.path;
		console.log(tmpPath);
		var image=Math.uuid();
		var imagepath = "droplings\\public\\mvp\\resource\\image\\"+image;
		fs.rename(tmpPath, imagepath , function(err) {
			if(err){
				throw err;
			}
			//删除临时文件
			fs.unlink(tmpPath, function(){
				if(err) {
					throw err;
				}
			});
		});

		tmpPath=req.files.audiofile.path;
		var audio=Math.uuid();
		var audiopath = "droplings\\public\\mvp\\resource\\audio\\"+audio;
		fs.rename(tmpPath, audiopath , function(err) {
			if(err){
				throw err;
			}
			fs.unlink(tmpPath, function(){
				if(err) {
					throw err;
				}
			});
		});

		var  newCard =  new Card({
			name: req.body.name,
			type: req.body.type,
			id: Math.uuid(),
			user: req.session.user.name,
			image: image,
			audio: audio
		});

		newCard.save(function (err) {
			if (err) {
				req.flash('error', err);
				res.redirect('/mvp/parents/newcard');
				return;
			}
			req.flash('success', '新建成功');
			res.redirect('/mvp/parents/newcard');
		});
	});

	app.get('/mvp/child/index',function(req,res){
		res.redirect("/mvp/child/"+req.session.user.uuid);
	});

	app.get('/mvp/child/:cardid',function(req,res){
		gridView(req.params.cardid,req.session.user.uuid,function(cards){
			res.render("mvp/child/index.ejs",{cards:cards});
		});
	});

	function gridView(cardid,rootid,callback){
		CardTree.getChildren(cardid,function(err,children){
			var cards=[],i=0;

			if (cardid!=rootid){
				cards[0]=new Card({
					name:"返回",
					type:"category",
					id:rootid
				});
			}
			var loop=function(err,card){
				cards[i]=card;
				i++;
				while(i<children.length && !children[i])
					i++;
				if (children[i]){
					Card.get(children[i],loop);
					return;
				}
				callback(cards);
			};
			while(i<children.length && !children[i])
				i++;
			if (children[i])
				Card.get(children[i],loop);
			else
				callback(cards);
		});
	}

	app.get('/mvp/parents/replace',function(req,res){
		var cardid=req.query.category;
		var position=req.query.position;
		if (!cardid || !position){
			res.redirect('/mvp/parents/index');
		    return;
		}
		Card.getAll(req.session.user.name,function(err,cards){
			res.render('mvp/parents/replace.ejs',{cards:cards});
		});
	});

	app.post('/mvp/parents/replace',function(req,res){
		var cardid=req.query.category;
		var position=req.query.position;
		if (!cardid || !position || !req.body.selected){
			res.redirect('/mvp/parents/index');
			return;
		}
		var newCardTree=new CardTree({
			parent:cardid,
			child:req.body.selected,
			position:req.query.position});
		newCardTree.upsert(function(err){
			if (err) {
				req.flash('error', err);
				res.redirect('/mvp/parents/index?category='+cardid);
				return;
			}
			req.flash('success', '替换成功');
			res.redirect('/mvp/parents/index?category='+cardid);
		});

	});
};
