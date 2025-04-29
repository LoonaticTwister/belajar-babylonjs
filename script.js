// Ambil elemen canvas
const canvas = document.getElementById("renderCanvas");

// Jalankan render loop
const startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      if (carRoot) {
        const speed = 0.2;
        if (moveForward) carRoot.position.z += speed;
        if (moveBackward) carRoot.position.z -= speed;
      }

      sceneToRender.render();
    }
  });
};

// Variabel global
var engine = null;
var scene = null;
var sceneToRender = null;
let carRoot;
let moveForward = false;
let moveBackward = false;

// Event listener untuk keyboard
window.addEventListener("keydown", (event) => {
  if (event.key === "w" || event.key === "ArrowUp") moveForward = true;
  if (event.key === "s" || event.key === "ArrowDown") moveBackward = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key === "w" || event.key === "ArrowUp") moveForward = false;
  if (event.key === "s" || event.key === "ArrowDown") moveBackward = false;
});

// Buat engine default
const createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

// Buat scene
class Playground {
  static async CreateScene(engine) {
    const scene = new BABYLON.Scene(engine);

    // Load model mobil F1
    var result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "f12026.glb",
      scene
    );

    carRoot = result.meshes[0];
    carRoot.rotation = new BABYLON.Vector3(0, 1.57, 0);
    carRoot.position = new BABYLON.Vector3(0, 0.1, -40); // pastikan di awal trek
    carRoot.rotation = new BABYLON.Vector3(0, 1.57, 0);

    // Tambah animasi mobil
    // const animation = new BABYLON.Animation(
    //   "carMove",
    //   "position.z",
    //   30,
    //   BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    //   BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    // );

    // const keys = [];
    // keys.push({ frame: 0, value: -40 });
    // keys.push({ frame: 90, value: 40 });
    // animation.setKeys(keys);
    // carRoot.animations = [animation];
    // scene.beginAnimation(carRoot, 0, 90, true);
    // dinaikkan ke atas agar bisa diakses global

    // Tambah kamera
    scene.createDefaultCamera(true, true, true);
    const camera = scene.activeCamera;
    camera.alpha = Math.PI / 2;

    // Tambah cahaya Directional (matahari)
    const light = new BABYLON.DirectionalLight(
      "DirectionalLight",
      new BABYLON.Vector3(-1, -2, -1).normalize(),
      scene
    );
    light.position = new BABYLON.Vector3(20, 40, 20);
    light.intensity = 3;

    // Shadow Generator
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.addShadowCaster(carRoot, true);

    // Cahaya Ambient Sore
    var light1 = new BABYLON.HemisphericLight(
      "hemiLight",
      new BABYLON.Vector3(0, 10, 0),
      scene
    );
    light1.intensity = 1;
    light1.diffuse = new BABYLON.Color3(1, 0.6, 0);
    light1.specular = new BABYLON.Color3(0.9, 0.9, 0.6);
    light1.groundColor = new BABYLON.Color3(1, 0.5, 0.2);

    // Track lebih lebar
    const track = BABYLON.MeshBuilder.CreateBox(
      "track",
      {
        width: 8,
        height: 0.1,
        depth: 100,
      },
      scene
    );
    const trackMat = new BABYLON.StandardMaterial("trackMat", scene);
    trackMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    track.material = trackMat;
    track.position.y = 0.05;
    track.receiveShadows = true;

    const KERB_OFFSET = 8 / 2 + 0.25;

    // Kerb kiri
    for (let i = -50; i < 50; i += 2) {
      const kerb = BABYLON.MeshBuilder.CreateBox(
        "kerb",
        {
          width: 0.5,
          height: 0.1,
          depth: 2,
        },
        scene
      );
      const kerbMat = new BABYLON.StandardMaterial("kerbMat", scene);
      kerbMat.diffuseColor =
        (i / 2) % 2 === 0 ? BABYLON.Color3.Red() : BABYLON.Color3.White();
      kerb.material = kerbMat;
      kerb.position.set(-KERB_OFFSET, 0.05, i);
      kerb.receiveShadows = true;
    }

    // Kerb kanan
    for (let i = -50; i < 50; i += 2) {
      const kerb = BABYLON.MeshBuilder.CreateBox(
        "kerbRight",
        {
          width: 0.5,
          height: 0.1,
          depth: 2,
        },
        scene
      );
      const kerbMat = new BABYLON.StandardMaterial("kerbRightMat", scene);
      kerbMat.diffuseColor =
        (i / 2) % 2 === 0 ? BABYLON.Color3.Red() : BABYLON.Color3.White();
      kerb.material = kerbMat;
      kerb.position.set(KERB_OFFSET, 0.05, i);
      kerb.receiveShadows = true;
    }

    return scene;
  }
}

// Panggil scene builder
const createScene = function () {
  return Playground.CreateScene(engine, engine.getRenderingCanvas());
};

// Inisialisasi aplikasi
window.initFunction = async function () {
  const asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.warn("Gagal buat engine, coba ulang.");
      return createDefaultEngine();
    }
  };

  window.engine = await asyncEngineCreation();

  if (!engine) throw "Engine tidak boleh null.";

  startRenderLoop(engine, canvas);
  window.scene = createScene();
};

// Jalankan inisialisasi dan ambil scene
initFunction().then(() => {
  scene.then((returnedScene) => {
    sceneToRender = returnedScene;
  });
});

// Resize canvas saat jendela berubah
window.addEventListener("resize", function () {
  engine.resize();
});
