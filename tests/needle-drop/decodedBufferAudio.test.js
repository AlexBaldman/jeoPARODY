import { DecodedBufferAudio } from '../../src/modes/needle-drop/services/decodedBufferAudio.js';
describe('DecodedBufferAudio',()=>{
  test('rejects bytes that do not match the immutable asset hash',async()=>{const context={decodeAudioData:jest.fn()};const audio=new DecodedBufferAudio({contextFactory:()=>context,fetcher:async()=>({ok:true,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer}),digest:async()=>new Uint8Array(32).buffer});await expect(audio.load({id:'bad',url:'/bad.wav',sha256:'f'.repeat(64)})).rejects.toThrow('Audio integrity mismatch');expect(context.decodeAudioData).not.toHaveBeenCalled();});
});
