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
      default: Date.now
    },
    update_on: {
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

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      Issue.find({
        project: project
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
    
    .post(function (req, res){
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      Issue.create({
        project, issue_title, issue_text, created_by, assigned_to, status_text
      })
      .then(data => {
        res.status(201).send(data)
      })
      .catch(err => console.log(err));
      // res.status(201).send('Good');
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      Issue.findByIdAndUpdate(_id, { age: 30, issue_title, issue_text, created_by, assigned_to, status_text, open, update_on: Date.now() })
      .then((updatedIssue) => {
        res.send(updatedIssue)
      })
      .catch((error) => {
        console.error(error);
      });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let { _id } = req.body;
      Issue.findByIdAndDelete(_id)
      .then((deletedIssue) => {
        res.send(deletedIssue)
      })
      .catch((error) => {
        console.error(error);
      });
    });
    
};
