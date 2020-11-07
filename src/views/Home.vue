<template>
  <section class="section">
    <div class="container">
      <h1 class="title">{{ greetingText }}</h1>
      <!-- TODO: 9. loop names -->
      <h1 class="title" v-for="name in names" :key="name">{{ name }}</h1>
      <b-field>
        <!-- TODO: 2. ใช้ placeholder ที่สร้างไว้ใน TODO: 1. มา v-bind ลง parameter placeholder -->
        <b-input v-model="name" :placeholder="placeholder"></b-input>
        <!-- <b-input v-model="name" placeholder="Tell us your name"></b-input> -->
      </b-field>

      <!-- TODO: 5. ใส่ button เพิ่มเพิ่อ set เงื่อนไข v-if v-else -->
      <b-button v-if="name" type="is-primary" @click="enter">Enter</b-button>
      <b-button v-else type="is-primary">Waiting your name...</b-button>
      <!-- <b-button type="is-primary" @click="enter">Enter</b-button> -->

      <!-- TODO: 10. add button -->
      <b-button v-if="name" type="is-secondary" @click="add">Add name</b-button>
    </div>
  </section>
</template>
<script>
export default {
  data() {
    return {
      // TODO: 1. เพิ่มตัวแปร placeholder
      placeholder: "Tell us your name",
      name: null,
      greetingText: "Hello! What's your name?",
      names: []
      // TODO: 7. เพิ่มตัวแปร names ที่เป็น array ของ name
    };
  },
  methods: {
    // TODO: 3. Say hello! โดยการนำชื่อที่ผู้ใช้กรอกมารวมใน greetingText
    enter() {
      if (!this.name) return;
      this.greetingText = "Hello, " + this.name + "!";
      // TODO: 6. reset name เมื่อ enter
      this.name = null;
    },
    // TODO: 8. เพิ่ม function add()
    add() {
      if (!this.name) return;
      this.names.push(this.name);
      this.name = null;
    }
  },
  watch: {
    name() {
      if (!this.name) return;
      this.greetingText = "Hello, " + this.name + "!";
    }
  }
};
</script>
