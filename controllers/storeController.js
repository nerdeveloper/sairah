exports.homePage = (req,res) => {
    res.render('index');
};

exports.addStore = (req, res) => {
    res.render('editStore');
};
