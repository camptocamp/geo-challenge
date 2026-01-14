import {
    RequestScheduler,
    CesiumWidget,
    CesiumTerrainProvider,
    Cartesian3,
    Math as CesiumMath,
    Ion,
    ImageryLayer,
    IonImageryProvider,
    Cartesian2,
    Color,
    SphereEmitter,
    Matrix4,
    ParticleSystem,
    Primitive,
    Cartographic,
    ScreenSpaceEventType,
    defined,
    ScreenSpaceEventHandler,
    JulianDate,
    type Scene,
    type Particle
} from "@cesium/engine";

import type { Coordinate } from "ol/coordinate";

Object.assign(RequestScheduler.requestsByServer, {
  "assets.ion.cesium.com:443": 28,
  "wmts.geo.admin.ch:443": 28,
  "3d.geo.admin.ch:443": 28,
});

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDYzNDViMS01OGZjLTRkMDMtOWQzYi00YTI2NDBmOWNjYzYiLCJpZCI6MjE3NTQsImlhdCI6MTcyODMwMTczM30.JlQVQBkpUc1LW65CyWbH_2ZLz-3u6WDkjR9nBI25VYI";

let BONUS_ENTITY_ID: string | undefined = undefined

const season: 'winter' | 'summer' = 'winter';

export async function createCesiumWidget(
  container: HTMLElement | string
): Promise<CesiumWidget> {
  const viewer = new CesiumWidget(container, {
    scene3DOnly: true,
    // skyBox: false,
    requestRenderMode: true,
    // see https://sandcastle.cesium.com/?id=imagery-assets-available-from-ion
    baseLayer: ImageryLayer.fromProviderAsync(
      IonImageryProvider.fromAssetId(3830182),
        {
            minimumTerrainLevel: 10 // do not load low-quality tiles for faster load of tiles we need
        }
    ),
    // Swissimage:
    // baseLayer: new ImageryLayer(
    //   new UrlTemplateImageryProvider({
    //     url: "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg",
    //     rectangle: Rectangle.fromDegrees(5.140242, 45.398181, 11.47757, 48.230651),
    //   })
    // ),
    terrainProvider: await CesiumTerrainProvider.fromIonAssetId(1),
    shouldAnimate: true
  });

  viewer.clock.currentTime = JulianDate.fromDate(new Date("2015-12-25T12:00:00Z"));

  // viewer.scene.highDynamicRange = true;
  viewer.scene.globe.showGroundAtmosphere = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.preloadSiblings = true;
  viewer.scene.globe.maximumScreenSpaceError = 1 // lower value - better quality

  viewer.scene.moon!.show = false;

  if (season === 'winter') {
      viewer.scene.skyAtmosphere!.hueShift = 0;
      viewer.scene.skyAtmosphere!.saturationShift = -0.3;
      viewer.scene.skyAtmosphere!.brightnessShift = -0.15;
  }

  // for better performance, tiles far from the camera are hidden with fog and do not load
  viewer.scene.fog.enabled = true;
  viewer.scene.fog.density = 0.005;
  viewer.scene.fog.minimumBrightness = 0.8;
  viewer.scene.fog.screenSpaceErrorFactor = 4;
  // cached more tiles for fewer loads when rotating the camera
  viewer.scene.globe.tileCacheSize = 2000;
  viewer.scene.globe.baseColor = Color.TRANSPARENT;
  viewer.scene.globe.undergroundColor = Color.TRANSPARENT;


  const controller = viewer.scene.screenSpaceCameraController;
  controller.enableTranslate = false;
  controller.enableZoom = false;
  controller.enableTilt = false;
  controller.enableRotate = false;

  return viewer;
}

export function setCameraPosition(viewer: CesiumWidget, position: Coordinate): void {
  // FIXME: don't use fixed altitude
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(position[0], position[1], 4000),
    orientation: {
      heading: CesiumMath.toRadians(Math.random() * 360),
      pitch: 0.0,
    },
    duration: 0,
    complete: () => {
      if  (season === 'winter') {
          addSnow(viewer.scene);
          // placeRandomModelNearCamera(viewer);
      }
    }
  });

}

