export class Waveform {
  constructor(canvas) { this.canvas=canvas; this.context=canvas.getContext('2d'); this.progress=0; this.frame=null; this.resizeObserver=new ResizeObserver(()=>this.draw()); this.resizeObserver.observe(canvas); }
  setProgress(progress) { this.progress=Math.max(0,Math.min(1,progress)); this.draw(); }
  animate(durationMs) { cancelAnimationFrame(this.frame); const start=performance.now(); const tick=now=>{ this.setProgress((now-start)/durationMs); if(this.progress<1)this.frame=requestAnimationFrame(tick); }; this.frame=requestAnimationFrame(tick); }
  draw() { const ratio=devicePixelRatio||1,width=this.canvas.clientWidth,height=this.canvas.clientHeight; this.canvas.width=width*ratio; this.canvas.height=height*ratio; const ctx=this.context; ctx.scale(ratio,ratio); ctx.clearRect(0,0,width,height); ctx.lineWidth=2; for(let x=0;x<width;x+=4){const envelope=.25+.75*Math.sin(Math.PI*x/width)**1.6; const amplitude=(Math.sin(x*.17)+.5*Math.sin(x*.53)+.2*Math.sin(x*1.7))*height*.18*envelope; ctx.strokeStyle=x/width<=this.progress?'#00f0d0':'rgba(255,255,255,.16)';ctx.beginPath();ctx.moveTo(x,height/2-amplitude);ctx.lineTo(x,height/2+amplitude);ctx.stroke();} }
  destroy(){cancelAnimationFrame(this.frame);this.resizeObserver.disconnect();}
}
