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
      <div class="btn" @click="calculate">計算開始</div>
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
import _ from 'lodash';

interface sudokuColType {
  key: number,
  value: string
}

interface sudokuType {
  key: number,
  value: sudokuColType[]
}

interface calcDataType {
  [key: string]: number | number[]
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
      calcData: [] as calcDataType[]
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
      this.target.row = key1;
      this.target.col = key2;
    },
    addNumber(n: number) {
      this.sudoku[this.target.row - 1].value[this.target.col - 1].value = String(n);
      this.isPopup = false;
      // 計算用データを変更する
      let target = _.find(this.calcData, { 'row': this.target.row, 'col': this.target.col });
      if(target) target.confirm = n;
      const target_row = _.filter(this.calcData, {'row': this.target.row});
      _.forEach(target_row, function(target){
        if(Array.isArray(target.val)) target.val = _.difference(target.val, [n]);
      });
      const target_col = _.filter(this.calcData, {'col': this.target.col});
      _.forEach(target_col, function(target){
        if(Array.isArray(target.val)) target.val = _.difference(target.val, [n]);
      });
      const target_box = _.filter(this.calcData, {'box': this.boxNumber(this.target.row, this.target.col)});
      _.forEach(target_box, function(target){
        if(Array.isArray(target.val)) target.val = _.difference(target.val, [n]);
      });
    },
    resetNumber() {
      this.sudoku[this.target.row - 1].value[this.target.col - 1].value = '';
      this.isPopup = false;
    },
    boxNumber(row: number, col: number) {
      const base = Math.sqrt(this.number);
      let box = 0;
        box = Math.floor(col / base);
      if(col % base != 0){
        box += 1;
      }
      if(row % base == 0){
        box += (row / base - 1) * base
      }
      else{
        box += Math.floor(row / base) * base
      }

      if(this.calcData.length < this.number ** 2){
        this.calcData.push({
          row: row,
          col: col,
          box: box,
          val: [1,2,3,4,5,6,7,8,9],
          confirm: 0
        });
      }
      return box;
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
    async calculate() {
      console.log(this.calcData);
      // 横方向(row)
      await this.calcRow();
      // 縦方向(col)
      await this.calcCol();
      // ボックス(box)
      await this.calcBox();
    },
    calcRow(){
      console.log('row calulate');
      for (let index = 0; index < this.number; index++) {
        let row = index + 1;
        let target = _.filter(this.calcData, function(o){
          if(o.row == row && Array.isArray(o.val) && o.val.length == 1){
            return true;
          }
          else{
            return false;
          }
        });
      }
      
    },
    calcCol(){
      console.log('col calulate');
      
    },
    calcBox(){
      console.log('box calulate');
      
    },

  },
  created() {
    this.createTable(this.number);
  }
});
</script>

<style lang="scss">
</style>
