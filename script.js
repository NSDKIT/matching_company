document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 全24問（に相当する）の情報をオブジェクトとして収集
    const studentProfile = {
        // 基本情報
        gender: document.getElementById('q1-gender').value,
        grade: document.getElementById('q2-grade').value,
        hometown: document.getElementById('q3-hometown').value,
        school: document.getElementById('q4-school').value,
        faculty: document.getElementById('q5-faculty').value,
        
        // 希望条件
        industries: Array.from(document.querySelectorAll('input[name="q6-industry"]:checked')).map(el => el.value),
        jobs: Array.from(document.querySelectorAll('input[name="q7-job"]:checked')).map(el => el.value),
        areas: Array.from(document.querySelectorAll('input[name="q8-area"]:checked')).map(el => el.value),

        // 価値観
        priorities: [document.getElementById('q9-1').value, document.getElementById('q9-2').value, document.getElementById('q9-3').value].filter(Boolean),
        dealBreakers: [document.getElementById('q11-1').value, document.getElementById('q11-2').value, document.getElementById('q11-3').value].filter(Boolean),
        workStyleText: document.getElementById('q12-work-style').value,
        motivationText: document.getElementById('q15-motivation').value,

        // 就活について
        requiredContents: document.getElementById('q14-contents').value,
        requestsForCompany: document.getElementById('q23-request').value,
    };

    sessionStorage.setItem('studentProfile', JSON.stringify(studentProfile));
    window.location.href = 'processing.html';
});
