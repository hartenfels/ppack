import $ from 'jquery';

export class App {
  constructor() {
    this.pal = {
      length : 120,
      width  : 80,
      height : 15,
      top    : 195,
    };

    this.box = {
      length : 30,
      width  : 40,
      height : 20,
      items  : 1,
    };

    this.data3d = {};

    this.calculate();
  }


  update(timeout) {
    if (this.timer) {
      window.clearTimeout(this.timer);
    }

    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.calculate();
    }, timeout);

    return true;
  }


  fixUpInputs() {
    let fix = input => {
      let match = /^\s*([0-9]+)([,.]([0-9]+))?\s*$/.exec(input);

      if (match) {
        let value = parseFloat(`${match[1]}.${match[3] || 0}`);

        if (value <= 0) {
          throw 'Eingaben müssen größer als 0 sein.';
        }

        return value;
      }
      else if (/^\s*$/.test(input)) {
        throw 'Eingaben dürfen nicht leer sein.';
      }

      throw `Ungültige Eingabe: "${input}"`;
    };

    return {
      pal : {
        length : fix(this.pal.length),
        width  : fix(this.pal.width ),
        height : fix(this.pal.height),
        top    : fix(this.pal.top   ),
      },
      box : {
        length : fix(this.box.length),
        width  : fix(this.box.width ),
        height : fix(this.box.height),
        items  : fix(this.box.items ),
      }
    };
  }


  calculate() {
    let data;

    try {
      this.error = null;
      data       = this.fixUpInputs();
    }
    catch (e) {
      this.error = e;
      return;
    }

    let l = data.box.length;
    let w = data.box.width;
    let h = data.box.height;

    let options = [
      this.check(data, l, w, h),
      this.check(data, l, h, w),
      this.check(data, w, l, h),
      this.check(data, w, h, l),
      this.check(data, h, l, w),
      this.check(data, h, w, l),
    ];

    let max      = options.reduce((max, o) => Math.max(max, o.totalBoxes), 0);
    this.results = options.filter(o => o.totalBoxes > 0 && o.totalBoxes >= max);
  }


  check(data, l, w, h) {
    let bl = Math.floor(data.pal.length / l);
    let bw = Math.floor(data.pal.width  / w);
    let bh = Math.floor((data.pal.top - data.pal.height) / h);

    let al = bl * l;
    let aw = bw * w;
    let ah = bh * h;

    return {
      length         : l,
      width          : w,
      height         : h,
      totalBoxes     : bl * bw * bh,
      totalItems     : bl * bw * bh * data.box.items,
      boxesLength    : bl,
      boxesWidth     : bw,
      boxesPerLayer  : bl * bw,
      numberOfLayers : bh,
      actualLength   : al,
      actualWidth    : aw,
      actualHeight   : ah,
      usage          : this.calculateUsage(data, al * aw * ah),
      pal            : data.pal,
    };
  }


  calculateUsage(data, volume) {
    let max = data.pal.length * data.pal.width * (data.pal.top - data.pal.height);
    return (Math.round(volume / max * 10000) / 100).toFixed(2);
  }


  show3d(data) {
    this.data3d = data;
    $('#modal3d').modal('show');
    return false;
  }
}
