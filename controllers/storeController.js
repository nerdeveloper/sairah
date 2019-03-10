exports.homePage = (req,res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add store'});
};

exports.createStore = (req, res) => {
    res.json(req.body);
};
