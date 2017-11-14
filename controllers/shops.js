const Shop = require('../models/shop');

function shopsIndex(req, res) {
  Shop
    .find()
    .populate('createdBy')
    .exec()
    .then(shops => res.status(200).json(shops))
    .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
}

function shopsShow(req, res) {
  Shop
    .findById(req.params.id)
    .populate('createdBy comments.createdBy')
    .exec()
    .then(shop => {
      if (!shop) return res.status(404).json({ message: 'Shop not found.' });
      return res.status(200).json(shop);
    })
    .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
}

function shopsCreate(req, res) {
  // console.log('hitting');
  req.body.createdBy = req.user.userId;

  Shop
    .create(req.body)
    .then(shop => res.status(201).json(shop))
    .catch(err => console.log(err));
}

function shopsUpdate(req, res, next) {
  Shop
    // .findByIdAndUpdate(req.params.id, req.body.shop, { new: true, runValidators: true })
    // .exec()
    // .then(shop => {
    //   if (!shop) return res.status(404).json({ message: 'Shop not found.' });
    //   return res.status(200).json({ shop });
    // })
    // .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
    .findById(req.params.id)
    .exec()
    .then((shop) => {
      if(!shop) return res.redirect();
      if(!shop.belongsTo(req.user)) return res.unauthorized(`/shops/${shop.id}`, 'You do not have permission to edit this shop');
      return res.status(200).json(shop);
      // return res.render('shops/edit', { shop });
    })
    .catch(next);
}

function shopsDelete(req, res) {
  Shop
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(shop => {
      if (!shop) return res.status(404).json({ message: 'Shop not found.' });
      return res.sendStatus(204);
    })
    .catch(() => res.status(500).json({ message: 'Something went wrong.' }));
}

function createCommentRoute(req, res, next) {
  Shop
    .findById(req.params.id)
    .exec()
    .then(shop => {
      if (!shop) return res.notFound();

      req.body.createdBy = req.user;
      shop.comments.push(req.body);
      shop.save();

      return res.status(201).json(shop);
    })
    .catch(next);
}

function deleteCommentRoute(req, res, next) {
  Shop
    .findById(req.params.id)
    .exec()
    .then(shop => {
      if (!shop) return res.notFound();
      if (!shop.belongsTo(req.shop)) return res.unauthorized('You do not have permission to delete that resource');
      shop.comments.id(req.params.commentId).remove();
      shop.save();

      return res.status(200).json({ message: 'comment was deleted.'});
    })
    .catch(next);
}

module.exports = {
  index: shopsIndex,
  show: shopsShow,
  update: shopsUpdate,
  delete: shopsDelete,
  create: shopsCreate,
  createComment: createCommentRoute,
  deleteComment: deleteCommentRoute
};
