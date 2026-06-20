<template>
  <div class="calculator-shell">
    <aside class="calc-side-nav">
      <h3>Jump to</h3>
      <button type="button" @click="scrollTo('compound')">Compound Number</button>
      <button type="button" @click="scrollTo('hebrew')">Hebrew</button>
      <button type="button" @click="scrollTo('age')">Age</button>
    </aside>

    <div class="numerology-container">
      <div class="card input-section">
        <h2 class="title">Astro Numerology Calculator</h2>
      <div class="input-group">
        <input
          v-model="nameInput"
          @keyup.enter="calculate"
          type="text"
          placeholder="Enter a word or name (e.g., windows)"
          class="material-input"
        />
      </div>
      <div class="button-group">
        <button @click="calculate" class="btn btn-primary">Calculate</button>
        <button @click="clear" class="btn btn-secondary">Clear</button>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <div v-if="hasResults" class="results-section">

      <div class="card compound-card">
        <h3 class="subtitle">Compound Number</h3>
        <div class="compound-value">{{ compoundNumber }}</div>
      </div>

      <div class="card pyramid-card">
        <h3 class="subtitle">Hebrew</h3>
        <div class="pyramid-container">
          <div v-for="(row, rowIndex) in hebrewPyramid" :key="'row-'+rowIndex" class="pyramid-row">
            <span v-for="(cell, cellIndex) in row" :key="'cell-'+cellIndex" class="pyramid-cell">
              {{ cell }}
            </span>
          </div>
        </div>
      </div>

      <div id="age" class="card age-card">
        <h3 class="subtitle">Age</h3>
        <div class="age-container">
          <span v-for="(age, index) in ageProgression" :key="'age-'+index" class="age-cell">
            {{ age }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const scrollTo = (section) => {
  const target = document.getElementById(section);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// --- State ---
const nameInput = ref('');
const compoundNumber = ref(0);
const hebrewPyramid = ref([]);
const ageProgression = ref([]);
const errorMessage = ref('');

// --- Computed ---
const hasResults = computed(() => hebrewPyramid.value.length > 0);

// --- Dictionaries ---
const map = {"a":1,"b":2,"c":3,"d":4,"e":5,"f":8,"g":3,"h":5,"i":1,"j":1,"k":2,"l":3,"m":4,"n":5,"o":7,"p":8,"q":1,"r":2,"s":3,"t":4,"u":6,"v":6,"w":6,"x":5,"y":1,"z":7,"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9};
const ageMap = {"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":1,"k":2,"l":3,"m":4,"n":5,"o":6,"p":7,"q":8,"r":9,"s":1,"t":2,"u":3,"v":4,"w":5,"x":6,"y":7,"z":8};

// --- Logic ---
const calculate = () => {
  errorMessage.value = '';
  let cleanName = nameInput.value.toLowerCase().replace(/\s+/g, "");

  if (!/^[a-zA-Z0-9]*$/.test(cleanName) || cleanName === '') {
    errorMessage.value = "Please enter valid letters or numbers only.";
    return;
  }

  let sum = 0;
  let numbers = [];
  let ageBaseValues = [];
  let nameChars = [];

  // 1. Calculate Compound Number & Base Arrays
  for (let i = 0; i < cleanName.length; i++) {
    let char = cleanName[i];
    let val = parseInt(map[char]);
    sum += val;
    nameChars.push(char);
    numbers.push(val);

    if (!(/[0-9]/.test(char))) {
      ageBaseValues.push(parseInt(ageMap[char]));
    }
  }

  compoundNumber.value = sum;

  // 2. Calculate Pyramid
  let pyramid = [nameChars, numbers];
  let currentLevel = numbers;

  for (let i = 0; i < numbers.length - 1; i++) {
    let nextLevel = [];
    for (let j = 1; j < currentLevel.length; j++) {
      let y = (currentLevel[j] + currentLevel[j-1]) % 9;
      y = (y === 0) ? 9 : y;
      nextLevel.push(y);
    }
    pyramid.push(nextLevel);
    currentLevel = nextLevel;
  }
  hebrewPyramid.value = pyramid;

  // 3. Calculate Age Progression
  let ages = [];
  if (ageBaseValues.length > 0) {
    let t = 0;
    let b = true;
    while (t < 100) {
        if (b) {
            t += ageBaseValues[0];
            ages.push(t);
            for (let i = 1; i < ageBaseValues.length; i++) {
                t += ageBaseValues[i];
                ages.push(t);
            }
            b = false;
        } else {
            t += ageBaseValues[ageBaseValues.length - 1];
            ages.push(t);
            for (let i = ageBaseValues.length - 2; i >= 0; i--) {
                t += ageBaseValues[i];
                ages.push(t);
            }
            b = true;
        }
    }
  }
  ageProgression.value = ages;
};

const clear = () => {
  nameInput.value = '';
  compoundNumber.value = 0;
  hebrewPyramid.value = [];
  ageProgression.value = [];
  errorMessage.value = '';
};
</script>

<style scoped>
/* --- Material Design Modular Theme --- */
.calculator-shell {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.calc-side-nav {
  min-width: 220px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.calc-side-nav h3 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
}

.calc-side-nav button {
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: #f4f7ff;
  color: #1e3a8a;
  text-align: left;
  cursor: pointer;
}

.numerology-container {
  flex: 1;
  width: 100%;
  max-width: 100%;
}

.card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.title {
  margin-top: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.subtitle {
  margin-top: 0;
  font-size: 1.2rem;
  color: #6200ea;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

/* Inputs & Buttons */
.input-group {
  margin-bottom: 16px;
}

.material-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.material-input:focus {
  border-color: #6200ea;
  box-shadow: 0 0 0 2px rgba(98, 0, 234, 0.1);
}

.button-group {
  display: flex;
  gap: 12px;
}

.calculator-shell {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.calc-side-nav {
  min-width: 220px;
  max-width: 240px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 120px;
}

.calc-side-nav button {
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: #f4f7ff;
  color: #1e3a8a;
  text-align: left;
  cursor: pointer;
}

.calc-side-nav h3 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: #03a9f4; /* Matches original button color */
  color: white;
  box-shadow: 0 2px 4px rgba(3, 169, 244, 0.3);
}

.btn-primary:hover {
  background-color: #0288d1;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #bdbdbd;
}

.error {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-top: 12px;
}

/* Results Display */
.compound-value {
  font-size: 2rem;
  font-weight: bold;
  color: #c51162;
}

/* Grid & Cell Styling */
.pyramid-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pyramid-row {
  display: flex;
  gap: 4px;
}

.pyramid-cell, .age-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #ab47bc; /* Purple from the reference image */
  color: white;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.age-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.age-cell {
  width: auto;
  min-width: 36px;
  padding: 0 8px;
  align-self: flex-start; /* Aligns them vertically without stretching */
}
</style>
