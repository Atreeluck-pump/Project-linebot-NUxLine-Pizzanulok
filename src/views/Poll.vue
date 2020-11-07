<template>
  <section class="section">
    <div class="container">
      <b-loading :is-full-page="true" :active.sync="isLoading" :can-cancel="false"></b-loading>
      <h1 class="title" v-if="poll">{{poll.name}}</h1>
      <div v-if="isVoted">
        <button v-for="option in options" v-bind:key="option.value" 
                :class="selectedOption === option.value ? 'button is-fullwidth vote-option is-primary' : 'button is-fullwidth is-outlined vote-option'" 
                @click="showVoters(option)">{{option.text}} ({{option.votes}})</button>
      </div>
      <div v-else>  
        <button v-for="option in options" v-bind:key="option.value" 
                class="button is-fullwidth vote-option"
                @click="addVote(option)">{{option.text}}</button>
      </div>
      <p class="is-size-7" v-if="poll">created by {{ createdBy }}</p>
    </div>
  </section>
</template>

<script> 
  import firebase from 'firebase/firebase-firestore'
  const firebaseApp = require('../firebase.js')
  const line  = require('../line-config.js')

  export default {  
    data() {
      return {
        pollId: this.$route.params.id,
        poll: null,
        options: [],
        isVoted: false,
        isLoading: false,
        selectedOption: 0,
        createdBy: 'unknown',
        user: {"userId":"Uec2c48270f939fb48fc5b1e9e9f8e016","displayName":"Nui (นุ้ย)","pictureUrl":"https://profile.line-scdn.net/0h-A8HUAf0cm4FMVpSchENOTl0fANyH3QmfVVqDyE1JAp7A2c4OFRvCidmKF4pCTw7Ol8_WiJkK1wg"}
      }
    },
    beforeCreate() {
      const app = this
      const liff = app.$liff
      liff.init({liffId: line.pollLiffID}).then(() => {
        console.log('LIFF initialized')
        if (liff.getOS() === 'web' && !liff.isLoggedIn()) {
          // LINE Login needs a specific redirectUri
          const redirectUri = (window.location.origin + app.$router.currentRoute.fullPath)
          liff.login({redirectUri})
        }
        // Logged in already
        liff.getProfile().then(profile => {
          app.user = profile
        })
      }).catch((err) => {
        console.error(err)
      })
    },
    mounted() {
      this.isLoading = true
      firebaseApp.pollsCollection.doc(this.pollId).onSnapshot(docSnapshot => {
        console.log(`Received doc snapshot: ${JSON.stringify(docSnapshot.data())}`)
        this.isLoading = false
        const poll = docSnapshot.data()
        this.poll = poll
        this.options = poll.options
        this.createdBy = poll.createdBy.displayName
        const myVote = Array.isArray(poll.voters) ? poll.voters.filter(voter => voter.userId === this.user.userId)[0] : {}
        if (myVote && myVote.option) {
          this.isVoted = true
          this.selectedOption = myVote.option
        }
      }, err => {
        console.log(`Encountered error: ${err}`)
        this.isLoading = false
      })
    },
    methods: {
      addVote(option) {
        console.log('You voted ' + option.text + '!');
        this.selectedOption = option.value
        const index = this.options.findIndex(option => option.value === this.selectedOption)
        if (index >= 0) {
          this.options[index].votes += 1
          const voter = this.user
          voter.option = this.selectedOption
          firebaseApp.pollsCollection.doc(this.pollId).update({
            options: this.options,
            voters: firebase.firestore.FieldValue.arrayUnion(voter)
          })
          this.isVoted = true
        }
      },
      showVoters(option) {
        console.log(option.text)
        this.$router.push({ name: 'OptionVoters', params: { pollId: this.pollId, optionValue: option.value } })
      }
    }
  }
</script>

<style scoped>
  .vote-option {
    margin: 10px 0;
  }
</style>