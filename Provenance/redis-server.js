var app = require('http').createServer()
var io = require('socket.io')(app)
var redis = require('redis')
var client = redis.createClient()

app.listen(8080)

// Store id and data for session
var id = ''
var data = {
  officesCleared: [],
  officeMouseEnter: [],
  officeClicked: [],
  sliderMoved: [],
  mouseEnter: [],
  accessTimeClicked: [],
  histogramBrushStart: [],
  histogramBrushEnd: [],
  headerClicked: [],
  rowClicked: [],
  rowMouseOver: [],
  tableToggleSelected: [],
  pageChange: [],
  histogramBarClick: [],
  histogramBarMouseEnter: [],
  graphNodeMouseEnter: [],
  id: id
}

function save () {
  client.set(id, JSON.stringify(data))
}

io.on('connection', function (socket) {
  socket.on('id', function (value) {
    id = value
    data.id = id
  })

  socket.on('add', function (key, value) {
    data[key].push(value)
    save()
  })

  socket.on('save', function () {
    save()
  })
})
