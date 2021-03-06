const Shop = require('../models/shop');

function shopsIndex(req, res) {
  Shop.find()
    .populate('createdBy')
    .exec()
    .then(shops => res.status(200).json(shops))
    .catch(() => res.status(500).json({ message: 'Oh no! Something went wrong! Please try again!' }));
}

function shopsShow(req, res) {
  Shop.findById(req.params.id)
    .populate('createdBy comments.createdBy')
    .exec()
    .then(shop => {
      if (!shop) return res.status(404).json({ message: 'Shop not found.' });
      return res.status(200).json(shop);
    })
    .catch(() => res.status(500).json({ message: 'Oh no! Something went wrong! Please try again!' }));
}

function shopsCreate(req, res) {
  req.body.createdBy = req.user;

  Shop.create(req.body)
    .then(shop => res.status(201).json(shop))
    .catch(err => console.log(err));
}

function shopsUpdate(req, res, next) {
  Shop.findByIdAndUpdate(req.params.id, req.body)
    .exec()
    .then(shop => {
      return res.status(200).json(shop);
    })
    .catch(next);
}

function shopsDelete(req, res) {
  Shop.findByIdAndRemove(req.params.id)
    .exec()
    .then(shop => {
      if (!shop) return res.status(404).json({ message: 'We could not find the Shop. Please try again!' });
      return res.sendStatus(204);
    })
    .catch(() => res.status(500).json({ message: 'Oh no! Something went wrong! Please try again!' }));
}

function createCommentRoute(req, res, next) {
  Shop.findById(req.params.id)
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
  Shop.findById(req.params.id)
    .exec()
    .then(shop => {
      if (!shop) return res.notFound();
      const comment = shop.comments.id(req.params.commentId);
      comment.remove();
      shop.save();
      return res.status(200).json({ message: 'Your comment was successfully deleted. Please leave another again soon!'});
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
