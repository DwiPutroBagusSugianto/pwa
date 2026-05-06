let user = null;
let questions = [];
let timer = 60;
let interval;
let chart;

// LOGIN
async function login() {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  let res = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });

  if(res.ok) {
    user = await res.json();

    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    if(user.role === 'admin') {
      document.getElementById('adminPanel').style.display = 'block';
      loadQuestionsAdmin();
    }
  } else {
    alert('Login gagal');
  }
}

// ADMIN LOAD SOAL
async function loadQuestionsAdmin() {
  let res = await fetch('/all-questions');
  let data = await res.json();

  let html = '';
  data.forEach((q,i) => {
    html += `
    <tr>
      <td>${i+1}</td>
      <td>${q.question}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editSoal(${q.id},'${q.question}','${q.a}','${q.b}','${q.c}','${q.d}','${q.answer}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="hapusSoal(${q.id})">Hapus</button>
      </td>
    </tr>`;
  });

  document.getElementById('tableSoal').innerHTML = html;
}

// EDIT
function editSoal(id,q,a,b,c,d,ans){
  document.getElementById('soal').value=q;
  document.getElementById('a').value=a;
  document.getElementById('b').value=b;
  document.getElementById('c').value=c;
  document.getElementById('d').value=d;
  document.getElementById('jawaban').value=ans;
  window.editId=id;
}

// TAMBAH / UPDATE
async function tambahSoal(){
  let data={
    question:soal.value,
    a:a.value,
    b:b.value,
    c:c.value,
    d:d.value,
    answer:jawaban.value
  };

  if(window.editId){
    data.id=window.editId;
    await fetch('/update-question',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    window.editId=null;
  } else {
    await fetch('/add-question',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  }

  loadQuestionsAdmin();
}

// HAPUS
async function hapusSoal(id){
  if(confirm('Yakin hapus?')){
    await fetch('/delete-question',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    loadQuestionsAdmin();
  }
}

// QUIZ
async function startQuiz(){
  document.getElementById('dashboard').style.display='none';
  document.getElementById('quiz').style.display='block';

  let res=await fetch('/questions');
  questions=await res.json();

  let form=document.getElementById('form');
  form.innerHTML='';

  questions.forEach((q,i)=>{
    form.innerHTML+=`
    <p>${q.question}</p>
    <input type='radio' name='q${i}' value='A'>${q.a}<br>
    <input type='radio' name='q${i}' value='B'>${q.b}<br>
    <input type='radio' name='q${i}' value='C'>${q.c}<br>
    <input type='radio' name='q${i}' value='D'>${q.d}<br>`;
  });

  startTimer();
}

function startTimer(){
  interval=setInterval(()=>{
    timer--;
    document.getElementById('timer').innerText='Sisa waktu: '+timer;
    if(timer<=0) submitQuiz();
  },1000);
}

// SUBMIT
async function submitQuiz(){
  clearInterval(interval);
  let score=0;

  questions.forEach((q,i)=>{
    let ans=document.querySelector(`input[name=q${i}]:checked`);
    if(ans && ans.value===q.answer) score++;
  });

  await fetch('/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,score})});

  let status=score>=1?'LULUS':'TIDAK LULUS';
  document.getElementById('quiz').style.display='none';
  document.getElementById('result').innerHTML=`<h3>Nilai: ${score} - ${status}</h3>`;
}

// HASIL + CHART
async function loadResults(){
  let res=await fetch('/results');
  let data=await res.json();

  let labels=[],scores=[];
  data.forEach(d=>{labels.push(d.username);scores.push(d.score);});

  if(chart) chart.destroy();

  chart=new Chart(document.getElementById('chartNilai'),{
    type:'bar',
    data:{labels:labels,datasets:[{label:'Nilai',data:scores}]}
  });
}
