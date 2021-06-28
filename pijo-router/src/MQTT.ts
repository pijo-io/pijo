import mqtt from 'mqtt';

export class MQTT {
  client: mqtt.Client = null;
  is_connected: boolean = false;

  constructor(host: string) {
    this.connect(host)
  }

  connect(host: string) {
    let client: mqtt.Client = this.client = mqtt.connect(host);
    let self = this;
    client.on('connect', () => {
      this.is_connected = true;
      client.subscribe('presence', function (err, ok) {
        self.publish('pijo/hello', { 'timestamp': Date.now(), connected: true })
      })
    })

  }

  publish(topic: string, msg: Object): Promise<MQTT_Received> {
    return new Promise((resolv, reject) => {
      this.client.publish(topic, JSON.stringify(msg), (err, ok) => {
        if (err) reject({ error: err.message, payload: msg, topic: topic })
        else resolv({ topic: topic, message: ok })
      })
    })
  }

  subscribe(sub_topic: string, callback: Function): Promise<any> {
    return new Promise((resolv, reject) => {
      this.client.subscribe(sub_topic, (err, ok) => {
        if (err) {
          reject( { error: err.message, topic: sub_topic } );
          return;
        }
        this.client.on('message', function (topic, message) {
          if (sub_topic != topic) return; // ignore topics we don't care about
          try {
            let decoded = JSON.parse(message.toString());
            callback && callback({ topic: topic, message: decoded  } as MQTT_Received);
          } catch (e) {
            callback && callback({ topic: topic, error: e.message, payload: message.toString() } as MQTT_Received);
          }
        })
        resolv( { topic: sub_topic});
      })
    });

  }
}

export interface MQTT_Received {
  topic: string;
  message: any;
  error?: string;
  payload?: string;
}