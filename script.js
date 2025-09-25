document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // フォームの各要素から値を取得
    const studentProfile = {
        grade: document.getElementById('q2-grade').value,
        school: document.getElementById('q4-school').value,
        industries: Array.from(document.querySelectorAll('input[name="q6-industry"]:checked')).map(el => el.value),
        areas: Array.from(document.querySelectorAll('input[name="q8-area"]:checked')).map(el => el.value),
        priorities: [
            document.getElementById('q9-priority1').value,
            document.getElementById('q9-priority2').value,
            document.getElementById('q9-priority3').value,
        ].filter(p => p),
        motivationText: document.getElementById('q15-motivation').value,
    };

    // sessionStorageに学生のプロフィールを保存
    sessionStorage.setItem('studentProfile', JSON.stringify(studentProfile));

    // 分析中ページに遷移
    window.location.href = 'processing.html';
});
