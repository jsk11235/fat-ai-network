// How to read allNeurons: allNeurons[layer][neuronOfLayer]
//.location = [layer,neuronOfLayer] .value = (activation of neuron) .bias = (bias of neuron) .grad = (gradient of neuron)
//
// How to read allWeights: allWeights[layer][neuronFrom][neuronTo]
//.location = [layer,neuronFrom,neuronTo] .value = (value of weight) .grad = (gradient of weight)

let allNeurons
const lr = 0.001
let allWeights
allNeurons=[]
const architecture = [3,16,16,3]
for (let a = 0; a < architecture.length; a++) {
  allNeurons.push([])
  for (let b = 0 ; b<architecture[a];b++){
    allNeurons[a].push({value:Math.random(),location:[a,b],gradient:0,bias:0})
  }
}

function updateValue(location){
  let maxValue = allNeurons[location[0]][location[1]].bias
  for (let neuron = 0;neuron<allNeurons[location[0]-1].length;neuron++){
    const prevValue =allNeurons[location[0]-1][neuron].value
    const weight = allWeights[location[0]-1][neuron][location[1]].value
    maxValue+=prevValue * weight
  }
  allNeurons[location[0]][location[1]].value = Math.max(maxValue,0)
}

function updateLayer(layer){
  layer.forEach(neuron=>updateValue(neuron.location))
}

function updateLayer1(inputArr){
  for (let node of allNeurons[0]){
    node.value=inputArr[node.location[1]]
  }
}

function updateNet (input){
  let timesRun=0
  updateLayer1(input)
  allNeurons.forEach(layer=>{
    if (timesRun>0) {
      updateLayer(layer)
    }
    timesRun++
  })
}

allWeights=[]
for (let a = 0; a < architecture.length-1; a++) {
  allWeights.push([])
  for (let b = 0 ; b<architecture[a];b++){
    allWeights[a].push([])
    for (let c = 0 ; c<architecture[a+1];c++) {
      allWeights[a][b].push({value: Math.random(), location: [a, b, c], gradient: 0, bias: 0})
    }
  }
}


updateNet([0.576,0.898,0.100])


const answers = [0.123,0.456,0.789]

function loss(predictions,answers){
  let loss = 0
  for (let idx = 0 ; idx<predictions.length ; idx++){
    loss += Math.abs(predictions[idx]-answers[idx])
  }
  return loss
}

function gradLastLayer(answers){
  const layer = allNeurons[allNeurons.length-1]
  const mappedLayer = layer.map(elem=>elem.value)
  for (let neuron of layer){
    const currentLoss = loss(mappedLayer,answers) // add answers as a param
    neuron.value+=0.0001
    const newMap = layer.map(elem=>elem.value)
    const newLoss = loss(newMap,answers) // here as well
    neuron.value-=0.0001
    neuron.gradient = 10000 * (newLoss-currentLoss)
  }
}

function backOnce(layer){
  for (let neuron of layer){
    let grad = 0
    const loc = neuron.location
    if (neuron.value>0){
      const nextLayer = allNeurons[loc[0]+1]
      const weightLayer = allWeights[loc[0]]
      for (let nextNeuron=0;nextNeuron<nextLayer.length;nextNeuron++) {
        weightLayer[loc[1]][nextNeuron].gradient = neuron.value * nextLayer[nextNeuron].gradient
        grad += weightLayer[loc[1]][nextNeuron].value * nextLayer[nextNeuron].gradient
      }
    }
    neuron.gradient = grad
  }
}



function backProp(answers){
  gradLastLayer(answers)
  for (let layer = allNeurons.length-2;layer>-1;layer--){
    backOnce(allNeurons[layer])
  }
}


function trainOnce (inputs,answers) {
  updateNet(inputs)
  backProp(answers)
  for (let a = 0; a < allNeurons.length; a++) {
    for (let b = 0 ; b<allNeurons[a].length;b++){
      allNeurons[a][b].bias-= allNeurons[a][b].gradient*lr
      allNeurons[a][b].gradient=0
    }
  }
  for (let a = 0; a < allWeights.length; a++) {
    for (let b = 0 ; b<allWeights[a].length;b++){
      for (let c = 0 ; c<allWeights[a][b].length;c++) {
        allWeights[a][b][c].value -= allWeights[a][b][c].gradient*lr
        allWeights[a][b][c].gradient = 0
      }
    }
  }
}

function miniBatches(batch,size){
  let res = []
  for (let n =0 ; n<Math.ceil(batch.length/size);n++){
    res.push(batch.slice(n*size,(n+1)*size))
  }
  return res
}

function trainMiniBatch(miniBatch){
  for (let situation of miniBatch){
    trainOnce(situation.inputs,situation.answers)
  }
}

function trainEpoch (batch,size) {
  for (let miniBatch of miniBatches(batch,size)){
    trainMiniBatch(miniBatch)
  }
}

const data = []
for (let dataItem = 0 ; dataItem<999 ; dataItem++){
  const a = Math.random()
  const b = Math.random()
  const c = Math.random()
  data.push({inputs:[a,b,c],answers:[a*2+b*4,b*2+c*2,c*2+a*4]})
}

for (let n = 0 ; n<10;n++) {
  trainEpoch(data, 3)
}
updateNet([0.1,0.2,0.3])
console.log(allWeights[1])
console.log(allNeurons)