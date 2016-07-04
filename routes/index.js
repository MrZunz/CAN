exports.index = function(req, res){
	res.render('layout');
};

exports.pages = function (req, res) {
	var page = req.params.page;

	res.render('pages/' + page);
};

exports.subpages = function (req, res) {
	var page = req.params.page;
	var subpage = req.params.subpage;
	res.render('pages/' + page + "/" + subpage);
};

exports.partials = function (req, res) {
	var name = req.params.name;
	res.render('partials/' + name);
};