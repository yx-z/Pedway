'use strict';

exports.getAllData = function(model) {
  return (req, res) => {
    model.find({}, function(err, data) {
      if (err) {
        res.send(err);
      } else {
        res.json(data);
      }
    });
  };
};

exports.createData = function(Model) {
  return (req, res) => {
    const instance = new Model(req.body);
    instance.save(function(err, data) {
      if (err) {
        res.send(err);
      } else {
        res.json(data);
      }
    });
  };
};
