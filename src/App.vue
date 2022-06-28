<template>
  <div>
    <h1>数独回答</h1>
    <div class="sudoku" :style="styleObject">
      <div v-for="(cell, index) in calcData" :key="index" :data-row="cell.row" :data-col="cell.col" :data-box="cell.box"
        @click="popup(Number(cell.row), Number(cell.col))">
        {{ cell.confirm }}
        <div v-if="cell.val" class="hint">
          <div v-for="(item, index) in cell.val" :key="index">{{ item ? item: '' }}</div>
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
  [key: string]: number | number[] | undefined
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
      calcData: [] as calcDataType[],
      styleObject: {},
      list: [] as number[]
    }
  },
  methods: {
    createTable(number: number) {
      for (let n = 0; n < this.number; n++) {
        this.list.push(n + 1)
      }
      for (let row = 0; row < this.number; row++) {
        let row_n = row + 1;
        for (let col = 0; col < this.number; col++) {
          let col_n = col + 1;
          this.calcData.push(
            { row: row_n, col: col_n, box: this.boxNumber(row_n, col_n), row_box: this.group(row_n, col_n, 'row'), col_box: this.group(row_n, col_n, 'col'), val: this.list, confirm: undefined }
          );
        }
      }
      let style = '';
      for (let i = 0; i < this.number; i++) {
        style += '1fr ';
      }
      this.styleObject = { 'grid-template-columns': style };
    },
    popup(key1: number | undefined, key2: number | undefined) {
      this.isPopup = true;
      if (key1) this.target.row = key1;
      if (key2) this.target.col = key2;
    },
    addNumber(n: number) {
      this.isPopup = false;
      // 計算用データを変更する
      let target = _.find(this.calcData, { 'row': this.target.row, 'col': this.target.col });
      // 差し替えの場合
      if(target && _.isNumber(target.confirm)){
        this.backVal(target.confirm);
      }
      if (target) target.confirm = n;
      this.checkData(this.target.row, this.target.col, n);
    },
    resetNumber() {
      const target = _.find(this.calcData, { row: this.target.row, col: this.target.col });
      const confirm = target ? target.confirm : undefined;

      if (target) target.confirm = undefined;
      const target_row = _.filter(this.calcData, { 'row': this.target.row });
      if(_.isNumber(confirm)){
        this.backVal(confirm);
       }
      this.isPopup = false;
    },
    backVal(confirm:number){
      const target_row = _.filter(this.calcData, { 'row': this.target.row });
      _.forEach(target_row, (target) => {
        if (Array.isArray(target.val)) target.val = _.sortBy(_.union(target.val, [Number(confirm)]));
      });
      const target_col = _.filter(this.calcData, { 'col': this.target.col });
      _.forEach(target_col, (target) => {
        if (Array.isArray(target.val)) target.val = _.sortBy(_.union(target.val, [Number(confirm)]));
      });
      const target_box = _.filter(this.calcData, { 'box': this.boxNumber(this.target.row, this.target.col) });
      _.forEach(target_box, (target) => {
        if (Array.isArray(target.val)) target.val = _.sortBy(_.union(target.val, [Number(confirm)]));
      });

    },
    boxNumber(row: number, col: number) {
      const base = Math.sqrt(this.number);
      let box = 0;
      box = Math.floor(col / base);
      if (col % base != 0) {
        box += 1;
      }
      if (row % base == 0) {
        box += (row / base - 1) * base
      }
      else {
        box += Math.floor(row / base) * base
      }
      return box;
    },
    group(row: number, col: number, g: string) {
      const base = Math.sqrt(this.number);
      let box = 0;
      const row_box = Math.floor((row - 1) / base) + 1;
      const col_box = Math.floor((col - 1) / base) + 1;
      if (g == 'row') {
        return row_box;
      }
      if (g == 'col') {
        return col_box;
      }
    },
    dataReset() {
      _.forEach(this.calcData, (o) => {
        o.val = this.list;
        o.confirm = undefined;
      });
    },
    dataExport() {
      const blob = new Blob([JSON.stringify(this.calcData, null, 2)], {
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
        this.calcData = JSON.parse(json);
        console.log(this.calcData);
      }
      reader.readAsText(file)

    },
    btnImport() {
      const ref: any = this.$refs.input;
      ref.click();
    },
    calculate() {
      // console.log(this.calcData);
      let target = _.filter(this.calcData, (o) => {
        if (!o.confirm && Array.isArray(o.val) && o.val.length == 1) {
          return true;
        }
        else {
          return false;
        }
      });
      _.forEach(target, (o) => {
        if (o.val && Array.isArray(o.val) && o.val[0]) o.confirm = o.val[0];

        if (o.row && o.col && Array.isArray(o.val) && o.val.length == 1) {
          this.checkData(Number(o.row), Number(o.col), o.val[0]);
        }
      });

      for (let index = 0; index < this.number; index++) {
        let num = index + 1;

        const target_row = _.filter(this.calcData, (l) => {
          return l.row == num && !l.confirm;
        });
        const only_row_val: number[][] = [];
        _.forEach(target_row, (l) => {
          const target_row_val = _.filter(target_row, (o) => {
            return _.isEqual(o.val, l.val);
          });
          if (Array.isArray(l.val) && l.val.length == target_row_val.length) {
            const target_row_val_not = _.filter(target_row, (o) => {
              return !_.isEqual(o.val, l.val)
            });
            _.forEach(target_row_val_not, (p) => {
              if (Array.isArray(p.val) && Array.isArray(l.val)) p.val = _.difference(p.val, l.val);
            });
          }
          if (Array.isArray(l.val)) {
            only_row_val.push(l.val);
          }
        });
        this.onlyValue(only_row_val, num, 'row');

        const target_col = _.filter(this.calcData, (l) => {
          return l.col == num && !l.confirm;
        });
        const only_col_val: number[][] = [];
        _.forEach(target_col, (l) => {
          const target_col_val = _.filter(target_col, (o) => {
            return _.isEqual(o.val, l.val);
          });
          if (Array.isArray(l.val) && l.val.length == target_col_val.length) {
            const target_col_val_not = _.filter(target_col, (o) => {
              return !_.isEqual(o.val, l.val)
            });
            _.forEach(target_col_val_not, (p) => {
              if (Array.isArray(p.val) && Array.isArray(l.val)) p.val = _.difference(p.val, l.val);
            });
          }
          if (Array.isArray(l.val)) {
            only_col_val.push(l.val);
          }
        });
        this.onlyValue(only_col_val, num, 'col');

        const target_box = _.filter(this.calcData, (l) => {
          return l.box == num && !l.confirm;
        });
        const only_box_val: number[][] = [];
        _.forEach(target_box, (l) => {
          const target_box_val = _.filter(target_box, (o) => {
            return _.isEqual(o.val, l.val);
          });
          if (Array.isArray(l.val) && l.val.length == target_box_val.length) {
            const target_box_val_not = _.filter(target_box, (o) => {
              return !_.isEqual(o.val, l.val)
            });
            _.forEach(target_box_val_not, (p) => {
              if (Array.isArray(p.val) && Array.isArray(l.val)) p.val = _.difference(p.val, l.val);
            });
          }
          if (Array.isArray(l.val)) {
            only_box_val.push(l.val);
          }
        });
        this.onlyValue(only_box_val, num, 'box');

      }

    },
    splitArray(array: number[][], length: number) {
      const array_test = [array[0], array[1]]
      return (array[0], array[1]);
    },
    checkData(row: number, col: number, confirm: number) {
      const target_row = _.filter(this.calcData, { 'row': row });
      _.forEach(target_row, (target) => {
        if (Array.isArray(target.val)) target.val = _.difference(target.val, [confirm]);
      });
      const target_col = _.filter(this.calcData, { 'col': col });
      _.forEach(target_col, (target) => {
        if (Array.isArray(target.val)) target.val = _.difference(target.val, [confirm]);
      });
      const target_box = _.filter(this.calcData, { 'box': this.boxNumber(row, col) });
      _.forEach(target_box, (target) => {
        if (Array.isArray(target.val)) target.val = _.difference(target.val, [confirm]);
      });
    },
    onlyValue(array: number[][], num: number, key: string) {
      let row_only = _.filter(_.flattenDeep(array), (val, idx, arr) => {
        return _.indexOf(arr, val) === _.lastIndexOf(arr, val);
      });
      const target_row_valonly = _.filter(this.calcData, (l) => {
        return !l.confirm && l[key] == num && Array.isArray(l.val)
          // 重複している
          && _.filter(_.flattenDeep([row_only, l.val]), (val, idx, arr) => { return _.indexOf(arr, val) === idx && _.lastIndexOf(arr, val) !== idx; }).length > 0;
      });
      _.forEach(target_row_valonly, (p) => {
        let val;
        if (Array.isArray(p.val)) {
          // 重複している要素
          val = _.filter(_.flattenDeep([row_only, p.val]), (val, idx, arr) => { return _.indexOf(arr, val) === idx && _.lastIndexOf(arr, val) !== idx; });
        }
        if (Array.isArray(val) && val.length == 1) {
          p.confirm = val[0];
          if (_.isNumber(p.row) && _.isNumber(p.col)) this.checkData(p.row, p.col, p.confirm);
        }
      });

    }

  },
  created() {
    this.createTable(this.number);
  }
});
</script>

<style lang="scss">
</style>
