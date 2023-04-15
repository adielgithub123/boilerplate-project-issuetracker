'use strict';
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(console.log("Berhasil konek database"))
  .catch(error => console.log(error))

const issueSchema = mongoose.Schema(
  {
    project: String,
    issue_title: String,
    issue_text: String,
    created_on: {
      type: Date,
      default: Date.now()
    },
    updated_on: {
      type: Date,
      default: Date.now
    },
    created_by: String,
    assigned_to: String,
    open: {
      type: Boolean,
      default: true
    },
    status_text: String
  },
  { versionKey: false }
);
const Issue = mongoose.model('Issue', issueSchema);

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(function(req, res) {
      let project = req.params.project;
      Issue.find({
        project: project,
        ...req.query
      })
        .select('-project')
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send('Internal Server Error');
        });
    })

    .post(function(req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (issue_title == null || issue_text == null) {
        res.send({ "error": "required field(s) missing" })
      }
      else {
        Issue.create({
          project: project,
          issue_title: req.body.issue_title || "",
          issue_text: req.body.issue_text || "",
          created_on: req.body.createdAt || Date.now(),
          updated_on: req.body.updatedAt || Date.now(),
          created_by: req.body.created_by || "",
          assigned_to: req.body.assigned_to || "",
          open: req.body.open || true,
          status_text: req.body.status_text || ""
        })
          .then(data => {
            // console.log(data)
            res.status(201).send(data)
          })
          .catch(err => console.log(err));

      }
      // res.status(201).send('Good');
    })

    .put(function(req, res) {
      let project = req.params.project;
      let { _id } = req.body;
      let body_update = {...req.body};
      body_update['updated_on'] = Date.now();
      delete body_update["_id"];
      if (_id == null) {
        res.send({ "error": "missing _id" })
      }
      else if (Object.keys(req.body).length == 1) {
        res.send({ "error": "no update field(s) sent", "_id": _id })
      }
      else {
        // console.log(_id)
        // console.log(body_update)
        if (mongoose.Types.ObjectId.isValid(_id)) {
          Issue.findByIdAndUpdate({_id: _id}, body_update)
            .then((updatedIssue) => {
              // console.log(updatedIssue)
              if(updatedIssue===null){
                res.send({ "error": "could not update", "_id": _id })
              }
              else{
                res.send({
                  "result": "successfully updated",
                  "_id": _id
                })
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
            res.send({ "error": "could not update", "_id": _id })
        }
      }

    })

    .delete(function(req, res) {
      let project = req.params.project;
      let { _id } = req.body;

      if (_id == null) {
        res.send({ "error": "missing _id" })
      }
      else {
        if (mongoose.Types.ObjectId.isValid(_id)) {
          Issue.findByIdAndDelete({_id: _id})
            .then((deletedIssue) => {
              if(deletedIssue===null){
                res.send({ "error": "could not delete", "_id": _id })
              }
              else{
                res.send({ "result": "successfully deleted", "_id": _id })
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          res.send({ "error": "could not delete", "_id": _id })
        }
      }
    });

};
