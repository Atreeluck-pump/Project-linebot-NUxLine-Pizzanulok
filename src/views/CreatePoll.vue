<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Create Pizzanulok Poll</h1>
      <b-field label="Name">
          <b-input v-model="name" placeholder="Poll name"></b-input>
      </b-field>
      <div class="buttons is-centered">
        <b-button @click="cancel">Cancel</b-button>
        <b-button type="is-primary" @click="start" :class="{ 'is-loading': isCreating }">Start</b-button>
      </div>
    </div>
  </section>
</template>

<script>
const firebase  = require('../firebase.js')
const line  = require('../line-config.js')

export default {
  data () {
    return {
      name: null,
      isCreating: false,
      userProfile: null
    }
  },
  beforeMount() {
    const app = this
    const liff = app.$liff
    liff.init({
      liffId: line.createPollLiffID
    }).then(() => {
      console.log('LIFF initialized')
      if (!liff.isLoggedIn()) {
        return liff.login()
      } else {
        return liff.getProfile().then(profile => {
          delete profile.statusMessage // No one needs to see this!
          console.log(JSON.stringify(profile))
          app.userProfile = profile
        })
      }
    }).catch((err) => {
      console.error(err)
    })
  },
  methods: {
    cancel() {
      this.$buefy.notification.open('Clicked!!')
      this.$liff.closeWindow()
    },
    start() {
      const app = this
      if (!app.name) { 
        app.toast('กรุณาตั้งชื่อโพล', false)
        return
      }
      app.isCreating = true
      firebase.pizzasCollection.get().then(snapshot => {
        const options = snapshot.docs.map ((doc, index) => { 
          const pizza = doc.data()
          return {
            'value': index,
            'text': pizza.name, 
            'votes': 0
          }
        })
        firebase.pollsCollection.add({
          'name': app.name,
          'options': options,
          'createdBy': app.userProfile
        })
        .then(function(docRef) {
          console.log(docRef)
          app.isCreating = false
          app.toast('โพลถูกสร้างแล้ว!', true)
          if (app.$liff.isLoggedIn()) {
            const messages = [{
              "type": "text",
              "text": `โพล ${app.name} ของคุณถูกสร้างแล้ว ส่งต่อให้เพื่อนได้เลย`
            },{
              "type": "text",
              "text": line.pollLiffUrl + '?poll=' + docRef.id
            }]
            // TODO: send message to chat room once finish creating poll
            app.$liff.sendMessages(messages)
            .then(() => {
              console.log('message sent')
              app.$liff.closeWindow()
            })
            .catch((err) => {
              console.log('error', err)
            })
          }
        })
        .catch(function(error) {
          app.isCreating = false
          app.toast('อุ๊ย! มีบางอย่างผิดพลาด', false)
          console.error(error)
        })
      });
    },
    toast(message, isSuccess) {
        this.$buefy.toast.open({
          message: message,
          position: 'is-bottom',
          type: isSuccess ? 'is-success' : 'is-danger'
        })
    }
  }
}
</script>
