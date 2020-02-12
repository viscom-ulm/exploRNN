/* eslint-disable no-restricted-globals */
/* global tf, importScripts */
export default () => {
  self.addEventListener('message', (e) => {
    if (!e) return;
    switch (e.data.cmd) {
      case 'init':
        importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js');
        importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.2.7/dist/tf.min.js');
        tf.setBackend('cpu');
        self.initialize(e.data.model, e.data.data);
        postMessage({cmd: 'init', values:
          {
            values: self.values,
            predictions: self.testOutputs,
          }});
        break;
      case 'fit':
        if (self.fitting) return;
        self.fitting = true;
        self.model.model.fit(self.mem[2].in,
            self.mem[2].out, {
              epochs: e.data.params.epochs,
              batchSize: e.data.params.batchSize,
            }
        ).then(() => {
          self.fitting = false;
          postMessage({cmd: 'fit', reset: e.data.params.reset});
        }
        );
        break;
      case 'data':
        self.generateDataWith(e.data.params);
        self.addDataToMemory();
        postMessage({cmd: 'data', values: {
          chartIn: self.chartDataInput,
          chartOut: self.chartDataOutput,
          chartPred: self.chartPredictionInput,
        }});
        break;
      case 'model':
        self.createModel(e.data.params);
        break;
      case 'pred':
        if (self.predicting) return;
        self.predicting = true;
        postMessage({cmd: 'pred', values: {
          pred: self.createPrediction(),
        }});
        self.predicting = false;
        break;
      default:
        break;
    }
  });

  /**
   * Initializes the worker thread with all necessary values and objects
   */
  self.initialize = () => {
    self.model = undefined;
    self.mem = [];
    self.fitting = false;
    self.predicting = false;
    self.generateDataWith({start: 0});
  };

  /**
   * Create the network model and compile it
   *
   * @param {object} params The model parameters from the received message
   */
  self.createModel = (params) => {
    self.createComplexModel(self.values, 1, self.predictions,
        params.layers, params.cells);
    const optimizer = tf.train.rmsprop(params.learningRate);
    self.model.compile({loss: 'meanSquaredError', optimizer: optimizer});
  };

  /**
   * Adds the previously generated data to the worker memory
   */
  self.addDataToMemory = () => {
    const add = {in: self.trainInput,
      out: self.trainOutput,
      pred: self.testInput};
    if (!self.mem) {
      self.mem = [add];
      return;
    }
    if (self.mem.length === 5) {
      self.mem.shift();
    }
    self.mem.push(add);
  };


  /**
   * Creates a more complex lstm network model with multiple
   * hidden layers and possibly multiple blocks per layer
   *
   * @param {number} timeSteps the amount of input time steps
   * @param {number} vocab the vocabulray size, = 1 for numerical input
   * functions (meaning the vocabulary is 'one number' with any value)
   * @param {number} labels the output labels, or output dimensionality
   * @param {number} layers the amount of hidden lstm layers
   * @param {number} blockSize the amount of cell states within a lstm block
   * @return {object} the complex network model based on the input values
   */
  self.createComplexModel = (timeSteps, vocab, labels, layers, blockSize) => {
    self.model = tf.sequential();
    self.model.add(
        tf.layers.lstm({
          units: blockSize,
          returnSequence: true,
          inputShape: [timeSteps, vocab],
        })
    );
    for (let i = 1; i < layers; i++) {
      self.model.add(
          tf.layers.repeatVector({n: blockSize}));
      self.model.add(
          tf.layers.lstm({
            units: blockSize,
            returnSequence: true,
          })
      );
    }
    self.model.add(
        tf.layers.dense({
          units: labels,
          returnSequence: true,
          activation: 'tanh',
        })
    );
    return self.model;
  };

  /**
   * Helper function for generating the data sets used for training
   *
   * @param {object} params sefsef
   */
  self.generateDataWith = (params) => {
    self.generateData(params.start, params.type, 3, 1,
        0.2, params.size, params.var, params.noise);
  };

  /**
   * The actual function for generating the data sets used for training
   *
   * @param {number} start the time step to start the data from
   * @param {string} funcs the type of function the network should be trained on
   * @param {number} plotLength the size of the interval of the input values
   * @param {number} predLength the number of values that should be predicted
   * @param {number} stepSize the distance between two values in the data set
   * @param {number} setSize the amount of individual training data
   *  within the set
   * @param {string} variant the variation of input values, currently always
   *  'random'
   * @param {number} noise the amount of noise that should be added onto
   *  the training data (0-2)
   */
  self.generateData = (start, funcs, plotLength,
      predLength, stepSize, setSize, variant, noise = 0) => {
    self.trainInputBuff = [];
    self.trainOutputBuff = [];
    self.testInputBuff = [];
    self.values = Math.round(plotLength / stepSize);
    self.predictions = predLength;
    self.testOutputs = 2 * Math.PI / stepSize;
    self.stepSize = stepSize;
    self.chartPredictionInput = [];
    self.chartDataInput = [];
    self.chartDataOutput = [];
    self.maxNoise = 0.2;
    if (funcs === undefined || funcs.length === 0 || variant === undefined) {
      return;
    }

    // train data
    let val = 0;
    let noiseVal = 0;
    const partialSetSize = setSize / funcs.length;
    for (const f of funcs) {
      self.trainData(stepSize, partialSetSize, f, noise);
    }

    // test data
    const testFunc = funcs[Math.floor(Math.random() * funcs.length)];
    const testInputSequence = [];
    const offset = Math.random() * Math.PI;
    for (let j = 0; j < self.values; j++) {
      noiseVal = (noise/100) * (-self.maxNoise +
          2 * self.maxNoise * Math.random());
      val = self.dataFunc(j * stepSize + offset, testFunc) + noiseVal;
      testInputSequence.push([val]);
      self.chartDataInput.push(val);
      self.chartPredictionInput.push(val);
    }
    self.testInputBuff.push(testInputSequence);
    const currentOutSequence = [];
    let x;
    for (let j = 0; j < self.testOutputs; j++) {
      x = (self.values + j) * stepSize;
      val = self.dataFunc(x + offset, testFunc);
      currentOutSequence.push(val);
      self.chartDataOutput.push(val);
    }
    self.chartDataInput.push();
    self.chartPredictionInput.push();
    self.testInput = testInputSequence;
  };

  /**
   * A helper function that creates a specific amount of training data
   * for a certain input function
   *
   * @param {number} stepSize the distance between two values in the data set
   * @param {number} partialSetSize the size of the current part of the
   * training set
   * @param {string} func the function to be used for calculating the input
   * values
   * @param {number} noise the percentage of noise to be added to the input
   */
  self.trainData = (stepSize, partialSetSize, func, noise) => {
    const setOffsetRatio = (2 * Math.PI) / partialSetSize;
    const startOffset = 2 * Math.PI * Math.random();
    for (let i = 0; i < partialSetSize; i++) {
      const trainInputSequence = [];
      const start = i * setOffsetRatio + startOffset;
      for (let j = 0; j < self.values; j++) {
        const noiseVal = (noise/100) * (-self.maxNoise +
            2 * self.maxNoise * Math.random());
        const val = self.dataFunc(start + (j * stepSize), func) + noiseVal;
        trainInputSequence.push([val]);
      }
      self.trainInputBuff.push(trainInputSequence);
      const currentOutSequence = [];
      let x;
      for (let j = 0; j < self.predictions; j++) {
        x = (self.values + j) * stepSize + start;
        const val = self.dataFunc(x, func);
        currentOutSequence.push(val);
      }
      self.trainOutputBuff.push(currentOutSequence);
    }
    self.trainInput = tf.tensor3d(self.trainInputBuff);
    self.trainOutput = tf.tensor2d(self.trainOutputBuff);
  };

  /**
   * A helper function that represents the currently chosen input function
   *
   * @param {number} x the current input value
   * @param {string} type the type of function that should be applied to
   *  the input values
   * @return {number} y = type(x)
   */
  self.dataFunc = (x, type) => {
    let y = Math.sin(x);
    if (type === 'sinc') {
      y = (Math.sin(1.5*x) + Math.sin(4.5 * x)) / 1.5;
    }
    if (type === 'saw') {
      y = -1 + 2 * ((x % Math.PI) / Math.PI);
    }
    if (type === 'sqr') {
      y = Math.sin((Math.PI/2)*x) >= 0 ? 1 : -1;
    }
    return y;
  };

  /**
   * This function creates a continous array of single prediction values
   * for the current test input values. The predicted values are being added
   * to the values so that the model needs to predict the function with its
   * own previous predictions
   *
   * @return {number[]} the predicition array
   */
  self.createPrediction = () => {
    const output = [];
    let preds;
    let prediction;
    let inputBuff;
    const newInput = [];
    for (const step of self.testInput) {
      newInput.push([step[0]]);
    }
    for (let i = 0; i < self.testOutputs; i++) {
      inputBuff = tf.tensor3d([newInput]);
      prediction =
      self.model.predict(inputBuff);
      preds = Array.from(prediction.arraySync());
      output.push(preds[0]);
      newInput.splice(0, 1);
      newInput.push(preds[0]);
    }
    return output;
  };
};
