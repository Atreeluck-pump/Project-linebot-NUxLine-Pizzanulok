<template>
  <section class="section">
    <div class="container">
        <h1 class="title" v-if="option">{{voters.length}} คน โหวตให้ "{{option.text}}"</h1>
          <table>
            <tbody>
              <tr v-for="voter in voters" :key="voter.userId">
                <figure class="image is-64x64">
                  <img class="is-rounded" :src="voter.pictureUrl">
                </figure>
                <p class="voter-name">{{ voter.displayName }}</p>
              </tr>
            </tbody>
          </table>
    </div>
  </section>
</template>

<script> 
  const firebase = require('../firebase.js')

  export default {  
      data() {
        return {
            pollId: this.$route.params.pollId,
            optionValue: this.$route.params.optionValue,
            option: null,
            voters: []
        }
      },
      mounted() {
        const main = this
        firebase.pollsCollection.doc(main.pollId).onSnapshot(docSnapshot => {
            console.log(`Received doc snapshot: ${JSON.stringify(docSnapshot.data())}`);
            const poll = docSnapshot.data()
            const index = poll.options.findIndex(option => option.value === main.optionValue)
            if (index >= 0) {
                let option = poll.options[index]
                main.option = option
                main.voters = poll.voters.filter(voter => voter.option === main.optionValue)
            }
        }, err => {
            console.log(`Encountered error: ${err}`);
        });
      }
  }
</script>

<style scoped>
  table {
    margin: auto;
  }
  .voter-name {
    padding-bottom: 8px;
  }
</style>