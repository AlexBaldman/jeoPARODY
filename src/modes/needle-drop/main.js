import './styles.css';
import { demoEpisode, validateEpisode } from './core/content.js';
import { playerForKey } from './core/party.js';
import { createInitialState, reduceRound, ROUND_PHASES } from './core/round.js';
import { Waveform } from './presentation/Waveform.js';
import { AudioRuntime } from './services/audioRuntime.js';

const errors=validateEpisode(demoEpisode);
if(errors.length)throw new Error(`Needle Drop content invalid:\n${errors.join('\n')}`);

const app=document.querySelector('#needle-drop-app');
const audio=new AudioRuntime();
const requestedPlayers=new URLSearchParams(window.location.search).get('players');
let state=createInitialState(demoEpisode,{playerCount:requestedPlayers});
let waveform;

function emit(name,detail={}){window.dispatchEvent(new CustomEvent(`needle-drop:${name}`,{detail:{...detail,state}}));}
function dispatch(action){const previous=state;state=reduceRound(state,action,demoEpisode);emit(action.type.toLowerCase(),{action,previous});render();}

async function playCurrentReveal(){
  if(state.phase===ROUND_PHASES.LISTENING)return;
  dispatch({type:'PLAY_REVEAL'});
  const clue=demoEpisode.clues[state.clueIndex],reveal=clue.reveals[state.revealIndex];
  waveform.animate(reveal.duration*1000);
  await audio.play(clue,reveal);
  dispatch({type:'REVEAL_FINISHED'});
  if(state.activePlayerId)document.querySelector('#answer')?.focus();
}

function lineageMarkup(clue){return `<div class="lineage" aria-label="Sample lineage"><article><span>ORIGINAL SOURCE</span><strong>${clue.source.title}</strong><small>${clue.source.artist} · ${clue.source.year}</small></article><div class="lineage__arrow" aria-hidden="true">➜<small>${clue.transformation.join(' · ')}</small></div><article><span>THE FLIP</span><strong>${clue.title}</strong><small>${clue.artist}</small></article></div>`;}
function playersMarkup(){return `<section class="players" aria-label="Players">${state.players.map(player=>`<article class="${state.activePlayerId===player.id?'is-active':''}" style="--player:${player.color}"><kbd>${player.buzzKey}</kbd><span>${player.name}</span><strong>${player.score.toLocaleString()}</strong></article>`).join('')}</section>`;}

function roundMarkup(clue,reveal){
  const awaitingBuzz=state.players.length>1&&!state.activePlayerId;
  if(state.phase===ROUND_PHASES.RESOLVED)return `<section class="clue-card"><section class="result ${state.result.accepted?'result--correct':'result--wrong'}"><p class="eyebrow">${state.result.accepted?'CORRECT · MUSICAL WITCHCRAFT DETECTED':'THE RECORD DISAGREES'}</p><h3>${clue.title}</h3><p>${clue.artist}</p><strong>+${state.result.points.toLocaleString()} points</strong></section>${lineageMarkup(clue)}<button class="next" data-action="next">${state.clueIndex===demoEpisode.clues.length-1?'Close the crate':'Next record'} →</button></section>`;
  return `<section class="clue-card"><div class="clue-card__meta"><span>TRACK ${state.clueIndex+1}/${demoEpisode.clues.length}</span><span>${clue.category}</span></div><h2>${clue.prompt}</h2><div class="turntable"><div class="record ${state.phase===ROUND_PHASES.LISTENING?'record--spinning':''}"><i></i></div><div class="tonearm"></div></div><canvas id="waveform" class="waveform" aria-label="Stylized audio waveform"></canvas><div class="reveal-meter">${clue.reveals.map((item,index)=>`<div class="${index===state.revealIndex?'is-current':''} ${index<state.revealIndex?'is-spent':''}"><span>${item.label}</span><strong>${item.duration}s</strong><small>${item.points} pts</small></div>`).join('')}</div><form id="answer-form" class="answer"><label for="answer">${awaitingBuzz?'Press your player number to buzz':'Your answer'}</label><div><input id="answer" name="answer" autocomplete="off" placeholder="Name that suspicious noise…" ${state.phase===ROUND_PHASES.LISTENING||awaitingBuzz?'disabled':''}/><button type="submit" ${state.phase===ROUND_PHASES.LISTENING||awaitingBuzz?'disabled':''}>Lock it</button></div></form><div class="controls"><button class="button--needle" data-action="play" ${state.phase===ROUND_PHASES.LISTENING?'disabled':''}>${state.phase===ROUND_PHASES.LISTENING?'Listening…':'▶ Drop the needle'}</button><button data-action="more" ${state.revealIndex>=clue.reveals.length-1?'disabled':''}>Buy more audio <small>−${reveal.points-(clue.reveals[state.revealIndex+1]?.points||reveal.points)} potential</small></button></div></section>`;
}

function render(){
  waveform?.destroy();
  const clue=demoEpisode.clues[state.clueIndex],reveal=clue?.reveals[state.revealIndex],complete=state.phase===ROUND_PHASES.COMPLETE;
  const body=complete?`<section class="finale"><p class="eyebrow">CRATE CLOSED</p><h2>${state.correct}/${demoEpisode.clues.length} identified</h2><p>${state.score.toLocaleString()} points. The waveform has declined to comment.</p><button data-action="restart">Spin it again</button></section>`:roundMarkup(clue,reveal);
  app.innerHTML=`<main id="game" class="stage" style="--accent:${clue?.palette?.[0]||'#ff3f81'};--accent-2:${clue?.palette?.[1]||'#00d7d7'}"><header class="show-header"><a href="./" class="show-header__universe">JEO<span>PARODY</span> / MUSIC DISTRICT</a><div class="show-header__score"><span>SCORE</span><strong>${state.score.toLocaleString()}</strong></div><div class="show-header__streak"><span>STREAK</span><strong>${state.streak}</strong></div></header><section class="marquee"><span>PROJECT CRATE EXPECTATIONS</span><h1>NEEDLE DROP</h1><p>Musical archaeology conducted at an unsafe volume.</p><nav class="player-count" aria-label="Player count"><a href="?players=1">1P</a><a href="?players=2">2P</a><a href="?players=4">4P</a></nav></section>${playersMarkup()}${body}<footer><span>All demo music is procedurally synthesized and original.</span><span>Audio truth before audio swagger.</span></footer></main>`;
  const canvas=document.querySelector('#waveform');
  if(canvas){waveform=new Waveform(canvas);waveform.setProgress(0);}
  bind();
}

function bind(){
  document.querySelector('[data-action="play"]')?.addEventListener('click',playCurrentReveal);
  document.querySelector('[data-action="more"]')?.addEventListener('click',()=>dispatch({type:'MORE_AUDIO'}));
  document.querySelector('[data-action="next"]')?.addEventListener('click',()=>dispatch({type:'NEXT_CLUE'}));
  document.querySelector('[data-action="restart"]')?.addEventListener('click',()=>dispatch({type:'RESTART'}));
  document.querySelector('#answer-form')?.addEventListener('submit',event=>{event.preventDefault();const answer=new FormData(event.currentTarget).get('answer');if(String(answer).trim())dispatch({type:'SUBMIT_ANSWER',answer});});
}

window.addEventListener('keydown',event=>{if(event.repeat)return;const player=playerForKey(state.players,event.key);if(player){dispatch({type:'BUZZ',playerId:player.id});document.querySelector('#answer')?.focus();}});
render();
