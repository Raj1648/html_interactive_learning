const completed = new Set();
const tabs = document.querySelectorAll(".tab");
const activities = document.querySelectorAll(".activity");

function showTab(id){
  tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === id));
  activities.forEach(a => a.classList.toggle("active", a.id === id));
}
tabs.forEach(tab => tab.addEventListener("click",()=>showTab(tab.dataset.tab)));

function markComplete(id){
  completed.add(id);
  const btn=document.querySelector(`[data-complete="${id}"]`);
  if(btn){btn.textContent="✓ Completed";btn.disabled=true}
  document.getElementById("progressText").textContent=`${completed.size} / 5 activities`;
  document.getElementById("progressBar").style.width=`${completed.size*20}%`;
}

document.querySelectorAll(".complete").forEach(b=>b.addEventListener("click",()=>markComplete(b.dataset.complete)));

// Activity 1
const distance=document.getElementById("distance");
const time=document.getElementById("time");
const distanceOut=document.getElementById("distanceOut");
const timeOut=document.getElementById("timeOut");
const speedOut=document.getElementById("speedOut");
const speedMeter=document.getElementById("speedMeter");
const exploreHint=document.getElementById("exploreHint");

function updateExplore(){
  const d=Number(distance.value), t=Number(time.value), s=d/t;
  distanceOut.textContent=d; timeOut.textContent=t; speedOut.textContent=s.toFixed(1);
  speedMeter.style.width=Math.min(100,s/15*100)+"%";
  exploreHint.textContent=s>=10 ? "Great! The object is covering at least 10 metres every second." :
    "Try changing only one slider. Which change makes the speed increase?";
}
distance.addEventListener("input",updateExplore);
time.addEventListener("input",updateExplore);
document.getElementById("randomExplore").addEventListener("click",()=>{
  distance.value=[60,100,150,200,240,300][Math.floor(Math.random()*6)];
  time.value=[10,15,20,25,30,40,50][Math.floor(Math.random()*7)];
  updateExplore();
});

// Activity 2
document.getElementById("checkCalc").addEventListener("click",()=>{
  const value=Number(document.getElementById("calcAnswer").value);
  const f=document.getElementById("calcFeedback");
  if(!Number.isFinite(value)){f.textContent="Enter a number first.";f.style.color="#9b4d00";return}
  if(Math.abs(value-4)<0.01){
    f.textContent="✓ Correct! Total distance = 200 m, total time = 50 s, so average speed = 4 m/s.";
    f.style.color="#21845a"; markComplete("calculate");
  }else{
    f.textContent="Not yet. Add both distances, add both times, then divide total distance by total time.";
    f.style.color="#a33b3b";
  }
});

// Activity 3
const runnerSpeeds={Asha:5,Riya:5,Kabir:6};
document.querySelectorAll(".pick").forEach(btn=>btn.addEventListener("click",()=>{
  const chosen=btn.dataset.runner;
  const result=document.getElementById("raceResult");
  result.innerHTML=`<b>You chose ${chosen}.</b><br>Asha = 100 ÷ 20 = 5 m/s &nbsp; • &nbsp; Riya = 150 ÷ 30 = 5 m/s &nbsp; • &nbsp; Kabir = 120 ÷ 20 = 6 m/s.<br><strong>Now notice:</strong> a longer distance does not automatically mean greater speed.`;
  markComplete("race");
}));

// Activity 4
let detectiveCorrect=false;
document.querySelectorAll(".detect").forEach(btn=>btn.addEventListener("click",()=>{
  const f=document.getElementById("detectiveFeedback");
  if(btn.dataset.correct==="true"){
    detectiveCorrect=true;
    f.textContent="✓ Correct. Speed = distance ÷ time, so 240 ÷ 40 = 6 m/s.";
    f.style.color="#21845a";
  }else{
    f.textContent="Look again. Ask yourself: which quantity should be divided by which?";
    f.style.color="#a33b3b";
  }
}));
document.getElementById("checkExplanation").addEventListener("click",()=>{
  const text=document.getElementById("explanation").value.trim().toLowerCase();
  const f=document.getElementById("explanationFeedback");
  const hasCore=(text.includes("distance") && (text.includes("time")||text.includes("divide")));
  if(detectiveCorrect && hasCore){
    f.textContent="✓ Good explanation. You identified the correct relationship between distance and time.";
    f.style.color="#21845a"; markComplete("detective");
  }else{
    f.textContent="Try again: include the words distance and time, and explain which one is divided by the other.";
    f.style.color="#9b4d00";
  }
});

// Activity 5
const challengeTime=document.getElementById("challengeTime");
function updateChallenge(){
  const t=Number(challengeTime.value), s=300/t;
  document.getElementById("challengeTimeOut").textContent=t;
  document.getElementById("challengeSpeed").textContent=s.toFixed(1);
  document.getElementById("runnerDot").style.left=`${Math.min(94,(60-t)/45*94)}%`;
}
challengeTime.addEventListener("input",updateChallenge);
document.getElementById("challengeCheck").addEventListener("click",()=>{
  const t=Number(challengeTime.value), s=300/t;
  const msg=document.getElementById("challengeMessage");
  const score=document.getElementById("finalScore");
  if(s>=10){
    msg.textContent="🎯 Target reached! Your journey has an average speed of at least 10 m/s.";
    msg.style.color="#21845a";
    score.classList.remove("hidden");
    score.textContent=`Lab complete! You reached the target using ${t} s for 300 m (${s.toFixed(1)} m/s).`;
    markComplete("challenge");
  }else{
    msg.textContent="The target is 10 m/s. Since the distance is fixed at 300 m, try reducing the time.";
    msg.style.color="#9b4d00";
  }
});
updateChallenge();
updateExplore();
