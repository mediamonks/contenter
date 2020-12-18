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

async function getProjectAssets(projectId: string) {
  const perfTrace = (await loadFirebasePerformance()).trace('getProjectAsset');
  perfTrace.start();

  const storageRef = (await loadFirebaseStorage()).ref(`${projectId}/assets`);
  const assetItems = (await storageRef.listAll()).items;

  const [metadataList, downloadURLList] = await Promise.all([
    Promise.all<FirebaseStorageMetadata>(assetItems.map((item) => item.getMetadata())),
    Promise.all<string>(assetItems.map((item) => item.getDownloadURL())),
  ]);

  assets.value = metadataList.map((item, index) => {
    const data: Asset = {
      name: item.name,
      remoteURL: downloadURLList[index],
      type: item.contentType,
      size: item.size,
    };

    if (item.contentType === 'image/png' || item.contentType === 'image/jpeg') {
      data.thumbnail = downloadURLList[index];
    }

    return data;
  });

  perfTrace.stop();
}

async function uploadAsset(file: File, projectId: string) {
  const perfTrace = (await loadFirebasePerformance()).trace('uploadAsset');
  perfTrace.start();

  const storageRef = (await loadFirebaseStorage()).ref(`${projectId}/assets/${file.name}`);
  await (storageRef).put(file);
  await getProjectAssets(projectId);

  perfTrace.stop();
}

export {
  Asset,
  assets,
  getProjectAssets,
  uploadAsset,
};
