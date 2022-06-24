<template>
  <div>
    <h1>数独回答</h1>
    <div class="sudoku">
      <div v-for="row in sudoku" :key="row.key">
        <div v-for="col in row.value" :key="col.key" :data-row="row.key" :data-col="col.key" :data-box="boxNumber(row.key, col.key)"
          @click="popup(row.key, col.key)">
          {{ col.value }}
        </div>
      </div>
    </div>
    <div class="btn-set">
      <div class="btn" @click="dataReset">リセット</div>
      <div class="btn" @click="dataExport">エクスポート</div>
      <div class="btn" @click="btnImport">インポート</div>
    </div>
    <div v-if="isPopup" class="popup">
      <div class="popup_inner">
        <div v-for="n of number" :key="n" @click="addNumber(n)">
          {{ n }}
        </div>
        <div class="reset" @click="resetNumber">リセット</div>
      </div>
    </div>
    <input type="file" style="display: none" @change="dataImport" ref="input" accept="application/json">

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface sudokuColType {
  key: number,
  value: string
}

interface sudokuType {
  key: number,
  value: sudokuColType[]
}

interface calcDataType2 {
  [key: number]: number[]
}
interface calcDataType1 {
  [key: number]: calcDataType2
}
interface calcDataType {
  [key: number]: calcDataType1
}

export default defineComponent({
  name: 'App',
  components: {
  },
  data() {
    return {
      number: 9,
      sudoku: [] as sudokuType[],
      isPopup: false,
      target: { row: 0, col: 0 },
      calcData: {} as calcDataType
    }
  },
  methods: {
    createTable(number: number) {
      for (let index = 0; index < number; index++) {
        this.sudoku.push({ key: index + 1, value: [] });
        for (let index_sub = 0; index_sub < number; index_sub++) {
          this.sudoku[index].value.push({ key: index_sub + 1, value: '' });
        }
      }
    },
    popup(key1: number, key2: number) {
      this.isPopup = true;
      this.target.row = key1 - 1;
      this.target.col = key2 - 1;
    },
    addNumber(n: number) {
      this.sudoku[this.target.row].value[this.target.col].value = String(n);
      this.isPopup = false;
    },
    resetNumber() {
      this.sudoku[this.target.row].value[this.target.col].value = '';
      this.isPopup = false;
    },
    boxNumber(row: number, col: number) {
      const base = Math.sqrt(this.number);
      let box_n = 0;
        box_n = Math.floor(col / base);
      if(col % base != 0){
        box_n += 1;
      }
      if(row % base == 0){
        box_n += (row / base - 1) * base
      }
      else{
        box_n += Math.floor(row / base) * base
      }
      if(!this.calcData[row]){this.calcData[row] = {}}
      if(!this.calcData[row][col]){this.calcData[row][col] = {}}
      if(!this.calcData[row][col][box_n]){this.calcData[row][col][box_n] = []}
      return box_n;
    },
    dataReset() {
      console.log(this.sudoku);
      this.sudoku.map(x => x.value.map(y => y.value = ''));
      // this.sudoku = [];
    },
    dataExport() {
      const blob = new Blob([JSON.stringify(this.sudoku, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'exportData.json'; // 出力するファイルの名前
      link.click();
      link.remove();

    },
    dataImport() {
      const ref: any = this.$refs.input;
      const file = ref.files[0];
      const reader = new FileReader()

      reader.onload = () => {
        const json = reader.result as string;
        this.sudoku = JSON.parse(json);
      }
      reader.readAsText(file)

    },
    btnImport() {
      const ref: any = this.$refs.input;
      ref.click();
    },

  },
  created() {
    this.createTable(this.number);
  }
});
</script>

<style lang="scss">
</style>
