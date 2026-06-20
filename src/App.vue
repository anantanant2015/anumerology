<template>
  <main class="app-container">
    <NumerologyCalculator />
  </main>
</template>

<script setup>
// Import the component we just created
import NumerologyCalculator from './components/NumerologyCalculator.vue';
</script>

<style>
/* Add a simple global background reset */
body {
  margin: 0;
  padding: 0;
  background-color: #f4f7f6; /* A soft, neutral background */
  font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.app-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5vh;
}
</style>
