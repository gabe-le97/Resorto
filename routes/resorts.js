var express = require("express");
var router  = express.Router();
var Resort = require("../models/resort");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var { isLoggedIn, checkUserResort, checkUserComment, isAdmin, isSafe } = middleware;

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// INDEX - show all resorts
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all resorts from DB
      Resort.find({name: regex}, function(err, allResorts){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allResorts);
         }
      });
  } else {
      // Get all resorts from DB
      Resort.find({}, function(err, allResorts){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allResorts);
            } else {
              res.render("resorts/index",{resorts: allResorts, page: 'resorts'});
            }
         }
      });
  }
});

// CREATE - add new resort to DB
router.post("/", isLoggedIn, isSafe, function(req, res){
  // get data from form and add to resorts array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newResort = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // create a new resort and save to DB
    Resort.create(newResort, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            // redirect back to resorts page
            console.log(newlyCreated);
            res.redirect("/resorts");
        }
    });
  });
});

// NEW - show form to create new resort
router.get("/new", isLoggedIn, function(req, res){
   res.render("resorts/new"); 
});

// SHOW - shows more info about one resort
router.get("/:id", function(req, res){
    // find the resort with provided ID
    Resort.findById(req.params.id).populate("comments").exec(function(err, foundResort){
        if(err || !foundResort){
            console.log(err);
            req.flash('error', 'Sorry, that resort does not exist!');
            return res.redirect('/resorts');
        }
        console.log(foundResort)
        // render show template with that resort
        res.render("resorts/show", {resort: foundResort});
    });
});

// EDIT - shows edit form for a resort
router.get("/:id/edit", isLoggedIn, checkUserResort, function(req, res){
  // render edit template with that resort
  res.render("resorts/edit", {resort: req.resort});
});

// PUT - updates resort in the database
router.put("/:id", isSafe, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
    Resort.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, resort){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/resorts/" + resort._id);
        }
    });
  });
});

// DELETE - removes resort and its comments from the database
router.delete("/:id", isLoggedIn, checkUserResort, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.resort.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.resort.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Resort deleted!');
            res.redirect('/resorts');
          });
      }
    })
});

module.exports = router;