let snow: Primitive | undefined = undefined;
const snowParticleSize = 12.0;
const snowRadius = 100000.0;
const minimumSnowImageSize = new Cartesian2(
    snowParticleSize,
    snowParticleSize,
);
const maximumSnowImageSize = new Cartesian2(
    snowParticleSize * 2.0,
    snowParticleSize * 2.0,
);
let snowGravityScratch = new Cartesian3();
const snowUpdate = (scene: Scene, particle: Particle) => {
  snowGravityScratch = Cartesian3.normalize(
      particle.position,
      snowGravityScratch,
  );
  Cartesian3.multiplyByScalar(
      snowGravityScratch,
      CesiumMath.randomBetween(-30.0, -300.0),
      snowGravityScratch,
  );
  particle.velocity = Cartesian3.add(
      particle.velocity,
      snowGravityScratch,
      particle.velocity,
  );
  const distance = Cartesian3.distance(
      scene.camera.position,
      particle.position,
  );
  if (distance > snowRadius) {
    particle.endColor.alpha = 0.0;
  } else {
    particle.endColor.alpha = 1.0 / (distance / snowRadius + 0.1);
  }
};
function addSnow(scene: Scene) {
  if (snow) {
    scene.primitives.remove(snow);
  }

  // Calculate emission rate based on screen area to maintain consistent snow density
  const screenArea = scene.canvas.width * scene.canvas.height;
  const baseEmissionRate = 3000.0; // emission rate for a reference screen (1920x1080 = 2073600 pixels)
  const referenceScreenArea = 1920 * 1080;
  const emissionRate = (screenArea / referenceScreenArea) * baseEmissionRate;

  snow = scene.primitives.add(
      new ParticleSystem({
        modelMatrix: Matrix4.fromTranslation(scene.camera.position),
        minimumSpeed: 5000,
        maximumSpeed: 25000, // bigger value - slower falling
        lifetime: 60.0,
        particleLife: 10,
        emitter: new SphereEmitter(snowRadius),
        startScale: 0.2,
        endScale: 0.7,
        image: "./images/snowflake.png",
        emissionRate: emissionRate,
        startColor: Color.WHITE.withAlpha(0.0),
        endColor: Color.WHITE.withAlpha(1.0),
        minimumImageSize: minimumSnowImageSize,
        maximumImageSize: maximumSnowImageSize,
        mass: 2.9e-6,
        updateCallback: (particle: Particle) => snowUpdate(scene, particle),
      }),
  );
}

const MODELS = ['./models/santa_on_the_moon.glb', './models/santa_sleigh.glb'];
const MIN_DISTANCE = 5000;
const MAX_DISTANCE = 10000;
const HEIGHT_OFFSET = 1000;
function placeRandomModelNearCamera(
    viewer: CesiumWidget,
    modelUrls: string[] = MODELS,
    minDistanceMeters: number = MIN_DISTANCE,
    maxDistanceMeters: number = MAX_DISTANCE,
    heightOffset: number = HEIGHT_OFFSET
) {
    if (BONUS_ENTITY_ID) {
        viewer.entities.removeById(BONUS_ENTITY_ID);
    }
    if (!modelUrls || modelUrls.length === 0) {
        console.error("The modelUrls array cannot be empty.");
        return;
    }
    if (minDistanceMeters >= maxDistanceMeters) {
        console.error("Minimum distance must be less than maximum distance.");
        return;
    }

    const randomModelUrl = modelUrls[Math.floor(Math.random() * modelUrls.length)];

    const randomDirection = new Cartesian3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    );
    Cartesian3.normalize(randomDirection, randomDirection);

    const distanceRange = maxDistanceMeters - minDistanceMeters;
    const randomDistance = Math.random() * distanceRange + minDistanceMeters;

    const offset = Cartesian3.multiplyByScalar(randomDirection, randomDistance, new Cartesian3());
    const modelPosition = Cartesian3.add(viewer.camera.position, offset, new Cartesian3());

    const cameraCartographic = viewer.camera.positionCartographic;
    const modelCartographic = Cartographic.fromCartesian(modelPosition);

    if (
        modelCartographic.height < cameraCartographic.height - heightOffset
    ) {
        modelCartographic.height = cameraCartographic.height - heightOffset;
    } else if (modelCartographic.height > cameraCartographic.height + heightOffset) {
        modelCartographic.height = cameraCartographic.height + heightOffset;
    }

    const finalPosition = Cartesian3.fromRadians(
        modelCartographic.longitude,
        modelCartographic.latitude,
        modelCartographic.height
    );

    const newEntity = viewer.entities.add({
        name: 'Clickable Random Model',
        position: finalPosition,
        model: {
            uri: randomModelUrl,
            minimumPixelSize: 128
        },
    });

    BONUS_ENTITY_ID = newEntity.id
    return newEntity;
}

export function addBonusModelClickCallback(viewer: CesiumWidget, callback: () => void) {
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: ScreenSpaceEventHandler.PositionedEvent) => {
        if (!BONUS_ENTITY_ID) return;
        const pickedObject = viewer.scene.pick(click.position);
        if (defined(pickedObject) && defined(pickedObject.id)) {
            const entity = pickedObject.id;
            if (entity.id === BONUS_ENTITY_ID) {
                console.log(`Clicked on model: ${entity.id}`);
                callback();
                placeRandomModelNearCamera(viewer);
            }
        }
    }, ScreenSpaceEventType.LEFT_CLICK);
}
