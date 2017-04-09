"use strict";

var NLP = require('natural');
var fs = require('fs');
var sentiment = require('sentiment');

module.exports = Interpreter;

function Interpreter() {
  this.classifier = new NLP.LogisticRegressionClassifier();
  this.minConfidence = 0.7;
}

Interpreter.prototype.teach = function(label, phrases) {
  phrases.forEach(function(phrase) {
    console.log('Ingesting example for ' + label + ': ' + phrase);
    this.classifier.addDocument(phrase.toLowerCase(), label);
  }.bind(this));
  return this;
};

Interpreter.prototype.think = function() {
  this.classifier.train();

  // save the classifier for later use
  var aPath = './src/classifier.json';
  this.classifier.save(aPath, function(err, classifier) {
    // the classifier is saved to the classifier.json file!
    console.log('Writing: Creating a Classifier file in SRC.');
    });

  return this;
};

Interpreter.prototype.interpret = function(phrase) {
  console.log("Interpreter has received text..");
  var guesses = this.classifier.getClassifications(phrase.toLowerCase());
  var guess = guesses.reduce(toMaxValue);
  return {
    probabilities: guesses,
    guess: guess.value > this.minConfidence ? guess.label : null
  };
};

Interpreter.prototype.invoke = function(skill, info, message) {
  console.log("Invoke code reached!");
  var skillCode;
  
  // check the sentiment 
  let senti = sentiment(message.text);
  if (senti.score != 0) {
    console.log('\n\tSentiment value: ');
    console.dir(senti); 
    console.log('\n');
    }

  console.log('Grabbing code for skill: ' + skill);
  try {
    //skillCode = require('../skills/' + skill);
	  skillCode = require('./Command');
  } catch (err) {
    throw new Error('The invoked skill doesn\'t exist!');
  }
  console.log('Running skill code for ' + skill + '...');
  skillCode(skill, info, message, senti);
  return this;
};

function toMaxValue(x, y) {
  return x && x.value > y.value ? x : y;
}


