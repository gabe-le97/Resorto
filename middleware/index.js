var Comment = require('../models/comment');
var Resort = require('../models/resort');

module.exports = {
  // checks if a user is signed in (to post, comment, etc) 
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in!');
      res.redirect('/login');
  },
  // checks if the user wants to edit their resort
  checkUserResort: function(req, res, next){
    Resort.findById(req.params.id, function(err, foundResort){
      if(err || !foundResort){
          console.log(err);
          req.flash('error', 'That resort does not exist');
          res.redirect('/resorts');
      } else if(foundResort.author.id.equals(req.user._id) || req.user.isAdmin){
          req.resort = foundResort;
          next();
      } else {
          req.flash('error', 'Unauthorized Permission');
          res.redirect('/resorts/' + req.params.id);
      }
    });
  },
  // only allow users to edit their own comments 
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/resorts');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'Unauthorized permission');
           res.redirect('/resorts/' + req.params.id);
       }
    });
  },
  // only administrators can edit anything on the site
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is read only');
      res.redirect('back');
    }
  },
  // proceeed if we have no problems
  isSafe: function(req, res, next) {
      next();
  }
}