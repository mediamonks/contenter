import { ref } from 'vue';
import {
  loadFirebasePerformance,
  loadFirebaseStorage,
} from '@/firebase';
import firebase from 'firebase/app';

interface Asset {
  name: string;
  remoteURL: string;
  type: string;
  size: number;
  dimensions?: {
    width: string;
    height: string;
  };
  thumbnail?: string;
}

interface FirebaseStorageMetadata {
  bucket: string;
  contentDisposition: string;
  contentType: string;
  fullPath: string;
  generation: string;
  metageneration: string;
  name: string;
  size: number;
  timeCreated: string;
  type: string;
  updated: string;
  ref: firebase.storage.Reference;
}

const assets = ref<Asset[]>([]);

function parseSize(size: number) {
  return Math.round(size / 1000) * 1000;
}

async function getProjectAssets(projectId: string) {
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('getProjectAsset');
  perfTrace.start();

  const storage = await loadFirebaseStorage();
  const storageRef = storage.ref(`${projectId}/assets`);

  const assetListResult = await storageRef.listAll();
  const assetItems = assetListResult.items;

  const metadataList: FirebaseStorageMetadata[] = await Promise
    .all(assetItems.map((item) => item.getMetadata()));
  const downloadURLList: string[] = await Promise
    .all(assetItems.map((item) => item.getDownloadURL()));

  assets.value = metadataList.map((item, index) => {
    const data: Asset = {
      name: item.name,
      remoteURL: downloadURLList[index],
      type: item.contentType,
      size: parseSize(item.size),
    };

    if (item.contentType === 'image/png' || item.contentType === 'image/jpeg') {
      data.thumbnail = downloadURLList[index];
    }

    return data;
  });

  perfTrace.stop();
}

async function uploadAsset(file: File, projectId: string) {
  const performance = await loadFirebasePerformance();
  const perfTrace = performance.trace('uploadAsset');
  perfTrace.start();

  const storage = await loadFirebaseStorage();
  const storageRef = storage.ref(`${projectId}/assets/${file.name}`);

  await storageRef.put(file);
  await getProjectAssets(projectId);

  perfTrace.stop();
}

export {
  Asset,
  assets,
  getProjectAssets,
  uploadAsset,
};
