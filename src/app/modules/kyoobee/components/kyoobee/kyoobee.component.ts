import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as THREE from 'three';
import { MeshBasicMaterial, Object3D, Vector3 } from 'three';
// import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const NEW_CUBE_POSITION = {
  'posx': new Vector3(2, 0, 0),
  'negx': new Vector3(-2, 0, 0),
  'posy': new Vector3(0, 0, -2),
  'negy': new Vector3(0, 0, 2),
  'posz': new Vector3(0, 2, 0),
  'negz': new Vector3(0, -2, 0),
};

@Component({
  selector: 'app-kyoobee',
  templateUrl: './kyoobee.component.html',
  styleUrls: ['./kyoobee.component.css']
})
export class KyoobeeComponent implements AfterViewInit {

  axesHelper: THREE.AxesHelper;

  // private boundAnimationCallback: () => void;

  camera: THREE.PerspectiveCamera;

  // clock = new THREE.Clock();

  @Input() public color = '#ffffff';

  controls: OrbitControls;

  cubes: THREE.Scene[] = [];

  data: any[];

  gltfLoader = new GLTFLoader();

  raycaster = new THREE.Raycaster();

  renderer: THREE.Renderer;

  @ViewChild('renderercontainer', { static: true }) private rendererContainer: ElementRef;

  scene: THREE.Scene;

  constructor() {
    // this.boundAnimationCallback = this.animate.bind(this);
  }

  ngAfterViewInit() {
    this.init();
    this.loadGlb(`assets/cube.glb`).subscribe((cube: THREE.Scene) => {
      this.scene.add(cube);

      cube.traverse((node) => {
        //@ts-ignore
        if (node.isMesh) {
          //@ts-ignore
          node.material = new THREE.MeshStandardMaterial({ color: this.color });
          node.castShadow = true;
        }
      });

      // this.animate();
      this.render();
    });
  }

  addCube(face: Object3D) {

    const position = face.parent.position.clone();

    this.loadGlb(`assets/cube.glb`).subscribe((cube: THREE.Scene) => {
      cube.position.set(
        position.x + NEW_CUBE_POSITION[face.name].x,
        position.y + NEW_CUBE_POSITION[face.name].y,
        position.z + NEW_CUBE_POSITION[face.name].z);

      cube.traverse((node) => {
        //@ts-ignore
        if (node.isMesh) {
          //@ts-ignore
          node.material = new THREE.MeshStandardMaterial({ color: this.color });
          node.castShadow = true;
        }
      });

      this.scene.add(cube);
      this.render();
    });

  }

  // animate() {
  //   requestAnimationFrame( this.boundAnimationCallback );
  //   this.render();
  // }

  private deleteCube(cube: THREE.Scene | Object3D): Observable<void> {
    const observable = new Observable((observer: Observer<void>) => {
      setTimeout(() => {
        this.deleteGlb(cube);
        observer.next();
        observer.complete();
      });
    });

    return observable;
  }

  private deleteGlb(obj: any) {
    if (obj.children && obj.children.length > 0) {
      obj.children.forEach(child => {
        this.deleteGlb(child);
      });
    }

    if (obj.geometry) {
      obj.geometry.dispose();
      obj.geometry = null;
    }

    if (obj.material) {
      obj.material.dispose();
      obj.material = null;
    }

    if (obj.parent === this.scene) {
      this.scene.remove(obj);
    }
  }

  init() {
    const aspect = this.rendererContainer.nativeElement.clientWidth / this.rendererContainer.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 1, 20000);
    this.camera.position.set(10, 0, 0);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add( ambientLight );

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1000, 1000, 5).normalize();
    this.scene.add(directionalLight);

    // this.axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(this.axesHelper);

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight );
    this.rendererContainer.nativeElement.appendChild( this.renderer.domElement );

    // this.controls = new FirstPersonControls( this.camera, this.renderer.domElement );
    // this.controls.movementSpeed = 10;
    // this.controls.lookSpeed = 1;
    // this.controls.lookVertical = true;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.rotateSpeed = 0.5;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.controls.saveState();
    this.controls.addEventListener('change', () => {
      this.render();
    });
    this.controls.addEventListener('end', () => {
      this.render();
    });
  }

  private loadGlb(filename): Observable<THREE.Scene> {
    const observable = new Observable((observer: Observer<THREE.Scene>) => {
      this.gltfLoader.load(filename,
        (gltf) => {
          const cube = gltf.scene;
          this.cubes.push(cube)
          observer.next(cube);
          observer.complete();

        },
        undefined, (error) => {
          console.error(error);
          observer.error(error);
        }
      );
    });

    return observable;
  }

  render() {
    // this.controls.update( this.clock.getDelta() );
		this.renderer.render( this.scene, this.camera );
  }

  onPress(event: any) {
    console.log('onPress');
    const mouse = new THREE.Vector2();
    mouse.x = ( event.srcEvent.offsetX / this.rendererContainer.nativeElement.clientWidth ) * 2 - 1;
    mouse.y = - (event.srcEvent.offsetY / this.rendererContainer.nativeElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);
    const moduleIntersects = this.raycaster.intersectObjects(this.cubes, true);

    if (moduleIntersects.length > 0) {
      if (this.cubes.length === 1) {
        return;
      }
      
      const obj = moduleIntersects[0].object.parent;
      this.deleteCube(obj).subscribe(() => {
        const index = this.cubes.findIndex((cube: THREE.Scene) => cube.uuid === obj.uuid);
        if (index !== -1) {
          this.cubes.splice(index, 1);
        }
        this.render();
      });
    }
  }

  onTap(event: any) {
    console.log('onTap');
    const mouse = new THREE.Vector2();
    mouse.x = ( event.srcEvent.offsetX / this.rendererContainer.nativeElement.clientWidth ) * 2 - 1;
    mouse.y = - (event.srcEvent.offsetY / this.rendererContainer.nativeElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);
    const moduleIntersects = this.raycaster.intersectObjects(this.cubes, true);

    if (moduleIntersects.length > 0) {
      this.addCube(moduleIntersects[0].object);
    }
  }

  @HostListener('window:resize', ['$event']) onWindowResize(event) {
    setTimeout(() => this.resize());
  }

  resize() {
    const aspect = this.rendererContainer.nativeElement.clientWidth / this.rendererContainer.nativeElement.clientHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.rendererContainer.nativeElement.clientWidth, this.rendererContainer.nativeElement.clientHeight, true);
    // this.controls.handleResize();
  }

}
