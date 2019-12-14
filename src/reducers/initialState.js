// Set the initial State of the Application
export default {
  id: '',
  alertSnack: {
    open: false,
    message: '',
  },
  network: {
    data: {
      chartIn: [],
      chartOut: [],
      chartPred: [],
    },
    layerSize: 10,
    layers: 3,
    learningRate: 0.025,
    iteration: 0,
    type: 'LSTM',
    activation: 'tanh',
  },
  training: {
    running: false,
    ready: true,
    speed: 1000,
    dataType: 'sin',
    dataVariant: 'random',
    noise: 50,
    values: 0,
    predictions: 0,
    dataSetSize: 100,
    batchSize: 10,
    testOffset: 0,
    stepSize: 0.1,
    reset: false,
    step: false,
  },
  ui: {
    running: false,
    ready: true,
    detail: false,
    data: new Array(5).fill({}),
    speed: 850,
    anim: true,
    animStep: false,
    lstmStep: 0,
    plotStep: 0,
    trainingStep: 0,
    cellAnimStep: 0,
    panelHeight: 0,
  },
  firstcall: true,
};
