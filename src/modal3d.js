import {bindable, inject, BindingEngine} from 'aurelia-framework';
import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';

@inject(BindingEngine)
export class Modal3d {
  @bindable data;

  constructor(bindingEngine) {
    this.boxes = [];

    let observer      = bindingEngine.propertyObserver(this, 'data');
    this.subscription = observer.subscribe((newval, oldval) => {
      if (newval && newval.pal) {
        this.buildPallette(newval);
      }
    });
  }


  setUp() {
    this.scene    = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera   = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);

    this.renderer.setClearColor(0xffffff, 1.0);
    this.onResize(848, 505);

    this.scene.add(new THREE.AmbientLight(0x555555));

    this.light = new THREE.DirectionalLight(0xffffff, 1.0);
    this.scene.add(this.light);

    let wrapper = document.getElementById('wrapper3d');
    wrapper.appendChild(this.renderer.domElement);

    this.orbit = new (OrbitControls(THREE))(this.camera, this.renderer.domElement);

    let w      = wrapper.offsetWidth;
    let render = () => {
      requestAnimationFrame(render);

      if (wrapper.offsetWidth !== w) {
        w = wrapper.offsetWidth;
        let h = w / 16 * 9;
        wrapper.style.height = `${h}px`;
        this.onResize(w, h);
      }

      let cpos = this.camera.position;
      this.light.position.set(cpos.x, cpos.y, cpos.z);

      this.renderer.render(this.scene, this.camera);
    };

    render();
  }


  onResize(w, h) {
    this.renderer.setSize(w, h);
  }


  mkColor() {
    return Math.round(Math.random() * 0xffffff);
  }

  mkBox(x, y, z, width, height, length) {
    let geometry = new THREE.BoxGeometry(width, height, length);
    let material = new THREE.MeshLambertMaterial({color : this.mkColor()});
    let box      = new THREE.Mesh(geometry, material);
    box.position.set(x, y, z);
    this.boxes.push(box);
    return box;
  }

  mkLayer(data, h) {
    for (let i = 0; i < data.boxesWidth; ++i) {
      for (let j = 0; j < data.boxesLength; ++j) {
        let x = i * data.width  - (data.pal.width  - data.width ) / 2;
        let z = j * data.length - (data.pal.length - data.length) / 2;
        let y = h + (data.height - data.pal.height) / 2;
        this.mkBox(x, y, z, data.width, data.height, data.length);
      }
    }
  }

  buildPallette(data) {
    if (!this.scene) {
      this.setUp();
    }

    this.scene.remove(...this.boxes.splice(0, this.boxes.length));

    let h = (data.actualHeight + data.pal.height) * -0.5;

    this.mkBox(0, h, 0, data.pal.width, data.pal.height, data.pal.length);
    h += data.pal.height;

    for (let i = 0; i < data.numberOfLayers; ++i) {
      this.mkLayer(data, h);
      h += data.height;
    }

    this.scene.add(...this.boxes);

    this.orbit.reset();
    this.camera.position.set(data.pal.width * 3, h * 2, data.pal.length * 3);
    this.camera.lookAt(new THREE.Vector3());
  }
}
