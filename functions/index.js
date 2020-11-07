'use strict';

const functions = require('firebase-functions');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// const serviceAccount = require('./key.json')
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://pizzanulok-vfwchf.firebaseio.com'
// });

const db = admin.firestore();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome (agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback (agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function showMenu (agent) {
    return db.collection('pizzas').limit(4).get().then(snapshot => {
      if (snapshot.empty) return agent.add(`อุ๊ย พิซซ่าหมด :'(`);
      let menu;
      if (agent.requestSource !== agent.LINE) {
        menu = `พิซซ่าอร่อยๆของทางร้านมีหน้า:\n${snapshot.docs.map(pizza => `- ${pizza.data().name}`).sort().join('\n')}`;
      }
      else {
        const carousel = getFlexMessage(snapshot.docs)
        menu = carousel
        menu = new Payload(agent.LINE, carousel, { sendAsMessage: true });
      }
      return agent.add(menu);
    });
  }

  function selectPizza (agent) {
    const params = agent.parameters
    const count = params.Count || 1
    const pizza = params.Pizza || agent.context.inputContexts.haspizza.parameters.name
    agent.add(`จัดไป! ${count} x ${pizza}`)
  }

  function getFlexMessage (pizzas) {
    const rows = pizzas.map(item => {
      const pizza = item.data()
      console.log('pizza: ' + JSON.stringify(pizza))
      return {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": pizza.url,
          "size": "full",
          "aspectRatio": "20:13",
          "aspectMode": "cover"
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": pizza.name,
              "size": "xl",
              "weight": "bold",
              "wrap": true
            },
            {
              "type": "text",
              "text": "฿" + pizza.price,
              "size": "xl",
              "weight": "regular",
              "wrap": true
            },
            {
              "type": "text",
              "size": "xs",
              "text": pizza.ingredients.toString()
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "spacing": "sm",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "สั่งเลย",
                "text": "สั่ง " + pizza.name
              },
              "color": "#C40019",
              "style": "primary"
            }
          ]
        }
      }
    })
    const seeMoreBubble = {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "ดูเมนูทั้งหมด",
              "uri": "https://liff.line.me/1654000268-jXPoNn0d" // TODO: change this to your LIFF app
            },
            "color": "#ffffff",
            "gravity": "center",
            "offsetTop": "150px"
          }
        ]
      },
      "styles": {
        "body": {
          "backgroundColor": "#C40019"
        }
      }
    }
    rows.push(seeMoreBubble)
    console.log('rows: ' + JSON.stringify(rows))
    return {
      "type": "flex",
      "altText": "เมนูของทางร้าน",
      "contents": {
        "type": "carousel",
        "contents": rows
      }
    }
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('ShowMenu', showMenu);
  intentMap.set('SelectPizza', selectPizza)
  return agent.handleRequest(intentMap);
});
