import { ApiUrl } from '../enum'

export default class WebsocketClient {

    onConnected: Function
    onConnectionError: Function
    onWSMessage: Function
    websocket: any

    setProps = (args:any) => {
      this.onConnected = args.onConnected
      this.onConnectionError = args.onConnectionError
      this.onWSMessage = args.onWSMessage
      this.launch(ApiUrl)
    }

    launch = (url:string) => {
        this.websocket = ReconnectingWebSocket(url)
        console.log('ws: connecting');
        this.websocket.onopen = this.onConnected
        this.websocket.onerror = this.onConnectionError
        this.websocket.onmessage = (e:any) => {
            if(e){
                var data = JSON.parse(e.data);
                this.onWSMessage(data);
            }
        }
    }

    disconnect = () => {
        this.websocket.disconnect()
    }

    publishMessage= (msg:any) => {
      var message = JSON.stringify(msg)
      if(message) {
          this.websocket.send(message);
      }
    }
};

const ReconnectingWebSocket = (url:string) => {

  // These can be altered by calling code.
  this.debug = false;
  this.reconnectInterval = 2000;
  this.timeoutInterval = 5000;

  var self = this;
  var ws:any;
  var forcedClose = false;
  var timedOut = false;

  this.url = url;
  this.protocols = [];
  this.readyState = WebSocket.CONNECTING;

  this.URL = url; // Public API

  this.onopen = function (event:any) {

  };

  this.onclose = function (event:any) {

  };

  this.onconnecting = function (event:any) {

  };

  this.onmessage = function (event:any) {

  };

  this.onerror = function (event:any) {

  };

  function connect(reconnectAttempt:any) {

    ws = new WebSocket(url, []);



    self.onconnecting();



    var localWs = ws;

    var timeout = setTimeout(function () {

      timedOut = true;

      localWs.close();

      timedOut = false;

    }, self.timeoutInterval);



    ws.onopen = function (event:any) {

      clearTimeout(timeout);

      self.readyState = WebSocket.OPEN;

      reconnectAttempt = false;

      self.onopen(event);

    };



    ws.onclose = function (event:any) {

      clearTimeout(timeout);

      ws = null;

      if (forcedClose) {

        self.readyState = WebSocket.CLOSED;

        self.onclose(event);

      } else {

        self.readyState = WebSocket.CONNECTING;

        self.onconnecting();

        if (!reconnectAttempt && !timedOut) {

          self.onclose(event);

        }

        setTimeout(function () {

          connect(true);

        }, self.reconnectInterval);

      }

    };



    ws.onmessage = function (event:any) {

      self.onmessage(event);

    };



    ws.onerror = function (event:any) {

      self.onerror(event);

    };

  }

  connect(url);

  this.send = function (data:any) {

    if (ws) {

      return ws.send(data);

    } else {

      throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';

    }

  };

  this.close = function () {

    forcedClose = true;

    if (ws) {

      ws.close();

    }

  };

  /**

   * Additional public API method to refresh the connection if still open (close, re-open).

   * For example, if the app suspects bad data / missed heart beats, it can try to refresh.

   */

  this.refresh = function () {

    if (ws) {

      ws.close();

    }

  };

  return this

}

