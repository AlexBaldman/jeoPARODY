const DEFAULT_PACK_URL = 'assets/hosts/xander/question-pink-v1/host-pack.json';

function validatePack(pack) {
  if (pack?.schema !== 'jeoparody.host-asset-pack' || pack.version !== 1) {
    throw new Error('Host asset pack schema is unsupported');
  }
  if (!pack.poses?.[pack.defaultPose]) {
    throw new Error('Host asset pack requires a valid default pose');
  }
  return pack;
}

export class HostAssetPack {
  constructor({ packUrl = DEFAULT_PACK_URL, fetchImpl = globalThis.fetch } = {}) {
    this.packUrl = packUrl;
    this.fetchImpl = fetchImpl;
    this.pack = null;
  }

  async load() {
    if (this.pack) return this.pack;
    if (typeof this.fetchImpl !== 'function') throw new Error('Host asset pack requires fetch');
    const response = await this.fetchImpl(this.packUrl);
    if (!response.ok) throw new Error(`Host asset pack failed to load (${response.status})`);
    this.pack = validatePack(await response.json());
    return this.pack;
  }

  resolvePose(cueOrPose = '') {
    if (!this.pack) throw new Error('Host asset pack must be loaded before resolving poses');
    const poseId = this.pack.poses[cueOrPose]
      ? cueOrPose
      : this.pack.cueMap?.[cueOrPose] || this.pack.defaultPose;
    const pose = this.pack.poses[poseId] || this.pack.poses[this.pack.defaultPose];
    return {
      ...pose,
      id: poseId,
      url: new URL(pose.file, new URL(this.packUrl, document.baseURI)).toString(),
    };
  }

  getAnchor(anchorId) {
    return this.pack?.anchors?.[anchorId] || null;
  }
}

export class HostPoseController {
  constructor({ imageElement, assetPack = new HostAssetPack() } = {}) {
    this.imageElement = imageElement;
    this.assetPack = assetPack;
    this.activePose = null;
  }

  async initialize() {
    await this.assetPack.load();
    return this.setCue('idle');
  }

  setCue(cue) {
    if (!this.imageElement) return null;
    const pose = this.assetPack.resolvePose(cue);
    this.imageElement.src = pose.url;
    this.imageElement.dataset.hostPose = pose.id;
    this.activePose = pose.id;
    return pose;
  }
}

export { DEFAULT_PACK_URL };
