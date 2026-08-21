function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export class DecodedBufferAudio {
  constructor({ contextFactory = () => new window.AudioContext(), fetcher = window.fetch.bind(window), digest = window.crypto.subtle.digest.bind(window.crypto.subtle) } = {}) {
    this.contextFactory=contextFactory; this.fetcher=fetcher; this.digest=digest; this.context=null; this.buffers=new Map(); this.activeSource=null;
  }
  getContext() { this.context ||= this.contextFactory(); return this.context; }
  async load(asset) {
    const cacheKey=`${asset.url}#${asset.sha256}`; if(this.buffers.has(cacheKey))return this.buffers.get(cacheKey);
    const response=await this.fetcher(asset.url); if(!response.ok)throw new Error(`Audio asset request failed: ${response.status}`);
    const bytes=await response.arrayBuffer(); const actualHash=bytesToHex(await this.digest('SHA-256',bytes));
    if(actualHash!==asset.sha256.toLowerCase())throw new Error(`Audio integrity mismatch for ${asset.id}`);
    const buffer=await this.getContext().decodeAudioData(bytes.slice(0)); this.buffers.set(cacheKey,buffer); return buffer;
  }
  stop() { if(!this.activeSource)return; try{this.activeSource.stop();}catch{/* source already stopped */} this.activeSource=null; }
  async play(asset,reveal) {
    this.stop(); const context=this.getContext(); if(context.state==='suspended')await context.resume(); const buffer=await this.load(asset);
    const source=context.createBufferSource(),gain=context.createGain(); source.buffer=buffer; gain.gain.value=asset.gain??1; source.connect(gain).connect(context.destination); this.activeSource=source;
    const offset=asset.startSeconds??0,duration=Math.min(reveal.duration,buffer.duration-offset); source.start(context.currentTime+.04,offset,duration);
    return new Promise(resolve=>{source.onended=()=>{if(this.activeSource===source)this.activeSource=null;resolve();};});
  }
}
